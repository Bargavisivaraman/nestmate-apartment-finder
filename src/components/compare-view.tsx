"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Plus, X } from "lucide-react";
import type { ApartmentLite } from "@/components/apartment-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RentBudgetChart } from "@/components/charts/rent-budget-chart";
import { formatCurrency, parseList } from "@/lib/utils";

type Apt = ApartmentLite & {
  description: string;
  furnished: boolean;
  commuteNotes?: string | null;
};

export function CompareView({
  apartments,
  budget,
}: {
  apartments: Apt[];
  budget: number;
}) {
  const [selected, setSelected] = useState<string[]>(
    apartments.slice(0, Math.min(3, apartments.length)).map((a) => a.id),
  );

  const chosen = useMemo(
    () => selected.map((id) => apartments.find((a) => a.id === id)).filter(Boolean) as Apt[],
    [selected, apartments],
  );

  function setSlot(index: number, id: string) {
    setSelected((prev) => {
      const next = [...prev];
      if (id === "") next.splice(index, 1);
      else next[index] = id;
      return next;
    });
  }

  function addSlot() {
    const avail = apartments.find((a) => !selected.includes(a.id));
    if (avail) setSelected((prev) => [...prev, avail.id]);
  }

  const rows: { label: string; render: (a: Apt) => React.ReactNode }[] = [
    { label: "Rent", render: (a) => <span className="font-semibold">{formatCurrency(a.rent)}/mo</span> },
    {
      label: "Within budget",
      render: (a) =>
        budget > 0 ? (
          a.rent <= budget ? (
            <Badge variant="success" className="gap-1"><Check className="h-3 w-3" /> Yes</Badge>
          ) : (
            <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" /> Over</Badge>
          )
        ) : (
          "—"
        ),
    },
    { label: "Bedrooms", render: (a) => a.bedrooms },
    { label: "Bathrooms", render: (a) => a.bathrooms },
    { label: "Square feet", render: (a) => `${a.sqft.toLocaleString()} ft²` },
    {
      label: "$/sqft",
      render: (a) => (a.sqft ? `$${(a.rent / a.sqft).toFixed(2)}` : "—"),
    },
    { label: "City", render: (a) => `${a.city}, ${a.state}` },
    {
      label: "Pet friendly",
      render: (a) => (a.petFriendly ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-muted-foreground" />),
    },
    {
      label: "Furnished",
      render: (a) => (a.furnished ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-muted-foreground" />),
    },
    {
      label: "Amenities",
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          {parseList(a.amenities).slice(0, 4).map((x) => (
            <Badge key={x} variant="outline" className="font-normal">{x}</Badge>
          ))}
        </div>
      ),
    },
  ];

  if (apartments.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          No apartments to compare yet.{" "}
          <Link href="/apartments/new" className="text-primary hover:underline">
            Add one
          </Link>
          .
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <p className="mb-2 text-sm font-medium">Rent comparison</p>
          <RentBudgetChart
            data={chosen.map((a) => ({ name: a.title.slice(0, 14), rent: a.rent }))}
            budget={budget}
          />
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="w-32 p-3 text-left font-medium text-muted-foreground">Attribute</th>
              {chosen.map((a, i) => (
                <th key={a.id} className="p-3 text-left">
                  <Select value={a.id} onChange={(e) => setSlot(i, e.target.value)}>
                    {apartments.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.title}
                      </option>
                    ))}
                  </Select>
                </th>
              ))}
              {chosen.length < Math.min(4, apartments.length) && (
                <th className="p-3">
                  <Button variant="outline" size="sm" onClick={addSlot} className="gap-1">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-0">
                <td className="p-3 font-medium text-muted-foreground">{row.label}</td>
                {chosen.map((a) => (
                  <td key={a.id} className="p-3">
                    {row.render(a)}
                  </td>
                ))}
                {chosen.length < Math.min(4, apartments.length) && <td />}
              </tr>
            ))}
            <tr>
              <td className="p-3" />
              {chosen.map((a) => (
                <td key={a.id} className="p-3">
                  <Link href={`/apartments/${a.id}`}>
                    <Button size="sm" variant="ghost">View details</Button>
                  </Link>
                </td>
              ))}
              {chosen.length < Math.min(4, apartments.length) && <td />}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
