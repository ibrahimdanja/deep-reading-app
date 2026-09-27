"""
Local JSON storage for reading history and review state.
No database needed at this scale — this file is the whole persistence layer.
"""

import json
import os
from dataclasses import asdict

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "reviews.json")


def _ensure_data_dir():
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)


def load_all() -> list[dict]:
    _ensure_data_dir()
    if not os.path.exists(DATA_PATH):
        return []
    with open(DATA_PATH, "r") as f:
        return json.load(f)


def save_entry(piece: dict, questions: list[str], answers: list[str], review_state) -> None:
    _ensure_data_dir()
    entries = load_all()
    entries.append(
        {
            "title": piece["title"],
            "summary": piece["summary"],
            "url": piece["url"],
            "source": piece["source"],
            "questions": questions,
            "answers": answers,
            "review_state": asdict(review_state),
        }
    )
    with open(DATA_PATH, "w") as f:
        json.dump(entries, f, indent=2)
