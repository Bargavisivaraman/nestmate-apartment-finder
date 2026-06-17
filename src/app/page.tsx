import Link from "next/link";
import {
  Building2,
  Users,
  Sparkles,
  Calculator,
  Heart,
  MessageSquare,
  BarChart3,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  { icon: Building2, title: "Listing dashboard", desc: "Browse, search, and filter apartments with rich detail." },
  { icon: BarChart3, title: "Side-by-side compare", desc: "Stack listings against each other on rent, space, and amenities." },
  { icon: Users, title: "Roommate matching", desc: "Get a compatibility score based on budget, habits, and lifestyle." },
  { icon: Sparkles, title: "AI lease analyzer", desc: "Plain-English lease summaries with red-flag detection." },
  { icon: Sparkles, title: "AI neighborhood insights", desc: "Honest pros and cons for any area before you commit." },
  { icon: Calculator, title: "Budget fit calculator", desc: "See if rent fits the 30% rule, split across roommates." },
  { icon: Heart, title: "Favorites & shortlist", desc: "Save places and build a shortlist you can act on." },
  { icon: MessageSquare, title: "Messaging", desc: "Reach out to roommates and landlords in-app." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Building2 className="h-6 w-6 text-primary" />
            NestMate
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-accent px-4 py-1.5 text-sm text-accent-foreground">
            <Sparkles className="h-4 w-4" />
            AI-powered apartment hunting
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Find your place. Find your people.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            NestMate helps you discover apartments, compare listings, match with
            compatible roommates, and use AI to know whether a place truly fits your
            lifestyle and budget.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start finding apartments
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                I already have an account
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Demo account: <span className="font-mono">demo@nestmate.app</span> /{" "}
            <span className="font-mono">password123</span>
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title} className="transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t bg-muted/40">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 text-center sm:grid-cols-3">
            <div>
              <Moon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <h3 className="font-semibold">Dark &amp; light mode</h3>
              <p className="text-sm text-muted-foreground">Looks great any time of day.</p>
            </div>
            <div>
              <BarChart3 className="mx-auto mb-2 h-6 w-6 text-primary" />
              <h3 className="font-semibold">Rent vs budget charts</h3>
              <p className="text-sm text-muted-foreground">Visualize affordability instantly.</p>
            </div>
            <div>
              <Users className="mx-auto mb-2 h-6 w-6 text-primary" />
              <h3 className="font-semibold">Built for roommates</h3>
              <p className="text-sm text-muted-foreground">Match, message, and move in together.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-muted-foreground">
          NestMate — AI Apartment Finder &amp; Roommate Matcher. Built with Next.js,
          Prisma, and OpenAI.
        </div>
      </footer>
    </div>
  );
}
