"""
Generates Socratic follow-up questions about a piece of reading, using the
free tier of the Gemini API (the "Interactions" endpoint, which is Google's
current API as of mid/late 2026 — replaces the older generateContent
endpoint). See README for how to get a free key at
https://aistudio.google.com
"""

import os
import requests

GEMINI_MODEL = "gemini-3.8-flash"  # current free-tier-friendly flash model
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


def _extract_text(interaction: dict) -> str:
    """
    Pull the model's text output out of an Interactions API response.
    The response is a list of 'steps' of different types (thought,
    model_output, etc) — we want the text content of the model_output step(s).
    """
    chunks = []
    for step in interaction.get("steps", []):
        if step.get("type") == "model_output":
            for block in step.get("content", []):
                if block.get("type") == "text":
                    chunks.append(block["text"])
    return "\n".join(chunks)


def generate_questions(title: str, summary: str) -> list[str]:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY not set. Copy .env.example to .env and add your "
            "free key from https://aistudio.google.com"
        )

    prompt = PROMPT_TEMPLATE.format(title=title, summary=summary)

    response = requests.post(
        INTERACTIONS_URL,
        headers={
            "x-goog-api-key": api_key,
            "Content-Type": "application/json",
        },
        json={"model": GEMINI_MODEL, "input": prompt},
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    text = _extract_text(data)
    if not text.strip():
        raise RuntimeError(f"Gemini returned no text output. Raw response: {data}")

    questions = [q.strip("-• \t") for q in text.strip().split("\n") if q.strip()]
    return questions[:3]