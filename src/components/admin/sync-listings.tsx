"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CloudDownload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SyncResult {
  imported: number;
  created: number;
  updated: number;
  fetchedFromApi: number;
  city: string;
  state: string;
}

export function SyncListings() {
  const router = useRouter();
  const [city, setCity] = useState("Los Angeles");
  const [state, setState] = useState("CA");
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SyncResult | null>(null);

  async function sync() {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sync-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, state, limit }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sync failed.");
        return;
      }
      setResult(data);
      router.refresh();
    } catch {
      setError("Network error during sync.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pull live rental listings from RentCast and import them into the database.
        Requires <code className="rounded bg-muted px-1">RENTCAST_API_KEY</code>.
        Existing listings at the same address are updated, not duplicated.
      </p>
      <div className="grid gap-3 sm:grid-cols-[1fr_100px_120px_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="sync-city">City</Label>
          <Input id="sync-city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sync-state">State</Label>
          <Input id="sync-state" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sync-limit">Max listings</Label>
          <Input
            id="sync-limit"
            type="number"
            min={1}
            max={500}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) || 50)}
          />
        </div>
        <Button onClick={sync} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudDownload className="h-4 w-4" />}
          Sync real listings
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <span>
            Imported {result.imported} {result.city} listings ({result.created} new,{" "}
            {result.updated} updated) from {result.fetchedFromApi} returned by RentCast.
          </span>
        </div>
      )}
    </div>
  );
}
