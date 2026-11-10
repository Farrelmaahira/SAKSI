package aiengine

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

var sampleClauses = []domain.Clause{{KodePasal: "P-07", Judul: "Sanksi", Isi: "denda 1/1000", Urutan: 1}}

func TestRESTAuditClauses(t *testing.T) {
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

	res, err := NewREST(srv.URL+"/", "k").AuditClauses(context.Background(), usecase.AuditInput{Clauses: sampleClauses})
	if err != nil || res.Model != "groq/x" || res.Score != 50 || len(res.Findings) != 1 {
		t.Fatalf("hasil salah: %+v, err=%v", res, err)
	}
	if _, err := NewREST(srv.URL, "salah").AuditClauses(context.Background(), usecase.AuditInput{Clauses: sampleClauses}); err == nil {
		t.Fatal("api key salah harus error")
	}
	if _, err := NewREST(srv.URL, "k").RedactText(context.Background(), "x"); !errors.Is(err, usecase.ErrAIUnavailable) {
		t.Fatal("redact lewat REST harus ErrAIUnavailable")
	}
}

func TestRESTDownIsUnavailable(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer srv.Close()

	_, err := usecase.AuditText(context.Background(), NewREST(srv.URL, "k"), nil, "", "Pasal 7: Sanksi\ndenda 1/1000")
	if !errors.Is(err, usecase.ErrAIUnavailable) || usecase.AIUnavailableMessage(err) != usecase.DefaultAIUnavailableMessage {
		t.Fatalf("AI mati harus AI_UNAVAILABLE, bukan skor pengganti: %v", err)
	}
}
