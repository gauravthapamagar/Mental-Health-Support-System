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
    data: PatientRegistrationData
  ): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register/patient/", data);
    return response.data;
  },

  // Register Therapist
  registerTherapist: async (
    data: TherapistRegistrationData
  ): Promise<AuthResponse> => {
    const response = await axiosInstance.post(
      "/auth/register/therapist/",
      data
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
      data
    );
    return response.data;
  },
};
export const therapistAPI = {
  // Get Therapist Profile
  getProfile: async () => {
    const response = await axiosInstance.get("/therapist/profile/me/");
    return response.data;
  },

  // Complete Therapist Profile
  completeProfile: async (data: any) => {
    const response = await axiosInstance.post(
      "/therapist/profile/complete/",
      data
    );
    return response.data;
  },

  // Update Therapist Profile
  updateProfile: async (data: any) => {
    const response = await axiosInstance.put(
      "/therapist/profile/update/",
      data
    );
    return response.data;
  },
};

export default { authAPI, therapistAPI, patientAPI };
