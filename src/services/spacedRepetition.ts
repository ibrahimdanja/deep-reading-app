import { GradeType, ReviewStateData } from '../types';

export const GRADE_TO_QUALITY: Record<GradeType, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5
};

export function createInitialReviewState(daysUntilFirstReview: number = 1): ReviewStateData {
  const due = new Date();
  due.setDate(due.getDate() + daysUntilFirstReview);
  return {
    repetitions: 0,
    ease_factor: 2.5,
    interval_days: daysUntilFirstReview,
    due_date: due.toISOString()
  };
}

export function applySM2Review(
  state: ReviewStateData,
  quality: number
): ReviewStateData {
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5');
  }

  let repetitions = state.repetitions;
  let interval_days = state.interval_days;
  let ease_factor = state.ease_factor;

  if (quality < 3) {
    // Forgot it — reset repetitions, review again tomorrow
    repetitions = 0;
    interval_days = 1;
  } else {
    if (repetitions === 0) {
      interval_days = 1;
    } else if (repetitions === 1) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
    repetitions += 1;
  }

  // Update ease factor (never drops below 1.3)
  ease_factor = Math.max(
    1.3,
    ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + interval_days);

  return {
    repetitions,
    ease_factor: parseFloat(ease_factor.toFixed(3)),
    interval_days,
    due_date: nextDue.toISOString()
  };
}

export function isDue(dueDateIso: string): boolean {
  return new Date(dueDateIso).getTime() <= Date.now();
}
