import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  ExternalLink,
  Check,
  Sparkles,
  BookMarked,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Quote,
  Flame,
  Brain,
  MessageSquareShare
} from 'lucide-react';
import {
  CategoryKey,
  CATEGORIES,
  ReadingPiece,
  ReaderSettings,
  QuoteCardData
} from '../types';
import { fetchPieceForCategory } from '../services/contentService';
import { saveEntry } from '../services/storageService';
import { challengeThinking } from '../services/questionsService';
import { speakArticle, stopSpeech, isTTSSupported } from '../services/ttsService';
import { lightHaptic, mediumHaptic, successHaptic } from '../services/hapticsService';

interface ReadScreenProps {
  initialCategory?: CategoryKey;
  settings: ReaderSettings;
  onSaved: () => void;
  onNavigateHome: () => void;
  onOpenQuoteCard: (data: QuoteCardData) => void;
}

export const ReadScreen: React.FC<ReadScreenProps> = ({
  initialCategory = 'science',
  settings,
  onSaved,
  onOpenQuoteCard
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(initialCategory);
  const [piece, setPiece] = useState<ReadingPiece | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [critiques, setCritiques] = useState<{ critique: string; devilAdvocate: string }[]>([
    { critique: '', devilAdvocate: '' },
    { critique: '', devilAdvocate: '' },
    { critique: '', devilAdvocate: '' }
  ]);
  const [critiqueLoadingIndex, setCritiqueLoadingIndex] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Audio / TTS state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const ttsAvailable = isTTSSupported();

  // Highlight selection state
  const [selectedText, setSelectedText] = useState<string>('');

  useEffect(() => {
    if (initialCategory && initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const loadPiece = async (cat: CategoryKey) => {
    stopSpeech();
    setIsSpeaking(false);
    setLoading(true);
    setSavedSuccess(false);
    setAnswers(['', '', '']);
    setCritiques([
      { critique: '', devilAdvocate: '' },
      { critique: '', devilAdvocate: '' },
      { critique: '', devilAdvocate: '' }
    ]);
    setSelectedText('');

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
    return () => {
      stopSpeech();
    };
  }, [selectedCategory]);

  const handleAnswerChange = (index: number, val: string) => {
    const next = [...answers];
    next[index] = val;
    setAnswers(next);
  };

  const handleChallengeThinking = async (index: number) => {
    if (!piece || !answers[index]?.trim()) return;
    lightHaptic();
    setCritiqueLoadingIndex(index);

    try {
      const result = await challengeThinking(
        piece.title,
        piece.summary,
        piece.questions[index],
        answers[index]
      );

      const next = [...critiques];
      next[index] = result;
      setCritiques(next);
      mediumHaptic();
    } catch (e) {
      console.error('Critique failed', e);
    } finally {
      setCritiqueLoadingIndex(null);
    }
  };

  const handleSave = () => {
    if (!piece) return;
    setIsSaving(true);
    try {
      const critiqueNotes = critiques.map(c =>
        c.critique ? `${c.critique} (Devil's Advocate: ${c.devilAdvocate})` : undefined
      );

      saveEntry(
        {
          title: piece.title,
          summary: piece.summary,
          url: piece.url,
          source: piece.source,
          category: piece.category
        },
        piece.questions,
        answers,
        critiqueNotes
      );
      successHaptic();
      setSavedSuccess(true);
      onSaved();
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Text selection listener for quote card generation
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 15) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleCreateQuoteCard = (textToUse?: string) => {
    if (!piece) return;
    lightHaptic();
    const quote = textToUse || selectedText || piece.summary.slice(0, 160) + '...';
    onOpenQuoteCard({
      quote,
      title: piece.title,
      source: piece.source,
      category: piece.category
    });
  };

  const toggleSpeech = () => {
    if (!piece) return;
    lightHaptic();

    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      speakArticle(
        piece.title,
        piece.summary,
        piece.questions,
        speechRate,
        (speaking: boolean) => setIsSpeaking(speaking)
      );
    }
  };

  const cycleSpeechRate = () => {
    lightHaptic();
    const rates = [0.8, 1.0, 1.2, 1.5];
    const nextIdx = (rates.indexOf(speechRate) + 1) % rates.length;
    const newRate = rates[nextIdx];
    setSpeechRate(newRate);
    if (isSpeaking && piece) {
      speakArticle(piece.title, piece.summary, piece.questions, newRate, (speaking: boolean) =>
        setIsSpeaking(speaking)
      );
    }
  };

  const fontSizes = {
    sm: 'text-xs sm:text-sm leading-relaxed',
    md: 'text-sm sm:text-base leading-relaxed',
    lg: 'text-base sm:text-lg leading-relaxed',
    xl: 'text-lg sm:text-xl leading-loose'
  };

  const fontFamilyClass =
    settings.fontFamily === 'serif' ? 'font-serif-reading' : 'font-sans-reading';

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-150">
      {/* 14-Category Scrollable Thumb Slider */}
      <div className="overflow-x-auto no-scrollbar -mx-3 px-3 py-1">
        <div className="flex gap-1.5 min-w-max">
          {categoryKeys.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  lightHaptic();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--amber)] text-black shadow-sm font-bold'
                    : 'bg-[var(--panel)] border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {CATEGORIES[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-3xl p-8 text-center space-y-3 my-6">
          <div className="inline-block animate-spin p-2 rounded-full bg-[var(--amber-dim)] text-[var(--amber)]">
            <RefreshCw className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[var(--muted)]">
            Pulling {CATEGORIES[selectedCategory]} and formulating Socratic challenges...
          </p>
        </div>
      ) : piece ? (
        <article className="space-y-4" onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}>
          {/* Main Article Container */}
          <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            {/* Top Toolbar: Source Pill + Next Shuffle + TTS Listen Control */}
            <div className="flex items-center justify-between gap-2 border-b border-[var(--hairline)] pb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber-dim)]">
                {piece.source}
              </span>

              <div className="flex items-center gap-1.5">
                {/* TTS Audio Narration */}
                {ttsAvailable && (
                  <div className="flex items-center bg-[var(--bg)] border border-[var(--hairline)] rounded-xl px-1.5 py-0.5">
                    <button
                      onClick={toggleSpeech}
                      className="p-1 text-[var(--amber)] hover:opacity-80 cursor-pointer"
                      title={isSpeaking ? 'Pause reading' : 'Listen with TTS audio narration'}
                    >
                      {isSpeaking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={cycleSpeechRate}
                      className="text-[10px] font-bold text-[var(--muted)] px-1 hover:text-[var(--text)] cursor-pointer"
                      title="Adjust narration speed"
                    >
                      {speechRate}x
                    </button>
                  </div>
                )}

                {/* Shuffle Next Button */}
                <button
                  onClick={() => {
                    lightHaptic();
                    loadPiece(selectedCategory);
                  }}
                  className="flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-[var(--hairline)]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Next</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-base sm:text-xl font-bold font-serif-reading text-[var(--text)] tracking-tight leading-snug">
              {piece.title}
            </h1>

            {/* Summary Text */}
            <p className={`${fontFamilyClass} ${fontSizes[settings.fontSize]} text-[var(--text-soft)] select-text`}>
              {piece.summary}
            </p>

            {/* Quote Selection Action Bar */}
            {selectedText && (
              <div className="bg-[var(--amber-dim)] border border-[var(--amber)]/40 rounded-xl p-2.5 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                <span className="text-[11px] text-[var(--amber)] font-medium line-clamp-1 italic">
                  "{selectedText}"
                </span>
                <button
                  onClick={() => handleCreateQuoteCard(selectedText)}
                  className="px-2.5 py-1 rounded-lg bg-[var(--amber)] text-black text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap cursor-pointer shadow"
                >
                  <Quote className="w-3 h-3" />
                  <span>Make Card</span>
                </button>
              </div>
            )}

            {/* Footer with External Link & Quote Trigger */}
            <div className="pt-2 border-t border-[var(--hairline)] flex items-center justify-between">
              <a
                href={piece.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--amber)] hover:underline"
              >
                <span>Read Full Paper</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleCreateQuoteCard()}
                className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                <Quote className="w-3 h-3 text-[var(--amber)]" />
                <span>Quote Card</span>
              </button>
            </div>
          </div>

          {/* Socratic Reflection & "Challenge My Thinking" Section */}
          <div className="bg-[var(--panel-elevated)] border border-[var(--hairline)] rounded-3xl p-4 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-[var(--amber-dim)] text-[var(--amber)]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--text)]">
                    Socratic Follow-Up Questions
                  </h3>
                  <p className="text-[10px] text-[var(--muted)]">
                    Critically analyze assumptions and edge cases.
                  </p>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {piece.questions.map((q, idx) => (
                <div key={idx} className="space-y-2 bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-3.5">
                  <p className="text-xs sm:text-sm font-serif-reading italic text-[var(--text)] leading-snug">
                    <span className="text-[var(--amber)] font-bold mr-1">Q{idx + 1}.</span>
                    {q}
                  </p>

                  <textarea
                    value={answers[idx]}
                    onChange={e => handleAnswerChange(idx, e.target.value)}
                    placeholder="Write your counter-argument or reflection..."
                    rows={2}
                    className="w-full bg-[var(--bg)] border border-[var(--hairline)] rounded-xl px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--amber)] placeholder-[var(--muted)] transition-colors resize-y min-h-[48px]"
                  />

                  {/* Challenge My Thinking Button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleChallengeThinking(idx)}
                      disabled={critiqueLoadingIndex === idx || !answers[idx]?.trim()}
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--amber)] hover:underline disabled:opacity-40 cursor-pointer"
                    >
                      <Brain className="w-3 h-3" />
                      <span>
                        {critiqueLoadingIndex === idx ? 'Analyzing argument...' : 'Challenge My Thinking'}
                      </span>
                    </button>
                  </div>

                  {/* AI Critique Box */}
                  {critiques[idx].critique && (
                    <div className="bg-[var(--bg)] border-l-2 border-l-[var(--amber)] p-2.5 rounded-r-xl space-y-1 animate-in fade-in duration-150">
                      <p className="text-[11px] text-[var(--text-soft)] font-medium">
                        <strong className="text-[var(--amber)]">Socratic Critique:</strong> {critiques[idx].critique}
                      </p>
                      <p className="text-[10px] text-[var(--muted)] italic">
                        <strong className="text-[var(--sage)]">Devil's Advocate:</strong> {critiques[idx].devilAdvocate}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Save to Library and SM-2 Schedule Action */}
            <div className="pt-2 border-t border-[var(--hairline)]">
              {savedSuccess ? (
                <div className="w-full flex items-center justify-between bg-[var(--sage)]/15 border border-[var(--sage)]/30 text-[var(--sage)] px-3.5 py-2.5 rounded-xl text-xs font-semibold">
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
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-3 rounded-2xl bg-[var(--amber)] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <BookMarked className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save & Schedule SM-2 Recall'}</span>
                </button>
              )}
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
};
