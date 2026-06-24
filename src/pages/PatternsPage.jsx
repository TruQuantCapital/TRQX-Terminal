import React from "react";
import FlashCardDeck from "./FlashCardDeck";

export default function PatternsPage() {
  return (
    <main className="pageStack">
      <section className="pageHeader">
        <div>
          <p>TRQX ACADEMY</p>
          <h1>Flash Cards</h1>
          <span>28 patterns across 6 categories. Tap any card to reveal the full breakdown.</span>
        </div>
      </section>

      <section className="card fullPageCard">
        <FlashCardDeck />
      </section>
    </main>
  );
}

