import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CONFIG } from "@/lib/config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // 1. Define route types
  const guestOnlyRoutes = ["/login", "/register"];
  const publicRoutes = ["/403", "/_next", "/api/auth", "/favicon.ico"];
  const isGuestOnlyRoute = guestOnlyRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route)) || pathname === "/";

  // 2. If it's a guest-only route and we have a token, we might need to redirect
  if (isGuestOnlyRoute && token) {
    try {
      const response = await fetch(`${CONFIG.API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        const roles = user.roles || [];

        // Redirect to appropriate dashboard based on role
        if (roles.includes("admin")) {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } else if (roles.includes("client")) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        // Fallback to home if no specific role dashboard
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // If error fetching user, let them stay on login page but maybe clear cookie
      console.error("Middleware Auth Check Error:", error);
    }
  }

  // 3. If it's a public route and NOT a guest-only route (where we already handled redirection), allow it
  if (isPublicRoute && !isGuestOnlyRoute) {
    return NextResponse.next();
  }

  // 4. Handle protected routes
  if (!token) {
    // Only redirect if it's NOT a guest-only route (to avoid infinite loops)
    if (!isGuestOnlyRoute) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    const response = await fetch(`${CONFIG.API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    // Handle Unauthorized
    if (!response.ok) {
      if (isGuestOnlyRoute) return NextResponse.next();

      const loginUrl = new URL("/login", request.url);
      const nextResponse = NextResponse.redirect(loginUrl);
      nextResponse.cookies.delete("token"); // Clear invalid token
      return nextResponse;
    }

    const data = await response.json();
    const user = data.user || data;
    const roles = user.roles || [];
    const isAdmin = roles.includes("admin");
    const isClient = roles.includes("client");

    // Guest only routes check again (safety)
    if (isGuestOnlyRoute) {
      if (isAdmin) return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      if (isClient) return NextResponse.redirect(new URL("/dashboard", request.url));
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Role-based Protections
    if (pathname.startsWith("/admin")) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/403", request.url));
      }
    }

    if (pathname.startsWith("/dashboard")) {
      if (!isClient) {
        if (isAdmin) {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/403", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Protected Route Error:", error);
    if (isGuestOnlyRoute || isPublicRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
