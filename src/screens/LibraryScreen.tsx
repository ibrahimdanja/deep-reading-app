import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';
import { Article, CategoryKey, CATEGORIES } from '../types';

interface LibraryScreenProps {
  articles: Article[];
  onStartReading: (cat?: CategoryKey) => void;
  selectedArticleId?: string | null;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  articles,
  onStartReading,
  selectedArticleId
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
    <div className="space-y-6 pb-28 animate-in fade-in duration-150">
      {/* Title & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-reading text-[var(--text)]">
            Saved Library
          </h2>
          <p className="text-xs text-[var(--muted)]">
            {articles.length} reading{articles.length !== 1 ? 's' : ''} with your Socratic notes
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by topic, keyword, or your past answers..."
          className="w-full bg-[var(--panel)] border border-[var(--hairline)] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[var(--amber)] placeholder-[var(--muted)] transition-colors"
        />
      </div>

      {/* Category Pills */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[var(--amber)] text-black shadow-sm'
                : 'bg-[var(--panel)] border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            All Subjects ({articles.length})
          </button>
          {categoryKeys.map(cat => {
            const count = articles.filter(a => a.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[var(--amber)] text-black shadow-sm'
                    : 'bg-[var(--panel)] border border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {CATEGORIES[cat]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Article List */}
      {filteredArticles.length === 0 ? (
        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-10 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[var(--muted)] mx-auto opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text)]">
            No readings found
          </h3>
          <p className="text-xs text-[var(--muted)] max-w-xs mx-auto">
            {searchTerm
              ? 'No articles match your search criteria. Try a different search term.'
              : 'You haven’t saved any articles in this subject yet.'}
          </p>
          <button
            onClick={() => onStartReading(selectedCategory === 'all' ? undefined : selectedCategory)}
            className="px-4 py-2 rounded-xl bg-[var(--amber)] text-black font-semibold text-xs hover:opacity-90 transition-all cursor-pointer mt-2 inline-block"
          >
            Start Reading Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredArticles.map(art => {
            const isExpanded = expandedId === art.id;

            return (
              <div
                key={art.id}
                className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                {/* Header row / summary bar */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : art.id)}
                  className="p-4 sm:p-5 cursor-pointer hover:bg-[var(--hairline)]/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--amber-dim)] text-[var(--amber)]">
                        {CATEGORIES[art.category] || art.category}
                      </span>
                      <span className="text-[11px] text-[var(--muted)]">
                        {new Date(art.date_saved).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                      <span className="hidden sm:inline">
                        Rep #{art.review_state.repetitions}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold font-serif-reading text-[var(--text)] leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-[var(--muted)] mt-1 line-clamp-1">
                    {art.source}
                  </p>
                </div>

                {/* Expanded Details: Abstract + Questions + Answers + SM-2 Schedule */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 border-t border-[var(--hairline)] pt-4 space-y-5 animate-in fade-in duration-150 bg-[var(--bg)]/40">
                    {/* Abstract / Summary */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                        Abstract / Excerpt
                      </h4>
                      <p className="text-xs sm:text-sm font-serif-reading text-[var(--text-soft)] leading-relaxed">
                        {art.summary}
                      </p>
                    </div>

                    {/* Questions & Answers */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--amber)] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Socratic Reflections</span>
                      </h4>

                      {art.questions.map((qa, i) => (
                        <div
                          key={i}
                          className="bg-[var(--panel)] border border-[var(--hairline)] rounded-xl p-3 space-y-1.5"
                        >
                          <p className="text-xs sm:text-sm font-serif-reading italic text-[var(--text)]">
                            <span className="text-[var(--amber)] font-bold mr-1">Q{i + 1}:</span>
                            {qa.question}
                          </p>
                          <div className="text-xs sm:text-sm text-[var(--text-mid)] pl-2 border-l-2 border-[var(--amber-dim)] pt-0.5">
                            {qa.answer && qa.answer.trim() ? (
                              <p className="whitespace-pre-wrap">{qa.answer}</p>
                            ) : (
                              <p className="italic text-[var(--muted)]">(No answer recorded)</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Metadata & SM-2 Status */}
                    <div className="pt-2 border-t border-[var(--hairline)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[var(--amber)]" />
                          <span>Ease: {art.review_state.ease_factor}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[var(--sage)]" />
                          <span>Next: {new Date(art.review_state.due_date).toLocaleDateString()}</span>
                        </span>
                      </div>

                      <a
                        href={art.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--amber)] hover:underline font-semibold"
                      >
                        <span>View Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
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
