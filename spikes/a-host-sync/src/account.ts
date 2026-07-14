export type SafeAccount = {
  accountType: "chatgpt" | "api_key" | "unknown";
  email?: string;
  planType?: string;
};

const FORBIDDEN_KEY = /token|secret|password|authorization|api[_-]?key/i;
const FORBIDDEN_VALUE = /(?:eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|\bsk-[A-Za-z0-9_-]{8,})/;

/** Rejects token-shaped host replies before mapping an allow-listed browser DTO. */
export function assertNoCredentials(value: unknown): void {
  if (typeof value === "string") {
    if (FORBIDDEN_VALUE.test(value)) throw new Error("Host response contains a token-shaped value");
    return;
  }
  if (Array.isArray(value)) return value.forEach(assertNoCredentials);
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_KEY.test(key)) throw new Error(`Host response contains forbidden field: ${key}`);
      assertNoCredentials(nested);
    }
  }
}

export function toSafeAccount(response: unknown): SafeAccount {
  assertNoCredentials(response);
  const root = response as { account?: Record<string, unknown> };
  const account = root?.account ?? {};
  const type = account.type === "chatgpt" || account.type === "api_key" ? account.type : "unknown";
  const result: SafeAccount = { accountType: type };
  if (typeof account.email === "string") result.email = account.email;
  if (typeof account.planType === "string") result.planType = account.planType;
  return result;
}
