import { describe, it, expect } from "vitest";
import { evaluateLifestyleFitLabel, scoreVariant } from "@/lib/labels";

describe("evaluateLifestyleFitLabel", () => {
  it("maps each verdict to its badge", () => {
    expect(evaluateLifestyleFitLabel("EXCELLENT")).toEqual({
      variant: "success",
      label: "Excellent fit",
    });
    expect(evaluateLifestyleFitLabel("GOOD")).toEqual({
      variant: "success",
      label: "Good fit",
    });
    expect(evaluateLifestyleFitLabel("TIGHT")).toEqual({
      variant: "warning",
      label: "Tight",
    });
    expect(evaluateLifestyleFitLabel("OVER_BUDGET")).toEqual({
      variant: "destructive",
      label: "Over budget",
    });
  });

  it("falls back to a neutral badge for unknown verdicts", () => {
    expect(
      evaluateLifestyleFitLabel("SOMETHING_ELSE" as never),
    ).toEqual({ variant: "secondary", label: "Unknown" });
  });
});

describe("scoreVariant", () => {
  it("is success at 70 and above", () => {
    expect(scoreVariant(70)).toBe("success");
    expect(scoreVariant(100)).toBe("success");
  });

  it("is warning from 45 to 69", () => {
    expect(scoreVariant(45)).toBe("warning");
    expect(scoreVariant(69)).toBe("warning");
  });

  it("is destructive below 45", () => {
    expect(scoreVariant(44)).toBe("destructive");
    expect(scoreVariant(0)).toBe("destructive");
  });
});
