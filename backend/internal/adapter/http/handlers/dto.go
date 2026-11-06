package handlers

type ErrorResponse struct {
	Error string `json:"error"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Nama        string `json:"nama"`
	Name        string `json:"name"` // alias fallback
	Email       string `json:"email"`
	Password    string `json:"password"`
	Role        string `json:"role"` // "kades"|"perangkat_desa", "penyedia", "warga"
	VillageID   *int64 `json:"villageId,omitempty"`
	NoHP        string `json:"noHp,omitempty"`        // khusus warga
	CompanyName string `json:"companyName,omitempty"` // khusus penyedia
	CompanyType string `json:"companyType,omitempty"` // khusus penyedia ("penyedia"|"umkm")
	NPWP        string `json:"npwp,omitempty"`
	Address     string `json:"address,omitempty"`
	Alamat      string `json:"alamat,omitempty"` // alias
}

func (r *RegisterRequest) GetName() string {
	if r.Nama != "" {
		return r.Nama
	}
	return r.Name
}

func (r *RegisterRequest) GetAddress() string {
	if r.Alamat != "" {
		return r.Alamat
	}
	return r.Address
}

type SessionResponse struct {
	Token       string `json:"token"`
	UserID      int64  `json:"userId"`
	Role        string `json:"role"`
	Nama        string `json:"nama"`
	Email       string `json:"email"`
	VillageID   *int64 `json:"villageId,omitempty"`
	VillageName string `json:"villageName,omitempty"`
	Status      string `json:"status"`
}

type MeResponse struct {
	UserID      int64  `json:"userId"`
	Role        string `json:"role"`
	Nama        string `json:"nama"`
	Email       string `json:"email"`
	VillageID   *int64 `json:"villageId,omitempty"`
	VillageName string `json:"villageName,omitempty"`
	Status      string `json:"status"`
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

