// lib/api/survey.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const surveyAPI = {
  // Start a new survey
  startSurvey: async () => {
    const response = await fetch(`${API_BASE}/survey/start/`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to start survey");
    }

    return response.json();
  },

  // Get static questions
  getStaticQuestions: async () => {
    const response = await fetch(`${API_BASE}/survey/questions/static/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }

    return response.json();
  },

  // Submit static responses
  submitStaticResponses: async (
    surveyId: number,
    responses: Array<{ question_id: number; answer: string }>
  ) => {
    const response = await fetch(`${API_BASE}/survey/responses/static/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        survey_id: surveyId,
        responses: responses,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit responses");
    }

    return response.json();
  },

  // Get next dynamic question
  getDynamicQuestion: async (surveyId: number) => {
    const response = await fetch(`${API_BASE}/survey/questions/dynamic/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ survey_id: surveyId }),
    });

    // Handle logical completion
    if (response.status === 204) {
      return { is_final: true };
    }

    if (!response.ok) {
      const error = await response.text();
      console.error("Dynamic question API error:", error);
      return { is_final: true };
    }

    return response.json();
  },

  // Submit dynamic answer
  submitDynamicAnswer: async (
    surveyId: number,
    questionText: string,
    answer: string
  ) => {
    const response = await fetch(`${API_BASE}/survey/responses/dynamic/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        survey_id: surveyId,
        question_text: questionText,
        answer: answer,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit answer");
    }

    return response.json();
  },

  // Complete survey
  completeSurvey: async (surveyId: number) => {
    const response = await fetch(`${API_BASE}/survey/complete/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ survey_id: surveyId }),
    });

    if (!response.ok) {
      throw new Error("Failed to complete survey");
    }

    return response.json();
  },

  // Get survey detail
  getSurveyDetail: async (surveyId: number) => {
    const response = await fetch(`${API_BASE}/survey/detail/${surveyId}/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch survey details");
    }

    return response.json();
  },

  // Get survey history
  getSurveyHistory: async () => {
    const response = await fetch(`${API_BASE}/survey/history/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch survey history");
    }

    return response.json();
  },
};

export default surveyAPI;
