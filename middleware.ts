import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/apartments",
  "/compare",
  "/roommates",
  "/favorites",
  "/messages",
  "/profile",
  "/admin",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (isProtected && !req.auth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Admin gate
  if (pathname.startsWith("/admin") && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/apartments/:path*",
    "/compare/:path*",
    "/roommates/:path*",
    "/favorites/:path*",
    "/messages/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
