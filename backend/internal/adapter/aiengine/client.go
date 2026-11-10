package aiengine

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// Client memanggil layanan ai-engine (FastAPI) lewat HTTP.
type Client struct {
	endpoint string
	apiKey   string
	http     *http.Client
}

func NewClient(endpoint, apiKey string) *Client {
	return &Client{
		endpoint: strings.TrimRight(endpoint, "/"),
		apiKey:   apiKey,
		// Di bawah WriteTimeout server (15 dtk) agar masih sempat jatuh ke rule auditor.
		http: &http.Client{Timeout: 13 * time.Second},
	}
}

type auditRequest struct {
	ContractText string   `json:"contractText"`
	Checklist    []string `json:"checklist"`
}

func (c *Client) AuditClauses(ctx context.Context, contractText string) (domain.AuditResult, error) {
	body, err := json.Marshal(auditRequest{ContractText: contractText, Checklist: usecase.MandatoryClauseNames()})
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
		return domain.AuditResult{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return domain.AuditResult{}, fmt.Errorf("ai engine status %d", resp.StatusCode)
	}

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
