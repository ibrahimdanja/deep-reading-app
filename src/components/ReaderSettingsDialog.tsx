import React from 'react';
import { X, Moon, Sun, Coffee, Type } from 'lucide-react';
import { ReaderSettings } from '../types';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl max-w-sm w-full p-5 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--hairline)] mb-4">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-[var(--amber)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text)]">
              Reader Appearance
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hairline)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme selection */}
        <div className="mb-5">
          <label className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold block mb-2">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
              className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                settings.theme === 'dark'
                  ? 'bg-[var(--amber-dim)] border-[var(--amber)] text-[var(--amber)] font-bold'
                  : 'bg-[var(--bg)] border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'sepia' })}
              className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                settings.theme === 'sepia'
                  ? 'bg-[var(--amber-dim)] border-[var(--amber)] text-[var(--amber)] font-bold'
                  : 'bg-[var(--bg)] border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>Sepia</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
              className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                settings.theme === 'light'
                  ? 'bg-[var(--amber-dim)] border-[var(--amber)] text-[var(--amber)] font-bold'
                  : 'bg-[var(--bg)] border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Light</span>
            </button>
          </div>
        </div>

        {/* Font size */}
        <div className="mb-5">
          <label className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold block mb-2">
            Text Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['sm', 'md', 'lg', 'xl'] as const).map(size => {
              const labels = { sm: 'A-', md: 'A', lg: 'A+', xl: 'A++' };
              const isSelected = settings.fontSize === size;
              return (
                <button
                  key={size}
                  onClick={() => onUpdateSettings({ ...settings, fontSize: size })}
                  className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--amber-dim)] border-[var(--amber)] text-[var(--amber)]'
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
          <label className="text-xs uppercase tracking-wider text-[var(--muted)] font-semibold block mb-2">
            Typography Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateSettings({ ...settings, fontFamily: 'serif' })}
              className={`py-2 px-3 rounded-xl border text-xs font-serif-reading transition-all cursor-pointer ${
                settings.fontFamily === 'serif'
                  ? 'bg-[var(--amber-dim)] border-[var(--amber)] text-[var(--amber)] font-bold'
                  : 'bg-[var(--bg)] border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              Serif (Book)
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, fontFamily: 'sans' })}
              className={`py-2 px-3 rounded-xl border text-xs font-sans-reading transition-all cursor-pointer ${
                settings.fontFamily === 'sans'
                  ? 'bg-[var(--amber-dim)] border-[var(--amber)] text-[var(--amber)] font-bold'
                  : 'bg-[var(--bg)] border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              Sans-Serif (Modern)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
