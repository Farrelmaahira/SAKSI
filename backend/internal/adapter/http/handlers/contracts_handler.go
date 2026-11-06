package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"

	"saksi-backend/internal/usecase"
)

// DTO untuk modul kontrak

type CreateContractRequest struct {
	ContractNumber string `json:"contractNumber"`
	Title          string `json:"title"`
	Category       string `json:"category"`
	VendorName     string `json:"vendorName"`
	Amount         int64  `json:"amount"`
	Volume         string `json:"volume"`
	FiscalYear     int    `json:"fiscalYear"`
	ContractText   string `json:"contractText"`
}

type VerifyContractRequest struct {
	ContractText string `json:"contractText"`
}

type AuditResponse struct {
	IntegrityScore     float64 `json:"integrityScore"`
	MandatoryFulfilled int     `json:"mandatoryFulfilled"`
	TotalMandatory     int     `json:"totalMandatory"`
	SHA256Hash         string  `json:"sha256Hash"`
	Summary            string  `json:"summary"`
}

// Handlers untuk modul kontrak

func HandleListContracts(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, role, vID := ClaimsFromContext(r.Context())
		villageID := formatVillageID(vID)
		search := r.URL.Query().Get("q")
		list, err := d.Store.ListContracts(r.Context(), villageID, role, search)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "failed to query contracts")
			return
		}
		WriteJSON(w, http.StatusOK, list)
	}
}

func HandleGetContract(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, role, vID := ClaimsFromContext(r.Context())
		villageID := formatVillageID(vID)
		contractID := r.PathValue("id")
		contract, err := d.Store.ContractByID(r.Context(), contractID)
		if err != nil {
			WriteError(w, http.StatusNotFound, "contract not found")
			return
		}

		if err := usecase.AuthorizeContractAccess(role, villageID, contract); err != nil {
			WriteError(w, http.StatusForbidden, "access denied: IDOR violation")
			return
		}

		WriteJSON(w, http.StatusOK, contract)
	}
}

func HandleAuditContract(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req VerifyContractRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		score, fulfilled, total, summary, err := d.AIEngine.AuditClauses(r.Context(), req.ContractText)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "ai audit failed")
			return
		}

		hasher := sha256.New()
		hasher.Write([]byte(req.ContractText))
		hash := hex.EncodeToString(hasher.Sum(nil))

		WriteJSON(w, http.StatusOK, AuditResponse{
			IntegrityScore:     score,
			MandatoryFulfilled: fulfilled,
			TotalMandatory:     total,
			SHA256Hash:         hash,
			Summary:            summary,
		})
	}
}
