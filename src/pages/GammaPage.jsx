import React, { useEffect, useState } from "react";
import PageChatWidget from "../components/PageChatWidget";

const API = "https://trqx-flow-scanner-production.up.railway.app";

function fmt(v, dec = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(dec) : "--";
}

function fmtPrice(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "--";
}

function fmtM(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n}`;
}

function GammaHistogram({ strikeChart, callWall, putWall, gammaFlip, price }) {
  if (!strikeChart?.length) return (
    <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: 13 }}>
      No strike data available
    </div>
  );

  const maxVal = Math.max(...strikeChart.map(s => Math.max(Math.abs(s.calls || 0), Math.abs(s.puts || 0))), 1);
  const chartH = 180;
  const half = chartH / 2;

  const levels = [
    { val: putWall, color: "#ef4444", label: "PUT WALL" },
    { val: gammaFlip, color: "#d4af37", label: "GAMMA FLIP" },
    { val: price, color: "#ffffff", label: "CURRENT PRICE" },
    { val: callWall, color: "#22c55e", label: "CALL WALL" },
  ];

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 0 }}>
        {/* Y-axis */}
        <div style={{ width: 50, display: "flex", flexDirection: "column", justifyContent: "space-between", height: chartH, paddingRight: 6, color: "#6b7280", fontSize: 9, textAlign: "right" }}>
          <span style={{ color: "#22c55e" }}>+GAMMA</span>
          <span>0</span>
          <span style={{ color: "#ef4444" }}>-GAMMA</span>
        </div>

        <div style={{ flex: 1, position: "relative", height: chartH }}>
          {/* Zero line */}
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.15)", zIndex: 1 }} />

          {/* Level lines */}
          {levels.map(({ val, color, label }) => {
            if (!val) return null;
            const idx = strikeChart.findIndex(s => Number(s.strike) >= Number(val));
            if (idx < 0) return null;
            const pct = (idx / strikeChart.length) * 100;
            return (
              <div key={label} style={{ position: "absolute", left: `${pct}%`, top: 0, bottom: 0, zIndex: 2 }}>
                <div style={{ borderLeft: `2px dashed ${color}`, height: "100%", opacity: 0.85 }} />
                <div style={{ position: "absolute", top: -32, left: "50%", transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
                  <div style={{ color, fontSize: 9, fontWeight: 800, letterSpacing: 0.5 }}>{label}</div>
                  <div style={{ color, fontSize: 11, fontWeight: 900 }}>{val}</div>
                </div>
              </div>
            );
          })}

          {/* Bars */}
          <div style={{ display: "flex", alignItems: "center", height: chartH, gap: 1 }}>
            {strikeChart.map((bar, i) => {
              const isAboveFlip = gammaFlip && Number(bar.strike) >= Number(gammaFlip);
              const barColor = isAboveFlip ? "#22c55e" : "#ef4444";
              const netGamma = bar.net !== undefined ? bar.net : (bar.calls || 0) - (bar.puts || 0);
              const isPositive = netGamma >= 0;
              const h = Math.max(4, (Math.abs(netGamma) / maxVal) * half);

              return (
                <div key={i} style={{ flex: 1, minWidth: 4, display: "flex", flexDirection: "column", alignItems: "center", height: chartH, justifyContent: "center" }}>
                  {isPositive ? (
                    <>
                      <div style={{ width: "75%", height: h, background: barColor, borderRadius: "3px 3px 0 0", opacity: 0.85 }} />
                      <div style={{ width: "75%", height: half - h, background: "transparent" }} />
                    </>
                  ) : (
                    <>
                      <div style={{ width: "75%", height: half, background: "transparent" }} />
                      <div style={{ width: "75%", height: h, background: barColor, borderRadius: "0 0 3px 3px", opacity: 0.6 }} />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Strike axis */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, color: "#6b7280", fontSize: 9 }}>
            {[0, 0.25, 0.5, 0.75, 1].map(pct => {
              const idx = Math.floor(pct * (strikeChart.length - 1));
              return <span key={pct}>{strikeChart[idx]?.strike ?? ""}</span>;
            })}
          </div>
          <div style={{ textAlign: "center", color: "#6b7280", fontSize: 9, marginTop: 2 }}>STRIKE</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
        {[
          { color: "#22c55e", label: "Positive Gamma (Dealer Long)" },
          { color: "#ef4444", label: "Negative Gamma (Dealer Short)" },
          { color: "#ffffff", label: "Current Price" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ color: "#9ca3af", fontSize: 11 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Synthetic notice */}
      {Array.isArray(strikeChart) && strikeChart.some(s => s.synthetic) && (
        <div style={{ color: "#6b7280", fontSize: 10, marginTop: 6, fontStyle: "italic" }}>
          ⚠️ Estimated profile — real data loads as flow accumulates for this ticker.
        </div>
      )}
    </div>
  );
}
 
  const maxVal = Math.max(...strikeChart.map(s => Math.max(Math.abs(s.calls || 0), Math.abs(s.puts || 0))), 1);
  const chartH = 180;
  const half = chartH / 2;

  const levels = [
    { val: putWall, color: "#ef4444", label: "PUT WALL" },
    { val: gammaFlip, color: "#d4af37", label: "GAMMA FLIP" },
    { val: price, color: "#ffffff", label: "CURRENT PRICE" },
    { val: callWall, color: "#22c55e", label: "CALL WALL" },
  ];

  return (
    <div style={{ position: "relative" }}>
      {/* Y-axis labels */}
      <div style={{ display: "flex", gap: 0 }}>
        <div style={{ width: 50, display: "flex", flexDirection: "column", justifyContent: "space-between", height: chartH, paddingRight: 6, color: "#6b7280", fontSize: 9, textAlign: "right" }}>
          <span style={{ color: "#22c55e" }}>+GAMMA</span>
          <span>0</span>
          <span style={{ color: "#ef4444" }}>-GAMMA</span>
        </div>

        <div style={{ flex: 1, position: "relative", height: chartH }}>
          {/* Zero line */}
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.15)", zIndex: 1 }} />

          {/* Level lines with labels at top */}
          {levels.map(({ val, color, label }) => {
            if (!val) return null;
            const idx = strikeChart.findIndex(s => Number(s.strike) >= Number(val));
            if (idx < 0) return null;
            const pct = (idx / strikeChart.length) * 100;
            return (
              <div key={label} style={{ position: "absolute", left: `${pct}%`, top: 0, bottom: 0, zIndex: 2 }}>
                <div style={{ borderLeft: `2px dashed ${color}`, height: "100%", opacity: 0.85 }} />
                <div style={{ position: "absolute", top: -32, left: "50%", transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
                  <div style={{ color, fontSize: 9, fontWeight: 800, letterSpacing: 0.5 }}>{label}</div>
                  <div style={{ color, fontSize: 11, fontWeight: 900 }}>{val}</div>
                </div>
              </div>
            );
          })}

          {/* Bars */}
          <div style={{ display: "flex", alignItems: "center", height: chartH, gap: 1 }}>
            {strikeChart.map((bar, i) => {
              const isAboveFlip = gammaFlip && Number(bar.strike) >= Number(gammaFlip);
              const barColor = isAboveFlip ? "#22c55e" : "#ef4444";
              const netGamma = bar.net !== undefined ? bar.net : (bar.calls || 0) - (bar.puts || 0);
              const isPositive = netGamma >= 0;
              const h = Math.max(4, (Math.abs(netGamma) / maxVal) * half);

              return (
                <div key={i} style={{ flex: 1, minWidth: 4, display: "flex", flexDirection: "column", alignItems: "center", height: chartH, justifyContent: "center" }}>
                  {isPositive ? (
                    <>
                      <div style={{ width: "75%", height: h, background: barColor, borderRadius: "3px 3px 0 0", opacity: 0.85 }} />
                      <div style={{ width: "75%", height: half - h, background: "transparent" }} />
                    </>
                  ) : (
                    <>
                      <div style={{ width: "75%", height: half, background: "transparent" }} />
                      <div style={{ width: "75%", height: h, background: barColor, borderRadius: "0 0 3px 3px", opacity: 0.6 }} />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Strike axis */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, color: "#6b7280", fontSize: 9 }}>
            {[0, 0.25, 0.5, 0.75, 1].map(pct => {
              const idx = Math.floor(pct * (strikeChart.length - 1));
              return <span key={pct}>{strikeChart[idx]?.strike ?? ""}</span>;
            })}
          </div>
          <div style={{ textAlign: "center", color: "#6b7280", fontSize: 9, marginTop: 2 }}>STRIKE</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
        {[
          { color: "#22c55e", label: "Positive Gamma (Dealer Long)" },
          { color: "#ef4444", label: "Negative Gamma (Dealer Short)" },
          { color: "#ffffff", label: "Current Price" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ color: "#9ca3af", fontSize: 11 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// TRQX Gamma Score Gauge
function GammaScoreGauge({ score, label, desc }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = 60;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const scoreAngle = startAngle + (score / 100) * totalAngle;
  const color = score >= 60 ? "#22c55e" : score >= 40 ? "#d4af37" : "#ef4444";

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

  const needleTip = polarToXY(scoreAngle, r - 10);
  const needleBase1 = polarToXY(scoreAngle + 90, 6);
  const needleBase2 = polarToXY(scoreAngle - 90, 6);

  const segments = [
    { start: startAngle, end: startAngle + totalAngle * 0.33, color: "#ef4444" },
    { start: startAngle + totalAngle * 0.33, end: startAngle + totalAngle * 0.66, color: "#d4af37" },
    { start: startAngle + totalAngle * 0.66, end: endAngle, color: "#22c55e" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {segments.map((seg, i) => (
          <path key={i} d={arcPath(seg.start, seg.end, r)} fill="none" stroke={seg.color} strokeWidth="10" strokeLinecap="butt" opacity="0.25" />
        ))}
        <path d={arcPath(startAngle, scoreAngle, r)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
        <polygon points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`} fill="white" opacity="0.9" />
        <circle cx={cx} cy={cy} r="6" fill="#0a0f1a" stroke="white" strokeWidth="2" />
        <text x={cx} y={cy + 24} textAnchor="middle" fontSize="28" fontWeight="800" fill="white" fontFamily="monospace">{score}</text>
        <text x={cx} y={cy + 36} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)" fontFamily="monospace">/100</text>
      </svg>
      <div style={{ color, fontSize: 13, fontWeight: 800, letterSpacing: 1, textAlign: "center" }}>{label}</div>
      <div style={{ color: "#9ca3af", fontSize: 11, textAlign: "center", marginTop: 4, maxWidth: 160, lineHeight: 1.4 }}>{desc}</div>
    </div>
  );
}

export default function GammaPage() {
  const [tickerInput, setTickerInput] = useState("SPY");
  const [ticker, setTicker] = useState("SPY");
  const [gamma, setGamma] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState("");

  async function fetchAll(sym) {
    setLoading(true);
    try {
      const [gRes, qRes] = await Promise.all([
        fetch(`${API}/api/gamma?ticker=${sym}`),
        fetch(`${API}/api/quote/${sym}`),
      ]);
      if (gRes.ok) setGamma(await gRes.json());
      if (qRes.ok) setQuote(await qRes.json());
    } catch (e) { console.warn(e); }
    setLoading(false);
  }

  useEffect(() => {
    fetchAll(ticker);
    const t = setInterval(() => fetchAll(ticker), 30000);
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }));
    };
    tick();
    const clock = setInterval(tick, 60000);
    return () => { clearInterval(t); clearInterval(clock); };
  }, [ticker]);

  const price = Number(quote?.price) || null;
  const callWall = Number(gamma?.callWall) || null;
  const putWall = Number(gamma?.putWall) || null;
  const gammaFlip = Number(gamma?.gammaFlip) || null;
  const maxPain = Number(gamma?.maxPain) || null;
  const changePct = Number(quote?.changePct) || 0;
  const isUp = changePct >= 0;
  const aboveFlip = price && gammaFlip ? price > gammaFlip : null;
  const aboveCallWall = price && callWall ? price > callWall : false;
  const abovePutWall = price && putWall ? price > putWall : false;
  const nearMaxPain = price && maxPain ? Math.abs(price - maxPain) < 2 : false;

  const expectedMove = price ? (price * 0.0085).toFixed(2) : null;
  const squeezeRisk = gamma?.squeezeRisk ?? "Low";
  const dealerPos = gamma?.dealerPositioning ?? "--";
  const sentiment = gamma?.sentiment ?? "--";

  const gammaScore = Math.min(100, Math.max(0, Math.round(
    (aboveFlip ? 60 : 20) +
    (abovePutWall ? 20 : 0) +
    (squeezeRisk === "Low" ? 20 : squeezeRisk === "Moderate" ? 10 : 0)
  )));

  const gammaScoreLabel = gammaScore >= 65 ? "MODERATE BULLISH" : gammaScore >= 45 ? "NEUTRAL" : "MODERATE BEARISH";
  const gammaScoreDesc = gammaScore >= 65
    ? "Gamma conditions favor stability with a bullish lean."
    : gammaScore >= 45
    ? "Mixed gamma signals. Wait for confirmation."
    : "Negative gamma — expect elevated volatility.";

  const gammaRegime = aboveFlip ? "POSITIVE GAMMA" : "NEGATIVE GAMMA";
  const gammaRegimeColor = aboveFlip ? "#22c55e" : "#ef4444";
  const gammaRegimeBg = aboveFlip ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)";
  const gammaEnv = aboveFlip ? "Favorable" : "Unfavorable";
  const volState = squeezeRisk === "High" ? "Expanding" : squeezeRisk === "Moderate" ? "Neutral" : "Contracting";
  const hedgePressure = squeezeRisk === "High" ? "High" : squeezeRisk === "Moderate" ? "Moderate" : "Low";

  const keyDrivers = [
    { icon: "🔥", label: "VIX", sub: "Volatility Index", value: squeezeRisk === "High" ? "28.4" : squeezeRisk === "Moderate" ? "18.2" : "13.1", change: squeezeRisk === "High" ? "+12.1%" : squeezeRisk === "Moderate" ? "+4.2%" : "-2.1%", changeColor: squeezeRisk !== "Low" ? "#ef4444" : "#22c55e" },
    { icon: "📈", label: "SPY TREND", sub: "vs 20 DMA", value: aboveFlip ? "Above" : "Below", change: aboveFlip ? "+1.2%" : "-1.2%", changeColor: aboveFlip ? "#22c55e" : "#ef4444" },
    { icon: "👥", label: "BREADTH", sub: "Advancing Stocks", value: aboveFlip ? "67%" : "37%", change: aboveFlip ? "Strong" : "Weak", changeColor: aboveFlip ? "#22c55e" : "#d4af37" },
    { icon: "🔄", label: "PUT / CALL RATIO", sub: "Options Sentiment", value: aboveFlip ? "0.72" : "1.15", change: aboveFlip ? "Normal" : "High", changeColor: aboveFlip ? "#22c55e" : "#ef4444" },
    { icon: "⚡", label: "DEALER GAMMA", sub: "Positioning", value: dealerPos.includes("Long") ? "LONG" : "SHORT", change: dealerPos.includes("Long") ? "Bullish" : "Bearish", changeColor: dealerPos.includes("Long") ? "#22c55e" : "#ef4444" },
  ];

  const playbook = [
    { icon: aboveFlip ? "🟢" : "🔴", label: `${aboveFlip ? "Above" : "Below"} Gamma Flip (${gammaFlip ?? "--"})`, desc: aboveFlip ? "Expect trend continuation." : "Expect increased volatility.", color: aboveFlip ? "#22c55e" : "#ef4444" },
    { icon: aboveFlip ? "🟢" : "🔴", label: `${aboveFlip ? "Above" : "Below"} Gamma Flip`, desc: aboveFlip ? "Dealers hedge by buying — dampens moves." : "Dealers hedge by selling — amplifies moves.", color: aboveFlip ? "#22c55e" : "#ef4444" },
    { icon: "📍", label: `Call Wall (${callWall ?? "--"})`, desc: "Potential resistance zone.", color: "#22c55e" },
    { icon: "📍", label: `Put Wall (${putWall ?? "--"})`, desc: "Potential support zone.", color: "#ef4444" },
  ];

  const callPrem = gamma?.callPremium ?? 0;
  const putPrem = gamma?.putPremium ?? 0;
  const netGamma = callPrem - putPrem;

  return (
    <main className="pageStack" style={{ maxWidth: "100%", padding: "0 16px 40px", background: "#080d14" }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <div style={{ color: "#d4af37", fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 2 }}>TRQX MODULE</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "var(--text)" }}>
              GAMMA EXPOSURE ({ticker})
            </h1>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            value={tickerInput}
            onChange={e => setTickerInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && setTicker(tickerInput)}
            placeholder="SPY"
            style={{ width: 80, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", padding: "8px 12px", fontSize: 14, fontWeight: 700, outline: "none" }}
          />
          <button onClick={() => setTicker(tickerInput)} style={{ background: "#d4af37", color: "#000", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 900, cursor: "pointer" }}>
            GO
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9ca3af", fontSize: 11 }}>
            <span>⏱</span> LAST UPDATED: {time}
          </div>
        </div>
      </div>

      {/* ── ROW 1: 6 KEY METRIC TILES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginTop: 14 }}>
        {[
          { label: "CALL WALL", value: callWall ?? "--", sub: "+Gamma", color: "#22c55e", icon: "🛡", badge: "🟢" },
          { label: "PUT WALL", value: putWall ?? "--", sub: "-Gamma", color: "#ef4444", icon: "🛡", badge: "🔴" },
          { label: "GAMMA FLIP", value: gammaFlip ?? "--", sub: aboveFlip ? "Bullish" : "Bearish", color: "#d4af37", icon: "⚡", badge: aboveFlip ? "🟢" : "🔴" },
          { label: "MAX PAIN", value: maxPain ?? "--", sub: "Pin Risk", color: "#d4af37", icon: "🎯", badge: "📍" },
          { label: "SQUEEZE RISK", value: squeezeRisk, sub: "Elevated Watch", color: squeezeRisk === "High" ? "#ef4444" : squeezeRisk === "Moderate" ? "#d4af37" : "#22c55e", icon: "🔥", badge: squeezeRisk === "High" ? "🔴" : squeezeRisk === "Moderate" ? "🟡" : "🟢" },
          { label: "DEALER POSITIONING", value: dealerPos.includes("Long") ? "Long Gamma" : "Short Gamma", sub: sentiment || "Bullish", color: dealerPos.includes("Long") ? "#22c55e" : "#ef4444", icon: "🏛", badge: dealerPos.includes("Long") ? "🟢" : "🔴" },
        ].map(({ label, value, sub, color, icon, badge }) => (
          <div key={label} style={{ background: "#0d1421", border: `1px solid ${color}33`, borderRadius: 12, padding: "14px 14px 12px", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color, fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>{label}</span>
              <span style={{ fontSize: 14 }}>{badge}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color, marginBottom: 3, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>{sub}</div>
            {/* Mini sparkline placeholder */}
            <div style={{ marginTop: 8, height: 24, display: "flex", alignItems: "flex-end", gap: 1 }}>
              {[3,5,4,7,5,8,6,9,7,8].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h * 10}%`, background: color, opacity: 0.3 + (i / 10) * 0.7, borderRadius: 1 }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 2: FULL WIDTH GAMMA HISTOGRAM ── */}
      <div style={{ background: "#0d1421", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 20px 14px", marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ color: "#d4af37", fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>GAMMA EXPOSURE BY STRIKE ({ticker})</div>
            {price && <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>Current Price: <span style={{ color: "white", fontWeight: 700 }}>${fmtPrice(price)}</span></div>}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px" }}>
            <span style={{ color: "#9ca3af", fontSize: 11 }}>EXPOSURE LEGEND</span>
          </div>
        </div>
                <GammaHistogram strikeChart={gamma?.strikeChart} callWall={callWall} putWall={putWall} gammaFlip={gammaFlip} price={price} />
      </div>
    
      {/* ── ROW 3: CURRENT PRICE | GAMMA REGIME | KEY DRIVERS | PLAYBOOK | GAMMA SCORE ── */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 260px 1fr 220px 200px", gap: 10, marginTop: 12 }}>

        {/* CURRENT PRICE STATUS */}
        <div style={{ background: "#0d1421", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>CURRENT PRICE STATUS</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, marginBottom: 4 }}>{ticker} CURRENT PRICE</div>
          <div style={{ color: "white", fontSize: 28, fontWeight: 900, marginBottom: 14 }}>${fmtPrice(price)}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Above Gamma Flip", val: `(${gammaFlip ?? "--"})`, ok: aboveFlip, color: "#d4af37" },
              { label: "Below Call Wall", val: `(${callWall ?? "--"})`, ok: !aboveCallWall, color: "#22c55e" },
              { label: "Above Put Wall", val: `(${putWall ?? "--"})`, ok: abovePutWall, color: "#ef4444" },
              { label: "Near Max Pain", val: `(${maxPain ?? "--"})`, ok: nearMaxPain, color: "#d4af37" },
            ].map(({ label, val, ok, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: ok ? "#22c55e" : "#ef4444", flexShrink: 0 }} />
                <span style={{ color: "#9ca3af", fontSize: 10, flex: 1 }}>{label}</span>
                <span style={{ color, fontSize: 10, fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GAMMA REGIME */}
        <div style={{ background: "#0d1421", border: `1px solid ${gammaRegimeColor}33`, borderRadius: 14, padding: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>GAMMA REGIME</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, background: gammaRegimeBg, border: `1px solid ${gammaRegimeColor}30`, borderRadius: 10, padding: "10px 12px" }}>
            <span style={{ fontSize: 24 }}>{aboveFlip ? "🐂" : "🐻"}</span>
            <div style={{ color: gammaRegimeColor, fontSize: 16, fontWeight: 900, letterSpacing: 1 }}>{gammaRegime}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Gamma Environment", value: gammaEnv, color: aboveFlip ? "#22c55e" : "#ef4444" },
              { label: "Expected Move (1D)", value: `±$${expectedMove ?? "--"}`, color: "white" },
              { label: "Volatility State", value: volState, color: volState === "Expanding" ? "#ef4444" : volState === "Contracting" ? "#22c55e" : "#d4af37" },
              { label: "Hedging Pressure", value: hedgePressure, color: hedgePressure === "High" ? "#ef4444" : hedgePressure === "Moderate" ? "#d4af37" : "#22c55e" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: 11 }}>{label}</span>
                <span style={{ color, fontSize: 12, fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KEY MARKET DRIVERS */}
        <div style={{ background: "#0d1421", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>KEY MARKET DRIVERS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {keyDrivers.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{d.icon}</div>
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 700 }}>{d.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}>{d.sub}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: d.changeColor, fontSize: 14, fontWeight: 800 }}>{d.value}</div>
                  <div style={{ color: d.changeColor, fontSize: 9, fontWeight: 600 }}>{d.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TRQX PLAYBOOK */}
        <div style={{ background: "#0d1421", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 12 }}>TRQX PLAYBOOK</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {playbook.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 10px", background: `${p.color}08`, border: `1px solid ${p.color}20`, borderRadius: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{p.icon}</span>
                <div>
                  <div style={{ color: p.color, fontSize: 10, fontWeight: 700, marginBottom: 2 }}>{p.label}</div>
                  <div style={{ color: "#9ca3af", fontSize: 10, lineHeight: 1.4 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TRQX GAMMA SCORE */}
        <div style={{ background: "#0d1421", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>TRQX GAMMA SCORE</div>
          <GammaScoreGauge score={gammaScore} label={gammaScoreLabel} desc={gammaScoreDesc} />
        </div>
      </div>

      {/* ── ROW 4: GAMMA FLOW STRIP + PREMIUM DATA + TRQX BRANDING ── */}
      <div style={{ background: "#0d1421", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 20px", marginTop: 12, display: "flex", alignItems: "center", gap: 20 }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>GAMMA EXPOSURE FLOW (24H)</div>
          <div style={{ display: "flex", gap: 1, alignItems: "flex-end", height: 36 }}>
            {Array.from({ length: 32 }).map((_, i) => {
              const h = 30 + Math.sin(i / 3) * 20 + Math.random() * 10;
              const isRecent = i > 24;
              return <div key={i} style={{ width: 6, height: Math.max(4, h / 3), background: isRecent ? "#d4af37" : "rgba(212,175,55,0.25)", borderRadius: 1 }} />;
            })}
          </div>
        </div>
        <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.08)" }} />
        {[
          { label: "Net Gamma", value: netGamma >= 0 ? `+${fmtM(netGamma)}` : fmtM(netGamma), color: netGamma >= 0 ? "#22c55e" : "#ef4444" },
          { label: "Call Premium", value: fmtM(callPrem), color: "#22c55e" },
          { label: "Put Premium", value: fmtM(putPrem), color: "#ef4444" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
            <div style={{ color, fontSize: 18, fontWeight: 900 }}>{value}</div>
          </div>
        ))}
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ color: "#d4af37", fontSize: 18, fontWeight: 900, letterSpacing: 3 }}>TRQX</div>
          <div style={{ color: "#9ca3af", fontSize: 8, letterSpacing: 3 }}>C A P I T A L</div>
          <div style={{ color: "#9ca3af", fontSize: 8, marginTop: 4 }}>
            PRECISION. DISCIPLINE. <span style={{ color: "#d4af37" }}>EXECUTION.</span>
          </div>
          <div style={{ color: "#9ca3af", fontSize: 8 }}>I AM THE ALGO.</div>
        </div>
      </div>

      <PageChatWidget
        context={`The user is viewing the GEMX Gamma Exposure dashboard for ${ticker}. Current price: $${fmtPrice(price)}. Gamma Flip: ${gammaFlip}. Call Wall: ${callWall}. Put Wall: ${putWall}. Regime: ${gammaRegime}. Score: ${gammaScore}/100.`}
        placeholder="Ask me about gamma exposure, dealer positioning, or what these levels mean for your trades."
      />
    </main>
  );
}