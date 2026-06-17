import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  FileText,
  MapPin,
  Maximize,
  PawPrint,
  Sofa,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApartmentActions } from "@/components/apartment-actions";
import { LeaseAnalyzer } from "@/components/ai/lease-analyzer";
import { NeighborhoodInsights } from "@/components/ai/neighborhood-insights";
import { LifestyleFit } from "@/components/ai/lifestyle-fit";
import { BudgetCalculator } from "@/components/budget-calculator";
import { formatCurrency, formatDate, parseList } from "@/lib/utils";

export default async function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const [apartment, favorite, profile] = await Promise.all([
    prisma.apartment.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    }),
    prisma.favorite.findUnique({
      where: { userId_apartmentId: { userId, apartmentId: id } },
    }),
    prisma.roommateProfile.findUnique({ where: { userId } }),
  ]);

  if (!apartment) notFound();

  const amenities = parseList(apartment.amenities);
  const budget = profile?.budgetMax ?? 2000;
  const facts = [
    { icon: BedDouble, label: `${apartment.bedrooms} bedrooms` },
    { icon: Bath, label: `${apartment.bathrooms} bathrooms` },
    { icon: Maximize, label: `${apartment.sqft.toLocaleString()} sqft` },
    { icon: CalendarDays, label: `Available ${formatDate(apartment.availableFrom)}` },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <Link
        href="/apartments"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="overflow-hidden rounded-xl border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={apartment.imageUrl || `https://picsum.photos/seed/${apartment.id}/1200/500`}
          alt={apartment.title}
          className="h-64 w-full object-cover sm:h-80"
        />
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold">{apartment.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {apartment.address}, {apartment.neighborhood ? `${apartment.neighborhood}, ` : ""}
            {apartment.city}, {apartment.state}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(apartment.rent)}
            <span className="text-base font-normal text-muted-foreground">/mo</span>
          </p>
        </div>
      </div>

      <ApartmentActions
        apartmentId={apartment.id}
        ownerId={apartment.createdBy?.id}
        initialFavorited={Boolean(favorite)}
        initialShortlisted={Boolean(favorite?.shortlisted)}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
            <f.icon className="h-4 w-4 text-primary" />
            {f.label}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About this place</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{apartment.description}</p>
          <div className="flex flex-wrap gap-2">
            {apartment.petFriendly && (
              <Badge variant="success" className="gap-1">
                <PawPrint className="h-3 w-3" /> Pet friendly
              </Badge>
            )}
            {apartment.furnished && (
              <Badge variant="secondary" className="gap-1">
                <Sofa className="h-3 w-3" /> Furnished
              </Badge>
            )}
            {amenities.map((a) => (
              <Badge key={a} variant="outline">
                {a}
              </Badge>
            ))}
          </div>
          {apartment.commuteNotes && (
            <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
              <Car className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Commute notes</p>
                <p className="text-muted-foreground">{apartment.commuteNotes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Budget fit calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetCalculator rent={apartment.rent} defaultIncome={Math.round(budget / 0.3)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> AI lifestyle fit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LifestyleFit
            apartment={`${apartment.title} in ${apartment.city} (${apartment.bedrooms}bd/${apartment.bathrooms}ba)`}
            rent={apartment.rent}
            defaultBudget={budget}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> AI neighborhood pros &amp; cons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NeighborhoodInsights
            neighborhood={apartment.neighborhood}
            city={apartment.city}
            state={apartment.state}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> AI lease analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaseAnalyzer initialText={apartment.leaseText || ""} />
        </CardContent>
      </Card>
    </div>
  );
}
