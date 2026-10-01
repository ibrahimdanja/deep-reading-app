from datetime import datetime

import app.storage as storage


def get_daily_goal(goal_per_day: int = 2) -> dict:
    """How close the user is to a simple daily reading target."""
    if goal_per_day <= 0:
        goal_per_day = 1

    conn = storage._connect()
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
