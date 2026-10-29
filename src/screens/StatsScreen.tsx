import React, { useState } from 'react';
import {
  BarChart3,
  Flame,
  Target,
  Download,
  Check,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { AppStats, CATEGORIES, CategoryKey } from '../types';
import { setDailyGoalTarget, loadAllArticles } from '../services/storageService';
import { lightHaptic, successHaptic } from '../services/hapticsService';

interface StatsScreenProps {
  stats: AppStats;
  onGoalUpdated: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({
  stats,
  onGoalUpdated
}) => {
  const [selectedGoal, setSelectedGoal] = useState<number>(stats.goal.goal);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGoalChange = (newTarget: number) => {
    lightHaptic();
    setSelectedGoal(newTarget);
    setDailyGoalTarget(newTarget);
    onGoalUpdated();
  };

  const handleExportJson = () => {
    successHaptic();
    const articles = loadAllArticles();
    const blob = new Blob([JSON.stringify(articles, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deep-reading-a10s-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build 28-day habit matrix
  const days: { dateStr: string; dayNum: number; count: number }[] = [];
  const now = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      dateStr,
      dayNum: d.getDate(),
      count: stats.activityHistory[dateStr] || 0
    });
  }

  const totalArticles = stats.articles_saved || 1;

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-150">
      <div>
        <h2 className="text-lg sm:text-xl font-bold font-serif-reading text-[var(--text)]">
          Reading Analytics & Habits
        </h2>
        <p className="text-[11px] text-[var(--muted)]">
          Track multidisciplinary breadth and long-term memory retention.
        </p>
      </div>

      {/* 28-Day Habit Heatmap Matrix */}
      <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-3xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--amber)]" />
            <span>28-Day Attention Habit Matrix</span>
          </h3>
          <span className="text-[10px] text-[var(--muted)]">
            {stats.streak} day streak
          </span>
        </div>

        {/* 4 rows x 7 days grid */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {days.map(d => {
            const intensity =
              d.count === 0
                ? 'bg-[var(--bg)] border border-[var(--hairline)]'
                : d.count === 1
                ? 'bg-[var(--amber)]/40 border border-[var(--amber)]/60 text-black'
                : d.count === 2
                ? 'bg-[var(--amber)]/80 text-black'
                : 'bg-[var(--amber)] text-black font-bold';

            return (
              <div
                key={d.dateStr}
                title={`${d.dateStr}: ${d.count} reading(s)`}
                className={`h-7 rounded-lg flex items-center justify-center text-[10px] transition-transform hover:scale-105 ${intensity}`}
              >
                <span>{d.dayNum}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-1 text-[9px] text-[var(--muted)] pt-1">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded bg-[var(--bg)] border border-[var(--hairline)]" />
          <span className="w-2.5 h-2.5 rounded bg-[var(--amber)]/40" />
          <span className="w-2.5 h-2.5 rounded bg-[var(--amber)]" />
          <span>More</span>
        </div>
      </div>

      {/* Daily Goal Control */}
      <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-3xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[var(--amber)]" />
            <h3 className="text-xs font-bold text-[var(--text)]">Daily Reading Target</h3>
          </div>
          <span className="text-[11px] font-bold text-[var(--amber)]">
            {selectedGoal} pieces / day
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 5].map(target => (
            <button
              key={target}
              onClick={() => handleGoalChange(target)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedGoal === target
                  ? 'bg-[var(--amber)] text-black border-[var(--amber)] shadow-sm'
                  : 'bg-[var(--bg)] border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {target} {target === 1 ? 'Read' : 'Reads'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Metric Tiles */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[var(--amber)] mb-0.5">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xl font-bold font-serif-reading">{stats.streak}</span>
          </div>
          <p className="text-[10px] text-[var(--text-soft)] font-semibold">Active Streak</p>
          <p className="text-[9px] text-[var(--muted)]">Consecutive days</p>
        </div>

        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-3 text-center">
          <div className="text-xl font-bold font-serif-reading text-[var(--sage)] mb-0.5">
            {stats.questions_answered}
          </div>
          <p className="text-[10px] text-[var(--text-soft)] font-semibold">Socratic Reflections</p>
          <p className="text-[9px] text-[var(--muted)]">Answers penned</p>
        </div>

        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-3 text-center">
          <div className="text-xl font-bold font-serif-reading text-[var(--text)] mb-0.5">
            {stats.articles_saved}
          </div>
          <p className="text-[10px] text-[var(--text-soft)] font-semibold">Vault Entries</p>
          <p className="text-[9px] text-[var(--muted)]">Total saved</p>
        </div>

        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-3 text-center">
          <div className="text-xl font-bold font-serif-reading text-[var(--amber)] mb-0.5">
            {stats.category_count}/14
          </div>
          <p className="text-[10px] text-[var(--text-soft)] font-semibold">Breadth</p>
          <p className="text-[9px] text-[var(--muted)]">Disciplines read</p>
        </div>
      </div>

      {/* 14 Disciplines Distribution */}
      <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-3xl p-4 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-[var(--amber)]" />
          <span>Subject Breadth Distribution</span>
        </h3>

        <div className="space-y-2">
          {(Object.keys(CATEGORIES) as CategoryKey[]).map(cat => {
            const count = stats.categories[cat] || 0;
            const pct = Math.round((count / totalArticles) * 100);

            return (
              <div key={cat} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-[var(--text-soft)]">
                    {CATEGORIES[cat]}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-[var(--bg)] h-1.5 rounded-full overflow-hidden border border-[var(--hairline)]">
                  <div
                    className="h-full bg-[var(--amber)] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(pct, count > 0 ? 6 : 0))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup Export Card */}
      <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-3xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-[var(--text)]">Export Your Vault</h3>
          <p className="text-[10px] text-[var(--muted)]">
            Download your reading notes and recall history as clean JSON.
          </p>
        </div>
        <button
          onClick={handleExportJson}
          className="px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--hairline)] hover:border-[var(--amber)] text-xs font-semibold text-[var(--text)] hover:text-[var(--amber)] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[var(--sage)]" /> : <Download className="w-3.5 h-3.5" />}
          <span>{copied ? 'Saved' : 'Export'}</span>
        </button>
      </div>
    </div>
  );
};
