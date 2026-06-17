"use client";

import { useState } from "react";
import { Loader2, MapPinned, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Result {
  summary: string;
  pros: string[];
  cons: string[];
  source: "openai" | "local";
}

export function NeighborhoodInsights({
  neighborhood,
  city,
  state,
}: {
  neighborhood?: string | null;
  city: string;
  state: string;
}) {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/neighborhood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ neighborhood: neighborhood || "", city, state }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPinned className="h-4 w-4" />
          {[neighborhood, city, state].filter(Boolean).join(", ")}
        </p>
        <Button onClick={analyze} disabled={loading} size="sm" className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Get insights
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <p className="text-sm text-muted-foreground">{result.summary}</p>
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {result.source === "openai" ? "OpenAI" : "Local AI"}
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                <ThumbsUp className="h-4 w-4" /> Pros
              </div>
              <ul className="space-y-1.5">
                {result.pros.map((p, i) => (
                  <li key={i} className="text-sm">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                <ThumbsDown className="h-4 w-4" /> Cons
              </div>
              <ul className="space-y-1.5">
                {result.cons.map((c, i) => (
                  <li key={i} className="text-sm">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
