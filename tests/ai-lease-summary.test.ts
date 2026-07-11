import { afterEach, describe, expect, it, vi } from "vitest";

// Force the deterministic local fallback: reload the module with no API key
// so the OpenAI client is never constructed.
async function loadAi() {
  vi.resetModules();
  vi.stubEnv("OPENAI_API_KEY", "");
  return await import("@/lib/ai");
}

afterEach(() => vi.unstubAllEnvs());

describe("summarizeLease local fallback", () => {
  it("reports the local source and extracts key terms", async () => {
    const { summarizeLease, aiEnabled } = await loadAi();
    expect(aiEnabled).toBe(false);

    const lease =
      "Rent is $2,400 per month for a 12 month term. A security deposit " +
      "of one month is required. Pet policy: cats allowed. Tenant pays utilities.";
    const result = await summarizeLease(lease);

    expect(result.source).toBe("local");
    expect(result.keyTerms).toContain("Rent referenced: $2,400");
    expect(result.keyTerms).toContain("12-month lease term");
    expect(result.keyTerms).toContain("Security deposit required");
    expect(result.keyTerms).toContain("Contains pet policy");
  });

  it("flags tenant-unfriendly clauses", async () => {
    const { summarizeLease } = await loadAi();

    const lease =
      "This lease will automatically renew. A non-refundable cleaning fee " +
      "applies, and a late fee is charged after the 3rd. Tenant may not sublet.";
    const result = await summarizeLease(lease);

    expect(result.redFlags).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Auto-renewal"),
        expect.stringContaining("non-refundable"),
        expect.stringContaining("Late-fee"),
        expect.stringContaining("Subletting"),
      ]),
    );
  });

  it("says so when no red flags are detected", async () => {
    const { summarizeLease } = await loadAi();
    const result = await summarizeLease("A simple friendly agreement.");
    expect(result.redFlags).toEqual([
      "No obvious red flags detected in the text.",
    ]);
  });
});
