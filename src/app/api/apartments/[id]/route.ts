import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const apartment = await prisma.apartment.findUnique({ where: { id } });
  if (!apartment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(apartment);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const apartment = await prisma.apartment.findUnique({ where: { id } });
  if (!apartment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Owner or admin only.
  if (apartment.createdById !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.apartment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
