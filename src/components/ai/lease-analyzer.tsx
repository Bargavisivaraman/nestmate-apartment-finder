"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Result {
  summary: string;
  keyTerms: string[];
  redFlags: string[];
  source: "openai" | "local";
}

export function LeaseAnalyzer({ initialText = "" }: { initialText?: string }) {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseText: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not analyze the lease.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste the lease text here and let AI summarize it and flag anything tenant-unfriendly..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
      />
      <Button onClick={analyze} disabled={loading || text.trim().length < 20} className="gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Analyze lease
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <div>
            <div className="mb-1 flex items-center gap-2 font-semibold">
              <FileText className="h-4 w-4 text-primary" /> Summary
              <Badge variant="outline" className="ml-auto text-[10px]">
                {result.source === "openai" ? "OpenAI" : "Local AI"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
          </div>

          {result.keyTerms.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Key terms
              </div>
              <ul className="space-y-1">
                {result.keyTerms.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-emerald-500">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.redFlags.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Watch out for
              </div>
              <ul className="space-y-1">
                {result.redFlags.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-amber-500">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
