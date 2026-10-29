import React, { useState, useEffect } from 'react';
import { Sparkles, HeartHandshake, Compass, X } from 'lucide-react';
import { CategoryKey } from '../types';
import { getRandomSerendipityCategory } from '../services/contentService';
import { lightHaptic, mediumHaptic } from '../services/hapticsService';

interface EmergencyRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchReading: (category: CategoryKey) => void;
}

export const EmergencyRescueModal: React.FC<EmergencyRescueModalProps> = ({
  isOpen,
  onClose,
  onLaunchReading
}) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);

  useEffect(() => {
    if (!isOpen) return;

    let timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setPhase(cur => {
            if (cur === 'inhale') {
              lightHaptic();
              return 'hold';
            }
            if (cur === 'hold') {
              mediumHaptic();
              return 'exhale';
            }
            lightHaptic();
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const phaseInstructions = {
    inhale: 'Breathe in slowly through your nose...',
    hold: 'Gently hold your breath...',
    exhale: 'Slowly release and let tension dissolve...'
  };

  const handleStartReading = () => {
    mediumHaptic();
    const randomCat = getRandomSerendipityCategory();
    onLaunchReading(randomCat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[var(--panel)] border border-[var(--amber-dim)] rounded-3xl max-w-sm w-full p-6 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hairline)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--amber-dim)] text-[var(--amber)] text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Doomscroll Rescue Zone</span>
          </div>
          <h2 className="text-xl font-bold font-serif-reading text-[var(--text)]">
            Reset Your Attention
          </h2>
          <p className="text-xs text-[var(--muted)]">
            You caught the loop. Give your nervous system a 10-second breath before feeding your mind.
          </p>
        </div>

        {/* Breathing Circle Pulse Animation */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center my-4">
          {/* Pulsing ring */}
          <div
            className={`absolute inset-0 rounded-full bg-[var(--amber)]/15 border-2 border-[var(--amber)]/40 transition-all duration-1000 ${
              phase === 'inhale' ? 'scale-110 opacity-80' : phase === 'hold' ? 'scale-105 opacity-60' : 'scale-90 opacity-30'
            }`}
          />
          <div
            className={`w-28 h-28 rounded-full bg-gradient-to-tr from-[var(--panel-elevated)] to-[var(--bg)] border border-[var(--amber)]/30 flex flex-col items-center justify-center shadow-lg transition-transform duration-1000 ${
              phase === 'inhale' ? 'scale-105' : phase === 'hold' ? 'scale-100' : 'scale-95'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--amber)]">
              {phase}
            </span>
            <span className="text-2xl font-bold font-serif-reading text-[var(--text)]">
              {secondsLeft}s
            </span>
          </div>
        </div>

        <p className="text-xs text-[var(--text-soft)] italic h-8 flex items-center justify-center font-serif-reading px-2">
          "{phaseInstructions[phase]}"
        </p>

        {/* Grounding Action */}
        <div className="pt-2 border-t border-[var(--hairline)] space-y-2">
          <button
            onClick={handleStartReading}
            className="w-full py-3 px-4 rounded-2xl bg-[var(--amber)] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Compass className="w-4 h-4" />
            <span>Shift to a 2-Minute Deep Read</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            I'm centered now, return to home
          </button>
        </div>
      </div>
    </div>
  );
};
