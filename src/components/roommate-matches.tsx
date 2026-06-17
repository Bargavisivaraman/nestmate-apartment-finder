"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Moon, Sparkles, Sun, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { scoreVariant } from "@/lib/labels";
import type { CompatibilityResult } from "@/lib/compatibility";

interface Match {
  user: { id: string; name: string | null; email: string; image: string | null };
  profile: {
    budgetMin: number;
    budgetMax: number;
    sleepSchedule: string;
    city: string | null;
    bio: string | null;
    interests: string;
  };
  compatibility: CompatibilityResult;
}

export function RoommateMatches() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/roommate/matches")
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.error || "Could not load matches.");
        }
        return r.json();
      })
      .then(setMatches)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Finding compatible roommates...
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => router.push("/profile")}>
            Complete your profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Users className="h-8 w-8" />
          No other roommate profiles yet. Check back as more people join.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {matches.map((m) => (
        <Card key={m.user.id} className="overflow-hidden">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initials(m.user.name, m.user.email)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold">{m.user.name || "Anonymous"}</p>
                  <Badge variant={scoreVariant(m.compatibility.score)} className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    {m.compatibility.score}% · {m.compatibility.rating}
                  </Badge>
                </div>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span>${m.profile.budgetMin}–${m.profile.budgetMax}/mo</span>
                  {m.profile.city && <span>{m.profile.city}</span>}
                  <span className="flex items-center gap-1">
                    {m.profile.sleepSchedule === "EARLY_BIRD" ? (
                      <Sun className="h-3 w-3" />
                    ) : m.profile.sleepSchedule === "NIGHT_OWL" ? (
                      <Moon className="h-3 w-3" />
                    ) : null}
                    {m.profile.sleepSchedule.replace("_", " ").toLowerCase()}
                  </span>
                </p>
              </div>
            </div>

            {m.profile.bio && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{m.profile.bio}</p>
            )}

            <div className="space-y-1.5">
              {m.compatibility.factors.map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-xs">
                  <span className="w-24 shrink-0 text-muted-foreground">{f.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                  <span className="w-8 text-right tabular-nums text-muted-foreground">
                    {f.score}
                  </span>
                </div>
              ))}
            </div>

            {m.compatibility.sharedInterests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {m.compatibility.sharedInterests.map((s) => (
                  <Badge key={s} variant="secondary" className="font-normal capitalize">
                    {s}
                  </Badge>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => router.push(`/messages?to=${m.user.id}`)}
            >
              <MessageSquare className="h-4 w-4" /> Message
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
