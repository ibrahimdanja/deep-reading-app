export type CategoryKey =
  | 'science'
  | 'philosophy'
  | 'psychology'
  | 'nursing'
  | 'biology'
  | 'sociology'
  | 'history'
  | 'medical';

export const CATEGORIES: Record<CategoryKey, string> = {
  science: 'Science',
  philosophy: 'Philosophy & Ideas',
  psychology: 'Psychology',
  nursing: 'Nursing',
  biology: 'Biology',
  sociology: 'Sociology',
  history: 'History',
  medical: 'Medical'
};

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface ReviewStateData {
  repetitions: number;
  ease_factor: number;
  interval_days: number;
  due_date: string; // ISO 8601 string
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: CategoryKey;
  date_saved: string;
  questions: QuestionAnswer[];
  review_state: ReviewStateData;
}

export interface ReadingPiece {
  title: string;
  summary: string;
  url: string;
  source: string;
  category: CategoryKey;
  questions: string[];
  question_source: 'ai' | 'fallback';
  question_notice?: {
    reason: string | null;
    retry_after?: number | null;
    resets_at?: string | null;
  } | null;
}

export type GradeType = 'again' | 'hard' | 'good' | 'easy';

export interface DailyGoal {
  goal: number;
  completed: number;
  remaining: number;
  percent: number;
}

export interface AppStats {
  articles_saved: number;
  questions_answered: number;
  reviews_due: number;
  streak: number;
  categories: Record<string, number>;
  category_count: number;
  goal: DailyGoal;
}

export interface Recommendation {
  category: CategoryKey;
  label: string;
  reason: string;
  due_count: number;
}

export interface ReaderSettings {
  theme: 'dark' | 'light' | 'sepia';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'serif' | 'sans';
}
