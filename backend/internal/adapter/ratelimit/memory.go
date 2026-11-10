// Package ratelimit berisi rate limiter in-memory per proses: dipakai saat REDIS_URL kosong atau Redis error,
// supaya rate limit login/laporan tidak fail-open di API publik.
package ratelimit

import (
	"context"
	"sync"
	"time"

	"saksi-backend/internal/usecase"
)

// shortcut: hitungan per instance, jadi batas efektif = limit × jumlah replika; pakai Redis bila replika > 1.
type Memory struct {
	mu      sync.Mutex
	windows map[string]window
	now     func() time.Time
}

type window struct {
	count int
	reset time.Time
}

var _ usecase.RateLimiter = (*Memory)(nil)

func NewMemory() *Memory {
	return &Memory{windows: map[string]window{}, now: time.Now}
}

func (m *Memory) Allow(_ context.Context, key string, limit int, d time.Duration) (bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	now := m.now()
	if len(m.windows) > 10000 { // buang jendela kedaluwarsa supaya memori tidak tumbuh tanpa batas
		for k, w := range m.windows {
			if now.After(w.reset) {
				delete(m.windows, k)
			}
		}
	}
	w := m.windows[key]
	if now.After(w.reset) {
		w = window{reset: now.Add(d)}
	}
	w.count++
	m.windows[key] = w
	return w.count <= limit, nil
}
