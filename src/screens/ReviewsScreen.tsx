import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Eye,
  Compass,
  RotateCcw,
  Layers,
  Calendar
} from 'lucide-react';
import { Article, GradeType, CATEGORIES } from '../types';
import { gradeReview, getDueReviews } from '../services/storageService';
import { lightHaptic, mediumHaptic, alertHaptic, successHaptic } from '../services/hapticsService';

interface ReviewsScreenProps {
  onStartReading: () => void;
  onReviewFinished: () => void;
}

export const ReviewsScreen: React.FC<ReviewsScreenProps> = ({
  onStartReading,
  onReviewFinished
}) => {
  const [dueArticles, setDueArticles] = useState<Article[]>(() => getDueReviews());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [gradedFeedback, setGradedFeedback] = useState<string | null>(null);

  const currentArticle = dueArticles[currentIndex] || null;

  const handleGrade = (grade: GradeType) => {
    if (!currentArticle) return;

    if (grade === 'again') {
      alertHaptic();
    } else if (grade === 'easy') {
      successHaptic();
    } else {
      mediumHaptic();
    }

    gradeReview(currentArticle.id, grade);
    setGradedFeedback(`Graded: ${grade.toUpperCase()}!`);

    setTimeout(() => {
      setGradedFeedback(null);
      setIsRevealed(false);
      const updatedDue = getDueReviews();
      setDueArticles(updatedDue);
      if (currentIndex >= updatedDue.length) {
        setCurrentIndex(0);
      }
      onReviewFinished();
    }, 450);
  };

  if (!currentArticle || dueArticles.length === 0) {
    return (
      <div className="space-y-5 pb-28 text-center py-12 animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-full bg-[var(--sage)]/15 text-[var(--sage)] flex items-center justify-center mx-auto mb-3 border border-[var(--sage)]/30">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 max-w-xs mx-auto">
          <h2 className="text-xl font-bold font-serif-reading text-[var(--text)]">
            You're All Caught Up!
          </h2>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            No spaced repetition reviews are due right now. The SM-2 scheduler will notify you as intervals mature.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              lightHaptic();
              onStartReading();
            }}
            className="px-5 py-2.5 rounded-2xl bg-[var(--amber)] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Compass className="w-4 h-4" />
            <span>Read a New Piece</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-serif-reading text-[var(--text)] flex items-center gap-2">
            <span>Spaced Recall Queue</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--amber-dim)] text-[var(--amber)] font-bold">
              {currentIndex + 1} of {dueArticles.length}
            </span>
          </h2>
          <p className="text-[11px] text-[var(--muted)]">
            Active recall builds permanent long-term conceptual retention.
          </p>
        </div>
      </div>

      {/* Main Review Flashcard */}
      <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-3xl p-4 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--amber-dim)] text-[var(--amber)]">
            {CATEGORIES[currentArticle.category] || currentArticle.category}
          </span>
          <span className="text-[10px] text-[var(--muted)]">
            {currentArticle.source}
          </span>
        </div>

        {/* Title and summary */}
        <div>
          <h3 className="text-base sm:text-lg font-bold font-serif-reading text-[var(--text)] leading-snug mb-2">
            {currentArticle.title}
          </h3>
          <p className="text-xs sm:text-sm font-serif-reading text-[var(--text-soft)] leading-relaxed">
            {currentArticle.summary}
          </p>
        </div>

        {/* Recall Prompt */}
        <div className="bg-[var(--bg)] border border-[var(--hairline)] rounded-2xl p-3.5 text-center space-y-2">
          <p className="text-xs font-medium text-[var(--muted)] italic">
            "Before revealing your notes, recall: What was the weakest assumption in this piece, and how did you answer?"
          </p>
          {!isRevealed ? (
            <button
              onClick={() => {
                mediumHaptic();
                setIsRevealed(true);
              }}
              className="mt-1 px-4 py-2 rounded-xl bg-[var(--panel-elevated)] border border-[var(--amber)]/40 text-[var(--amber)] hover:bg-[var(--amber-dim)] font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Reveal Your Reflections</span>
            </button>
          ) : null}
        </div>

        {/* Revealed Content */}
        {isRevealed && (
          <div className="space-y-3 pt-3 border-t border-[var(--hairline)] animate-in fade-in duration-200">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--amber)] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Your Saved Reflections</span>
            </h4>

            {currentArticle.questions.map((qa, i) => (
              <div
                key={i}
                className="bg-[var(--panel-elevated)] border border-[var(--hairline)] rounded-2xl p-3 space-y-1"
              >
                <p className="text-xs font-serif-reading italic text-[var(--text)]">
                  <span className="text-[var(--amber)] font-bold mr-1">Q{i + 1}:</span>
                  {qa.question}
                </p>
                <div className="text-xs text-[var(--text-soft)] pl-2 border-l-2 border-[var(--amber)] pt-0.5">
                  {qa.answer && qa.answer.trim() ? (
                    <p className="whitespace-pre-wrap">{qa.answer}</p>
                  ) : (
                    <p className="italic text-[var(--muted)]">(No written answer recorded)</p>
                  )}
                </div>
              </div>
            ))}

            {/* SM-2 Grading Row */}
            <div className="pt-3 border-t border-[var(--hairline)] space-y-2">
              <p className="text-[11px] text-[var(--muted)] text-center font-medium">
                Grade your active recall quality:
              </p>

              {gradedFeedback ? (
                <div className="text-center py-2 text-xs font-bold text-[var(--amber)] animate-pulse">
                  {gradedFeedback}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => handleGrade('again')}
                    className="flex flex-col items-center py-2 px-1 rounded-xl bg-[var(--panel)] border border-[#c76b6b]/40 hover:bg-[#c76b6b]/20 text-[#e08585] text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Again</span>
                    <span className="text-[9px] text-[var(--muted)] font-normal">Forgot (1d)</span>
                  </button>

                  <button
                    onClick={() => handleGrade('hard')}
                    className="flex flex-col items-center py-2 px-1 rounded-xl bg-[var(--panel)] border border-[#d3a15a]/40 hover:bg-[#d3a15a]/20 text-[#d3a15a] text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Hard</span>
                    <span className="text-[9px] text-[var(--muted)] font-normal">Struggled</span>
                  </button>

                  <button
                    onClick={() => handleGrade('good')}
                    className="flex flex-col items-center py-2 px-1 rounded-xl bg-[var(--panel)] border border-[var(--sage)]/40 hover:bg-[var(--sage)]/20 text-[var(--sage)] text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Good</span>
                    <span className="text-[9px] text-[var(--muted)] font-normal">Recalled</span>
                  </button>

                  <button
                    onClick={() => handleGrade('easy')}
                    className="flex flex-col items-center py-2 px-1 rounded-xl bg-[var(--panel)] border border-[var(--amber)]/40 hover:bg-[var(--amber-dim)] text-[var(--amber)] text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Easy</span>
                    <span className="text-[9px] text-[var(--muted)] font-normal">Instant</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
