// Roommate compatibility scoring. Produces a 0..100 score plus a breakdown
// explaining each contributing factor.

export interface RoommatePrefs {
  budgetMin: number;
  budgetMax: number;
  cleanliness: number; // 1..5
  sleepSchedule: string; // EARLY_BIRD | NIGHT_OWL | FLEXIBLE
  social: number; // 1..5
  smoking: boolean;
  pets: boolean;
  interests: string; // comma-separated
  city?: string | null;
}

export interface CompatibilityFactor {
  label: string;
  score: number; // 0..100 for this factor
  weight: number;
  note: string;
}

export interface CompatibilityResult {
  score: number; // 0..100
  rating: "Excellent" | "Great" | "Good" | "Fair" | "Low";
  factors: CompatibilityFactor[];
  sharedInterests: string[];
}

function overlap(min1: number, max1: number, min2: number, max2: number): number {
  const lo = Math.max(min1, min2);
  const hi = Math.min(max1, max2);
  const inter = Math.max(0, hi - lo);
  const union = Math.max(max1, max2) - Math.min(min1, min2);
  if (union <= 0) return 100;
  return Math.round((inter / union) * 100);
}

function toList(s: string): string[] {
  return s
    .toLowerCase()
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function calculateCompatibility(
  a: RoommatePrefs,
  b: RoommatePrefs,
): CompatibilityResult {
  const factors: CompatibilityFactor[] = [];

  // Budget overlap (weight 25)
  const budgetScore = overlap(a.budgetMin, a.budgetMax, b.budgetMin, b.budgetMax);
  factors.push({
    label: "Budget",
    score: budgetScore,
    weight: 25,
    note:
      budgetScore > 60
        ? "Budgets line up well."
        : budgetScore > 25
          ? "Some budget overlap."
          : "Budgets barely overlap.",
  });

  // Cleanliness (weight 20) — closer is better
  const cleanDiff = Math.abs(a.cleanliness - b.cleanliness);
  const cleanScore = Math.round(((4 - cleanDiff) / 4) * 100);
  factors.push({
    label: "Cleanliness",
    score: cleanScore,
    weight: 20,
    note: cleanDiff <= 1 ? "Similar tidiness standards." : "Different cleaning habits.",
  });

  // Sleep schedule (weight 15)
  let sleepScore = 50;
  if (a.sleepSchedule === b.sleepSchedule) sleepScore = 100;
  else if (a.sleepSchedule === "FLEXIBLE" || b.sleepSchedule === "FLEXIBLE")
    sleepScore = 75;
  else sleepScore = 30; // early bird vs night owl
  factors.push({
    label: "Sleep schedule",
    score: sleepScore,
    weight: 15,
    note:
      sleepScore >= 75 ? "Compatible daily rhythms." : "Opposite sleep schedules.",
  });

  // Social level (weight 15)
  const socialDiff = Math.abs(a.social - b.social);
  const socialScore = Math.round(((4 - socialDiff) / 4) * 100);
  factors.push({
    label: "Social style",
    score: socialScore,
    weight: 15,
    note: socialDiff <= 1 ? "Matched social energy." : "Different social needs.",
  });

  // Lifestyle: smoking + pets (weight 15)
  let lifestyleScore = 100;
  if (a.smoking !== b.smoking) lifestyleScore -= 50;
  if (a.pets !== b.pets) lifestyleScore -= 25;
  lifestyleScore = Math.max(0, lifestyleScore);
  factors.push({
    label: "Lifestyle",
    score: lifestyleScore,
    weight: 15,
    note:
      lifestyleScore === 100
        ? "Aligned on smoking and pets."
        : "Some lifestyle differences.",
  });

  // Shared interests (weight 10)
  const ai = toList(a.interests);
  const bi = toList(b.interests);
  const shared = ai.filter((x) => bi.includes(x));
  const interestScore =
    ai.length && bi.length
      ? Math.min(100, Math.round((shared.length / Math.min(ai.length, bi.length)) * 100))
      : 50;
  factors.push({
    label: "Interests",
    score: interestScore,
    weight: 10,
    note: shared.length ? `${shared.length} shared interest(s).` : "Few shared interests.",
  });

  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  const weighted = factors.reduce((s, f) => s + f.score * f.weight, 0);
  const score = Math.round(weighted / totalWeight);

  let rating: CompatibilityResult["rating"];
  if (score >= 85) rating = "Excellent";
  else if (score >= 70) rating = "Great";
  else if (score >= 55) rating = "Good";
  else if (score >= 40) rating = "Fair";
  else rating = "Low";

  return { score, rating, factors, sharedInterests: shared };
}
