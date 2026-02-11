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

  // Get My Patients
  getMyPatients: async () => {
    const response = await axiosInstance.get("/booking/therapist/patients/");
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

  getAwaitingPaymentAppointments: async () => {
    const response = await axiosInstance.get("/booking/appointments/my/", {
      params: { status: "awaiting_payment" },
    });
    return response.data;
  },

  // Create the appointment
  createAppointment: async (data: any) => {
    const response = await axiosInstance.post(
    "/booking/appointments/create/",
    data
    // No config needed - axios detects FormData automatically
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
  // Fetch appointments for the therapist dashboard
  getTherapistAppointments: async (filterType: string) => {
    const params: any = {};
    
    // Smart mapping for frontend tabs
    if (filterType === 'pending') {
      params.status = 'pending';
    } else if (filterType === 'history') {
      params.filter = 'past';
    } else if (filterType === 'all') {
      // No filter means get all
    } else {
      // Pass through for 'upcoming', 'today' etc.
      params.filter = filterType;
    }

    const response = await axiosInstance.get(
      "/booking/therapist/appointments/",
      { params },
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
    const response = await axiosInstance.post(
      `/booking/appointments/${id}/cancel/`,
      {
        cancellation_reason: reason,
      },
    );
    return response.data;
  },

  getAppointmentDetail: async (appointmentId: string): Promise<any> => {
    const response = await axiosInstance.get(
      `/booking/appointments/${appointmentId}/`
    );
    return response.data;
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

// Survey Types
export interface SurveyQuestion {
  id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'rating' | 'yes_no' | 'text';
  order: number;
  is_required: boolean;
  help_text?: string;
  rating_min?: number;
  rating_max?: number;
  rating_min_label?: string;
  rating_max_label?: string;
  options?: Array<{
    id: number;
    option_text: string;
    option_value: string;
    order: number;
    score?: number;
  }>;
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  assessment_type: 'standard' | 'custom' | 'both';
  is_active: boolean;
  questions: SurveyQuestion[];
  created: string;
}

export interface SurveyAnswer {
  question: number;
  answer_text?: string;
  answer_option?: number;
  answer_rating?: number;
  answer_yes_no?: boolean;
}

export interface SurveyResponse {
  id: number;
  survey: number;
  survey_title: string;
  status: 'in_progress' | 'submitted' | 'reviewed';
  created: string;
  completed_at?: string;
  total_score?: number;
  answers: Array<{
    id: number;
    question: number;
    question_text: string;
    question_type: string;
    answer_text?: string;
    answer_option?: number;
    option_text?: string;
    answer_rating?: number;
    answer_yes_no?: boolean;
  }>;
}

export const surveyAPI = {
  // Get all active surveys
  getSurveys: async (): Promise<Survey[]> => {
    const response = await axiosInstance.get('/surveys/surveys/');
    return response.data;
  },

  // Get specific survey with details
  getSurveyDetail: async (surveyId: number): Promise<Survey> => {
    const response = await axiosInstance.get(`/surveys/surveys/${surveyId}/`);
    return response.data;
  },

  // Get active survey for therapist matching
  getActiveAssessment: async (): Promise<Survey> => {
    const response = await axiosInstance.get('/surveys/surveys/active_survey/');
    return response.data;
  },

  // Start or continue therapist matching assessment
  startAssessment: async (): Promise<SurveyResponse> => {
    const response = await axiosInstance.post('/surveys/responses/start_assessment/');
    return response.data;
  },

  // Get current assessment (in-progress or latest)
  getCurrentAssessment: async (): Promise<SurveyResponse> => {
    const response = await axiosInstance.get('/surveys/responses/current_assessment/');
    return response.data;
  },

  // Get assessment history
  getAssessmentHistory: async () => {
    const response = await axiosInstance.get('/surveys/responses/assessment_history/');
    return response.data;
  },

  // Save a single answer and get dynamic questions
  saveAnswer: async (responseId: number, questionId: number, answerData: any) => {
    const response = await axiosInstance.post('/surveys/responses/save_answer/', {
      response_id: responseId,
      question_id: questionId,
      answer: answerData,
    });
    return response.data;
  },

  // Submit completed assessment
  submitAssessment: async (responseId: number): Promise<SurveyResponse> => {
    const response = await axiosInstance.post('/surveys/responses/submit_assessment/', {
      response_id: responseId,
    });
    return response.data;
  },

  // Check if patient can retake assessment
  canRetake: async () => {
    const response = await axiosInstance.get('/surveys/responses/can_retake/');
    return response.data;
  },

  // Get specific survey response
  getResponse: async (responseId: number): Promise<SurveyResponse> => {
    const response = await axiosInstance.get(`/surveys/responses/${responseId}/`);
    return response.data;
  },
  deleteAssessment: async (responseId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/surveys/responses/${responseId}/`);
      // 204 = success with no content
    } catch (error: any) {
      console.error("Failed to delete assessment:", error);
      throw new Error(
        error.response?.data?.detail || 
        "Failed to delete assessment. Please try again."
      );
    }
  },
};

// ============ MATCHING API ============
// Types for matching API responses
export interface TherapistMatchDetails {
  id: number;
  email: string;
  full_name: string;
  gender: string;
  profile: {
    profession_type: string;
    license_id: string;
    years_of_experience: number;
    specialization_tags: string[];
    languages_spoken: string[];
    consultation_mode: string;
    consultation_fees: number;
    bio: string;
    profile_picture: string | null;
    is_verified: boolean;
  };
  specializations: string[];
}

export interface MatchResult {
  rank: number;
  therapist: TherapistMatchDetails;
  score: number;
  compatibility_percentage: number;
}

export interface MatchingAPIResponse {
  success: boolean;
  message?: string;
  match_id?: number;
  results?: Array<{
    rank: number;
    therapist_id: number;
    therapist_name: string;
    score: number;
    reasons: string[];
    breakdown: {
      semantic_score: number;
      collaborative_score: number;
      specialization_score: number;
    };
  }>;
  data?: {
    id: number;
    survey_response: number;
    top_match_1: number;
    top_match_1_score: number;
    top_match_1_details: TherapistMatchDetails;
    top_match_2: number | null;
    top_match_2_score: number;
    top_match_2_details: TherapistMatchDetails | null;
    top_match_3: number | null;
    top_match_3_score: number;
    top_match_3_details: TherapistMatchDetails | null;
    matches: MatchResult[];
    matched_at: string;
    updated_at: string;
  };
}

export const matchingAPI = {
  /**
   * Find therapist matches for a patient's survey response
   * POST /api/matching/matches/find_matches/
   */
  findMatches: async (surveyResponseId: number): Promise<MatchingAPIResponse> => {
    const response = await axiosInstance.post('/matching/matches/find_matches/', {
      survey_response_id: surveyResponseId,
    });
    return response.data;
  },

  /**
   * Get the latest match for the current patient
   * GET /api/matching/matches/latest/
   */
  getLatestMatch: async (): Promise<MatchingAPIResponse> => {
    const response = await axiosInstance.get('/matching/matches/latest/');
    return response.data;
  },

  /**
   * Get specific match by ID
   * GET /api/matching/matches/{id}/
   */
  getMatchDetails: async (matchId: number): Promise<MatchingAPIResponse> => {
    const response = await axiosInstance.get(`/matching/matches/${matchId}/`);
    return response.data;
  },

  /**
   * Get all matches for the current patient
   * GET /api/matching/matches/
   */
  getAllMatches: async (): Promise<MatchingAPIResponse[]> => {
    const response = await axiosInstance.get('/matching/matches/');
    return response.data;
  },

  /**
   * Re-run matching algorithm for an existing match
   * POST /api/matching/matches/{id}/rematch/
   */
  rematch: async (matchId: number): Promise<MatchingAPIResponse> => {
    const response = await axiosInstance.post(`/matching/matches/${matchId}/rematch/`);
    return response.data;
  },
};

export interface PaymentInitiateResponse {
  payment_url: string;
  pidx: string;
  payment_id: number;
  amount: number;
  amount_display: string;
}

export interface PaymentVerifyResponse {
  message: string;
  payment: {
    id: number;
    appointment: number;
    khalti_pidx: string;
    khalti_transaction_id: string;
    amount: number;
    amount_display: string;
    status: string;
    initiated_at: string;
    completed_at: string;
  };
  appointment_status: string;
}

export interface PaymentStatusResponse {
  has_payment: boolean;
  payment: {
    id: number;
    appointment: number;
    khalti_pidx: string;
    khalti_transaction_id: string;
    amount: number;
    amount_display: string;
    status: string;
    initiated_at: string;
    completed_at: string;
  } | null;
}

// ──── Payment API ────
export const paymentAPI = {
  /**
   * Initiate a Khalti payment for an awaiting_payment appointment.
   * Redirects user to Khalti payment page.
   */
  initiatePayment: async (appointmentId: number): Promise<PaymentInitiateResponse> => {
    const response = await axiosInstance.post("/booking/payments/initiate/", {
      appointment_id: appointmentId,
    });
    return response.data;
  },

  /**
   * Verify a payment after Khalti redirects back.
   * Called from the payment verification page.
   */
  verifyPayment: async (pidx: string, appointmentId: number): Promise<PaymentVerifyResponse> => {
    const response = await axiosInstance.post("/booking/payments/verify/", {
      pidx,
      appointment_id: appointmentId,
    });
    return response.data;
  },

  /**
   * Check payment status for a specific appointment.
   */
  getPaymentStatus: async (appointmentId: number): Promise<PaymentStatusResponse> => {
    const response = await axiosInstance.get(`/booking/payments/status/${appointmentId}/`);
    return response.data;
  },
};


export default { authAPI, therapistAPI, patientAPI, blogAPI, bookingAPI, journalAPI, surveyAPI, matchingAPI,paymentAPI };





