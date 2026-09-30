from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient

import app.storage as storage
from app.goal import get_daily_goal
from app.server import app
from app.spaced_rep import ReviewState


def setup_db(monkeypatch, tmp_path):
    monkeypatch.setattr(storage, "DB_PATH", str(tmp_path / "deep_reading.db"))
    monkeypatch.setattr(storage, "OLD_JSON_PATH", str(tmp_path / "reviews.json"))
    storage.init_db()


def test_get_stats_counts_saved_articles_and_answers(monkeypatch, tmp_path):
    setup_db(monkeypatch, tmp_path)

    storage.save_entry(
        piece={"title": "Alpha", "summary": "S1", "url": "https://example.com/1", "source": "arXiv"},
        questions=["Q1", "Q2"],
        answers=["A1", ""],
        review_state=ReviewState(due_date=(datetime.utcnow() + timedelta(days=1)).isoformat()),
        category="science",
    )
    storage.save_entry(
        piece={"title": "Beta", "summary": "S2", "url": "https://example.com/2", "source": "arXiv"},
        questions=["Q3"],
        answers=["A3"],
        review_state=ReviewState(due_date=(datetime.utcnow() - timedelta(days=1)).isoformat()),
        category="science",
    )

    stats = storage.get_stats()

    assert stats["articles_saved"] == 2
    assert stats["questions_answered"] == 2
    assert stats["reviews_due"] >= 1
    assert stats["categories"]["science"] == 2
    assert stats["category_count"] == 1


def test_home_endpoint_exposes_stats(monkeypatch, tmp_path):
    setup_db(monkeypatch, tmp_path)

    storage.save_entry(
        piece={"title": "Gamma", "summary": "S3", "url": "https://example.com/3", "source": "arXiv"},
        questions=["Q1"],
        answers=["A1"],
        review_state=ReviewState(due_date=(datetime.utcnow() + timedelta(days=1)).isoformat()),
        category="science",
    )

    client = TestClient(app)
    response = client.get("/api/home")

    assert response.status_code == 200
    payload = response.json()
    assert payload["stats"]["articles_saved"] == 1
    assert payload["stats"]["questions_answered"] == 1
    assert payload["goal"]["completed"] == 1
    assert payload["recent"][0]["title"] == "Gamma"


def test_daily_goal_tracks_today_reads(monkeypatch, tmp_path):
    setup_db(monkeypatch, tmp_path)

    storage.save_entry(
        piece={"title": "Delta", "summary": "S4", "url": "https://example.com/4", "source": "arXiv"},
        questions=["Q1"],
        answers=["A1"],
        review_state=ReviewState(due_date=(datetime.utcnow() + timedelta(days=1)).isoformat()),
        category="science",
    )

    goal = get_daily_goal(goal_per_day=2)
    assert goal["completed"] == 1
    assert goal["remaining"] == 1
    assert goal["percent"] == 50
