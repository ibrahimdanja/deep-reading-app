import { getReaderSettings } from './storageService';

export function triggerHaptic(pattern: number | number[] = 20): void {
  try {
    const settings = getReaderSettings();
    if (settings.hapticsEnabled === false) return;

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // Graceful fallback
  }
}

export function lightHaptic(): void {
  triggerHaptic(15);
}

export function mediumHaptic(): void {
  triggerHaptic(30);
}

export function successHaptic(): void {
  triggerHaptic([20, 30, 25]);
}

export function alertHaptic(): void {
  triggerHaptic([40, 40, 50]);
}
