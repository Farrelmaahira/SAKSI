package postgres

import (
	"context"
	"fmt"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

func (s *Store) UpdateProfile(ctx context.Context, p usecase.UpdateProfileParams) (domain.User, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.User{}, err
	}
	defer tx.Rollback(ctx)

	changed := []string{} // hanya nama field yang dicatat; nilai (no HP, NPWP) tidak masuk audit log
	if p.Nama != nil {
		if _, err := tx.Exec(ctx, `UPDATE users SET nama = $1 WHERE id = $2`, *p.Nama, p.UserID); err != nil {
			return domain.User{}, err
		}
		changed = append(changed, "nama")
	}
	if p.NoHP != nil {
		tag, err := tx.Exec(ctx, `UPDATE warga_profiles SET no_hp = $1 WHERE user_id = $2`, *p.NoHP, p.UserID)
		if err != nil {
			return domain.User{}, err
		}
		if tag.RowsAffected() == 0 {
			if _, err := tx.Exec(ctx, `INSERT INTO warga_profiles (user_id, no_hp) VALUES ($1, $2)`, p.UserID, *p.NoHP); err != nil {
				return domain.User{}, err
			}
		}
		changed = append(changed, "noHp")
	}
	if p.Usaha != nil {
		var npwp *string
		if p.Usaha.NPWP != "" {
			npwp = &p.Usaha.NPWP
		}
		tag, err := tx.Exec(ctx, `UPDATE counterparties SET nama = $1, npwp = $2, alamat = $3 WHERE user_id = $4`,
			p.Usaha.Nama, npwp, p.Usaha.Alamat, p.UserID)
		if err != nil {
			return domain.User{}, err
		}
		if tag.RowsAffected() == 0 {
			return domain.User{}, fmt.Errorf("%w: akun ini belum punya profil usaha", domain.ErrInvalidInput)
		}
		changed = append(changed, "usaha")
	}
	if len(changed) > 0 {
		if err := insertAuditLogObj(ctx, tx, p.UserID, "user.profile_update", "user", p.UserID, nil, map[string]any{"fields": changed}, p.IP); err != nil {
			return domain.User{}, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.User{}, err
	}
	return s.UserByID(ctx, p.UserID)
}

func (s *Store) ChangePassword(ctx context.Context, userID int64, newHash, ip string) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	tag, err := tx.Exec(ctx, `UPDATE users SET password_hash = $1 WHERE id = $2`, newHash, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrNotFound
	}
	if err := insertAuditLogObj(ctx, tx, userID, "user.password_change", "user", userID, nil, nil, ip); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (s *Store) CreatePasswordReset(ctx context.Context, userID int64, tokenHash string, ttl time.Duration) error {
	// Kedaluwarsa dihitung di DB agar tidak bergantung zona waktu kolom "datetime".
	_, err := s.db.Exec(ctx, `INSERT INTO password_resets (user_id, token, kedaluwarsa) VALUES ($1, $2, NOW() + make_interval(secs => $3))`,
		userID, tokenHash, ttl.Seconds())
	return err
}

func (s *Store) ResetPassword(ctx context.Context, tokenHash, newHash, ip string) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	var userID int64
	if err := tx.QueryRow(ctx, `
		SELECT user_id FROM password_resets
		WHERE token = $1 AND dipakai_pada IS NULL AND kedaluwarsa > NOW() FOR UPDATE`, tokenHash).Scan(&userID); err != nil {
		return notFound(err)
	}
	if _, err := tx.Exec(ctx, `UPDATE users SET password_hash = $1 WHERE id = $2`, newHash, userID); err != nil {
		return err
	}
	// Semua token reset user ini dibatalkan, termasuk yang barusan dipakai.
	if _, err := tx.Exec(ctx, `UPDATE password_resets SET dipakai_pada = NOW() WHERE user_id = $1 AND dipakai_pada IS NULL`, userID); err != nil {
		return err
	}
	if err := insertAuditLogObj(ctx, tx, userID, "user.password_reset", "user", userID, nil, nil, ip); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
