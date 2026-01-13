"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function verifyAdmin() {
      const { data, ok } = await apiCall("/auth/me/"); // Endpoint that returns current user profile

      if (ok && data.is_staff) {
        // Django uses 'is_staff' or 'role'
        setIsAdmin(true);
      } else {
        router.push("/login"); // Send them away if not admin
      }
      setIsLoading(false);
    }

    verifyAdmin();
  }, [router]);

  return { isAdmin, isLoading };
}
