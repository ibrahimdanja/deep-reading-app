"""
Socratic follow-up questions about a piece of reading.

Tries Gemini (free tier) first. The free tier has strict limits, so this file
is built to never leave you stuck: if Gemini refuses (too many requests, or
today's quota used up) or can't be reached, you still get three good general
questions plus a plain-language reason.

Which model to use can be set in your .env file, no code changes needed:
    GEMINI_MODEL=gemini-3.8-flash
or several, separated by commas and tried in order. Google's free limits are
counted per model, so a second model can give you more free room:
    GEMINI_MODEL=gemini-3.8-flash,another-model-name
"""

import os
import random
import re
from datetime import datetime, timedelta, timezone

import requests

DEFAULT_MODEL = "gemini-3.8-flash"
INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions"

PROMPT_TEMPLATE = """You are a Socratic tutor. Given the following short piece of
science writing, generate exactly 3 follow-up questions that force the reader
to think critically — not comprehension checks. Good question types:
- "Why might this be true, or what would have to be true for it to hold?"
- "What's the weakest part of this claim or argument?"
- "What would change your mind about this?"
- "What does this imply that the piece doesn't say directly?"

Avoid generic questions like "what did you learn" or "summarize this".
Return ONLY the 3 questions, one per line, no numbering, no preamble.

Title: {title}
Text: {summary}
"""

# Used when Gemini isn't available. General, but still real thinking prompts.
FALLBACK_QUESTIONS = [
    "In your own words, what is the central claim here — and what would have to be true for it to hold?",
    "What is the weakest part of this argument or its evidence, and why?",
    "What would change your mind about this?",
    "What does this imply that the piece doesn't say directly?",
    "Where else might this idea apply, outside the field it comes from?",
    "Which assumption is doing the most work here — and what if it were false?",
    "How would a thoughtful critic respond to this?",
    "What would you want to know next before trusting this claim more?",
]


class QuotaExceeded(Exception):
    """Gemini said 'too many requests'. reason is 'daily', 'minute' or 'unknown'."""

    def __init__(self, reason, retry_after=None):
        super().__init__(f"Gemini quota exceeded ({reason})")
        self.reason = reason
        self.retry_after = retry_after


class QuestionsUnavailable(Exception):
    """Gemini couldn't give us questions for some other reason."""

    def __init__(self, message, reason="error"):
        super().__init__(message)
        self.reason = reason


def _models() -> list[str]:
    raw = os.environ.get("GEMINI_MODEL", "")
    models = [m.strip() for m in raw.split(",") if m.strip()]
    return models or [DEFAULT_MODEL]


def _extract_text(interaction: dict) -> str:
    """
    Pull the model's text out of an Interactions API response: a list of
    'steps' of different kinds - we want the text of the model_output step(s).
    """
    chunks = []
    for step in interaction.get("steps", []):
        if step.get("type") == "model_output":
            for block in step.get("content", []):
                if block.get("type") == "text":
                    chunks.append(block["text"])
    return "\n".join(chunks)


def _describe_429(response):
    """Work out from Google's 429 reply whether it's a per-minute or per-day limit, and how long to wait."""
    text = response.text or ""
    squashed = re.sub(r"[\s_]", "", text.lower())

    retry_after = None
    header = (response.headers.get("Retry-After") or "").strip()
    if header.isdigit():
        retry_after = float(header)
    if retry_after is None:
        match = re.search(r'"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"', text)
        if match:
            retry_after = float(match.group(1))

    if "perday" in squashed or "daily" in squashed:
        reason = "daily"
    elif "perminute" in squashed:
        reason = "minute"
    elif retry_after is not None and retry_after <= 120:
        reason = "minute"
    else:
        reason = "unknown"
    return reason, retry_after


def generate_questions(title: str, summary: str) -> list[str]:
    """Ask Gemini for questions. Raises QuotaExceeded or QuestionsUnavailable if it can't."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise QuestionsUnavailable("GEMINI_API_KEY not set", reason="no_key")

    prompt = PROMPT_TEMPLATE.format(title=title, summary=summary)
    quota_errors = []
    missing_models = []

    for model in _models():
        response = requests.post(
            INTERACTIONS_URL,
            headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
            json={"model": model, "input": prompt},
            timeout=30,
        )
        if response.status_code == 429:
            quota_errors.append(_describe_429(response))
            continue  # try the next model, if there is one
        if response.status_code == 404:
            missing_models.append(model)
            continue
        response.raise_for_status()

        text = _extract_text(response.json())
        questions = [q.strip("-• \t") for q in text.strip().split("\n") if q.strip()]
        if not questions:
            raise QuestionsUnavailable("Gemini returned no text")
        return questions[:3]

    if quota_errors:
        reasons = [r for r, _ in quota_errors]
        waits = [w for _, w in quota_errors if w is not None]
        if all(r == "daily" for r in reasons):
            reason = "daily"
        elif any(r == "minute" for r in reasons):
            reason = "minute"
        else:
            reason = "unknown"
        raise QuotaExceeded(reason, min(waits) if waits else None)

    raise QuestionsUnavailable(f"model not found: {', '.join(missing_models)}")


def fallback_questions(n: int = 3) -> list[str]:
    return random.sample(FALLBACK_QUESTIONS, n)


def _next_daily_reset_utc():
    """Google's daily quotas reset at midnight Pacific time. Returned in UTC so the browser can show it in your own time zone."""
    try:
        from zoneinfo import ZoneInfo

        now = datetime.now(ZoneInfo("America/Los_Angeles"))
        reset = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        return reset.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    except Exception:
        return None


def get_questions(title: str, summary: str) -> dict:
    """
    The one function the app calls. It never raises: you always get questions,
    plus 'source' ('ai' or 'fallback') and, if it's a fallback, the 'reason'.
    """
    try:
        return {
            "questions": generate_questions(title, summary),
            "source": "ai",
            "reason": None,
            "retry_after": None,
            "resets_at": None,
        }
    except QuotaExceeded as e:
        print(f"[questions] Gemini quota reached: {e.reason} (retry after {e.retry_after})")
        return {
            "questions": fallback_questions(),
            "source": "fallback",
            "reason": e.reason,
            "retry_after": e.retry_after,
            "resets_at": _next_daily_reset_utc() if e.reason == "daily" else None,
        }
    except QuestionsUnavailable as e:
        print(f"[questions] Gemini unavailable: {e}")
        return {"questions": fallback_questions(), "source": "fallback", "reason": e.reason,
                "retry_after": None, "resets_at": None}
    except Exception as e:  # network trouble, bad key, Google having a bad day...
        print(f"[questions] Gemini failed: {type(e).__name__}: {e}")
        return {"questions": fallback_questions(), "source": "fallback", "reason": "error",
                "retry_after": None, "resets_at": None}
