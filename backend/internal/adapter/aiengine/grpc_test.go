package aiengine

import (
	"context"
	"errors"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/grpc/test/bufconn"

	aiv1 "saksi-backend/gen/saksi/ai/v1"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// fakeEngine adalah server ai-engine palsu; fail diisi untuk mensimulasikan provider mati.
type fakeEngine struct {
	aiv1.UnimplementedAiEngineServer
	fail     codes.Code
	msg      string
	delay    time.Duration
	lastReq  *aiv1.AuditContractRequest
	deadline time.Duration
}

func (f *fakeEngine) check(ctx context.Context) error {
	md, _ := metadata.FromIncomingContext(ctx)
	if v := md.Get("x-api-key"); len(v) != 1 || v[0] != "k" {
		return status.Error(codes.Unauthenticated, "api key salah")
	}
	if dl, ok := ctx.Deadline(); ok {
		f.deadline = time.Until(dl)
	}
	if f.delay > 0 {
		select {
		case <-time.After(f.delay):
		case <-ctx.Done():
			return status.FromContextError(ctx.Err()).Err()
		}
	}
	if f.fail != codes.OK {
		return status.Error(f.fail, f.msg)
	}
	return nil
}

func (f *fakeEngine) AuditContract(ctx context.Context, r *aiv1.AuditContractRequest) (*aiv1.AuditContractResponse, error) {
	if err := f.check(ctx); err != nil {
		return nil, err
	}
	f.lastReq = r
	return &aiv1.AuditContractResponse{Skor: 80, Model: "groq:llama-3.3-70b-versatile", Findings: []*aiv1.Finding{
		{KodePasal: "P-07", Tingkat: aiv1.Severity_KRITIS, Pesan: "denda tidak jelas"},
		{Tingkat: aiv1.Severity_SARAN, Pesan: "umum"},
	}}, nil
}

func (f *fakeEngine) DraftContract(ctx context.Context, r *aiv1.DraftContractRequest) (*aiv1.DraftContractResponse, error) {
	if err := f.check(ctx); err != nil {
		return nil, err
	}
	return &aiv1.DraftContractResponse{Model: "groq:x", Clauses: []*aiv1.Clause{{KodePasal: "P-01", Judul: "Lingkup", Isi: r.Jawaban["lingkup_pekerjaan"], Urutan: 1, LegalReferenceId: 12}}}, nil
}

func (f *fakeEngine) RedactText(ctx context.Context, r *aiv1.RedactTextRequest) (*aiv1.RedactTextResponse, error) {
	if err := f.check(ctx); err != nil {
		return nil, err
	}
	return &aiv1.RedactTextResponse{Text: "NIK [DISENSOR]", RedactedKinds: []string{"nik"}}, nil
}

func newBufClient(t *testing.T, f *fakeEngine, key string, rest *REST) *Client {
	t.Helper()
	lis := bufconn.Listen(1 << 20)
	srv := grpc.NewServer()
	aiv1.RegisterAiEngineServer(srv, f)
	go func() { _ = srv.Serve(lis) }()
	conn, err := grpc.NewClient("passthrough:///bufnet",
		grpc.WithContextDialer(func(ctx context.Context, _ string) (net.Conn, error) { return lis.DialContext(ctx) }),
		grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { conn.Close(); srv.Stop() })
	return New(conn, key, rest)
}

func TestGRPCAuditDraftRedact(t *testing.T) {
	f := &fakeEngine{}
	c := newBufClient(t, f, "k", nil)
	ctx := context.Background()

	res, err := c.AuditClauses(ctx, usecase.AuditInput{Jenis: domain.JenisPengadaan, Clauses: sampleClauses, MandatoryKodePasal: []string{"P-07"}})
	if err != nil || res.Score != 80 || len(res.Findings) != 2 || res.Findings[0].Tingkat != "kritis" || *res.Findings[0].KodePasal != "P-07" || res.Findings[1].KodePasal != nil {
		t.Fatalf("audit salah: %+v err=%v", res, err)
	}
	if f.lastReq.Jenis != aiv1.ContractType_PENGADAAN || f.lastReq.Clauses[0].KodePasal != "P-07" || f.lastReq.MandatoryKodePasal[0] != "P-07" {
		t.Fatalf("request audit salah: %+v", f.lastReq)
	}
	if f.deadline <= 12*time.Second || f.deadline > 13*time.Second {
		t.Fatalf("deadline audit harus 13 dtk, dapat %v", f.deadline)
	}

	d, err := c.DraftContract(ctx, usecase.DraftInput{Jenis: domain.JenisHibah, Jawaban: map[string]string{"lingkup_pekerjaan": "posyandu"}})
	if err != nil || d.Model != "groq:x" || d.Clauses[0].Isi != "posyandu" || d.Clauses[0].LegalReferenceID != 12 {
		t.Fatalf("draft salah: %+v err=%v", d, err)
	}

	r, err := c.RedactText(ctx, "NIK 3302140101010001")
	if err != nil || r.Text != "NIK [DISENSOR]" || r.RedactedKinds[0] != "nik" {
		t.Fatalf("redact salah: %+v err=%v", r, err)
	}
	if f.deadline > 5*time.Second {
		t.Fatalf("deadline redact harus 5 dtk, dapat %v", f.deadline)
	}
}

func TestGRPCErrors(t *testing.T) {
	ctx := context.Background()

	if _, err := newBufClient(t, &fakeEngine{}, "salah", nil).RedactText(ctx, "x"); err == nil || errors.Is(err, usecase.ErrAIUnavailable) {
		t.Fatalf("api key salah harus error non-UNAVAILABLE, dapat %v", err)
	}

	down := newBufClient(t, &fakeEngine{fail: codes.Unavailable}, "k", nil)
	if _, err := down.DraftContract(ctx, usecase.DraftInput{}); !errors.Is(err, usecase.ErrAIUnavailable) {
		t.Fatalf("UNAVAILABLE harus ErrAIUnavailable, dapat %v", err)
	}

	short, cancel := context.WithTimeout(ctx, 50*time.Millisecond)
	defer cancel()
	slow := newBufClient(t, &fakeEngine{delay: time.Second}, "k", nil)
	if _, err := slow.AuditClauses(short, usecase.AuditInput{}); !errors.Is(err, usecase.ErrAIUnavailable) {
		t.Fatalf("DEADLINE_EXCEEDED harus ErrAIUnavailable, dapat %v", err)
	}
}

func TestGRPCUnavailableHasNoRuleFallback(t *testing.T) {
	ctx := context.Background()
	down := &fakeEngine{fail: codes.Unavailable, msg: "Semua model AI sedang dibatasi. Coba lagi 2 menit lagi."}

	// Draft: semua model gagal → error berisi pesan ai-engine, tanpa pasal pengganti.
	_, err := usecase.DraftClauses(ctx, newBufClient(t, down, "k", nil), usecase.DraftInput{}, domain.ContractTemplate{})
	if !errors.Is(err, usecase.ErrAIUnavailable) || usecase.AIUnavailableMessage(err) != down.msg {
		t.Fatalf("draft harus AI_UNAVAILABLE dengan pesan ai-engine, dapat %v", err)
	}

	// Audit: gRPC mati → REST /v1/audit dicoba dulu.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`{"score":70,"fulfilled":7,"total":9,"summary":"s","model":"groq/rest","findings":[]}`))
	}))
	defer srv.Close()
	res, err := usecase.AuditClauses(ctx, newBufClient(t, down, "k", NewREST(srv.URL, "k")), nil, usecase.AuditInput{Clauses: sampleClauses})
	if err != nil || res.Model != "groq/rest" || res.Total != 9 {
		t.Fatalf("audit harus lewat REST: %+v err=%v", res, err)
	}

	// gRPC dan REST mati → AI_UNAVAILABLE, bukan skor rule engine.
	srv.Close()
	if _, err := usecase.AuditClauses(ctx, newBufClient(t, down, "k", NewREST(srv.URL, "k")), nil, usecase.AuditInput{Clauses: sampleClauses}); !errors.Is(err, usecase.ErrAIUnavailable) {
		t.Fatalf("audit harus AI_UNAVAILABLE, dapat %v", err)
	}
}

func TestClientMessageHidesTransportErrors(t *testing.T) {
	if m := clientMessage(status.New(codes.Unavailable, "connection error: desc = \"transport: Error while dialing: dial tcp 10.0.0.5:50051\"")); m != usecase.DefaultAIUnavailableMessage {
		t.Fatalf("galat transport tidak boleh diteruskan: %q", m)
	}
	if m := clientMessage(status.New(codes.DeadlineExceeded, "context deadline exceeded")); m != usecase.DefaultAIUnavailableMessage {
		t.Fatalf("timeout harus pesan baku: %q", m)
	}
}

func TestGRPCTarget(t *testing.T) {
	cases := []struct {
		in     string
		tls    bool
		want   string
		wantTL bool
	}{
		{"ai-engine:50051", false, "ai-engine:50051", false},
		{"ai-engine:50051", true, "ai-engine:50051", true},
		{"saksi-ai-engine.azurewebsites.net:443", false, "saksi-ai-engine.azurewebsites.net:443", true},
		{"https://saksi-ai-engine.azurewebsites.net", false, "saksi-ai-engine.azurewebsites.net:443", true},
	}
	for _, c := range cases {
		got, tl := grpcTarget(c.in, c.tls)
		if got != c.want || tl != c.wantTL {
			t.Errorf("grpcTarget(%q,%v) = %q,%v; mau %q,%v", c.in, c.tls, got, tl, c.want, c.wantTL)
		}
	}
}
