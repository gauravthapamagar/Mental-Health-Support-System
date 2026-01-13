const API_BASE_URL = "http://localhost:8000/api";

export const adminApiCall = async (endpoint: string, options: any = {}) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null; // Changed from accessToken

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token"); // Changed from accessToken
        window.location.href = "/auth/login"; // Changed from /login
      }
      return null;
    }

    const data = await response.json();
    return { data, ok: response.ok, status: response.status };
  } catch (error: any) {
    console.error("API Error:", error);
    return { error: error.message, ok: false };
  }
};
