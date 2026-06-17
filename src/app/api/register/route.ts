import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { name, email, password } = parsed.data;
    const normalized = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email: normalized, password: hashed, role: "USER" },
    });

    // Give every new user a starter roommate profile.
    await prisma.roommateProfile.create({
      data: { userId: user.id, city: "" },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 },
    );
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
