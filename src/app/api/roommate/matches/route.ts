import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateCompatibility, type RoommatePrefs } from "@/lib/compatibility";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mine = await prisma.roommateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!mine) {
    return NextResponse.json(
      { error: "Create your roommate profile first." },
      { status: 400 },
    );
  }

  const others = await prisma.roommateProfile.findMany({
    where: { userId: { not: session.user.id } },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  const toPrefs = (p: typeof mine): RoommatePrefs => ({
    budgetMin: p.budgetMin,
    budgetMax: p.budgetMax,
    cleanliness: p.cleanliness,
    sleepSchedule: p.sleepSchedule,
    social: p.social,
    smoking: p.smoking,
    pets: p.pets,
    interests: p.interests,
    city: p.city,
  });

  const matches = others
    .map((o) => ({
      user: o.user,
      profile: {
        budgetMin: o.budgetMin,
        budgetMax: o.budgetMax,
        cleanliness: o.cleanliness,
        sleepSchedule: o.sleepSchedule,
        social: o.social,
        smoking: o.smoking,
        pets: o.pets,
        city: o.city,
        bio: o.bio,
        interests: o.interests,
      },
      compatibility: calculateCompatibility(toPrefs(mine), toPrefs(o)),
    }))
    .sort((a, b) => b.compatibility.score - a.compatibility.score);

  return NextResponse.json(matches);
}
