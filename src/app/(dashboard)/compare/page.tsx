import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompareView } from "@/components/compare-view";

export default async function ComparePage() {
  const session = await auth();
  const userId = session!.user.id;

  const [apartments, profile] = await Promise.all([
    prisma.apartment.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.roommateProfile.findUnique({ where: { userId } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Compare apartments</h1>
        <p className="text-muted-foreground">
          Stack listings side by side on price, space, and amenities.
        </p>
      </div>
      <CompareView apartments={apartments} budget={profile?.budgetMax ?? 0} />
    </div>
  );
}
