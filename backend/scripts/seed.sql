-- Seed Data: Pemerintahan Desa Sukamaju, Kabupaten Banyumas
-- Realistis berdasarkan APBDes TA 2025 dan Permendagri No. 20/2018

INSERT INTO users (id, email, password_hash, role, name, nip, village_id, village_name, created_at, updated_at) VALUES
('usr-kades-01', 'kades.sukamaju@desa.id', '$2a$10$wN2J.k/2V076K06Qo.18A.4jJgU3b1bF.R2tF1mN4t21wYvBqKxOq', 'kades', 'H. Sudirman, S.IP', '197204121998031004', 'vil-3302142001', 'Desa Sukamaju', now(), now()),
('usr-bpd-01', 'bpd.pengawas@desa.id', '$2a$10$wN2J.k/2V076K06Qo.18A.4jJgU3b1bF.R2tF1mN4t21wYvBqKxOq', 'bpd', 'Drs. Bambang Haryanto', 'BPD-330214-001', 'vil-3302142001', 'Desa Sukamaju', now(), now()),
('usr-audit-01', 'inspektorat.audit@banyumaskab.go.id', '$2a$10$wN2J.k/2V076K06Qo.18A.4jJgU3b1bF.R2tF1mN4t21wYvBqKxOq', 'inspektorat', 'Ir. Siti Rahmawati, M.M', '198109232005012008', '', 'Kabupaten Banyumas', now(), now())
ON CONFLICT (id) DO NOTHING;

-- INSERT INTO contracts (
--     id, contract_number, village_id, village_name, title, category, vendor_name, amount, status,
--     sha256_hash, integrity_score, rating, volume, fiscal_year, clauses_count, mandatory_fulfilled, created_by, created_at, updated_at
-- ) VALUES
-- ('cnt-083009', 'SPK/33.02.14/2025/083009', 'vil-3302142001', 'Desa Sukamaju', 'Pembangunan Jalan Usaha Tani Dusun II', 'Pengadaan Fisik', 'PT Maju Bangun Mandiri', 124839000, 'sealed', 'a3f5b78d91c2e4567890123456789abcdef0123456789abcdef0123456789abc', 98.5, 5.0, '2.310 meter', 2025, 8, 8, 'usr-kades-01', now(), now()),
-- ('cnt-083001', 'SPK/33.02.14/2025/083001', 'vil-3302142001', 'Desa Sukamaju', 'Pengadaan Bibit Jagung Hibrida & Pupuk Organik', 'Pemberdayaan Tani', 'CV Tani Makmur Sejahtera', 92662000, 'audit_complete', 'b4c6e89f02d3f567890123456789abcdef0123456789abcdef0123456789abd', 94.0, 4.8, '1.230 paket', 2025, 8, 8, 'usr-kades-01', now(), now()),
-- ('cnt-083004', 'SPK/33.02.14/2025/083004', 'vil-3302142001', 'Desa Sukamaju', 'Renovasi Balai Pertemuan & Posyandu Melati', 'Infrastruktur Sosial', 'Swakelola Warga RW 03', 74048000, 'under_review', 'c5d7f01a13e4067890123456789abcdef0123456789abcdef0123456789abe', 87.5, 4.7, '812 m²', 2025, 8, 7, 'usr-kades-01', now(), now()),
-- ('cnt-083002', 'SPK/33.02.14/2025/083002', 'vil-3302142001', 'Desa Sukamaju', 'Pemasangan Penerangan Jalan Tenaga Surya', 'Pengadaan Fasilitas', 'CV Mandiri Cahaya Listrik', 62820000, 'sealed', 'd6e8012b24f517890123456789abcdef0123456789abcdef0123456789abf', 96.0, 4.5, '645 titik', 2025, 8, 8, 'usr-kades-01', now(), now()),
-- ('cnt-083005', 'SPK/33.02.14/2025/083005', 'vil-3302142001', 'Desa Sukamaju', 'Kerja Sama Pengelolaan Air Bersih Tirta Jaya', 'Unit BUMDes', 'BUMDes Tirta Sukamaju', 48724000, 'audit_complete', 'e7f9123c35062890123456789abcdef0123456789abcdef0123456789ac0', 92.0, 4.5, '572 SR', 2025, 8, 8, 'usr-kades-01', now(), now())
-- ON CONFLICT (id) DO NOTHING;

