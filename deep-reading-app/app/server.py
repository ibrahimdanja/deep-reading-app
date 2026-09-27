"""
Thin API layer over the existing pipeline (content.py, questions.py, storage.py)
so the web frontend can call it. Run with:
    uvicorn app.server:app --reload
"""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.content import CATEGORIES, get_piece
from app.storage import init_db, save_entry
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
    questions: list[str]
    answers: list[str]


@app.get("/api/categories")
def api_get_categories():
    return CATEGORIES


@app.get("/api/piece")
def api_get_piece(category: str = "science"):
    piece = get_piece(category)
    questions = generate_questions(piece["title"], piece["summary"])
    return {**piece, "questions": questions}


@app.post("/api/answer")
def api_save_answer(payload: AnswerPayload):
    review_state = ReviewState()
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
    )
    return {"status": "saved"}


# Serve the frontend
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")