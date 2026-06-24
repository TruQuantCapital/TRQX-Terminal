import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Star } from "lucide-react";
import {
  flashcardCategories,
  highPriorityPatternIds,
} from "../data/flashcardLibrary";

import "./flashCards.css";

<<<<<<< HEAD
=======
// IMAGE IMPORTS
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
import hammer from "../assets/hammer.png";
import tweezerbottom from "../assets/tweezer bottom.png";
import bullishEngulfing from "../assets/bearish engulfing .png";
import bearishEngulfingBear from "../assets/bearish engulfing .png";
import shootingStar from "../assets/shooting star.png";
import eveningStar from "../assets/evening star.png";
import morningStar from "../assets/morning star.png";
import bullFlag from "../assets/bull flag.png";
import bearFlag from "../assets/bear flag.png";
import ascendingTriangle from "../assets/ascending triangle.png";
import descendingTriangle from "../assets/descending triangle.png";
import bullPennant from "../assets/pennant.png";
import bearPennant from "../assets/bear pennant.png";
import stopHunt from "../assets/stop hunt.png";
import gravestone from "../assets/gravestone.png";
import gravestoneDoji from "../assets/gravestone doji.png";
import dragonflySupport from "../assets/dragon fly support.png";
import dragonfly from "../assets/dragonfly.png";
import rickshawManDoji from "../assets/rickshaw man doji.png";
import uptrend from "../assets/uptrend.png";
import downtrend from "../assets/downtrend.png";
import sideways from "../assets/sideways.png";
import bearTrap from "../assets/bear trap.png";
import bullTrap from "../assets/bull trap.png";
import tweezerTop from "../assets/tweezer top.png";
import doji from "../assets/doji.png";
import fourPriceDoji from "../assets/four price doji.png";
import longLegDoji from "../assets/long leg doji.png";

const patternImages = {
<<<<<<< HEAD
  hammer,
  "bullish-engulfing": bullishEngulfing,
  "bearish-engulfing": bearishEngulfingBear,
  "shooting-star": shootingStar,
  "evening-star": eveningStar,
  "morning-star": morningStar,
  "bull-flag": bullFlag,
  "bear-flag": bearFlag,
  "ascending-triangle": ascendingTriangle,
  "descending-triangle": descendingTriangle,
  "bull-pennant": bullPennant,
  "bear-pennant": bearPennant,
  "stop-hunt": stopHunt,
  "gravestone-at-resistance": gravestone,
  "gravestone-doji": gravestoneDoji,
  "dragonfly-at-support": dragonflySupport,
  "dragonfly-doji": dragonfly,
  "rickshaw-man-doji": rickshawManDoji,
  uptrend,
  downtrend,
  "sideways-range": sideways,
  "bear-trap": bearTrap,
  "bull-trap": bullTrap,
  "tweezer-bottom": tweezerbottom,
  "tweezer-top": tweezerTop,
=======
  hammer: hammer,

  "bullish-engulfing": bullishEngulfing,
  "bearish-engulfing": bearishEngulfingBear,

  "shooting-star": shootingStar,
  "evening-star": eveningStar,
  "morning-star": morningStar,

  "bull-flag": bullFlag,
  "bear-flag": bearFlag,

  "ascending-triangle": ascendingTriangle,
  "descending-triangle": descendingTriangle,

  "bull-pennant": bullPennant,
  "bear-pennant": bearPennant,

  "stop-hunt": stopHunt,

  "gravestone-at-resistance": gravestone,
  "gravestone-doji": gravestoneDoji,

  "dragonfly-at-support": dragonflySupport,
  "dragonfly-doji": dragonfly,
  "rickshaw-man-doji": rickshawManDoji,

  uptrend: uptrend,
  downtrend: downtrend,
  "sideways-range": sideways,

  "bear-trap": bearTrap,
  "bull-trap": bullTrap,

  "tweezer-bottom": tweezerbottom,
  "tweezer-top": tweezerTop,

>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
  "standard-doji": doji,
  "four-price-doji": fourPriceDoji,
  "long-legged-doji": longLegDoji,
};

export default function FlashCardDeck() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(new Set());

<<<<<<< HEAD
  const allCards = useMemo(() =>
    flashcardCategories.flatMap((cat) =>
      cat.cards.map((card) => ({ ...card, categoryKey: cat.key, categoryTitle: cat.title }))
    ), []);

  const deck = useMemo(() => {
    if (activeCategory === "starred") return allCards.filter((c) => highPriorityPatternIds.includes(c.id));
=======
  const allCards = useMemo(() => {
    return flashcardCategories.flatMap((cat) =>
      cat.cards.map((card) => ({
        ...card,
        categoryKey: cat.key,
        categoryTitle: cat.title,
      }))
    );
  }, []);

  const deck = useMemo(() => {
    if (activeCategory === "starred") {
      return allCards.filter((c) =>
        highPriorityPatternIds.includes(c.id)
      );
    }

>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
    if (activeCategory === "all") return allCards;

    return allCards.filter(
      (c) => c.categoryKey === activeCategory
    );
  }, [activeCategory, allCards]);

  const card = deck[cardIndex];

  const progress =
    deck.length > 0
      ? Math.round((mastered.size / deck.length) * 100)
      : 0;

<<<<<<< HEAD
  function handleCategoryChange(key) { setActiveCategory(key); setCardIndex(0); setFlipped(false); }
  function handlePrev() { setCardIndex((i) => Math.max(0, i - 1)); setFlipped(false); }
  function handleNext() { setCardIndex((i) => Math.min(deck.length - 1, i + 1)); setFlipped(false); }
  function handleMastered() {
    setMastered((prev) => {
      const next = new Set(prev);
      next.has(card.id) ? next.delete(card.id) : next.add(card.id);
=======
  function handleCategoryChange(key) {
    setActiveCategory(key);
    setCardIndex(0);
    setFlipped(false);
  }

  function handlePrev() {
    setCardIndex((i) => Math.max(0, i - 1));
    setFlipped(false);
  }

  function handleNext() {
    setCardIndex((i) =>
      Math.min(deck.length - 1, i + 1)
    );
    setFlipped(false);
  }

  function handleFlip() {
    setFlipped((f) => !f);
  }

  function handleMastered() {
    setMastered((prev) => {
      const next = new Set(prev);

      if (next.has(card.id)) {
        next.delete(card.id);
      } else {
        next.add(card.id);
      }

>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
      return next;
    });
  }
  function handleReset() { setMastered(new Set()); setCardIndex(0); setFlipped(false); }

  if (!card) return <div className="flashDeckEmpty"><p>No cards in this category yet.</p></div>;

  const isMastered = mastered.has(card.id);
  const isHighPriority =
    highPriorityPatternIds.includes(card.id);

  return (
    <div className="flashDeckRoot">

      {/* Header */}
      <div className="flashDeckHeader">
        <div className="flashDeckTitle">
          <span>FLASHCARDS</span>
<<<<<<< HEAD
          <span className="flashDeckCount">{deck.length} cards</span>
=======
          <span className="flashDeckCount">
            {deck.length} cards
          </span>
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
        </div>

        <div className="flashDeckProgress">
          <div className="flashDeckProgressBar">
            <div
              className="flashDeckProgressFill"
              style={{ width: progress + "%" }}
            />
          </div>

          <span className="flashDeckProgressLabel">
            {mastered.size} / {deck.length} mastered
          </span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flashCategoryBar">
        {[
          { key: "all", label: "All" },
<<<<<<< HEAD
          { key: "starred", label: "⭐ Priority" },
          ...flashcardCategories.map((c) => ({ key: c.key, label: c.title })),
        ].map((cat) => (
          <button key={cat.key}
            className={"flashCategoryBtn" + (activeCategory === cat.key ? " active" : "")}
            onClick={() => handleCategoryChange(cat.key)}>
=======
          { key: "starred", label: "Priority" },
          ...flashcardCategories.map((c) => ({
            key: c.key,
            label: c.title,
          })),
        ].map((cat) => (
          <button
            key={cat.key}
            className={
              "flashCategoryBtn" +
              (activeCategory === cat.key ? " active" : "")
            }
            onClick={() =>
              handleCategoryChange(cat.key)
            }
          >
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
            {cat.label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="flashCardArea">
<<<<<<< HEAD
        <div className={"flashCard" + (flipped ? " flipped" : "") + (isMastered ? " mastered" : "")}
          onClick={() => setFlipped((f) => !f)}>
=======
        <div
          className={
            "flashCard" +
            (flipped ? " flipped" : "") +
            (isMastered ? " mastered" : "")
          }
          onClick={handleFlip}
        >
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
          <div className="flashCardInner">

            {/* FRONT */}
            <div className="flashCardFront">
              {isHighPriority && (
                <div className="flashCardPriorityBadge"><Star size={12} /> High Win Rate</div>
              )}
<<<<<<< HEAD
              <div className="flashCardCategory">{card.categoryTitle}</div>
              <div className="flashCardPatternName">{card.front}</div>
              {patternImages[card.id] && (
                <img src={patternImages[card.id]} alt={card.front} className="flashPatternImage" />
              )}
              <div className="flashCardHint">{card.frontHint}</div>
              <div className="flashCardFlipHint">Click card to flip</div>
=======

              <div className="flashCardCategory">
                {card.categoryTitle}
              </div>

              <div className="flashCardPatternName">
                {card.front}
              </div>

              {patternImages[card.id] && (
                <img
                  src={patternImages[card.id]}
                  alt={card.front}
                  className="flashPatternImage"
                />
              )}

              <div className="flashCardHint">
                {card.frontHint}
              </div>

              <div className="flashCardFlipHint">
                Tap to reveal
              </div>
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
            </div>

            {/* BACK */}
            <div className="flashCardBack">
              <div className="flashCardBackHeader">
                <div className="flashCardCategory">{card.categoryTitle}</div>
                <div className="flashCardPatternNameBack">{card.front}</div>
              </div>

              <div className="flashCardBackSection">
                <div className="flashCardBackLabel">
                  What It Means
                </div>

                <div className="flashCardBackValue">
                  {card.meaning}
                </div>
              </div>

              {card.howToSpot?.length > 0 && (
                <div className="flashCardBackSection">
                  <div className="flashCardBackLabel">
                    How To Spot It
                  </div>

                  <ul className="flashCardBackList">
                    {card.howToSpot.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}

              {card.bestLocation?.length > 0 && (
                <div className="flashCardBackSection">
                  <div className="flashCardBackLabel">
                    Best Location
                  </div>

                  <div className="flashCardBackTags">
<<<<<<< HEAD
                    {card.bestLocation.map((loc, i) => <span key={i} className="flashCardTag">{loc}</span>)}
=======
                    {card.bestLocation.map((loc, i) => (
                      <span
                        key={i}
                        className="flashCardTag"
                      >
                        {loc}
                      </span>
                    ))}
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
                  </div>
                </div>
              )}

              {card.confirmation && (
                <div className="flashCardBackSection">
<<<<<<< HEAD
                  <div className="flashCardBackLabel">Confirmation / Notes</div>
                  <div className="flashCardBackValue">{card.confirmation}</div>
                </div>
              )}

              <div className="flashCardFlipHint">Click to flip back</div>
=======
                  <div className="flashCardBackLabel">
                    Confirmation
                  </div>

                  <div className="flashCardBackValue">
                    {card.confirmation}
                  </div>
                </div>
              )}

              <div className="flashCardFlipHint">
                Tap to flip back
              </div>
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flashDeckControls">
<<<<<<< HEAD
        <button className="flashNavBtn" onClick={handlePrev} disabled={cardIndex === 0}>
=======
        <button
          className="flashNavBtn"
          onClick={handlePrev}
          disabled={cardIndex === 0}
        >
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
          <ChevronLeft size={20} />
        </button>

        <div className="flashDeckMiddle">
          <span className="flashDeckPosition">
            {cardIndex + 1} / {deck.length}
          </span>

          <button
<<<<<<< HEAD
            className={"flashMasterBtn" + (isMastered ? " done" : "")}
            onClick={(e) => { e.stopPropagation(); handleMastered(); }}>
            {isMastered ? "✓ Mastered" : "Mark Mastered"}
          </button>
        </div>

        <button className="flashNavBtn" onClick={handleNext} disabled={cardIndex === deck.length - 1}>
=======
            className={
              "flashMasterBtn" +
              (isMastered ? " done" : "")
            }
            onClick={(e) => {
              e.stopPropagation();
              handleMastered();
            }}
          >
            {isMastered
              ? "Mastered"
              : "Mark Mastered"}
          </button>
        </div>

        <button
          className="flashNavBtn"
          onClick={handleNext}
          disabled={cardIndex === deck.length - 1}
        >
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
          <ChevronRight size={20} />
        </button>
      </div>

      {mastered.size > 0 && (
        <button
          className="flashResetBtn"
          onClick={handleReset}
        >
          <RotateCcw size={13} /> Reset progress
        </button>
      )}
    </div>
  );
}