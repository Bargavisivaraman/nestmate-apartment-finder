import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { analyzeNeighborhood } from "@/lib/ai";

const schema = z.object({
  neighborhood: z.string().default(""),
  city: z.string().min(1),
  state: z.string().default(""),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }
  const { neighborhood, city, state } = parsed.data;
  const result = await analyzeNeighborhood(neighborhood, city, state);
  return NextResponse.json(result);
}
