import { afterEach, describe, expect, it, vi } from "vitest";

async function loadAi() {
  vi.resetModules();
  vi.stubEnv("OPENAI_API_KEY", "");
  return await import("@/lib/ai");
}

afterEach(() => vi.unstubAllEnvs());

describe("analyzeNeighborhood local fallback", () => {
  it("returns three pros, three cons, and a summary naming the place", async () => {
    const { analyzeNeighborhood } = await loadAi();

    const result = await analyzeNeighborhood("Silver Lake", "Los Angeles", "CA");

    expect(result.source).toBe("local");
    expect(result.pros).toHaveLength(3);
    expect(result.cons).toHaveLength(3);
    expect(result.summary).toContain("Silver Lake, Los Angeles, CA");
  });

  it("is deterministic for the same place", async () => {
    const { analyzeNeighborhood } = await loadAi();

    const a = await analyzeNeighborhood("Echo Park", "Los Angeles", "CA");
    const b = await analyzeNeighborhood("Echo Park", "Los Angeles", "CA");

    expect(a.pros).toEqual(b.pros);
    expect(a.cons).toEqual(b.cons);
  });

  it("skips blank location parts when building the place name", async () => {
    const { analyzeNeighborhood } = await loadAi();
    const result = await analyzeNeighborhood("", "Los Angeles", "CA");
    expect(result.summary).toContain("Los Angeles, CA");
    expect(result.summary).not.toContain(", Los Angeles, CA,");
  });
});
