-- SAKSI.sql memakai tipe "datetime" (dari DBML). Postgres tidak punya tipe itu; cmd/migrate membuat domain yang sama.
-- Dipakai docker-compose sebelum SAKSI.sql dimuat.
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'datetime') THEN CREATE DOMAIN datetime AS timestamptz; END IF; END $$;
