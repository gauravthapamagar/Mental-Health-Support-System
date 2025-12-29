"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Check if user is logged in on page refresh
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const res = await api.get("/profile/");
          setUser(res.data);
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // 2. Login Logic
  const login = async (payload: any) => {
    const res = await api.post("/login/", payload);
    const { access, refresh, user } = res.data;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setUser(user);

    // Role-based redirection
    if (user.role === "therapist") router.push("/dashboard/therapist");
    else router.push("/dashboard/patient");
  };

  // 3. Register Logic
  const register = async (payload: any) => {
    const res = await api.post("/register/", payload);
    const { access, refresh, user } = res.data;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setUser(user);

    router.push(
      user.role === "therapist" ? "/dashboard/therapist" : "/dashboard/patient"
    );
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
