import React from 'react';
import {
  Compass,
  Sparkles,
  Flame,
  BookOpen,
  ArrowRight,
  Target,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AppStats, Article, CategoryKey, CATEGORIES, Recommendation } from '../types';

interface HomeScreenProps {
  stats: AppStats;
  recommendation: Recommendation;
  recentArticles: Article[];
  onStartReading: (category?: CategoryKey) => void;
  onNavigateReviews: () => void;
  onOpenArticle: (article: Article) => void;
  onNavigateLibrary: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  recommendation,
  recentArticles,
  onStartReading,
  onNavigateReviews,
  onOpenArticle,
  onNavigateLibrary
}) => {
  const goal = stats.goal;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Hero Greeting */}
      <section className="pt-2">
        <h2 className="text-2xl sm:text-3xl font-serif-reading font-semibold text-[var(--text)] tracking-tight leading-snug">
          Thoughtful reading, <br className="hidden sm:inline" />
          <span className="text-[var(--amber)]">remembered deeply.</span>
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
          Short science, philosophy, and history abstracts paired with Socratic reflection and SM-2 spaced repetition.
        </p>
      </section>

      {/* Daily Goal Card */}
      <section className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--amber-dim)] text-[var(--amber)]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text)]">Daily Reading Target</h3>
              <p className="text-xs text-[var(--muted)]">
                {goal.completed >= goal.goal
                  ? 'Daily goal reached! Keep exploring or review.'
                  : `${goal.remaining} more piece${goal.remaining > 1 ? 's' : ''} to complete today`}
              </p>
            </div>
          </div>
          <span className="text-base font-bold font-serif-reading text-[var(--amber)]">
            {goal.completed}/{goal.goal}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--bg)] h-2.5 rounded-full overflow-hidden border border-[var(--hairline)]">
          <div
            className="h-full bg-gradient-to-r from-[var(--amber)] to-[var(--sage)] rounded-full transition-all duration-500"
            style={{ width: `${goal.percent}%` }}
          />
        </div>
      </section>

      {/* Spaced Repetition Due Alert (if any reviews due) */}
      {stats.reviews_due > 0 && (
        <section className="bg-gradient-to-r from-[var(--panel)] to-[var(--panel-elevated)] border-l-4 border-l-[var(--amber)] border-y border-r border-[var(--hairline)] rounded-2xl p-4 sm:p-5 shadow-md flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--amber)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spaced Repetition Active</span>
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-[var(--text)]">
              {stats.reviews_due} article{stats.reviews_due > 1 ? 's' : ''} due for recall
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Review your Socratic answers to lock concepts into long-term memory.
            </p>
          </div>
          <button
            onClick={onNavigateReviews}
            className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-[var(--amber)] text-black font-semibold text-xs hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer shadow"
          >
            Review Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* Suggested Subject Recommendation (Picks ONE subject to read next) */}
      <section className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-5 relative overflow-hidden">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[var(--amber)]" />
            <span>Recommended Reading</span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber-dim)]">
            {recommendation.label}
          </span>
        </div>

        <p className="text-sm text-[var(--text-soft)] italic mb-4 font-serif-reading">
          "{recommendation.reason}"
        </p>

        <button
          onClick={() => onStartReading(recommendation.category)}
          className="w-full py-3 px-4 rounded-xl bg-[var(--amber)] text-black font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <span>Read {recommendation.label} Piece</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Key Metric Blocks */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[var(--amber)] mb-0.5">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xl font-bold font-serif-reading">{stats.streak}</span>
          </div>
          <p className="text-[11px] text-[var(--muted)]">Day Streak</p>
        </div>

        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-xl p-3 text-center">
          <div className="text-xl font-bold font-serif-reading text-[var(--text)] mb-0.5">
            {stats.articles_saved}
          </div>
          <p className="text-[11px] text-[var(--muted)]">Saved Pieces</p>
        </div>

        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-xl p-3 text-center">
          <div className="text-xl font-bold font-serif-reading text-[var(--sage)] mb-0.5">
            {stats.questions_answered}
          </div>
          <p className="text-[11px] text-[var(--muted)]">Reflections</p>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Recent Readings
          </h3>
          <button
            onClick={onNavigateLibrary}
            className="text-xs text-[var(--amber)] font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            View all ({stats.articles_saved})
          </button>
        </div>

        {recentArticles.length === 0 ? (
          <div className="text-center py-8 px-4 bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl text-[var(--muted)] text-sm">
            No readings saved yet. Tap recommended reading above to begin!
          </div>
        ) : (
          <div className="space-y-2">
            {recentArticles.slice(0, 4).map(art => (
              <div
                key={art.id}
                onClick={() => onOpenArticle(art)}
                className="bg-[var(--panel)] border border-[var(--hairline)] hover:border-[var(--amber)]/40 rounded-xl p-3.5 transition-all cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--amber)]">
                      {CATEGORIES[art.category] || art.category}
                    </span>
                    <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(art.date_saved).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold font-serif-reading text-[var(--text)] group-hover:text-[var(--amber)] transition-colors line-clamp-1">
                    {art.title}
                  </h4>
                  <p className="text-xs text-[var(--muted)] line-clamp-1">
                    {art.source}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--amber)] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
