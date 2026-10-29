import React, { useRef, useState } from 'react';
import { X, Copy, Download, Check, Sparkles, Quote } from 'lucide-react';
import { QuoteCardData, CATEGORIES, CategoryKey } from '../types';
import { successHaptic } from '../services/hapticsService';

interface QuoteCardModalProps {
  data: QuoteCardData | null;
  onClose: () => void;
}

export const QuoteCardModal: React.FC<QuoteCardModalProps> = ({
  data,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const categoryLabel = CATEGORIES[data.category as CategoryKey] || data.category;

  const handleCopyText = () => {
    successHaptic();
    const formatted = `"${data.quote}"\n\n— From: ${data.title} (${data.source})\n[Deep Reading App]`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    successHaptic();
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#141724';
    ctx.fillRect(0, 0, 800, 500);

    // Border
    ctx.strokeStyle = '#e3a04f';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 760, 460);

    // Header tag
    ctx.fillStyle = '#e3a04f';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`DEEP READING • ${categoryLabel.toUpperCase()}`, 50, 70);

    // Quote text
    ctx.fillStyle = '#eef0f5';
    ctx.font = 'italic 24px Georgia, serif';

    const words = data.quote.split(' ');
    let line = '';
    let y = 140;
    const maxWidth = 700;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, 50, y);
        line = words[i] + ' ';
        y += 36;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 50, y);

    // Footer source
    ctx.fillStyle = '#8a90a6';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Source: ${data.title} (${data.source})`, 50, 430);

    const link = document.createElement('a');
    link.download = `quote-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--amber)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aesthetic Quote Card</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Preview */}
        <div
          ref={cardRef}
          className="bg-gradient-to-b from-[#1b1e2e] to-[#12141f] border border-[var(--amber)]/30 rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-3"
        >
          <Quote className="w-8 h-8 text-[var(--amber)]/20 absolute top-3 right-3" />

          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--amber-dim)] text-[var(--amber)]">
            {categoryLabel}
          </span>

          <p className="text-sm sm:text-base font-serif-reading italic text-[var(--text)] leading-relaxed">
            "{data.quote}"
          </p>

          <div className="pt-2 border-t border-[var(--hairline)]">
            <p className="text-[11px] font-semibold text-[var(--text-soft)] line-clamp-1">
              {data.title}
            </p>
            <p className="text-[10px] text-[var(--muted)]">
              {data.source} • Deep Reading
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopyText}
            className="py-2.5 px-3 rounded-xl bg-[var(--bg)] border border-[var(--hairline)] hover:border-[var(--amber)] text-xs font-semibold text-[var(--text)] hover:text-[var(--amber)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--sage)]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="py-2.5 px-3 rounded-xl bg-[var(--amber)] text-black font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
