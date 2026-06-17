import Link from "next/link";
import { Building2, Heart, ListChecks, TrendingUp, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApartmentCard } from "@/components/apartment-card";
import { RentBudgetChart } from "@/components/charts/rent-budget-chart";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [totalListings, favorites, profile, recent] = await Promise.all([
    prisma.apartment.count(),
    prisma.favorite.findMany({
      where: { userId },
      include: { apartment: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.roommateProfile.findUnique({ where: { userId } }),
    prisma.apartment.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const favIds = new Set(favorites.map((f) => f.apartmentId));
  const shortlist = favorites.filter((f) => f.shortlisted);
  const budget = profile?.budgetMax ?? 0;

  const avgRent = favorites.length
    ? Math.round(favorites.reduce((s, f) => s + f.apartment.rent, 0) / favorites.length)
    : 0;

  const chartData = favorites.slice(0, 8).map((f) => ({
    name: f.apartment.title.slice(0, 14),
    rent: f.apartment.rent,
  }));

  const stats = [
    { label: "Listings available", value: totalListings, icon: Building2 },
    { label: "Saved favorites", value: favorites.length, icon: Heart },
    { label: "On shortlist", value: shortlist.length, icon: ListChecks },
    {
      label: "Avg. saved rent",
      value: avgRent ? formatCurrency(avgRent) : "—",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back{session!.user.name ? `, ${session!.user.name}` : ""} 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s how your apartment search is shaping up.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Rent vs. your budget</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your saved apartments against a budget of{" "}
              {budget ? formatCurrency(budget) : "—"}.
            </p>
          </div>
          <Link href="/profile">
            <Button variant="outline" size="sm">
              Set budget
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <RentBudgetChart data={chartData} budget={budget} />
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent listings</h2>
          <Link
            href="/apartments"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((a) => (
            <ApartmentCard key={a.id} apartment={a} favorited={favIds.has(a.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
