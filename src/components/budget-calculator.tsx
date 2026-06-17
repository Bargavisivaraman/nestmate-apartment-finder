"use client";

import { useState } from "react";
import { calculateBudgetFit } from "@/lib/budget";
import { evaluateLifestyleFitLabel } from "@/lib/labels";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export function BudgetCalculator({
  rent,
  defaultIncome = 5000,
}: {
  rent: number;
  defaultIncome?: number;
}) {
  const [income, setIncome] = useState(defaultIncome);
  const [roommates, setRoommates] = useState(0);
  const [debts, setDebts] = useState(0);

  const result = calculateBudgetFit({
    monthlyIncome: income,
    rent,
    roommates,
    monthlyDebts: debts,
  });
  const { variant, label } = evaluateLifestyleFitLabel(result.verdict);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="income">Monthly income</Label>
          <Input
            id="income"
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="roommates">Roommates splitting</Label>
          <Input
            id="roommates"
            type="number"
            min={0}
            value={roommates}
            onChange={(e) => setRoommates(Math.max(0, Number(e.target.value) || 0))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="debts">Monthly debts</Label>
          <Input
            id="debts"
            type="number"
            min={0}
            value={debts}
            onChange={(e) => setDebts(Math.max(0, Number(e.target.value) || 0))}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold">Affordability</span>
          <Badge variant={variant}>{label}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat label="Your share" value={formatCurrency(result.sharePerPerson)} />
          <Stat
            label="% of income"
            value={`${Math.round(result.rentToIncomeRatio * 100)}%`}
          />
          <Stat label="30% target" value={formatCurrency(result.recommendedMaxRent)} />
          <Stat label="Fit score" value={`${result.score}/100`} />
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${result.score}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{result.message}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
