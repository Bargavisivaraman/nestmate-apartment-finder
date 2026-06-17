"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface Profile {
  budgetMin: number;
  budgetMax: number;
  cleanliness: number;
  sleepSchedule: string;
  social: number;
  smoking: boolean;
  pets: boolean;
  gender: string | null;
  bio: string | null;
  city: string | null;
  interests: string;
}

const DEFAULTS: Profile = {
  budgetMin: 800,
  budgetMax: 2000,
  cleanliness: 3,
  sleepSchedule: "FLEXIBLE",
  social: 3,
  smoking: false,
  pets: false,
  gender: "",
  bio: "",
  city: "",
  interests: "",
};

export function ProfileForm() {
  const router = useRouter();
  const [p, setP] = useState<Profile>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/roommate")
      .then((r) => r.json())
      .then((data) => {
        if (data) setP({ ...DEFAULTS, ...data });
      })
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/roommate", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading your profile...
      </div>
    );
  }

  const labels = ["", "Very relaxed", "Relaxed", "Moderate", "Tidy", "Spotless"];
  const socialLabels = ["", "Introvert", "Quiet", "Balanced", "Social", "Very social"];

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Budget min ($/mo)</Label>
          <Input
            type="number"
            value={p.budgetMin}
            onChange={(e) => set("budgetMin", Number(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Budget max ($/mo)</Label>
          <Input
            type="number"
            value={p.budgetMax}
            onChange={(e) => set("budgetMax", Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <Slider
        label={`Cleanliness — ${labels[p.cleanliness]}`}
        showValue={false}
        min={1}
        max={5}
        step={1}
        value={p.cleanliness}
        onChange={(e) => set("cleanliness", Number(e.target.value))}
      />

      <Slider
        label={`Social level — ${socialLabels[p.social]}`}
        showValue={false}
        min={1}
        max={5}
        step={1}
        value={p.social}
        onChange={(e) => set("social", Number(e.target.value))}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Sleep schedule</Label>
          <Select
            value={p.sleepSchedule}
            onChange={(e) => set("sleepSchedule", e.target.value)}
          >
            <option value="EARLY_BIRD">Early bird</option>
            <option value="NIGHT_OWL">Night owl</option>
            <option value="FLEXIBLE">Flexible</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>City</Label>
          <Input
            value={p.city ?? ""}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Austin"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Gender (optional)</Label>
          <Input
            value={p.gender ?? ""}
            onChange={(e) => set("gender", e.target.value)}
            placeholder="Any"
          />
        </div>
        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={p.smoking} onCheckedChange={(v) => set("smoking", v)} />
            Smoker
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={p.pets} onCheckedChange={(v) => set("pets", v)} />
            Has pets
          </label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Interests (comma-separated)</Label>
        <Input
          value={p.interests}
          onChange={(e) => set("interests", e.target.value)}
          placeholder="cooking, hiking, gaming, music"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Bio</Label>
        <Textarea
          value={p.bio ?? ""}
          onChange={(e) => set("bio", e.target.value)}
          rows={3}
          placeholder="Tell potential roommates about yourself..."
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save profile
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
