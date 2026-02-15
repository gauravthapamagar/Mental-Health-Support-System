import axiosInstance from "./axios";

// ============ AUTHENTICATION ============
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

export const authAPI = {
  registerPatient: async (data: PatientRegistrationData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register/patient/", data);
    return response.data;
  },

  registerTherapist: async (data: TherapistRegistrationData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register/therapist/", data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/login/", data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get("/auth/me/");
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await axiosInstance.post("/auth/token/refresh/", {
      refresh: refreshToken,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

// ============ PATIENT API ============
export const patientAPI = {
  getProfile: async () => {
    const response = await axiosInstance.get("/patient/profile/me/");
    return response.data;
  },

  updateProfile: async (data: {
    emergency_contact_name: string;
    emergency_contact_phone: string;
    basic_health_info?: string;
  }) => {
    const response = await axiosInstance.patch("/patient/profile/update/", data);
    return response.data;
  },
};

// ============ THERAPIST API ============
export interface TherapistProfile {
  [key: string]: any;
}

export const therapistAPI = {
  getProfile: async (): Promise<TherapistProfile> => {
    const response = await axiosInstance.get("/therapist/profile/me/");
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await axiosInstance.get("/booking/stats/");
    return response.data;
  },

  completeProfile: async (data: any) => {
    const response = await axiosInstance.post("/therapist/profile/complete/", data);
    return response.data;
  },

  updateProfile: async (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    const response = await axiosInstance.put("/therapist/profile/update/", data, isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {}
    );
    return response.data;
  },

  getMyPatients: async () => {
    const response = await axiosInstance.get("/booking/therapist/patients/");
    return response.data;
  },
};

// ============ BLOG API ============
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

  toggleLike: async (slug: string) => {
    const response = await axiosInstance.post(`/blog/like/${slug}/`);
    return response.data;
  },
};

// ============ BOOKING API ============
export const bookingAPI = {
  // Therapist discovery
  listTherapists: async (params?: {
    specialization?: string;
    mode?: string;
    page?: number;
  }) => {
    const response = await axiosInstance.get("/booking/therapists/", { params });
    return response.data;
  },

  getAvailableSlots: async (therapistId: number) => {
    const response = await axiosInstance.get(`/booking/therapists/${therapistId}/slots/`);
    return response.data;
  },

  getAwaitingPaymentAppointments: async () => {
    const response = await axiosInstance.get("/booking/appointments/my/", {
      params: { status: "awaiting_payment" },
    });
    return response.data;
  },

  // Appointments
  createAppointment: async (data: any) => {
    const response = await axiosInstance.post("/booking/appointments/create/", data);
    return response.data;
  },

  getMyAppointments: async (filterType: string) => {
    const response = await axiosInstance.get("/booking/appointments/my/", {
      params: { filter: filterType },
    });
    return response.data;
  },

  getTherapistAppointments: async (filterType: string) => {
    const params: any = {};
    if (filterType === 'pending') {
      params.status = 'pending';
    } else if (filterType === 'history') {
      params.filter = 'past';
    } else if (filterType !== 'all') {
      params.filter = filterType;
    }
    const response = await axiosInstance.get("/booking/therapist/appointments/", { params });
    return response.data;
  },

  confirmAppointment: async (id: number, data: { meeting_link: string; therapist_notes: string }) => {
    const response = await axiosInstance.post(`/booking/therapist/appointments/${id}/confirm/`, data);
    return response.data;
  },

  cancelAppointment: async (id: number, reason: string) => {
    const response = await axiosInstance.post(`/booking/appointments/${id}/cancel/`, {
      cancellation_reason: reason,
    });
    return response.data;
  },

  getAppointmentDetail: async (appointmentId: string): Promise<any> => {
    const response = await axiosInstance.get(`/booking/appointments/${appointmentId}/`);
    return response.data;
  },

  rescheduleAppointment: async (
    id: number,
    data: { new_date: string; new_start_time: string; reason?: string }
  ) => {
    const response = await axiosInstance.post(`/booking/appointments/${id}/reschedule/`, data);
    return response.data;
  },

  // Payments
  initiatePayment: async (appointmentId: number) => {
    const response = await axiosInstance.post("/booking/payments/initiate/", {
      appointment_id: appointmentId,
    });
    return response.data;
  },

  verifyPayment: async (pidx: string, appointmentId: number) => {
    const response = await axiosInstance.post("/booking/payments/verify/", {
      pidx,
      appointment_id: appointmentId,
    });
    return response.data;
  },

  getPaymentStatus: async (appointmentId: number) => {
    const response = await axiosInstance.get(`/booking/payments/status/${appointmentId}/`);
    return response.data;
  },
};

// ============ JOURNAL API ============
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

export const journalAPI = {
  createEntry: async (data: JournalEntryData): Promise<JournalEntry> => {
    const response = await axiosInstance.post("/journal/entries/", data);
    return response.data;
  },

  getEntries: async (params?: { page?: number; limit?: number }) => {
    const response = await axiosInstance.get("/journal/entries/", { params });
    return response.data;
  },

  getEntry: async (id: number): Promise<JournalEntry> => {
    const response = await axiosInstance.get(`/journal/entries/${id}/`);
    return response.data;
  },

  updateEntry: async (id: number, data: Partial<JournalEntryData>): Promise<JournalEntry> => {
    const response = await axiosInstance.patch(`/journal/entries/${id}/`, data);
    return response.data;
  },

  deleteEntry: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/journal/entries/${id}/`);
  },

  getMoodAnalytics: async (days?: number): Promise<MoodAnalytics[]> => {
    const response = await axiosInstance.get("/journal/analytics/mood/", {
      params: { days: days || 30 },
    });
    return response.data;
  },

  getMoodTrend: async (days?: number) => {
    const response = await axiosInstance.get("/journal/analytics/trend/", {
      params: { days: days || 30 },
    });
    return response.data;
  },

  getSummary: async () => {
    const response = await axiosInstance.get("/journal/analytics/summary/");
    return response.data;
  },
};

// ============ SURVEY API ============
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
  getSurveys: async (): Promise<Survey[]> => {
    const response = await axiosInstance.get('/surveys/surveys/');
    return response.data;
  },

  getSurveyDetail: async (surveyId: number): Promise<Survey> => {
    const response = await axiosInstance.get(`/surveys/surveys/${surveyId}/`);
    return response.data;
  },

  getActiveAssessment: async (): Promise<Survey> => {
    const response = await axiosInstance.get('/surveys/surveys/active_survey/');
    return response.data;
  },

  startAssessment: async (): Promise<SurveyResponse> => {
    const response = await axiosInstance.post('/surveys/responses/start_assessment/');
    return response.data;
  },

  getCurrentAssessment: async (): Promise<SurveyResponse> => {
    const response = await axiosInstance.get('/surveys/responses/current_assessment/');
    return response.data;
  },

  getAssessmentHistory: async () => {
    const response = await axiosInstance.get('/surveys/responses/assessment_history/');
    return response.data;
  },

  saveAnswer: async (responseId: number, questionId: number, answerData: any) => {
    const response = await axiosInstance.post('/surveys/responses/save_answer/', {
      response_id: responseId,
      question_id: questionId,
      answer: answerData,
    });
    return response.data;
  },

  submitAssessment: async (responseId: number): Promise<SurveyResponse> => {
    const response = await axiosInstance.post('/surveys/responses/submit_assessment/', {
      response_id: responseId,
    });
    return response.data;
  },

  canRetake: async () => {
    const response = await axiosInstance.get('/surveys/responses/can_retake/');
    return response.data;
  },

  getResponse: async (responseId: number): Promise<SurveyResponse> => {
    const response = await axiosInstance.get(`/surveys/responses/${responseId}/`);
    return response.data;
  },

  deleteAssessment: async (responseId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/surveys/responses/${responseId}/`);
    } catch (error: any) {
      console.error("Failed to delete assessment:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to delete assessment. Please try again."
      );
    }
  },
};

// ============ MATCHING API ============
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
  findMatches: async (surveyResponseId: number): Promise<MatchingAPIResponse> => {
    const response = await axiosInstance.post('/matching/matches/find_matches/', {
      survey_response_id: surveyResponseId,
    });
    return response.data;
  },

  getLatestMatch: async (): Promise<MatchingAPIResponse> => {
    const response = await axiosInstance.get('/matching/matches/latest/');
    return response.data;
  },

  getMatchDetails: async (matchId: number): Promise<MatchingAPIResponse> => {
    const response = await axiosInstance.get(`/matching/matches/${matchId}/`);
    return response.data;
  },

  getAllMatches: async (): Promise<MatchingAPIResponse[]> => {
    const response = await axiosInstance.get('/matching/matches/');
    return response.data;
  },

  rematch: async (matchId: number): Promise<MatchingAPIResponse> => {
    const response = await axiosInstance.post(`/matching/matches/${matchId}/rematch/`);
    return response.data;
  },
};

// ============ PAYMENT API ============
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

export const paymentAPI = {
  initiatePayment: async (appointmentId: number): Promise<PaymentInitiateResponse> => {
    const response = await axiosInstance.post("/booking/payments/initiate/", {
      appointment_id: appointmentId,
    });
    return response.data;
  },

  verifyPayment: async (pidx: string, appointmentId: number): Promise<PaymentVerifyResponse> => {
    const response = await axiosInstance.post("/booking/payments/verify/", {
      pidx,
      appointment_id: appointmentId,
    });
    return response.data;
  },

  getPaymentStatus: async (appointmentId: number): Promise<PaymentStatusResponse> => {
    const response = await axiosInstance.get(`/booking/payments/status/${appointmentId}/`);
    return response.data;
  },
};

// ============ THERAPIST VERIFICATION API ============
export const therapistVerificationAPI = {
  uploadVerificationDocument: async (formData: FormData): Promise<any> => {
    const response = await axiosInstance.post("/accounts/verification/upload/", formData);
    return response.data;
  },

  getVerificationDocuments: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get("/accounts/verification/documents/");
      return Array.isArray(response.data) ? response.data : response.data?.results || [];
    } catch (error: any) {
      console.log("[api] Error fetching verification documents:", error.response?.status);
      return [];
    }
  },
};

// ============ SESSION REPORT API ============
/**
 * Session Report Types and API
 * Therapists create, read, update reports for each completed appointment
 * Patients can view anonymized summaries if patient_visible=True
 */

export interface SessionReportData {
  appointment: number;
  session_summary: string;
  mood_rating: number;
  symptom_improvement?: Record<string, number>;
  treatment_goals_addressed?: string[];
  session_outcome: 'productive' | 'breakthrough' | 'needs_follow_up' | 'blocked';
  homework_assigned?: string;
  triggers_identified?: string;
  notes_for_next_session?: string;
  clinical_observations?: string;
  patient_visible?: boolean;
}

export interface SessionReport {
  id: number;
  appointment: number;
  appointment_date: string;
  therapist: {
    id: number;
    full_name: string;
    email: string;
    profession: string;
  };
  patient: {
    id: number;
    full_name: string;
    email: string;
  };
  session_summary: string;
  mood_rating: number;
  symptom_improvement: Record<string, number>;
  treatment_goals_addressed: string[];
  session_outcome: string;
  session_outcome_display: string;
  homework_assigned: string;
  triggers_identified: string;
  notes_for_next_session: string;
  clinical_observations: string;
  patient_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const sessionReportAPI = {
  /**
   * Create a new session report for a completed appointment
   * POST /booking/session-reports/create/
   */
  createSessionReport: async (data: SessionReportData): Promise<{ message: string; report: SessionReport }> => {
    const response = await axiosInstance.post('/booking/session-reports/create/', data);
    return response.data;
  },

  /**
   * Get all session reports for the current therapist (with filtering & pagination)
   * GET /booking/session-reports/
   */
  getTherapistReports: async (params?: {
    patient_id?: number;
    session_outcome?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
  }): Promise<PaginatedResponse<SessionReport>> => {
    const response = await axiosInstance.get('/booking/session-reports/', { params });
    return response.data;
  },

  /**
   * Get a specific session report with ALL details (for viewing/editing)
   * GET /booking/session-reports/{reportId}/
   */
  getReportDetail: async (reportId: number): Promise<SessionReport> => {
    const response = await axiosInstance.get(`/booking/session-reports/${reportId}/`);
    return response.data;
  },

  /**
   * Update a session report
   * PATCH /booking/session-reports/{reportId}/update/
   */
  updateReport: async (reportId: number, data: Partial<SessionReportData>): Promise<{ message: string; report: SessionReport }> => {
    const response = await axiosInstance.patch(`/booking/session-reports/${reportId}/update/`, data);
    return response.data;
  },

  /**
   * Delete a session report
   * DELETE /booking/session-reports/{reportId}/delete/
   */
  deleteReport: async (reportId: number): Promise<void> => {
    await axiosInstance.delete(`/booking/session-reports/${reportId}/delete/`);
  },

  /**
   * Get completed appointments that need session reports
   * GET /booking/appointments/completed-for-reports/
   */
  getCompletedAppointmentsForReports: async (page?: number): Promise<any> => {
    const response = await axiosInstance.get(
      '/booking/appointments/completed-for-reports/',
      { params: { page } }
    );
    return response.data;
  },

  /**
   * Get patient's visible session progress
   * GET /booking/patient/progress/
   */
  getPatientProgress: async (page?: number): Promise<PaginatedResponse<SessionReport>> => {
    const response = await axiosInstance.get(
      '/booking/patient/progress/',
      { params: { page } }
    );
    return response.data;
  },

  /**
   * Get patient's progress analytics (mood trends, symptom improvements, etc.)
   * GET /booking/patient/progress-analytics/
   */
  getPatientProgressAnalytics: async (): Promise<any> => {
    const response = await axiosInstance.get(
      '/booking/patient/progress-analytics/'
    );
    return response.data;
  },
};

// ============ MAIN EXPORT ============
export default {
  authAPI,
  therapistAPI,
  patientAPI,
  blogAPI,
  bookingAPI,
  journalAPI,
  surveyAPI,
  matchingAPI,
  paymentAPI,
  therapistVerificationAPI,
  sessionReportAPI,
};