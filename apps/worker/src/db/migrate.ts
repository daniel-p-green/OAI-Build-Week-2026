import type { DatabaseSync } from "node:sqlite";

export function migrate(db: DatabaseSync) {
  db.exec(`CREATE TABLE IF NOT EXISTS workshop (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS job (id TEXT PRIMARY KEY, workshop_id TEXT NOT NULL, kind TEXT NOT NULL, input_key TEXT NOT NULL UNIQUE, state TEXT NOT NULL, lease_until TEXT, attempts INTEGER NOT NULL DEFAULT 0, payload_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY(workshop_id) REFERENCES workshop(id));
CREATE TABLE IF NOT EXISTS artifact (id TEXT PRIMARY KEY, workshop_id TEXT NOT NULL, relative_path TEXT NOT NULL, mime_type TEXT NOT NULL, byte_count INTEGER NOT NULL, sha256 TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY(workshop_id) REFERENCES workshop(id));`);
}
