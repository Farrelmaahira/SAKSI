// Package redis mengimplementasikan usecase.Cache dan usecase.RateLimiter di atas Redis (go-redis v9).
package redis

import (
	"context"
	"errors"
	"log/slog"
	"time"

	goredis "github.com/redis/go-redis/v9"

	"saksi-backend/internal/usecase"
)

type Client struct {
	rdb *goredis.Client
	// fallback dipakai rate limit saat Redis error, supaya tidak fail-open.
	fallback usecase.RateLimiter
}

var (
	_ usecase.Cache       = (*Client)(nil)
	_ usecase.RateLimiter = (*Client)(nil)
)

// Open menerima redis:// dan rediss:// (TLS, mis. Azure Managed Redis port 10000).
func Open(url string, fallback usecase.RateLimiter) (*Client, error) {
	opt, err := goredis.ParseURL(url)
	if err != nil {
		return nil, err
	}
	opt.PoolSize = 20
	opt.MinIdleConns = 2
	opt.DialTimeout = 2 * time.Second
	opt.ReadTimeout = 500 * time.Millisecond
	opt.WriteTimeout = 500 * time.Millisecond
	return &Client{rdb: goredis.NewClient(opt), fallback: fallback}, nil
}

func (c *Client) Ping(ctx context.Context) error { return c.rdb.Ping(ctx).Err() }
func (c *Client) Close() error                   { return c.rdb.Close() }

func (c *Client) Get(ctx context.Context, key string) ([]byte, bool, error) {
	b, err := c.rdb.Get(ctx, key).Bytes()
	if errors.Is(err, goredis.Nil) {
		return nil, false, nil
	}
	if err != nil {
		return nil, false, err
	}
	return b, true, nil
}

func (c *Client) Set(ctx context.Context, key string, val []byte, ttl time.Duration) error {
	if ttl <= 0 {
		return errors.New("redis: kunci wajib punya TTL")
	}
	return c.rdb.Set(ctx, key, val, ttl).Err()
}

func (c *Client) Del(ctx context.Context, keys ...string) error {
	if len(keys) == 0 {
		return nil
	}
	return c.rdb.Unlink(ctx, keys...).Err()
}

// DelPrefix memakai SCAN (bukan KEYS) supaya tidak memblokir Redis di produksi.
func (c *Client) DelPrefix(ctx context.Context, prefix string) error {
	iter := c.rdb.Scan(ctx, 0, prefix+"*", 200).Iterator()
	var batch []string
	for iter.Next(ctx) {
		if batch = append(batch, iter.Val()); len(batch) == 200 {
			if err := c.Del(ctx, batch...); err != nil {
				return err
			}
			batch = batch[:0]
		}
	}
	if err := iter.Err(); err != nil {
		return err
	}
	return c.Del(ctx, batch...)
}

// Allow: INCR + EXPIRE NX (fixed window). Redis error → limiter cadangan, bukan fail-open.
func (c *Client) Allow(ctx context.Context, key string, limit int, window time.Duration) (bool, error) {
	pipe := c.rdb.TxPipeline()
	incr := pipe.Incr(ctx, key)
	pipe.ExpireNX(ctx, key, window)
	if _, err := pipe.Exec(ctx); err != nil {
		slog.Warn("rate limit redis gagal, memakai limiter in-memory", "err", err)
		if c.fallback == nil {
			return false, err
		}
		return c.fallback.Allow(ctx, key, limit, window)
	}
	return incr.Val() <= int64(limit), nil
}
