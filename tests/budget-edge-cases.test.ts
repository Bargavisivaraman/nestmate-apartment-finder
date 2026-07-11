import { describe, it, expect } from "vitest";
import { calculateBudgetFit } from "@/lib/budget";

// Complements tests/budget.test.ts, which covers the EXCELLENT/OVER_BUDGET
// verdicts, roommate splitting, the 30% rule, and score clamping.

describe("calculateBudgetFit edge cases", () => {
  it("rates 25-30% of income as GOOD", () => {
    // 1400 / 5000 = 0.28
    const r = calculateBudgetFit({ monthlyIncome: 5000, rent: 1400 });
    expect(r.verdict).toBe("GOOD");
  });

  it("rates 30-40% of income as TIGHT", () => {
    // 1750 / 5000 = 0.35
    const r = calculateBudgetFit({ monthlyIncome: 5000, rent: 1750 });
    expect(r.verdict).toBe("TIGHT");
  });

  it("applies a debt penalty when rent plus debts exceed 43% DTI", () => {
    const base = calculateBudgetFit({ monthlyIncome: 5000, rent: 1400 });
    const withDebt = calculateBudgetFit({
      monthlyIncome: 5000,
      rent: 1400,
      monthlyDebts: 1000, // (1400 + 1000) / 5000 = 0.48 > 0.43
    });
    expect(withDebt.score).toBe(base.score - 15);
  });

  it("does not penalize modest debt below the DTI threshold", () => {
    const base = calculateBudgetFit({ monthlyIncome: 5000, rent: 1400 });
    const withDebt = calculateBudgetFit({
      monthlyIncome: 5000,
      rent: 1400,
      monthlyDebts: 100, // (1400 + 100) / 5000 = 0.30
    });
    expect(withDebt.score).toBe(base.score);
  });

  it("handles zero income without crashing", () => {
    const r = calculateBudgetFit({ monthlyIncome: 0, rent: 1000 });
    expect(r.verdict).toBe("OVER_BUDGET");
    expect(r.rentToIncomeRatio).toBe(0); // Infinity is reported as 0
    expect(r.score).toBe(0);
  });

  it("negative income is clamped to zero income behavior", () => {
    const r = calculateBudgetFit({ monthlyIncome: -500, rent: 1000 });
    expect(r.recommendedMaxRent).toBe(0);
    expect(r.verdict).toBe("OVER_BUDGET");
  });
});
