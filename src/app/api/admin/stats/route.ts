import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [users, apartments, favorites, messages, profiles, recentUsers, recentApts] =
    await Promise.all([
      prisma.user.count(),
      prisma.apartment.count(),
      prisma.favorite.count(),
      prisma.message.count(),
      prisma.roommateProfile.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.apartment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, city: true, rent: true, createdAt: true },
      }),
    ]);

  // Rent distribution buckets for an admin chart.
  const allApts = await prisma.apartment.findMany({ select: { rent: true, city: true } });
  const buckets = [
    { range: "<$1k", count: 0 },
    { range: "$1k–1.5k", count: 0 },
    { range: "$1.5k–2k", count: 0 },
    { range: "$2k–3k", count: 0 },
    { range: "$3k+", count: 0 },
  ];
  for (const a of allApts) {
    if (a.rent < 1000) buckets[0].count++;
    else if (a.rent < 1500) buckets[1].count++;
    else if (a.rent < 2000) buckets[2].count++;
    else if (a.rent < 3000) buckets[3].count++;
    else buckets[4].count++;
  }

  const byCity = Object.entries(
    allApts.reduce<Record<string, number>>((acc, a) => {
      acc[a.city] = (acc[a.city] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return NextResponse.json({
    totals: { users, apartments, favorites, messages, profiles },
    recentUsers,
    recentApts,
    rentBuckets: buckets,
    byCity,
  });
}
