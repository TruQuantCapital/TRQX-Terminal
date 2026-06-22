import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Star } from "lucide-react";
import { flashcardCategories, highPriorityPatternIds } from "../data/flashcardLibrary";
import PatternSVG from "./PatternSVG";
import "./flashCards.css";

function getDistractors(correctId, allCards) {
  const others = allCards.filter((c) => c.id !== correctId);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((c) => c.front);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function WinRate({ rating }) {
  return (
    <div className="flashWinRate">
      {[1,2,3,4,5].map((i) => (
        <span key={i} className={i <= rating ? "flashWinStar" : "flashWinStarEmpty"}>★</span>
      ))}
    </div>
  );
}

export default function FlashCardDeck() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(new Set());
  const [selected, setSelected] = useState(null);

  const allCards = useMemo(() => {
    return flashcardCategories.flatMap((cat) =>
      cat.cards.map((card) => ({ ...card, categoryKey: cat.key, categoryTitle: cat.title }))
    );
  }, []);

  const deck = useMemo(() => {
    if (activeCategory === "starred") return allCards.filter((c) => highPriorityPatternIds.includes(c.id));
    if (activeCategory === "all") return allCards;
    return allCards.filter((c) => c.categoryKey === activeCategory);
  }, [activeCategory, allCards]);

  const card = deck[cardIndex];
  const progress = deck.length > 0 ? Math.round((mastered.size / deck.length) * 100) : 0;

  const currentChoices = useMemo(() => {
    if (!card) return [];
    return shuffle([card.front, ...getDistractors(card.id, allCards)]);
  }, [card, allCards]);

  function handleCategoryChange(key) { setActiveCategory(key); setCardIndex(0); setFlipped(false); setSelected(null); }
  function handlePrev() { setCardIndex((i) => Math.max(0, i - 1)); setFlipped(false); setSelected(null); }
  function handleNext() { setCardIndex((i) => Math.min(deck.length - 1, i + 1)); setFlipped(false); setSelected(null); }
  function handleSelect(choice) { if (selected !== null) return; setSelected(choice); }
  function handleFlip() { if (selected === null) return; setFlipped((f) => !f); }
  function handleMastered(e) {
    e.stopPropagation();
    if (!card) return;
    setMastered((prev) => { const next = new Set(prev); next.has(card.id) ? next.delete(card.id) : next.add(card.id); return next; });
  }
  function handleReset() { setMastered(new Set()); setCardIndex(0); setFlipped(false); setSelected(null); }

  if (!card) return <div className="flashDeckEmpty"><p>No cards in this category yet.</p></div>;

  const isMastered = mastered.has(card.id);
  const isHighPriority = highPriorityPatternIds.includes(card.id);
  const answered = selected !== null;
  const isCorrect = selected === card.front;

  return (
    <div className="flashDeckRoot">
      <div className="flashDeckHeader">
        <div className="flashDeckTitle">
          <span>Pattern Flash Cards</span>
          <span className="flashDeckCount">{deck.length} cards</span>
        </div>
        <div className="flashDeckProgress">
          <div className="flashDeckProgressBar">
            <div className="flashDeckProgressFill" style={{ width: progress + "%" }} />
          </div>
          <span className="flashDeckProgressLabel">{mastered.size} / {deck.length} mastered</span>
        </div>
      </div>

      <div className="flashCategoryBar">
        {[{ key: "all", label: "All" }, { key: "starred", label: "Priority" }, ...flashcardCategories.map((c) => ({ key: c.key, label: c.title }))].map((cat) => (
          <button key={cat.key} className={"flashCategoryBtn" + (activeCategory === cat.key ? " active" : "")} onClick={() => handleCategoryChange(cat.key)}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flashCardArea">
        <div className={"flashCard" + (flipped ? " flipped" : "") + (isMastered ? " mastered" : "")}>
          <div className="flashCardInner">

            <div className="flashCardFront">
              {isHighPriority && <div className="flashCardPriorityBadge"><Star size={12} /> High Win Rate</div>}
              <div className="flashCardCategory">{card.categoryTitle}</div>
              <div className="flashCardDiagram"><PatternSVG patternId={card.id} /></div>
              <div className="flashCardChoices">
                {currentChoices.map((choice) => {
                  let cls = "flashCardChoice";
                  if (answered) {
                    if (choice === card.front) cls += " correct";
                    else if (choice === selected) cls += " incorrect";
                    else cls += " dimmed";
                  }
                  return (
                    <button key={choice} className={cls} onClick={(e) => { e.stopPropagation(); handleSelect(choice); }} disabled={answered}>
                      {choice}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <button className="flashRevealBtn" onClick={handleFlip}>
                  {flipped ? "Hide detail" : (isCorrect ? "Correct! See full breakdown →" : "See full breakdown →")}
                </button>
              )}
              {!answered && <div className="flashCardFlipHint">Pick the correct pattern name above</div>}
            </div>

            <div className="flashCardBack">
              <div className="flashCardBackName">{card.front}</div>
              {card.winRate && <WinRate rating={card.winRate} />}

              <div className="flashCardBackSection">
                <div className="flashCardBackLabel">What It Means</div>
                <div className="flashCardBackValue">{card.meaning}</div>
              </div>

              {card.howToSpot && card.howToSpot.length > 0 && (
                <div className="flashCardBackSection">
                  <div className="flashCardBackLabel">How To Spot It</div>
                  <ul className="flashCardBackList">
                    {card.howToSpot.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}

              {card.bestLocation && card.bestLocation.length > 0 && (
                <div className="flashCardBackSection">
                  <div className="flashCardBackLabel">Best Location</div>
                  <div className="flashCardBackTags">
                    {card.bestLocation.map((loc, i) => <span key={i} className="flashCardTag">{loc}</span>)}
                  </div>
                </div>
              )}

              {card.howToTrade && (
                <div className="flashCardBackSection">
                  <div className="flashCardBackLabel">How To Trade</div>
                  <div className="flashCardTradeGrid">
                    <span className="flashCardTradeLabel entry">ENTRY</span>
                    <span className="flashCardTradeValue">{card.howToTrade.entry}</span>
                    <span className="flashCardTradeLabel stop">STOP</span>
                    <span className="flashCardTradeValue">{card.howToTrade.stop}</span>
                    <span className="flashCardTradeLabel target">TARGET</span>
                    <span className="flashCardTradeValue">{card.howToTrade.target}</span>
                  </div>
                </div>
              )}

              {card.traderTip && (
                <div className="flashCardBackSection">
                  <div className="flashCardBackLabel">Trader s Tip</div>
                  <div className="flashCardTip">{card.traderTip}</div>
                </div>
              )}

              <button className="flashRevealBtn" onClick={handleFlip} style={{ marginTop: "8px" }}>
                Back to card
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="flashDeckControls">
        <button className="flashNavBtn" onClick={(e) => { e.stopPropagation(); handlePrev(); }} disabled={cardIndex === 0} aria-label="Previous card"><ChevronLeft size={20} /></button>
        <div className="flashDeckMiddle">
          <span className="flashDeckPosition">{cardIndex + 1} / {deck.length}</span>
          <button className={"flashMasterBtn" + (isMastered ? " done" : "")} onClick={handleMastered} disabled={!answered} title={!answered ? "Answer the question first" : undefined}>
            {isMastered ? "Mastered" : "Mark Mastered"}
          </button>
        </div>
        <button className="flashNavBtn" onClick={(e) => { e.stopPropagation(); handleNext(); }} disabled={cardIndex === deck.length - 1} aria-label="Next card"><ChevronRight size={20} /></button>
      </div>

      {mastered.size > 0 && (
        <button className="flashResetBtn" onClick={handleReset}><RotateCcw size={13} /> Reset progress</button>
      )}
    </div>
  );
}
