import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { fetchRentcastListings, rentcastEnabled } from "@/lib/rentcast";

const schema = z.object({
  city: z.string().min(1).default("Los Angeles"),
  state: z.string().min(1).default("CA"),
  limit: z.coerce.number().int().min(1).max(500).default(50),
});

// Admin-only: pull live listings from RentCast and upsert them by address.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!rentcastEnabled) {
    return NextResponse.json(
      {
        error:
          "RentCast is not configured. Set RENTCAST_API_KEY to enable live listing sync.",
      },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { city, state, limit } = parsed.data;

  const result = await fetchRentcastListings(city, state, limit);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  let created = 0;
  let updated = 0;
  for (const l of result.listings) {
    // Dedup by address + city (no external id column on Apartment).
    const existing = await prisma.apartment.findFirst({
      where: { address: l.address, city: l.city },
      select: { id: true },
    });
    if (existing) {
      await prisma.apartment.update({ where: { id: existing.id }, data: l });
      updated += 1;
    } else {
      await prisma.apartment.create({
        data: { ...l, createdById: session.user.id },
      });
      created += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    city,
    state,
    fetchedFromApi: result.fetched,
    imported: result.listings.length,
    created,
    updated,
  });
}
