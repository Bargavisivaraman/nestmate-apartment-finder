import { afterEach, describe, expect, it, vi } from "vitest";

async function loadAi() {
  vi.resetModules();
  vi.stubEnv("OPENAI_API_KEY", "");
  return await import("@/lib/ai");
}

afterEach(() => vi.unstubAllEnvs());

const base = { apartment: "2BR in Silver Lake", rent: 2000, budget: 3000, preferences: "" };

describe("evaluateLifestyleFit local fallback", () => {
  it("calls rent well under budget a strong fit", async () => {
    const { evaluateLifestyleFit } = await loadAi();
    const result = await evaluateLifestyleFit(base); // ratio 0.67

    expect(result.source).toBe("local");
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.verdict).toContain("Strong fit");
    expect(result.reasons[0]).toContain("comfortably inside");
  });

  it("calls rent over budget a weak fit", async () => {
    const { evaluateLifestyleFit } = await loadAi();
    const result = await evaluateLifestyleFit({ ...base, rent: 4000 }); // ratio 1.33

    expect(result.score).toBeLessThan(50);
    expect(result.verdict).toContain("Weak fit");
    expect(result.reasons[0]).toContain("exceeds your budget");
  });

  it("keeps the score within 5..98 even for extreme inputs", async () => {
    const { evaluateLifestyleFit } = await loadAi();
    const low = await evaluateLifestyleFit({ ...base, rent: 100000 });
    const high = await evaluateLifestyleFit({ ...base, rent: 1 });
    expect(low.score).toBeGreaterThanOrEqual(5);
    expect(high.score).toBeLessThanOrEqual(98);
  });

  it("tailors reasons to stated preferences", async () => {
    const { evaluateLifestyleFit } = await loadAi();
    const result = await evaluateLifestyleFit({
      ...base,
      preferences: "quiet building, pet friendly, short commute",
    });

    const text = result.reasons.join(" ");
    expect(text).toContain("pet policy");
    expect(text).toContain("noise levels");
    expect(text).toContain("commute");
  });

  it("treats a zero budget as over budget", async () => {
    const { evaluateLifestyleFit } = await loadAi();
    const result = await evaluateLifestyleFit({ ...base, budget: 0 });
    expect(result.reasons[0]).toContain("exceeds your budget");
  });
});
