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
export interface VideoTokenResponse {
  token: string;
  channel_name: string;
  app_id: string;
  uid: number;
  expires_at: number;
  can_start: boolean;
  message: string;
  role: "patient" | "therapist";
  other_participant: {
    name: string;
    role: string;
  };
  error?: string;
}

export interface VideoSessionStatusResponse {
  is_active: boolean;
  can_start: boolean;
  can_start_reason: string;
  session_started_at: string | null;
  session_ended_at: string | null;
  duration_minutes: number | null;
  appointment_date: string;
  start_time: string;
  session_mode: string;
  status: string;
}
export const bookingAPI = {

  generateVideoToken: async (appointmentId: number): Promise<VideoTokenResponse> => {
    const response = await axiosInstance.post(
      `/booking/appointments/${appointmentId}/video/token/`
    );
    return response.data;
  },

  startVideoSession: async (appointmentId: number): Promise<any> => {
    const response = await axiosInstance.post(
      `/booking/appointments/${appointmentId}/video/start/`
    );
    return response.data;
  },

  endVideoSession: async (appointmentId: number, recordingSid?: string): Promise<any> => {
    const response = await axiosInstance.post(
      `/booking/appointments/${appointmentId}/video/end/`,
      recordingSid ? { recording_sid: recordingSid } : {}
    );
    return response.data;
  },

  getVideoSessionStatus: async (appointmentId: number): Promise<VideoSessionStatusResponse> => {
    const response = await axiosInstance.get(
      `/booking/appointments/${appointmentId}/video/status/`
    );
    return response.data;
  },


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

  // Get completed appointments that need reports
  getCompletedAppointmentsForReports: async (page?: number) => {
    const response = await axiosInstance.get(
      '/booking/appointments/completed-for-reports/',
      { params: { page } }
    );
    return response.data;
  },

  // Patient progress endpoints
  getPatientProgress: async (page?: number) => {
    const response = await axiosInstance.get(
      '/booking/patient/progress/',
      { params: { page } }
    );
    return response.data;
  },

  getPatientProgressAnalytics: async () => {
    const response = await axiosInstance.get(
      '/booking/patient/progress-analytics/'
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

export const therapistVerificationAPI = {
  /**
   * Upload verification document (citizenship, license, education)
   */
  uploadVerificationDocument: async (formData: FormData): Promise<any> => {
    const response = await axiosInstance.post(
      "/accounts/verification/upload/",
      formData
    );
    return response.data;
  },

  /**
   * Get list of uploaded verification documents
   */
  getVerificationDocuments: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get("/accounts/verification/documents/");
      console.log("[v0] Verification documents response:", response.data);
      return Array.isArray(response.data) ? response.data : response.data?.results || [];
    } catch (error: any) {
      console.log("[v0] Error fetching verification documents:", error.response?.status);
      return [];
    }
  },
};

// ============ SESSION REPORT API ============
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

// Session Report API
export const sessionReportAPI = {
  /**
   * Create a new session report
   * POST /booking/session-reports/create/
   */
  createSessionReport: async (data: SessionReportData): Promise<SessionReport> => {
    const response = await axiosInstance.post(
      '/booking/session-reports/create/',
      data
    );
    return response.data;
  },

  /**
   * Get all session reports for therapist (list view)
   * GET /booking/session-reports/
   */
  getTherapistReports: async (params?: {
    patient_id?: number;
    session_outcome?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
  }): Promise<{ count: number; next: string | null; previous: string | null; results: SessionReport[] }> => {
    const response = await axiosInstance.get(
      '/booking/session-reports/',
      { params }
    );
    return response.data;
  },

  /**
   * Get specific session report FULL DETAILS (for editing/viewing)
   * GET /booking/session-reports/{reportId}/
   * 
   * This returns ALL fields including clinical observations, triggers, etc.
   */
  getReportDetail: async (reportId: number): Promise<SessionReport> => {
    const response = await axiosInstance.get(
      `/booking/session-reports/${reportId}/`
    );
    return response.data;
  },

  /**
   * Update session report
   * PATCH /booking/session-reports/{reportId}/update/
   */
  updateReport: async (reportId: number, data: Partial<SessionReportData>): Promise<SessionReport> => {
    const response = await axiosInstance.patch(
      `/booking/session-reports/${reportId}/update/`,
      data
    );
    return response.data;
  },

  /**
   * Delete session report
   * DELETE /booking/session-reports/{reportId}/delete/
   */
  deleteReport: async (reportId: number): Promise<void> => {
    await axiosInstance.delete(
      `/booking/session-reports/${reportId}/delete/`
    );
  },

  /**
   * Get completed appointments that need reports
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
   * Get patient progress/session history
   * GET /booking/patient/progress/
   */
  getPatientProgress: async (page?: number): Promise<any> => {
    const response = await axiosInstance.get(
      '/booking/patient/progress/',
      { params: { page } }
    );
    return response.data;
  },

  /**
   * Get patient progress analytics
   * GET /booking/patient/progress-analytics/
   */
  getPatientProgressAnalytics: async (): Promise<any> => {
    const response = await axiosInstance.get(
      '/booking/patient/progress-analytics/'
    );
    return response.data;
  },
};
export interface CommunityCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color: string;
  is_active: boolean;
  post_count: number;
}

export interface PostAuthor {
  id: number;
  display_name: string;
  is_therapist: boolean;
}

export interface CommentAuthor {
  id: number;
  display_name: string;
  role: 'patient' | 'therapist' | 'admin';
  role_badge?: {
    text: string;
    color: string;
    verified: boolean;
  };
}

export interface CommunityPost {
  id: number;
  title: string;
  content?: string;
  excerpt?: string;
  author: PostAuthor;
  category: CommunityCategory;
  is_anonymous: boolean;
  status: 'pending' | 'approved' | 'flagged' | 'rejected';
  like_count: number;
  comment_count: number;
  is_liked_by_user: boolean;
  view_count: number;
  created_at: string;
  updated_at?: string;
  time_ago?: string;
  can_delete?: boolean;
  can_edit?: boolean;
  comments?: PostComment[];
}

export interface PostComment {
  id: number;
  post: number;
  author: CommentAuthor;
  content: string;
  is_anonymous: boolean;
  parent?: number;
  like_count: number;
  is_liked_by_user: boolean;
  replies?: PostComment[];
  reply_count?: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  can_delete: boolean;
  can_edit: boolean;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: number;
  is_anonymous?: boolean;
}

export interface CreateCommentData {
  content: string;
  is_anonymous?: boolean;
  parent?: number;
}

export interface ReportData {
  reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'self_harm' | 'other';
  details?: string;
}

export interface CommunityStats {
  my_posts?: number;
  my_comments?: number;
  my_likes?: number;
  total_posts?: number;
  pending_moderation?: number;
  flagged_posts?: number;
  my_moderations?: number;
}

export interface ModerationDashboard {
  pending_posts: number;
  flagged_posts: number;
  unresolved_reports: number;
  flagged_comments: number;
  total_requiring_attention: number;
}

export interface PostReport {
  id: number;
  post: number;
  post_title: string;
  reported_by: number;
  reported_by_name: string;
  reason: string;
  details: string;
  is_resolved: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============ COMMUNITY API ============
export const communityAPI = {
  // ──── Categories ────
  /**
   * Get all active community categories
   * GET /api/community/categories/
   */
  getCategories: async (): Promise<CommunityCategory[]> => {
    const response = await axiosInstance.get('/community/categories/');
    return response.data;
  },

  // ──── Posts ────
  /**
   * Get list of community posts with filters
   * GET /api/community/posts/
   * Query params: category, status, my_posts, search, ordering, page
   */
  getPosts: async (params?: {
    category?: string;
    status?: string;
    my_posts?: boolean;
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<PaginatedResponse<CommunityPost>> => {
    const response = await axiosInstance.get('/community/posts/', { params });
    return response.data;
  },

  /**
   * Get single post with full details
   * GET /api/community/posts/{id}/
   */
  getPost: async (postId: number): Promise<CommunityPost> => {
    const response = await axiosInstance.get(`/community/posts/${postId}/`);
    return response.data;
  },

  /**
   * Create a new community post (patients only)
   * POST /api/community/posts/
   */
  createPost: async (data: CreatePostData): Promise<CommunityPost> => {
    const response = await axiosInstance.post('/community/posts/', data);
    return response.data;
  },

  /**
   * Update a post (author only)
   * PATCH /api/community/posts/{id}/
   */
  updatePost: async (postId: number, data: Partial<CreatePostData>): Promise<CommunityPost> => {
    const response = await axiosInstance.patch(`/community/posts/${postId}/`, data);
    return response.data;
  },

  /**
   * Delete a post (author or moderator)
   * DELETE /api/community/posts/{id}/
   */
  deletePost: async (postId: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/community/posts/${postId}/`);
    return response.data;
  },

  /**
   * Toggle like on a post
   * POST /api/community/posts/{id}/like/
   */
  togglePostLike: async (postId: number): Promise<{
    message: string;
    liked: boolean;
    like_count: number;
  }> => {
    const response = await axiosInstance.post(`/community/posts/${postId}/like/`);
    return response.data;
  },

  /**
   * Report a post
   * POST /api/community/posts/{id}/report/
   */
  reportPost: async (postId: number, data: ReportData): Promise<{
    message: string;
    report: PostReport;
  }> => {
    const response = await axiosInstance.post(`/community/posts/${postId}/report/`, data);
    return response.data;
  },

  /**
   * Get current user's posts
   * GET /api/community/posts/my_posts/
   */
  getMyPosts: async (page?: number): Promise<PaginatedResponse<CommunityPost>> => {
    const response = await axiosInstance.get('/community/posts/my_posts/', {
      params: { page }
    });
    return response.data;
  },

  /**
   * Get trending posts
   * GET /api/community/posts/trending/
   */
  getTrendingPosts: async (): Promise<CommunityPost[]> => {
    const response = await axiosInstance.get('/community/posts/trending/');
    return response.data;
  },

  // ──── Comments ────
  /**
   * Get comments for a post
   * GET /api/community/posts/{postId}/comments/
   */
  getComments: async (postId: number, page?: number): Promise<PaginatedResponse<PostComment>> => {
    const response = await axiosInstance.get(`/community/posts/${postId}/comments/`, {
      params: { page }
    });
    return response.data;
  },

  /**
   * Add a comment to a post
   * POST /api/community/posts/{postId}/comments/
   */
  createComment: async (postId: number, data: CreateCommentData): Promise<{
    message: string;
    comment: PostComment;
  }> => {
    const response = await axiosInstance.post(`/community/posts/${postId}/comments/`, data);
    return response.data;
  },

  /**
   * Update a comment (author only)
   * PATCH /api/community/posts/{postId}/comments/{commentId}/
   */
  updateComment: async (
    postId: number,
    commentId: number,
    data: { content: string }
  ): Promise<PostComment> => {
    const response = await axiosInstance.patch(
      `/community/posts/${postId}/comments/${commentId}/`,
      data
    );
    return response.data;
  },

  /**
   * Delete a comment (author or moderator)
   * DELETE /api/community/posts/{postId}/comments/{commentId}/
   */
  deleteComment: async (postId: number, commentId: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(
      `/community/posts/${postId}/comments/${commentId}/`
    );
    return response.data;
  },

  /**
   * Toggle like on a comment
   * POST /api/community/comments/{id}/like/
   */
  toggleCommentLike: async (commentId: number): Promise<{
    message: string;
    liked: boolean;
    like_count: number;
  }> => {
    const response = await axiosInstance.post(`/community/comments/${commentId}/like/`);
    return response.data;
  },

  /**
   * Report a comment
   * POST /api/community/comments/{id}/report/
   */
  reportComment: async (commentId: number, data: ReportData): Promise<{
    message: string;
    report: any;
  }> => {
    const response = await axiosInstance.post(`/community/comments/${commentId}/report/`, data);
    return response.data;
  },

  /**
   * Get replies to a comment
   * GET /api/community/comments/{id}/replies/
   */
  getCommentReplies: async (commentId: number): Promise<PostComment[]> => {
    const response = await axiosInstance.get(`/community/comments/${commentId}/replies/`);
    return response.data;
  },

  // ──── Statistics ────
  /**
   * Get community statistics for current user
   * GET /api/community/stats/
   */
  getStats: async (): Promise<CommunityStats> => {
    const response = await axiosInstance.get('/community/stats/');
    return response.data;
  },

  // ──── Moderation (Therapist Only) ────
  /**
   * Get moderation dashboard stats
   * GET /api/community/moderation/dashboard/
   */
  getModerationDashboard: async (): Promise<ModerationDashboard> => {
    const response = await axiosInstance.get('/community/moderation/dashboard/');
    return response.data;
  },

  /**
   * Get pending posts for moderation
   * GET /api/community/moderation/posts/pending/
   */
  getPendingPosts: async (): Promise<CommunityPost[]> => {
    const response = await axiosInstance.get('/community/moderation/posts/pending/');
    return response.data;
  },

  /**
   * Get flagged posts
   * GET /api/community/moderation/posts/flagged/
   */
  getFlaggedPosts: async (): Promise<CommunityPost[]> => {
    const response = await axiosInstance.get('/community/moderation/posts/flagged/');
    return response.data;
  },

  /**
   * Moderate a post (approve/flag/reject)
   * POST /api/community/moderation/posts/{postId}/moderate/
   */
  moderatePost: async (
    postId: number,
    action: 'approve' | 'flag' | 'reject',
    notes?: string
  ): Promise<{
    message: string;
    post: CommunityPost;
  }> => {
    const response = await axiosInstance.post(
      `/community/moderation/posts/${postId}/moderate/`,
      { action, notes }
    );
    return response.data;
  },

  /**
   * Get unresolved reports
   * GET /api/community/moderation/reports/
   */
  getUnresolvedReports: async (): Promise<PostReport[]> => {
    const response = await axiosInstance.get('/community/moderation/reports/');
    return response.data;
  },

  /**
   * Resolve a report
   * POST /api/community/moderation/reports/{reportId}/resolve/
   */
  resolveReport: async (reportId: number, notes?: string): Promise<{
    message: string;
    report: PostReport;
  }> => {
    const response = await axiosInstance.post(
      `/community/moderation/reports/${reportId}/resolve/`,
      { notes }
    );
    return response.data;
  },
};

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
  communityAPI,
};