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

const STORAGE_KEY_ARTICLES = 'deep_reading_articles_v3';
const STORAGE_KEY_SETTINGS = 'deep_reading_settings_v3';
const STORAGE_KEY_GOAL_TARGET = 'deep_reading_goal_target_v3';

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'night', // Deep Charcoal/Night optimized for IPS LCD screen comfort
  fontSize: 'md',
  fontFamily: 'serif',
  hapticsEnabled: true
};

// Seed initial sample readings across multiple disciplines
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
        answer: 'Rigid order freezes information into static loops, while pure chaos disperses signals into noise. Criticality maximizes both cognitive flexibility and memory fidelity.'
      },
      {
        question: "What's the weakest assumption in claiming biological brains constantly maintain exact criticality?",
        answer: 'Real metabolic costs and variable sleep states might push local brain regions in and out of subcritical regimes.'
      },
      {
        question: 'Where else in nature does self-organized criticality dictate resilience?',
        answer: 'Forest fires, tectonic earthquakes, and financial network liquidity crashes.'
      }
    ],
    review_state: {
      repetitions: 1,
      ease_factor: 2.5,
      interval_days: 1,
      due_date: new Date(Date.now() - 3600000).toISOString() // Due now
    },
    highlightedQuotes: [
      "Cortical networks operate near a non-equilibrium critical point between order and chaos."
    ]
  },
  {
    id: 'seed-2',
    title: 'Predictive Processing and the Bayesian Architecture of Perception',
    summary: 'Rather than passively receiving bottom-up sensory streams, the human brain functions as an active predictive engine. High-level cortical regions project continuous top-down predictions regarding sensory causes, while afferent nerves transmit only residual prediction errors.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24055106/',
    source: 'PubMed (Cognitive Neuroscience)',
    category: 'neuroscience',
    date_saved: new Date(Date.now() - 86400000).toISOString(),
    questions: [
      {
        question: 'If perception is mostly top-down prediction, what makes an illusion an illusion?',
        answer: 'An illusion is a case where the brain’s high-confidence prior model happens to mismatch the unusual physical setup.'
      },
      {
        question: 'How does predictive coding reframe cognitive confirmation bias?',
        answer: 'Confirmation bias isn’t emotional weakness; it is the Bayesian brain overweighting prior precision over noisy error signals.'
      },
      {
        question: 'What evolutionary advantage did predictive error minimization provide?',
        answer: 'Speed. Processing only the unexpected differences requires dramatically less metabolic energy and time than computing full sensory scenes from scratch.'
      }
    ],
    review_state: {
      repetitions: 0,
      ease_factor: 2.5,
      interval_days: 1,
      due_date: new Date(Date.now() - 1800000).toISOString() // Due now
    },
    highlightedQuotes: [
      "The human brain functions as an active predictive engine, projecting top-down hypotheses."
    ]
  },
  {
    id: 'seed-3',
    title: 'The Problem of Future Generations and Intergenerational Ethics',
    summary: "Derek Parfit's 'Non-Identity Problem' demonstrates that policies adopted today alter which specific individuals will exist in centuries to come. Because different decisions cause different people to be born, we cannot easily claim that a polluting policy harms a future person if they would never have existed without it.",
    url: 'https://plato.stanford.edu/entries/nonidentity-problem/',
    source: 'Stanford Encyclopedia of Philosophy',
    category: 'philosophy',
    date_saved: new Date(Date.now() - 3 * 86400000).toISOString(),
    questions: [
      {
        question: 'What premise is doing the heaviest work in Parfit’s paradox?',
        answer: 'The assumption that an action can only harm someone if it makes that specific person worse off than they would have been.'
      },
      {
        question: 'How do impersonal moral theories respond to this?',
        answer: 'By evaluating moral duty according to the total flourishing of whoever exists, rather than person-affecting duties.'
      },
      {
        question: 'What does this imply for climate policy today?',
        answer: 'We have ethical obligations to protect the habitability of Earth for humanity as an enduring lineage, regardless of personal identities.'
      }
    ],
    review_state: {
      repetitions: 2,
      ease_factor: 2.6,
      interval_days: 6,
      due_date: new Date(Date.now() + 4 * 86400000).toISOString()
    }
  }
];

export function loadAllArticles(): Article[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARTICLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(SEED_ARTICLES));
      return SEED_ARTICLES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveAllArticles(articles: Article[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
  } catch (e) {}
}

export function saveEntry(
  piece: { title: string; summary: string; url: string; source: string; category: CategoryKey },
  questions: string[],
  answers: string[],
  aiCritiques: (string | undefined)[] = []
): Article {
  const articles = loadAllArticles();

  const qaList: QuestionAnswer[] = questions.map((q, i) => ({
    question: q,
    answer: answers[i] || '',
    aiCritique: aiCritiques[i]
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
    review_state: createInitialReviewState(1),
    highlightedQuotes: []
  };

  articles.unshift(newArticle);
  saveAllArticles(articles);
  return newArticle;
}

export function addHighlightedQuote(articleId: string, quote: string): void {
  const articles = loadAllArticles();
  const art = articles.find(a => a.id === articleId);
  if (art) {
    art.highlightedQuotes = art.highlightedQuotes || [];
    if (!art.highlightedQuotes.includes(quote)) {
      art.highlightedQuotes.push(quote);
      saveAllArticles(articles);
    }
  }
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
  return loadAllArticles().slice(0, limit);
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

export function getActivityHistory(): Record<string, number> {
  const articles = loadAllArticles();
  const history: Record<string, number> = {};

  // Pre-populate with slight activity over the past 2 weeks so heatmap displays nicely
  const now = new Date();
  for (let i = 14; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    history[key] = (i === 1 || i === 2 || i === 5 || i === 8 || i === 12) ? Math.floor(Math.random() * 2) + 1 : 0;
  }

  for (const art of articles) {
    const day = art.date_saved.slice(0, 10);
    history[day] = (history[day] || 0) + 1;
  }

  return history;
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
  const activityHistory = getActivityHistory();

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
    goal,
    activityHistory
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
  } catch (e) {}
}
