import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Building2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:block">
        <Sidebar user={session.user} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b px-4 md:hidden">
          <div className="flex items-center gap-2 font-bold">
            <Building2 className="h-5 w-5 text-primary" />
            NestMate
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
