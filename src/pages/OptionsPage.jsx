import React, { useEffect, useMemo, useState } from "react";
import { OptionsFlowCard } from "../components/Cards";

const API = "https://trqx-flow-scanner-production.up.railway.app";

function fmtPrem(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  if (n >= 1000000000) return `$${(n / 1000000000).toFixed(2)}B`;
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

function openTradePlan(ticker) {
  if (!ticker) return;
  window.location.href = `/trade-plan?ticker=${String(ticker).toUpperCase()}`;
}

export default function OptionsPage() {
  const [stats, setStats] = useState(null);
  const [top, setTop] = useState([]);
  const [history, setHistory] = useState([]);
  const [ticker, setTicker] = useState("");
  const [tickerData, setTickerData] = useState(null);

  useEffect(() => {
    async function fetchFlowData() {
      try {
        const [statsRes, topRes, historyRes] = await Promise.all([
          fetch(`${API}/api/flow/stats`),
          fetch(`${API}/api/flow/top-contracts`),
          fetch(`${API}/api/flow/history`),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (topRes.ok) setTop(await topRes.json());

        if (historyRes.ok) {
          const data = await historyRes.json();
          setHistory(Array.isArray(data?.rows) ? data.rows : []);
        }
      } catch (err) {
        console.warn("Flow data fallback loaded:", err);
      }
    }

    fetchFlowData();
    const interval = setInterval(fetchFlowData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchTickerData() {
      const q = ticker.trim().toUpperCase();

      if (!q) {
        setTickerData(null);
        return;
      }

      try {
        const res = await fetch(`${API}/api/flow/ticker/${q}`);
        if (!res.ok) return;

        const data = await res.json();
        setTickerData(data);
      } catch (err) {
        console.warn("Ticker lookup failed", err);
      }
    }

    const timeout = setTimeout(fetchTickerData, 400);
    return () => clearTimeout(timeout);
  }, [ticker]);

  const query = ticker.trim().toUpperCase();

  const searchBase = useMemo(() => {
    const map = new Map();

    [...history, ...top].forEach((row) => {
      const key = `${row.ticker}-${row.type}-${row.strike}-${row.expStr}-${row.premium}-${row.ts}`;
      map.set(key, row);
    });

    return [...map.values()];
  }, [history, top]);

  const tickerRows = useMemo(() => {
    if (tickerData?.rows?.length) return tickerData.rows;
    if (!query) return searchBase;

    return searchBase.filter(
      (r) => String(r.ticker || "").toUpperCase() === query
    );
  }, [searchBase, query, tickerData]);

  const callPremium =
    tickerData?.callPremium ??
    tickerRows
      .filter((r) => r.type === "C")
      .reduce((sum, r) => sum + Number(r.premium || 0), 0);

  const putPremium =
    tickerData?.putPremium ??
    tickerRows
      .filter((r) => r.type === "P")
      .reduce((sum, r) => sum + Number(r.premium || 0), 0);

  const ratio =
    tickerData?.ratio ??
    (putPremium > 0
      ? (callPremium / putPremium).toFixed(2)
      : callPremium > 0
      ? "CALL HEAVY"
      : "--");

  const goldenCount =
    tickerData?.goldenCount ?? tickerRows.filter((r) => r.isGolden).length;

  const spotlight =
    tickerData?.spotlight ??
    (tickerRows.length
      ? [...tickerRows].sort(
          (a, b) => Number(b.premium || 0) - Number(a.premium || 0)
        )[0]
      : top[0]);

  const sentiment =
    tickerData?.sentiment ??
    (callPremium > putPremium
      ? "Bullish"
      : putPremium > callPremium
      ? "Bearish"
      : stats?.sentiment ?? "--");

  const confidenceScore = (() => {
    const total = Number(callPremium || 0) + Number(putPremium || 0);
    if (!query || total === 0) return 0;

    const directionalStrength =
      sentiment === "Bullish"
        ? callPremium / total
        : sentiment === "Bearish"
        ? putPremium / total
        : 0.5;

    const premiumScore = directionalStrength * 60;
    const goldenScore = Math.min(goldenCount * 0.25, 25);
    const flowScore = Math.min(Number(spotlight?.flowScore || 0) * 1.5, 15);

    return Math.round(Math.min(100, premiumScore + goldenScore + flowScore));
  })();

  const confidenceLabel =
    confidenceScore >= 90
      ? "Extreme Conviction"
      : confidenceScore >= 80
      ? "Strong Conviction"
      : confidenceScore >= 65
      ? "Active Bias"
      : confidenceScore >= 50
      ? "Developing"
      : confidenceScore > 0
      ? "Weak Signal"
      : "Search Ticker";

  const bullishLeaders = top
    .filter((x) => x.sentiment === "bullish")
    .slice(0, 5);

  const bearishLeaders = top
    .filter((x) => x.sentiment === "bearish")
    .slice(0, 5);

  return (
    <main className="pageStack">
      <section className="pageHeader">
        <div>
          <p>TRQX MODULE</p>
          <h1>Options Flow</h1>
          <span>
            Sweeps, dark pool, unusual premium, call/put bias, and ticker-level
            flow.
          </span>
        </div>

        <div className="flowProviderBadge">
          <span className="liveDot"></span>
          LIVE OPTIONS FLOW
        </div>
      </section>

      <section className="flowQuickStats">
        <div className="flowMiniCard bullish">
          <small>CALL PREMIUM</small>
          <b>{fmtPrem(query ? callPremium : stats?.callPremium)}</b>
          <span>{query || "Market-wide"} calls</span>
        </div>

        <div className="flowMiniCard bearish">
          <small>PUT PREMIUM</small>
          <b>{fmtPrem(query ? putPremium : stats?.putPremium)}</b>
          <span>{query || "Market-wide"} puts</span>
        </div>

        <div className="flowMiniCard gold">
          <small>GOLDEN SWEEPS</small>
          <b>{query ? goldenCount : top.filter((r) => r.isGolden).length}</b>
          <span>High-value flow</span>
        </div>

        <div className="flowMiniCard">
          <small>CALL / PUT RATIO</small>
          <b>{query ? ratio : stats?.ratio ?? "--"}</b>
          <span>{sentiment}</span>
        </div>

        <div className="flowMiniCard">
          <small>UNUSUAL FLOW</small>
          <b>{query ? tickerRows.length : stats?.unusualCount ?? "--"}</b>
          <span>{query ? "Matching prints" : "Detected prints"}</span>
        </div>
      </section>

      <section className="flowCommandCenter">
        <div>
          <small>FLOW COMMAND CENTER</small>
          <h2>{sentiment}</h2>
          <p>
            {query && tickerRows.length === 0
              ? `No current ${query} flow found — showing latest market-wide spotlight.`
              : query
              ? `${query} spotlight based on current flow history.`
              : "Search a ticker to isolate flow, premium, golden sweeps, and flow score."}
          </p>
        </div>

        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Search ticker: CRM, SPY, NVDA, TSLA..."
        />

        <div className="spotlightBox">
          <small>TICKER SPOTLIGHT</small>
          <b>{spotlight?.ticker ?? "--"}</b>
          <span>
            {spotlight
              ? `${spotlight.type === "C" ? "CALL" : "PUT"} ${
                  spotlight.strike
                } • ${fmtPrem(spotlight.premium)} • Score ${
                  spotlight.flowScore ?? "--"
                }/10`
              : "No spotlight data"}
          </span>

          {spotlight?.ticker && (
            <button
              className="tradePlanBtn spotlightTradeBtn"
              onClick={() => openTradePlan(spotlight.ticker)}
            >
              Generate Trade Plan
            </button>
          )}
        </div>
      </section>

      <section className="smartMoneySection">
        <div className="smartMoneyCard">
          <small>TOP BULLISH FLOW</small>

          {bullishLeaders.length ? (
            bullishLeaders.map((x, i) => (
              <div key={`${x.ticker}-${i}`} className="leaderRow">
                <span>{x.ticker}</span>

                <div className="flowActions">
                  <b>{x.flowScore || 0}/10</b>

                  <button
                    className="tradePlanBtn"
                    onClick={() => openTradePlan(x.ticker)}
                  >
                    Trade Plan
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="emptyFlowText">No bullish flow yet.</p>
          )}
        </div>

        <div className="smartMoneyCard">
          <small>TOP BEARISH FLOW</small>

          {bearishLeaders.length ? (
            bearishLeaders.map((x, i) => (
              <div key={`${x.ticker}-${i}`} className="leaderRow">
                <span>{x.ticker}</span>

                <div className="flowActions">
                  <b>{x.flowScore || 0}/10</b>

                  <button
                    className="tradePlanBtn"
                    onClick={() => openTradePlan(x.ticker)}
                  >
                    Trade Plan
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="emptyFlowText">No bearish flow yet.</p>
          )}
        </div>

        <div className="smartMoneyCard aiCard">
          <small>TRQX AI TRADE SETUP</small>

          <h3>{query || "SEARCH A TICKER"}</h3>

          <div className="confidenceBox">
            <div className="confidenceTop">
              <span>TRQX CONFIDENCE</span>
              <b>{confidenceScore}/100</b>
            </div>

            <div className="confidenceTrack">
              <div
                className="confidenceFill"
                style={{ width: `${confidenceScore}%` }}
              ></div>
            </div>

            <small>{confidenceLabel}</small>
          </div>

          <div className="aiMetric">
            <span>Bias</span>
            <b>{sentiment}</b>
          </div>

          <div className="aiMetric">
            <span>Call Premium</span>
            <b>{fmtPrem(callPremium)}</b>
          </div>

          <div className="aiMetric">
            <span>Put Premium</span>
            <b>{fmtPrem(putPremium)}</b>
          </div>

          <div className="aiMetric">
            <span>Golden Sweeps</span>
            <b>{goldenCount}</b>
          </div>

          <div className="aiMetric">
            <span>Flow Score</span>
            <b>{spotlight?.flowScore || "--"}/10</b>
          </div>

          <div className="aiMetric">
            <span>Largest Position</span>
            <b>{fmtPrem(spotlight?.premium)}</b>
          </div>

          <p className="aiConclusion">
            <strong>TRQX Verdict:</strong>
            <br />
            {query
              ? `${query} currently shows ${sentiment.toLowerCase()} institutional positioning based on premium flow, sweep activity, and smart-money participation.`
              : "Search a ticker to generate an AI trade setup."}
          </p>

          {query && (
            <button
              className="tradePlanBtn aiTradeBtn"
              onClick={() => openTradePlan(query)}
            >
              Generate Full Trade Plan
            </button>
          )}
        </div>
      </section>

      <OptionsFlowCard full />
    </main>
  );
}