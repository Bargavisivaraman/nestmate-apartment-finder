import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { evaluateLifestyleFit } from "@/lib/ai";

const schema = z.object({
  apartment: z.string().min(1),
  rent: z.coerce.number().positive(),
  budget: z.coerce.number().positive(),
  preferences: z.string().default(""),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const result = await evaluateLifestyleFit(parsed.data);
  return NextResponse.json(result);
}
