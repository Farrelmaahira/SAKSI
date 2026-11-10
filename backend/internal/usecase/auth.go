package usecase

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"saksi-backend/internal/domain"
)

type Claims struct {
	UserID    int64           `json:"uid"`
	Role      domain.UserRole `json:"role"`
	VillageID *int64          `json:"villageId,omitempty"`
	ExpiresAt int64           `json:"exp"`
}

func HashPassword(plain string) (string, error) {
	if len(plain) < 8 {
		return "", errors.New("password minimum 8 characters")
	}
	b, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	return string(b), err
}

func CheckPassword(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}

func ValidEmail(address string) bool {
	parsed, err := mail.ParseAddress(address)
	return err == nil && parsed.Address == address
}

func IssueToken(userID int64, role domain.UserRole, villageID *int64, secret string, ttl time.Duration) (string, error) {
	claims := Claims{
		UserID:    userID,
		Role:      role,
		VillageID: villageID,
		ExpiresAt: time.Now().Add(ttl).Unix(),
	}
	payload, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	p64 := base64.RawURLEncoding.EncodeToString(payload)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(p64))
	sig := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	return fmt.Sprintf("%s.%s", p64, sig), nil
}

func VerifyToken(token string, secret string) (Claims, error) {
	var c Claims
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return c, errors.New("invalid token format")
	}
	p64, sig := parts[0], parts[1]
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(p64))
	expected := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	if !hmac.Equal([]byte(sig), []byte(expected)) {
		return c, errors.New("signature mismatch")
	}
	payload, err := base64.RawURLEncoding.DecodeString(p64)
	if err != nil {
		return c, err
	}
	if err := json.Unmarshal(payload, &c); err != nil {
		return c, err
	}
	if time.Now().Unix() > c.ExpiresAt {
		return c, errors.New("token expired")
	}
	return c, nil
}

