package handlers

type ErrorResponse struct {
	Error string `json:"error"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	Name        string `json:"name"`
	NIP         string `json:"nip"`
	Role        string `json:"role"`
	VillageID   string `json:"villageId"`
	VillageName string `json:"villageName"`
}

type SessionResponse struct {
	Token       string `json:"token"`
	Role        string `json:"role"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	NIP         string `json:"nip"`
	VillageID   string `json:"villageId"`
	VillageName string `json:"villageName"`
}

type MeResponse struct {
	UserID      string `json:"userId"`
	Role        string `json:"role"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	NIP         string `json:"nip"`
	VillageID   string `json:"villageId"`
	VillageName string `json:"villageName"`
}

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

