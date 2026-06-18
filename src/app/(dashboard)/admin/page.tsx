import { redirect } from "next/navigation";
import { Building2, Heart, MessageSquare, Users, UserCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { SyncListings } from "@/components/admin/sync-listings";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const [users, apartments, favorites, messages, profiles, recentUsers, recentApts, allApts] =
    await Promise.all([
      prisma.user.count(),
      prisma.apartment.count(),
      prisma.favorite.count(),
      prisma.message.count(),
      prisma.roommateProfile.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.apartment.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, title: true, city: true, rent: true, createdAt: true },
      }),
      prisma.apartment.findMany({ select: { rent: true, city: true } }),
    ]);

  const buckets = [
    { range: "<$1k", count: 0 },
    { range: "$1–1.5k", count: 0 },
    { range: "$1.5–2k", count: 0 },
    { range: "$2–3k", count: 0 },
    { range: "$3k+", count: 0 },
  ];
  for (const a of allApts) {
    if (a.rent < 1000) buckets[0].count++;
    else if (a.rent < 1500) buckets[1].count++;
    else if (a.rent < 2000) buckets[2].count++;
    else if (a.rent < 3000) buckets[3].count++;
    else buckets[4].count++;
  }

  const byCity = Object.entries(
    allApts.reduce<Record<string, number>>((acc, a) => {
      acc[a.city] = (acc[a.city] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const stats = [
    { label: "Users", value: users, icon: Users },
    { label: "Listings", value: apartments, icon: Building2 },
    { label: "Roommate profiles", value: profiles, icon: UserCheck },
    { label: "Favorites", value: favorites, icon: Heart },
    { label: "Messages", value: messages, icon: MessageSquare },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <p className="text-muted-foreground">Platform overview and recent activity.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Import live listings</CardTitle>
        </CardHeader>
        <CardContent>
          <SyncListings />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rent distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={buckets} xKey="range" yKey="count" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Listings by city</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={byCity} xKey="city" yKey="count" color="var(--accent-foreground)" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between border-b py-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{u.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="text-right">
                  {u.role === "ADMIN" && <Badge variant="warning">Admin</Badge>}
                  <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentApts.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b py-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(a.rent)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
