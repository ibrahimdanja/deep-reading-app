import React from 'react';
import { Flame, SlidersHorizontal, BookMarked, HeartHandshake } from 'lucide-react';
import { ReaderSettings } from '../types';
import { lightHaptic, mediumHaptic } from '../services/hapticsService';

interface HeaderProps {
  streak: number;
  dueCount: number;
  settings: ReaderSettings;
  onOpenSettings: () => void;
  onNavigateReviews: () => void;
  onTriggerRescue: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  dueCount,
  onOpenSettings,
  onNavigateReviews,
  onTriggerRescue
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[var(--bg)]/90 border-b border-[var(--hairline)] px-3 sm:px-4 pt-2.5 pb-2 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Lamp dot brand mark */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--amber)] shadow-[0_0_10px_2px_var(--amber-dim)] animate-pulse" />
            <span className="absolute w-4 h-4 rounded-full bg-[var(--amber)]/20 animate-ping opacity-40" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-[var(--text)]">
              Deep Reading
            </h1>
            <p className="text-[9px] uppercase tracking-wider text-[var(--muted)] font-semibold">
              Anti-Doomscroll Zone
            </p>
          </div>
        </div>

        {/* Right action group */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Emergency Rescue Trigger */}
          <button
            onClick={() => {
              mediumHaptic();
              onTriggerRescue();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--amber-dim)] border border-[var(--amber)]/40 text-[11px] font-bold text-[var(--amber)] hover:bg-[var(--amber)] hover:text-black transition-all cursor-pointer shadow-sm animate-pulse"
            title="Caught doomscrolling? Tap for a 10s breathing reset"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Rescue</span>
          </button>

          {/* Streak badge */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--panel)] border border-[var(--hairline)] text-[11px] font-semibold text-[var(--text-soft)]"
            title={`${streak} day reading streak`}
          >
            <Flame className="w-3 h-3 text-[var(--amber)] fill-[var(--amber)]/30" />
            <span>{streak}d</span>
          </div>

          {/* Due reviews quick pill */}
          {dueCount > 0 && (
            <button
              onClick={() => {
                lightHaptic();
                onNavigateReviews();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--amber)]/15 border border-[var(--amber)]/30 text-[11px] font-bold text-[var(--amber)] cursor-pointer"
              title={`${dueCount} reviews due`}
            >
              <BookMarked className="w-3 h-3" />
              <span>{dueCount}</span>
            </button>
          )}

          {/* Reader settings */}
          <button
            onClick={() => {
              lightHaptic();
              onOpenSettings();
            }}
            className="p-1.5 rounded-lg bg-[var(--panel)] border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
            aria-label="Reader settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
