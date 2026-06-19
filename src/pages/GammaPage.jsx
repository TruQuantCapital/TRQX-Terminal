import React, { useEffect, useState } from "react";
import TradingViewChart from "../components/TradingViewChart";

const API = "https://trqx-flow-scanner-production.up.railway.app";

function fmtNumber(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  return n.toFixed(2);
}

export default function GammaPage() {
  const [ticker, setTicker] = useState("SPY");
  const [gamma, setGamma] = useState(null);

  const query = ticker.trim().toUpperCase();

  useEffect(() => {
    async function fetchGamma() {
      try {
        const res = await fetch(`${API}/api/gamma?ticker=${query}`);
        if (res.ok) setGamma(await res.json());
      } catch (err) {
        console.warn("Gamma lookup failed:", err);
      }
    }

    fetchGamma();
  }, [query]);

  const callWall = gamma?.callWall ?? "--";
  const putWall = gamma?.putWall ?? "--";
  const gammaFlip = gamma?.gammaFlip ?? "--";
  const maxPain = gamma?.maxPain ?? "--";
  const squeezeRisk = gamma?.squeezeRisk ?? "--";
  const dealerPositioning = gamma?.dealerPositioning ?? "--";
  const currentPrice = gamma?.price ?? "--";

  const distanceToCall =
    typeof callWall === "number" && typeof currentPrice === "number"
      ? callWall - currentPrice
      : null;

  const distanceToPut =
    typeof putWall === "number" && typeof currentPrice === "number"
      ? currentPrice - putWall
      : null;

  const distanceToFlip =
    typeof gammaFlip === "number" && typeof currentPrice === "number"
      ? currentPrice - gammaFlip
      : null;

  const expectedDayType = dealerPositioning?.includes("Long")
    ? "Range Bound"
    : squeezeRisk === "High"
    ? "Trend Day"
    : "Volatile Expansion";

  const gammaScore =
    squeezeRisk === "High" ? 88 :
    squeezeRisk === "Moderate" ? 72 :
    squeezeRisk === "Low" ? 55 : 0;

  const gammaGrade =
    gammaScore >= 85 ? "A" :
    gammaScore >= 70 ? "B" :
    gammaScore >= 55 ? "C" : "D";

  return (
    <main className="pageStack">
      <section className="pageHeader">
        <div>
          <p>TRQX MODULE</p>
          <h1>Gamma Ex</h1>
          <span>
            Call wall, put wall, gamma flip, max pain, dealer positioning, and exposure by strike.
          </span>
        </div>
      </section>

      <section className="flowCommandCenter">
        <div>
          <small>GAMMA ENGINE</small>
          <h2>{query}</h2>
          <p>Analyze dealer positioning, gamma flip, walls, and squeeze risk.</p>
        </div>

        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Search ticker: SPY, QQQ, TSLA..."
        />

        <div className="gradeBox">
          <small>GAMMA GRADE</small>
          <b>{gammaGrade}</b>
          <span>{squeezeRisk} squeeze risk</span>
        </div>

        <div className="spotlightBox">
          <small>GAMMA SCORE</small>
          <b>{gammaScore}/100</b>
          <span>{dealerPositioning}</span>
        </div>
      </section>

      <section className="tradePlanCards">
        <div className="tradePlanCard">
          <small>CURRENT PRICE</small>
          <b>{typeof currentPrice === "number" ? fmtNumber(currentPrice) : "--"}</b>
        </div>

        <div className="tradePlanCard good">
          <small>CALL WALL</small>
          <b>{callWall}</b>
        </div>

        <div className="tradePlanCard danger">
          <small>PUT WALL</small>
          <b>{putWall}</b>
        </div>

        <div className="tradePlanCard">
          <small>DISTANCE TO CALL WALL</small>
          <b>{distanceToCall !== null ? `+${fmtNumber(distanceToCall)}` : "--"}</b>
        </div>

        <div className="tradePlanCard">
          <small>DISTANCE TO PUT WALL</small>
          <b>{distanceToPut !== null ? fmtNumber(distanceToPut) : "--"}</b>
        </div>

        <div className="tradePlanCard">
          <small>DISTANCE TO GAMMA FLIP</small>
          <b>{distanceToFlip !== null ? fmtNumber(distanceToFlip) : "--"}</b>
        </div>

        <div className="tradePlanCard">
          <small>GAMMA FLIP</small>
          <b>{gammaFlip}</b>
        </div>

        <div className="tradePlanCard">
          <small>MAX PAIN</small>
          <b>{maxPain}</b>
        </div>

        <div className={`tradePlanCard ${squeezeRisk === "High" ? "danger" : "good"}`}>
          <small>SQUEEZE RISK</small>
          <b>{squeezeRisk}</b>
        </div>

        <div className="tradePlanCard">
          <small>EXPECTED DAY TYPE</small>
          <b>{expectedDayType}</b>
        </div>

        <div className="tradePlanCard">
          <small>DEALER POSITIONING</small>
          <b>{dealerPositioning}</b>
        </div>
      </section>

      <TradingViewChart symbol={query || "SPY"} />

      <section className="trqxScorecard">
        <div className="scorecardHeader">
          <div>
            <small>GAMMA SCORECARD</small>
            <h3>{query}</h3>
          </div>
          <b>{gammaScore}/100</b>
        </div>

        <div className="scoreRows">
          <div className={gammaScore >= 70 ? "scoreGood" : "scoreBad"}>
            <span>Gamma Exposure</span>
            <b>{Math.round(gammaScore / 10)}/10</b>
          </div>

          <div className={squeezeRisk === "High" ? "scoreBad" : "scoreGood"}>
            <span>Squeeze Risk</span>
            <b>{squeezeRisk}</b>
          </div>

          <div className="scoreGood">
            <span>Call Wall</span>
            <b>{callWall}</b>
          </div>

          <div className="scoreBad">
            <span>Put Wall</span>
            <b>{putWall}</b>
          </div>

          <div className={dealerPositioning?.includes("Long") ? "scoreGood" : "scoreBad"}>
            <span>Dealer Position</span>
            <b>{dealerPositioning}</b>
          </div>
        </div>

        <p className="scorecardVerdict">
          {dealerPositioning?.includes("Long")
            ? "Dealers appear long gamma. Price action may be more controlled and mean-reverting near key levels."
            : "Dealers appear short gamma. Price action may expand faster and become more volatile near key levels."}
        </p>
      </section>

      <section className="smartMoneySummary">
        <div>
          <small>GAMMA POSITIONING SUMMARY</small>
          <h3>{query}</h3>
        </div>

        <div className="smartMoneyGrid">
          <div>
            <span>Expected Day Type</span>
            <b>{expectedDayType}</b>
          </div>

          <div>
            <span>Upper Magnet</span>
            <b>{callWall}</b>
          </div>

          <div>
            <span>Lower Magnet</span>
            <b>{putWall}</b>
          </div>

          <div>
            <span>Risk Zone</span>
            <b>{gammaFlip}</b>
          </div>

          <div>
            <span>Volatility</span>
            <b>{squeezeRisk}</b>
          </div>

          <div>
            <span>Dealer Position</span>
            <b>{dealerPositioning}</b>
          </div>
        </div>
      </section>
    </main>
  );
}