"""
Thin API layer over the existing pipeline (content.py, questions.py, storage.py)
so the web frontend can call it. Run with:
    uvicorn app.server:app --reload
"""

from dotenv import load_dotenv
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.content import CATEGORIES, get_piece
from app.storage import (
    init_db,
    save_entry,
    get_recent,
    get_streak,
    get_due_reviews,
    get_library,
    get_next_due_review,
    get_review_state_row,
    update_review_state,
)
from app.questions import generate_questions
from app.spaced_rep import ReviewState

load_dotenv()

app = FastAPI()


@app.on_event("startup")
def on_startup():
    # Creates the database tables if they don't exist yet, and imports any
    # old data/reviews.json data the first time this runs after the upgrade.
    init_db()


class AnswerPayload(BaseModel):
    title: str
    summary: str
    url: str
    source: str
    category: str
    questions: list[str]
    answers: list[str]


class GradePayload(BaseModel):
    grade: str  # one of: "again", "hard", "good", "easy"


# Maps the plain-language buttons shown to the user onto SM-2's 0-5 quality
# scale (see spaced_rep.py — below 3 counts as "forgot" and resets progress).
GRADE_TO_QUALITY = {"again": 1, "hard": 3, "good": 4, "easy": 5}


@app.get("/api/categories")
def api_get_categories():
    return CATEGORIES


@app.get("/api/home")
def api_get_home():
    return {
        "streak": get_streak(),
        "due_count": len(get_due_reviews()),
        "recent": get_recent(5),
    }


@app.get("/api/library")
def api_get_library(category: str | None = None):
    return get_library(category)


@app.get("/api/reviews/next")
def api_reviews_next():
    article = get_next_due_review()
    return article if article else {}


@app.post("/api/reviews/{article_id}/grade")
def api_reviews_grade(article_id: int, payload: GradePayload):
    if payload.grade not in GRADE_TO_QUALITY:
        raise HTTPException(status_code=400, detail=f"Unknown grade '{payload.grade}'")

    row = get_review_state_row(article_id)
    if row is None:
        raise HTTPException(status_code=404, detail="No review found for that article")

    review_state = ReviewState(
        repetitions=row["repetitions"],
        ease_factor=row["ease_factor"],
        interval_days=row["interval_days"],
        due_date=row["due_date"],
    )
    review_state.review(GRADE_TO_QUALITY[payload.grade])
    update_review_state(article_id, review_state)

    return {"status": "graded", "next_due": review_state.due_date}


@app.get("/api/piece")
def api_get_piece(category: str = "science"):
    piece = get_piece(category)
    questions = generate_questions(piece["title"], piece["summary"])
    return {**piece, "questions": questions}


@app.post("/api/answer")
def api_save_answer(payload: AnswerPayload):
    # First review is tomorrow — asking you about something you read seconds
    # ago wouldn't test your memory at all.
    review_state = ReviewState(
        due_date=(datetime.utcnow() + timedelta(days=1)).isoformat()
    )
    save_entry(
        piece={
            "title": payload.title,
            "summary": payload.summary,
            "url": payload.url,
            "source": payload.source,
        },
        questions=payload.questions,
        answers=payload.answers,
        review_state=review_state,
        category=payload.category,
    )
    return {"status": "saved"}


# Serve the frontend
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
