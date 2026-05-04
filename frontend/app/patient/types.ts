// Types for Quiz System
export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  category: string;
}

export interface QuizOption {
  text: string;
  score: number;
  value: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: 'anxiety' | 'depression' | 'stress' | 'wellness' | 'sleep';
  icon: string;
  questions: QuizQuestion[];
  scoringGuide: ScoringGuide;
}

export interface ScoringGuide {
  ranges: ScoreRange[];
}

export interface ScoreRange {
  min: number;
  max: number;
  level: 'minimal' | 'mild' | 'moderate' | 'severe';
  description: string;
  color: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  level: string;
  description: string;
  completedAt: Date;
  answers: Record<string, number>;
}

// Types for Flashcard System
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface FlashcardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  cards: Flashcard[];
}

// Types for Coping Strategies
export interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  steps: string[];
  category: string;
  applicableFor: string[];
}