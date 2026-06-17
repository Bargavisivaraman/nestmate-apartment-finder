import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  rent: z.coerce.number().int().positive(),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().min(0),
  sqft: z.coerce.number().int().min(0),
  description: z.string().default(""),
  imageUrl: z.string().url().optional().or(z.literal("")),
  amenities: z.string().default(""),
  petFriendly: z.coerce.boolean().default(false),
  furnished: z.coerce.boolean().default(false),
  leaseText: z.string().optional(),
  commuteNotes: z.string().optional(),
  neighborhood: z.string().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const city = searchParams.get("city") || "";
  const minRent = Number(searchParams.get("minRent")) || 0;
  const maxRent = Number(searchParams.get("maxRent")) || 1_000_000;
  const beds = searchParams.get("beds");
  const petFriendly = searchParams.get("petFriendly");
  const sort = searchParams.get("sort") || "newest";

  const where: Record<string, unknown> = {
    rent: { gte: minRent, lte: maxRent },
  };
  if (city) where.city = { contains: city };
  if (beds) where.bedrooms = { gte: Number(beds) };
  if (petFriendly === "true") where.petFriendly = true;

  let apartments = await prisma.apartment.findMany({
    where,
    orderBy:
      sort === "priceAsc"
        ? { rent: "asc" }
        : sort === "priceDesc"
          ? { rent: "desc" }
          : { createdAt: "desc" },
  });

  if (q) {
    apartments = apartments.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.address.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        (a.neighborhood?.toLowerCase().includes(q) ?? false),
    );
  }

  return NextResponse.json(apartments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const apartment = await prisma.apartment.create({
    data: {
      ...data,
      imageUrl: data.imageUrl || null,
      createdById: session.user.id,
    },
  });
  return NextResponse.json(apartment, { status: 201 });
}
