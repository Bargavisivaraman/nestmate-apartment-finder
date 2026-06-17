"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewApartmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [petFriendly, setPetFriendly] = useState(false);
  const [furnished, setFurnished] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title"),
      address: fd.get("address"),
      city: fd.get("city"),
      state: fd.get("state"),
      neighborhood: fd.get("neighborhood"),
      rent: fd.get("rent"),
      bedrooms: fd.get("bedrooms"),
      bathrooms: fd.get("bathrooms"),
      sqft: fd.get("sqft"),
      description: fd.get("description"),
      amenities: fd.get("amenities"),
      imageUrl: fd.get("imageUrl"),
      commuteNotes: fd.get("commuteNotes"),
      leaseText: fd.get("leaseText"),
      petFriendly,
      furnished,
    };
    const res = await fetch("/api/apartments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create listing.");
      setLoading(false);
      return;
    }
    const created = await res.json();
    router.push(`/apartments/${created.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <Link
        href="/apartments"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Add a new listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field name="title" label="Title" required placeholder="Sunny 2BR near downtown" />
            <Field name="address" label="Street address" required placeholder="123 Main St" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field name="city" label="City" required placeholder="Austin" />
              <Field name="state" label="State" required placeholder="TX" />
              <Field name="neighborhood" label="Neighborhood" placeholder="East Side" />
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <Field name="rent" label="Rent ($/mo)" type="number" required placeholder="1800" />
              <Field name="bedrooms" label="Beds" type="number" required placeholder="2" />
              <Field name="bathrooms" label="Baths" type="number" step="0.5" required placeholder="1.5" />
              <Field name="sqft" label="Sqft" type="number" required placeholder="950" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} placeholder="Describe the place..." />
            </div>
            <Field name="amenities" label="Amenities (comma-separated)" placeholder="In-unit laundry, Parking, Gym" />
            <Field name="imageUrl" label="Image URL (optional)" placeholder="https://..." />
            <div className="space-y-1.5">
              <Label htmlFor="commuteNotes">Commute notes</Label>
              <Textarea id="commuteNotes" name="commuteNotes" rows={2} placeholder="15 min to downtown by bus, near the L line..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="leaseText">Lease text (for AI analyzer)</Label>
              <Textarea id="leaseText" name="leaseText" rows={3} placeholder="Paste lease terms here (optional)..." />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={petFriendly} onCheckedChange={setPetFriendly} />
                Pet friendly
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={furnished} onCheckedChange={setFurnished} />
                Furnished
              </label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create listing
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  name,
  label,
  ...props
}: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}
