"""
Persistence layer, backed by SQLite (built into Python — no extra install,
no external service, still free).

Three tables:
  articles      - one row per piece you've read (now includes its category)
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
from datetime import datetime, timedelta

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

    # 'category' was added after the table already existed for some people —
    # ALTER TABLE ADD COLUMN is how you add a column to an existing SQLite
    # table. If it's already there (fresh installs), SQLite raises an error
    # which we just ignore.
    try:
        conn.execute("ALTER TABLE articles ADD COLUMN category TEXT")
    except sqlite3.OperationalError:
        pass  # column already exists

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
            "INSERT INTO articles (title, summary, url, source, date_saved, category) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                entry.get("title", ""),
                entry.get("summary", ""),
                entry.get("url", ""),
                entry.get("source", ""),
                datetime.utcnow().isoformat(),
                None,
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


def save_entry(
    piece: dict,
    questions: list[str],
    answers: list[str],
    review_state,
    category: str = None,
) -> None:
    conn = _connect()
    cursor = conn.execute(
        "INSERT INTO articles (title, summary, url, source, date_saved, category) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (
            piece["title"],
            piece["summary"],
            piece["url"],
            piece["source"],
            datetime.utcnow().isoformat(),
            category,
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
                "category": article["category"],
                "questions": [
                    {"question": q["question_text"], "answer": q["answer_text"]}
                    for q in questions
                ],
            }
        )

    conn.close()
    return result


def get_library(category: str = None) -> list[dict]:
    """
    Everything saved, optionally filtered to one category, newest first —
    each article includes its questions/answers for the Library page.
    """
    conn = _connect()
    if category:
        articles = conn.execute(
            "SELECT * FROM articles WHERE category = ? ORDER BY date_saved DESC",
            (category,),
        ).fetchall()
    else:
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
                "category": article["category"],
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


def get_recent(limit: int = 5) -> list[dict]:
    """The most recently saved articles, for the Home screen."""
    conn = _connect()
    rows = conn.execute(
        "SELECT id, title, source, date_saved FROM articles "
        "ORDER BY date_saved DESC LIMIT ?",
        (limit,),
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_daily_goal(goal_per_day: int = 2) -> dict:
    """How close the user is to a simple daily reading target."""
    if goal_per_day <= 0:
        goal_per_day = 1

    conn = _connect()
    today = datetime.utcnow().date().isoformat()
    row = conn.execute(
        "SELECT COUNT(*) AS n FROM articles WHERE substr(date_saved, 1, 10) = ?",
        (today,),
    ).fetchone()
    completed = row["n"] if row else 0
    conn.close()

    percent = min(100, int((completed / goal_per_day) * 100)) if goal_per_day else 100
    return {
        "goal": goal_per_day,
        "completed": completed,
        "remaining": max(0, goal_per_day - completed),
        "percent": percent,
    }


def get_streak() -> int:
    """
    How many days in a row (up to and including today or yesterday) have at
    least one saved article. A simple day-counting streak, nothing fancier.
    """
    conn = _connect()
    rows = conn.execute("SELECT date_saved FROM articles").fetchall()
    conn.close()

    saved_dates = {row["date_saved"][:10] for row in rows}
    if not saved_dates:
        return 0

    today = datetime.utcnow().date()
    if today.isoformat() in saved_dates:
        cursor_date = today
    elif (today - timedelta(days=1)).isoformat() in saved_dates:
        cursor_date = today - timedelta(days=1)
    else:
        return 0

    streak = 0
    while cursor_date.isoformat() in saved_dates:
        streak += 1
        cursor_date = cursor_date - timedelta(days=1)

    return streak


def get_next_due_review() -> dict | None:
    """
    The single earliest-due article ready for review, with its full details
    (including its saved questions/answers, for self-testing) — or None if
    nothing is due right now.
    """
    conn = _connect()
    now = datetime.utcnow().isoformat()
    row = conn.execute(
        """
        SELECT articles.* FROM articles
        JOIN review_state ON review_state.article_id = articles.id
        WHERE review_state.due_date <= ?
        ORDER BY review_state.due_date ASC
        LIMIT 1
        """,
        (now,),
    ).fetchone()

    if row is None:
        conn.close()
        return None

    questions = conn.execute(
        "SELECT question_text, answer_text FROM questions WHERE article_id = ?",
        (row["id"],),
    ).fetchall()
    conn.close()

    return {
        "id": row["id"],
        "title": row["title"],
        "summary": row["summary"],
        "url": row["url"],
        "source": row["source"],
        "category": row["category"],
        "questions": [
            {"question": q["question_text"], "answer": q["answer_text"]}
            for q in questions
        ],
    }


def get_review_state_row(article_id: int) -> dict | None:
    """The raw SM-2 fields for one article, so we can update them after grading."""
    conn = _connect()
    row = conn.execute(
        "SELECT * FROM review_state WHERE article_id = ?", (article_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def update_review_state(article_id: int, review_state) -> None:
    """Writes a ReviewState's fields back to the database after grading a review."""
    rs = asdict(review_state)
    conn = _connect()
    conn.execute(
        "UPDATE review_state SET repetitions = ?, ease_factor = ?, "
        "interval_days = ?, due_date = ? WHERE article_id = ?",
        (rs["repetitions"], rs["ease_factor"], rs["interval_days"], rs["due_date"], article_id),
    )
    conn.commit()
    conn.close()


def get_category_activity() -> dict:
    """For each subject you've saved something in: how many, and when most recently."""
    conn = _connect()
    rows = conn.execute(
        "SELECT category, COUNT(*) AS n, MAX(date_saved) AS last_saved "
        "FROM articles WHERE category IS NOT NULL GROUP BY category"
    ).fetchall()
    conn.close()
    return {r["category"]: {"count": r["n"], "last_saved": r["last_saved"]} for r in rows}


def get_stats() -> dict:
    """Aggregate data for the Home screen stats cards."""
    conn = _connect()
    article_row = conn.execute("SELECT COUNT(*) AS c FROM articles").fetchone()
    answer_row = conn.execute(
        "SELECT COUNT(*) AS c FROM questions WHERE answer_text IS NOT NULL AND answer_text != ''"
    ).fetchone()
    due_count = len(get_due_reviews())
    category_rows = conn.execute(
        "SELECT category, COUNT(*) AS c FROM articles WHERE category IS NOT NULL GROUP BY category"
    ).fetchall()
    conn.close()

    categories = {row["category"]: row["c"] for row in category_rows}
    return {
        "articles_saved": article_row["c"],
        "questions_answered": answer_row["c"],
        "reviews_due": due_count,
        "streak": get_streak(),
        "categories": categories,
        "category_count": len(categories),
    }
