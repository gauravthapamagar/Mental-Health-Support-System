// import axiosInstance from "./axios";

// // Types for API requests and responses
// export interface PatientRegistrationData {
//   email: string;
//   password: string;
//   password2: string;
//   full_name: string;
//   phone_number: string;
//   date_of_birth: string;
//   gender: string;
//   emergency_contact_name: string;
//   emergency_contact_phone: string;
//   basic_health_info?: string;
//   terms_accepted: boolean;
// }

// export interface TherapistRegistrationData {
//   email: string;
//   password: string;
//   password2: string;
//   full_name: string;
//   phone_number: string;
//   date_of_birth: string;
//   gender: string;
//   profession_type: string;
//   license_id: string;
//   years_of_experience: number;
// }

// export interface LoginData {
//   email: string;
//   password: string;
// }

// export interface AuthResponse {
//   message: string;
//   user: {
//     id: number;
//     email: string;
//     full_name: string;
//     role: string;
//     redirect_url: string;
//     [key: string]: any;
//   };
//   tokens: {
//     access: string;
//     refresh: string;
//   };
//   redirect_url: string;
//   profile_completed?: boolean;
// }

// // API Functions
// export const authAPI = {
//   // Register Patient
//   registerPatient: async (
//     data: PatientRegistrationData,
//   ): Promise<AuthResponse> => {
//     const response = await axiosInstance.post("/auth/register/patient/", data);
//     return response.data;
//   },

//   // Register Therapist
//   registerTherapist: async (
//     data: TherapistRegistrationData,
//   ): Promise<AuthResponse> => {
//     const response = await axiosInstance.post(
//       "/auth/register/therapist/",
//       data,
//     );
//     return response.data;
//   },

//   // Login
//   login: async (data: LoginData): Promise<AuthResponse> => {
//     const response = await axiosInstance.post("/auth/login/", data);
//     return response.data;
//   },

//   // Get Current User
//   getCurrentUser: async () => {
//     const response = await axiosInstance.get("/auth/me/");
//     return response.data;
//   },

//   // Refresh Token
//   refreshToken: async (refreshToken: string) => {
//     const response = await axiosInstance.post("/auth/token/refresh/", {
//       refresh: refreshToken,
//     });
//     return response.data;
//   },

//   // Logout (client-side token removal)
//   logout: () => {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//   },
// };

// export const patientAPI = {
//   // Get Patient Profile (Matches your Django path: patient/profile/me/)
//   getProfile: async () => {
//     const response = await axiosInstance.get("/patient/profile/me/");
//     return response.data;
//   },

//   // Update Patient Profile (Matches your Django path: patient/profile/update/)
//   updateProfile: async (data: {
//     emergency_contact_name: string;
//     emergency_contact_phone: string;
//     basic_health_info?: string;
//   }) => {
//     const response = await axiosInstance.patch(
//       "/patient/profile/update/",
//       data,
//     );
//     return response.data;
//   },
// };

// export interface TherapistProfile {
//   [key: string]: any;
// }

// export const therapistAPI = {
//   // Get Therapist Profile
//   async getProfile(): Promise<TherapistProfile> {
//     const response = await axiosInstance.get("/therapist/profile/me/");
//     return response.data;
//   },
//   getDashboardStats: async () => {
//     const response = await axiosInstance.get("/booking/stats/");
//     return response.data;
//   },

//   // Complete Therapist Profile
//   completeProfile: async (data: any) => {
//     const response = await axiosInstance.post(
//       "/therapist/profile/complete/",
//       data,
//     );
//     return response.data;
//   },

//   // Update Therapist Profile - Handle both JSON and FormData
//   updateProfile: async (data: FormData | any) => {
//     const isFormData = data instanceof FormData;

//     const response = await axiosInstance.put(
//       "/therapist/profile/update/",
//       data,
//       isFormData
//         ? {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         : {},
//     );
//     return response.data;
//   },
// };

// export interface RecommendedBlog {
//   blog: {
//     id: number;
//     title: string;
//     slug: string;
//     category: string;
//     excerpt: string;
//     cover_image: string | null;
//     reading_time: number;
//   };
//   reason: string;
//   recommendation_type: string;
// }

// export const blogAPI = {
//   getBlogs: async (params?: any) => {
//     const response = await axiosInstance.get("/blog/", { params });
//     return response.data;
//   },

//   getRecommendations: async (): Promise<RecommendedBlog[]> => {
//     const response = await axiosInstance.get("/blog/recommendations/");
//     return response.data;
//   },

//   getBlogDetail: async (slug: string) => {
//     const response = await axiosInstance.get(`/blog/${slug}/`);
//     return response.data;
//   },

//   getBlogBySlug: async (slug: string) => {
//     const response = await axiosInstance.get(`/blog/${slug}/`);
//     return response.data;
//   },

//   toggleLike: async (slug: string) => {
//     const response = await axiosInstance.post(`/blog/like/${slug}/`);
//     return response.data;
//   },
// };

// export const bookingAPI = {
//   // Get therapists for the booking list
//   listTherapists: async (params?: {
//     specialization?: string;
//     mode?: string;
//     page?: number;
//   }) => {
//     const response = await axiosInstance.get("/booking/therapists/", {
//       params,
//     });
//     return response.data;
//   },

//   // Get slots for a specific therapist
//   getAvailableSlots: async (therapistId: number) => {
//     const response = await axiosInstance.get(
//       `/booking/therapists/${therapistId}/slots/`,
//     );
//     return response.data;
//   },

//   // Create the appointment
//   createAppointment: async (data: any) => {
//     const response = await axiosInstance.post(
//       "/booking/appointments/create/",
//       data,
//     );
//     return response.data;
//   },

//   // Fetch appointments for the current user (Patient perspective)
//   getMyAppointments: async (filterType: string) => {
//     const response = await axiosInstance.get("/booking/appointments/my/", {
//       params: { filter: filterType },
//     });
//     return response.data;
//   },

//   // Fetch appointments for the therapist dashboard
//   getTherapistAppointments: async (filterType: string) => {
//     const response = await axiosInstance.get(
//       "/booking/therapist/appointments/",
//       { params: { filter: filterType } },
//     );
//     return response.data;
//   },

//   // Confirm an appointment (Therapist action)
//   confirmAppointment: async (
//     id: number,
//     data: { meeting_link: string; therapist_notes: string },
//   ) => {
//     const response = await axiosInstance.post(
//       `/booking/therapist/appointments/${id}/confirm/`,
//       data,
//     );
//     return response.data;
//   },

//   // Cancel an appointment
//   cancelAppointment: async (id: number, reason: string) => {
//     try {
//       console.log("[v0] Cancelling appointment:", id);
//       console.log("[v0] Cancellation reason:", reason);

//       const response = await axiosInstance.post(
//         `/booking/appointments/${id}/cancel/`,
//         {
//           cancellation_reason: reason,
//         },
//       );

//       console.log("[v0] Cancel response status:", response.status);
//       console.log("[v0] Cancel response data:", response.data);
//       return response.data;
//     } catch (error: any) {
//       console.log("[v0] Cancel error status:", error.response?.status);
//       console.log("[v0] Cancel error data:", error.response?.data);
//       console.log("[v0] Cancel error message:", error.message);

//       // If 204 No Content (success with no response body)
//       if (error.response?.status === 204) {
//         console.log("[v0] Appointment cancelled successfully (204 response)");
//         return { success: true };
//       }

//       throw error;
//     }
//   },
//   getAppointmentDetail: async (appointmentId: string): Promise<any> => {
//     try {
//       if (!appointmentId) {
//         throw new Error('Appointment ID is required');
//       }
//       console.log('[v0] Fetching appointment details:', appointmentId);
//       const response = await axiosInstance.get(
//         `/booking/appointments/${appointmentId}/`
//       );
//       console.log('[v0] Appointment details fetched successfully');
//       return response.data;
//     } catch (error) {
//       console.error('[v0] Error fetching appointment details:', error);
//       throw error;
//     }
//   },

//   // Reschedule an appointment
//   rescheduleAppointment: async (
//     id: number,
//     data: { new_date: string; new_start_time: string; reason?: string },
//   ) => {
//     const response = await axiosInstance.post(
//       `/booking/appointments/${id}/reschedule/`,
//       data,
//     );
//     return response.data;
//   },
// };

// export default { authAPI, therapistAPI, patientAPI, blogAPI, bookingAPI };


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

// Journal Types
export interface JournalEntryData {
  title: string;
  content: string;
  mood: string;
  mood_intensity?: number;
  tags?: string[];
}

export interface JournalEntry extends JournalEntryData {
  id: number;
  created_at: string;
  updated_at: string;
  patient: number;
}

export interface MoodAnalytics {
  mood: string;
  count: number;
  percentage: number;
  date?: string;
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

export interface TherapistProfile {
  [key: string]: any;
}

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
      isFormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : {},
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
    reading_time: number;
  };
  reason: string;
  recommendation_type: string;
}

export const blogAPI = {
  getBlogs: async (params?: any) => {
    const response = await axiosInstance.get("/blog/", { params });
    return response.data;
  },

  getRecommendations: async (): Promise<RecommendedBlog[]> => {
    const response = await axiosInstance.get("/blog/recommendations/");
    return response.data;
  },

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
    return response.data;
  },

  // Get slots for a specific therapist
  getAvailableSlots: async (therapistId: number) => {
    const response = await axiosInstance.get(
      `/booking/therapists/${therapistId}/slots/`,
    );
    return response.data;
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
    return response.data;
  },

  // Fetch appointments for the therapist dashboard
  getTherapistAppointments: async (filterType: string) => {
    const response = await axiosInstance.get(
      "/booking/therapist/appointments/",
      { params: { filter: filterType } },
    );
    return response.data;
  },

  // Confirm an appointment (Therapist action)
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

  // Cancel an appointment
  cancelAppointment: async (id: number, reason: string) => {
    try {
      console.log("[v0] Cancelling appointment:", id);
      console.log("[v0] Cancellation reason:", reason);

      const response = await axiosInstance.post(
        `/booking/appointments/${id}/cancel/`,
        {
          cancellation_reason: reason,
        },
      );

      console.log("[v0] Cancel response status:", response.status);
      console.log("[v0] Cancel response data:", response.data);
      return response.data;
    } catch (error: any) {
      console.log("[v0] Cancel error status:", error.response?.status);
      console.log("[v0] Cancel error data:", error.response?.data);
      console.log("[v0] Cancel error message:", error.message);

      // If 204 No Content (success with no response body)
      if (error.response?.status === 204) {
        console.log("[v0] Appointment cancelled successfully (204 response)");
        return { success: true };
      }

      throw error;
    }
  },
  getAppointmentDetail: async (appointmentId: string): Promise<any> => {
    try {
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }
      console.log('[v0] Fetching appointment details:', appointmentId);
      const response = await axiosInstance.get(
        `/booking/appointments/${appointmentId}/`
      );
      console.log('[v0] Appointment details fetched successfully');
      return response.data;
    } catch (error) {
      console.error('[v0] Error fetching appointment details:', error);
      throw error;
    }
  },

  // Reschedule an appointment
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

// Journal API
export const journalAPI = {
  // Create a new journal entry
  createEntry: async (data: JournalEntryData): Promise<JournalEntry> => {
    const response = await axiosInstance.post("/journal/entries/", data);
    return response.data;
  },

  // Get all journal entries for the patient
  getEntries: async (params?: { page?: number; limit?: number }) => {
    const response = await axiosInstance.get("/journal/entries/", { params });
    return response.data;
  },

  // Get a specific journal entry
  getEntry: async (id: number): Promise<JournalEntry> => {
    const response = await axiosInstance.get(`/journal/entries/${id}/`);
    return response.data;
  },

  // Update a journal entry
  updateEntry: async (id: number, data: Partial<JournalEntryData>): Promise<JournalEntry> => {
    const response = await axiosInstance.patch(`/journal/entries/${id}/`, data);
    return response.data;
  },

  // Delete a journal entry
  deleteEntry: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/journal/entries/${id}/`);
  },

  // Get mood analytics
  getMoodAnalytics: async (days?: number): Promise<MoodAnalytics[]> => {
    const response = await axiosInstance.get("/journal/analytics/mood/", {
      params: { days: days || 30 },
    });
    return response.data;
  },

  // Get mood trend over time
  getMoodTrend: async (days?: number) => {
    const response = await axiosInstance.get("/journal/analytics/trend/", {
      params: { days: days || 30 },
    });
    return response.data;
  },

  // Get summary statistics
  getSummary: async () => {
    const response = await axiosInstance.get("/journal/analytics/summary/");
    return response.data;
  },
};

export default { authAPI, therapistAPI, patientAPI, blogAPI, bookingAPI, journalAPI };
