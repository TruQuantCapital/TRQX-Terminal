import React, { useEffect, useState, useRef } from "react";

const API = "https://trqx-flow-scanner-production.up.railway.app";

function fmt(v, dec = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(dec) : "--";
}

function fmtPrice(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "--";
}

// SVG Speedometer Gauge
function SpeedometerGauge({ price, gammaFlip, callWall, putWall }) {
  const hasData = Number.isFinite(price) && Number.isFinite(gammaFlip);
  const pct = hasData
    ? Math.min(100, Math.max(0, ((price - putWall) / (callWall - putWall)) * 100))
    : 50;
  const angle = -130 + (pct / 100) * 260;
  const rad = (angle * Math.PI) / 180;
  const cx = 100, cy = 100, r = 70;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);
  const aboveFlip = hasData && price > gammaFlip;
  const color = aboveFlip ? "#22c55e" : "#ef4444";
  const label = aboveFlip ? "ABOVE GAMMA FLIP" : "BELOW GAMMA FLIP";
  const sublabel = aboveFlip ? "Bullish Structure" : "Bearish Structure";

  function arc(startDeg, endDeg, col) {
    const s = { x: cx + r * Math.cos((startDeg * Math.PI) / 180), y: cy + r * Math.sin((startDeg * Math.PI) / 180) };
    const e = { x: cx + r * Math.cos((endDeg * Math.PI) / 180), y: cy + r * Math.sin((endDeg * Math.PI) / 180) };
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return <path d={`M${s.x},${s.y} A${r},${r} 0 ${large} 1 ${e.x},${e.y}`} fill="none" stroke={col} strokeWidth="12" strokeLinecap="round" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg viewBox="0 0 200 130" width="200" height="130">
        {arc(-130, -43, "#ef4444")}
        {arc(-43, 44, "#d4af37")}
        {arc(44, 130, "#22c55e")}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="white" />
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ color, fontSize: 14, fontWeight: 900, letterSpacing: 1 }}>{label}</div>
        <div style={{ color: "#9ca3af", fontSize: 12 }}>{sublabel}</div>
      </div>
    </div>
  );
}

// Gamma Exposure Profile Chart
function GammaChart({ strikeChart, callWall, putWall, gammaFlip, price }) {
  if (!strikeChart?.length) return <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>No strike data available</div>;

  const maxVal = Math.max(...strikeChart.map(s => Math.max(s.calls, s.puts)), 1);
  const chartH = 160;

  return (
    <div style={{ position: "relative", padding: "20px 0 30px", overflowX: "auto" }}>
      {/* Zero line */}
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.15)" }} />

      {/* Level markers */}
      {[
  { val: putWall, color: "#ef4444", label: "PUT WALL", offset: 40 },
  { val: price, color: "#ffffff", label: "PRICE", offset: 0 },
  { val: gammaFlip, color: "#d4af37", label: "GAMMA FLIP", offset: 20 },
  { val: callWall, color: "#22c55e", label: "CALL WALL", offset: 60 },
].map(({ val, color, label, offset }) => {
  if (!val) return null;
  const idx = strikeChart.findIndex(s => s.strike >= val);
  if (idx < 0) return null;
  const pct = (idx / strikeChart.length) * 100;
  return (
    <div key={label} style={{ position: "absolute", left: `${pct}%`, top: 0, bottom: 0, borderLeft: `1px dashed ${color}`, zIndex: 2 }}>
      <div style={{ position: "absolute", top: offset, left: 4, color, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", background: "rgba(0,0,0,0.6)", padding: "2px 4px", borderRadius: 4 }}>
        {label}<br />{val}
      </div>
    </div>
  );
})}

      <div style={{ display: "flex", alignItems: "center", gap: 2, height: chartH + 20 }}>
        {strikeChart.map((bar, i) => {
          const callH = Math.max(4, (bar.calls / maxVal) * (chartH / 2));
          const putH = Math.max(4, (bar.puts / maxVal) * (chartH / 2));
          const isAboveFlip = gammaFlip && bar.strike > gammaFlip;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 8 }}>
              <div style={{ width: "80%", height: callH, background: isAboveFlip ? "#22c55e" : "#ef4444", borderRadius: "3px 3px 0 0", opacity: 0.8 }} />
              <div style={{ width: 1, height: 1, background: "transparent" }} />
              <div style={{ width: "80%", height: putH, background: isAboveFlip ? "#22c55e66" : "#ef444466", borderRadius: "0 0 3px 3px", opacity: 0.6 }} />
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, color: "#6b7280", fontSize: 10 }}>
        <span>{strikeChart[0]?.strike}</span>
        <span>Strike Price</span>
        <span>{strikeChart[strikeChart.length - 1]?.strike}</span>
      </div>
    </div>
  );
}

export default function GammaPage() {
  const [tickerInput, setTickerInput] = useState("SPY");
  const [ticker, setTicker] = useState("SPY");
  const [gamma, setGamma] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => { fetchAll(ticker); }, [ticker]);

  const price = Number(quote?.price) || null;
  const callWall = Number(gamma?.callWall) || null;
  const putWall = Number(gamma?.putWall) || null;
  const gammaFlip = Number(gamma?.gammaFlip) || null;
  const maxPain = Number(gamma?.maxPain) || null;
  const changePct = Number(quote?.changePct) || 0;
  const isUp = changePct >= 0;
  const aboveFlip = price && gammaFlip ? price > gammaFlip : null;

  const distToCall = price && callWall ? (callWall - price).toFixed(2) : null;
  const distToPut = price && putWall ? (price - putWall).toFixed(2) : null;
  const distToFlip = price && gammaFlip ? (price - gammaFlip).toFixed(2) : null;

  const expectedMove = price ? (price * 0.01).toFixed(2) : null;
  const volatility = gamma?.squeezeRisk === "High" ? "HIGH" : gamma?.squeezeRisk === "Moderate" ? "MODERATE" : "LOW";
  const marketBias = aboveFlip === null ? "NEUTRAL" : aboveFlip ? "BULLISH" : "BEARISH";
  const biasColor = marketBias === "BULLISH" ? "#22c55e" : marketBias === "BEARISH" ? "#ef4444" : "#d4af37";

  const interpretation = [];
  if (price && gammaFlip) {
    interpretation.push(`Price is ${aboveFlip ? "ABOVE" : "BELOW"} Gamma Flip (${fmt(gammaFlip)})`);
  }
  if (gamma?.dealerPositioning) {
    interpretation.push(`Dealer Positioning: ${gamma.dealerPositioning.toUpperCase()}`);
  }
  if (aboveFlip) {
    interpretation.push("Expect mean reversion & lower volatility");
  } else {
    interpretation.push("Expect trend expansion & higher volatility");
  }
  if (callWall) interpretation.push(`Key Resistance: ${callWall}  |  Key Support: ${putWall}`);

  return (
    <main className="pageStack" style={{ maxWidth: "100%", padding: "0 20px 40px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 16px", borderBottom: "1px solid var(--border)" }}>
        <div>
          <div style={{ color: "#d4af37", fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>TRQX MODULE</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "var(--text)" }}>GEMX</h1>
            <span style={{ color: "#9ca3af", fontSize: 14 }}>Gamma Exposure Intelligence</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {quote && (
            <div style={{ textAlign: "right", marginRight: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text)" }}>{ticker}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>${fmtPrice(price)}</div>
              <div style={{ fontSize: 13, color: isUp ? "#22c55e" : "#ef4444" }}>{isUp ? "+" : ""}{fmt(changePct)}%</div>
            </div>
          )}
          <input
            value={tickerInput}
            onChange={e => setTickerInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && setTicker(tickerInput)}
            placeholder="SPY"
            style={{ width: 80, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", padding: "10px 12px", fontSize: 14, fontWeight: 700, outline: "none" }}
          />
          <button onClick={() => setTicker(tickerInput)} style={{ background: "#d4af37", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            GO 🚀
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "8px 14px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ color: "#22c55e", fontSize: 12, fontWeight: 700 }}>MARKET OPEN</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginTop: 20 }}>
        {[
          { label: "CALL WALL", value: callWall ?? "--", sub: "↑ Strong Resistance", color: "#22c55e", icon: "🛡" },
          { label: "PUT WALL", value: putWall ?? "--", sub: "↓ Strong Support", color: "#ef4444", icon: "🛡" },
          { label: "GAMMA FLIP", value: gammaFlip ?? "--", sub: "Key Pivot Level", color: "#d4af37", icon: "⚡" },
          { label: "MAX PAIN", value: maxPain ?? "--", sub: "Pin Risk", color: "#d4af37", icon: "🎯" },
          { label: "SQUEEZE RISK", value: gamma?.squeezeRisk ?? "--", sub: "Elevated Watch", color: gamma?.squeezeRisk === "High" ? "#ef4444" : "#d4af37", icon: "🔥" },
          { label: "DEALER POSITION", value: gamma?.dealerPositioning ?? "--", sub: gamma?.sentiment ?? "--", color: gamma?.dealerPositioning?.includes("Long") ? "#22c55e" : "#ef4444", icon: "🏛" },
        ].map(({ label, value, sub, color, icon }) => (
          <div key={label} style={{ background: "var(--black-3)", border: `1px solid ${color}44`, borderRadius: 12, padding: "16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ color, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>{label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Main Content: Chart + Gauge */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginTop: 16 }}>

        {/* Gamma Exposure Profile */}
        <div style={{ background: "var(--black-3)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ color: "#d4af37", fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>GAMMA EXPOSURE PROFILE</div>
              {price && <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 2 }}>Current Price: ${fmtPrice(price)}</div>}
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, background: "#22c55e", borderRadius: 2 }} /><span style={{ color: "#9ca3af", fontSize: 11 }}>Above Flip</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, background: "#ef4444", borderRadius: 2 }} /><span style={{ color: "#9ca3af", fontSize: 11 }}>Below Flip</span></div>
            </div>
          </div>
          <GammaChart strikeChart={gamma?.strikeChart} callWall={callWall} putWall={putWall} gammaFlip={gammaFlip} price={price} />
        </div>

        {/* Price vs Gamma Flip Gauge */}
        <div style={{ background: "var(--black-3)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ color: "#d4af37", fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>PRICE vs GAMMA FLIP</div>
          <SpeedometerGauge price={price} gammaFlip={gammaFlip} callWall={callWall} putWall={putWall} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {[
              { label: "Distance Above Flip", value: distToFlip ? `${Number(distToFlip) >= 0 ? "+" : ""}${distToFlip}` : "--", color: Number(distToFlip) >= 0 ? "#22c55e" : "#ef4444" },
              { label: "Nearest Resistance", value: callWall ?? "--", color: "#22c55e" },
              { label: "Nearest Support", value: gammaFlip ?? "--", color: "#d4af37" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                <span style={{ color: "#9ca3af", fontSize: 12 }}>{label}</span>
                <span style={{ color, fontSize: 14, fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Interpretation + Volatility + Bias */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 16, marginTop: 16 }}>

        {/* TRQX Interpretation */}
        <div style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(3,7,18,0.99))", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(212,175,55,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🦁</div>
            <div>
              <div style={{ color: "#d4af37", fontSize: 13, fontWeight: 900, letterSpacing: 1 }}>TRQX INTERPRETATION</div>
              <div style={{ color: "#9ca3af", fontSize: 11 }}>{ticker} • Gamma Analysis</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {interpretation.map((line, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ color: "#22c55e", fontSize: 14, marginTop: 1 }}>✓</span>
                <span style={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.5 }}>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expected Volatility */}
        <div style={{ background: "var(--black-3)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ color: "#d4af37", fontSize: 12, fontWeight: 800, letterSpacing: 1, textAlign: "center" }}>EXPECTED VOLATILITY</div>
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: `3px dashed ${gamma?.squeezeRisk === "High" ? "#ef4444" : "#22c55e"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: gamma?.squeezeRisk === "High" ? "#ef4444" : "#22c55e" }}>{volatility}</div>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#9ca3af", fontSize: 12 }}>Expected Daily Move</div>
            <div style={{ color: "var(--text)", fontSize: 22, fontWeight: 900 }}>±${expectedMove ?? "--"}</div>
          </div>
        </div>

        {/* Market Bias */}
        <div style={{ background: "var(--black-3)", border: `1px solid ${biasColor}44`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ color: "#d4af37", fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>MARKET BIAS</div>
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: `3px solid ${biasColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
            {marketBias === "BULLISH" ? "🐂" : marketBias === "BEARISH" ? "🐻" : "➡️"}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: biasColor }}>{marketBias}</div>
            <div style={{ color: "#9ca3af", fontSize: 12 }}>High Probability</div>
            <div style={{ color: "#9ca3af", fontSize: 12 }}>
              {marketBias === "BULLISH" ? "Upward Bias" : marketBias === "BEARISH" ? "Downward Bias" : "Sideways Bias"}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)", color: "#6b7280", fontSize: 12 }}>
        <span>TRQX TERMINAL</span>
        <span>Real-Time Options Flow • Dealer Positioning • Gamma Intelligence</span>
        <span>TRQX 🦁</span>
      </div>

    </main>
  );
}
