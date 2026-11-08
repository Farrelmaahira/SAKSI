package usecase_test

import (
	"testing"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

func TestUserRole_CanSelfRegister(t *testing.T) {
	tests := []struct {
		role  domain.UserRole
		allow bool
	}{
		{domain.RoleKades, true},
		{domain.RolePenyedia, true},
		{domain.RoleWarga, true},
		{domain.RoleBPD, false},
		{domain.RoleInspektorat, false},
		{domain.RoleAdminDaerah, false},
		{domain.UserRole("superadmin"), false},
		{domain.UserRole(""), false},
	}

	for _, tt := range tests {
		t.Run(string(tt.role), func(t *testing.T) {
			if got := tt.role.CanSelfRegister(); got != tt.allow {
				t.Errorf("role %q CanSelfRegister() = %v; want %v", tt.role, got, tt.allow)
			}
		})
	}
}

func TestTokenLifecycle_Int64ID(t *testing.T) {
	secret := "test-secret-key-at-least-16chars"
	userID := int64(42)
	villageID := int64(101)

	token, err := usecase.IssueToken(userID, domain.RoleKades, &villageID, secret, 1*time.Hour)
	if err != nil {
		t.Fatalf("unexpected error issuing token: %v", err)
	}

	claims, err := usecase.VerifyToken(token, secret)
	if err != nil {
		t.Fatalf("unexpected error verifying token: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("got UserID %d, want %d", claims.UserID, userID)
	}
	if claims.Role != domain.RoleKades {
		t.Errorf("got Role %s, want %s", claims.Role, domain.RoleKades)
	}
	if claims.VillageID == nil || *claims.VillageID != villageID {
		t.Errorf("got VillageID %v, want %d", claims.VillageID, villageID)
	}
}

