"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ApartmentCard, type ApartmentLite } from "@/components/apartment-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ApartmentBrowser({
  apartments,
  favoriteIds,
}: {
  apartments: ApartmentLite[];
  favoriteIds: string[];
}) {
  const favSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [beds, setBeds] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [petOnly, setPetOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const cities = useMemo(
    () => Array.from(new Set(apartments.map((a) => a.city))).sort(),
    [apartments],
  );

  const filtered = useMemo(() => {
    let list = apartments.filter((a) => {
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${a.title} ${a.address} ${a.city} ${a.neighborhood ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (city && a.city !== city) return false;
      if (beds && a.bedrooms < Number(beds)) return false;
      if (maxRent && a.rent > Number(maxRent)) return false;
      if (petOnly && !a.petFriendly) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "priceAsc") return a.rent - b.rent;
      if (sort === "priceDesc") return b.rent - a.rent;
      return 0; // newest already from server order
    });
    return list;
  }, [apartments, q, city, beds, maxRent, petOnly, sort]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, address, neighborhood..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters((v) => !v)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">City</label>
              <Select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">All cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Min beds</label>
              <Select value={beds} onChange={(e) => setBeds(e.target.value)}>
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Max rent</label>
              <Input
                type="number"
                placeholder="e.g. 2500"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Sort by</label>
              <Select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="priceAsc">Price: low to high</option>
                <option value="priceDesc">Price: high to low</option>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={petOnly}
                  onChange={(e) => setPetOnly(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Pet-friendly only
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "listing" : "listings"}
      </p>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No apartments match your filters. Try widening your search.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ApartmentCard key={a.id} apartment={a} favorited={favSet.has(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
