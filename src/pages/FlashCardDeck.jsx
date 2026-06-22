import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Star } from "lucide-react";
import { flashcardCategories, highPriorityPatternIds } from "../data/flashcardLibrary";
import PatternSVG from "./PatternSVG";
import "./flashCards.css";

function getDistractors(correctId, allCards) {
  const others = allCards.filter((c) => c.id !== correctId);
  return [...others].sort(() => Math.random() - 0.5).slice(0, 3).map((c) => c.front);
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function WinRate({ rating }) {
  return (
    <div className="flashWinRate">
      {[1,2,3,4,5].map((i) => <span key={i} className={i <= rating ? "flashWinStar" : "flashWinStarEmpty"}>★</span>)}
    </div>
  );
}

export default function FlashCardDeck() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cardIndex, setCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [mastered, setMastered] = useState(new Set());
  const [selected, setSelected] = useState(null);

  const allCards = useMemo(() => flashcardCategories.flatMap((cat) => cat.cards.map((card) => ({ ...card, categoryKey: cat.key, categoryTitle: cat.title }))), []);

  const deck = useMemo(() => {
    if (activeCategory === "starred") return allCards.filter((c) => highPriorityPatternIds.includes(c.id));
    if (activeCategory === "all") return allCards;
    return allCards.filter((c) => c.categoryKey === activeCategory);
  }, [activeCategory, allCards]);

  const card = deck[cardIndex];
  const progress = deck.length > 0 ? Math.round((mastered.size / deck.length) * 100) : 0;
  const currentChoices = useMemo(() => card ? shuffle([card.front, ...getDistractors(card.id, allCards)]) : [], [card, allCards]);

  function go(key, idx = 0) { setActiveCategory(key); setCardIndex(idx); setShowBack(false); setSelected(null); }
  function prev() { setCardIndex((i) => Math.max(0, i - 1)); setShowBack(false); setSelected(null); }
  function next() { setCardIndex((i) => Math.min(deck.length - 1, i + 1)); setShowBack(false); setSelected(null); }
  function pick(choice) { if (selected) return; setSelected(choice); }
  function toggleMastered(e) { e.stopPropagation(); if (!card) return; setMastered((p) => { const n = new Set(p); n.has(card.id) ? n.delete(card.id) : n.add(card.id); return n; }); }
  function reset() { setMastered(new Set()); setCardIndex(0); setShowBack(false); setSelected(null); }

  if (!card) return <div className="flashDeckEmpty"><p>No cards in this category yet.</p></div>;

  const isMastered = mastered.has(card.id);
  const isHighPriority = highPriorityPatternIds.includes(card.id);
  const answered = !!selected;
  const isCorrect = selected === card.front;

  return (
    <div className="flashDeckRoot">
      <div className="flashDeckHeader">
        <div className="flashDeckTitle"><span>Pattern Flash Cards</span><span className="flashDeckCount">{deck.length} cards</span></div>
        <div className="flashDeckProgress">
          <div className="flashDeckProgressBar"><div className="flashDeckProgressFill" style={{ width: progress + "%" }} /></div>
          <span className="flashDeckProgressLabel">{mastered.size} / {deck.length} mastered</span>
        </div>
      </div>

      <div className="flashCategoryBar">
        {[{ key: "all", label: "All" }, { key: "starred", label: "Priority" }, ...flashcardCategories.map((c) => ({ key: c.key, label: c.title }))].map((cat) => (
          <button key={cat.key} className={"flashCategoryBtn" + (activeCategory === cat.key ? " active" : "")} onClick={() => go(cat.key)}>{cat.label}</button>
        ))}
      </div>

      {!showBack && (
        <div className="flashCardFront">
          {isHighPriority && <div className="flashCardPriorityBadge"><Star size={12} /> High Win Rate</div>}
          <div className="flashCardCategory">{card.categoryTitle}</div>
          <div className="flashCardDiagram"><PatternSVG patternId={card.id} /></div>
          <div className="flashCardChoices">
            {currentChoices.map((choice) => {
              let cls = "flashCardChoice";
              if (answered) { if (choice === card.front) cls += " correct"; else if (choice === selected) cls += " incorrect"; else cls += " dimmed"; }
              return <button key={choice} className={cls} onClick={() => pick(choice)} disabled={answered}>{choice}</button>;
            })}
          </div>
          {answered && <button className="flashRevealBtn" onClick={() => setShowBack(true)}>{isCorrect ? "Correct! See full breakdown →" : "See full breakdown →"}</button>}
          {!answered && <div className="flashCardFlipHint">Pick the correct pattern name above</div>}
        </div>
      )}

      {showBack && (
        <div className="flashCardBack">
          <div className="flashCardBackName">{card.front}</div>
          {card.winRate && <WinRate rating={card.winRate} />}
          <div className="flashCardBackSection"><div className="flashCardBackLabel">What It Means</div><div className="flashCardBackValue">{card.meaning}</div></div>
          {card.howToSpot?.length > 0 && <div className="flashCardBackSection"><div className="flashCardBackLabel">How To Spot It</div><ul className="flashCardBackList">{card.howToSpot.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
          {card.bestLocation?.length > 0 && <div className="flashCardBackSection"><div className="flashCardBackLabel">Best Location</div><div className="flashCardBackTags">{card.bestLocation.map((loc, i) => <span key={i} className="flashCardTag">{loc}</span>)}</div></div>}
          {card.howToTrade && (
            <div className="flashCardBackSection">
              <div className="flashCardBackLabel">How To Trade</div>
              <div className="flashCardTradeGrid">
                <span className="flashCardTradeLabel entry">ENTRY</span><span className="flashCardTradeValue">{card.howToTrade.entry}</span>
                <span className="flashCardTradeLabel stop">STOP</span><span className="flashCardTradeValue">{card.howToTrade.stop}</span>
                <span className="flashCardTradeLabel target">TARGET</span><span className="flashCardTradeValue">{card.howToTrade.target}</span>
              </div>
            </div>
          )}
          {card.traderTip && <div className="flashCardBackSection"><div className="flashCardBackLabel">Trader's Tip</div><div className="flashCardTip">{card.traderTip}</div></div>}
          <button className="flashRevealBtn" onClick={() => setShowBack(false)}>← Back to card</button>
        </div>
      )}

      <div className="flashDeckControls">
        <button className="flashNavBtn" onClick={prev} disabled={cardIndex === 0} aria-label="Previous"><ChevronLeft size={20} /></button>
        <div className="flashDeckMiddle">
          <span className="flashDeckPosition">{cardIndex + 1} / {deck.length}</span>
          <button className={"flashMasterBtn" + (isMastered ? " done" : "")} onClick={toggleMastered} disabled={!answered}>{isMastered ? "Mastered ✓" : "Mark Mastered"}</button>
        </div>
        <button className="flashNavBtn" onClick={next} disabled={cardIndex === deck.length - 1} aria-label="Next"><ChevronRight size={20} /></button>
      </div>

      {mastered.size > 0 && <button className="flashResetBtn" onClick={reset}><RotateCcw size={13} /> Reset progress</button>}
    </div>
  );
}
