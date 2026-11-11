package aiengine

import (
	"context"
	"crypto/tls"
	"fmt"
	"log/slog"
	"net"
	"strings"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/backoff"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	aiv1 "saksi-backend/gen/saksi/ai/v1"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// Client memanggil ai-engine lewat gRPC (saksi.ai.v1.AiEngine). Bila rest diisi, audit yang gagal
// lewat gRPC dicoba lagi lewat REST /v1/audit sebelum usecase jatuh ke rule engine.
type Client struct {
	conn   *grpc.ClientConn
	rpc    aiv1.AiEngineClient
	apiKey string
	rest   *REST
}

var _ usecase.AIEngine = (*Client)(nil)

// Dial membuat koneksi lazy (tidak memblokir startup). TLS bila useTLS, alamat "https://", atau port 443.
// grpc-go menyambung ulang sendiri setelah koneksi putus (mis. App Service F1 tidur); backoff dibatasi 5 dtk
// supaya pulih cepat setelah app bangun.
func Dial(addr, apiKey string, useTLS bool, rest *REST) (*Client, error) {
	target, tlsOn := grpcTarget(addr, useTLS)
	creds := insecure.NewCredentials()
	if tlsOn {
		creds = credentials.NewTLS(&tls.Config{MinVersion: tls.VersionTLS12})
	}
	conn, err := grpc.NewClient(target,
		grpc.WithTransportCredentials(creds),
		grpc.WithConnectParams(grpc.ConnectParams{
			Backoff:           backoff.Config{BaseDelay: 500 * time.Millisecond, Multiplier: 1.6, Jitter: 0.2, MaxDelay: 5 * time.Second},
			MinConnectTimeout: 10 * time.Second,
		}),
		grpc.WithDefaultCallOptions(grpc.MaxCallRecvMsgSize(4<<20)),
	)
	if err != nil {
		return nil, err
	}
	slog.Info("ai engine gRPC", "target", target, "tls", tlsOn)
	c := New(conn, apiKey, rest)
	c.conn = conn
	return c, nil
}

// New membungkus koneksi yang sudah ada (dipakai tes dengan bufconn).
func New(cc grpc.ClientConnInterface, apiKey string, rest *REST) *Client {
	return &Client{rpc: aiv1.NewAiEngineClient(cc), apiKey: apiKey, rest: rest}
}

func (c *Client) Close() error {
	if c.conn == nil {
		return nil
	}
	return c.conn.Close()
}

// grpcTarget membuang skema https:// dan menentukan TLS (otomatis untuk port 443).
func grpcTarget(addr string, useTLS bool) (string, bool) {
	if rest, ok := strings.CutPrefix(addr, "https://"); ok {
		addr, useTLS = rest, true
		if _, _, err := net.SplitHostPort(addr); err != nil {
			addr = net.JoinHostPort(strings.TrimSuffix(addr, "/"), "443")
		}
	}
	addr = strings.TrimSuffix(strings.TrimPrefix(addr, "http://"), "/")
	if _, port, err := net.SplitHostPort(addr); err == nil && port == "443" {
		useTLS = true
	}
	return addr, useTLS
}

func (c *Client) call(ctx context.Context, d time.Duration) (context.Context, context.CancelFunc) {
	ctx, cancel := context.WithTimeout(ctx, d)
	return metadata.AppendToOutgoingContext(ctx, "x-api-key", c.apiKey), cancel
}

// wrapErr: UNAVAILABLE/DEADLINE_EXCEEDED (semua model di ai-engine gagal) → *usecase.AIUnavailableError.
func wrapErr(op string, err error) error {
	st := status.Convert(err)
	switch st.Code() {
	case codes.Unavailable, codes.DeadlineExceeded:
		slog.Warn("ai engine tidak tersedia", "op", op, "code", st.Code().String(), "err", err)
		return &usecase.AIUnavailableError{Message: clientMessage(st)}
	}
	return fmt.Errorf("ai engine %s: %w", op, err)
}

// clientMessage meneruskan pesan ai-engine ke pengguna, kecuali galat transport/timeout yang bisa membocorkan host internal.
// shortcut: deteksi galat transport berbasis teks; ganti bila ai-engine mengirim detail error terstruktur.
func clientMessage(st *status.Status) string {
	msg := strings.TrimSpace(st.Message())
	low := strings.ToLower(msg)
	if st.Code() != codes.Unavailable || msg == "" || strings.Contains(low, "dial") || strings.Contains(low, "transport") ||
		strings.Contains(low, "connection") || strings.Contains(low, "name resolver") {
		return usecase.DefaultAIUnavailableMessage
	}
	return msg
}

func (c *Client) AuditClauses(ctx context.Context, in usecase.AuditInput) (domain.AuditResult, error) {
	cctx, cancel := c.call(ctx, auditTimeout)
	defer cancel()
	resp, err := c.rpc.AuditContract(cctx, &aiv1.AuditContractRequest{
		Jenis:              toProtoJenis(in.Jenis),
		Clauses:            toProtoClauses(in.Clauses),
		MandatoryKodePasal: in.MandatoryKodePasal,
		LegalReferences:    toProtoRefs(in.LegalReferences),
	})
	if err != nil {
		err = wrapErr("AuditContract", err)
		if c.rest != nil {
			slog.Warn("audit gRPC gagal, mencoba REST", "err", err)
			return c.rest.AuditClauses(ctx, in) // REST mencatat transport=rest sendiri
		}
		return domain.AuditResult{}, err
	}
	slog.Info("ai", "transport", "grpc", "op", "AuditContract")
	findings := make([]domain.AuditFinding, 0, len(resp.GetFindings()))
	for _, f := range resp.GetFindings() {
		af := domain.AuditFinding{Tingkat: "saran", Pesan: f.GetPesan()}
		if f.GetTingkat() == aiv1.Severity_KRITIS {
			af.Tingkat = "kritis"
		}
		if k := f.GetKodePasal(); k != "" {
			af.KodePasal = &k
		}
		findings = append(findings, af)
	}
	return domain.AuditResult{Score: resp.GetSkor(), Model: resp.GetModel(), Findings: findings}, nil
}

func (c *Client) DraftContract(ctx context.Context, in usecase.DraftInput) (usecase.DraftOutput, error) {
	cctx, cancel := c.call(ctx, draftTimeout)
	defer cancel()
	resp, err := c.rpc.DraftContract(cctx, &aiv1.DraftContractRequest{
		Jenis:           toProtoJenis(in.Jenis),
		Jawaban:         in.Jawaban,
		ClauseLibrary:   toProtoClauses(in.ClauseLibrary),
		LegalReferences: toProtoRefs(in.LegalReferences),
	})
	if err != nil {
		return usecase.DraftOutput{}, wrapErr("DraftContract", err)
	}
	slog.Info("ai", "transport", "grpc", "op", "DraftContract")
	out := usecase.DraftOutput{Model: resp.GetModel(), Clauses: make([]domain.Clause, 0, len(resp.GetClauses()))}
	for _, cl := range resp.GetClauses() {
		out.Clauses = append(out.Clauses, domain.Clause{
			KodePasal: cl.GetKodePasal(), Judul: cl.GetJudul(), Isi: cl.GetIsi(),
			Urutan: int(cl.GetUrutan()), LegalReferenceID: cl.GetLegalReferenceId(),
		})
	}
	return out, nil
}

func (c *Client) RedactText(ctx context.Context, text string) (usecase.RedactOutput, error) {
	cctx, cancel := c.call(ctx, redactTimeout)
	defer cancel()
	resp, err := c.rpc.RedactText(cctx, &aiv1.RedactTextRequest{Text: text})
	if err != nil {
		return usecase.RedactOutput{}, wrapErr("RedactText", err)
	}
	slog.Info("ai", "transport", "grpc", "op", "RedactText")
	return usecase.RedactOutput{Text: resp.GetText(), RedactedKinds: resp.GetRedactedKinds()}, nil
}

func toProtoJenis(j domain.ContractJenis) aiv1.ContractType {
	switch j {
	case domain.JenisPengadaan:
		return aiv1.ContractType_PENGADAAN
	case domain.JenisHibah:
		return aiv1.ContractType_HIBAH
	case domain.JenisKerjaSamaBUMDes:
		return aiv1.ContractType_KERJA_SAMA_BUMDES
	case domain.JenisSewaAset:
		return aiv1.ContractType_SEWA_ASET
	case domain.JenisUMKM:
		return aiv1.ContractType_UMKM
	}
	return aiv1.ContractType_CONTRACT_TYPE_UNSPECIFIED
}

func toProtoClauses(in []domain.Clause) []*aiv1.Clause {
	out := make([]*aiv1.Clause, len(in))
	for i, c := range in {
		out[i] = &aiv1.Clause{KodePasal: c.KodePasal, Judul: c.Judul, Isi: c.Isi, Urutan: int32(c.Urutan), LegalReferenceId: c.LegalReferenceID}
	}
	return out
}

func toProtoRefs(in []domain.LegalReference) []*aiv1.LegalReference {
	out := make([]*aiv1.LegalReference, len(in))
	for i, r := range in {
		out[i] = &aiv1.LegalReference{Id: r.ID, Peraturan: r.Peraturan, NomorPasal: r.NomorPasal, Isi: r.Isi}
	}
	return out
}
