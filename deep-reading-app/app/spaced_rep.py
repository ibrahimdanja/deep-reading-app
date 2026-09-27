"""
SM-2 spaced repetition algorithm (the classic Anki-style scheduler).
No external service — just math, so this stays free forever.

Quality scale when reviewing (0-5):
  0-2 = struggled / forgot -> resets interval, review again soon
  3-5 = recalled it, easier as the number goes up -> interval grows
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta


@dataclass
class ReviewState:
    repetitions: int = 0
    ease_factor: float = 2.5
    interval_days: int = 0
    due_date: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def review(self, quality: int) -> "ReviewState":
        """
        Apply an SM-2 update given a recall quality score (0-5).
        Returns self, updated in place, for convenience.
        """
        if quality < 0 or quality > 5:
            raise ValueError("quality must be between 0 and 5")

        if quality < 3:
            # Forgot it — reset repetitions, review again tomorrow
            self.repetitions = 0
            self.interval_days = 1
        else:
            if self.repetitions == 0:
                self.interval_days = 1
            elif self.repetitions == 1:
                self.interval_days = 6
            else:
                self.interval_days = round(self.interval_days * self.ease_factor)
            self.repetitions += 1

        # Update ease factor (never drops below 1.3)
        self.ease_factor = max(
            1.3,
            self.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
        )

        self.due_date = (
            datetime.utcnow() + timedelta(days=self.interval_days)
        ).isoformat()
        return self

    def is_due(self) -> bool:
        return datetime.fromisoformat(self.due_date) <= datetime.utcnow()
