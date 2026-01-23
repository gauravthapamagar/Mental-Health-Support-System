// middleware.ts - COMPLETELY FIXED VERSION
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup", "/blog", "/support"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for Next.js internal routes
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("/api/") ||
    pathname.includes("/static") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  console.log("🔐 Middleware Check:", pathname);

  // Get tokens from cookies
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const userRole = request.cookies.get("user_role")?.value;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // ✅ FIXED: If authenticated user tries to access auth pages, redirect to their dashboard
  if (
    accessToken &&
    (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))
  ) {
    try {
      const user = await verifyToken(accessToken);

      if (user?.role === "patient") {
        console.log("✅ Patient already logged in - redirect to /patient");
        return NextResponse.redirect(new URL("/patient", request.url));
      } else if (user?.role === "therapist") {
        console.log(
          "✅ Therapist already logged in - redirect to /therapist/dashboard",
        );
        return NextResponse.redirect(
          new URL("/therapist/dashboard", request.url),
        );
      } else if (user?.role === "admin") {
        console.log("✅ Admin already logged in - redirect to /admin");
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } catch (error) {
      console.log("❌ Token invalid - allow access to login");
      const response = NextResponse.next();
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("user_role");
      return response;
    }
  }

  // ✅ FIXED: Protected route check - redirect to login if no token
  if (
    !accessToken &&
    (pathname.startsWith("/patient") ||
      pathname.startsWith("/therapist") ||
      pathname.startsWith("/admin"))
  ) {
    console.log("❌ No token - redirecting to login");
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    const response = NextResponse.redirect(loginUrl);

    // Clear any stale cookies
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    response.cookies.delete("user_role");

    return response;
  }

  // Allow public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ✅ Role-based access control for protected routes
  if (accessToken) {
    try {
      const user = await verifyToken(accessToken);

      if (!user) {
        throw new Error("Invalid token");
      }

      console.log("✅ Token verified - User role:", user.role);

      // Check role-based access
      if (pathname.startsWith("/patient") && user.role !== "patient") {
        console.log("❌ Wrong role for /patient - redirecting");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      if (pathname.startsWith("/therapist") && user.role !== "therapist") {
        console.log("❌ Wrong role for /therapist - redirecting");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      if (pathname.startsWith("/admin") && user.role !== "admin") {
        console.log("❌ Wrong role for /admin - redirecting");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      // Add user role to response headers for client-side access
      const response = NextResponse.next();
      response.headers.set("X-User-Role", user.role);

      // Set cache control headers to prevent back button issues
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      console.log("✅ Access granted to:", pathname);
      return response;
    } catch (error) {
      console.error("❌ Token verification failed:", error);

      // ✅ Try to refresh token
      if (refreshToken) {
        try {
          console.log("🔄 Attempting to refresh token...");
          const newTokens = await refreshAccessToken(refreshToken);

          if (newTokens) {
            console.log("✅ Token refreshed successfully");
            const response = NextResponse.next();

            // Set new access token
            response.cookies.set("access_token", newTokens.access, {
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24, // 24 hours
              path: "/",
            });

            // Set cache control
            response.headers.set(
              "Cache-Control",
              "no-store, no-cache, must-revalidate",
            );
            response.headers.set("Pragma", "no-cache");
            response.headers.set("Expires", "0");

            return response;
          }
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
        }
      }

      // Redirect to login if token refresh fails
      console.log("❌ All auth failed - redirecting to login");
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);

      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("user_role");

      return response;
    }
  }

  const response = NextResponse.next();
  // Always set no-cache headers for protected routes
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

// ✅ Verify JWT token by calling backend
async function verifyToken(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/me/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Token verification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Token verification error:", error);
    throw error;
  }
}

// ✅ Refresh access token
async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
}

// Configure which paths to run middleware on
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
