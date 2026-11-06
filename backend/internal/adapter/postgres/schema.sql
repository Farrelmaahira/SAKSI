CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL,
    name          TEXT NOT NULL,
    nip           TEXT NOT NULL DEFAULT '',
    village_id    TEXT NOT NULL DEFAULT '',
    village_name  TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contracts (
    id                  TEXT PRIMARY KEY,
    contract_number     TEXT NOT NULL UNIQUE,
    village_id          TEXT NOT NULL,
    village_name        TEXT NOT NULL,
    title               TEXT NOT NULL,
    category            TEXT NOT NULL,
    vendor_name         TEXT NOT NULL,
    amount              BIGINT NOT NULL DEFAULT 0,
    status              TEXT NOT NULL DEFAULT 'draft',
    sha256_hash         TEXT NOT NULL DEFAULT '',
    integrity_score     DOUBLE PRECISION NOT NULL DEFAULT 0,
    rating              DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    volume              TEXT NOT NULL DEFAULT '',
    fiscal_year         INT NOT NULL DEFAULT 2025,
    clauses_count       INT NOT NULL DEFAULT 0,
    mandatory_fulfilled INT NOT NULL DEFAULT 0,
    created_by          TEXT NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_village ON contracts(village_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

CREATE TABLE IF NOT EXISTS evidence_files (
    id              TEXT PRIMARY KEY,
    contract_id     TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    file_key        TEXT NOT NULL UNIQUE,
    file_name       TEXT NOT NULL,
    mime_type       TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    uploaded_by     TEXT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_contract ON evidence_files(contract_id);

