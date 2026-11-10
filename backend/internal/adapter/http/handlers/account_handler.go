package handlers

import (
	"errors"
	"log/slog"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf8"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

type UsahaProfile struct {
	ID     int64  `json:"id"`
	Nama   string `json:"nama"`
	Jenis  string `json:"jenis"`
	NPWP   string `json:"npwp"`
	Alamat string `json:"alamat"`
}

func meResponse(u domain.User) MeResponse {
	m := MeResponse{UserID: u.ID, Role: string(u.Role), Nama: u.Name, Email: u.Email, VillageID: u.VillageID,
		VillageName: u.VillageName, Status: u.Status, NoHP: u.NoHP}
	if u.CounterpartyID != nil {
		m.Usaha = &UsahaProfile{ID: *u.CounterpartyID, Nama: u.CounterpartyName, Jenis: u.CounterpartyJenis, NPWP: u.NPWP, Alamat: u.Alamat}
	}
	return m
}

type UpdateMeRequest struct {
	Nama  *string `json:"nama,omitempty"`
	NoHP  *string `json:"noHp,omitempty"`
	Usaha *struct {
		Nama   string `json:"nama"`
		NPWP   string `json:"npwp"`
		Alamat string `json:"alamat"`
	} `json:"usaha,omitempty"`
}

var (
	reNoHP = regexp.MustCompile(`^\+?[0-9]{8,20}$`)
	reNPWP = regexp.MustCompile(`^[0-9.\-]{15,20}$`)
)

// HandleUpdateMe: PUT /auth/me — perbarui nama, no HP (warga), profil usaha (penyedia).
func HandleUpdateMe(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, role, _ := ClaimsFromContext(r.Context())
		var req UpdateMeRequest
		if !decodeBody(w, r, &req) {
			return
		}
		p := usecase.UpdateProfileParams{UserID: uid, Role: role, IP: ClientIP(r, d.TrustedProxies)}
		if req.Nama != nil {
			n := strings.TrimSpace(*req.Nama)
			if l := utf8.RuneCountInString(n); l < 3 || l > 255 {
				badInput(w, "nama harus 3-255 karakter")
				return
			}
			p.Nama = &n
		}
		if req.NoHP != nil {
			if role != domain.RoleWarga {
				badInput(w, "noHp hanya untuk akun warga")
				return
			}
			n := strings.TrimSpace(*req.NoHP)
			if !reNoHP.MatchString(n) {
				badInput(w, "noHp harus 8-20 digit (boleh diawali +)")
				return
			}
			p.NoHP = &n
		}
		if req.Usaha != nil {
			if role != domain.RolePenyedia {
				badInput(w, "profil usaha hanya untuk akun penyedia")
				return
			}
			u := usecase.UsahaInput{Nama: strings.TrimSpace(req.Usaha.Nama), NPWP: strings.TrimSpace(req.Usaha.NPWP), Alamat: strings.TrimSpace(req.Usaha.Alamat)}
			switch {
			case utf8.RuneCountInString(u.Nama) < 3 || len(u.Nama) > 255:
				badInput(w, "nama usaha harus 3-255 karakter")
				return
			case u.NPWP != "" && !reNPWP.MatchString(u.NPWP):
				badInput(w, "format NPWP belum benar. Contoh: 01.234.567.8-405.000")
				return
			case utf8.RuneCountInString(u.Alamat) < 5 || utf8.RuneCountInString(u.Alamat) > 500:
				badInput(w, "alamat harus 5-500 karakter")
				return
			}
			p.Usaha = &u
		}
		u, err := d.Store.UpdateProfile(r.Context(), p)
		if err != nil {
			writeDomainErr(w, err, "profil tidak ditemukan")
			return
		}
		WriteJSON(w, http.StatusOK, meResponse(u))
	}
}

type ChangePasswordRequest struct {
	PasswordLama string `json:"passwordLama"`
	PasswordBaru string `json:"passwordBaru"`
}

// HandleChangePassword: POST /auth/password/change.
func HandleChangePassword(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, _, _ := ClaimsFromContext(r.Context())
		if !usecase.Allow(r.Context(), d.Limiter, usecase.KeyRLPwChange(uid), usecase.LimitPwChange, usecase.WindowPwChange) {
			w.Header().Set("Retry-After", strconv.Itoa(int(usecase.WindowPwChange.Seconds())))
			WriteErrorCode(w, http.StatusTooManyRequests, "RATE_LIMITED", "terlalu banyak percobaan, coba lagi nanti")
			return
		}
		var req ChangePasswordRequest
		if !decodeBody(w, r, &req) {
			return
		}
		u, err := d.Store.UserByID(r.Context(), uid)
		if err != nil {
			writeDomainErr(w, err, "akun tidak ditemukan")
			return
		}
		// Sengaja tanpa kata sandi demo: token curian tidak boleh cukup untuk mengganti sandi.
		if !usecase.CheckPassword(u.PasswordHash, req.PasswordLama) {
			WriteErrorCode(w, http.StatusBadRequest, "WRONG_PASSWORD", "kata sandi saat ini salah")
			return
		}
		hash, err := usecase.HashPassword(req.PasswordBaru)
		if err != nil {
			badInput(w, "kata sandi baru minimal 8 karakter")
			return
		}
		if err := d.Store.ChangePassword(r.Context(), uid, hash, ClientIP(r, d.TrustedProxies)); err != nil {
			writeDomainErr(w, err, "akun tidak ditemukan")
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type ForgotPasswordResponse struct {
	Message  string `json:"message"`
	DevToken string `json:"devToken,omitempty"`
}

const forgotMsg = "Jika email terdaftar, instruksi atur ulang sandi sudah dikirim."

func rateLimited(w http.ResponseWriter) {
	w.Header().Set("Retry-After", strconv.Itoa(int(usecase.WindowResetRL.Seconds())))
	WriteErrorCode(w, http.StatusTooManyRequests, "RATE_LIMITED", "terlalu banyak percobaan, coba lagi nanti")
}

// HandleForgotPassword: POST /auth/password/forgot — jawaban selalu sama agar email terdaftar tidak bocor.
func HandleForgotPassword(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !usecase.Allow(r.Context(), d.Limiter, usecase.KeyRLReset("ip:"+ClientIP(r, d.TrustedProxies)), usecase.LimitResetPerKey, usecase.WindowResetRL) {
			rateLimited(w)
			return
		}
		var req ForgotPasswordRequest
		if !decodeBody(w, r, &req) {
			return
		}
		email := strings.ToLower(strings.TrimSpace(req.Email))
		if !usecase.ValidEmail(email) {
			badInput(w, "format email tidak valid")
			return
		}
		if !usecase.Allow(r.Context(), d.Limiter, usecase.KeyRLReset("email:"+usecase.HashText(email)), usecase.LimitResetPerKey, usecase.WindowResetRL) {
			rateLimited(w)
			return
		}
		resp := ForgotPasswordResponse{Message: forgotMsg}
		u, err := d.Store.UserByEmail(r.Context(), email)
		// UserByEmail punya alias akun demo; hanya email yang persis sama yang diproses.
		if err == nil && strings.EqualFold(u.Email, email) {
			plain, hash, err := usecase.NewResetToken()
			if err == nil {
				err = d.Store.CreatePasswordReset(r.Context(), u.ID, hash, usecase.ResetTokenTTL)
			}
			if err != nil {
				slog.Error("gagal membuat token reset sandi", "user_id", u.ID, "err", err)
			} else if d.ExposeDevTokens {
				// shortcut: belum ada layanan email; token hanya ditampilkan di lingkungan dev (APP_ENV), pasang email sebelum produksi.
				slog.Warn("DEV: token reset sandi", "user_id", u.ID, "token", plain)
				resp.DevToken = plain
			}
		}
		WriteJSON(w, http.StatusAccepted, resp)
	}
}

type ResetPasswordRequest struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

// HandleResetPassword: POST /auth/password/reset.
func HandleResetPassword(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !usecase.Allow(r.Context(), d.Limiter, usecase.KeyRLReset("ip:"+ClientIP(r, d.TrustedProxies)), usecase.LimitResetPerKey*2, usecase.WindowResetRL) {
			rateLimited(w)
			return
		}
		var req ResetPasswordRequest
		if !decodeBody(w, r, &req) {
			return
		}
		tok := strings.TrimSpace(req.Token)
		if tok == "" || len(tok) > 200 {
			WriteErrorCode(w, http.StatusBadRequest, "TOKEN_INVALID", "token atur ulang sandi tidak valid atau kedaluwarsa")
			return
		}
		hash, err := usecase.HashPassword(req.Password)
		if err != nil {
			badInput(w, "kata sandi baru minimal 8 karakter")
			return
		}
		if err := d.Store.ResetPassword(r.Context(), usecase.HashResetToken(tok), hash, ClientIP(r, d.TrustedProxies)); err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				WriteErrorCode(w, http.StatusBadRequest, "TOKEN_INVALID", "token atur ulang sandi tidak valid atau kedaluwarsa")
				return
			}
			writeDomainErr(w, err, "token tidak ditemukan")
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}
