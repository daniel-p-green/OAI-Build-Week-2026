export type ProviderRequestBudget = {
  fetch: typeof fetch;
  maxRequests: number;
  usedRequests: () => number;
  remainingRequests: () => number;
};

export function createProviderRequestBudget(maxRequests: number, fetchImpl: typeof fetch = fetch): ProviderRequestBudget {
  if (!Number.isSafeInteger(maxRequests) || maxRequests < 1) throw new Error("Provider request ceiling must be a positive integer.");
  let used = 0;
  return {
    maxRequests,
    usedRequests: () => used,
    remainingRequests: () => maxRequests - used,
    fetch: async (input, init) => {
      if (used >= maxRequests) throw new Error(`Provider request ceiling reached (${maxRequests}). Refusing another paid request.`);
      used += 1;
      return fetchImpl(input, init);
    },
  };
}
