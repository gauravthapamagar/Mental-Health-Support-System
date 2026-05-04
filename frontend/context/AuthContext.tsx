// contexts/AuthContext.tsx - COMPLETELY FIXED VERSION
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  authAPI,
  PatientRegistrationData,
  TherapistRegistrationData,
  LoginData,
} from "@/lib/api";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth-actions";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  redirect_url: string;
  [key: string]: any;
}

type UserRole = "patient" | "therapist" | "admin";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (
    role: UserRole,
    data: PatientRegistrationData | TherapistRegistrationData,
  ) => Promise<any>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ FIXED: Helper to get cookie value (works with regular cookies)
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }

    return null;
  };

  // ✅ FIXED: Initialize authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      console.log("🔄 Initializing auth...");

      // Try to get token from cookies (now readable because httpOnly=false)
      let token = getCookie("access_token");

      // Fallback to localStorage for backward compatibility
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("access_token");
        console.log("📦 Found token in localStorage:", !!token);

        // Migrate to cookies if found in localStorage
        if (token) {
          const refreshToken = localStorage.getItem("refresh_token");
          const userRole = localStorage.getItem("user_role");

          if (refreshToken && userRole) {
            try {
              await setAuthCookies(
                { access: token, refresh: refreshToken },
                userRole,
              );
              console.log("✅ Migrated tokens to cookies");

              // Clear localStorage after migration
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              localStorage.removeItem("user_role");
            } catch (error) {
              console.error("❌ Failed to migrate to cookies:", error);
            }
          }
        }
      } else {
        console.log("🍪 Found token in cookies:", !!token);
      }

      if (token) {
        try {
          console.log("🔍 Fetching user data...");
          const userData = await authAPI.getCurrentUser();
          console.log("✅ User authenticated:", userData.role);
          setUser(userData);
        } catch (error) {
          console.error("❌ Failed to fetch user:", error);
          // Clear both cookies and localStorage
          await clearAuthCookies();
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_role");
          }
        }
      } else {
        console.log("ℹ️ No token found - user not authenticated");
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Registration
  const register = async (
    role: UserRole,
    data: PatientRegistrationData | TherapistRegistrationData,
  ) => {
    try {
      let response;

      if (role === "patient") {
        response = await authAPI.registerPatient(
          data as PatientRegistrationData,
        );
      } else {
        response = await authAPI.registerTherapist(
          data as TherapistRegistrationData,
        );
      }

      // Store JWT tokens in cookies via server action
      await setAuthCookies(response.tokens, response.user.role);

      // Also store in localStorage for backward compatibility
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", response.tokens.access);
        localStorage.setItem("refresh_token", response.tokens.refresh);
        localStorage.setItem("user_role", response.user.role);
      }

      // Set authenticated user
      setUser(response.user);

      return response;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // ✅ FIXED: Login function
  const login = async (data: LoginData) => {
    try {
      console.log("🔐 Logging in...");
      const response = await authAPI.login(data);

      // 1. Set cookies via server action
      await setAuthCookies(response.tokens, response.user.role);

      // 2. Store in localStorage for backward compatibility
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", response.tokens.access);
        localStorage.setItem("refresh_token", response.tokens.refresh);
        localStorage.setItem("user_role", response.user.role);
      }

      // 3. Set user state IMMEDIATELY
      setUser(response.user);
      console.log("✅ Login successful, role:", response.user.role);

      // 4. ✅ FIXED: Navigate to the correct landing page (not dashboard)
      if (response.user.role === "patient") {
        console.log("🏥 Redirecting to /patient");
        router.push("/patient");
      } else if (response.user.role === "therapist") {
        console.log("👨‍⚕️ Redirecting to /therapist/dashboard");
        router.push("/therapist/dashboard"); // Therapist goes directly to dashboard
      } else if (response.user.role === "admin") {
        console.log("👨‍💼 Redirecting to /admin");
        router.push("/admin");
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log("🚪 Logging out...");

      // Clear server-side cookies
      await clearAuthCookies();

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
      }

      // Clear user state
      setUser(null);

      // Redirect to login
      console.log("✅ Logout successful");
      router.push("/auth/login");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Force redirect even if server action fails
      router.push("/auth/login");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
