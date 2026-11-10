-- Akun demo yang tampil di halaman login (frontend/src/data/auth.ts seedAccounts).
-- Kata sandi semua akun: saksi123 (hash bcrypt cost 10 asli, tanpa bypass di kode).
-- Prasyarat: SAKSI.sql dan seed_villages.sql sudah dijalankan.
-- Idempoten: hanya INSERT ... ON CONFLICT DO NOTHING / WHERE NOT EXISTS; tidak pernah UPDATE/DELETE.
-- Bila email sudah ada dengan data lain, baris itu dibiarkan apa adanya (sandinya tidak ditimpa).
-- Jalankan: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backend/scripts/seed_demo.sql

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM villages WHERE nama = 'Desa Sukamaju') THEN
    RAISE EXCEPTION 'Desa Sukamaju belum ada: jalankan seed_villages.sql dulu';
  END IF;
END $$;

-- Wilayah kedua untuk akun inspektorat ("Punya 2 wilayah"). Wilayah pertama = wilayah Desa Sukamaju.
INSERT INTO regions (nama, jenis, provinsi)
SELECT 'Kabupaten Purbalingga', 'kabupaten', 'Jawa Tengah'
WHERE NOT EXISTS (SELECT 1 FROM regions WHERE nama = 'Kabupaten Purbalingga');

INSERT INTO users (nama, email, password_hash, status) VALUES
  ('Hendra Wijaya',      'kades@saksi.id',        '$2a$10$4Mp2EuQoGIld8MBSjXhpL.y4BWUvIavfpYpsldABEopUSUdc62ML2', 'aktif'),
  ('Rina Kartika',       'penyedia@saksi.id',     '$2a$10$4Mp2EuQoGIld8MBSjXhpL.y4BWUvIavfpYpsldABEopUSUdc62ML2', 'aktif'),
  ('Asep Saepudin',      'bpd@saksi.id',          '$2a$10$4Mp2EuQoGIld8MBSjXhpL.y4BWUvIavfpYpsldABEopUSUdc62ML2', 'aktif'),
  ('Dewi Lestari',       'inspektorat@saksi.id',  '$2a$10$4Mp2EuQoGIld8MBSjXhpL.y4BWUvIavfpYpsldABEopUSUdc62ML2', 'aktif'),
  ('Siti Rahma',         'warga@saksi.id',        '$2a$10$4Mp2EuQoGIld8MBSjXhpL.y4BWUvIavfpYpsldABEopUSUdc62ML2', 'aktif'),
  ('Budi Santoso Warga', 'budi.santoso@warga.id', '$2a$10$4Mp2EuQoGIld8MBSjXhpL.y4BWUvIavfpYpsldABEopUSUdc62ML2', 'aktif')
ON CONFLICT (email) DO NOTHING;

-- Peran berbasis desa (kades, bpd, warga) di Desa Sukamaju.
INSERT INTO user_roles (user_id, role, village_id)
SELECT u.id, x.role::user_roles_role_enum, v.id
FROM (VALUES ('kades@saksi.id', 'kades'), ('bpd@saksi.id', 'bpd'),
             ('warga@saksi.id', 'warga'), ('budi.santoso@warga.id', 'warga')) AS x(email, role)
JOIN users u ON u.email = x.email
JOIN LATERAL (SELECT id FROM villages WHERE nama = 'Desa Sukamaju' ORDER BY id LIMIT 1) v ON TRUE
WHERE NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role::text = x.role);

-- Penyedia: peran tanpa desa + profil usaha CV Maju Bersama yang terhubung ke akunnya.
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'penyedia' FROM users u
WHERE u.email = 'penyedia@saksi.id'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role = 'penyedia');

INSERT INTO counterparties (user_id, nama, jenis, npwp, alamat)
SELECT u.id, 'CV Maju Bersama', 'penyedia', '01.234.567.8-405.000', 'Jl. Raya Sukamaju No. 12, Banyumas'
FROM users u
WHERE u.email = 'penyedia@saksi.id'
  AND NOT EXISTS (SELECT 1 FROM counterparties k WHERE k.user_id = u.id);

-- Inspektorat: dua wilayah lewat user_roles.region_id (wilayah Desa Sukamaju + Kabupaten Purbalingga).
INSERT INTO user_roles (user_id, role, region_id)
SELECT u.id, 'inspektorat', r.id
FROM users u
JOIN regions r ON r.id IN (
  (SELECT region_id FROM villages WHERE nama = 'Desa Sukamaju' ORDER BY id LIMIT 1),
  (SELECT id FROM regions WHERE nama = 'Kabupaten Purbalingga' ORDER BY id LIMIT 1))
WHERE u.email = 'inspektorat@saksi.id'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role = 'inspektorat' AND ur.region_id = r.id);

-- Profil warga (desa domisili + no HP).
INSERT INTO warga_profiles (user_id, village_id, no_hp)
SELECT u.id, (SELECT id FROM villages WHERE nama = 'Desa Sukamaju' ORDER BY id LIMIT 1), x.no_hp
FROM (VALUES ('warga@saksi.id', '081255500142'), ('budi.santoso@warga.id', '081255500199')) AS x(email, no_hp)
JOIN users u ON u.email = x.email
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
