import React, { useState } from 'react';
import {
  BarChart3,
  Flame,
  Target,
  BookOpen,
  Sparkles,
  Download,
  RotateCcw,
  Check,
  Award
} from 'lucide-react';
import { AppStats, CATEGORIES, CategoryKey } from '../types';
import { setDailyGoalTarget, loadAllArticles } from '../services/storageService';

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
    setSelectedGoal(newTarget);
    setDailyGoalTarget(newTarget);
    onGoalUpdated();
  };

  const handleExportJson = () => {
    const articles = loadAllArticles();
    const blob = new Blob([JSON.stringify(articles, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deep-reading-library-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalArticles = stats.articles_saved || 1;

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-150">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif-reading text-[var(--text)]">
          Reading Analytics & Goals
        </h2>
        <p className="text-xs text-[var(--muted)]">
          Track intellectual breadth, habits, and spaced retention.
        </p>
      </div>

      {/* Goal Adjustment Card */}
      <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--amber-dim)] text-[var(--amber)]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text)]">
                Daily Reading Objective
              </h3>
              <p className="text-xs text-[var(--muted)]">
                How many deep abstracts to read and question each day
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--amber-dim)] text-[var(--amber)]">
            {selectedGoal} pieces / day
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 5].map(target => (
            <button
              key={target}
              onClick={() => handleGoalChange(target)}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedGoal === target
                  ? 'bg-[var(--amber)] text-black border-[var(--amber)] shadow'
                  : 'bg-[var(--bg)] border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {target} {target === 1 ? 'Piece' : 'Pieces'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-[var(--amber)] mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-2xl font-bold font-serif-reading">{stats.streak}</span>
          </div>
          <p className="text-xs font-semibold text-[var(--text)]">Day Streak</p>
          <p className="text-[10px] text-[var(--muted)]">Consecutive days</p>
        </div>

        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold font-serif-reading text-[var(--text)] mb-1">
            {stats.articles_saved}
          </div>
          <p className="text-xs font-semibold text-[var(--text)]">Articles Saved</p>
          <p className="text-[10px] text-[var(--muted)]">In your personal library</p>
        </div>

        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold font-serif-reading text-[var(--sage)] mb-1">
            {stats.questions_answered}
          </div>
          <p className="text-xs font-semibold text-[var(--text)]">Reflections</p>
          <p className="text-[10px] text-[var(--muted)]">Socratic answers written</p>
        </div>

        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold font-serif-reading text-[var(--amber)] mb-1">
            {stats.category_count}
          </div>
          <p className="text-xs font-semibold text-[var(--text)]">Subjects Read</p>
          <p className="text-[10px] text-[var(--muted)]">Across 8 disciplines</p>
        </div>
      </div>

      {/* Category Breadth Breakdown */}
      <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-[var(--amber)]" />
          <span>Subject Breadth Distribution</span>
        </h3>

        <div className="space-y-3">
          {(Object.keys(CATEGORIES) as CategoryKey[]).map(cat => {
            const count = stats.categories[cat] || 0;
            const pct = Math.round((count / totalArticles) * 100);

            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text-soft)]">
                    {CATEGORIES[cat]}
                  </span>
                  <span className="text-[var(--muted)]">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-[var(--bg)] h-2 rounded-full overflow-hidden border border-[var(--hairline)]">
                  <div
                    className="h-full bg-[var(--amber)] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(pct, count > 0 ? 5 : 0))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Backup Card */}
      <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">Export Your Notes</h3>
          <p className="text-xs text-[var(--muted)]">
            Download your entire library and reflections as clean JSON.
          </p>
        </div>
        <button
          onClick={handleExportJson}
          className="px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--hairline)] hover:border-[var(--amber)] text-xs font-semibold text-[var(--text)] hover:text-[var(--amber)] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[var(--sage)]" /> : <Download className="w-3.5 h-3.5" />}
          <span>{copied ? 'Downloaded' : 'Export JSON'}</span>
        </button>
      </div>
    </div>
  );
};
