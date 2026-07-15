import type { DatabaseSync } from "node:sqlite";

export function migrate(db: DatabaseSync) {
  db.exec(`CREATE TABLE IF NOT EXISTS workshop (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS app_setting (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS job (id TEXT PRIMARY KEY, workshop_id TEXT NOT NULL, kind TEXT NOT NULL, input_key TEXT NOT NULL UNIQUE, state TEXT NOT NULL, lease_until TEXT, attempts INTEGER NOT NULL DEFAULT 0, error TEXT, payload_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY(workshop_id) REFERENCES workshop(id));
CREATE TABLE IF NOT EXISTS artifact (id TEXT PRIMARY KEY, workshop_id TEXT NOT NULL, relative_path TEXT NOT NULL, mime_type TEXT NOT NULL, byte_count INTEGER NOT NULL, sha256 TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY(workshop_id) REFERENCES workshop(id));
CREATE TABLE IF NOT EXISTS workshop_state (workshop_id TEXT PRIMARY KEY, state_json TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY(workshop_id) REFERENCES workshop(id));
CREATE VIRTUAL TABLE IF NOT EXISTS evidence_fts USING fts5(workshop_id UNINDEXED, source_id UNINDEXED, chunk_id UNINDEXED, locator UNINDEXED, chunk_text, claim_text, tokenize='unicode61');`);
  try { db.exec("ALTER TABLE job ADD COLUMN error TEXT"); } catch { /* existing local database already has or does not need the column */ }
}
