package handlers

import (
	"encoding/json"
	"net"
	"net/http"
	"net/netip"
	"strconv"
	"strings"

	"saksi-backend/internal/usecase"
)

// Deps menyimpan dependensi utama untuk seluruh HTTP handler.
type Deps struct {
	Store    usecase.Store
	Storage  usecase.Storage
	AIEngine usecase.AIEngine
	Secret   string
	// Cache nil = cache mati (usecase memakai NopCache). Limiter nil hanya untuk tes; main selalu memasangnya.
	Cache   usecase.Cache
	Limiter usecase.RateLimiter
	// TrustedProxies: hanya dari alamat ini X-Forwarded-For/X-Real-IP dipercaya.
	TrustedProxies []netip.Prefix
	// ExposeDevTokens: hanya APP_ENV development/local/test. Token reset sandi ikut di respons dan log.
	ExposeDevTokens bool
}

// ClientIP mengembalikan IP klien yang tidak bisa dipalsukan: header proxy hanya dibaca bila
// koneksi datang dari proxy tepercaya; X-Forwarded-For dibaca dari kanan, melewati proxy tepercaya.
func ClientIP(r *http.Request, trusted []netip.Prefix) string {
	peer := r.RemoteAddr
	if host, _, err := net.SplitHostPort(peer); err == nil {
		peer = host
	}
	isTrusted := func(s string) bool {
		a, err := netip.ParseAddr(strings.TrimSpace(s))
		if err != nil {
			return false
		}
		for _, p := range trusted {
			if p.Contains(a.Unmap()) {
				return true
			}
		}
		return false
	}
	if !isTrusted(peer) {
		return peer
	}
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		hops := strings.Split(xff, ",")
		for i := len(hops) - 1; i >= 0; i-- {
			h := strings.TrimSpace(hops[i])
			if _, err := netip.ParseAddr(h); err == nil && !isTrusted(h) {
				return h
			}
		}
	}
	if xr := strings.TrimSpace(r.Header.Get("X-Real-IP")); xr != "" {
		if _, err := netip.ParseAddr(xr); err == nil {
			return xr
		}
	}
	return peer
}

// ParseTrustedProxies membaca daftar IP/CIDR dipisah koma (env TRUSTED_PROXIES).
func ParseTrustedProxies(v string) ([]netip.Prefix, error) {
	var out []netip.Prefix
	for _, part := range strings.Split(v, ",") {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		if !strings.Contains(part, "/") {
			a, err := netip.ParseAddr(part)
			if err != nil {
				return nil, err
			}
			out = append(out, netip.PrefixFrom(a, a.BitLen()))
			continue
		}
		p, err := netip.ParsePrefix(part)
		if err != nil {
			return nil, err
		}
		out = append(out, p.Masked())
	}
	return out, nil
}

// ErrorResponse merepresentasikan payload standar saat terjadi error.
type ErrorResponse struct {
	Error string `json:"error"`
	Code  string `json:"code,omitempty"` // mis. AI_UNAVAILABLE, CONTRACT_LOCKED, RATE_LIMITED
}

// WriteJSON mengirimkan response JSON dengan status code yang ditentukan.
func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// WriteError mengirimkan response JSON error terstandarisasi.
func WriteError(w http.ResponseWriter, status int, msg string) {
	WriteJSON(w, status, ErrorResponse{Error: msg})
}

// WriteErrorCode sama dengan WriteError ditambah kode stabil di level atas: {"error":"...","code":"..."}.
func WriteErrorCode(w http.ResponseWriter, status int, code, msg string) {
	WriteJSON(w, status, ErrorResponse{Error: msg, Code: code})
}

// formatVillageID mengubah *int64 villageID menjadi string, mengembalikan "" jika nil.
func formatVillageID(v *int64) string {
	if v == nil {
		return ""
	}
	return strconv.FormatInt(*v, 10)
}

