import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { summarizeLease } from "@/lib/ai";

const schema = z.object({ leaseText: z.string().min(20, "Provide more lease text.") });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }
  const result = await summarizeLease(parsed.data.leaseText);
  return NextResponse.json(result);
}
