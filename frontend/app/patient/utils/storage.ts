import { QuizResult } from '../types';

// Local storage keys
const QUIZ_RESULTS_KEY = 'quiz_results';
const FLASHCARD_PROGRESS_KEY = 'flashcard_progress';

// Quiz Results Management
export function saveQuizResult(result: QuizResult): void {
  try {
    const results = getQuizResults();
    results.push({
      ...result,
      completedAt: result.completedAt.toISOString(), // store as ISO string
    });
    localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
    console.log('Quiz result saved:', result); // ← add this temporarily
  } catch (error) {
    console.error('Failed to save quiz result:', error);
  }
}

export function getQuizResults(): QuizResult[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(QUIZ_RESULTS_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((r: any) => ({
      ...r,
      completedAt: new Date(r.completedAt),
    }));
  } catch (error) {
    console.error('Failed to load quiz results:', error);
    return [];
  }
}

export function getQuizResultById(id: string): QuizResult | null {
  const results = getQuizResults();
  return results.find(r => r.id === id) || null;
}

export function getResultsByQuizId(quizId: string): QuizResult[] {
  const results = getQuizResults();
  return results.filter(r => r.quizId === quizId)
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
}

export function deleteQuizResult(id: string): void {
  const results = getQuizResults().filter(r => r.id !== id);
  localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
}

export function clearAllQuizResults(): void {
  localStorage.removeItem(QUIZ_RESULTS_KEY);
}

// Flashcard Progress Management
export interface FlashcardProgress {
  categoryId: string;
  completedCards: string[];
  lastReviewed: Date;
}

export function saveFlashcardProgress(categoryId: string, completedCards: string[]): void {
  const allProgress = getFlashcardProgress();
  const existingIndex = allProgress.findIndex(p => p.categoryId === categoryId);
  
  const progress: FlashcardProgress = {
    categoryId,
    completedCards,
    lastReviewed: new Date()
  };
  
  if (existingIndex >= 0) {
    allProgress[existingIndex] = progress;
  } else {
    allProgress.push(progress);
  }
  
  localStorage.setItem(FLASHCARD_PROGRESS_KEY, JSON.stringify(allProgress));
}

export function getFlashcardProgress(): FlashcardProgress[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(FLASHCARD_PROGRESS_KEY);
  if (!stored) return [];
  
  const progress = JSON.parse(stored);
  return progress.map((p: any) => ({
    ...p,
    lastReviewed: new Date(p.lastReviewed)
  }));
}

export function getProgressForCategory(categoryId: string): FlashcardProgress | null {
  const allProgress = getFlashcardProgress();
  return allProgress.find(p => p.categoryId === categoryId) || null;
}

export function clearFlashcardProgress(): void {
  localStorage.removeItem(FLASHCARD_PROGRESS_KEY);
}

// Generate unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Calculate quiz score level
export function calculateScoreLevel(score: number, scoringGuide: any) {
  for (const range of scoringGuide.ranges) {
    if (score >= range.min && score <= range.max) {
      return range;
    }
  }
  return scoringGuide.ranges[0]; // fallback to first range
}

// Format date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Get time ago string
export function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'Just now';
}