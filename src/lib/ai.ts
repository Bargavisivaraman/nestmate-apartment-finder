// AI helpers. When OPENAI_API_KEY is set, calls the OpenAI Chat Completions
// API. Otherwise it falls back to a deterministic local generator so every
// AI feature keeps working without a key (great for demos and CI).

import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

const client = apiKey ? new OpenAI({ apiKey }) : null;

export const aiEnabled = Boolean(apiKey);

async function chat(system: string, user: string): Promise<string> {
  if (!client) throw new Error("no-openai");
  const res = await client.chat.completions.create({
    model,
    temperature: 0.4,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return res.choices[0]?.message?.content?.trim() || "";
}

export interface LeaseSummary {
  summary: string;
  keyTerms: string[];
  redFlags: string[];
  source: "openai" | "local";
}

export async function summarizeLease(leaseText: string): Promise<LeaseSummary> {
  if (client) {
    try {
      const out = await chat(
        "You are a tenant-advocate assistant. Summarize residential leases in plain English. Respond as compact JSON with keys: summary (string), keyTerms (string[]), redFlags (string[]).",
        `Summarize this lease and flag anything tenant-unfriendly:\n\n${leaseText.slice(0, 6000)}`,
      );
      const parsed = safeJson(out);
      if (parsed) {
        return {
          summary: String(parsed.summary ?? ""),
          keyTerms: arr(parsed.keyTerms),
          redFlags: arr(parsed.redFlags),
          source: "openai",
        };
      }
    } catch {
      // fall through to local
    }
  }
  return { ...localLeaseSummary(leaseText), source: "local" };
}

export interface NeighborhoodInsight {
  pros: string[];
  cons: string[];
  summary: string;
  source: "openai" | "local";
}

export async function analyzeNeighborhood(
  neighborhood: string,
  city: string,
  state: string,
): Promise<NeighborhoodInsight> {
  const place = [neighborhood, city, state].filter(Boolean).join(", ");
  if (client) {
    try {
      const out = await chat(
        "You are a local-living expert. Given a neighborhood, give honest pros and cons for someone deciding whether to rent there. Respond as compact JSON with keys: summary (string), pros (string[]), cons (string[]).",
        `Neighborhood: ${place}`,
      );
      const parsed = safeJson(out);
      if (parsed) {
        return {
          summary: String(parsed.summary ?? ""),
          pros: arr(parsed.pros),
          cons: arr(parsed.cons),
          source: "openai",
        };
      }
    } catch {
      // fall through
    }
  }
  return { ...localNeighborhood(place), source: "local" };
}

export interface LifestyleFit {
  verdict: string;
  score: number; // 0..100
  reasons: string[];
  source: "openai" | "local";
}

export async function evaluateLifestyleFit(params: {
  apartment: string;
  rent: number;
  budget: number;
  preferences: string;
}): Promise<LifestyleFit> {
  if (client) {
    try {
      const out = await chat(
        "You evaluate whether an apartment fits a renter's lifestyle and budget. Respond as compact JSON with keys: verdict (string), score (number 0-100), reasons (string[]).",
        `Apartment: ${params.apartment}\nRent: $${params.rent}/mo\nMonthly budget: $${params.budget}\nRenter preferences: ${params.preferences}`,
      );
      const parsed = safeJson(out);
      if (parsed) {
        return {
          verdict: String(parsed.verdict ?? ""),
          score: clampScore(parsed.score),
          reasons: arr(parsed.reasons),
          source: "openai",
        };
      }
    } catch {
      // fall through
    }
  }
  return { ...localLifestyleFit(params), source: "local" };
}

// ---------------- local fallbacks ----------------

function localLeaseSummary(text: string): Omit<LeaseSummary, "source"> {
  const lower = text.toLowerCase();
  const keyTerms: string[] = [];
  const redFlags: string[] = [];

  const rentMatch = text.match(/\$\s?([\d,]+)/);
  if (rentMatch) keyTerms.push(`Rent referenced: $${rentMatch[1]}`);
  if (lower.includes("month-to-month")) keyTerms.push("Month-to-month tenancy");
  const termMatch = lower.match(/(\d+)\s*month/);
  if (termMatch) keyTerms.push(`${termMatch[1]}-month lease term`);
  if (lower.includes("security deposit")) keyTerms.push("Security deposit required");
  if (lower.includes("pet")) keyTerms.push("Contains pet policy");
  if (lower.includes("utilities")) keyTerms.push("Addresses utilities");

  if (lower.includes("non-refundable")) redFlags.push("Mentions non-refundable fees");
  if (lower.includes("automatically renew") || lower.includes("auto-renew"))
    redFlags.push("Auto-renewal clause — watch the notice window");
  if (lower.includes("late fee")) redFlags.push("Late-fee penalties apply");
  if (lower.includes("no subletting") || lower.includes("not sublet"))
    redFlags.push("Subletting is restricted");
  if (lower.includes("as is") || lower.includes("as-is"))
    redFlags.push('Unit may be rented "as is"');
  if (redFlags.length === 0) redFlags.push("No obvious red flags detected in the text.");

  const words = text.trim().split(/\s+/).length;
  const summary = `This lease document is roughly ${words} words. ${
    keyTerms.length
      ? "It covers " + keyTerms.length + " standard term(s) including " + keyTerms[0].toLowerCase() + "."
      : "Key financial terms were not clearly detected — review carefully."
  } Read the deposit, term length, and renewal sections closely before signing.`;

  return {
    summary,
    keyTerms: keyTerms.length ? keyTerms : ["Standard residential lease terms"],
    redFlags,
  };
}

function localNeighborhood(place: string): Omit<NeighborhoodInsight, "source"> {
  const seed = hash(place);
  const prosPool = [
    "Walkable to cafes, grocery stores, and transit",
    "Generally well-regarded for safety relative to the metro average",
    "Good mix of green space and parks nearby",
    "Active local dining and nightlife scene",
    "Solid public transit connections to downtown",
    "Family-friendly with reputable schools in the area",
    "Growing area with new development and amenities",
  ];
  const consPool = [
    "Parking can be competitive, especially on weekends",
    "Rents have been trending upward year over year",
    "Some streets see noticeable traffic noise",
    "Nightlife areas can get loud late in the evening",
    "Limited large-format grocery options within walking distance",
    "Commute to the suburbs may require a car",
    "New construction means occasional sidewalk/road work",
  ];
  const pros = pick(prosPool, seed, 3);
  const cons = pick(consPool, seed + 7, 3);
  return {
    summary: `${place} offers a typical urban-residential trade-off: convenient access and amenities balanced against cost and density. The notes below are a heuristic starting point — verify with a visit at different times of day.`,
    pros,
    cons,
  };
}

function localLifestyleFit(params: {
  apartment: string;
  rent: number;
  budget: number;
  preferences: string;
}): Omit<LifestyleFit, "source"> {
  const ratio = params.budget > 0 ? params.rent / params.budget : 2;
  let score = Math.round(100 - (ratio - 0.6) * 120);
  score = Math.max(5, Math.min(98, score));
  const reasons: string[] = [];
  if (ratio <= 0.85) reasons.push("Rent sits comfortably inside your stated budget.");
  else if (ratio <= 1) reasons.push("Rent is close to your budget ceiling — manageable but tight.");
  else reasons.push("Rent exceeds your budget, which strains the fit.");

  const prefs = params.preferences.toLowerCase();
  if (prefs.includes("pet")) reasons.push("You mentioned pets — confirm the pet policy and any fees.");
  if (prefs.includes("quiet")) reasons.push("You value quiet — check noise levels and floor position.");
  if (prefs.includes("gym") || prefs.includes("fitness"))
    reasons.push("Look for on-site fitness amenities to match your routine.");
  if (prefs.includes("commute")) reasons.push("Validate the commute time during rush hour.");
  if (reasons.length < 2) reasons.push("Overall this is a reasonable match worth touring.");

  const verdict =
    score >= 75
      ? "Strong fit for your lifestyle and budget."
      : score >= 50
        ? "Decent fit with a few trade-offs to weigh."
        : "Weak fit — the budget gap is hard to ignore.";

  return { verdict, score, reasons };
}

// ---------------- helpers ----------------

function safeJson(s: string): Record<string, unknown> | null {
  try {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(s.slice(start, end + 1));
  } catch {
    return null;
  }
}

function arr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v];
  return [];
}

function clampScore(v: unknown): number {
  const n = Number(v);
  if (Number.isNaN(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(pool: T[], seed: number, n: number): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed;
  while (out.length < n && used.size < pool.length) {
    s = (s * 1103515245 + 12345) >>> 0;
    const idx = s % pool.length;
    if (!used.has(idx)) {
      used.add(idx);
      out.push(pool[idx]);
    }
  }
  return out;
}
