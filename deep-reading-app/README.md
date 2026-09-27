# Deep Reading

A personal tool that replaces doomscrolling with short science readings + Socratic
follow-up questions, using spaced repetition to make the thinking stick.

100% free to run: content comes from free public sources (arXiv abstracts), and
question generation uses the free tier of the Gemini API (no card required).

## Setup (on your Fedora machine)

```bash
git clone <your-repo-url>
cd deep-reading-app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# then edit .env and paste in your Gemini API key
```

## Try it (web UI — this is the real interface)

```bash
uvicorn app.server:app --reload
```

Then open http://127.0.0.1:8000 in your browser. This will:
1. Pull a short science abstract (from arXiv).
2. Ask Gemini to generate Socratic follow-up questions about it.
3. Let you reveal and answer the questions right on the page.
4. Save the piece + your answers, scheduled for spaced-repetition review
   (SM-2 algorithm).

## Try it (CLI — same logic, terminal only, useful for quick testing)

```bash
python3 -m app.main
```

## Project structure

```
app/
  content.py     # pulls short science pieces (arXiv)
  questions.py    # generates Socratic questions via Gemini API
  spaced_rep.py   # SM-2 spaced repetition scheduler
  storage.py      # local JSON storage (no database needed yet)
  main.py         # ties it together, run this
data/
  reviews.json    # created automatically, your reading + answer history
.env.example      # copy to .env and add your Gemini API key
requirements.txt
```

## Roadmap

- [x] Content pipeline (arXiv abstracts)
- [x] Socratic question generation (Gemini)
- [x] Spaced repetition scheduling (SM-2)
- [x] CLI to test the core loop
- [x] Web UI (lamplight-reading design, marginalia-style questions)
- [ ] Swap other free sources in (Aeon, Quanta via RSS)
- [ ] Android interception layer (redirect from scrolling apps)
- [ ] Music/focus session mode

## Cost

- arXiv API: free, no key needed
- Gemini API free tier: free, daily request cap far above personal use
- Everything else: runs locally, no paid services
