import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Check,
  Sparkles,
  BookMarked,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CategoryKey, CATEGORIES, ReadingPiece, ReaderSettings } from '../types';
import { fetchPieceForCategory } from '../services/contentService';
import { saveEntry } from '../services/storageService';

interface ReadScreenProps {
  initialCategory?: CategoryKey;
  settings: ReaderSettings;
  onSaved: () => void;
  onNavigateHome: () => void;
}

export const ReadScreen: React.FC<ReadScreenProps> = ({
  initialCategory = 'science',
  settings,
  onSaved,
  onNavigateHome
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(initialCategory);
  const [piece, setPiece] = useState<ReadingPiece | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [isQuestionsRevealed, setIsQuestionsRevealed] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync if initialCategory prop changes
  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const loadPiece = async (cat: CategoryKey) => {
    setLoading(true);
    setSavedSuccess(false);
    setAnswers(['', '', '']);
    try {
      const data = await fetchPieceForCategory(cat);
      setPiece(data);
    } catch (e) {
      console.error('Failed to load piece', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPiece(selectedCategory);
  }, [selectedCategory]);

  const handleAnswerChange = (index: number, val: string) => {
    const next = [...answers];
    next[index] = val;
    setAnswers(next);
  };

  const handleSave = () => {
    if (!piece) return;
    setIsSaving(true);
    try {
      saveEntry(
        {
          title: piece.title,
          summary: piece.summary,
          url: piece.url,
          source: piece.source,
          category: piece.category
        },
        piece.questions,
        answers
      );
      setSavedSuccess(true);
      onSaved();
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Font sizing styles
  const fontSizes = {
    sm: 'text-sm sm:text-base leading-relaxed',
    md: 'text-base sm:text-lg leading-relaxed',
    lg: 'text-lg sm:text-xl leading-relaxed',
    xl: 'text-xl sm:text-2xl leading-loose'
  };

  const fontFamilyClass =
    settings.fontFamily === 'serif' ? 'font-serif-reading' : 'font-sans-reading';

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-150">
      {/* Category Pills Slider */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        <div className="flex gap-2 min-w-max">
          {categoryKeys.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--amber)] text-black shadow-sm'
                    : 'bg-[var(--panel)] border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {CATEGORIES[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-10 text-center space-y-3 my-8">
          <div className="inline-block animate-spin p-2 rounded-full bg-[var(--amber-dim)] text-[var(--amber)]">
            <RefreshCw className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-[var(--muted)]">
            Pulling from {CATEGORIES[selectedCategory]} repository & formulating Socratic questions...
          </p>
        </div>
      ) : piece ? (
        <article className="space-y-6">
          {/* Article Header & Summary */}
          <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-5 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber-dim)]">
                {piece.source}
              </span>
              <button
                onClick={() => loadPiece(selectedCategory)}
                className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-[var(--hairline)]"
                title="Shuffle for another piece"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Next Piece</span>
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-serif-reading text-[var(--text)] tracking-tight leading-snug mb-4">
              {piece.title}
            </h1>

            <p className={`${fontFamilyClass} ${fontSizes[settings.fontSize]} text-[var(--text-soft)] mb-5`}>
              {piece.summary}
            </p>

            <div className="pt-3 border-t border-[var(--hairline)] flex items-center justify-between">
              <a
                href={piece.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--amber)] hover:underline"
              >
                <span>Read Original Article</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[11px] text-[var(--muted)]">
                {CATEGORIES[piece.category]}
              </span>
            </div>
          </div>

          {/* Socratic Marginalia Questions Section */}
          <div className="bg-[var(--panel-elevated)] border border-[var(--hairline)] rounded-2xl p-5 sm:p-7 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[var(--amber-dim)] text-[var(--amber)]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)]">
                    Socratic Follow-Up Questions
                  </h3>
                  <p className="text-[11px] text-[var(--muted)]">
                    {piece.question_source === 'ai'
                      ? 'Generated by Gemini Socratic Tutor'
                      : 'Curated Socratic critical thinking prompts'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsQuestionsRevealed(!isQuestionsRevealed)}
                className="text-xs text-[var(--muted)] hover:text-[var(--text)] p-1 rounded cursor-pointer"
              >
                {isQuestionsRevealed ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {isQuestionsRevealed && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {piece.questions.map((q, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-sm sm:text-base font-serif-reading italic text-[var(--text)] leading-snug">
                      <span className="text-[var(--amber)] font-bold mr-1.5">Q{idx + 1}.</span>
                      {q}
                    </p>
                    <textarea
                      value={answers[idx]}
                      onChange={e => handleAnswerChange(idx, e.target.value)}
                      placeholder="Write your reflection, critique, or counter-argument here..."
                      rows={2}
                      className="w-full bg-[var(--bg)] border border-[var(--hairline)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[var(--amber)] placeholder-[var(--muted)] transition-colors resize-y min-h-[56px]"
                    />
                  </div>
                ))}

                {/* Save and Schedule Action */}
                <div className="pt-3 border-t border-[var(--hairline)] flex flex-col sm:flex-row items-center justify-between gap-3">
                  {savedSuccess ? (
                    <div className="w-full flex items-center justify-between bg-[var(--sage)]/15 border border-[var(--sage)]/30 text-[var(--sage)] px-4 py-2.5 rounded-xl text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        Saved! Scheduled for SM-2 recall tomorrow.
                      </span>
                      <button
                        onClick={() => loadPiece(selectedCategory)}
                        className="underline hover:opacity-80 ml-2"
                      >
                        Read Next
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-[var(--muted)] leading-tight">
                        Saving logs this piece to your library and sets an SM-2 spaced repetition reminder for tomorrow.
                      </p>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--amber)] text-black font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow whitespace-nowrap"
                      >
                        <BookMarked className="w-4 h-4" />
                        <span>{isSaving ? 'Saving...' : 'Save & Schedule'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </article>
      ) : (
        <div className="text-center py-12 text-[var(--muted)] text-sm">
          No content available right now.
        </div>
      )}
    </div>
  );
};
