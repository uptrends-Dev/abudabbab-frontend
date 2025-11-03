// middleware.ts (project root)
import { NextResponse } from "next/server";
const COOKIE_NAME = "access_token";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes except the login page itself
  const isAdminPath = pathname.startsWith("/dashboard");
  const isLoginPage = pathname === "/login";
  const isAdminPage = pathname === "/dashboard";

  if (isAdminPath && !isLoginPage) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // If already logged in, don't allow visiting /admin/login
  if (isLoginPage || isAdminPage) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/controlTrips";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard", "/api/dashboard/:path*", "/api/auth/:path*"],
};