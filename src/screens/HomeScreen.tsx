import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Flame,
  Target,
  ArrowRight,
  Clock,
  Dices,
  HeartHandshake
} from 'lucide-react';
import { AppStats, Article, CategoryKey, CATEGORIES, Recommendation } from '../types';
import { getRandomSerendipityCategory } from '../services/contentService';
import { lightHaptic, mediumHaptic } from '../services/hapticsService';

interface HomeScreenProps {
  stats: AppStats;
  recommendation: Recommendation;
  recentArticles: Article[];
  onStartReading: (category?: CategoryKey) => void;
  onNavigateReviews: () => void;
  onOpenArticle: (article: Article) => void;
  onNavigateLibrary: () => void;
  onTriggerRescue: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  recommendation,
  recentArticles,
  onStartReading,
  onNavigateReviews,
  onOpenArticle,
  onNavigateLibrary,
  onTriggerRescue
}) => {
  const [spinning, setSpinning] = useState(false);
  const goal = stats.goal;

  const handleSerendipitySpin = () => {
    lightHaptic();
    setSpinning(true);
    setTimeout(() => {
      mediumHaptic();
      setSpinning(false);
      const picked = getRandomSerendipityCategory();
      onStartReading(picked);
    }, 600);
  };

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-150">
      {/* One UI Top Viewing Zone: Gentle Heading */}
      <section className="pt-1">
        <h2 className="text-xl sm:text-2xl font-serif-reading font-semibold text-[var(--text)] tracking-tight leading-snug">
          Break the infinite scroll. <br />
          <span className="text-[var(--amber)]">Train your deep attention.</span>
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
          Short peer-reviewed abstracts across 14 disciplines paired with Socratic reflection and SM-2 active recall.
        </p>
      </section>

      {/* Emergency Rescue Card */}
      <section className="bg-gradient-to-r from-[var(--amber-dim)]/40 to-[var(--panel)] border border-[var(--amber)]/30 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--amber)] flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Doomscroll Interceptor</span>
          </span>
          <h4 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
            Feeling stuck in a scroll loop?
          </h4>
          <p className="text-[11px] text-[var(--muted)]">
            Take a 10s guided breath to reset cognitive inertia.
          </p>
        </div>
        <button
          onClick={() => {
            mediumHaptic();
            onTriggerRescue();
          }}
          className="px-3.5 py-2 rounded-xl bg-[var(--amber)] text-black font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shadow"
        >
          <span>Rescue Me</span>
        </button>
      </section>

      {/* Daily Target Progress */}
      <section className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-[var(--amber-dim)] text-[var(--amber)]">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--text)]">Daily Reading Target</h3>
              <p className="text-[11px] text-[var(--muted)]">
                {goal.completed >= goal.goal
                  ? 'Target accomplished for today!'
                  : `${goal.remaining} more piece${goal.remaining > 1 ? 's' : ''} to complete`}
              </p>
            </div>
          </div>
          <span className="text-sm font-bold font-serif-reading text-[var(--amber)]">
            {goal.completed}/{goal.goal}
          </span>
        </div>

        <div className="w-full bg-[var(--bg)] h-2 rounded-full overflow-hidden border border-[var(--hairline)]">
          <div
            className="h-full bg-gradient-to-r from-[var(--amber)] to-[var(--sage)] rounded-full transition-all duration-500"
            style={{ width: `${goal.percent}%` }}
          />
        </div>
      </section>

      {/* Spaced Recall Due Callout */}
      {stats.reviews_due > 0 && (
        <section className="bg-[var(--panel-elevated)] border-l-4 border-l-[var(--amber)] border-y border-r border-[var(--hairline)] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--amber)]">
              <Sparkles className="w-3 h-3" />
              <span>Active SM-2 Recall Queue</span>
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
              {stats.reviews_due} article{stats.reviews_due > 1 ? 's' : ''} due for review
            </h4>
            <p className="text-[11px] text-[var(--muted)]">
              Reinforce synapses before neural memory fades.
            </p>
          </div>
          <button
            onClick={() => {
              mediumHaptic();
              onNavigateReviews();
            }}
            className="px-3.5 py-2 rounded-xl bg-[var(--amber)] text-black font-bold text-xs hover:opacity-90 transition-all cursor-pointer whitespace-nowrap shadow"
          >
            Review Now
          </button>
        </section>
      )}

      {/* One UI Bottom Thumb Interactive Zone: Serendipity Roulette & Recommended Read */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Serendipity Roulette Button */}
        <button
          onClick={handleSerendipitySpin}
          disabled={spinning}
          className="bg-[var(--panel)] border border-[var(--hairline)] hover:border-[var(--amber)]/40 rounded-2xl p-3.5 text-left transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-lg bg-[var(--amber-dim)] text-[var(--amber)]">
              <Dices className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
            </div>
            <span className="text-[10px] uppercase font-bold text-[var(--amber)] tracking-wider">
              Random
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--amber)] transition-colors">
              Surprise Me
            </h4>
            <p className="text-[10px] text-[var(--muted)]">Spin across 14 subjects</p>
          </div>
        </button>

        {/* Recommended Subject Card */}
        <button
          onClick={() => {
            lightHaptic();
            onStartReading(recommendation.category);
          }}
          className="bg-[var(--panel)] border border-[var(--hairline)] hover:border-[var(--amber)]/40 rounded-2xl p-3.5 text-left transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-1.5 rounded-lg bg-[var(--sage)]/15 text-[var(--sage)]">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-bold text-[var(--sage)] tracking-wider">
              Nudge
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--amber)] transition-colors line-clamp-1">
              {recommendation.label}
            </h4>
            <p className="text-[10px] text-[var(--muted)] line-clamp-1">
              {recommendation.reason}
            </p>
          </div>
        </button>
      </div>

      {/* Quick Metrics */}
      <section className="grid grid-cols-3 gap-2">
        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[var(--amber)] mb-0.5">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-lg font-bold font-serif-reading">{stats.streak}</span>
          </div>
          <p className="text-[10px] text-[var(--muted)] font-medium">Day Streak</p>
        </div>

        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-xl p-2.5 text-center">
          <div className="text-lg font-bold font-serif-reading text-[var(--text)] mb-0.5">
            {stats.articles_saved}
          </div>
          <p className="text-[10px] text-[var(--muted)] font-medium">Saved Reads</p>
        </div>

        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-xl p-2.5 text-center">
          <div className="text-lg font-bold font-serif-reading text-[var(--sage)] mb-0.5">
            {stats.questions_answered}
          </div>
          <p className="text-[10px] text-[var(--muted)] font-medium">Reflections</p>
        </div>
      </section>

      {/* Recent Activity List */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Recent Readings
          </h3>
          <button
            onClick={() => {
              lightHaptic();
              onNavigateLibrary();
            }}
            className="text-[11px] text-[var(--amber)] font-medium hover:underline cursor-pointer"
          >
            Library ({stats.articles_saved})
          </button>
        </div>

        {recentArticles.length === 0 ? (
          <div className="text-center py-6 bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl text-[var(--muted)] text-xs">
            No readings saved yet. Tap "Surprise Me" or the suggested subject above to start!
          </div>
        ) : (
          <div className="space-y-2">
            {recentArticles.slice(0, 3).map(art => (
              <div
                key={art.id}
                onClick={() => {
                  lightHaptic();
                  onOpenArticle(art);
                }}
                className="bg-[var(--panel)] border border-[var(--hairline)] hover:border-[var(--amber)]/40 rounded-xl p-3 transition-all cursor-pointer group flex items-start justify-between gap-2.5"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--amber)]">
                      {CATEGORIES[art.category] || art.category}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(art.date_saved).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold font-serif-reading text-[var(--text)] group-hover:text-[var(--amber)] transition-colors line-clamp-1">
                    {art.title}
                  </h4>
                  <p className="text-[10px] text-[var(--muted)] line-clamp-1">
                    {art.source}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--amber)] flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
