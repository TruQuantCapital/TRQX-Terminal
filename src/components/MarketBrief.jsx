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

function calcFlowScore(stats) {
  if (!stats) return "--";
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

  useEffect(() => {
    if (!token) return;
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
        setStats(s);
        setTopContracts(Array.isArray(t) ? t : []);
        setGamma(g);

        // Generate AI market read
        if (s && g) {
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

            const aiRes = await fetch(`${API}/api/ai/chat`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({ message: prompt, history: [] }),
            });
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              setAiRead(aiData.reply || aiData.message || aiData.content || null);
            }
          } catch (e) {
            console.log("AI read failed:", e.message);
          }
        }
      } catch (e) {
        console.error("MarketBrief load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const sentiment = stats?.sentiment || "Neutral";
  const dealerPos = gamma?.dealerPositioning || "--";
  const topTicker = topContracts.length > 0 ? topContracts[0].ticker : "--";
  const topPrem = topContracts.length > 0 ? fmtPrem(topContracts[0].totalPremium || topContracts[0].premium) : "--";
  const topType = topContracts.length > 0 ? (topContracts[0].type === "C" ? "Calls" : "Puts") : "";
  const flowScore = calcFlowScore(stats);
  const regimeColor = sentiment === "Bullish" ? "#22c55e" : sentiment === "Bearish" ? "#ef4444" : "#d4af37";

  // Find next catalyst from economic calendar
  const [catalyst, setCatalyst] = useState("--");
  useEffect(() => {
    fetch(`${API}/api/economic-calendar`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const events = Array.isArray(data) ? data : data.events || data.rows || [];
        const high = events.find(e => e.impact === "High" || e.impact === "high" || e.importance === 3);
        if (high) setCatalyst(high.event || high.name || high.title || "High Impact Event");
      })
      .catch(() => {});
  }, []);

  return (
    <section className="marketBrief">
      <div className="marketBriefHeader">
        <div>
          <small>TRQX MARKET BRIEF</small>
          <h2>Daily Market Intelligence</h2>
        </div>
        <div className="marketRegime" style={{ background: `${regimeColor}20`, border: `1px solid ${regimeColor}60`, color: regimeColor }}>
          <span>{loading ? "LOADING..." : `${sentiment === "Bullish" ? "RISK ON" : sentiment === "Bearish" ? "RISK OFF" : "NEUTRAL"}`}</span>
        </div>
      </div>

      <div className="marketBriefGrid">
        <div>
          <small>Dealer Positioning</small>
          <b style={{ color: dealerPos === "Long Gamma" ? "#22c55e" : "#ef4444" }}>
            {loading ? "..." : dealerPos}
          </b>
        </div>
        <div>
          <small>Top Flow</small>
          <b style={{ color: "#d4af37" }}>
            {loading ? "..." : `${topTicker} ${topPrem} ${topType}`}
          </b>
        </div>
        <div>
          <small>Top Watch</small>
          <b>{loading ? "..." : topTicker}</b>
        </div>
        <div>
          <small>Flow Score</small>
          <b style={{ color: flowScore > 70 ? "#22c55e" : flowScore > 50 ? "#d4af37" : "#ef4444" }}>
            {loading ? "..." : `${flowScore}/100`}
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
          : aiRead
          ? aiRead
          : `Market conditions are ${sentiment.toLowerCase()}. Dealer positioning is ${dealerPos.toLowerCase()} with ${fmtPrem(stats?.callPremium)} in call premium vs ${fmtPrem(stats?.putPremium)} in put premium. Top flow in ${topTicker} â€” watch key gamma levels for continuation.`
        }
      </div>

      <div className="marketBriefActions">
        <button onClick={() => navigate("/scanner")}>View Scanner</button>
        <button onClick={() => navigate("/options-flow")}>View Flow</button>
        <button onClick={() => navigate("/gamma-ex")}>View Gamma</button>
      </div>
    </section>
  );
}
