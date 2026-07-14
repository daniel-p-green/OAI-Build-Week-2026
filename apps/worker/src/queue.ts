import type { DatabaseSync } from "node:sqlite";

export type Job = { id: string; workshopId: string; kind: string; inputKey: string; state: string; attempts: number; payload: unknown };
const now = () => new Date().toISOString();
export function enqueue(db: DatabaseSync, job: Omit<Job, "state" | "attempts">) {
  const existing = db.prepare("SELECT id FROM job WHERE input_key = ?").get(job.inputKey) as { id: string } | undefined;
  if (existing) return existing.id;
  db.prepare("INSERT INTO job (id, workshop_id, kind, input_key, state, payload_json, created_at, updated_at) VALUES (?, ?, ?, ?, 'queued', ?, ?, ?)").run(job.id, job.workshopId, job.kind, job.inputKey, JSON.stringify(job.payload), now(), now());
  return job.id;
}
export function leaseNext(db: DatabaseSync, leaseMs = 30_000): Job | null {
  const row = db.prepare("SELECT * FROM job WHERE state IN ('queued','retrying') OR (state='running' AND lease_until < ?) ORDER BY created_at LIMIT 1").get(now()) as Record<string, unknown> | undefined;
  if (!row) return null;
  const leaseUntil = new Date(Date.now() + leaseMs).toISOString();
  db.prepare("UPDATE job SET state='running', attempts=attempts+1, lease_until=?, updated_at=? WHERE id=?").run(leaseUntil, now(), String(row.id));
  return { id: String(row.id), workshopId: String(row.workshop_id), kind: String(row.kind), inputKey: String(row.input_key), state: "running", attempts: Number(row.attempts) + 1, payload: JSON.parse(String(row.payload_json)) };
}
export function finishJob(db: DatabaseSync, id: string, state: "succeeded" | "failed", error?: string) {
  db.prepare("UPDATE job SET state=?, error=?, lease_until=NULL, updated_at=? WHERE id=?").run(state, error ?? null, now(), id);
}
