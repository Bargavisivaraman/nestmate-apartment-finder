import { beforeEach, describe, expect, it, vi } from "vitest";

// POST /api/messages must reject a stale ?to= recipient (deleted user) with a
// 404 instead of crashing on the foreign-key constraint, and malformed JSON
// with a 400.

const users = new Map<string, { id: string }>([
  ["u1", { id: "u1" }],
  ["u2", { id: "u2" }],
]);
const messageCreate = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
  id: "m1",
  createdAt: new Date(),
  read: false,
  ...data,
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ user: { id: "u1", email: "u1@test.dev", role: "USER" } })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
        users.get(where.id) ?? null,
      ),
      findMany: vi.fn(async () => []),
    },
    message: {
      findMany: vi.fn(async () => []),
      updateMany: vi.fn(async () => ({ count: 0 })),
      create: (...args: unknown[]) => messageCreate(...(args as [never])),
    },
  },
}));

import { POST } from "@/app/api/messages/route";

function post(body: BodyInit): Request {
  return new Request("http://test.local/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

beforeEach(() => {
  messageCreate.mockClear();
});

describe("POST /api/messages", () => {
  it("sends a message to an existing user", async () => {
    const res = await POST(post(JSON.stringify({ receiverId: "u2", content: "hi" })));
    expect(res.status).toBe(201);
    // Original message plus the demo auto-reply.
    expect(messageCreate).toHaveBeenCalledTimes(2);
  });

  it("returns 404 instead of crashing when the recipient no longer exists", async () => {
    const res = await POST(
      post(JSON.stringify({ receiverId: "deleted-user", content: "hi" })),
    );
    expect(res.status).toBe(404);
    expect(messageCreate).not.toHaveBeenCalled();
  });

  it("rejects messaging yourself", async () => {
    const res = await POST(post(JSON.stringify({ receiverId: "u1", content: "hi" })));
    expect(res.status).toBe(400);
    expect(messageCreate).not.toHaveBeenCalled();
  });

  it("returns 400 instead of crashing on a malformed JSON body", async () => {
    const res = await POST(post("{not json"));
    expect(res.status).toBe(400);
    expect(messageCreate).not.toHaveBeenCalled();
  });
});
