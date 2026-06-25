import { useMemo, useState } from "react";
import LESSON_FLASHCARDS from "../data/lessonFlashcards";

function makeCards(lesson) {
  const hardcoded = LESSON_FLASHCARDS[lesson.title];
  if (hardcoded && hardcoded.length > 0) return hardcoded;
  return [{
    front: `What is "${lesson.title}" about?`,
    back: lesson.objective || "Review the lesson content.",
  }];
}

function MiniCandles() {
  return (
    <div className="flash-mini-chart" aria-hidden="true">
      <span className="flash-grid-line one"></span>
      <span className="flash-grid-line two"></span>
      <span className="flash-candle bull tall"></span>
      <span className="flash-candle bear small"></span>
      <span className="flash-candle bull mid"></span>
      <span className="flash-candle bull small2"></span>
    </div>
  );
}

export default function FlashCards({ lesson }) {
  const cards = useMemo(() => makeCards(lesson), [lesson]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];

  function nextCard() {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  }
  function prevCard() {
    setFlipped(false);
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  }

  return (
    <div className="flash-wrap">
      <div className="flash-head">
        <div>
          <small>FLASHCARDS</small>
          <h3>{lesson.title}</h3>
        </div>
        <span>{index + 1} / {cards.length}</span>
      </div>
      <button
        className={`flash-card ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped((v) => !v)}
      >
        <div className="flash-card-top">
          <div className="flash-label">{flipped ? "ANSWER" : "QUESTION"}</div>
          <div className="flash-brand">TRQX</div>
        </div>
        <MiniCandles />
        <div className="flash-text">{flipped ? card.back : card.front}</div>
        <div className="flash-hint">Click card to flip</div>
      </button>
      <div className="flash-actions">
        <button onClick={prevCard}>← Previous</button>
        <button onClick={() => setFlipped((v) => !v)}>
          {flipped ? "Show Question" : "Show Answer"}
        </button>
        <button onClick={nextCard}>Next →</button>
      </div>
    </div>
  );
}