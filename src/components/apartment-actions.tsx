"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ListChecks, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ApartmentActions({
  apartmentId,
  ownerId,
  initialFavorited,
  initialShortlisted,
}: {
  apartmentId: string;
  ownerId?: string | null;
  initialFavorited: boolean;
  initialShortlisted: boolean;
}) {
  const router = useRouter();
  const [fav, setFav] = useState(initialFavorited);
  const [shortlisted, setShortlisted] = useState(initialShortlisted);
  const [pending, setPending] = useState(false);

  async function toggleFav() {
    setPending(true);
    const next = !fav;
    setFav(next);
    if (!next) setShortlisted(false);
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apartmentId }),
    }).catch(() => setFav(!next));
    setPending(false);
  }

  async function toggleShortlist() {
    setPending(true);
    const next = !shortlisted;
    setShortlisted(next);
    if (next) setFav(true);
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apartmentId, shortlisted: next }),
    }).catch(() => setShortlisted(!next));
    setPending(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={toggleFav} disabled={pending} variant={fav ? "default" : "outline"} className="gap-2">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <Heart className={cn("h-4 w-4", fav && "fill-current")} />
        )}
        {fav ? "Saved" : "Save"}
      </Button>
      <Button onClick={toggleShortlist} disabled={pending} variant={shortlisted ? "default" : "outline"} className="gap-2">
        <ListChecks className="h-4 w-4" />
        {shortlisted ? "Shortlisted" : "Shortlist"}
      </Button>
      {ownerId && (
        <Button
          variant="secondary"
          className="gap-2"
          onClick={() => router.push(`/messages?to=${ownerId}`)}
        >
          <MessageSquare className="h-4 w-4" />
          Contact owner
        </Button>
      )}
    </div>
  );
}
