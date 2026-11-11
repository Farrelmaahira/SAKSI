package aiengine

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// REST memanggil endpoint lama ai-engine (FastAPI POST /v1/audit). Dipakai sebagai cadangan audit
// selama gRPC belum terbukti di Azure; Draft dan Redact tidak tersedia lewat REST.
type REST struct {
	endpoint string
	apiKey   string
	http     *http.Client
}

var _ usecase.AIEngine = (*REST)(nil)

func NewREST(endpoint, apiKey string) *REST {
	return &REST{
		endpoint: strings.TrimRight(endpoint, "/"),
		apiKey:   apiKey,
		http:     &http.Client{Timeout: auditTimeout},
	}
}

type auditRequest struct {
	ContractText string   `json:"contractText"`
	Checklist    []string `json:"checklist"`
}

func (c *REST) AuditClauses(ctx context.Context, in usecase.AuditInput) (domain.AuditResult, error) {
	body, err := json.Marshal(auditRequest{ContractText: usecase.ClausesToText(in.Clauses), Checklist: usecase.MandatoryClauseNames()})
	if err != nil {
		return domain.AuditResult{}, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint+"/v1/audit", bytes.NewReader(body))
	if err != nil {
		return domain.AuditResult{}, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		slog.Warn("ai engine REST tidak terjangkau", "err", err)
		return domain.AuditResult{}, unavailable()
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 500 || resp.StatusCode == http.StatusTooManyRequests {
		slog.Warn("ai engine REST tidak tersedia", "status", resp.StatusCode)
		return domain.AuditResult{}, unavailable()
	}
	if resp.StatusCode != http.StatusOK {
		return domain.AuditResult{}, fmt.Errorf("ai engine status %d", resp.StatusCode)
	}

	slog.Info("ai", "transport", "rest", "op", "AuditContract")
	var out domain.AuditResult
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&out); err != nil {
		return domain.AuditResult{}, err
	}
	if out.Total == 0 || out.Model == "" {
		return domain.AuditResult{}, errors.New("ai engine: respons tidak lengkap")
	}
	if out.Findings == nil {
		out.Findings = []domain.AuditFinding{}
	}
	return out, nil
}

func (c *REST) DraftContract(context.Context, usecase.DraftInput) (usecase.DraftOutput, error) {
	return usecase.DraftOutput{}, unavailable() // REST lama hanya punya /v1/audit
}

func (c *REST) RedactText(context.Context, string) (usecase.RedactOutput, error) {
	return usecase.RedactOutput{}, unavailable()
}

func unavailable() error {
	return &usecase.AIUnavailableError{Message: usecase.DefaultAIUnavailableMessage}
}

// timeouts sesuai konvensi bagian 2: 13 dtk Draft/Audit, 5 dtk Redact.
const (
	auditTimeout  = 13 * time.Second
	draftTimeout  = 13 * time.Second
	redactTimeout = 5 * time.Second
)
