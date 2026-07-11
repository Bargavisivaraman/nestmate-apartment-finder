import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate, parseList, initials } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and drops falsy values", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });

  it("lets later tailwind classes win conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("formatCurrency", () => {
  it("formats whole dollars with no cents", () => {
    expect(formatCurrency(1850)).toBe("$1,850");
  });

  it("rounds fractional amounts", () => {
    expect(formatCurrency(1850.75)).toBe("$1,851");
  });
});

describe("formatDate", () => {
  it("formats a date as Mon D, YYYY", () => {
    expect(formatDate(new Date(2026, 6, 4))).toBe("Jul 4, 2026");
  });

  it("accepts an ISO string", () => {
    expect(formatDate("2026-01-15T12:00:00")).toBe("Jan 15, 2026");
  });
});

describe("parseList", () => {
  it("splits, trims, and drops empties", () => {
    expect(parseList(" hiking , cooking ,, music ")).toEqual([
      "hiking",
      "cooking",
      "music",
    ]);
  });

  it("returns an empty array for null/undefined/empty", () => {
    expect(parseList(null)).toEqual([]);
    expect(parseList(undefined)).toEqual([]);
    expect(parseList("")).toEqual([]);
  });
});

describe("initials", () => {
  it("uses the first letters of up to two name parts", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials("Ada Byron Lovelace")).toBe("AB");
  });

  it("falls back to the email prefix", () => {
    expect(initials(null, "zoe@example.com")).toBe("ZO");
  });

  it("defaults to U with no name or email", () => {
    expect(initials()).toBe("U");
  });
});
