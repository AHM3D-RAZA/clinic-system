import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_PATH, SESSION_COOKIE } from "@/lib/auth/constants";
import { resolveStaffFromToken } from "@/lib/auth/resolveStaff";
import { unauthorizedResponse } from "@/lib/auth/unauthorized";

/**
 * First line of defence for staff-only surfaces (Next 16 "proxy", the
 * renamed middleware). Runs before rendering, including for client-side
 * navigations, which layouts alone would NOT re-check.
 *
 *  - /dashboard/*            → redirect to /login?next=… when signed out
 *  - /api/bookings/<id>[/…]  → 401 JSON when signed out
 *
 * Deliberately NOT matched: `/`, `/book`, `/login`, and `POST /api/bookings`
 * (public booking submission). The dashboard layout and the API route
 * handlers repeat the check (defence in depth).
 */
export async function proxy(request: NextRequest) {
  const staff = await resolveStaffFromToken(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname, search } = request.nextUrl;

  if (!staff) {
    if (pathname.startsWith("/api/")) return unauthorizedResponse();
    const login = new URL(LOGIN_PATH, request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/bookings/:path+"],
};
