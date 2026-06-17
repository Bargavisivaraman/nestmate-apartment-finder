import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET ?with=<userId> -> conversation thread, or no param -> conversation list
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const me = session.user.id;
  const { searchParams } = new URL(req.url);
  const withUser = searchParams.get("with");

  if (withUser) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: me, receiverId: withUser },
          { senderId: withUser, receiverId: me },
        ],
      },
      orderBy: { createdAt: "asc" },
    });
    // Mark received as read.
    await prisma.message.updateMany({
      where: { senderId: withUser, receiverId: me, read: false },
      data: { read: true },
    });
    return NextResponse.json(messages);
  }

  // Build a simple conversation list.
  const all = await prisma.message.findMany({
    where: { OR: [{ senderId: me }, { receiverId: me }] },
    orderBy: { createdAt: "desc" },
  });
  const partners = new Map<string, { lastMessage: string; at: Date; unread: number }>();
  for (const m of all) {
    const partner = m.senderId === me ? m.receiverId : m.senderId;
    if (!partners.has(partner)) {
      partners.set(partner, { lastMessage: m.content, at: m.createdAt, unread: 0 });
    }
    const entry = partners.get(partner)!;
    if (m.receiverId === me && !m.read) entry.unread += 1;
  }
  const ids = [...partners.keys()];
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, email: true, image: true },
  });
  const list = users.map((u) => ({ user: u, ...partners.get(u.id)! }));
  list.sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return NextResponse.json(list);
}

const postSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(2000),
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
  const { receiverId, content } = parsed.data;
  if (receiverId === session.user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }
  const message = await prisma.message.create({
    data: { senderId: session.user.id, receiverId, content },
  });

  // Mock auto-reply so the messaging system feels alive in a demo.
  const replies = [
    "Hey! Thanks for reaching out. The place is still available.",
    "Sounds good — when were you thinking of touring?",
    "Great question! Utilities are split evenly between roommates.",
    "I'm pretty flexible on the move-in date. What works for you?",
    "Happy to chat more. Are you a night owl or early riser?",
  ];
  const idx = content.length % replies.length;
  await prisma.message.create({
    data: { senderId: receiverId, receiverId: session.user.id, content: replies[idx] },
  });

  return NextResponse.json(message, { status: 201 });
}
