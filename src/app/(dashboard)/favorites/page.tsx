import Link from "next/link";
import { Heart, ListChecks } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApartmentCard } from "@/components/apartment-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function FavoritesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { apartment: true },
    orderBy: { createdAt: "desc" },
  });

  const shortlist = favorites.filter((f) => f.shortlisted);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Favorites &amp; shortlist</h1>
        <p className="text-muted-foreground">Everything you&apos;ve saved, in one place.</p>
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <ListChecks className="h-5 w-5 text-primary" /> Shortlist ({shortlist.length})
        </h2>
        {shortlist.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nothing shortlisted yet. Open a listing and tap “Shortlist” to flag your top picks.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shortlist.map((f) => (
              <ApartmentCard key={f.id} apartment={f.apartment} favorited />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Heart className="h-5 w-5 text-primary" /> All favorites ({favorites.length})
        </h2>
        {favorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted-foreground">
              You haven&apos;t saved any apartments yet.
              <Link href="/apartments">
                <Button>Browse apartments</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((f) => (
              <ApartmentCard key={f.id} apartment={f.apartment} favorited />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
