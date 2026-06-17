"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Building2,
  LayoutDashboard,
  Home,
  GitCompare,
  Users,
  Heart,
  MessageSquare,
  User,
  Shield,
  LogOut,
  Plus,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/apartments", label: "Apartments", icon: Home },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/roommates", label: "Roommates", icon: Users },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/profile", label: "My Profile", icon: User },
];

export function Sidebar({
  user,
}: {
  user: { name?: string | null; email: string; role: string };
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-5 font-bold">
        <Building2 className="h-6 w-6 text-primary" />
        NestMate
      </div>

      <div className="px-3 py-3">
        <Link href="/apartments/new">
          <Button className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            Add listing
          </Button>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        )}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials(user.name, user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name || "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
