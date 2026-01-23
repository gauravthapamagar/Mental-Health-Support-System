import axiosInstance from "./axios";

// Types for API requests and responses
export interface PatientRegistrationData {
  email: string;
  password: string;
  password2: string;
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  basic_health_info?: string;
  terms_accepted: boolean;
}

export interface TherapistRegistrationData {
  email: string;
  password: string;
  password2: string;
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  profession_type: string;
  license_id: string;
  years_of_experience: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    redirect_url: string;
    [key: string]: any;
  };
  tokens: {
    access: string;
    refresh: string;
  };
  redirect_url: string;
  profile_completed?: boolean;
}

// API Functions
export const authAPI = {
  // Register Patient
  registerPatient: async (
    data: PatientRegistrationData,
  ): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register/patient/", data);
    return response.data;
  },

  // Register Therapist
  registerTherapist: async (
    data: TherapistRegistrationData,
  ): Promise<AuthResponse> => {
    const response = await axiosInstance.post(
      "/auth/register/therapist/",
      data,
    );
    return response.data;
  },

  // Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/login/", data);
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await axiosInstance.get("/auth/me/");
    return response.data;
  },

  // Refresh Token
  refreshToken: async (refreshToken: string) => {
    const response = await axiosInstance.post("/auth/token/refresh/", {
      refresh: refreshToken,
    });
    return response.data;
  },

  // Logout (client-side token removal)
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};
export const patientAPI = {
  // Get Patient Profile (Matches your Django path: patient/profile/me/)
  getProfile: async () => {
    const response = await axiosInstance.get("/patient/profile/me/");
    return response.data;
  },

  // Update Patient Profile (Matches your Django path: patient/profile/update/)
  updateProfile: async (data: {
    emergency_contact_name: string;
    emergency_contact_phone: string;
    basic_health_info?: string;
  }) => {
    const response = await axiosInstance.patch(
      "/patient/profile/update/",
      data,
    );
    return response.data;
  },
};
export const therapistAPI = {
  // Get Therapist Profile
  async getProfile(): Promise<TherapistProfile> {
    const response = await axiosInstance.get("/therapist/profile/me/");
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await axiosInstance.get("/booking/stats/");
    return response.data;
  },

  // Complete Therapist Profile
  completeProfile: async (data: any) => {
    const response = await axiosInstance.post(
      "/therapist/profile/complete/",
      data,
    );
    return response.data;
  },

  // Update Therapist Profile - Handle both JSON and FormData
  updateProfile: async (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    
    const response = await axiosInstance.put(
      "/therapist/profile/update/",
      data,
      isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : {}
    );
    return response.data;
  },
  async updateProfile(formData: FormData): Promise<TherapistProfile> {
    const response = await axiosInstance.put(
      "/therapist/profile/update/",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
  
};
export interface RecommendedBlog {
  blog: {
    id: number;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    cover_image: string | null;
    reading_time: number; // Added to match your model
  };
  reason: string;
  recommendation_type: string; // Matched to corrected backend
}
// lib/api.ts -> Update the blogAPI object
export const blogAPI = {
  getBlogs: async (params?: any) => {
    const response = await axiosInstance.get("/blog/", { params });
    return response.data;
  },

  getRecommendations: async (): Promise<RecommendedBlog[]> => {
    const response = await axiosInstance.get("/blog/recommendations/");
    return response.data;
  },

  // Alias both names so your components don't break
  getBlogDetail: async (slug: string) => {
    const response = await axiosInstance.get(`/blog/${slug}/`);
    return response.data;
  },

  getBlogBySlug: async (slug: string) => {
    const response = await axiosInstance.get(`/blog/${slug}/`);
    return response.data;
  },

  toggleLike: async (slug: string) => {
    const response = await axiosInstance.post(`/blog/like/${slug}/`);
    return response.data;
  },
};
export const bookingAPI = {
  // Get therapists for the booking list
  listTherapists: async (params?: {
    specialization?: string;
    mode?: string;
    page?: number;
  }) => {
    const response = await axiosInstance.get("/booking/therapists/", {
      params,
    });
    return response.data; // Returns { results: [], count: ... }
  },

  // Get slots for a specific therapist
  getAvailableSlots: async (therapistId: number) => {
    const response = await axiosInstance.get(
      `/booking/therapists/${therapistId}/slots/`,
    );
    return response.data; // Returns { therapist_id, therapist_name, slots }
  },

  // Create the appointment
  createAppointment: async (data: any) => {
    const response = await axiosInstance.post(
      "/booking/appointments/create/",
      data,
    );
    return response.data;
  },

  // Fetch appointments for the current user (Patient perspective)
  getMyAppointments: async (filterType: string) => {
    const response = await axiosInstance.get("/booking/appointments/my/", {
      params: { filter: filterType },
    });
    return response.data; // Returns { count, results: [...] }
  },

  // NEW: Fetch appointments for the therapist dashboard
  // lib/api/index.ts
  getTherapistAppointments: async (filterType: string) => {
    const response = await axiosInstance.get(
      "/booking/therapist/appointments/",
      { params: { filter: filterType } }, // This sends ?filter=upcoming to Django
    );
    return response.data;
  },

  // NEW: Confirm an appointment (Therapist action)
  confirmAppointment: async (
    id: number,
    data: { meeting_link: string; therapist_notes: string },
  ) => {
    const response = await axiosInstance.post(
      `/booking/therapist/appointments/${id}/confirm/`,
      data,
    );
    return response.data;
  },

  cancelAppointment: async (id: number, reason: string) => {
    const response = await axiosInstance.post(
      `/booking/appointments/${id}/cancel/`,
      {
        cancellation_reason: reason,
      },
    );
    return response.data;
  },

  rescheduleAppointment: async (
    id: number,
    data: { new_date: string; new_start_time: string; reason?: string },
  ) => {
    const response = await axiosInstance.post(
      `/booking/appointments/${id}/reschedule/`,
      data,
    );
    return response.data;
  },
};
export default { authAPI, therapistAPI, patientAPI, blogAPI, bookingAPI };
