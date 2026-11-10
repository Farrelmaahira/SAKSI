package redis

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"

	"saksi-backend/internal/adapter/ratelimit"
	"saksi-backend/internal/usecase"
)

func TestCacheGetSetDelPrefix(t *testing.T) {
	mr := miniredis.RunT(t)
	c, err := Open("redis://"+mr.Addr()+"/0", nil)
	if err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()

	if _, ok, err := c.Get(ctx, "x"); ok || err != nil {
		t.Fatalf("miss harus ok=false tanpa error: %v", err)
	}
	if err := c.Set(ctx, "x", []byte("v"), 0); err == nil {
		t.Fatal("kunci tanpa TTL harus ditolak")
	}
	for _, k := range []string{"saksi:public:contracts:1:0", "saksi:public:contracts:1:2", "saksi:public:contracts:10:0", "saksi:public:contract:5"} {
		if err := c.Set(ctx, k, []byte("v"), time.Minute); err != nil {
			t.Fatal(err)
		}
	}
	if mr.TTL("saksi:public:contract:5") != time.Minute {
		t.Fatal("TTL tidak terpasang")
	}
	usecase.InvalidatePublic(ctx, c, 5, 1)
	for k, want := range map[string]bool{
		"saksi:public:contracts:1:0":  false,
		"saksi:public:contracts:1:2":  false,
		"saksi:public:contracts:10:0": true, // desa lain tidak ikut terhapus
		"saksi:public:contract:5":     false,
	} {
		if mr.Exists(k) != want {
			t.Errorf("%s exists=%v, mau %v", k, mr.Exists(k), want)
		}
	}
}

func TestAllowAndFallbackWhenRedisDown(t *testing.T) {
	mr := miniredis.RunT(t)
	c, _ := Open("redis://"+mr.Addr()+"/0", ratelimit.NewMemory())
	ctx := context.Background()
	for i := 1; i <= 3; i++ {
		ok, err := c.Allow(ctx, "saksi:rl:report:7", 2, time.Hour)
		if err != nil || ok != (i <= 2) {
			t.Fatalf("percobaan %d ok=%v err=%v", i, ok, err)
		}
	}
	if mr.TTL("saksi:rl:report:7") != time.Hour {
		t.Fatal("counter rate limit wajib punya TTL")
	}

	mr.Close() // Redis mati: tetap dibatasi oleh limiter memori
	for i := 1; i <= 3; i++ {
		ok, _ := c.Allow(ctx, "saksi:rl:report:7", 2, time.Hour)
		if ok != (i <= 2) {
			t.Fatalf("redis mati, percobaan %d ok=%v (tidak boleh fail-open)", i, ok)
		}
	}
	if _, _, err := c.Get(ctx, "x"); err == nil {
		t.Fatal("get saat redis mati harus error (usecase menganggapnya miss)")
	}
}

func TestOpenAcceptsTLSURL(t *testing.T) {
	c, err := Open("rediss://:secret@example.redis.azure.net:10000/0", nil)
	if err != nil {
		t.Fatal(err)
	}
	if c.rdb.Options().TLSConfig == nil {
		t.Fatal("rediss:// harus memakai TLS")
	}
}
