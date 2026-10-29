export const FALLBACK_QUESTIONS = [
  "In your own words, what is the central claim here — and what would have to be true for it to hold?",
  "What is the weakest part of this argument or its empirical evidence, and why?",
  "What counter-evidence would most decisively change your mind about this thesis?",
  "What does this finding imply that the text doesn't explicitly state?",
  "Where else might this core mechanism apply, completely outside this field?",
  "Which unspoken assumption is doing the heaviest lifting here?",
  "How would a thoughtful, well-informed critic dismantle this argument?",
  "If this thesis became universal consensus, what dangerous blindspot might emerge?",
  "What experimental or historical test would genuinely prove this model wrong?",
  "How does this challenge traditional common sense or institutional orthodoxies?"
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
    // Graceful fallback
  }

  return {
    questions: getRandomFallbackQuestions(3),
    source: 'fallback',
    reason: 'Offline Socratic tutor mode active'
  };
}

export async function challengeThinking(
  title: string,
  summary: string,
  question: string,
  userAnswer: string
): Promise<{ critique: string; devilAdvocate: string }> {
  try {
    const res = await fetch('/api/gemini-critique', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, summary, question, userAnswer })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.critique) {
        return {
          critique: data.critique,
          devilAdvocate: data.devilAdvocate || 'Consider the opposite boundary condition.'
        };
      }
    }
  } catch (e) {
    // Graceful fallback
  }

  // High-caliber heuristic Socratic critique
  const length = userAnswer.trim().length;
  let critique = '';
  let devilAdvocate = '';

  if (length < 30) {
    critique = "You've captured an initial intuition, but what underlying mechanism connects your point to the author's primary claim?";
    devilAdvocate = "What happens in extreme boundary conditions where your statement fails completely?";
  } else if (userAnswer.toLowerCase().includes('because') || userAnswer.toLowerCase().includes('since')) {
    critique = "Strong causal framing. However, examine whether you are mistaking correlation for causation in this scenario.";
    devilAdvocate = "Could a third lurking variable explain both your observation and the experimental outcome simultaneously?";
  } else {
    critique = "You have identified a compelling angle. The key test is whether this insight remains true if the underlying incentives or physical constraints shift.";
    devilAdvocate = "A skeptical opponent might argue you are over-generalizing from a single idealized case. How would you defend against that?";
  }

  return { critique, devilAdvocate };
}
