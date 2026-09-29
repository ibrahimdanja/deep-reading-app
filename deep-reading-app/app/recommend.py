"""
Picks ONE subject to read next - deliberately, not an endless feed.

The idea: nudge you toward subjects you've neglected, with a little
randomness so it isn't predictable. It only looks at what you've actually
saved, and it explains its reasoning in a sentence.
"""

import random
from datetime import datetime

# A subject you've never opened counts like one untouched for ~6 weeks.
NEVER_READ_SCORE = 45
# Beyond this, "even longer" doesn't make a subject any more deserving.
MAX_DAYS = 60
# Choose randomly among this many of the most-neglected subjects.
TOP_N = 3


def recommend(categories, activity, due_count=0, now=None, rng=random):
    """
    categories: {"science": "Science", ...}
    activity:   {"science": {"count": 4, "last_saved": "2026-09-20T10:00:00"}, ...}
                (only subjects you have actually read appear here)
    Returns {"category", "label", "reason", "due_count"}.
    """
    now = now or datetime.utcnow()

    scored = []
    for key, label in categories.items():
        info = activity.get(key)
        if info is None:
            days = None
            score = NEVER_READ_SCORE
        else:
            days = max(0, (now - datetime.fromisoformat(info["last_saved"])).days)
            score = min(days, MAX_DAYS)
        scored.append((score, key, label, days))

    # Shuffle first so ties (e.g. a brand-new library where everything is
    # "never read") are broken randomly instead of always favouring the same subject.
    rng.shuffle(scored)
    scored.sort(key=lambda item: item[0], reverse=True)
    _, key, label, days = rng.choice(scored[:TOP_N])

    if days is None:
        reason = f"You haven't explored {label} yet."
    elif days >= 2:
        reason = f"It's been {days} days since you last read {label}."
    else:
        reason = f"You read {label} recently - a chance to go deeper."

    return {"category": key, "label": label, "reason": reason, "due_count": due_count}
