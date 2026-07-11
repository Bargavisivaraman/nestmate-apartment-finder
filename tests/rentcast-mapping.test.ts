import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchRentcastListings } from "@/lib/rentcast";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function stubApi(payload: unknown) {
  vi.stubEnv("RENTCAST_API_KEY", "test-key");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => payload })),
  );
}

describe("fetchRentcastListings mapping", () => {
  it("maps a raw listing into the internal shape", async () => {
    stubApi([
      {
        id: "rc-1",
        addressLine1: "123 Main St",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90012",
        latitude: 34.05,
        longitude: -118.24,
        propertyType: "SingleFamily",
        bedrooms: 2,
        bathrooms: 2,
        squareFootage: 950,
        price: 2800.4,
      },
    ]);

    const result = await fetchRentcastListings();
    expect(result.ok).toBe(true);
    expect(result.fetched).toBe(1);

    const l = result.listings[0];
    expect(l.title).toBe("2BR Single Family in Los Angeles");
    expect(l.address).toBe("123 Main St");
    expect(l.rent).toBe(2800);
    expect(l.bedrooms).toBe(2);
    expect(l.sqft).toBe(950);
    expect(l.latitude).toBe(34.05);
  });

  it("labels zero-bedroom units as studios", async () => {
    stubApi([
      { id: "rc-2", city: "Los Angeles", state: "CA", bedrooms: 0, price: 1500 },
    ]);

    const result = await fetchRentcastListings();
    expect(result.listings[0].title).toContain("Studio");
  });

  it("drops listings missing rent, city, or state but counts them as fetched", async () => {
    stubApi([
      { id: "no-rent", city: "LA", state: "CA", price: 0 },
      { id: "no-city", state: "CA", price: 2000 },
      { id: "ok", city: "LA", state: "CA", price: 2000 },
    ]);

    const result = await fetchRentcastListings();
    expect(result.fetched).toBe(3);
    expect(result.listings).toHaveLength(1);
  });

  it("tolerates a non-array response body", async () => {
    stubApi({ unexpected: "shape" });

    const result = await fetchRentcastListings();
    expect(result.ok).toBe(true);
    expect(result.listings).toEqual([]);
    expect(result.fetched).toBe(0);
  });
});
