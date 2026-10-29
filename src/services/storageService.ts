import {
  Article,
  CategoryKey,
  DailyGoal,
  AppStats,
  GradeType,
  ReaderSettings,
  QuestionAnswer
} from '../types';
import {
  createInitialReviewState,
  applySM2Review,
  GRADE_TO_QUALITY,
  isDue
} from './spacedRepetition';

const STORAGE_KEY_ARTICLES = 'deep_reading_articles_v2';
const STORAGE_KEY_SETTINGS = 'deep_reading_settings_v2';
const STORAGE_KEY_GOAL_TARGET = 'deep_reading_goal_target_v2';

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'dark',
  fontSize: 'md',
  fontFamily: 'serif'
};

// Seed initial sample data if storage is completely empty
const SEED_ARTICLES: Article[] = [
  {
    id: 'seed-1',
    title: 'Self-Organized Criticality in Neural Information Processing',
    summary: 'Cortical networks operate near a non-equilibrium critical point between order and chaos. In this regime, known as self-organized criticality, information transmission capacity, dynamic range of sensory inputs, and the diversity of collective states are simultaneously maximized.',
    url: 'https://arxiv.org/abs/2304.09812',
    source: 'arXiv (q-bio.NC / Physics)',
    category: 'science',
    date_saved: new Date(Date.now() - 2 * 86400000).toISOString(),
    questions: [
      {
        question: 'Why must biological neural networks balance on this knife-edge between rigid order and chaotic noise?',
        answer: 'Rigid order freezes information into static loops, while pure chaos disperses signals into noise. The critical point maximizes both flexibility and memory.'
      },
      {
        question: "What's the weakest assumption in claiming biological brains constantly maintain exact criticality?",
        answer: 'Real metabolic costs and variable sleep states might push local brain regions in and out of subcritical and supercritical regimes.'
      },
      {
        question: 'Where else in nature does self-organized criticality dictate resilience?',
        answer: 'Forest fires, earthquake fault lines, and financial stock market crash thresholds.'
      }
    ],
    review_state: {
      repetitions: 1,
      ease_factor: 2.5,
      interval_days: 1,
      // Due right now for immediate review CUJ test!
      due_date: new Date(Date.now() - 3600000).toISOString()
    }
  },
  {
    id: 'seed-2',
    title: 'The Problem of Future Generations and Intergenerational Ethics',
    summary: "Derek Parfit's 'Non-Identity Problem' demonstrates that policies adopted today alter which specific individuals will exist in centuries to come. Because different decisions cause different people to be born, we cannot easily claim that a polluting policy harms a future person if they would never have existed without it.",
    url: 'https://plato.stanford.edu/entries/nonidentity-problem/',
    source: 'Stanford Encyclopedia of Philosophy',
    category: 'philosophy',
    date_saved: new Date(Date.now() - 86400000).toISOString(),
    questions: [
      {
        question: 'What assumption is doing the most work in Parfit’s non-identity paradox?',
        answer: 'The premise that a person is only wronged if that specific individual was made worse off than they otherwise would have been.'
      },
      {
        question: 'How would a thoughtful critic respond to this ethical dilemma?',
        answer: 'Shift the moral framework from person-affecting duties to impersonal obligations to create a flourishing world.'
      },
      {
        question: 'What does this imply for climate policy decisions made today?',
        answer: 'We owe moral duties to the conditions of future life itself, not merely to quantifiable legal entities alive today.'
      }
    ],
    review_state: {
      repetitions: 0,
      ease_factor: 2.5,
      interval_days: 1,
      due_date: new Date(Date.now() - 1800000).toISOString() // Due right now
    }
  }
];

export function loadAllArticles(): Article[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARTICLES);
    if (!raw) {
      // Seed initial data
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(SEED_ARTICLES));
      return SEED_ARTICLES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load articles', e);
    return [];
  }
}

export function saveAllArticles(articles: Article[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
  } catch (e) {
    console.error('Failed to save articles', e);
  }
}

export function saveEntry(
  piece: { title: string; summary: string; url: string; source: string; category: CategoryKey },
  questions: string[],
  answers: string[]
): Article {
  const articles = loadAllArticles();

  const qaList: QuestionAnswer[] = questions.map((q, i) => ({
    question: q,
    answer: answers[i] || ''
  }));

  const newArticle: Article = {
    id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: piece.title,
    summary: piece.summary,
    url: piece.url,
    source: piece.source,
    category: piece.category,
    date_saved: new Date().toISOString(),
    questions: qaList,
    // First review is tomorrow
    review_state: createInitialReviewState(1)
  };

  articles.unshift(newArticle);
  saveAllArticles(articles);
  return newArticle;
}

export function getLibrary(category?: CategoryKey | 'all'): Article[] {
  const articles = loadAllArticles();
  if (!category || category === 'all') {
    return articles;
  }
  return articles.filter(a => a.category === category);
}

export function getDueReviews(): Article[] {
  const articles = loadAllArticles();
  return articles
    .filter(a => isDue(a.review_state.due_date))
    .sort((a, b) => new Date(a.review_state.due_date).getTime() - new Date(b.review_state.due_date).getTime());
}

export function getNextDueReview(): Article | null {
  const due = getDueReviews();
  return due.length > 0 ? due[0] : null;
}

export function gradeReview(articleId: string, grade: GradeType): Article | null {
  const articles = loadAllArticles();
  const idx = articles.findIndex(a => a.id === articleId);
  if (idx === -1) return null;

  const current = articles[idx];
  const quality = GRADE_TO_QUALITY[grade];
  const updatedState = applySM2Review(current.review_state, quality);

  const updatedArticle: Article = {
    ...current,
    review_state: updatedState
  };

  articles[idx] = updatedArticle;
  saveAllArticles(articles);
  return updatedArticle;
}

export function getRecent(limit: number = 5): Article[] {
  const articles = loadAllArticles();
  return articles.slice(0, limit);
}

export function getDailyGoal(): DailyGoal {
  const articles = loadAllArticles();
  const todayStr = new Date().toISOString().slice(0, 10);
  const target = parseInt(localStorage.getItem(STORAGE_KEY_GOAL_TARGET) || '2', 10);

  const completed = articles.filter(a => a.date_saved.startsWith(todayStr)).length;
  const percent = Math.min(100, Math.round((completed / target) * 100));

  return {
    goal: target,
    completed,
    remaining: Math.max(0, target - completed),
    percent
  };
}

export function setDailyGoalTarget(target: number): DailyGoal {
  localStorage.setItem(STORAGE_KEY_GOAL_TARGET, String(Math.max(1, target)));
  return getDailyGoal();
}

export function getStreak(): number {
  const articles = loadAllArticles();
  if (!articles.length) return 0;

  const datesSet = new Set(articles.map(a => a.date_saved.slice(0, 10)));
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let cursor: Date;
  if (datesSet.has(todayStr)) {
    cursor = today;
  } else if (datesSet.has(yesterdayStr)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (true) {
    const curStr = cursor.toISOString().slice(0, 10);
    if (datesSet.has(curStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getCategoryActivity(): Record<string, { count: number; last_saved: string }> {
  const articles = loadAllArticles();
  const result: Record<string, { count: number; last_saved: string }> = {};

  for (const art of articles) {
    if (!art.category) continue;
    if (!result[art.category]) {
      result[art.category] = { count: 0, last_saved: art.date_saved };
    }
    result[art.category].count += 1;
    if (new Date(art.date_saved).getTime() > new Date(result[art.category].last_saved).getTime()) {
      result[art.category].last_saved = art.date_saved;
    }
  }

  return result;
}

export function getAppStats(): AppStats {
  const articles = loadAllArticles();
  const answeredCount = articles.reduce((acc, art) => {
    return acc + art.questions.filter(q => q.answer && q.answer.trim().length > 0).length;
  }, 0);

  const due = getDueReviews().length;
  const streak = getStreak();
  const goal = getDailyGoal();

  const categories: Record<string, number> = {};
  for (const a of articles) {
    if (a.category) {
      categories[a.category] = (categories[a.category] || 0) + 1;
    }
  }

  return {
    articles_saved: articles.length,
    questions_answered: answeredCount,
    reviews_due: due,
    streak,
    categories,
    category_count: Object.keys(categories).length,
    goal
  };
}

export function getReaderSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveReaderSettings(settings: ReaderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
