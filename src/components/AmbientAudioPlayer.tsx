import React, { useState } from 'react';
import { Volume2, VolumeX, CloudRain, Flame, Radio, BookOpen, Music } from 'lucide-react';
import { AmbientSoundType } from '../types';
import {
  playAmbientSound,
  stopAmbientSound,
  getCurrentAmbientSound,
  setAmbientVolume
} from '../services/audioService';
import { lightHaptic } from '../services/hapticsService';

export const AmbientAudioPlayer: React.FC = () => {
  const [activeSound, setActiveSound] = useState<AmbientSoundType>(() => getCurrentAmbientSound());
  const [volume, setVolume] = useState<number>(0.5);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const sounds: { type: AmbientSoundType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { type: 'rain', label: 'Rain', icon: CloudRain },
    { type: 'fire', label: 'Fire', icon: Flame },
    { type: 'binaural', label: '432Hz', icon: Radio },
    { type: 'library', label: 'Library', icon: BookOpen }
  ];

  const handleSelectSound = (type: AmbientSoundType) => {
    lightHaptic();
    if (activeSound === type) {
      stopAmbientSound();
      setActiveSound('none');
    } else {
      playAmbientSound(type, volume);
      setActiveSound(type);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setAmbientVolume(newVol);
  };

  return (
    <div className="fixed bottom-16 right-4 z-20">
      {isExpanded && (
        <div className="bg-[var(--panel)] border border-[var(--hairline)] rounded-2xl p-3 shadow-xl mb-2 w-56 space-y-2.5 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-[var(--amber)]" />
              Focus Audio
            </span>
            {activeSound !== 'none' && (
              <button
                onClick={() => handleSelectSound('none')}
                className="text-[10px] text-[var(--amber)] hover:underline cursor-pointer"
              >
                Mute
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {sounds.map(s => {
              const Icon = s.icon;
              const isSelected = activeSound === s.type;
              return (
                <button
                  key={s.type}
                  onClick={() => handleSelectSound(s.type)}
                  className={`flex items-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--amber-dim)] border-[var(--amber)] text-[var(--amber)]'
                      : 'bg-[var(--bg)] border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {activeSound !== 'none' && (
            <div className="flex items-center gap-2 pt-1">
              <VolumeX className="w-3 h-3 text-[var(--muted)]" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-[var(--amber)] h-1 bg-[var(--bg)] rounded-lg cursor-pointer"
              />
              <Volume2 className="w-3 h-3 text-[var(--amber)]" />
            </div>
          )}
        </div>
      )}

      {/* Floating Toggle Pill */}
      <button
        onClick={() => {
          lightHaptic();
          setIsExpanded(!isExpanded);
        }}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full border shadow-lg text-xs font-bold transition-all cursor-pointer ${
          activeSound !== 'none'
            ? 'bg-[var(--amber)] text-black border-[var(--amber)] shadow-[0_0_12px_var(--amber-dim)]'
            : 'bg-[var(--panel)]/90 backdrop-blur-md border-[var(--hairline)] text-[var(--muted)] hover:text-[var(--text)]'
        }`}
      >
        <Music className={`w-3.5 h-3.5 ${activeSound !== 'none' ? 'animate-bounce' : ''}`} />
        <span className="capitalize">{activeSound !== 'none' ? activeSound : 'Sound'}</span>
      </button>
    </div>
  );
};
