import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API = import.meta.env.VITE_API_URL || "https://trqx-flow-scanner-production.up.railway.app";

function fmtPrem(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

// True only when the stats payload contains actual session flow.
// Prevents every derived metric below from fabricating confidence
// out of an empty dataset (closed market / fresh cache).
function statsHaveData(s) {
  if (!s) return false;
  return (
    Number(s.callPremium) > 0 ||
    Number(s.putPremium) > 0 ||
    Number(s.sweepCount) > 0 ||
    Number(s.blockCount) > 0 ||
    Number(s.unusualCount) > 0
  );
}

function calcFlowScore(stats) {
  // No data → no score. The old baseline of 50 meant an EMPTY market
  // scored "50/100", which is a fabricated number.
  if (!statsHaveData(stats)) return null;
  const ratio = Number(stats.ratio) || 1;
  const sweeps = stats.sweepCount || 0;
  const total = (stats.sweepCount || 0) + (stats.blockCount || 0) + (stats.unusualCount || 0);
  let score = 50;
  if (ratio > 1.5) score += 20;
  else if (ratio > 1.2) score += 10;
  else if (ratio < 0.8) score -= 20;
  else if (ratio < 0.67) score -= 10;
  if (sweeps > 10) score += 15;
  else if (sweeps > 5) score += 8;
  if (total > 30) score += 10;
  return Math.min(99, Math.max(1, Math.round(score)));
}

export default function MarketBrief() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [topContracts, setTopContracts] = useState([]);
  const [gamma, setGamma] = useState(null);
  const [aiRead, setAiRead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catalyst, setCatalyst] = useState("--");

  // Next high-impact catalyst from the economic calendar.
  useEffect(() => {
    fetch(`${API}/api/economic-calendar`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return;
        const events = Array.isArray(data) ? data : data.events || data.rows || [];
        const high = events.find(e => e.impact === "High" || e.impact === "high" || e.importance === 3);
        if (high) setCatalyst(high.event || high.name || high.title || "High Impact Event");
      })
      .catch(() => {});
  }, []);

  // Flow stats + gamma + AI read.
  // Depends on [token]: the old empty-deps version bailed when the token
  // hadn't resolved at mount and then NEVER ran again.
  useEffect(() => {
    if (!token) return;
    let disposed = false;

    async function load() {
      try {
        const [statsRes, topRes, gammaRes] = await Promise.all([
          fetch(`${API}/api/flow/stats`),
          fetch(`${API}/api/flow/top-contracts`),
          fetch(`${API}/api/gamma?ticker=SPY`),
        ]);
        const s = statsRes.ok ? await statsRes.json() : null;
        const t = topRes.ok ? await topRes.json() : [];
        const g = gammaRes.ok ? await gammaRes.json() : null;
        if (disposed) return;
        setStats(s);
        setTopContracts(Array.isArray(t) ? t : []);
        setGamma(g);

        // AI market read — ONLY during a live session with real data.
        // Narrating an empty closed market burns an Anthropic call per
        // dashboard viewer per minute for zero information.
        const live = s?.session !== "closed";
        if (s && g && live && statsHaveData(s)) {
          try {
            const topTicker = Array.isArray(t) && t.length > 0 ? t[0].ticker : "SPY";
            const topPrem = Array.isArray(t) && t.length > 0 ? t[0].totalPremium || t[0].premium : 0;
            const prompt = `You are a professional market analyst for TRQX Capital, a trading terminal. Write a concise 2-sentence market brief for traders based on this live data:

Flow Sentiment: ${s.sentiment}
Call Premium: ${fmtPrem(s.callPremium)} | Put Premium: ${fmtPrem(s.putPremium)}
Sweeps: ${s.sweepCount} | Blocks: ${s.blockCount} | Unusual: ${s.unusualCount}
Dealer Positioning: ${g.dealerPositioning}
Top Flow: ${topTicker} ${fmtPrem(topPrem)}
Gamma Flip: ${g.gammaFlip} | Call Wall: ${g.callWall} | Put Wall: ${g.putWall}

Write exactly 2 sentences. Be specific, professional, and actionable. Reference actual tickers and levels. No fluff.`;

            try {
  const aiRes = await fetch(`${API}/api/market-intelligence`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });

  const aiData = await aiRes.json();

  console.log("Market Intelligence:", aiData);

  if (!aiRes.ok) {
    console.error("AI Error:", aiData);
    setAiRead(null);
  } else {
    const reply = (aiData.reply || "").trim();

    if (reply.length > 0) {
      setAiRead(reply);
    } else {
      console.warn("AI returned an empty reply.");
      setAiRead(null);
    }
  }
} catch (err) {
  console.error("Market Intelligence Failed:", err);
  setAiRead(null);
}
          } catch (e) {
            console.log("AI read failed:", e.message);
          }
        } else if (!live || !statsHaveData(s)) {
          setAiRead(null);
        }
      } catch (e) {
        console.error("MarketBrief load error:", e);
      } finally {
        if (!disposed) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 60000); // refresh every 60s
    return () => { disposed = true; clearInterval(interval); };
  }, [token]);

  const hasData = statsHaveData(stats);
  const marketClosed = stats?.session === "closed";
  const noLiveData = marketClosed && !hasData;

  const sentiment = stats?.sentiment || "Neutral";
  const dealerPos = hasData ? (gamma?.dealerPositioning || "--") : "--";
  const topTicker = hasData && topContracts.length > 0 ? topContracts[0].ticker : "--";
  const topPrem = hasData && topContracts.length > 0 ? fmtPrem(topContracts[0].totalPremium || topContracts[0].premium) : "--";
  const topType = hasData && topContracts.length > 0 ? (topContracts[0].type === "C" ? "Calls" : "Puts") : "";
  const flowScore = calcFlowScore(stats);

  const regimeColor = noLiveData
    ? "#9ca3af"
    : sentiment === "Bullish" ? "#22c55e"
    : sentiment === "Bearish" ? "#ef4444"
    : "#d4af37";

  const regimeLabel = loading
    ? "LOADING..."
    : noLiveData
    ? "MARKET CLOSED"
    : marketClosed
    ? `PREV SESSION — ${sentiment === "Bullish" ? "RISK ON" : sentiment === "Bearish" ? "RISK OFF" : "NEUTRAL"}`
    : sentiment === "Bullish" ? "RISK ON"
    : sentiment === "Bearish" ? "RISK OFF"
    : "NEUTRAL";

  // Honest read for every state. The fallback used to contain a
  // mojibake-corrupted em-dash ("â€\"") baked into the source string.
  const fallbackRead = noLiveData
    ? "Markets are closed — live flow intelligence resumes at 9:30 AM ET. Economic Calendar, Academy, Research & Capital Allocator are fully open."
    : marketClosed
    ? `Markets are closed — showing the last completed session (${stats?.sessionDate || "previous session"}): ${sentiment.toLowerCase()} flow with ${fmtPrem(stats?.callPremium)} in call premium vs ${fmtPrem(stats?.putPremium)} in put premium. Live flow resumes at 9:30 AM ET.`
    : `Market conditions are ${sentiment.toLowerCase()}. Dealer positioning is ${dealerPos.toLowerCase()} with ${fmtPrem(stats?.callPremium)} in call premium vs ${fmtPrem(stats?.putPremium)} in put premium. Top flow in ${topTicker} — watch key gamma levels for continuation.`;

  return (
    <section className="marketBrief">
      <div className="marketBriefHeader">
        <div>
          <small>TRQX MARKET BRIEF</small>
          <h2>Daily Market Intelligence</h2>
        </div>
        <div className="marketRegime" style={{ background: `${regimeColor}20`, border: `1px solid ${regimeColor}60`, color: regimeColor }}>
          <span>{regimeLabel}</span>
        </div>
      </div>

      <div className="marketBriefGrid">
        <div>
          <small>Dealer Positioning</small>
          <b style={{ color: dealerPos === "Long Gamma" ? "#22c55e" : dealerPos === "Short Gamma" ? "#ef4444" : "#9ca3af" }}>
            {loading ? "..." : dealerPos}
          </b>
        </div>
        <div>
          <small>Top Flow</small>
          <b style={{ color: "#d4af37" }}>
            {loading ? "..." : topTicker === "--" ? "--" : `${topTicker} ${topPrem} ${topType}`}
          </b>
        </div>
        <div>
          <small>Top Watch</small>
          <b>{loading ? "..." : topTicker}</b>
        </div>
        <div>
          <small>Flow Score</small>
          <b style={{ color: flowScore == null ? "#9ca3af" : flowScore > 70 ? "#22c55e" : flowScore > 50 ? "#d4af37" : "#ef4444" }}>
            {loading ? "..." : flowScore == null ? "--" : `${flowScore}/100`}
          </b>
        </div>
        <div>
          <small>Flow Sentiment</small>
          <b style={{ color: regimeColor }}>{loading ? "..." : sentiment}</b>
        </div>
        <div>
          <small>Key Catalyst</small>
          <b>{loading ? "..." : catalyst}</b>
        </div>
      </div>

      <div className="marketBriefRead">
        <strong>TRQX Read:</strong>{" "}
        {loading
          ? "Loading market intelligence..."
          : aiRead && hasData && !marketClosed
          ? aiRead
          : fallbackRead}
      </div>

      <div className="marketBriefActions">
        <button onClick={() => navigate("/scanner")}>View Scanner</button>
        <button onClick={() => navigate("/options-flow")}>View Flow</button>
        <button onClick={() => navigate("/gamma-ex")}>View Gamma</button>
      </div>
    </section>
  );
}
