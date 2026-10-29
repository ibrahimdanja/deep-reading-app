import React from 'react';
import { Flame, SlidersHorizontal, BookMarked } from 'lucide-react';
import { ReaderSettings } from '../types';

interface HeaderProps {
  streak: number;
  dueCount: number;
  settings: ReaderSettings;
  onOpenSettings: () => void;
  onNavigateReviews: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  dueCount,
  onOpenSettings,
  onNavigateReviews
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[var(--bg)]/90 border-b border-[var(--hairline)] px-4 py-3 transition-colors">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Lamp dot brand mark */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--amber)] shadow-[0_0_12px_2px_var(--amber-dim)] animate-pulse" />
            <span className="absolute w-5 h-5 rounded-full bg-[var(--amber)]/20 animate-ping opacity-40" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[var(--text)] flex items-center gap-1.5">
              Deep Reading
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">
              Socratic Recall & Science
            </p>
          </div>
        </div>

        {/* Right action badges */}
        <div className="flex items-center gap-2">
          {/* Streak badge */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--panel)] border border-[var(--hairline)] text-xs font-semibold text-[var(--text-soft)]"
            title={`${streak} day reading streak`}
          >
            <Flame className="w-3.5 h-3.5 text-[var(--amber)] fill-[var(--amber)]/30" />
            <span>{streak}d</span>
          </div>

          {/* Due reviews quick pill */}
          {dueCount > 0 && (
            <button
              onClick={onNavigateReviews}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--amber)]/15 border border-[var(--amber)]/30 text-xs font-semibold text-[var(--amber)] hover:bg-[var(--amber)]/25 transition-colors cursor-pointer"
              title={`${dueCount} reviews due today`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>{dueCount} due</span>
            </button>
          )}

          {/* Reader settings button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-[var(--panel)] border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
            aria-label="Reader settings"
            title="Reader typography & theme settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
