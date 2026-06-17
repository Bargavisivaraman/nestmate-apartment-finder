import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { apartment: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(favorites);
}

const postSchema = z.object({
  apartmentId: z.string().min(1),
  shortlisted: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { apartmentId, shortlisted } = parsed.data;

  const existing = await prisma.favorite.findUnique({
    where: { userId_apartmentId: { userId: session.user.id, apartmentId } },
  });

  if (existing) {
    // Toggle off, or update shortlist flag if provided.
    if (typeof shortlisted === "boolean") {
      const updated = await prisma.favorite.update({
        where: { id: existing.id },
        data: { shortlisted },
      });
      return NextResponse.json({ action: "updated", favorite: updated });
    }
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ action: "removed" });
  }

  const favorite = await prisma.favorite.create({
    data: { userId: session.user.id, apartmentId, shortlisted: shortlisted ?? false },
  });
  return NextResponse.json({ action: "added", favorite }, { status: 201 });
}
