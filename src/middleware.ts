import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAuthenticated = !!req.auth;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboardPage = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/budget") ||
    pathname.startsWith("/insights") ||
    pathname.startsWith("/scanner") ||
    pathname.startsWith("/profile");

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && isDashboardPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
