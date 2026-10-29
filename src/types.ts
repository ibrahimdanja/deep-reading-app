export type CategoryKey =
  | 'science'
  | 'philosophy'
  | 'psychology'
  | 'neuroscience'
  | 'astronomy'
  | 'economics'
  | 'tech_ethics'
  | 'biology'
  | 'sociology'
  | 'history'
  | 'anthropology'
  | 'literature'
  | 'nursing'
  | 'medical';

export const CATEGORIES: Record<CategoryKey, string> = {
  science: 'Science & Physics',
  philosophy: 'Philosophy & Ideas',
  psychology: 'Psychology & Mind',
  neuroscience: 'Neuroscience',
  astronomy: 'Astronomy & Cosmos',
  economics: 'Economics & Game Theory',
  tech_ethics: 'Tech Ethics & AI',
  biology: 'Biology & Genetics',
  sociology: 'Sociology & Networks',
  history: 'Historical Turning Points',
  anthropology: 'Anthropology & Culture',
  literature: 'Literature & Aesthetics',
  nursing: 'Nursing & Clinical Care',
  medical: 'Medical Science'
};

export interface QuestionAnswer {
  question: string;
  answer: string;
  aiCritique?: string;
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
  highlightedQuotes?: string[];
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
  activityHistory: Record<string, number>; // date "YYYY-MM-DD" -> count
}

export interface Recommendation {
  category: CategoryKey;
  label: string;
  reason: string;
  due_count: number;
}

export type ThemeType = 'night' | 'dark' | 'sepia' | 'light';

export interface ReaderSettings {
  theme: ThemeType;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'serif' | 'sans';
  hapticsEnabled: boolean;
}

export type AmbientSoundType = 'none' | 'rain' | 'fire' | 'binaural' | 'library';

export interface QuoteCardData {
  quote: string;
  title: string;
  source: string;
  category: CategoryKey;
}
