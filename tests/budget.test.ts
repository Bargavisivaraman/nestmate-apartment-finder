import { describe, it, expect } from "vitest";
import { calculateBudgetFit } from "@/lib/budget";

describe("calculateBudgetFit", () => {
  it("rates rent under 25% of income as excellent", () => {
    const r = calculateBudgetFit({ monthlyIncome: 6000, rent: 1200 });
    expect(r.verdict).toBe("EXCELLENT");
    expect(r.score).toBeGreaterThan(80);
    expect(r.sharePerPerson).toBe(1200);
  });

  it("splits rent across roommates", () => {
    const r = calculateBudgetFit({ monthlyIncome: 4000, rent: 2400, roommates: 2 });
    // 3 people total -> 800 each
    expect(r.sharePerPerson).toBe(800);
    expect(r.rentToIncomeRatio).toBeCloseTo(0.2, 2);
  });

  it("flags rent over 40% of income as over budget", () => {
    const r = calculateBudgetFit({ monthlyIncome: 3000, rent: 1500 });
    expect(r.verdict).toBe("OVER_BUDGET");
    expect(r.score).toBeLessThan(40);
  });

  it("computes the 30% recommended max rent", () => {
    const r = calculateBudgetFit({ monthlyIncome: 5000, rent: 1500 });
    expect(r.recommendedMaxRent).toBe(1500);
    expect(r.verdict).toBe("GOOD");
  });

  it("clamps the score between 0 and 100", () => {
    const low = calculateBudgetFit({ monthlyIncome: 1000, rent: 3000 });
    const high = calculateBudgetFit({ monthlyIncome: 100000, rent: 1000 });
    expect(low.score).toBeGreaterThanOrEqual(0);
    expect(high.score).toBeLessThanOrEqual(100);
  });
});
