"""
Adds "Give me something interesting":
  - app/recommend.py   (new) picks ONE subject to read next, favouring ones you've neglected
  - app/storage.py     a small function that summarises your reading per subject
  - app/server.py      a new /api/recommend endpoint
  - frontend/index.html the button now uses it, a reminder when reviews are due,
                        and saving an answer now returns you Home instead of
                        instantly serving another article (no endless feed)
Nothing is written unless EVERY edit can be applied. Safe to run twice.
Run from the project folder:  python3 patch_recommend.py
"""
import os
import sys

FILES = ["app/storage.py", "app/server.py", "frontend/index.html"]
for f in FILES:
    if not os.path.exists(f):
        print(f"STOPPED: can't find {f}. Are you in the project folder (deep-reading-app/deep-reading-app)?")
        sys.exit(1)

files = {f: open(f, encoding="utf-8").read() for f in FILES}

if "api_recommend" in files["app/server.py"]:
    print("Already patched - nothing to do.")
    sys.exit(0)


def replace_exactly(name, old, new, label):
    """Swap `old` for `new` in one file. Refuses to guess if `old` isn't found exactly once."""
    found = files[name].count(old)
    if found != 1:
        print(f"STOPPED at '{label}' in {name}: expected 1 match, found {found}. Nothing was changed.")
        sys.exit(1)
    files[name] = files[name].replace(old, new)


# ---------------------------------------------------------------- app/recommend.py (new file)
RECOMMEND_PY = '''"""
Picks ONE subject to read next - deliberately, not an endless feed.

The idea: nudge you toward subjects you've neglected, with a little
randomness so it isn't predictable. It only looks at what you've actually
saved, and it explains its reasoning in a sentence.
"""

import random
from datetime import datetime

# A subject you've never opened counts like one untouched for ~6 weeks.
NEVER_READ_SCORE = 45
# Beyond this, "even longer" doesn't make a subject any more deserving.
MAX_DAYS = 60
# Choose randomly among this many of the most-neglected subjects.
TOP_N = 3


def recommend(categories, activity, due_count=0, now=None, rng=random):
    """
    categories: {"science": "Science", ...}
    activity:   {"science": {"count": 4, "last_saved": "2026-09-20T10:00:00"}, ...}
                (only subjects you have actually read appear here)
    Returns {"category", "label", "reason", "due_count"}.
    """
    now = now or datetime.utcnow()

    scored = []
    for key, label in categories.items():
        info = activity.get(key)
        if info is None:
            days = None
            score = NEVER_READ_SCORE
        else:
            days = max(0, (now - datetime.fromisoformat(info["last_saved"])).days)
            score = min(days, MAX_DAYS)
        scored.append((score, key, label, days))

    # Shuffle first so ties (e.g. a brand-new library where everything is
    # "never read") are broken randomly instead of always favouring the same subject.
    rng.shuffle(scored)
    scored.sort(key=lambda item: item[0], reverse=True)
    _, key, label, days = rng.choice(scored[:TOP_N])

    if days is None:
        reason = f"You haven't explored {label} yet."
    elif days >= 2:
        reason = f"It's been {days} days since you last read {label}."
    else:
        reason = f"You read {label} recently - a chance to go deeper."

    return {"category": key, "label": label, "reason": reason, "due_count": due_count}
'''

# ---------------------------------------------------------------- app/storage.py
STORAGE_ADDITION = '''

def get_category_activity() -> dict:
    """For each subject you've saved something in: how many, and when most recently."""
    conn = _connect()
    rows = conn.execute(
        "SELECT category, COUNT(*) AS n, MAX(date_saved) AS last_saved "
        "FROM articles WHERE category IS NOT NULL GROUP BY category"
    ).fetchall()
    conn.close()
    return {r["category"]: {"count": r["n"], "last_saved": r["last_saved"]} for r in rows}
'''
files["app/storage.py"] = files["app/storage.py"].rstrip("\n") + "\n" + STORAGE_ADDITION

# ---------------------------------------------------------------- app/server.py
replace_exactly("app/server.py",
    "    get_review_state_row,\n    update_review_state,\n)\n",
    "    get_review_state_row,\n    update_review_state,\n    get_category_activity,\n)\nfrom app.recommend import recommend\n",
    "imports")
replace_exactly("app/server.py",
    '@app.get("/api/piece")',
    '''@app.get("/api/recommend")
def api_recommend():
    return recommend(CATEGORIES, get_category_activity(), due_count=len(get_due_reviews()))


@app.get("/api/piece")''',
    "endpoint")

# ---------------------------------------------------------------- frontend/index.html
FE = "frontend/index.html"

# 1. Styles
CSS = """  /* --- Recommendation + reminders --- */
  .why-note {
    font-size: 0.82rem;
    color: var(--muted);
    font-style: italic;
    margin: 0 0 18px;
  }
  .why-note:empty { display: none; }
  .due-note { font-size: 0.88rem; color: var(--muted); margin: -16px 0 26px; }
  .linklike {
    background: none;
    border: none;
    border-bottom: 1px solid var(--amber-dim);
    border-radius: 0;
    padding: 0;
    color: var(--amber);
    font-size: inherit;
    font-weight: 500;
  }
  .linklike:hover { opacity: 1; border-bottom-color: var(--amber); }

"""
replace_exactly(FE, "  /* --- Read view --- */", CSS + "  /* --- Read view --- */", "styles")

# 2. Home: the button, and a place for the "reviews waiting" reminder
replace_exactly(FE, '<button id="startReadingBtn">Give me something to read</button>',
                    '<button id="startReadingBtn">Give me something interesting</button>', "home button")
replace_exactly(FE, '    <div class="start-reading-row">',
                    '    <p class="due-note" id="dueNote" style="display:none;"></p>\n\n    <div class="start-reading-row">', "due note spot")

# 3. Read: a place to say WHY this subject was chosen
replace_exactly(FE, '  <div class="view" id="readView">\n    <div class="category-row" id="categoryRow"></div>',
                    '  <div class="view" id="readView">\n    <p class="why-note" id="whyNote"></p>\n    <div class="category-row" id="categoryRow"></div>', "why note spot")

# 4. Home shows the reminder when reviews are waiting
replace_exactly(FE, "  document.getElementById('dueNum').textContent = data.due_count;\n", """  document.getElementById('dueNum').textContent = data.due_count;

  const dueNote = document.getElementById('dueNote');
  if (data.due_count > 0) {
    dueNote.innerHTML = '<button class="linklike" id="dueLink"></button>';
    const link = document.getElementById('dueLink');
    link.textContent = data.due_count === 1
      ? '1 review is waiting - do it first?'
      : `${data.due_count} reviews are waiting - do them first?`;
    link.addEventListener('click', () => showView('reviews'));
    dueNote.style.display = 'block';
  } else {
    dueNote.style.display = 'none';
  }
""", "home reminder")

# 5. The button asks the server what to read
replace_exactly(FE, "document.getElementById('startReadingBtn').addEventListener('click', () => showView('read'));",
                    "document.getElementById('startReadingBtn').addEventListener('click', giveMeSomething);", "button handler")

RECOMMEND_JS = """// ---------- "Give me something interesting" ----------

async function giveMeSomething() {
  let rec;
  try {
    const res = await fetch('/api/recommend');
    rec = await res.json();
  } catch (e) {
    showView('read');  // if the suggestion fails, just open Read as before
    return;
  }
  currentCategory = rec.category;
  currentPiece = null;  // forces a fresh piece for the chosen subject
  syncCategoryPills();
  document.getElementById('whyNote').textContent = rec.reason;
  showView('read');
}

function syncCategoryPills() {
  document.querySelectorAll('#categoryRow .category-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.key === currentCategory);
  });
}

"""
replace_exactly(FE, "// ---------- Read view ----------", RECOMMEND_JS + "// ---------- Read view ----------", "recommend logic")

# 6. Subject pills remember their key, and picking one yourself clears the "why" note
replace_exactly(FE, "    btn.className = 'category-btn' + (key === currentCategory ? ' active' : '');\n    btn.textContent = label;\n",
                    "    btn.className = 'category-btn' + (key === currentCategory ? ' active' : '');\n    btn.textContent = label;\n    btn.dataset.key = key;\n", "pill key")
replace_exactly(FE, "      currentCategory = key;\n      document.querySelectorAll('#categoryRow .category-btn')",
                    "      currentCategory = key;\n      document.getElementById('whyNote').textContent = '';\n      document.querySelectorAll('#categoryRow .category-btn')", "clear why note")

# 7. After saving, go Home instead of instantly loading the next article
replace_exactly(FE, "setTimeout(() => { loadPiece(); }, 1400);",
                    "setTimeout(() => { currentPiece = null; showView('home'); }, 1200);", "after save")

# ---------------------------------------------------------------- write everything (only reached if every edit applied)
open("app/recommend.py", "w", encoding="utf-8").write(RECOMMEND_PY)
for name, text in files.items():
    open(name, "w", encoding="utf-8").write(text)
print("Done - 'Give me something interesting' added. Restart the server (Ctrl+C, then start it again) and refresh.")
