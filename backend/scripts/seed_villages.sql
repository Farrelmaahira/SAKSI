-- Seed data wilayah dan desa untuk relasi referensial SAKSI
INSERT INTO regions (id, nama, jenis, provinsi)
VALUES (1, 'Kabupaten Banyumas', 'kabupaten', 'Jawa Tengah')
ON CONFLICT (id) DO NOTHING;

INSERT INTO villages (id, region_id, nama, kode_desa)
VALUES 
  (1, 1, 'Desa Sukamaju', '33.02.14.2001'),
  (2, 1, 'Desa Makmur', '33.02.14.2002')
ON CONFLICT (id) DO NOTHING;

-- Sinkronisasi auto increment sequence jika id dimasukkan manual
SELECT setval(pg_get_serial_sequence('regions', 'id'), coalesce(max(id), 1)) FROM regions;
SELECT setval(pg_get_serial_sequence('villages', 'id'), coalesce(max(id), 1)) FROM villages;

