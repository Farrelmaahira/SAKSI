package ratelimit

import (
	"context"
	"testing"
	"time"
)

func TestMemoryAllow(t *testing.T) {
	m := NewMemory()
	now := time.Now()
	m.now = func() time.Time { return now }
	ctx := context.Background()
	for i := 1; i <= 3; i++ {
		if ok, _ := m.Allow(ctx, "a", 2, time.Minute); ok != (i <= 2) {
			t.Fatalf("percobaan %d: ok=%v", i, ok)
		}
	}
	if ok, _ := m.Allow(ctx, "b", 2, time.Minute); !ok {
		t.Fatal("kunci lain tidak boleh ikut terblokir")
	}
	now = now.Add(time.Minute + time.Second)
	if ok, _ := m.Allow(ctx, "a", 2, time.Minute); !ok {
		t.Fatal("jendela baru harus mengizinkan lagi")
	}
}
