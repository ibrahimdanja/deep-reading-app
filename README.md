# Deep Reading

A personal reading application that replaces mindless scrolling with short, substantive science and philosophy abstracts paired with Socratic follow-up questions and SM-2 spaced repetition to make critical thinking stick.

## Features

- **Multidisciplinary Curated & Live Content**: Pulls and curates high-signal abstracts across 8 disciplines:
  - **Science**: Complex systems, physics, and neural networks (arXiv)
  - **Philosophy & Ideas**: Epistemology, ethics, and consciousness (Aeon / Stanford Encyclopedia)
  - **Psychology**: Cognitive illusions, attention restoration, and heuristics (PubMed)
  - **Nursing**: Clinical pattern recognition and compassion fatigue (PubMed)
  - **Biology**: Horizontal gene transfer and epigenetics (PubMed)
  - **Sociology**: Network topology, weak ties, and institutional drift (PubMed)
  - **History**: Civilizational tipping points and revolutions (Wikipedia On This Day API)
  - **Medical**: Microbiome-brain axis and chronotherapy (PubMed)

- **Socratic Thinking Questions**:
  - Rather than basic comprehension checks, questions challenge the reader to evaluate counter-arguments, identify hidden assumptions, and test generalization limits.
  - Generates custom questions via the Gemini API when available, and includes a rich collection of Socratic thinking prompts for offline and fallback use.

- **SM-2 Spaced Repetition**:
  - Every saved reading is scheduled for active recall using the SM-2 algorithm (Again, Hard, Good, Easy).
  - Prompts recall before revealing your original notes, locking concepts into permanent memory.

- **Daily Reading Goal & Streaks**:
  - Track your daily reading target (customizable from 1 to 5 pieces).
  - Day-by-day streak counter and subject breadth distribution analytics.

- **Smart Subject Recommendation**:
  - Deliberately suggests ONE subject to read next based on which disciplines you haven't visited recently.

- **Lamplight & Android Material 3 Reader Experience**:
  - Reader appearance options: Dark, Warm Sepia, and Light themes.
  - Adjustable text size (A- to A++) and typography toggle (Book Serif vs Modern Sans).
  - Android Material 3 bottom navigation with due-review notification badges.
  - Full local persistence via localStorage.
  - JSON data export for backup.