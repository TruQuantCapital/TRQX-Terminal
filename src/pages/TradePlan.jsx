import React, { useEffect, useState } from "react";
import TradingViewChart from "../components/TradingViewChart";
import { useAuth } from "../hooks/useAuth";
import { isMarketOpen } from "../components/Cards";

const API = "https://trqx-flow-scanner-production.up.railway.app";

function useMarketOpen() {
  const [open, setOpen] = useState(isMarketOpen);
  useEffect(() => {
    const i = setInterval(() => setOpen(isMarketOpen()), 60_000);
    return () => clearInterval(i);
  }, []);
  return open;
}

function fmtPrem(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  if (n >= 1000000000) return `$${(n / 1000000000).toFixed(2)}B`;
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

function scoreClass(score) {
  return score >= 8 ? "scoreGood" : "scoreBad";
}

export default function TradePlanPage() {
  const [ticker, setTicker] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("ticker") || "";
  });
  const [data, setData] = useState(null);
  const { getToken } = useAuth();
  const open = useMarketOpen();

  const query = ticker.trim().toUpperCase();

  useEffect(() => {
    // Engine is gated to live sessions — no fetches while the market is closed.
    if (!query || !open) {
      setData(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const tok = (await getToken?.()) || "";
        const res = await fetch(`${API}/api/flow/ticker/${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${tok}` },
        });
        if (!cancelled && res.ok) setData(await res.json());
      } catch (err) {
        console.warn("Trade plan fetch failed:", err);
      }
    }, 400);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, open]);

  const callPremium = data?.callPremium ?? 0;
  const putPremium = data?.putPremium ?? 0;
  const goldenCount = data?.goldenCount ?? 0;
  const spotlight = data?.spotlight;
  const rowCount = data?.count ?? 0;
  const total = callPremium + putPremium;

  const imbalance = total > 0 ? Math.abs(callPremium - putPremium) / total : 0;

  const sentiment =
    !query || total === 0
      ? "--"
      : imbalance < 0.1
      ? "Neutral"
      : callPremium > putPremium
      ? "Bullish"
      : "Bearish";

  const confidence =
    query && total > 0
      ? Math.min(
          100,
          Math.round(
            (sentiment === "Bullish"
              ? callPremium / total
              : sentiment === "Bearish"
              ? putPremium / total
              : 0.5) *
              70 +
              Math.min(goldenCount * 0.2, 20) +
              Math.min((spotlight?.flowScore || 0) * 1.2, 10)
          )
        )
      : 0;

  const grade =
    confidence >= 90 ? "A+" :
    confidence >= 80 ? "A" :
    confidence >= 70 ? "B" :
    confidence >= 60 ? "C" : "D";

  const gradeLabel =
    confidence >= 90 ? "Elite Setup" :
    confidence >= 80 ? "Strong Setup" :
    confidence >= 70 ? "Active Watchlist" :
    confidence >= 60 ? "Developing Setup" : "Avoid / Wait";

  const optionsFlowScore = Math.min(10, Math.round(rowCount / 10));
  const ratioScore = total > 0 ? Math.min(10, Math.round(confidence / 10)) : 0;
  const goldenScore = Math.min(10, Math.round(goldenCount / 5));
  const flowScore = spotlight?.flowScore || 0;
  const dataScore =
    rowCount > 100 ? 10 : rowCount > 50 ? 8 : rowCount > 20 ? 6 : rowCount > 0 ? 4 : 0;

  /* ── Market closed: clear message, no engine output, chart still available ── */
  if (!open) {
    return (
      <main className="pageStack">
        <section className="pageHeader">
          <div>
            <p>TRQX MODULE</p>
            <h1>Trade Plan</h1>
            <span>AI-style trade planning based on live options flow.</span>
          </div>
        </section>

        <section style={{
          background: "linear-gradient(135deg, rgba(15,23,42,.96), rgba(3,7,18,.98))",
          border: "1px solid rgba(212,175,55,0.35)",
          borderRadius: 14,
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 12,
        }}>
          <span style={{
            background: "rgba(212,175,55,0.1)",
            border: "1px solid rgba(212,175,55,0.4)",
            color: "#d4af37",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 2,
            padding: "4px 12px",
            borderRadius: 6,
          }}>
            MARKET CLOSED
          </span>
          <h2 style={{ color: "#f5f1e8", fontSize: 22, fontWeight: 800, margin: 0 }}>
            Trade Plan Engine is Offline
          </h2>
          <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
            The Trade Plan Engine grades setups using live institutional options flow,
            so it only runs during market hours. It will be back at the next market
            open — 9:30 AM ET. Charts below remain available for weekend review.
          </p>
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Pull up a chart: NVDA, CRM, SPY..."
            style={{
              marginTop: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              color: "#fff",
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 700,
              outline: "none",
              width: "100%",
              maxWidth: 320,
              textAlign: "center",
            }}
          />
        </section>

        <TradingViewChart symbol={query || "SPY"} />
      </main>
    );
  }

  /* ── Market open: full engine ── */
  return (
    <main className="pageStack">
      <section className="pageHeader">
        <div>
          <p>TRQX MODULE</p>
          <h1>Trade Plan</h1>
          <span>AI-style trade planning based on live options flow.</span>
        </div>
      </section>

      <section className="flowCommandCenter">
        <div>
          <small>TRADE PLAN ENGINE</small>
          <h2>{query || "Search a ticker"}</h2>
          <p>Generate bias, confidence, risk plan, and institutional flow narrative.</p>
        </div>

        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Search ticker: NVDA, CRM, SPY..."
        />

        <div className={`gradeBox grade-${grade.replace("+", "plus")}`}>
          <small>TRQX GRADE</small>
          <b>{grade}</b>
          <span>{gradeLabel}</span>
        </div>

        <div className={`spotlightBox confidence-${confidence >= 90 ? "gold" : confidence >= 75 ? "green" : confidence >= 60 ? "orange" : "red"}`}>
          <small>CONFIDENCE</small>
          <b>{confidence}/100</b>
          <span>{sentiment}</span>
        </div>
      </section>

      <section className="tradePlanCards">
        <div className={`tradePlanCard ${confidence >= 75 ? "good" : "danger"}`}>
          <small>BIAS</small>
          <b>{sentiment}</b>
          <span>{confidence}/100 confidence</span>
        </div>

        <div className="tradePlanCard">
          <small>ENTRY</small>
          <b>
            {sentiment === "Bullish"
              ? "Break and hold above resistance"
              : sentiment === "Bearish"
              ? "Reject resistance or break support"
              : "Wait for direction"}
          </b>
        </div>

        <div className="tradePlanCard">
          <small>TARGET 1</small>
          <b>
            {sentiment === "Bullish"
              ? "Prior high / call wall"
              : sentiment === "Bearish"
              ? "Prior low / put wall"
              : "--"}
          </b>
        </div>

        <div className="tradePlanCard">
          <small>TARGET 2</small>
          <b>
            {sentiment === "Bullish"
              ? "Extension if calls continue"
              : sentiment === "Bearish"
              ? "Continuation lower if puts continue"
              : "--"}
          </b>
        </div>

        <div className="tradePlanCard danger">
          <small>STOP</small>
          <b>
            {sentiment === "Bullish"
              ? "Below failed breakout / VWAP"
              : sentiment === "Bearish"
              ? "Above failed breakdown / VWAP"
              : "--"}
          </b>
        </div>

        <div className={`tradePlanCard ${confidence >= 60 ? "good" : "danger"}`}>
          <small>RISK / REWARD</small>
          <b>
            {confidence >= 80
              ? "3:1 preferred"
              : confidence >= 60
              ? "2:1 minimum"
              : "Avoid / wait"}
          </b>
        </div>

      </section>

      <TradingViewChart symbol={query || "SPY"} />

      <section className="trqxScorecard">
        <div className="scorecardHeader">
          <div>
            <small>TRQX SCORECARD</small>
            <h3>{query || "SEARCH A TICKER"}</h3>
          </div>
          <b>{confidence}/100</b>
        </div>

        <div className="scoreRows">
          <div className={scoreClass(optionsFlowScore)}>
            <span>Options Flow</span>
            <b>{optionsFlowScore}/10</b>
          </div>

          <div className={scoreClass(ratioScore)}>
            <span>Call / Put Ratio</span>
            <b>{ratioScore}/10</b>
          </div>

          <div className={scoreClass(goldenScore)}>
            <span>Golden Sweeps</span>
            <b>{goldenScore}/10</b>
          </div>

          <div className={scoreClass(flowScore)}>
            <span>Flow Score</span>
            <b>{flowScore}/10</b>
          </div>

          <div className={scoreClass(dataScore)}>
            <span>Data Quality</span>
            <b>{dataScore}/10</b>
          </div>
        </div>

        <p className="scorecardVerdict">
          {confidence >= 90
            ? "Elite setup. Strong flow, strong conviction, and high institutional participation."
            : confidence >= 75
            ? "Strong setup. Good flow quality, but still requires confirmation."
            : confidence >= 60
            ? "Watchlist setup. Flow is active but not yet high conviction."
            : "Avoid forcing the trade. Wait for cleaner flow or stronger confirmation."}
        </p>
      </section>

      <section className="smartMoneySummary">
        <div>
          <small>SMART MONEY SUMMARY</small>
          <h3>{query || "SEARCH A TICKER"}</h3>
        </div>

        <div className="smartMoneyGrid">
          <div>
            <span>Largest Position</span>
            <b>{fmtPrem(spotlight?.premium)}</b>
          </div>

          <div>
            <span>Golden Sweeps</span>
            <b>{goldenCount}</b>
          </div>

          <div>
            <span>Flow Direction</span>
            <b>{sentiment}</b>
          </div>

          <div>
            <span>Institutional Activity</span>
            <b>{rowCount > 100 ? "Very High" : rowCount > 50 ? "High" : rowCount > 0 ? "Moderate" : "None"}</b>
          </div>

          <div>
            <span>Most Active Strike</span>
            <b>{spotlight?.strike ?? "--"}</b>
          </div>

          <div>
            <span>Expiration</span>
            <b>{spotlight?.expStr ?? "--"}</b>
          </div>
        </div>
      </section>

      <section className="aiInsightGrid">
        <div className="aiInsightCard">
          <small>TRADE BIAS</small>
          <b>{sentiment}</b>
          <p>
            {query
              ? `${query} currently shows ${sentiment.toLowerCase()} options-flow bias.`
              : "Search a ticker to generate bias."}
          </p>
        </div>

        <div className="aiInsightCard">
          <small>BEST USE</small>
          <b>
            {confidence >= 80
              ? "Trade Candidate"
              : confidence >= 60
              ? "Watch Closely"
              : "Watchlist Only"}
          </b>
          <p>
            {confidence >= 80
              ? "Flow is strong enough to consider a structured setup."
              : confidence >= 60
              ? "Flow is active, but confirmation is still needed."
              : "Not enough conviction for a clean trade plan."}
          </p>
        </div>

        <div className="aiInsightCard">
          <small>RISK WARNING</small>
          <b>
            {confidence >= 80
              ? "Manage Risk"
              : confidence >= 60
              ? "Mixed Risk"
              : "High Risk"}
          </b>
          <p>
            {confidence >= 80
              ? "Do not chase. Wait for entry confirmation and define stop first."
              : confidence >= 60
              ? "Flow can reverse quickly. Size down until confirmation improves."
              : "Weak or no current flow. Avoid forcing a trade."}
          </p>
        </div>

        <div className="aiInsightCard">
          <small>ACTION PLAN</small>
          <b>
            {confidence >= 80
              ? "Plan The Trade"
              : confidence >= 60
              ? "Wait For Trigger"
              : "Stand Aside"}
          </b>
          <p>
            {confidence >= 80
              ? "Use the trade plan above and only enter on confirmation."
              : confidence >= 60
              ? "Monitor price, volume, and additional sweeps before acting."
              : "Add to watchlist. Wait for fresh flow, volume, or catalyst."}
          </p>
        </div>
      </section>
    </main>
  );
}
