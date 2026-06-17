import type { BudgetResult } from "@/lib/budget";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning";

export function evaluateLifestyleFitLabel(verdict: BudgetResult["verdict"]): {
  variant: BadgeVariant;
  label: string;
} {
  switch (verdict) {
    case "EXCELLENT":
      return { variant: "success", label: "Excellent fit" };
    case "GOOD":
      return { variant: "success", label: "Good fit" };
    case "TIGHT":
      return { variant: "warning", label: "Tight" };
    case "OVER_BUDGET":
      return { variant: "destructive", label: "Over budget" };
    default:
      return { variant: "secondary", label: "Unknown" };
  }
}

export function scoreVariant(score: number): BadgeVariant {
  if (score >= 70) return "success";
  if (score >= 45) return "warning";
  return "destructive";
}
