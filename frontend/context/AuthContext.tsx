"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  authAPI,
  PatientRegistrationData,
  TherapistRegistrationData,
  LoginData,
} from "@/lib/api";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  redirect_url: string;
  [key: string]: any;
}

type UserRole = "patient" | "therapist";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (
    role: UserRole,
    data: PatientRegistrationData | TherapistRegistrationData
  ) => Promise<any>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");

      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // ✅ Explicit role-based registration
  const register = async (
    role: UserRole,
    data: PatientRegistrationData | TherapistRegistrationData
  ) => {
    try {
      let response;

      if (role === "patient") {
        response = await authAPI.registerPatient(
          data as PatientRegistrationData
        );
      } else {
        response = await authAPI.registerTherapist(
          data as TherapistRegistrationData
        );
      }

      // Store JWT tokens
      localStorage.setItem("access_token", response.tokens.access);
      localStorage.setItem("refresh_token", response.tokens.refresh);

      // Set authenticated user
      setUser(response.user);

      return response;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Login
  const login = async (data: LoginData) => {
    try {
      const response = await authAPI.login(data);

      localStorage.setItem("access_token", response.tokens.access);
      localStorage.setItem("refresh_token", response.tokens.refresh);

      setUser(response.user);
      router.push(response.redirect_url);
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    authAPI.logout();
    setUser(null);
    router.push("/auth/login");
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
