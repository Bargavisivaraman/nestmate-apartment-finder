import { describe, it, expect } from "vitest";
import { calculateCompatibility, type RoommatePrefs } from "@/lib/compatibility";

const base: RoommatePrefs = {
  budgetMin: 800,
  budgetMax: 1600,
  cleanliness: 4,
  sleepSchedule: "FLEXIBLE",
  social: 3,
  smoking: false,
  pets: false,
  interests: "cooking, hiking, music",
};

describe("calculateCompatibility", () => {
  it("scores an identical profile very high", () => {
    const r = calculateCompatibility(base, { ...base });
    expect(r.score).toBeGreaterThanOrEqual(85);
    expect(r.rating).toBe("Excellent");
  });

  it("penalizes opposite sleep schedules and lifestyle clashes", () => {
    const opposite: RoommatePrefs = {
      ...base,
      budgetMin: 2500,
      budgetMax: 4000,
      cleanliness: 1,
      sleepSchedule: "NIGHT_OWL",
      smoking: true,
      pets: true,
      interests: "skydiving, clubbing",
    };
    const compatible: RoommatePrefs = { ...base, sleepSchedule: "EARLY_BIRD" };
    const low = calculateCompatibility(compatible, opposite);
    const high = calculateCompatibility(base, { ...base });
    expect(low.score).toBeLessThan(high.score);
  });

  it("surfaces shared interests", () => {
    const r = calculateCompatibility(base, {
      ...base,
      interests: "cooking, gaming, hiking",
    });
    expect(r.sharedInterests).toContain("cooking");
    expect(r.sharedInterests).toContain("hiking");
  });

  it("always returns a normalized 0..100 score", () => {
    const r = calculateCompatibility(base, {
      ...base,
      budgetMin: 5000,
      budgetMax: 9000,
      cleanliness: 1,
      smoking: true,
    });
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.factors.length).toBeGreaterThan(0);
  });
});
