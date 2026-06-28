import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Waves, Crown, ExternalLink } from "lucide-react";
import DataTable from "./DataTable";
import {
  economicRows,
  gammaMetrics,
  optionsFlowRows,
  scannerRows,
} from "../data/mockData";

const API = "https://trqx-flow-scanner-production.up.railway.app";

export function GaugeCard() {
  const [stats, setStats] = useState(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${API}/api/flow/stats`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setStats(data);
      } catch {}
    }
    fetchStats();
    const t = setInterval(fetchStats, 15000);

    // Update clock
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }));
    };
    tick();
    const clock = setInterval(tick, 60000);

    return () => { clearInterval(t); clearInterval(clock); };
  }, []);

  const ratio = stats?.ratio ?? 1;
  const callPrem = stats?.callPremium ?? 0;
  const putPrem = stats?.putPremium ?? 0;
  const sweeps = stats?.sweepCount ?? 0;
  const blocks = stats?.blockCount ?? 0;

  const rawScore = Math.min(100, Math.max(0, Math.round(
    (ratio / (ratio + 1)) * 60 +
    (sweeps > 50 ? 20 : sweeps > 20 ? 10 : 0) +
    (blocks > 30 ? 20 : blocks > 10 ? 10 : 0)
  )));

  const regime = ratio > 1.3 ? "RISK ON" : ratio < 0.75 ? "RISK OFF" : "NEUTRAL";
  const regimeColor = regime === "RISK ON" ? "#22c55e" : regime === "RISK OFF" ? "#ef4444" : "#d4af37";
  const regimeBg = regime === "RISK ON" ? "rgba(34,197,94,0.1)" : regime === "RISK OFF" ? "rgba(239,68,68,0.1)" : "rgba(212,175,55,0.1)";
  const regimeIcon = regime === "RISK ON" ? "🐂" : regime === "RISK OFF" ? "🐻" : "⚖️";
  const regimeDesc = regime === "RISK ON"
    ? "Favorable conditions. Strong momentum and risk appetite in the market."
    : regime === "RISK OFF"
    ? "Defensive conditions. Increased volatility and lower risk appetite in the market."
    : "Mixed conditions. Market in transition — proceed with caution.";

  const breadthPct = ratio > 1 ? Math.min(99, Math.round(50 + (ratio - 1) * 30)) : Math.max(1, Math.round(50 - (1 - ratio) * 30));
  const breadthLabel = breadthPct > 60 ? "Strong" : breadthPct > 40 ? "Moderate" : "Weak";
  const volatility = sweeps > 80 ? "High" : sweeps > 40 ? "Moderate" : "Low";
  const volatilityTrend = sweeps > 80 ? "Elevated" : sweeps > 40 ? "Rising" : "Stable";
  const momentum = ratio > 1.2 ? "Bullish" : ratio < 0.8 ? "Bearish" : "Neutral";
  const momentumLabel = ratio > 1.2 ? "Strong" : ratio < 0.8 ? "Weak" : "Mixed";

  // SVG Gauge
  const size = 200;
  const cx = size / 2;
  const cy = size / 2 + 15;
  const r = 78;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const scoreAngle = startAngle + (rawScore / 100) * totalAngle;

  function polarToXY(angle, radius) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(start, end, radius) {
    const s = polarToXY(start, radius);
    const e = polarToXY(end, radius);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  // Color segments
  const segments = [
    { start: startAngle, end: startAngle + totalAngle * 0.33, color: "#22c55e" },
    { start: startAngle + totalAngle * 0.33, end: startAngle + totalAngle * 0.66, color: "#d4af37" },
    { start: startAngle + totalAngle * 0.66, end: endAngle, color: "#ef4444" },
  ];

  const needleTip = polarToXY(scoreAngle, r - 12);
  const needleBase1 = polarToXY(scoreAngle + 90, 7);
  const needleBase2 = polarToXY(scoreAngle - 90, 7);

  // Key drivers
  const vix = sweeps > 80 ? 28.4 : sweeps > 40 ? 18.2 : 13.1;
  const vixChange = sweeps > 80 ? "+12.1%" : sweeps > 40 ? "+4.2%" : "-2.1%";
  const putCall = (putPrem / (callPrem + putPrem + 1)).toFixed(2);

  const keyDrivers = [
    { label: "VIX", sub: "Volatility Index", value: vix.toFixed(1), change: vixChange, changeColor: sweeps > 40 ? "#ef4444" : "#22c55e" },
    { label: "SPY TREND", sub: "vs 20 DMA", value: ratio > 1.1 ? "Above" : "Below", change: ratio > 1.1 ? "+1.2%" : "-1.2%", changeColor: ratio > 1.1 ? "#22c55e" : "#ef4444" },
    { label: "BREADTH", sub: "Advancing Stocks", value: `${breadthPct}%`, change: breadthLabel, changeColor: breadthPct > 50 ? "#22c55e" : "#d4af37" },
    { label: "PUT/CALL RATIO", sub: "Options Sentiment", value: putCall, change: Number(putCall) > 1 ? "High" : "Normal", changeColor: Number(putCall) > 1 ? "#ef4444" : "#22c55e" },
    { label: "DEALER GAMMA", sub: "Positioning", value: ratio > 1.1 ? "LONG" : "SHORT", change: ratio > 1.1 ? "Positive" : "Negative", changeColor: ratio > 1.1 ? "#22c55e" : "#ef4444" },
  ];

  // Trading style
  const tradeStyles = regime === "RISK ON"
    ? [
        { label: "Momentum Longs", desc: "Ride strong trending names", ok: true },
        { label: "Breakout Trades", desc: "High momentum setups", ok: true },
        { label: "Defensive Plays", desc: "Avoid low-beta names", ok: false },
        { label: "Oversized Positions", desc: "Keep risk tight", ok: false },
      ]
    : regime === "RISK OFF"
    ? [
        { label: "Quick Scalps", desc: "Take profits fast", ok: true },
        { label: "Defensive Swing Trades", desc: "Focus on strong setups", ok: true },
        { label: "Aggressive Longs", desc: "Avoid chasing strength", ok: false },
        { label: "Oversized Positions", desc: "Keep risk tight", ok: false },
      ]
    : [
        { label: "Range Trades", desc: "Buy support, sell resistance", ok: true },
        { label: "Small Size", desc: "Reduce position sizing", ok: true },
        { label: "Trend Following", desc: "No clear trend yet", ok: false },
        { label: "Full Risk", desc: "Wait for confirmation", ok: false },
      ];

  const focusLabel = regime === "RISK ON" ? "FOCUS: MOMENTUM" : regime === "RISK OFF" ? "FOCUS: CAPITAL PRESERVATION" : "FOCUS: PATIENCE";
  const focusDesc = regime === "RISK ON" ? "Push winners. Stay in strong names." : regime === "RISK OFF" ? "Protect your account. Wait for best setups." : "Let the market tip its hand before committing.";

  const playbook = regime === "RISK ON"
    ? ["Size into Winners", "Hold Runners", "Trail Stops", "Add on Pullbacks"]
    : regime === "RISK OFF"
    ? ["Smaller Size", "Faster Profits", "Respect Stops", "Wait For A+ Setups"]
    : ["Reduce Exposure", "Tighten Stops", "Take Quick Profits", "Stay Selective"];

  return (
    <section className="card regime" style={{ padding: 0, overflow: "hidden", background: "#0a0f1a", border: "1px solid rgba(255,255,255,0.08)" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", fontFamily: "var(--font-head)" }}>MARKET REGIME</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>⏱</span> LAST UPDATED: {time}
        </div>
      </div>

      {/* Regime Hero */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: regimeBg, border: `1px solid ${regimeColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0 }}>
          {regimeIcon}
        </div>
        <div>
          <div style={{ color: regimeColor, fontSize: "28px", fontWeight: 900, fontFamily: "var(--font-head)", letterSpacing: "2px", lineHeight: 1 }}>{regime}</div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", marginTop: "4px", lineHeight: 1.5, maxWidth: "400px" }}>{regimeDesc}</div>
        </div>
      </div>

      {/* 4 Metric Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {[
          { label: "BREADTH", value: `${breadthPct}%`, sub: breadthLabel, color: breadthPct > 50 ? "#22c55e" : "#d4af37" },
          { label: "VOLATILITY", value: volatility, sub: volatilityTrend, color: volatility === "High" ? "#ef4444" : volatility === "Moderate" ? "#d4af37" : "#22c55e" },
          { label: "MOMENTUM", value: momentum, sub: momentumLabel, color: regimeColor },
          { label: "REGIME SCORE", value: rawScore, sub: regime, color: regimeColor },
        ].map((m, i) => (
          <div key={i} style={{ padding: "14px 16px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", fontFamily: "var(--font-head)", marginBottom: "6px" }}>{m.label}</div>
            <div style={{ color: m.color, fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-head)", lineHeight: 1 }}>{m.value}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "3px" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Main 3-column body */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 220px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Gauge */}
        <div style={{ padding: "20px 16px", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg viewBox={`0 0 ${size} ${size}`} width="180" height="180">
            {/* Tick marks */}
            {Array.from({ length: 11 }).map((_, i) => {
              const angle = startAngle + (i / 10) * totalAngle;
              const inner = polarToXY(angle, r - 14);
              const outer = polarToXY(angle, r - 6);
              return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />;
            })}
            {/* Colored arc segments */}
            {segments.map((seg, i) => (
              <path key={i} d={arcPath(seg.start, seg.end, r)} fill="none" stroke={seg.color} strokeWidth="12" strokeLinecap="butt" opacity="0.25" />
            ))}
            {/* Score arc overlay */}
            <path d={arcPath(startAngle, scoreAngle, r)} fill="none" stroke={regimeColor} strokeWidth="12" strokeLinecap="round" />
            {/* Labels */}
            {[{ val: "0", angle: startAngle + 5 }, { val: "50", angle: startAngle + totalAngle / 2 }, { val: "100", angle: endAngle - 5 }].map((lbl, i) => {
              const pos = polarToXY(lbl.angle, r - 26);
              return <text key={i} x={pos.x} y={pos.y} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.35)" fontFamily="monospace">{lbl.val}</text>;
            })}
            {/* Needle */}
            <polygon points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`} fill={regimeColor} opacity="0.95" />
            <circle cx={cx} cy={cy} r="7" fill="#0a0f1a" stroke={regimeColor} strokeWidth="2" />
            {/* Score */}
            <text x={cx} y={cy + 28} textAnchor="middle" fontSize="30" fontWeight="800" fill="white" fontFamily="monospace">{rawScore}</text>
            <text x={cx} y={cy + 42} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.4)" fontFamily="monospace">/100</text>
            <text x={cx} y={cy + 56} textAnchor="middle" fontSize="11" fontWeight="800" fill={regimeColor} fontFamily="monospace">{regime}</text>
          </svg>

          {/* TRQX Interpretation box */}
          <div style={{ width: "100%", background: `${regimeColor}10`, border: `1px solid ${regimeColor}30`, borderRadius: "10px", padding: "12px 14px", marginTop: "4px" }}>
            <div style={{ color: regimeColor, fontSize: "10px", fontWeight: 800, letterSpacing: "1px", fontFamily: "var(--font-head)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              💡 TRQX INTERPRETATION
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
              {(regime === "RISK OFF"
                ? ["Favor defensive positioning", "Expect increased volatility", "Reduce position size", "Focus on A+ setups only"]
                : regime === "RISK ON"
                ? ["Add to winning positions", "Favor momentum names", "Increase position size", "Ride breakouts higher"]
                : ["Reduce overall exposure", "Wait for confirmation", "Trade smaller size", "Focus on key levels"]
              ).map((tip, i) => (
                <div key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", lineHeight: 1.5 }}>• {tip}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Drivers */}
        <div style={{ padding: "20px", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", fontFamily: "var(--font-head)", marginBottom: "14px" }}>KEY DRIVERS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {keyDrivers.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                    {["📊", "📈", "👥", "🔄", "⚡"][i]}
                  </div>
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: 700 }}>{d.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>{d.sub}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: d.changeColor, fontSize: "15px", fontWeight: 800 }}>{d.value}</div>
                  <div style={{ color: d.changeColor, fontSize: "10px", fontWeight: 600 }}>{d.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Style + Playbook */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", fontFamily: "var(--font-head)", marginBottom: "12px" }}>PREFERRED TRADING STYLE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {tradeStyles.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: s.ok ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${s.ok ? "#22c55e" : "#ef4444"}60`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                    <span style={{ fontSize: "10px" }}>{s.ok ? "✓" : "✗"}</span>
                  </div>
                  <div>
                    <div style={{ color: s.ok ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 700 }}>{s.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Focus box */}
            <div style={{ marginTop: "12px", background: `${regimeColor}10`, border: `1px solid ${regimeColor}30`, borderRadius: "8px", padding: "10px 12px" }}>
              <div style={{ color: regimeColor, fontSize: "10px", fontWeight: 800, letterSpacing: "1px", fontFamily: "var(--font-head)", marginBottom: "3px" }}>🎯 {focusLabel}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", lineHeight: 1.5 }}>{focusDesc}</div>
            </div>
          </div>

          {/* Playbook */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px" }}>
            <div style={{ color: regimeColor, fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-head)", marginBottom: "10px" }}>📋 {regime} PLAYBOOK</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {playbook.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: regimeColor, fontSize: "12px" }}>⊙</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>RISK ON</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#d4af37" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>NEUTRAL</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>RISK OFF</span>
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", fontFamily: "var(--font-head)", letterSpacing: "1px" }}>
          PRECISION. DISCIPLINE. <span style={{ color: regimeColor }}>EXECUTION.</span>
        </div>
      </div>
    </section>
  );
}

export function CalendarCard() {
  const navigate = useNavigate();
  return (
    <section className="card calendar">
      <div className="cardTitle">Economic Calendar</div>
      <div style={{ height: "320px", borderRadius: "8px", overflow: "hidden", marginBottom: "10px" }}>
        <iframe
          src="https://s.tradingview.com/embed-widget/events/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22importanceFilter%22%3A%220%2C1%22%2C%22countryFilter%22%3A%22us%22%7D"
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Economic Calendar"
        />
      </div>
      <a onClick={() => navigate("/economic-calendar")} style={{ cursor: "pointer" }}>View Full Calendar ?</a>
    </section>
  );
}

export function AiSummary() {
  const [analysis, setAnalysis] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const API = "https://trqx-flow-scanner-production.up.railway.app";

  React.useEffect(() => {
    async function load() {
      try {
        const [calRes, flowRes] = await Promise.all([
          fetch(API + "/api/economic-calendar"),
          fetch(API + "/api/flow/stats"),
        ]);
        const cal = calRes.ok ? await calRes.json() : [];
        const flow = flowRes.ok ? await flowRes.json() : {};
        const events = Array.isArray(cal) ? cal : cal.value || cal.rows || [];
        const topEvents = events.slice(0, 5).map(function(e) {
          return Array.isArray(e)
            ? e[0] + " - " + e[1] + " (Impact: " + e[2] + ", Actual: " + e[3] + ", Forecast: " + e[4] + ")"
            : e.time + " - " + e.event;
        }).join(", ");

        const eventText = topEvents || "No major economic events scheduled today.";
        const callM = Math.round((flow.callPremium||0)/1000000);
const putM = Math.round((flow.putPremium||0)/1000000);
const ratio = callM > 0 && putM > 0 ? (callM / putM).toFixed(2) : "N/A";
const sentiment = flow.sentiment || "Neutral";
const sweeps = flow.sweepCount || 0;
const blocks = flow.blockCount || 0;

const prompt = `You are a professional market analyst at TRQX Capital delivering a pre-market intelligence brief to active traders.

LIVE OPTIONS FLOW DATA:
- Flow Sentiment: ${sentiment}
- Call Premium: $${callM}M | Put Premium: $${putM}M | Call/Put Ratio: ${ratio}
- Sweep Count: ${sweeps} | Block Count: ${blocks}
- Bias: ${callM > putM ? "Bullish — institutions are aggressively buying calls" : putM > callM ? "Bearish — institutions are hedging or buying puts" : "Neutral — balanced flow"}

ECONOMIC CALENDAR (Today & Next 48 Hours):
${eventText}

Write a detailed pre-market brief using ONLY plain text — no markdown, no hashtags, no asterisks, no bullet symbols other than a dash.

Structure your response exactly as follows:

MARKET OVERVIEW
Write 3 sentences summarizing current market conditions combining the options flow data and economic calendar context.

FLOW ANALYSIS
Write 2 sentences explaining what the institutional options flow is signaling and what it means for traders today.

KEY EVENTS TO WATCH
List each major economic event with its forecast vs prior value and explain in one sentence what a surprise in either direction would mean for markets. Format each as: EVENT NAME - Forecast: X, Prior: Y. Impact: [your interpretation]

TRADE BIAS
State clearly: BULLISH, BEARISH, or NEUTRAL. Then write 2 sentences explaining why based on the combination of flow data and upcoming events.

WATCH LIST ITEMS
List exactly 4 specific things traders should monitor today, each starting with a dash. Be specific — name tickers, levels, or indicators where relevant.

RISK FACTORS
List 2 things that could invalidate the current bias, each starting with a dash.`;

        const aiRes = await fetch(API + "/api/market-intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (aiRes.ok) {
          const data = await aiRes.json();
          setAnalysis(data.reply || null);
        }
        console.log("AiSummary error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const textLines = analysis ? analysis.split("\n").filter(function(l) { return l.trim(); }) : [];
  const isBullish = analysis && analysis.toLowerCase().includes("bullish");
  const isBearish = analysis && analysis.toLowerCase().includes("bearish");
  const sentimentColor = isBullish ? "#22c55e" : isBearish ? "#ef4444" : "#d4af37";
  const sentimentLabel = isBullish ? "BULLISH" : isBearish ? "BEARISH" : "NEUTRAL";

  return (
    <section className="card ai">
      <div className="cardTitle purple">
        Market Intelligence <span>TRQX AI</span>
      </div>
      {loading ? (
        <p style={{ color: "#9ca3af", fontSize: "13px" }}>Analyzing today's economic events...</p>
      ) : analysis ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ background: sentimentColor + "20", border: "1px solid " + sentimentColor + "60", color: sentimentColor, fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "6px", letterSpacing: "0.08em" }}>
              {sentimentLabel}
            </span>
            <span style={{ color: "#9ca3af", fontSize: "11px" }}>for equities today</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {textLines.map(function(line, i) {
  const clean = line
    .replace(/^#{1,3}\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/^[-•*]\s*/, "")
    .replace(/^\d\.\s*/, "")
    .trim();
  if (!clean || clean === "-") return null;
  const isHeader = line.startsWith("#") || line.startsWith("**");
  const isBullet = line.trimStart().startsWith("-") || line.trimStart().startsWith("•") || line.trimStart().startsWith("*") || /^\d\./.test(line.trimStart());
  if (isHeader) return (
    <b key={i} style={{ color: "#f5f1e8", fontSize: "13px", display: "block", marginTop: "10px", marginBottom: "4px" }}>{clean}</b>
  );
  if (isBullet) return (
    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "4px" }}>
      <span style={{ color: sentimentColor, fontSize: "12px", marginTop: "2px", flexShrink: 0 }}>•</span>
      <span style={{ color: "#9ca3af", fontSize: "13px", lineHeight: "1.5" }}>{clean}</span>
    </div>
  );
  return <p key={i} style={{ color: "#f5f1e8", fontSize: "13px", lineHeight: "1.6", margin: "0 0 6px" }}>{clean}</p>;
})}
          </div>
        </div>
      ) : (
        <p style={{ color: "#9ca3af", fontSize: "13px" }}>Loading market intelligence...</p>
      )}
    </section>
  );
}
export function BreadthCard() {
  const sectors = [
    ["Technology", "+1.25%", 92],
    ["Communication", "+0.60%", 78],
    ["Financials", "+0.23%", 52],
    ["Energy", "-0.12%", 38],
    ["Healthcare", "-0.32%", 30],
    ["Utilities", "-0.45%", 24],
  ];
  return (
    <section className="card breadth">
      <div className="cardTitle">Market Breadth</div>
      <div className="donut"></div>
      <div className="breadStats">
        <span><b className="positive">72%</b> Advancing</span>
        <span><b className="negative">23%</b> Declining</span>
        <span><b>5%</b> Unchanged</span>
      </div>
      <div className="sectorList">
        {sectors.map((s) => (
          <div className="sector" key={s[0]}>
            <span>{s[0]}</span>
            <div><i style={{ width: `${s[2]}%` }}></i></div>
            <b className={s[1].startsWith("+") ? "positive" : "negative"}>
              {s[1]}
            </b>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GammaCard({ full = false }) {
  const [tickerInput, setTickerInput] = useState("SPY");
  const [ticker, setTicker] = useState("SPY");
  const [gamma, setGamma] = useState(null);

  useEffect(() => {
    async function fetchGamma() {
      try {
        const res = await fetch(`${API}/api/gamma?ticker=${ticker}`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setGamma(data);
      } catch {}
    }
    fetchGamma();
    const t = setInterval(fetchGamma, 30000);
    return () => clearInterval(t);
  }, [ticker]);

  const metrics = gamma ? [
    { label: "CALL WALL", value: gamma.callWall ?? "--", detail: "+Gamma", tone: "" },
    { label: "PUT WALL", value: gamma.putWall ?? "--", detail: "-Gamma", tone: "red" },
    { label: "GAMMA FLIP", value: gamma.gammaFlip ?? "--", detail: gamma.sentiment ?? "Neutral", tone: "purple" },
    { label: "MAX PAIN", value: gamma.maxPain ?? "--", detail: "Pin Risk", tone: "" },
    { label: "SQUEEZE RISK", value: gamma.squeezeRisk ?? "--", detail: "", tone: gamma.squeezeRisk === "High" ? "red" : "" },
    { label: "DEALER POSITIONING", value: gamma.dealerPositioning ?? "--", detail: gamma.sentiment ?? "", tone: "" },
  ] : gammaMetrics;

  const bars = gamma?.strikeChart?.length
    ? gamma.strikeChart
    : Array.from({ length: 42 }).map((_, i) => ({ calls: Math.abs(Math.sin(i / 4) * 72) + 10, puts: 0 }));

  return (
    <section className={`card gamma ${full ? "fullPageCard" : "wide"}`}>
      <div className="cardTitle purple" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ cursor: "pointer" }} onClick={() => navigate("/gamma-ex")}>Gamma Exposure ({gamma?.ticker ?? ticker}) ?</span>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <input
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && setTicker(tickerInput)}
            placeholder="SPY"
            style={{ width: "65px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#fff", padding: "4px 8px", fontSize: "12px", fontWeight: 700, outline: "none" }}
          />
          <button onClick={() => setTicker(tickerInput)}
            style={{ background: "var(--gold)", color: "#000", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
            GO
          </button>
        </div>
      </div>
      <div className="gammaTiles">
        {metrics.map((m) => (
          <div className={`metric ${m.tone}`} key={m.label}>
            <small>{m.label}</small>
            <b>{m.value}</b>
            <span>{m.detail}</span>
          </div>
        ))}
      </div>
      <div className="gammaChart">
        {bars.map((bar, i) => {
          const h = Math.min(150, Math.max(8, gamma?.strikeChart ? (bar.calls + bar.puts) / 500000 * 10 : bar.calls));
          const isCall = bar.calls >= bar.puts;
          return (
            <div key={i} className="gammaBar" style={{ height: h, background: isCall ? "var(--red)" : "var(--gold)", opacity: 0.75 }} />
          );
        })}
      </div>
    </section>
  );
}
export function ScannerCard({ full = false }) {
  const navigate = useNavigate();
  return (
    <section className={`card scanner ${full ? "fullPageCard" : "wide"}`}>
      <div className="cardTitle purple">Scanner</div>
      <div className="tabs">
        <button onClick={() => navigate("/scanner?filter=momentum")}>Momentum</button>
        <button onClick={() => navigate("/scanner?filter=orb")}>ORB</button>
        <button onClick={() => navigate("/scanner?filter=lowfloat")}>Low Float</button>
        <button onClick={() => navigate("/scanner?filter=unusual")}>Unusual Volume</button>
        <button onClick={() => navigate("/scanner?filter=gappers")}>Gappers</button>
        <button onClick={() => navigate("/scanner?filter=squeeze")}>Squeeze Candidates</button>
      </div>
      <DataTable
        headers={[
          "Rank",
          "Ticker",
          "Price",
          "Change %",
          "Volume",
          "Rel Volume",
          "Float",
          "RSI",
          "Setup",
        ]}
        rows={scannerRows}
        getCells={(r) => [
          r.rank,
          r.ticker,
          r.price,
          r.change,
          r.volume,
          r.relVolume,
          r.float,
          r.rsi,
          r.setup,
        ]}
      />
      <a onClick={() => navigate("/scanner")} style={{ cursor: "pointer" }}>View Full Scanner ?</a>
    </section>
  );
}

export function OptionsFlowCard({ full = false }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState(optionsFlowRows);
  const [query, setQuery] = useState("");

  function fmtPremium(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "--";
    if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  }

  useEffect(() => {
    async function fetchFlow() {
      try {
        const res = await fetch(`${API}/api/flow/history`);
        if (!res.ok) throw new Error("Flow fetch failed");

        const data = await res.json();
        const liveRows = Array.isArray(data?.rows) ? data.rows : [];

        if (liveRows.length) {
          setRows(liveRows);
        }
      } catch (err) {
        console.warn("Options flow fallback loaded:", err);
      }
    }

    fetchFlow();
    const interval = setInterval(fetchFlow, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredRows = rows
    .filter((r) => {
      const q = query.trim().toUpperCase();
      if (!q) return true;
      return String(r.ticker || "").toUpperCase().includes(q);
    })
    .slice(0, full ? 25 : 8);

  return (
    <section className={`card options ${full ? "fullPageCard" : "wide"}`}>
      <div className="cardTitle purple">Options Flow</div>

      <div className="tabs">
        <button onClick={() => navigate("/options-flow?filter=sweep")}>Sweeps</button>
        <button onClick={() => navigate("/options-flow?filter=block")}>Blocks</button>
        <button onClick={() => navigate("/options-flow?filter=premium")}>Big Premium</button>
        <button onClick={() => navigate("/options-flow?filter=unusual")}>Unusual</button>
      </div>

      <div style={{ margin: "10px 0 12px" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ticker: SPY, NVDA, TSLA..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "10px",
            color: "#fff",
            padding: "10px 12px",
            outline: "none",
            fontWeight: 700,
          }}
        />
      </div>

      <DataTable
        headers={[
          "Time",
          "Ticker",
          "Type",
          "Expiry",
          "Strike",
          "C/P",
          "Premium",
          "Details",
        ]}
        rows={filteredRows}
        getCells={(r) => [
          r.time ?? "--",
          r.ticker ?? "--",
          r.tag ?? r.type ?? "--",
          r.expStr ?? r.expiry ?? "--",
          r.strike ?? "--",
          r.type ?? r.cp ?? "--",
          fmtPremium(r.premium),
          r.contracts && r.price
            ? `${Number(r.contracts).toLocaleString()} @ ${Number(r.price).toFixed(2)}`
            : r.details ?? "--",
        ]}
      />

      <a onClick={() => navigate("/options-flow")} style={{ cursor: "pointer" }}>{query ? `Showing ${filteredRows.length} result(s) for ${query.toUpperCase()}` : "View All Options Flow ?"}</a>
    </section>
  );
}

export function WatchlistCard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([
    { ticker: "SPY", price: "—", change: "—", volume: "—" },
    { ticker: "QQQ", price: "—", change: "—", volume: "—" },
    { ticker: "IWM", price: "—", change: "—", volume: "—" },
    { ticker: "NVDA", price: "—", change: "—", volume: "—" },
    { ticker: "TSLA", price: "—", change: "—", volume: "—" },
  ]);

  useEffect(() => {
    async function fetchPrices() {
      const symbols = ["SPY", "QQQ", "IWM", "NVDA", "TSLA"];
      const results = await Promise.all(symbols.map(async (sym) => {
        try {
          const res = await fetch(`${API}/api/quote/${sym}`);
          if (!res.ok) throw new Error("failed");
          const d = await res.json();
          const price = d.price ? Number(d.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
          const change = d.changePct != null ? `${d.changePct >= 0 ? "+" : ""}${Number(d.changePct).toFixed(2)}%` : "—";
          return { ticker: sym, price, change, volume: "—" };
        } catch {
          return { ticker: sym, price: "—", change: "—", volume: "—" };
        }
      }));
      setRows(results);
    }
    fetchPrices();
    const t = setInterval(fetchPrices, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="card watch">
      <div className="cardTitle purple">
        Watchlists
        <select><option>My Main List</option></select>
      </div>
      <DataTable
        headers={["Ticker", "Price", "Change %", "Volume"]}
        rows={rows}
        getCells={(r) => [r.ticker, r.price, r.change, r.volume]}
      />
      <a onClick={() => navigate("/scanner")} style={{ cursor: "pointer" }}>Manage Watchlists</a>
    </section>
  );
}

export function NewsCard() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`https://trqx-flow-scanner-production.up.railway.app/api/news?limit=6`)
      .then(r => r.ok ? r.json() : { rows: [] })
      .then(data => { setRows(data.rows || []); setLoading(false); })
      .catch(() => setLoading(false));
    const interval = setInterval(() => {
      fetch(`https://trqx-flow-scanner-production.up.railway.app/api/news?limit=6`)
        .then(r => r.ok ? r.json() : { rows: [] })
        .then(data => setRows(data.rows || []));
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const sentimentColor = (s) => s === "positive" ? "#22c55e" : s === "negative" ? "#ef4444" : "#9ca3af";

  return (
    <section className="card news">
      <div className="cardTitle purple">News & Alerts</div>
      {loading ? (
        <div style={{ color: "#9ca3af", fontSize: "13px", padding: "12px 0" }}>Loading headlines...</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "#9ca3af", fontSize: "13px", padding: "12px 0" }}>No recent news</div>
      ) : rows.map((newsItem, i) => (
        <a key={i} href={newsItem.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", alignItems: "flex-start", cursor: "pointer" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
              <span style={{ color: "#f5f1e8", fontSize: "12px", lineHeight: "1.4", fontWeight: "500" }}>{newsItem.title}</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ color: "#d4af37", fontSize: "10px", fontWeight: "600" }}>{newsItem.source}</span>
                <span style={{ color: "#9ca3af", fontSize: "10px" }}>{new Date(newsItem.published).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                {newsItem.sentiment && newsItem.sentiment !== "neutral" && (
                  <span style={{ color: sentimentColor(newsItem.sentiment), fontSize: "10px", fontWeight: "700" }}>
                    {newsItem.sentiment.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </a>
      ))}
      <a onClick={() => navigate("/news")} style={{ cursor: "pointer" }}>View All News ?</a>
    </section>
  );
}

export function AcademyCard() {
  const navigate = useNavigate();
  return (
    <section className="card academy full">
      <div className="course greenCourse">
        <GraduationCap />
        <div>
          <small>Beginner Course</small>
          <b>Learn Options Trading</b>
          <span><i style={{ width: "75%" }}></i></span>
        </div>
      </div>

      <div className="course purpleCourse">
        <Waves />
        <div>
          <small>Intermediate Course</small>
          <b>Gamma Exposure Mastery</b>
          <span><i style={{ width: "45%" }}></i></span>
        </div>
      </div>

      <div className="course goldCourse">
        <Crown />
        <div>
          <small>Advanced Course</small>
          <b>The TRQX System</b>
          <span><i style={{ width: "20%" }}></i></span>
        </div>
      </div>

      <div className="course greenCourse continue">
        <ExternalLink />
        <div>
          <small>Continue Learning</small>
          <b>Understanding Gamma</b>
        </div>
        <button onClick={() => navigate("/academy")}>Continue ?</button>
      </div>
    </section>
  );
}















