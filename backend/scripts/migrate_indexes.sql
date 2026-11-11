-- Idempoten: aman dijalankan berulang di DB yang sudah berisi (cmd/migrate melewati SAKSI.sql bila tabel regions ada).
-- Jalankan: psql "$DATABASE_URL" -f scripts/migrate_indexes.sql
-- Untuk tabel besar di produksi, ganti dengan CREATE INDEX CONCURRENTLY (tidak bisa di dalam transaksi).
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id, id DESC);
CREATE INDEX IF NOT EXISTS idx_payment_terms_contract ON payment_terms (contract_id, urutan);
CREATE INDEX IF NOT EXISTS idx_work_progress_contract ON work_progress (contract_id, waktu DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_objek ON audit_logs (jenis_objek, id_objek);
CREATE INDEX IF NOT EXISTS idx_audit_logs_aktor ON audit_logs (aktor_user_id);
