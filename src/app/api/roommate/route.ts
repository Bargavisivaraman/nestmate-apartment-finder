import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  budgetMin: z.coerce.number().int().min(0),
  budgetMax: z.coerce.number().int().min(0),
  cleanliness: z.coerce.number().int().min(1).max(5),
  sleepSchedule: z.enum(["EARLY_BIRD", "NIGHT_OWL", "FLEXIBLE"]),
  social: z.coerce.number().int().min(1).max(5),
  smoking: z.coerce.boolean(),
  pets: z.coerce.boolean(),
  gender: z.string().optional(),
  bio: z.string().max(500).optional(),
  city: z.string().optional(),
  interests: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await prisma.roommateProfile.findUnique({
    where: { userId: session.user.id },
  });
  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const profile = await prisma.roommateProfile.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  });
  return NextResponse.json(profile);
}
