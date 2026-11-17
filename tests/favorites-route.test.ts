import { beforeEach, describe, expect, it, vi } from "vitest";

// POST /api/favorites must degrade cleanly when the client holds a stale
// apartment id (listing deleted in another tab) instead of crashing on the
// foreign-key constraint, and must reject malformed JSON with a 400.

const apartments = new Map<string, { id: string }>([["apt1", { id: "apt1" }]]);
const favoriteCreate = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
  id: "fav1",
  ...data,
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ user: { id: "u1", email: "u1@test.dev", role: "USER" } })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    apartment: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
        apartments.get(where.id) ?? null,
      ),
    },
    favorite: {
      findMany: vi.fn(async () => []),
      findUnique: vi.fn(async () => null),
      create: (...args: unknown[]) => favoriteCreate(...(args as [never])),
    },
  },
}));

import { POST } from "@/app/api/favorites/route";

beforeEach(() => {
  favoriteCreate.mockClear();
});

describe("POST /api/favorites", () => {
  it("creates a favorite for an existing apartment", async () => {
    const res = await POST(
      new Request("http://test.local/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartmentId: "apt1" }),
      }),
    );
    expect(res.status).toBe(201);
    expect(favoriteCreate).toHaveBeenCalledTimes(1);
  });

  it("returns 404 instead of crashing when the apartment no longer exists", async () => {
    const res = await POST(
      new Request("http://test.local/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartmentId: "deleted-apt" }),
      }),
    );
    expect(res.status).toBe(404);
    expect(favoriteCreate).not.toHaveBeenCalled();
  });

  it("returns 400 instead of crashing on a malformed JSON body", async () => {
    const res = await POST(
      new Request("http://test.local/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not json",
      }),
    );
    expect(res.status).toBe(400);
    expect(favoriteCreate).not.toHaveBeenCalled();
  });
});
