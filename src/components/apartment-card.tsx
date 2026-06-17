"use client";

import Link from "next/link";
import { useState } from "react";
import { Bath, BedDouble, Heart, MapPin, Maximize, PawPrint } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, parseList } from "@/lib/utils";

export interface ApartmentLite {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl?: string | null;
  amenities: string;
  petFriendly: boolean;
  neighborhood?: string | null;
}

export function ApartmentCard({
  apartment,
  favorited = false,
}: {
  apartment: ApartmentLite;
  favorited?: boolean;
}) {
  const [fav, setFav] = useState(favorited);
  const [pending, setPending] = useState(false);
  const amenities = parseList(apartment.amenities);

  async function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPending(true);
    setFav((v) => !v);
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartmentId: apartment.id }),
      });
    } catch {
      setFav((v) => !v); // revert on error
    } finally {
      setPending(false);
    }
  }

  return (
    <Link href={`/apartments/${apartment.id}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              apartment.imageUrl ||
              `https://picsum.photos/seed/${apartment.id}/640/400`
            }
            alt={apartment.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <button
            onClick={toggleFav}
            disabled={pending}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
          >
            <Heart
              className={cn(
                "h-5 w-5",
                fav ? "fill-red-500 text-red-500" : "text-foreground",
              )}
            />
          </button>
          <div className="absolute bottom-3 left-3 rounded-md bg-background/90 px-2.5 py-1 text-sm font-bold backdrop-blur">
            {formatCurrency(apartment.rent)}
            <span className="font-normal text-muted-foreground">/mo</span>
          </div>
        </div>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold">{apartment.title}</h3>
            {apartment.petFriendly && (
              <PawPrint className="h-4 w-4 shrink-0 text-emerald-500" />
            )}
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">
              {apartment.neighborhood ? `${apartment.neighborhood}, ` : ""}
              {apartment.city}, {apartment.state}
            </span>
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              {apartment.bedrooms} bd
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {apartment.bathrooms} ba
            </span>
            <span className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              {apartment.sqft.toLocaleString()} ft²
            </span>
          </div>
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {amenities.slice(0, 3).map((a) => (
                <Badge key={a} variant="secondary" className="font-normal">
                  {a}
                </Badge>
              ))}
              {amenities.length > 3 && (
                <Badge variant="outline" className="font-normal">
                  +{amenities.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
