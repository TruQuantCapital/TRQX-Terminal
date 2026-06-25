import { useMemo, useState } from "react";

function makeCards(lesson) {
  const cards = [];
  const paragraphs = lesson.content?.filter((x) => x.type === "p") || [];
  const headings = lesson.content?.filter((x) => x.type === "heading" &&
    !x.text.includes("OBJECTIVE") &&
    !x.text.includes("OVERVIEW") &&
    !x.text.includes("SUMMARY") &&
    !x.text.includes("INTRO")
  ) || [];

  // Card 1 — always: what is this lesson about
  cards.push({
    front: `What is "${lesson.title}" about?`,
    back: lesson.objective || paragraphs[0]?.text || "Review the lesson content.",
  });

  // Card 2 — key concept from first paragraph
  if (paragraphs[0]?.text) {
    cards.push({
      front: `What is the key concept in ${lesson.title}?`,
      back: paragraphs[0].text.slice(0, 300),
    });
  }

  // Cards from meaningful headings paired with following paragraphs
  headings.forEach((h, i) => {
    const cleanHeading = h.text.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").replace(/[^\w\s?.,'-]/g, "").trim();
    if (!cleanHeading || cleanHeading.length < 3) return;
    const para = paragraphs.find((p, pi) => pi > i) || paragraphs[i];
    if (!para?.text) return;
    cards.push({
      front: `Explain: ${cleanHeading}`,
      back: para.text.slice(0, 300),
    });
  });

  // Card from quiz if available
  if (lesson.quiz?.length) {
    lesson.quiz.slice(0, 3).forEach(q => {
      if (q.question && q.answer) {
        cards.push({ front: q.question, back: q.answer });
      }
    });
  }

  if (cards.length === 0) {
    cards.push({
      front: lesson.title,
      back: lesson.objective || "Review the lesson content.",
    });
  }

  return cards.slice(0, 12);
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
        <span>
          {index + 1} / {cards.length}
        </span>
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