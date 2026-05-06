-- 0001_init.sql
-- Tables: legal_documents, consents, leads, delivery_attempts, events
-- Per specs/001-lead-funnel-seniors/data-model.md

CREATE TABLE IF NOT EXISTS legal_documents (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  kind          TEXT NOT NULL CHECK (kind IN ('cgu','pdc','mentions')),
  version       TEXT NOT NULL,
  effective_at  TEXT NOT NULL,
  published_at  TEXT NOT NULL,
  body_path     TEXT NOT NULL,
  body_hash     TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('draft','published','retired')),
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (kind, version)
);

CREATE INDEX IF NOT EXISTS idx_legal_kind_status
  ON legal_documents (kind, status);

CREATE TABLE IF NOT EXISTS leads (
  id                          TEXT PRIMARY KEY,
  nom                         TEXT NOT NULL,
  nom_normalized              TEXT NOT NULL,
  prenom                      TEXT NOT NULL,
  prenom_normalized           TEXT NOT NULL,
  date_naissance              TEXT NOT NULL,
  code_postal                 TEXT NOT NULL,
  email                       TEXT,
  telephone                   TEXT,
  regime                      INTEGER,
  niveau_garantie             TEXT,
  situation_actuelle          TEXT,
  date_effet_souhaitee        TEXT,
  conjoint_present            INTEGER CHECK (conjoint_present IN (0,1)),
  conjoint_date_naissance     TEXT,
  enfants_count               INTEGER NOT NULL DEFAULT 0 CHECK (enfants_count >= 0 AND enfants_count <= 6),
  enfants_dates_naissance     TEXT,
  campaign_id                 TEXT NOT NULL CHECK (campaign_id IN ('senior','under55_family','under55_solo')),
  age_at_submission           INTEGER NOT NULL,
  source_path                 TEXT NOT NULL,
  utm_source                  TEXT,
  utm_medium                  TEXT,
  utm_campaign                TEXT,
  utm_term                    TEXT,
  utm_content                 TEXT,
  ip_address                  TEXT NOT NULL,
  user_agent                  TEXT NOT NULL,
  delivery_status             TEXT NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending','delivered','delivered_mock','dead_letter','rejected_4xx')),
  submitted_at                TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at                  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_dedup
  ON leads (nom_normalized, prenom_normalized, date_naissance, code_postal, submitted_at);

CREATE INDEX IF NOT EXISTS idx_leads_delivery_status
  ON leads (delivery_status);

CREATE INDEX IF NOT EXISTS idx_leads_submitted_at
  ON leads (submitted_at);

CREATE TABLE IF NOT EXISTS consents (
  id                              TEXT PRIMARY KEY,
  lead_id                         TEXT NOT NULL UNIQUE,
  purpose_data_processing         INTEGER NOT NULL CHECK (purpose_data_processing IN (0,1)),
  purpose_courtier_transmission   INTEGER NOT NULL CHECK (purpose_courtier_transmission = 1),
  cgu_document_id                 INTEGER NOT NULL,
  pdc_document_id                 INTEGER NOT NULL,
  cgu_version                     TEXT NOT NULL,
  pdc_version                     TEXT NOT NULL,
  cgu_body_hash                   TEXT NOT NULL,
  pdc_body_hash                   TEXT NOT NULL,
  ip_address                      TEXT NOT NULL,
  user_agent                      TEXT NOT NULL,
  granted_at                      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id)         REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (cgu_document_id) REFERENCES legal_documents(id),
  FOREIGN KEY (pdc_document_id) REFERENCES legal_documents(id)
);

CREATE TABLE IF NOT EXISTS delivery_attempts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id         TEXT NOT NULL,
  attempt_no      INTEGER NOT NULL,
  status          TEXT NOT NULL
    CHECK (status IN ('pending','running','success','retry','failed_4xx','dead_letter')),
  mode            TEXT NOT NULL CHECK (mode IN ('mock','http')),
  http_status     INTEGER,
  error_message   TEXT,
  payload_hash    TEXT NOT NULL,
  started_at      TEXT,
  finished_at     TEXT,
  next_retry_at   TEXT,
  created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attempts_lead
  ON delivery_attempts (lead_id);

CREATE INDEX IF NOT EXISTS idx_attempts_next_retry
  ON delivery_attempts (status, next_retry_at);

CREATE TABLE IF NOT EXISTS events (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  event              TEXT NOT NULL,
  lead_id            TEXT,
  step_index         INTEGER,
  client_session_id  TEXT,
  metadata           TEXT,
  created_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_events_event_time
  ON events (event, created_at);
