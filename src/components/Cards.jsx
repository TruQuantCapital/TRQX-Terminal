import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Waves, Crown, ExternalLink } from "lucide-react";
import DataTable from "./DataTable";
import { useAuth } from "../hooks/useAuth";
import {
  economicRows,
  gammaMetrics,
  optionsFlowRows,
  scannerRows,
} from "../data/mockData";

const API = "https://trqx-flow-scanner-production.up.railway.app";

/* ────────────────────────────────────────────────────────────
   Market hours (America/New_York) — mirrors backend v2.5 gate.
   Weekends, NYSE holidays, and 9:30–4:00 (1:00 on early closes).
──────────────────────────────────────────────────────────── */
const NYSE_HOLIDAYS = new Set([
  // 2026
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25",
  "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  // 2027
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31",
  "2027-06-18", "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24",
]);
const NYSE_EARLY_CLOSE = new Set(["2026-11-27", "2026-12-24", "2027-11-26"]);

function getETParts() {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map(x => [x.type, x.value]));
  return {
    dateStr: `${p.year}-${p.month}-${p.day}`,
    weekday: p.weekday,
    minutes: parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10),
  };
}

export function isMarketOpen() {
  const { dateStr, weekday, minutes } = getETParts();
  if (weekday === "Sat" || weekday === "Sun") return false;
  if (NYSE_HOLIDAYS.has(dateStr)) return false;
  const close = NYSE_EARLY_CLOSE.has(dateStr) ? 13 * 60 : 16 * 60;
  return minutes >= 9 * 60 + 30 && minutes < close;
}

function useMarketOpen() {
  const [open, setOpen] = useState(isMarketOpen);
  useEffect(() => {
    const i = setInterval(() => setOpen(isMarketOpen()), 60_000);
    return () => clearInterval(i);
  }, []);
  return open;
}

function ClosedChip({ compact = false }) {
  return (
    <span style={{
      background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.4)",
      color: "#d4af37", fontSize: compact ? "9px" : "10px", fontWeight: 800,
      letterSpacing: "1px", padding: compact ? "2px 8px" : "3px 10px",
      borderRadius: "6px", whiteSpace: "nowrap",
    }}>
      MARKET CLOSED · LAST SESSION
    </span>
  );
}

export function GaugeCard() {
  const [stats, setStats] = useState(null);
  const [time, setTime] = useState("");
  const open = useMarketOpen();

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
    // 15s while the market is open; 5 min when closed (data can't change)
    const t = setInterval(fetchStats, open ? 15_000 : 300_000);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }));
    };
    tick();
    const clock = setInterval(tick, 60_000);
    return () => clearInterval(clock);
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

  // Key drivers — every value below is derived from REAL flow stats.
  // (The old VIX tile was a synthetic number invented from sweep count;
  //  VIX was removed from the backend rotation in v2.5, so it's gone here too.)
  const putCall = (putPrem / (callPrem + putPrem + 1)).toFixed(2);
  const fmtM = (v) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(0)}K` : `$${v}`;

  const keyDrivers = [
    { label: "SWEEP ACTIVITY", sub: "Aggressive Orders", value: sweeps, change: sweeps > 80 ? "Elevated" : sweeps > 40 ? "Active" : "Quiet", changeColor: sweeps > 80 ? "#ef4444" : sweeps > 40 ? "#d4af37" : "#22c55e" },
    { label: "BLOCK ACTIVITY", sub: "Institutional Size", value: blocks, change: blocks > 30 ? "Heavy" : blocks > 10 ? "Moderate" : "Light", changeColor: blocks > 30 ? "#22c55e" : "#d4af37" },
    { label: "CALL PREMIUM", sub: "Bullish Flow", value: fmtM(callPrem), change: ratio > 1 ? "Leading" : "Lagging", changeColor: ratio > 1 ? "#22c55e" : "#ef4444" },
    { label: "PUT/CALL RATIO", sub: "Options Sentiment", value: putCall, change: Number(putCall) > 0.5 ? "Hedging" : "Normal", changeColor: Number(putCall) > 0.5 ? "#ef4444" : "#22c55e" },
    { label: "DEALER GAMMA", sub: "Positioning (Est.)", value: ratio > 1.1 ? "LONG" : "SHORT", change: ratio > 1.1 ? "Positive" : "Negative", changeColor: ratio > 1.1 ? "#22c55e" : "#ef4444" },
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
    <section className="card regime full" style={{ padding: 0, overflow: "hidden", background: "#0a0f1a", border: "1px solid rgba(255,255,255,0.08)" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", fontFamily: "var(--font-head)" }}>MARKET REGIME</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {!open && <ClosedChip />}
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>⏱</span> LAST UPDATED: {time}
          </div>
        </div>
      </div>

      {/* Regime Hero */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: regimeBg, border: `1px solid ${regimeColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0 }}>
          {regimeIcon}
        </div>
        <div>
          <div style={{ color: regimeColor, fontSize: "28px", fontWeight: 900, fontFamily: "var(--font-head)", letterSpacing: "2px", lineHeight: 1 }}>{regime}</div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", marginTop: "4px", lineHeight: 1.5, maxWidth: "400px" }}>
            {regimeDesc}{!open && " Regime reflects the most recent completed session."}
          </div>
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
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 200px", minWidth: 0, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>

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
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", fontFamily: "var(--font-head)", marginBottom: "14px" }}>KEY DRIVERS — LIVE FLOW</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {keyDrivers.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                    {["⚡", "🏦", "📈", "🔄", "🎯"][i]}
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
      <a onClick={() => navigate("/economic-calendar")} style={{ cursor: "pointer" }}>View Full Calendar →</a>
    </section>
  );
}

export function AiSummary() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { getToken } = useAuth();

  useEffect(() => {
    let cancelled = false;
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
        const callM = Math.round((flow.callPremium || 0) / 1000000);
        const putM = Math.round((flow.putPremium || 0) / 1000000);
        const ratio = callM > 0 && putM > 0 ? (callM / putM).toFixed(2) : "N/A";
        const sentiment = flow.sentiment || "Neutral";
        const sweeps = flow.sweepCount || 0;
        const blocks = flow.blockCount || 0;

        const open = isMarketOpen();
        const statusLine = open
          ? "MARKET STATUS: OPEN — the flow data below is from the live session."
          : "MARKET STATUS: CLOSED — the flow data below is from the most recent completed trading session. Frame this brief as a recap of that session plus what to watch when the market reopens. Do NOT write as if trading is currently happening.";

        const prompt = `You are a professional market analyst at TRQX Capital delivering a market intelligence brief to active traders.

${statusLine}

OPTIONS FLOW DATA:
- Flow Sentiment: ${sentiment}
- Call Premium: $${callM}M | Put Premium: $${putM}M | Call/Put Ratio: ${ratio}
- Sweep Count: ${sweeps} | Block Count: ${blocks}
- Bias: ${callM > putM ? "Bullish — institutions are aggressively buying calls" : putM > callM ? "Bearish — institutions are hedging or buying puts" : "Neutral — balanced flow"}

ECONOMIC CALENDAR (Today & Next 48 Hours):
${eventText}

Write a detailed brief using ONLY plain text — no markdown, no hashtags, no asterisks, no bullet symbols other than a dash.

Structure your response exactly as follows:

MARKET OVERVIEW
Write 3 sentences summarizing market conditions combining the options flow data and economic calendar context.

FLOW ANALYSIS
Write 2 sentences explaining what the institutional options flow is signaling and what it means for traders.

KEY EVENTS TO WATCH
List each major economic event with its forecast vs prior value and explain in one sentence what a surprise in either direction would mean for markets. Format each as: EVENT NAME - Forecast: X, Prior: Y. Impact: [your interpretation]

TRADE BIAS
State clearly: BULLISH, BEARISH, or NEUTRAL. Then write 2 sentences explaining why based on the combination of flow data and upcoming events.

WATCH LIST ITEMS
List exactly 4 specific things traders should monitor, each starting with a dash. Be specific — name tickers, levels, or indicators where relevant.

RISK FACTORS
List 2 things that could invalidate the current bias, each starting with a dash.`;

        const tok = (await getToken?.()) || "";
        const aiRes = await fetch(API + "/api/market-intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok },
          body: JSON.stringify({ prompt }),
        });
        if (cancelled) return;
        if (aiRes.ok) {
          const data = await aiRes.json();
          if (data.reply) {
            setAnalysis(data.reply);
          } else {
            setFailed(true);
          }
        } else {
          setFailed(true);
        }
      } catch (e) {
        console.log("AiSummary error:", e);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const retry = () => { setFailed(false); setAnalysis(null); setLoading(true); setReloadKey(k => k + 1); };

  const textLines = analysis ? analysis.split("\n").filter(function(l) { return l.trim(); }) : [];
  const isBullish = analysis && analysis.toLowerCase().includes("bullish");
  const isBearish = analysis && analysis.toLowerCase().includes("bearish");
  const sentimentColor = isBullish ? "#22c55e" : isBearish ? "#ef4444" : "#d4af37";
  const sentimentLabel = isBullish ? "BULLISH" : isBearish ? "BEARISH" : "NEUTRAL";

  return (
    <section className="card ai">
      <div className="cardTitle purple" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <span>Market Intelligence <span>TRQX AI</span></span>
        {!isMarketOpen() && <ClosedChip compact />}
      </div>
      {loading ? (
        <p style={{ color: "#9ca3af", fontSize: "13px" }}>Analyzing market conditions...</p>
      ) : analysis ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ background: sentimentColor + "20", border: "1px solid " + sentimentColor + "60", color: sentimentColor, fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "6px", letterSpacing: "0.08em" }}>
              {sentimentLabel}
            </span>
            <span style={{ color: "#9ca3af", fontSize: "11px" }}>for equities</span>
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
        <div style={{ padding: "8px 0" }}>
          <p style={{ color: "#9ca3af", fontSize: "13px", margin: "0 0 10px" }}>
            Market intelligence is unavailable right now. This can happen briefly after a deploy or if the AI service is busy.
          </p>
          <button onClick={retry} style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)", color: "#d4af37", fontSize: "12px", fontWeight: 700, padding: "6px 16px", borderRadius: "8px", cursor: "pointer" }}>
            ↻ Retry
          </button>
        </div>
      )}
    </section>
  );
}

const SECTOR_ETFS = [
  ["XLK", "Technology"],
  ["XLC", "Communication"],
  ["XLF", "Financials"],
  ["XLY", "Consumer Disc."],
  ["XLP", "Consumer Staples"],
  ["XLI", "Industrials"],
  ["XLE", "Energy"],
  ["XLV", "Healthcare"],
  ["XLU", "Utilities"],
  ["XLB", "Materials"],
  ["XLRE", "Real Estate"],
];

export function BreadthCard() {
  const open = useMarketOpen();
  const [sectors, setSectors] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    async function fetchBreadth() {
      const results = await Promise.all(SECTOR_ETFS.map(async ([sym, name]) => {
        try {
          const res = await fetch(`${API}/api/quote/${sym}`);
          if (!res.ok) throw new Error("failed");
          const d = await res.json();
          return { sym, name, changePct: d.changePct != null ? Number(d.changePct) : null };
        } catch {
          return { sym, name, changePct: null };
        }
      }));
      if (!cancelled) setSectors(results);
    }
    fetchBreadth();
    // 2 min while open; 5 min when closed (sector prices are frozen)
    const t = setInterval(fetchBreadth, open ? 120_000 : 300_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [open]);

  const valid = (sectors || []).filter(s => s.changePct != null);
  const advancing = valid.filter(s => s.changePct > 0.05).length;
  const declining = valid.filter(s => s.changePct < -0.05).length;
  const unchanged = valid.length - advancing - declining;
  const advPct = valid.length ? Math.round((advancing / valid.length) * 100) : 0;
  const decPct = valid.length ? Math.round((declining / valid.length) * 100) : 0;
  const unchPct = Math.max(0, 100 - advPct - decPct);

  const sorted = [...valid].sort((a, b) => b.changePct - a.changePct);
  const maxAbs = Math.max(0.2, ...valid.map(s => Math.abs(s.changePct)));

  // Donut geometry
  const R = 40;
  const C = 2 * Math.PI * R;
  const advLen = (advPct / 100) * C;
  const decLen = (decPct / 100) * C;
  const unchLen = Math.max(0, C - advLen - decLen);

  return (
    <section className="card breadth">
      <div className="cardTitle" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
        <span>Market Breadth <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: 600, letterSpacing: "1px" }}>S&P 500 SECTORS</span></span>
        {!open && <ClosedChip compact />}
      </div>

      {sectors === null ? (
        <div style={{ color: "#9ca3af", fontSize: "13px", padding: "16px 0" }}>Loading sector data...</div>
      ) : valid.length === 0 ? (
        <div style={{ color: "#9ca3af", fontSize: "13px", padding: "16px 0" }}>Sector data is unavailable right now. It will retry automatically.</div>
      ) : (
        <>
          {/* Live donut: advancing / declining / unchanged sectors */}
          <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 2px" }}>
            <svg width="110" height="110" viewBox="0 0 110 110">
              <g transform="rotate(-90 55 55)">
                <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
                <circle cx="55" cy="55" r={R} fill="none" stroke="#22c55e" strokeWidth="14"
                  strokeDasharray={`${advLen} ${C - advLen}`} strokeDashoffset="0" />
                <circle cx="55" cy="55" r={R} fill="none" stroke="#ef4444" strokeWidth="14"
                  strokeDasharray={`${decLen} ${C - decLen}`} strokeDashoffset={-advLen} />
                <circle cx="55" cy="55" r={R} fill="none" stroke="#6b7280" strokeWidth="14"
                  strokeDasharray={`${unchLen} ${C - unchLen}`} strokeDashoffset={-(advLen + decLen)} />
              </g>
              <text x="55" y="52" textAnchor="middle" fontSize="20" fontWeight="800" fill={advPct >= 50 ? "#22c55e" : "#ef4444"} fontFamily="monospace">{advPct}%</text>
              <text x="55" y="66" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="monospace" letterSpacing="1">ADVANCING</text>
            </svg>
          </div>

          <div className="breadStats">
            <span><b className="positive">{advancing}</b> Advancing</span>
            <span><b className="negative">{declining}</b> Declining</span>
            <span><b>{unchanged}</b> Flat</span>
          </div>

          {/* Market Breadth Summary */}
          <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 10, padding: "12px 14px", margin: "10px 0" }}>
            <div style={{ color: "#d4af37", fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>WHAT THIS MEANS</div>
            <div style={{ color: "#d1d5db", fontSize: 12, lineHeight: 1.7 }}>
              {(() => {
                const closedNote = open ? "" : "Market is closed — breadth reflects the last session. ";
                if (advPct >= 65) return closedNote + "Strong broad participation — most sectors are advancing, signaling healthy market internals. This suggests moves have institutional backing rather than a few mega-caps carrying the index. Favor long setups and momentum plays.";
                if (advPct >= 45) return closedNote + "Mixed breadth — sector participation is split and conviction is moderate. Stick to high-quality setups with strong flow confirmation. Avoid chasing extended names.";
                return closedNote + "Weak breadth — most sectors are declining, signaling broad market weakness. Even if the index looks stable, internals are deteriorating. Reduce position size, tighten stops, and favor defensive names or cash.";
              })()}
            </div>
          </div>

          <div className="sectorList">
            {sorted.map((s) => {
              const pos = s.changePct >= 0;
              const width = Math.min(98, Math.max(5, 50 + (s.changePct / maxAbs) * 45));
              return (
                <div className="sector" key={s.sym}>
                  <span>{s.name}</span>
                  <div><i style={{ width: `${width}%`, background: pos ? "#22c55e" : "#ef4444" }}></i></div>
                  <b className={pos ? "positive" : "negative"}>
                    {pos ? "+" : ""}{s.changePct.toFixed(2)}%
                  </b>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

export function GammaCard({ full = false }) {
  const navigate = useNavigate();
  const [tickerInput, setTickerInput] = useState("SPY");
  const [ticker, setTicker] = useState("SPY");
  const [gamma, setGamma] = useState(null);
  const open = useMarketOpen();

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
    // 30s while open; 5 min when closed (levels can't change)
    const t = setInterval(fetchGamma, open ? 30_000 : 300_000);
    return () => clearInterval(t);
  }, [ticker, open]);

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
    <section className={`card gamma ${full ? "fullPageCard" : ""}`} style={{ height: "100%" }}>
      <div className="cardTitle purple" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/gamma-ex")}>Gamma Exposure ({gamma?.ticker ?? ticker})</span>
          {!open && <ClosedChip compact />}
        </span>
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
      {/* Gamma Summary */}
      {gamma && (
        <div style={{ marginTop: 12, background: "rgba(159,107,255,0.06)", border: "1px solid rgba(159,107,255,0.2)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ color: "#9f6bff", fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>GAMMA SUMMARY — {gamma.ticker}</div>
          <div style={{ color: "#d1d5db", fontSize: 12, lineHeight: 1.7 }}>
            {(() => {
              const flip = gamma.gammaFlip;
              const callWall = gamma.callWall;
              const putWall = gamma.putWall;
              const positioning = gamma.dealerPositioning;
              const squeeze = gamma.squeezeRisk;
              if (!flip) return "Loading gamma analysis...";
              const closedNote = open ? "" : "Market is closed — these levels reflect the most recent completed session and will refresh at the next open. ";
              if (positioning === "Long Gamma") {
                return `${closedNote}Dealers are LONG gamma on ${gamma.ticker} — this means they buy dips and sell rips, creating a stabilizing effect between the ${putWall} put wall and ${callWall} call wall. Price is likely to pin near ${flip} (gamma flip). Expect dampened volatility and range-bound action unless price breaks through a key wall. Squeeze risk is ${squeeze?.toLowerCase()}.`;
              } else {
                return `${closedNote}Dealers are SHORT gamma on ${gamma.ticker} — this means they amplify price moves in both directions. With the gamma flip at ${flip}, any break above ${callWall} or below ${putWall} could trigger accelerated dealer hedging and explosive moves. Squeeze risk is ${squeeze?.toLowerCase()} — size accordingly and use tight stops.`;
              }
            })()}
          </div>
        </div>
      )}
    </section>
  );
}

export function ScannerCard({ full = false }) {
  const navigate = useNavigate();
  return (
    <section className={`card scanner ${full ? "fullPageCard" : ""}`} style={{ height: "100%" }}>
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
      <a onClick={() => navigate("/scanner")} style={{ cursor: "pointer" }}>View Full Scanner →</a>
    </section>
  );
}

export function OptionsFlowCard({ full = false }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState(optionsFlowRows);
  const [query, setQuery] = useState("");
  const open = useMarketOpen();

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
    // 15s while open; 5 min when closed (no new prints arrive)
    const interval = setInterval(fetchFlow, open ? 15_000 : 300_000);
    return () => clearInterval(interval);
  }, [open]);

  const filteredRows = rows
    .filter((r) => {
      const q = query.trim().toUpperCase();
      if (!q) return true;
      return String(r.ticker || "").toUpperCase().includes(q);
    })
    .slice(0, full ? 25 : 8);

  return (
    <section className={`card options ${full ? "fullPageCard" : ""}`} style={{ height: "100%" }}>
      <div className="cardTitle purple" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <span>Options Flow</span>
        {!open && <ClosedChip compact />}
      </div>

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

      <a onClick={() => navigate("/options-flow")} style={{ cursor: "pointer" }}>{query ? `Showing ${filteredRows.length} result(s) for ${query.toUpperCase()}` : "View All Options Flow →"}</a>
    </section>
  );
}

export function WatchlistCard() {
  const navigate = useNavigate();
  const open = useMarketOpen();
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
    // 30s while open; 5 min when closed (prices are frozen)
    const t = setInterval(fetchPrices, open ? 30_000 : 300_000);
    return () => clearInterval(t);
  }, [open]);

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
    fetch(`${API}/api/news?limit=6`)
      .then(r => r.ok ? r.json() : { rows: [] })
      .then(data => { setRows(data.rows || []); setLoading(false); })
      .catch(() => setLoading(false));
    const interval = setInterval(() => {
      fetch(`${API}/api/news?limit=6`)
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
      <a onClick={() => navigate("/news")} style={{ cursor: "pointer" }}>View All News →</a>
    </section>
  );
}

export function AcademyCard() {
  const navigate = useNavigate();
  return (
    <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>

      {/* Options Flow */}
      <div onClick={() => navigate("/options-flow")} style={{ cursor: "pointer", background: "linear-gradient(135deg, rgba(15,23,42,.96), rgba(3,7,18,.98))", border: "1px solid rgba(212,175,55,.2)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ color: "#d4af37", fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>TRADING TOOLS</div>
        <div style={{ color: "#f5f1e8", fontSize: 16, fontWeight: 800 }}>⚡ Options Flow</div>
        <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.6 }}>Track institutional call and put sweeps in real time. Learn how to read flow direction and size for trade conviction.</div>
        <div style={{ color: "#d4af37", fontSize: 12, fontWeight: 700, marginTop: "auto" }}>View Options Flow →</div>
      </div>

      {/* Flow Scanner */}
      <div onClick={() => navigate("/scanner")} style={{ cursor: "pointer", background: "linear-gradient(135deg, rgba(15,23,42,.96), rgba(3,7,18,.98))", border: "1px solid rgba(212,175,55,.2)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ color: "#d4af37", fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>TRADING TOOLS</div>
        <div style={{ color: "#f5f1e8", fontSize: 16, fontWeight: 800 }}>🔍 Flow Scanner</div>
        <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.6 }}>Live options flow scanner with TRQX Flow Score. Filter by sweeps, blocks, and unusual activity across all tickers.</div>
        <div style={{ color: "#d4af37", fontSize: 12, fontWeight: 700, marginTop: "auto" }}>View Flow Scanner →</div>
      </div>

      {/* GEMX */}
      <div onClick={() => navigate("/gamma-ex")} style={{ cursor: "pointer", background: "linear-gradient(135deg, rgba(15,23,42,.96), rgba(3,7,18,.98))", border: "1px solid rgba(212,175,55,.2)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ color: "#d4af37", fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>TRADING TOOLS</div>
        <div style={{ color: "#f5f1e8", fontSize: 16, fontWeight: 800 }}>📊 GEMX Dashboard</div>
        <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.6 }}>Gamma exposure levels, call wall, put wall, and gamma flip for SPY and QQQ. Essential for understanding dealer positioning.</div>
        <div style={{ color: "#d4af37", fontSize: 12, fontWeight: 700, marginTop: "auto" }}>View GEMX →</div>
      </div>

      {/* Academy Progress */}
      <div onClick={() => navigate("/academy")} style={{ cursor: "pointer", background: "linear-gradient(135deg, rgba(15,23,42,.96), rgba(3,7,18,.98))", border: "1px solid rgba(212,175,55,.2)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ color: "#d4af37", fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>ACADEMY</div>
        <div style={{ color: "#f5f1e8", fontSize: 16, fontWeight: 800 }}>🎓 Your Progress</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
              <span>Beginner</span><span>75%</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,.08)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "75%", background: "#22c55e", borderRadius: 999 }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
              <span>Intermediate</span><span>45%</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,.08)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "45%", background: "#a78bfa", borderRadius: 999 }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
              <span>Advanced</span><span>20%</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,.08)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "20%", background: "#d4af37", borderRadius: 999 }} />
            </div>
          </div>
        </div>
        <div style={{ color: "#d4af37", fontSize: 12, fontWeight: 700, marginTop: "auto" }}>Continue Learning →</div>
      </div>

    </section>
  );
}
