import { describe, expect, it, vi } from "vitest";
import { createProviderRequestBudget } from "./provider-budget.js";

describe("provider request budget", () => {
  it("counts successful and failed provider attempts without exceeding the ceiling", async () => {
    const fetchImpl = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("ok"))
      .mockRejectedValueOnce(new Error("provider unavailable"));
    const budget = createProviderRequestBudget(2, fetchImpl);

    await expect(budget.fetch("https://api.openai.com/v1/responses")).resolves.toBeInstanceOf(Response);
    await expect(budget.fetch("https://api.openai.com/v1/images/generations")).rejects.toThrow("provider unavailable");
    await expect(budget.fetch("https://api.openai.com/v1/audio/speech")).rejects.toThrow("Provider request ceiling reached (2)");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(budget.usedRequests()).toBe(2);
    expect(budget.remainingRequests()).toBe(0);
  });

  it("reserves concurrent requests synchronously", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response("ok"));
    const budget = createProviderRequestBudget(2, fetchImpl);
    const results = await Promise.allSettled([
      budget.fetch("https://api.openai.com/v1/images/generations"),
      budget.fetch("https://api.openai.com/v1/images/generations"),
      budget.fetch("https://api.openai.com/v1/images/generations"),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(2);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("rejects an invalid ceiling before constructing a provider client", () => {
    expect(() => createProviderRequestBudget(0)).toThrow("positive integer");
    expect(() => createProviderRequestBudget(1.5)).toThrow("positive integer");
  });
});
