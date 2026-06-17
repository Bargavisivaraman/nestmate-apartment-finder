import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApartmentBrowser } from "@/components/apartment-browser";
import { Button } from "@/components/ui/button";

export default async function ApartmentsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [apartments, favorites] = await Promise.all([
    prisma.apartment.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.favorite.findMany({ where: { userId }, select: { apartmentId: true } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Browse apartments</h1>
          <p className="text-muted-foreground">
            Search listings and save the ones you like.
          </p>
        </div>
        <Link href="/apartments/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add listing</span>
          </Button>
        </Link>
      </div>

      <ApartmentBrowser
        apartments={apartments}
        favoriteIds={favorites.map((f) => f.apartmentId)}
      />
    </div>
  );
}
