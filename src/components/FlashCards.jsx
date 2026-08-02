import { useEffect, useMemo, useState } from "react";
import LESSON_FLASHCARDS from "../data/lessonFlashcards";

function makeCards(lesson) {
  if (Array.isArray(lesson?.flashcards) && lesson.flashcards.length > 0) {
    return lesson.flashcards;
  }

  const hardcoded = LESSON_FLASHCARDS[lesson?.title];

  if (Array.isArray(hardcoded) && hardcoded.length > 0) {
    return hardcoded;
  }

  return [
    {
      front: `What is "${lesson?.title || "this lesson"}" about?`,
      back: lesson?.objective || "Review the lesson content.",
    },
  ];
}

function MiniCandles() {
  return (
    <div className="flash-mini-chart" aria-hidden="true">
      <span className="flash-grid-line one" />
      <span className="flash-grid-line two" />
      <span className="flash-candle bull tall" />
      <span className="flash-candle bear small" />
      <span className="flash-candle bull mid" />
      <span className="flash-candle bull small2" />
    </div>
  );
}

export default function FlashCards({ lesson }) {
  const cards = useMemo(() => makeCards(lesson), [lesson]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [lesson]);

  const card = cards[index] || cards[0];

  function nextCard() {
    setFlipped(false);
    setIndex((currentIndex) => (currentIndex + 1) % cards.length);
  }

  function prevCard() {
    setFlipped(false);
    setIndex(
      (currentIndex) =>
        (currentIndex - 1 + cards.length) % cards.length
    );
  }

  if (!card) {
    return null;
  }

  return (
    <div className="flash-wrap">
      <div className="flash-head">
        <div>
          <small>FLASHCARDS</small>
          <h3>{lesson?.title || "Lesson Review"}</h3>
        </div>

        <span>
          {index + 1} / {cards.length}
        </span>
      </div>

      <button
        type="button"
        className={`flash-card ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped((current) => !current)}
      >
        <div className="flash-card-top">
          <div className="flash-label">
            {flipped ? "ANSWER" : "QUESTION"}
          </div>

          <div className="flash-brand">TRQX</div>
        </div>

        <MiniCandles />

        <div className="flash-text">
          {flipped ? card.back : card.front}
        </div>

        <div className="flash-hint">Click card to flip</div>
      </button>

      <div className="flash-actions">
        <button type="button" onClick={prevCard}>
          ← Previous
        </button>

        <button
          type="button"
          onClick={() => setFlipped((current) => !current)}
        >
          {flipped ? "Show Question" : "Show Answer"}
        </button>

        <button type="button" onClick={nextCard}>
          Next →
        </button>
      </div>
    </div>
  );
}