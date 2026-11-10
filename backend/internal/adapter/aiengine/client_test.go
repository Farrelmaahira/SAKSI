package aiengine

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"saksi-backend/internal/usecase"
)

func TestAuditClauses(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/audit" || r.Header.Get("X-API-Key") != "k" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		var req auditRequest
		_ = json.NewDecoder(r.Body).Decode(&req)
		if len(req.Checklist) != len(usecase.MandatoryClauseNames()) {
			t.Errorf("checklist tidak terkirim lengkap: %v", req.Checklist)
		}
		_, _ = w.Write([]byte(`{"score":50,"fulfilled":1,"total":2,"summary":"s","model":"groq/x","findings":[{"kodePasal":null,"tingkat":"kritis","pesan":"p"}]}`))
	}))
	defer srv.Close()

	res, err := NewClient(srv.URL+"/", "k").AuditClauses(context.Background(), "teks")
	if err != nil || res.Model != "groq/x" || res.Score != 50 || len(res.Findings) != 1 {
		t.Fatalf("hasil salah: %+v, err=%v", res, err)
	}
	if _, err := NewClient(srv.URL, "salah").AuditClauses(context.Background(), "teks"); err == nil {
		t.Fatal("api key salah harus error")
	}
}

func TestRunAuditFallsBackToRules(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer srv.Close()

	res := usecase.RunAudit(context.Background(), NewClient(srv.URL, "k"), "Pasal 7 sanksi denda 1/1000")
	if res.Model != usecase.RuleAuditorModel || res.Total == 0 || res.Score == 100 {
		t.Fatalf("AI gagal harus jatuh ke rule auditor, bukan lolos: %+v", res)
	}
}
