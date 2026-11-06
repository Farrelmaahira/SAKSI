package aiengine

import (
	"context"
	"strings"
)

type Client struct {
	endpoint string
	apiKey   string
}

func NewClient(endpoint, apiKey string) *Client {
	return &Client{
		endpoint: endpoint,
		apiKey:   apiKey,
	}
}

func (c *Client) AuditClauses(ctx context.Context, contractText string) (score float64, fulfilled int, total int, summary string, err error) {
	total = 8
	fulfilled = 0

	mandatoryKeywords := []string{
		"para pihak",
		"objek",
		"nilai",
		"jangka waktu",
		"hak dan kewajiban",
		"sanksi",
		"keadaan kahar",
		"penyelesaian perselisihan",
	}

	lower := strings.ToLower(contractText)
	for _, kw := range mandatoryKeywords {
		if strings.Contains(lower, kw) {
			fulfilled++
		}
	}

	score = (float64(fulfilled) / float64(total)) * 100
	if fulfilled == total {
		summary = "Audit berhasil: Semua 8 klausul wajib UU Desa terpenuhi secara lengkap."
	} else {
		summary = "Audit selesai: Terdapat klausul wajib yang belum tercantum dalam draf kontrak."
	}

	return score, fulfilled, total, summary, nil
}

