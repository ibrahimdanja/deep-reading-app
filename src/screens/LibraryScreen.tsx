import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Calendar,
  Layers,
  Quote
} from 'lucide-react';
import { Article, CategoryKey, CATEGORIES, QuoteCardData } from '../types';
import { lightHaptic } from '../services/hapticsService';

interface LibraryScreenProps {
  articles: Article[];
  onStartReading: (cat?: CategoryKey) => void;
  selectedArticleId?: string | null;
  onOpenQuoteCard: (data: QuoteCardData) => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  articles,
  onStartReading,
  selectedArticleId,
  onOpenQuoteCard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(selectedArticleId || null);

  const filteredArticles = articles.filter(art => {
    const matchesCategory =
      selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch =
      searchTerm.trim() === '' ||
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.questions.some(
        qa =>
          qa.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qa.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-serif-reading text-[var(--text)]">
            Saved Library
          </h2>
          <p className="text-[11px] text-[var(--muted)]">
            {articles.length} reading{articles.length !== 1 ? 's' : ''} saved across 14 disciplines
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by topic, thesis, or reflection notes..."
          className="w-full bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl pl-9 pr-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--amber)] placeholder-[var(--muted)] transition-colors"
        />
      </div>

      {/* 14 Categories Filter Slider */}
      <div className="overflow-x-auto no-scrollbar -mx-3 px-3 py-1">
        <div className="flex gap-1.5 min-w-max">
          <button
            onClick={() => {
              lightHaptic();
              setSelectedCategory('all');
            }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[var(--amber)] text-black font-bold shadow-sm'
                : 'bg-[var(--panel)] border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            All ({articles.length})
          </button>
          {categoryKeys.map(cat => {
            const count = articles.filter(a => a.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => {
                  lightHaptic();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[var(--amber)] text-black font-bold shadow-sm'
                    : 'bg-[var(--panel)] border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {CATEGORIES[cat]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Article Cards */}
      {filteredArticles.length === 0 ? (
        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-3xl p-8 text-center space-y-2.5">
          <BookOpen className="w-6 h-6 text-[var(--muted)] mx-auto opacity-40" />
          <h3 className="text-xs font-semibold text-[var(--text)]">
            No readings found
          </h3>
          <p className="text-[11px] text-[var(--muted)] max-w-xs mx-auto">
            {searchTerm
              ? 'No articles match your search filter.'
              : 'You haven’t explored this subject yet.'}
          </p>
          <button
            onClick={() => {
              lightHaptic();
              onStartReading(selectedCategory === 'all' ? undefined : selectedCategory);
            }}
            className="px-4 py-2 rounded-xl bg-[var(--amber)] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer mt-1 inline-block"
          >
            Start Reading
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredArticles.map(art => {
            const isExpanded = expandedId === art.id;

            return (
              <div
                key={art.id}
                className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                <div
                  onClick={() => {
                    lightHaptic();
                    setExpandedId(isExpanded ? null : art.id);
                  }}
                  className="p-3.5 sm:p-4 cursor-pointer hover:bg-[var(--hairline)]/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--amber-dim)] text-[var(--amber)]">
                        {CATEGORIES[art.category] || art.category}
                      </span>
                      <span className="text-[10px] text-[var(--muted)]">
                        {new Date(art.date_saved).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                      <span>Rep #{art.review_state.repetitions}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold font-serif-reading text-[var(--text)] leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-[10px] text-[var(--muted)] mt-0.5 line-clamp-1">
                    {art.source}
                  </p>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3.5 pb-4 sm:px-4 border-t border-[var(--hairline)] pt-3 space-y-3 bg-[var(--bg)]/40 text-xs">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                        Abstract Excerpt
                      </h4>
                      <p className="font-serif-reading text-[var(--text-soft)] leading-relaxed text-xs">
                        {art.summary}
                      </p>
                    </div>

                    {/* Socratic Reflections */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--amber)]">
                        Your Reflections & Answers
                      </h4>

                      {art.questions.map((qa, i) => (
                        <div
                          key={i}
                          className="bg-[var(--panel)] border border-[var(--hairline)] rounded-xl p-2.5 space-y-1"
                        >
                          <p className="text-[11px] font-serif-reading italic text-[var(--text)]">
                            <span className="text-[var(--amber)] font-bold mr-1">Q{i + 1}:</span>
                            {qa.question}
                          </p>
                          <div className="text-[11px] text-[var(--text-mid)] pl-2 border-l border-[var(--amber)] pt-0.5">
                            {qa.answer && qa.answer.trim() ? (
                              <p className="whitespace-pre-wrap">{qa.answer}</p>
                            ) : (
                              <p className="italic text-[var(--muted)]">(No answer recorded)</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions: View Source & Quote Card */}
                    <div className="pt-2 border-t border-[var(--hairline)] flex items-center justify-between text-[10px] text-[var(--muted)]">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[var(--amber)]" />
                          <span>Ease: {art.review_state.ease_factor}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[var(--sage)]" />
                          <span>Due: {new Date(art.review_state.due_date).toLocaleDateString()}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            lightHaptic();
                            onOpenQuoteCard({
                              quote: art.summary.slice(0, 160) + '...',
                              title: art.title,
                              source: art.source,
                              category: art.category
                            });
                          }}
                          className="inline-flex items-center gap-1 text-[var(--amber)] hover:underline font-semibold cursor-pointer"
                        >
                          <Quote className="w-3 h-3" />
                          <span>Quote Card</span>
                        </button>

                        <a
                          href={art.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[var(--muted)] hover:text-[var(--text)] hover:underline"
                        >
                          <span>Source</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
