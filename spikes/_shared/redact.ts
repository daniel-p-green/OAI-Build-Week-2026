const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9_-]{8,}/g,
  /(?:api[_-]?key|authorization|bearer)\s*[:=]\s*["']?[^\s,"'}]+/gi,
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
];

export function redact(value: unknown, secrets: readonly string[] = []): unknown {
  if (typeof value === "string") {
    let result = value;
    for (const secret of secrets.filter(Boolean)) {
      result = result.replaceAll(secret, "[REDACTED]");
    }
    for (const pattern of SECRET_PATTERNS) result = result.replace(pattern, "[REDACTED]");
    result = result.replace(/bearer\s+\[REDACTED\]/gi, "[REDACTED]");
    return result;
  }
  if (Array.isArray(value)) return value.map((item) => redact(item, secrets));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        /token|secret|password|api[_-]?key/i.test(key) ? "[REDACTED]" : redact(item, secrets),
      ]),
    );
  }
  return value;
}
