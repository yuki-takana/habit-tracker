import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/todos/:path*",
    "/habits/:path*",
    "/workouts/:path*",
    "/insights/:path*",
    "/coding/:path*",
    "/settings/:path*",
    "/tasks/:path*",
    "/test-agents/:path*",
    "/billing/:path*",
    "/blueprints/:path*",
    "/challenges/:path*",
    "/coding/:path*",
    "/daily-goals/:path*",
    "/journey/:path*",
    "/routines/:path*",
    "/"
  ],
};