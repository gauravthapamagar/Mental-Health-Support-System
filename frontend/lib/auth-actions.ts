// lib/auth-actions.ts - FIXED VERSION (Regular Cookies)
"use server";

import { cookies } from "next/headers";

/**
 * Server action to set authentication cookies (NOT HttpOnly so client can read them)
 */
export async function setAuthCookies(
  tokens: { access: string; refresh: string },
  userRole: string,
) {
  const cookieStore = await cookies();

  // Set access token (24 hours) - NOT httpOnly so JavaScript can read it
  cookieStore.set("access_token", tokens.access, {
    httpOnly: false, // ✅ CHANGED: Now JavaScript CAN read this
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  // Set refresh token (7 days) - Keep this HttpOnly for extra security
  cookieStore.set("refresh_token", tokens.refresh, {
    httpOnly: true, // ✅ Keep refresh token secure
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  // Set user role (not httpOnly, so client can read it)
  cookieStore.set("user_role", userRole, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

/**
 * Server action to clear authentication cookies on logout
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("user_role");
}

/**
 * Server action to get current auth status
 */
export async function getAuthStatus() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("access_token")?.value;
  const userRole = cookieStore.get("user_role")?.value;

  return {
    isAuthenticated: !!accessToken,
    role: userRole || null,
  };
}

/**
 * Server action to get access token (for API calls)
 */
export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value || null;
}
