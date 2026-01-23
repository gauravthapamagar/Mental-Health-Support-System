// lib/axios.ts - FIXED VERSION
import axios from "axios";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important: Allow cookies to be sent
});

// ✅ FIXED: Helper to get cookie value (works with regular cookies now)
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
};

// ✅ Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from cookie first (now readable!)
    let token = getCookie("access_token");

    // Fallback to localStorage for backward compatibility
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("access_token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ✅ FIXED: Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to get refresh token from cookie first
        let refreshToken = getCookie("refresh_token");

        // Note: refresh_token is HttpOnly, so getCookie won't work for it
        // We need to get it from localStorage as fallback
        if (!refreshToken && typeof window !== "undefined") {
          refreshToken = localStorage.getItem("refresh_token");
        }

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        console.log("🔄 Refreshing access token...");

        // Try to refresh the token
        const response = await axios.post(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
          }/auth/token/refresh/`,
          { refresh: refreshToken },
        );

        const { access, refresh } = response.data;

        console.log("✅ Token refreshed successfully");

        // Store new tokens in both localStorage AND cookies
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", access);
          if (refresh) {
            localStorage.setItem("refresh_token", refresh);
          }

          // Also update cookies (set on client side since access_token is not HttpOnly)
          document.cookie = `access_token=${access}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);

        // Refresh failed, clear tokens and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_role");

          // Clear cookies
          document.cookie =
            "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
