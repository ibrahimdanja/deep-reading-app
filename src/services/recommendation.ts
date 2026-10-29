import { CategoryKey, CATEGORIES, Recommendation } from '../types';

const NEVER_READ_SCORE = 45;
const MAX_DAYS = 60;
const TOP_N = 3;

export function recommendSubject(
  activity: Record<string, { count: number; last_saved: string }>,
  due_count: number = 0
): Recommendation {
  const now = Date.now();

  const scored: Array<{
    score: number;
    key: CategoryKey;
    label: string;
    days: number | null;
  }> = [];

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  for (const key of categoryKeys) {
    const label = CATEGORIES[key];
    const info = activity[key];

    if (!info) {
      scored.push({
        score: NEVER_READ_SCORE,
        key,
        label,
        days: null
      });
    } else {
      const savedTime = new Date(info.last_saved).getTime();
      const days = Math.max(0, Math.floor((now - savedTime) / (1000 * 60 * 60 * 24)));
      const score = Math.min(days, MAX_DAYS);
      scored.push({
        score,
        key,
        label,
        days
      });
    }
  }

  // Shuffle first so ties are broken randomly
  const shuffled = [...scored].sort(() => Math.random() - 0.5);
  // Sort descending by score
  shuffled.sort((a, b) => b.score - a.score);

  const candidates = shuffled.slice(0, TOP_N);
  const picked = candidates[Math.floor(Math.random() * candidates.length)] || shuffled[0];

  let reason = '';
  if (picked.days === null) {
    reason = `You haven't explored ${picked.label} yet.`;
  } else if (picked.days >= 2) {
    reason = `It's been ${picked.days} days since you last read ${picked.label}.`;
  } else {
    reason = `You read ${picked.label} recently — a chance to go deeper.`;
  }

  return {
    category: picked.key,
    label: picked.label,
    reason,
    due_count
  };
}
