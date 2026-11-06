package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"saksi-backend/internal/usecase"
)

// Deps menyimpan dependensi utama untuk seluruh HTTP handler.
type Deps struct {
	Store    usecase.Store
	Storage  usecase.Storage
	AIEngine usecase.AIEngine
	Secret   string
}

// ErrorResponse merepresentasikan payload standar saat terjadi error.
type ErrorResponse struct {
	Error string `json:"error"`
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

// formatVillageID mengubah *int64 villageID menjadi string, mengembalikan "" jika nil.
func formatVillageID(v *int64) string {
	if v == nil {
		return ""
	}
	return strconv.FormatInt(*v, 10)
}

