// RentCast integration for pulling real rental listings.
// Docs: https://developers.rentcast.io/reference/listings
// Set RENTCAST_API_KEY to enable. The free tier allows ~50 requests/month.

const API_BASE = "https://api.rentcast.io/v1";

export const rentcastEnabled = Boolean(process.env.RENTCAST_API_KEY);

export interface MappedListing {
  title: string;
  address: string;
  city: string;
  state: string;
  neighborhood: string | null;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  imageUrl: string | null;
  amenities: string;
  petFriendly: boolean;
  furnished: boolean;
  commuteNotes: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface RentcastListing {
  id?: string;
  formattedAddress?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  price?: number;
  status?: string;
}

function titleCaseType(t?: string): string {
  if (!t) return "Apartment";
  return t.replace(/([A-Z])/g, " $1").replace(/^\s/, "").trim() || "Apartment";
}

function mapListing(l: RentcastListing, index: number): MappedListing | null {
  const rent = Math.round(l.price ?? 0);
  if (!rent || !l.city || !l.state) return null;
  const beds = l.bedrooms ?? 0;
  const baths = l.bathrooms ?? 1;
  const sqft = Math.round(l.squareFootage ?? 0);
  const type = titleCaseType(l.propertyType);
  const bedLabel = beds === 0 ? "Studio" : `${beds}BR`;
  const seed = encodeURIComponent(l.id || l.formattedAddress || `rc-${index}`);

  return {
    title: `${bedLabel} ${type} in ${l.city}`,
    address: l.addressLine1 || l.formattedAddress || "Address available on request",
    city: l.city,
    state: l.state,
    neighborhood: null,
    rent,
    bedrooms: beds,
    bathrooms: baths,
    sqft,
    description: `Live ${type.toLowerCase()} listing in ${l.city}, ${l.state}${
      l.zipCode ? ` ${l.zipCode}` : ""
    }. ${beds === 0 ? "Studio" : `${beds} bed`} / ${baths} bath${
      sqft ? `, ${sqft.toLocaleString()} sqft` : ""
    }. Synced from RentCast.`,
    imageUrl: `https://picsum.photos/seed/${seed}/800/500`,
    amenities: "",
    petFriendly: false,
    furnished: false,
    commuteNotes: null,
    latitude: l.latitude ?? null,
    longitude: l.longitude ?? null,
  };
}

export interface FetchResult {
  ok: boolean;
  listings: MappedListing[];
  error?: string;
  fetched: number;
}

export async function fetchRentcastListings(
  city = "Los Angeles",
  state = "CA",
  limit = 50,
): Promise<FetchResult> {
  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) {
    return { ok: false, listings: [], error: "RENTCAST_API_KEY is not set.", fetched: 0 };
  }

  const url = new URL(`${API_BASE}/listings/rental/long-term`);
  url.searchParams.set("city", city);
  url.searchParams.set("state", state);
  url.searchParams.set("status", "Active");
  url.searchParams.set("limit", String(Math.min(limit, 500)));

  try {
    const res = await fetch(url, {
      headers: { "X-Api-Key": apiKey, Accept: "application/json" },
      // RentCast data changes slowly; avoid caching stale auth headers.
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        listings: [],
        error: `RentCast API error ${res.status}: ${body.slice(0, 200)}`,
        fetched: 0,
      };
    }
    const data = (await res.json()) as RentcastListing[];
    const listings = (Array.isArray(data) ? data : [])
      .map(mapListing)
      .filter((x): x is MappedListing => x !== null);
    return { ok: true, listings, fetched: Array.isArray(data) ? data.length : 0 };
  } catch (err) {
    return {
      ok: false,
      listings: [],
      error: err instanceof Error ? err.message : "Unknown error fetching listings.",
      fetched: 0,
    };
  }
}
