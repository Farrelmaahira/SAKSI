-- Idempoten. Agar verifikasi segel yang tidak cocok ikut tercatat (seal_id NULL + hash yang dicari).
-- Jalankan: psql "$DATABASE_URL" -f scripts/migrate_seal_verifications.sql
ALTER TABLE seal_verifications ALTER COLUMN seal_id DROP NOT NULL;
ALTER TABLE seal_verifications ADD COLUMN IF NOT EXISTS hash_dicari varchar(64);
CREATE INDEX IF NOT EXISTS idx_seal_verifications_seal ON seal_verifications (seal_id);
