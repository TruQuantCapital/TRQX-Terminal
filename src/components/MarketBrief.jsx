import React from "react";
import { useNavigate } from "react-router-dom";

export default function MarketBrief() {
  const navigate = useNavigate();

  return (
    <section className="marketBrief">
      <div className="marketBriefHeader">
        <div>
          <small>TRQX MARKET BRIEF</small>
          <h2>Daily Market Intelligence</h2>
        </div>

        <div className="marketRegime">
          <span>RISK ON</span>
        </div>
      </div>

      <div className="marketBriefGrid">
        <div>
          <small>Dealer Positioning</small>
          <b>LONG GAMMA</b>
        </div>

        <div>
          <small>Top Flow</small>
          <b>NVDA + $24.3M Calls</b>
        </div>

        <div>
          <small>Top Watch</small>
          <b>NVDA</b>
        </div>

        <div>
          <small>Flow Score</small>
          <b>92/100</b>
        </div>

        <div>
          <small>Top Catalyst</small>
          <b>AI Sector Strength</b>
        </div>

        <div>
          <small>Economic Risk</small>
          <b>FOMC This Week</b>
        </div>
      </div>

      <div className="marketBriefRead">
        <strong>TRQX Read:</strong> Market conditions remain constructive.
        Dealers appear long gamma and institutional flow remains concentrated in
        large-cap technology. Watch NVDA, QQQ and SPY for continuation.
      </div>

      <div className="marketBriefActions">
        <button onClick={() => navigate("/scanner")}>View Scanner</button>
        <button onClick={() => navigate("/options-flow")}>View Flow</button>
        <button onClick={() => navigate("/gamma-ex")}>View Gamma</button>
      </div>
    </section>
  );
}