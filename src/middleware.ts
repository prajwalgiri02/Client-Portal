import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CONFIG } from "@/lib/config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Exclude public routes and static assets
  const publicRoutes = ["/login", "/register", "/403", "/_next", "/api/auth"];
  if (publicRoutes.some((route) => pathname.startsWith(route)) || pathname === "/") {
    return NextResponse.next();
  }

  // 2. Fetch user from Laravel backend
  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const response = await fetch(`${CONFIG.API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    // 3. Handle Unauthorized
    if (!response.ok) {
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token"); // Clear invalid token
      return response;
    }

    const data = await response.json();
    const user = data.user || data;
    const roles = user.roles || [];
    const isAdmin = roles.includes("admin");
    const isClient = roles.includes("client");

    // 4. Role-based Protections

    // Protect /admin Routes
    if (pathname.startsWith("/admin")) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/403", request.url));
      }
    }

    // Protect /dashboard Routes (for general users/clients)
    if (pathname.startsWith("/dashboard")) {
      if (!isClient) {
        // If admin tries to access /dashboard, redirect to /admin/dashboard
        if (isAdmin) {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/403", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Auth Error:", error);
    // On error (backend down?), redirecting to login is a safe default
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
