// import axios from "axios";

// // Create axios instance with base configuration
// const axiosInstance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Request interceptor to add auth token
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access_token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor to handle token refresh
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If error is 401 and we haven't tried to refresh token yet
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem("refresh_token");

//         if (!refreshToken) {
//           throw new Error("No refresh token available");
//         }

//         // Try to refresh the token
//         const response = await axios.post(
//           `${
//             process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
//           }/auth/token/refresh/`,
//           { refresh: refreshToken }
//         );

//         const { access, refresh } = response.data;

//         // Store new tokens
//         localStorage.setItem("access_token", access);
//         if (refresh) {
//           localStorage.setItem("refresh_token", refresh);
//         }

//         // Retry original request with new token
//         originalRequest.headers.Authorization = `Bearer ${access}`;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         // Refresh failed, clear tokens and redirect to login
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("refresh_token");
//         window.location.href = "/auth/login";
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );
// export default axiosInstance;


import axios from "axios";

// Create axios instance with Django API configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CSRF tokens and cookies
});

// Request Interceptor - Add auth token and CSRF token
axiosInstance.interceptors.request.use(
  (config) => {
    // Add JWT token from localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add CSRF token from cookie (Django requirement for POST/PUT/PATCH/DELETE)
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

      if (csrfToken) {
        config.headers["X-CSRFToken"] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor - Handle errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401, try to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://localhost:8000/api"}/auth/token/refresh/`,
            { refresh: refreshToken },
          );

          const newAccessToken = response.data.access;
          localStorage.setItem("access_token", newAccessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
