import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Star } from "lucide-react";
import {
  flashcardCategories,
  highPriorityPatternIds,
} from "../data/flashcardLibrary";

import "./flashCards.css";

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
  "standard-doji": doji,
  "four-price-doji": fourPriceDoji,
  "long-legged-doji": longLegDoji,
};

export default function FlashCardDeck() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(new Set());

  const allCards = useMemo(() =>
    flashcardCategories.flatMap((cat) =>
      cat.cards.map((card) => ({ ...card, categoryKey: cat.key, categoryTitle: cat.title }))
    ), []);

  const deck = useMemo(() => {
    if (activeCategory === "starred") return allCards.filter((c) => highPriorityPatternIds.includes(c.id));
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

  function handleCategoryChange(key) { setActiveCategory(key); setCardIndex(0); setFlipped(false); }
  function handlePrev() { setCardIndex((i) => Math.max(0, i - 1)); setFlipped(false); }
  function handleNext() { setCardIndex((i) => Math.min(deck.length - 1, i + 1)); setFlipped(false); }
  function handleMastered() {
    setMastered((prev) => {
      const next = new Set(prev);
      next.has(card.id) ? next.delete(card.id) : next.add(card.id);
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
          <span className="flashDeckCount">{deck.length} cards</span>
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
          { key: "starred", label: "⭐ Priority" },
          ...flashcardCategories.map((c) => ({ key: c.key, label: c.title })),
        ].map((cat) => (
          <button key={cat.key}
            className={"flashCategoryBtn" + (activeCategory === cat.key ? " active" : "")}
            onClick={() => handleCategoryChange(cat.key)}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="flashCardArea">
        <div className={"flashCard" + (flipped ? " flipped" : "") + (isMastered ? " mastered" : "")}
          onClick={() => setFlipped((f) => !f)}>
          <div className="flashCardInner">

            {/* FRONT */}
            <div className="flashCardFront">
              {isHighPriority && (
                <div className="flashCardPriorityBadge"><Star size={12} /> High Win Rate</div>
              )}
              <div className="flashCardCategory">{card.categoryTitle}</div>
              <div className="flashCardPatternName">{card.front}</div>
              {patternImages[card.id] && (
                <img src={patternImages[card.id]} alt={card.front} className="flashPatternImage" />
              )}
              <div className="flashCardHint">{card.frontHint}</div>
              <div className="flashCardFlipHint">Click card to flip</div>
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
                    {card.bestLocation.map((loc, i) => <span key={i} className="flashCardTag">{loc}</span>)}
                  </div>
                </div>
              )}

              {card.confirmation && (
                <div className="flashCardBackSection">
                  <div className="flashCardBackLabel">Confirmation / Notes</div>
                  <div className="flashCardBackValue">{card.confirmation}</div>
                </div>
              )}

              <div className="flashCardFlipHint">Click to flip back</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flashDeckControls">
        <button className="flashNavBtn" onClick={handlePrev} disabled={cardIndex === 0}>
          <ChevronLeft size={20} />
        </button>

        <div className="flashDeckMiddle">
          <span className="flashDeckPosition">
            {cardIndex + 1} / {deck.length}
          </span>

          <button
            className={"flashMasterBtn" + (isMastered ? " done" : "")}
            onClick={(e) => { e.stopPropagation(); handleMastered(); }}>
            {isMastered ? "✓ Mastered" : "Mark Mastered"}
          </button>
        </div>

        <button className="flashNavBtn" onClick={handleNext} disabled={cardIndex === deck.length - 1}>
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
