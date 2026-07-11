import { describe, it, expect } from "vitest";
import { calculateCompatibility, type RoommatePrefs } from "@/lib/compatibility";

// Complements tests/compatibility.test.ts (identical profiles, lifestyle
// clashes, shared interests, score normalization).

const base: RoommatePrefs = {
  budgetMin: 1000,
  budgetMax: 1500,
  cleanliness: 3,
  sleepSchedule: "EARLY_BIRD",
  social: 3,
  smoking: false,
  pets: false,
  interests: "hiking, cooking",
};

function factor(result: ReturnType<typeof calculateCompatibility>, label: string) {
  const f = result.factors.find((x) => x.label === label);
  if (!f) throw new Error(`missing factor ${label}`);
  return f;
}

describe("calculateCompatibility edge cases", () => {
  it("scores FLEXIBLE against a fixed schedule as 75", () => {
    const r = calculateCompatibility(base, { ...base, sleepSchedule: "FLEXIBLE" });
    expect(factor(r, "Sleep schedule").score).toBe(75);
  });

  it("scores opposite fixed schedules as 30", () => {
    const r = calculateCompatibility(base, { ...base, sleepSchedule: "NIGHT_OWL" });
    expect(factor(r, "Sleep schedule").score).toBe(30);
  });

  it("scores disjoint budget ranges as zero overlap", () => {
    const r = calculateCompatibility(base, {
      ...base,
      budgetMin: 3000,
      budgetMax: 4000,
    });
    expect(factor(r, "Budget").score).toBe(0);
  });

  it("treats missing interests on either side as neutral", () => {
    const r = calculateCompatibility(base, { ...base, interests: "" });
    expect(factor(r, "Interests").score).toBe(50);
    expect(r.sharedInterests).toEqual([]);
  });

  it("halves the lifestyle score on a smoking mismatch alone", () => {
    const r = calculateCompatibility(base, { ...base, smoking: true });
    expect(factor(r, "Lifestyle").score).toBe(50);
  });

  it("drops lifestyle by 25 on a pets mismatch alone", () => {
    const r = calculateCompatibility(base, { ...base, pets: true });
    expect(factor(r, "Lifestyle").score).toBe(75);
  });

  it("interest matching is case-insensitive", () => {
    const r = calculateCompatibility(base, { ...base, interests: "HIKING, chess" });
    expect(r.sharedInterests).toEqual(["hiking"]);
  });
});
