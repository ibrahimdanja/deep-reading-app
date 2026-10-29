export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;
  available: boolean;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let onEndCallback: (() => void) | null = null;

export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeech(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
  if (onEndCallback) {
    onEndCallback();
    onEndCallback = null;
  }
}

export function pauseSpeech(): void {
  if (isTTSSupported() && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeech(): void {
  if (isTTSSupported() && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

export function speakArticle(
  title: string,
  summary: string,
  questions: string[] = [],
  rate: number = 1.0,
  onStateChange?: (speaking: boolean) => void
): void {
  if (!isTTSSupported()) return;

  stopSpeech();

  const fullScript = `${title}. ${summary}. Socratic reflection questions: ${questions.join('. ')}`;

  const utterance = new SpeechSynthesisUtterance(fullScript);
  utterance.rate = rate;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
  ) || voices.find(v => v.lang.startsWith('en'));

  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  utterance.onstart = () => {
    onStateChange?.(true);
  };

  utterance.onend = () => {
    onStateChange?.(false);
    activeUtterance = null;
  };

  utterance.onerror = () => {
    onStateChange?.(false);
    activeUtterance = null;
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}
