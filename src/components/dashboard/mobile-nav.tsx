"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  GitCompare,
  Users,
  Heart,
  MessageSquare,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/apartments", label: "Browse", icon: Home },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/roommates", label: "Roommates", icon: Users },
  { href: "/favorites", label: "Saved", icon: Heart },
  { href: "/messages", label: "Chat", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-40 flex items-center gap-1 overflow-x-auto border-t bg-card px-2 py-1.5 md:hidden">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-[56px] flex-col items-center gap-0.5 rounded-md px-2 py-1 text-[11px]",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
