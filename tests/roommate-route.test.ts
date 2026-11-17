import { beforeEach, describe, expect, it, vi } from "vitest";

// The roommate PUT handler must accept its own GET payload: nullable DB
// columns (gender, bio, city) come back as null, and saving an untouched
// profile sends those nulls straight back.

const upsert = vi.fn(async ({ update }: { update: Record<string, unknown> }) => ({
  id: "p1",
  userId: "u1",
  ...update,
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ user: { id: "u1", email: "u1@test.dev", role: "USER" } })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    roommateProfile: {
      findUnique: vi.fn(async () => null),
      upsert: (...args: unknown[]) => upsert(...(args as [never])),
    },
  },
}));

import { PUT } from "@/app/api/roommate/route";

function putRequest(body: unknown): Request {
  return new Request("http://test.local/api/roommate", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const basePayload = {
  budgetMin: 800,
  budgetMax: 2000,
  cleanliness: 3,
  sleepSchedule: "FLEXIBLE",
  social: 3,
  smoking: false,
  pets: false,
  interests: "cooking, hiking",
};

beforeEach(() => {
  upsert.mockClear();
});

describe("PUT /api/roommate", () => {
  it("accepts a freshly-registered profile with null gender/bio/city", async () => {
    const res = await PUT(
      putRequest({ ...basePayload, gender: null, bio: null, city: null }),
    );
    expect(res.status).toBe(200);
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it("round-trips the exact shape the GET endpoint returns", async () => {
    // Full DB record, including fields the client echoes back untouched.
    const res = await PUT(
      putRequest({
        id: "p1",
        userId: "u1",
        createdAt: "2026-01-01T00:00:00.000Z",
        ...basePayload,
        gender: null,
        bio: null,
        city: "Austin",
      }),
    );
    expect(res.status).toBe(200);
    const saved = upsert.mock.calls[0][0].update as Record<string, unknown>;
    // Server-managed fields must never reach the database write.
    expect(saved).not.toHaveProperty("id");
    expect(saved).not.toHaveProperty("userId");
    expect(saved).not.toHaveProperty("createdAt");
    expect(saved.city).toBe("Austin");
  });

  it("still accepts filled-in optional fields", async () => {
    const res = await PUT(
      putRequest({ ...basePayload, gender: "any", bio: "hi", city: "Denver" }),
    );
    expect(res.status).toBe(200);
  });

  it("rejects out-of-range ratings", async () => {
    const res = await PUT(putRequest({ ...basePayload, cleanliness: 9 }));
    expect(res.status).toBe(400);
    expect(upsert).not.toHaveBeenCalled();
  });
});
