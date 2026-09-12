-- ============================================================
-- TRACE-X RELATIONAL FORENSIC SCHEMA
-- Designed for Supabase PostgreSQL
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT UNIQUE NOT NULL,
    time_step INTEGER NOT NULL,
    known_label VARCHAR(16) NOT NULL, -- 'ILLICIT', 'LICIT', 'UNKNOWN'
    prediction VARCHAR(16),           -- 'ILLICIT', 'LICIT', NULL
    prediction_probability DOUBLE PRECISION,
    risk_score INTEGER,               -- 0 to 100
    risk_level VARCHAR(16),           -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    in_degree INTEGER DEFAULT 0,
    out_degree INTEGER DEFAULT 0,
    total_degree INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_txid ON transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_known_label ON transactions(known_label);
CREATE INDEX IF NOT EXISTS idx_transactions_prediction ON transactions(prediction);
CREATE INDEX IF NOT EXISTS idx_transactions_risk_score ON transactions(risk_score);
CREATE INDEX IF NOT EXISTS idx_transactions_risk_level ON transactions(risk_level);
CREATE INDEX IF NOT EXISTS idx_transactions_time_step ON transactions(time_step);

-- Table: transaction_features
-- JSON text storage for the 165 normalized feature columns
CREATE TABLE IF NOT EXISTS transaction_features (
    transaction_id BIGINT PRIMARY KEY REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    features TEXT NOT NULL,
    feature_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: transaction_edges
CREATE TABLE IF NOT EXISTS transaction_edges (
    id BIGSERIAL PRIMARY KEY,
    source_transaction_id BIGINT NOT NULL,
    destination_transaction_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_edge UNIQUE (source_transaction_id, destination_transaction_id)
);

-- Indexes for ultra-fast 1-hop & 2-hop graph queries
CREATE INDEX IF NOT EXISTS idx_edges_source ON transaction_edges(source_transaction_id);
CREATE INDEX IF NOT EXISTS idx_edges_destination ON transaction_edges(destination_transaction_id);

-- Table: model_predictions
CREATE TABLE IF NOT EXISTS model_predictions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    model_name VARCHAR(64) NOT NULL,
    prediction VARCHAR(16) NOT NULL,
    probability DOUBLE PRECISION NOT NULL,
    risk_score INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_txid ON model_predictions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_predictions_model ON model_predictions(model_name);

-- Table: model_metrics
CREATE TABLE IF NOT EXISTS model_metrics (
    id BIGSERIAL PRIMARY KEY,
    model_name VARCHAR(64) NOT NULL,
    precision DOUBLE PRECISION NOT NULL,
    recall DOUBLE PRECISION NOT NULL,
    f1 DOUBLE PRECISION NOT NULL,
    roc_auc DOUBLE PRECISION NOT NULL,
    pr_auc DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    evaluation_strategy VARCHAR(128) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: investigation_cases
CREATE TABLE IF NOT EXISTS investigation_cases (
    id BIGSERIAL PRIMARY KEY,
    case_name VARCHAR(256) NOT NULL,
    description TEXT,
    status VARCHAR(32) DEFAULT 'OPEN', -- 'OPEN', 'UNDER REVIEW', 'CLOSED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: case_transactions
CREATE TABLE IF NOT EXISTS case_transactions (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES investigation_cases(id) ON DELETE CASCADE,
    transaction_id BIGINT NOT NULL,
    notes TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_case_tx UNIQUE (case_id, transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_case_transactions_case ON case_transactions(case_id);
CREATE INDEX IF NOT EXISTS idx_case_transactions_tx ON case_transactions(transaction_id);

-- Table: investigation_notes
CREATE TABLE IF NOT EXISTS investigation_notes (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES investigation_cases(id) ON DELETE CASCADE,
    transaction_id BIGINT,
    note TEXT NOT NULL,
    author VARCHAR(64) DEFAULT 'Investigator',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investigation_notes_case ON investigation_notes(case_id);

-- Table: ingestion_runs
CREATE TABLE IF NOT EXISTS ingestion_runs (
    id BIGSERIAL PRIMARY KEY,
    dataset_name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL, -- 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
    rows_processed BIGINT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT
);
