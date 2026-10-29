export const FALLBACK_QUESTIONS = [
  "In your own words, what is the central claim here — and what would have to be true for it to hold?",
  "What is the weakest part of this argument or its evidence, and why?",
  "What would change your mind about this?",
  "What does this imply that the piece doesn't say directly?",
  "Where else might this idea apply, outside the field it comes from?",
  "Which assumption is doing the most work here — and what if it were false?",
  "How would a thoughtful critic respond to this?",
  "What would you want to know next before trusting this claim more?",
  "What counter-evidence would most decisively undermine this theory?",
  "How does this finding challenge traditional common sense or existing paradigms?"
];

export function getRandomFallbackQuestions(count: number = 3): string[] {
  const shuffled = [...FALLBACK_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function fetchQuestions(
  title: string,
  summary: string
): Promise<{
  questions: string[];
  source: 'ai' | 'fallback';
  reason?: string;
}> {
  try {
    const res = await fetch('/api/gemini-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, summary })
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        return {
          questions: data.questions,
          source: 'ai'
        };
      }
    }
  } catch (e) {
    console.warn('Backend question generation unavailable, using fallback', e);
  }

  // Graceful fallback: Never leave the user stuck!
  return {
    questions: getRandomFallbackQuestions(3),
    source: 'fallback',
    reason: 'Offline or local Socratic tutor mode active'
  };
}
