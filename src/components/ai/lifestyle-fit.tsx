"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { scoreVariant } from "@/lib/labels";

interface Result {
  verdict: string;
  score: number;
  reasons: string[];
  source: "openai" | "local";
}

export function LifestyleFit({
  apartment,
  rent,
  defaultBudget = 2000,
}: {
  apartment: string;
  rent: number;
  defaultBudget?: number;
}) {
  const [budget, setBudget] = useState(defaultBudget);
  const [prefs, setPrefs] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartment, rent, budget, preferences: prefs }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Monthly budget
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value) || 0)}
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            What matters to you?
          </label>
          <Textarea
            placeholder="e.g. quiet, close commute, pet-friendly, gym nearby..."
            value={prefs}
            onChange={(e) => setPrefs(e.target.value)}
            rows={2}
            className="mt-1"
          />
        </div>
      </div>
      <Button onClick={run} disabled={loading} className="gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Evaluate fit
      </Button>

      {result && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">{result.verdict}</span>
            <Badge variant={scoreVariant(result.score)}>{result.score}/100</Badge>
          </div>
          <ul className="space-y-1">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
