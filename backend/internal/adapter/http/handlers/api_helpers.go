package handlers

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

const maxSmallBody = 64 << 10

// scopeOf membentuk cakupan data dari klaim token.
func scopeOf(r *http.Request) usecase.Scope {
	uid, role, vid := ClaimsFromContext(r.Context())
	return usecase.Scope{UserID: uid, Role: role, VillageID: vid}
}

func forbid(w http.ResponseWriter, msg string) {
	WriteErrorCode(w, http.StatusForbidden, "FORBIDDEN", msg)
}

func badInput(w http.ResponseWriter, msg string) {
	WriteErrorCode(w, http.StatusBadRequest, "INVALID_INPUT", msg)
}

// pathID membaca {name} sebagai id positif; menulis 400 bila tidak valid.
func pathID(w http.ResponseWriter, r *http.Request, name string) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue(name), 10, 64)
	if err != nil || id <= 0 {
		badInput(w, "ID "+name+" tidak valid")
		return 0, false
	}
	return id, true
}

// decodeBody membatasi ukuran body dan menolak field yang tidak dikenal.
func decodeBody(w http.ResponseWriter, r *http.Request, v any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, maxSmallBody)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(v); err != nil {
		badInput(w, "payload JSON tidak valid")
		return false
	}
	return true
}

func parseDate(s string) (time.Time, error) { return time.Parse("2006-01-02", strings.TrimSpace(s)) }

// optDate: string kosong = nil.
func optDate(s string) (*time.Time, error) {
	if strings.TrimSpace(s) == "" {
		return nil, nil
	}
	t, err := parseDate(s)
	return &t, err
}

// queryInt64 membaca parameter query opsional; ok=false bila ada tapi tidak valid (400 sudah ditulis).
func queryInt64(w http.ResponseWriter, r *http.Request, name string) (*int64, bool) {
	v := r.URL.Query().Get(name)
	if v == "" {
		return nil, true
	}
	n, err := strconv.ParseInt(v, 10, 64)
	if err != nil || n <= 0 {
		badInput(w, "parameter "+name+" tidak valid")
		return nil, false
	}
	return &n, true
}

// pageParams membaca limit (default 50, maks 200) dan before.
func pageParams(w http.ResponseWriter, r *http.Request) (limit int, before int64, ok bool) {
	limit = 50
	if v := r.URL.Query().Get("limit"); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil || n <= 0 {
			badInput(w, "parameter limit tidak valid")
			return 0, 0, false
		}
		limit = min(n, 200)
	}
	b, ok := queryInt64(w, r, "before")
	if !ok {
		return 0, 0, false
	}
	if b != nil {
		before = *b
	}
	return limit, before, true
}

// nextBefore: id terakhir bila halaman penuh, selain itu null.
func nextBefore(n, limit int, lastID int64) *int64 {
	if n < limit || n == 0 {
		return nil
	}
	return &lastID
}

// errMsg membuang prefiks sentinel domain ("domain: invalid input: ...") dari pesan.
func errMsg(err error, sentinel error, fallback string) string {
	m := strings.TrimPrefix(err.Error(), sentinel.Error())
	m = strings.TrimPrefix(m, ": ")
	if m == "" {
		return fallback
	}
	return m
}

// writeDomainErr memetakan error domain ke {"error","code"} tanpa membocorkan detail internal.
func writeDomainErr(w http.ResponseWriter, err error, notFoundMsg string) {
	switch {
	case errors.Is(err, domain.ErrInvalidInput):
		badInput(w, errMsg(err, domain.ErrInvalidInput, "input tidak valid"))
	case errors.Is(err, domain.ErrForbidden):
		forbid(w, "akses ditolak: data di luar cakupan desa/wilayah Anda")
	case errors.Is(err, domain.ErrNotFound):
		WriteErrorCode(w, http.StatusNotFound, "NOT_FOUND", notFoundMsg)
	case errors.Is(err, domain.ErrAlreadyPaid):
		WriteErrorCode(w, http.StatusConflict, "ALREADY_PAID", "termin ini sudah dibayar")
	case errors.Is(err, domain.ErrInvalidState):
		WriteErrorCode(w, http.StatusConflict, "INVALID_STATE", errMsg(err, domain.ErrInvalidState, "status tidak mengizinkan aksi ini"))
	case errors.Is(err, domain.ErrCriticalFindings):
		WriteErrorCode(w, http.StatusConflict, "CRITICAL_FINDINGS", "masih ada temuan kritis dari audit terakhir; perbaiki pasalnya lalu audit ulang")
	case errors.Is(err, domain.ErrContractNotEditable):
		writeContractLocked(w, contractLockedMsg)
	case errors.Is(err, domain.ErrConflict):
		WriteErrorCode(w, http.StatusConflict, "CONFLICT", "data yang sama sudah ada")
	default:
		slog.Error("kesalahan server", "err", err)
		WriteErrorCode(w, http.StatusInternalServerError, "INTERNAL", "terjadi kesalahan pada server")
	}
}
