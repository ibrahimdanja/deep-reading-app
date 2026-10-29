import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Eye,
  HelpCircle,
  ExternalLink,
  Layers,
  Calendar,
  RotateCcw,
  Compass
} from 'lucide-react';
import { Article, GradeType, CATEGORIES } from '../types';
import { gradeReview, getDueReviews } from '../services/storageService';

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

    gradeReview(currentArticle.id, grade);
    setGradedFeedback(`Graded as "${grade.toUpperCase()}"!`);

    setTimeout(() => {
      setGradedFeedback(null);
      setIsRevealed(false);
      // Refresh due list
      const updatedDue = getDueReviews();
      setDueArticles(updatedDue);
      if (currentIndex >= updatedDue.length) {
        setCurrentIndex(0);
      }
      onReviewFinished();
    }, 450);
  };

  // Caught up view
  if (!currentArticle || dueArticles.length === 0) {
    return (
      <div className="space-y-6 pb-28 text-center py-10 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-full bg-[var(--sage)]/15 text-[var(--sage)] flex items-center justify-center mx-auto mb-4 border border-[var(--sage)]/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-sm mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold font-serif-reading text-[var(--text)]">
            You're All Caught Up!
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            No spaced repetition reviews are due right now. The SM-2 scheduler will notify you as intervals mature.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={onStartReading}
            className="px-6 py-3 rounded-xl bg-[var(--amber)] text-black font-bold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Compass className="w-4 h-4" />
            <span>Read a New Piece</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-150">
      {/* Review Header Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-reading text-[var(--text)] flex items-center gap-2">
            <span>Spaced Recall</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--amber-dim)] text-[var(--amber)] font-bold">
              {currentIndex + 1} of {dueArticles.length} due
            </span>
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Active retrieval builds permanent conceptual scaffolding.
          </p>
        </div>
      </div>

      {/* Main Review Card */}
      <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-5 sm:p-7 shadow-md space-y-6">
        {/* Source and Category */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--amber-dim)] text-[var(--amber)]">
            {CATEGORIES[currentArticle.category] || currentArticle.category}
          </span>
          <span className="text-xs text-[var(--muted)]">
            {currentArticle.source}
          </span>
        </div>

        {/* Title & Summary */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-serif-reading text-[var(--text)] leading-snug mb-3">
            {currentArticle.title}
          </h3>
          <p className="text-sm sm:text-base font-serif-reading text-[var(--text-soft)] leading-relaxed">
            {currentArticle.summary}
          </p>
        </div>

        {/* Recall Prompt */}
        <div className="bg-[var(--bg)] border border-[var(--hairline)] rounded-xl p-4 text-center space-y-2">
          <p className="text-xs sm:text-sm font-medium text-[var(--muted)] italic">
            "Before revealing your notes, recall: What was the weakest assumption in this piece, and how did you answer?"
          </p>
          {!isRevealed ? (
            <button
              onClick={() => setIsRevealed(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-[var(--panel-elevated)] border border-[var(--amber)]/40 text-[var(--amber)] hover:bg-[var(--amber-dim)] font-semibold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Reveal Your Answers & Notes</span>
            </button>
          ) : null}
        </div>

        {/* Revealed Socratic Notes */}
        {isRevealed && (
          <div className="space-y-4 pt-4 border-t border-[var(--hairline)] animate-in fade-in duration-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--amber)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Your Saved Reflections</span>
            </h4>

            {currentArticle.questions.map((qa, i) => (
              <div
                key={i}
                className="bg-[var(--panel-elevated)] border border-[var(--hairline)] rounded-xl p-3.5 space-y-1.5"
              >
                <p className="text-xs sm:text-sm font-serif-reading italic text-[var(--text)]">
                  <span className="text-[var(--amber)] font-bold mr-1">Q{i + 1}:</span>
                  {qa.question}
                </p>
                <div className="text-xs sm:text-sm text-[var(--text-soft)] pl-2 border-l-2 border-[var(--amber)] pt-0.5">
                  {qa.answer && qa.answer.trim() ? (
                    <p className="whitespace-pre-wrap">{qa.answer}</p>
                  ) : (
                    <p className="italic text-[var(--muted)]">(No written answer saved)</p>
                  )}
                </div>
              </div>
            ))}

            {/* Grading Buttons (SM-2 Quality Scale) */}
            <div className="pt-4 border-t border-[var(--hairline)] space-y-2">
              <p className="text-xs text-[var(--muted)] text-center font-medium">
                How easily did you recall your reflection?
              </p>

              {gradedFeedback ? (
                <div className="text-center py-2 text-xs font-bold text-[var(--amber)] animate-pulse">
                  {gradedFeedback}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleGrade('again')}
                    className="flex flex-col items-center py-2.5 px-1 rounded-xl bg-[var(--panel)] border border-[#c76b6b]/40 hover:bg-[#c76b6b]/20 text-[#e08585] text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Again</span>
                    <span className="text-[10px] text-[var(--muted)] font-normal">Forgot (1d)</span>
                  </button>

                  <button
                    onClick={() => handleGrade('hard')}
                    className="flex flex-col items-center py-2.5 px-1 rounded-xl bg-[var(--panel)] border border-[#d3a15a]/40 hover:bg-[#d3a15a]/20 text-[#d3a15a] text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Hard</span>
                    <span className="text-[10px] text-[var(--muted)] font-normal">Struggled</span>
                  </button>

                  <button
                    onClick={() => handleGrade('good')}
                    className="flex flex-col items-center py-2.5 px-1 rounded-xl bg-[var(--panel)] border border-[var(--sage)]/40 hover:bg-[var(--sage)]/20 text-[var(--sage)] text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Good</span>
                    <span className="text-[10px] text-[var(--muted)] font-normal">Solid</span>
                  </button>

                  <button
                    onClick={() => handleGrade('easy')}
                    className="flex flex-col items-center py-2.5 px-1 rounded-xl bg-[var(--panel)] border border-[var(--amber)]/40 hover:bg-[var(--amber-dim)] text-[var(--amber)] text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Easy</span>
                    <span className="text-[10px] text-[var(--muted)] font-normal">Effortless</span>
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
