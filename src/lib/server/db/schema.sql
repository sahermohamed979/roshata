-- Roshteh Central Medicine PostgreSQL Database Schema
-- Version: 1.0 (Phase 6)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Medicine Sources (Regulatory bodies, formularies, MOH, EDA)
CREATE TABLE IF NOT EXISTS medicine_sources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) UNIQUE NOT NULL,
    description TEXT,
    licensing_info TEXT,
    is_official BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Central Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
    id VARCHAR(64) PRIMARY KEY,
    trade_name_ar VARCHAR(255) NOT NULL,
    trade_name_en VARCHAR(255) NOT NULL,
    active_ingredient VARCHAR(255) NOT NULL,
    dosage_form VARCHAR(128) NOT NULL,
    strength VARCHAR(128) NOT NULL,
    category VARCHAR(128),
    barcode VARCHAR(64) UNIQUE,
    eda_registration_no VARCHAR(128),
    price DECIMAL(10, 2),
    manufacturer VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    deactivation_reason TEXT,
    version_id INTEGER DEFAULT 1,
    source_id VARCHAR(64) REFERENCES medicine_sources(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medicines_trade_ar ON medicines USING gin (trade_name_ar gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medicines_trade_en ON medicines USING gin (trade_name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medicines_active_ing ON medicines USING gin (active_ingredient gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medicines_barcode ON medicines(barcode);
CREATE INDEX IF NOT EXISTS idx_medicines_version ON medicines(version_id);
CREATE INDEX IF NOT EXISTS idx_medicines_active ON medicines(is_active);

-- 3. Medicine Database Published Versions
CREATE TABLE IF NOT EXISTS medicine_versions (
    version_number INTEGER PRIMARY KEY,
    previous_version INTEGER,
    release_notes TEXT,
    changes_count INTEGER DEFAULT 0,
    checksum VARCHAR(64),
    published_by VARCHAR(128) DEFAULT 'admin',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Medicine Changes (Audit Log for Incremental Sync)
CREATE TABLE IF NOT EXISTS medicine_changes (
    id VARCHAR(64) PRIMARY KEY,
    version_number INTEGER,
    action VARCHAR(32) NOT NULL, -- 'create', 'update', 'deactivate'
    medicine_id VARCHAR(64) NOT NULL REFERENCES medicines(id),
    delta_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_changes_version ON medicine_changes(version_number);
CREATE INDEX IF NOT EXISTS idx_changes_medicine ON medicine_changes(medicine_id);

-- 5. Medicine Imports (Bulk CSV / EDA imports tracking)
CREATE TABLE IF NOT EXISTS medicine_imports (
    id VARCHAR(64) PRIMARY KEY,
    source_id VARCHAR(64) REFERENCES medicine_sources(id),
    file_name VARCHAR(255),
    items_count INTEGER DEFAULT 0,
    status VARCHAR(32) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    imported_by VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Doctor Medicine Suggestions (Crowdsourced formulary suggestions)
CREATE TABLE IF NOT EXISTS medicine_suggestions (
    id VARCHAR(64) PRIMARY KEY,
    doctor_id VARCHAR(64) NOT NULL,
    doctor_name VARCHAR(128),
    clinic_name VARCHAR(128),
    trade_name_ar VARCHAR(255) NOT NULL,
    trade_name_en VARCHAR(255) NOT NULL,
    active_ingredient VARCHAR(255),
    dosage_form VARCHAR(128),
    strength VARCHAR(128),
    barcode VARCHAR(64),
    clinical_notes TEXT,
    status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewer_notes TEXT,
    reviewed_by VARCHAR(128),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suggestions_status ON medicine_suggestions(status);

-- 7. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
