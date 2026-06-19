import React from "react";
import { ScannerCard } from "../components/Cards";

export default function ScannerPage() {
  return (
    <main className="pageStack">
      <section className="pageHeader">
        <div>
          <p>TRQX MODULE</p>
          <h1>Scanner</h1>
          <span>Momentum, ORB, Low Float, Unusual Volume, Gappers, and Squeeze Candidates.</span>
        </div>
        <button>Connect Existing Scanner API</button>
      </section>
      <ScannerCard full />
      <section className="card fullPageCard notes">
        <div className="cardTitle purple">Integration Notes</div>
        <p>This is where your existing scanner.thetrulies.com logic should move first. The current table is mock data, but the page is structured for live API data.</p>
        <code>/api/scanner?type=momentum</code>
        <code>/api/scanner?type=orb</code>
        <code>/api/scanner?type=low-float</code>
      </section>
    </main>
  );
}
