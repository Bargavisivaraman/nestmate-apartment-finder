// Budget fit calculator. Uses the common "30% of gross income on rent" rule
// plus roommate cost-splitting to assess affordability.

export interface BudgetInput {
  monthlyIncome: number;
  rent: number;
  roommates?: number; // number of OTHER people splitting (0 = live alone)
  monthlyDebts?: number;
}

export interface BudgetResult {
  sharePerPerson: number;
  rentToIncomeRatio: number; // 0..1+
  recommendedMaxRent: number; // 30% rule
  verdict: "EXCELLENT" | "GOOD" | "TIGHT" | "OVER_BUDGET";
  score: number; // 0..100
  message: string;
}

export function calculateBudgetFit(input: BudgetInput): BudgetResult {
  const income = Math.max(0, input.monthlyIncome);
  const people = Math.max(1, (input.roommates ?? 0) + 1);
  const sharePerPerson = Math.round(input.rent / people);
  const debts = input.monthlyDebts ?? 0;

  const recommendedMaxRent = Math.round(income * 0.3);
  const ratio = income > 0 ? sharePerPerson / income : Infinity;

  // Score: 100 when share is at/under 20% of income, dropping to 0 by 50%.
  let score = Math.round(100 - ((ratio - 0.2) / 0.3) * 100);
  if (debts > 0 && income > 0) {
    // Penalize when debt-to-income on top of rent is high.
    const dti = (sharePerPerson + debts) / income;
    if (dti > 0.43) score -= 15;
  }
  score = Math.max(0, Math.min(100, score));

  let verdict: BudgetResult["verdict"];
  let message: string;
  if (ratio <= 0.25) {
    verdict = "EXCELLENT";
    message = "Comfortably within budget. You'll have room to save.";
  } else if (ratio <= 0.3) {
    verdict = "GOOD";
    message = "Right at the recommended 30% threshold — a solid fit.";
  } else if (ratio <= 0.4) {
    verdict = "TIGHT";
    message = "Above the 30% rule. Doable, but budget carefully.";
  } else {
    verdict = "OVER_BUDGET";
    message = "This rent exceeds healthy affordability limits for your income.";
  }

  return {
    sharePerPerson,
    rentToIncomeRatio: Number.isFinite(ratio) ? Math.round(ratio * 1000) / 1000 : 0,
    recommendedMaxRent,
    verdict,
    score,
    message,
  };
}
