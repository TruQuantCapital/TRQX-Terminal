import { useMemo, useState } from "react";

function makeCards(lesson) {
  const headings = lesson.content?.filter((x) => x.type === "heading") || [];
  const paragraphs = lesson.content?.filter((x) => x.type === "p") || [];

  const cards = [];

  headings.forEach((h, i) => {
    const answer = paragraphs[i]?.text || lesson.objective || "Review this section in the lesson.";
    cards.push({
      front: h.text.replace(/[📘🎯🧠✅📚📝✍️🧪👀🚨]/g, "").trim(),
      back: answer,
    });
  });

  if (cards.length === 0) {
    cards.push({
      front: lesson.title,
      back: lesson.objective || "Review the lesson content.",
    });
  }

  return cards.slice(0, 12);
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

      <button className={`flash-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((v) => !v)}>
        <div className="flash-label">{flipped ? "ANSWER" : "QUESTION"}</div>
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