import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchRentcastListings } from "@/lib/rentcast";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("fetchRentcastListings error handling", () => {
  it("fails cleanly when no API key is configured", async () => {
    vi.stubEnv("RENTCAST_API_KEY", "");
    const result = await fetchRentcastListings();
    expect(result.ok).toBe(false);
    expect(result.listings).toEqual([]);
    expect(result.error).toContain("RENTCAST_API_KEY");
  });

  it("reports the status and body on an API error", async () => {
    vi.stubEnv("RENTCAST_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 429,
        text: async () => "rate limited",
      })),
    );

    const result = await fetchRentcastListings();
    expect(result.ok).toBe(false);
    expect(result.error).toContain("429");
    expect(result.error).toContain("rate limited");
  });

  it("captures network failures as an error result", async () => {
    vi.stubEnv("RENTCAST_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("connection reset");
      }),
    );

    const result = await fetchRentcastListings();
    expect(result.ok).toBe(false);
    expect(result.error).toBe("connection reset");
    expect(result.fetched).toBe(0);
  });
});
