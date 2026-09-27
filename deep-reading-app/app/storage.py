"""
Persistence layer, backed by SQLite (built into Python — no extra install,
no external service, still free).

Three tables:
  articles      - one row per piece you've read
  questions     - the Socratic questions + your answers, linked to an article
  review_state  - the SM-2 spaced-repetition schedule for each article

If an old data/reviews.json exists from before this upgrade, it's imported
automatically the first time this runs, then renamed to reviews.json.bak so
nothing is lost.
"""

import json
import os
import sqlite3
from dataclasses import asdict
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "deep_reading.db")
OLD_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "reviews.json")


def _ensure_data_dir():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


def _connect() -> sqlite3.Connection:
    _ensure_data_dir()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # lets us access columns by name, e.g. row["title"]
    return conn


def init_db():
    """Create the tables if they don't already exist. Safe to call every startup."""
    conn = _connect()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            summary TEXT,
            url TEXT,
            source TEXT,
            date_saved TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_id INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            answer_text TEXT,
            FOREIGN KEY (article_id) REFERENCES articles(id)
        );

        CREATE TABLE IF NOT EXISTS review_state (
            article_id INTEGER PRIMARY KEY,
            repetitions INTEGER NOT NULL,
            ease_factor REAL NOT NULL,
            interval_days INTEGER NOT NULL,
            due_date TEXT NOT NULL,
            FOREIGN KEY (article_id) REFERENCES articles(id)
        );
        """
    )
    conn.commit()
    conn.close()

    _migrate_old_json_if_present()


def _migrate_old_json_if_present():
    """One-time import of the old JSON storage, so nothing you already saved is lost."""
    if not os.path.exists(OLD_JSON_PATH):
        return

    with open(OLD_JSON_PATH, "r") as f:
        old_entries = json.load(f)

    if not old_entries:
        os.rename(OLD_JSON_PATH, OLD_JSON_PATH + ".bak")
        return

    conn = _connect()
    for entry in old_entries:
        cursor = conn.execute(
            "INSERT INTO articles (title, summary, url, source, date_saved) "
            "VALUES (?, ?, ?, ?, ?)",
            (
                entry.get("title", ""),
                entry.get("summary", ""),
                entry.get("url", ""),
                entry.get("source", ""),
                datetime.utcnow().isoformat(),
            ),
        )
        article_id = cursor.lastrowid

        questions = entry.get("questions", [])
        answers = entry.get("answers", [])
        for i, q in enumerate(questions):
            a = answers[i] if i < len(answers) else ""
            conn.execute(
                "INSERT INTO questions (article_id, question_text, answer_text) "
                "VALUES (?, ?, ?)",
                (article_id, q, a),
            )

        rs = entry.get("review_state", {})
        conn.execute(
            "INSERT INTO review_state "
            "(article_id, repetitions, ease_factor, interval_days, due_date) "
            "VALUES (?, ?, ?, ?, ?)",
            (
                article_id,
                rs.get("repetitions", 0),
                rs.get("ease_factor", 2.5),
                rs.get("interval_days", 0),
                rs.get("due_date", datetime.utcnow().isoformat()),
            ),
        )

    conn.commit()
    conn.close()

    os.rename(OLD_JSON_PATH, OLD_JSON_PATH + ".bak")
    print(f"Imported {len(old_entries)} old entries into the database.")


def save_entry(piece: dict, questions: list[str], answers: list[str], review_state) -> None:
    conn = _connect()
    cursor = conn.execute(
        "INSERT INTO articles (title, summary, url, source, date_saved) "
        "VALUES (?, ?, ?, ?, ?)",
        (
            piece["title"],
            piece["summary"],
            piece["url"],
            piece["source"],
            datetime.utcnow().isoformat(),
        ),
    )
    article_id = cursor.lastrowid

    for i, q in enumerate(questions):
        a = answers[i] if i < len(answers) else ""
        conn.execute(
            "INSERT INTO questions (article_id, question_text, answer_text) "
            "VALUES (?, ?, ?)",
            (article_id, q, a),
        )

    rs = asdict(review_state)
    conn.execute(
        "INSERT INTO review_state "
        "(article_id, repetitions, ease_factor, interval_days, due_date) "
        "VALUES (?, ?, ?, ?, ?)",
        (article_id, rs["repetitions"], rs["ease_factor"], rs["interval_days"], rs["due_date"]),
    )

    conn.commit()
    conn.close()


def load_all() -> list[dict]:
    """Returns every saved article, each with its questions/answers, newest first."""
    conn = _connect()
    articles = conn.execute(
        "SELECT * FROM articles ORDER BY date_saved DESC"
    ).fetchall()

    result = []
    for article in articles:
        questions = conn.execute(
            "SELECT question_text, answer_text FROM questions WHERE article_id = ?",
            (article["id"],),
        ).fetchall()
        result.append(
            {
                "id": article["id"],
                "title": article["title"],
                "summary": article["summary"],
                "url": article["url"],
                "source": article["source"],
                "date_saved": article["date_saved"],
                "questions": [
                    {"question": q["question_text"], "answer": q["answer_text"]}
                    for q in questions
                ],
            }
        )

    conn.close()
    return result


def get_due_reviews() -> list[dict]:
    """Articles whose review_state.due_date has passed — ready to revisit."""
    conn = _connect()
    now = datetime.utcnow().isoformat()
    rows = conn.execute(
        """
        SELECT articles.id, articles.title, review_state.due_date
        FROM review_state
        JOIN articles ON articles.id = review_state.article_id
        WHERE review_state.due_date <= ?
        ORDER BY review_state.due_date ASC
        """,
        (now,),
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]
