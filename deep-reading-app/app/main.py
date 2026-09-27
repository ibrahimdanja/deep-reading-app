"""
Run this to test the core loop:
  python3 -m app.main

1. Pulls a short science piece.
2. Generates Socratic questions about it via Gemini (free tier).
3. Asks you to answer them right in the terminal.
4. Saves everything, scheduled for spaced-repetition review.
"""

from dotenv import load_dotenv

from app.content import get_piece
from app.questions import generate_questions
from app.spaced_rep import ReviewState
from app.storage import save_entry

load_dotenv()


def main():
    print("Fetching a piece to read...\n")
    piece = get_piece()

    print(f"Title: {piece['title']}")
    print(f"Source: {piece['source']}\n")
    print(piece["summary"])
    print("\n" + "-" * 60 + "\n")

    print("Generating questions...\n")
    questions = generate_questions(piece["title"], piece["summary"])

    answers = []
    for i, q in enumerate(questions, 1):
        print(f"Q{i}: {q}")
        answer = input("Your answer: ").strip()
        answers.append(answer)
        print()

    review_state = ReviewState()
    save_entry(piece, questions, answers, review_state)

    print("Saved. This will resurface for review based on spaced repetition.")


if __name__ == "__main__":
    main()
