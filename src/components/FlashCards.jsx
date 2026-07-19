import { useEffect, useMemo, useState } from "react";
import LESSON_FLASHCARDS from "../data/lessonFlashcards";
import PatternSVG from "./PatternSVG";

function makeCards(lesson) {
  const hardcoded = LESSON_FLASHCARDS[lesson.title];

  if (hardcoded && hardcoded.length > 0) {
    return hardcoded.map((card, index) => ({
      id: card.id || `${lesson.title}-${index}`,
      front: card.front || "Review this concept.",
      back: card.back || "Review the lesson content.",
      patternId: card.patternId || null,
      category: card.category || "Lesson Review",
      difficulty: card.difficulty || "Beginner",
      hint: card.hint || "Think about market context and confirmation.",
      meaning: card.meaning || null,
      context: card.context || null,
      confirmation: card.confirmation || null,
      invalidation: card.invalidation || null,
      tags: Array.isArray(card.tags) ? card.tags : [],
      priority: Boolean(card.priority),
    }));
  }

  return [
    {
      id: `${lesson.title}-fallback`,
      front: `What is "${lesson.title}" about?`,
      back: lesson.objective || "Review the lesson content.",
      patternId: null,
      category: "Lesson Review",
      difficulty: "Beginner",
      hint: "Use the lesson objective as your guide.",
      meaning: null,
      context: null,
      confirmation: null,
      invalidation: null,
      tags: [],
      priority: false,
    },
  ];
}

function MiniCandles() {
  return (
    <div className="flashMiniChart" aria-hidden="true">
      <span className="flashGridLine flashGridLineOne" />
      <span className="flashGridLine flashGridLineTwo" />

      <span className="flashMiniCandle bullish candleTall" />
      <span className="flashMiniCandle bearish candleSmall" />
      <span className="flashMiniCandle bullish candleMedium" />
      <span className="flashMiniCandle bullish candleShort" />
    </div>
  );
}

function FlashCardVisual({ card }) {
  if (card.patternId) {
    return (
      <div className="flashPatternVisual">
        <PatternSVG patternId={card.patternId} />
      </div>
    );
  }

  return <MiniCandles />;
}

function AnswerSection({ label, value }) {
  if (!value) return null;

  return (
    <section className="flashCardBackSection">
      <span className="flashCardBackLabel">{label}</span>
      <div className="flashCardBackValue">{value}</div>
    </section>
  );
}

export default function FlashCards({ lesson }) {
  const cards = useMemo(() => makeCards(lesson), [lesson]);

  const categories = useMemo(() => {
    return ["All", ...new Set(cards.map((card) => card.category))];
  }, [cards]);

  const storageKey = useMemo(
    () => `trqx-flashcards-${lesson.title}`,
    [lesson.title],
  );

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [masteredIds, setMasteredIds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const filteredCards = useMemo(() => {
    if (activeCategory === "All") return cards;

    return cards.filter((card) => card.category === activeCategory);
  }, [activeCategory, cards]);

  const card = filteredCards[index];

  const masteredCount = cards.filter((item) =>
    masteredIds.includes(item.id),
  ).length;

  const progress =
    cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

  const isMastered = card ? masteredIds.includes(card.id) : false;

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [activeCategory, lesson.title]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(masteredIds));
    } catch {
      // Storage can be unavailable in restricted browser modes.
    }
  }, [masteredIds, storageKey]);

  useEffect(() => {
    function handleKeyboard(event) {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextCard();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevCard();
      }

      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        setFlipped((current) => !current);
      }

      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleMastered();
      }
    }

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  });

  function nextCard() {
    if (!filteredCards.length) return;

    setFlipped(false);
    setIndex((current) => (current + 1) % filteredCards.length);
  }

  function prevCard() {
    if (!filteredCards.length) return;

    setFlipped(false);
    setIndex(
      (current) =>
        (current - 1 + filteredCards.length) % filteredCards.length,
    );
  }

  function toggleMastered() {
    if (!card) return;

    setMasteredIds((current) => {
      if (current.includes(card.id)) {
        return current.filter((id) => id !== card.id);
      }

      return [...current, card.id];
    });
  }

  function resetProgress() {
    const confirmed = window.confirm(
      "Reset mastered progress for this flash-card deck?",
    );

    if (!confirmed) return;

    setMasteredIds([]);
    setIndex(0);
    setFlipped(false);
  }

  function handleCardKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setFlipped((current) => !current);
    }
  }

  if (!card) {
    return (
      <section className="flashDeckRoot">
        <div className="flashDeckEmpty">
          No flash cards are available for this category.
        </div>
      </section>
    );
  }

  return (
    <section className="flashDeckRoot">
      <header className="flashDeckHeader">
        <div className="flashDeckTitleRow">
          <div>
            <span className="flashDeckEyebrow">TRQX ACADEMY</span>
            <h3 className="flashDeckHeading">{lesson.title}</h3>
          </div>

          <span className="flashDeckCount">{cards.length} Cards</span>
        </div>

        <div className="flashDeckProgress">
          <div
            className="flashDeckProgressBar"
            role="progressbar"
            aria-label="Flash-card mastery progress"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
          >
            <div
              className="flashDeckProgressFill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="flashDeckProgressLabel">
            {masteredCount}/{cards.length} mastered
          </span>
        </div>
      </header>

      {categories.length > 2 && (
        <nav className="flashCategoryBar" aria-label="Flash-card categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`flashCategoryBtn ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>
      )}

      <div className="flashCardArea">
        <div
          className={`flashCard ${flipped ? "flipped" : ""} ${
            isMastered ? "mastered" : ""
          }`}
          role="button"
          tabIndex={0}
          aria-label={
            flipped
              ? "Flash-card answer. Press Enter to show the question."
              : "Flash-card question. Press Enter to show the answer."
          }
          aria-pressed={flipped}
          onClick={() => setFlipped((current) => !current)}
          onKeyDown={handleCardKeyDown}
        >
          <div className="flashCardInner">
            <article className="flashCardFront">
              <div className="flashCardTopRow">
                <span className="flashCardSideLabel">QUESTION</span>

                <div className="flashCardTopBadges">
                  <span className="flashDifficultyBadge">
                    {card.difficulty}
                  </span>

                  {card.priority && (
                    <span className="flashCardPriorityBadge">
                      ★ Priority
                    </span>
                  )}
                </div>
              </div>

              <div className="flashCardCategory">{card.category}</div>

              <h4 className="flashCardQuestion">{card.front}</h4>

              <FlashCardVisual card={card} />

              <p className="flashCardHint">{card.hint}</p>

              <div className="flashCardFlipHint">
                Click card or press Space to reveal
              </div>
            </article>

            <article className="flashCardBack">
              <div className="flashCardBackHeader">
                <div>
                  <span className="flashCardSideLabel">ANSWER</span>
                  <div className="flashCardCategory">{card.category}</div>
                </div>

                <span className="flashBrandMark">TRQX</span>
              </div>

              <h4 className="flashCardPatternNameBack">{card.back}</h4>

              <AnswerSection label="Market Meaning" value={card.meaning} />
              <AnswerSection label="Best Context" value={card.context} />
              <AnswerSection
                label="Confirmation"
                value={card.confirmation}
              />
              <AnswerSection
                label="Invalidation"
                value={card.invalidation}
              />

              {card.tags.length > 0 && (
                <div className="flashCardBackTags">
                  {card.tags.map((tag) => (
                    <span className="flashCardTag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flashCardFlipHint">
                Click card or press Space to return
              </div>
            </article>
          </div>
        </div>
      </div>

      <div className="flashDeckControls">
        <button
          type="button"
          className="flashNavBtn"
          onClick={prevCard}
          aria-label="Previous flash card"
        >
          ←
        </button>

        <div className="flashDeckMiddle">
          <span className="flashDeckPosition">
            Card {index + 1} of {filteredCards.length}
          </span>

          <button
            type="button"
            className={`flashMasterBtn ${isMastered ? "done" : ""}`}
            onClick={toggleMastered}
          >
            {isMastered ? "✓ Mastered" : "Mark as Mastered"}
          </button>
        </div>

        <button
          type="button"
          className="flashNavBtn"
          onClick={nextCard}
          aria-label="Next flash card"
        >
          →
        </button>
      </div>

      <div className="flashDeckKeyboardHint">
        <span>← → Navigate</span>
        <span>Space Flip</span>
        <span>M Master</span>
      </div>

      <button
        type="button"
        className="flashResetBtn"
        onClick={resetProgress}
      >
        Reset deck progress
      </button>
    </section>
  );
}