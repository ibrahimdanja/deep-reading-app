import React from 'react';
import { X, Moon, Sun, Coffee, Type, Smartphone, Eye } from 'lucide-react';
import { ReaderSettings, ThemeType } from '../types';
import { lightHaptic } from '../services/hapticsService';

interface ReaderSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: ReaderSettings) => void;
}

export const ReaderSettingsDialog: React.FC<ReaderSettingsDialogProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  const themes: { id: ThemeType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'night', label: 'Night (LCD)', icon: Eye },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'sepia', label: 'Sepia', icon: Coffee },
    { id: 'light', label: 'Light', icon: Sun }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-[var(--panel)] border border-[var(--hairline)] rounded-3xl max-w-sm w-full p-5 shadow-2xl relative space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-[var(--amber)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              Galaxy A10s Display Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme selection */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold block mb-2">
            Color Scheme
          </label>
          <div className="grid grid-cols-2 gap-2">
            {themes.map(t => {
              const Icon = t.icon;
              const isSelected = settings.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    lightHaptic();
                    onUpdateSettings({ ...settings, theme: t.id });
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--amber-dim)] border-[var(--amber)] text-[var(--amber)] font-bold shadow-sm'
                      : 'bg-[var(--bg)] border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font size */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold block mb-2">
            Reading Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['sm', 'md', 'lg', 'xl'] as const).map(size => {
              const labels = { sm: 'A-', md: 'A', lg: 'A+', xl: 'A++' };
              const isSelected = settings.fontSize === size;
              return (
                <button
                  key={size}
                  onClick={() => {
                    lightHaptic();
                    onUpdateSettings({ ...settings, fontSize: size });
                  }}
                  className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--amber-dim)] border-[var(--amber)] text-[var(--amber)] shadow-sm'
                      : 'bg-[var(--bg)] border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {labels[size]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font family */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold block mb-2">
            Typeface
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                lightHaptic();
                onUpdateSettings({ ...settings, fontFamily: 'serif' });
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-serif-reading transition-all cursor-pointer ${
                settings.fontFamily === 'serif'
                  ? 'bg-[var(--amber-dim)] border-[var(--amber)] text-[var(--amber)] font-bold shadow-sm'
                  : 'bg-[var(--bg)] border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              Book Serif
            </button>
            <button
              onClick={() => {
                lightHaptic();
                onUpdateSettings({ ...settings, fontFamily: 'sans' });
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-sans-reading transition-all cursor-pointer ${
                settings.fontFamily === 'sans'
                  ? 'bg-[var(--amber-dim)] border-[var(--amber)] text-[var(--amber)] font-bold shadow-sm'
                  : 'bg-[var(--bg)] border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              Modern Sans
            </button>
          </div>
        </div>

        {/* Haptics toggle */}
        <div className="pt-2 border-t border-[var(--hairline)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-soft)]">
            <Smartphone className="w-3.5 h-3.5 text-[var(--amber)]" />
            <span>Haptic Touch Feedback</span>
          </div>
          <button
            onClick={() => {
              const next = !settings.hapticsEnabled;
              onUpdateSettings({ ...settings, hapticsEnabled: next });
            }}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
              settings.hapticsEnabled ? 'bg-[var(--amber)]' : 'bg-[var(--hairline)]'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-black transition-transform absolute top-0.5 ${
                settings.hapticsEnabled ? 'left-5' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
