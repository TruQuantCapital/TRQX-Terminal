import React, { useEffect, useState } from "react";

const API = "https://trqx-flow-scanner-production.up.railway.app";

const MAJOR_EVENTS = [
  { name: "CPI", date: new Date("2026-07-14T08:30:00-04:00") },
  { name: "PPI", date: new Date("2026-07-15T08:30:00-04:00") },
  { name: "FOMC", date: new Date("2026-07-29T14:00:00-04:00") },
  { name: "GDP", date: new Date("2026-07-30T08:30:00-04:00") },
  { name: "PCE", date: new Date("2026-07-30T08:30:00-04:00") },
  { name: "NFP", date: new Date("2026-08-07T08:30:00-04:00") },
  { name: "CPI", date: new Date("2026-08-12T08:30:00-04:00") },
  { name: "PPI", date: new Date("2026-08-13T08:30:00-04:00") },
  { name: "GDP", date: new Date("2026-08-26T08:30:00-04:00") },
  { name: "NFP", date: new Date("2026-09-04T08:30:00-04:00") },
  { name: "PPI", date: new Date("2026-09-10T08:30:00-04:00") },
  { name: "CPI", date: new Date("2026-09-11T08:30:00-04:00") },
  { name: "FOMC", date: new Date("2026-09-16T14:00:00-04:00") },
  { name: "GDP", date: new Date("2026-09-30T08:30:00-04:00") },
].sort((a, b) => a.date - b.date);

function function getNextMajorEvent() {
  const now = Date.now();
  const liveWindow = 30 * 60 * 1000;

  return (
    MAJOR_EVENTS.find(
      (event) => event.date.getTime() + liveWindow > now
    ) ?? null
  );
}() {
  const now = new Date();
  return CPI_DATES.find((d) => d > now) ?? null;
}

function formatCountdown(ms) {
  if (ms <= 0) return "LIVE NOW";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hrs = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}d ${String(hrs).padStart(2,"0")}h ${String(mins).padStart(2,"0")}m`;
  return `${String(hrs).padStart(2,"0")}h ${String(mins).padStart(2,"0")}m ${String(secs).padStart(2,"0")}s`;
}

function Sparkline({ trend }) {
  const points =
    trend === "up" ? "0,32 20,28 40,22 55,24 72,14 90,18 120,6"
    : trend === "down" ? "0,10 18,15 36,13 55,22 75,18 94,29 120,32"
    : "0,22 20,20 40,21 60,20 80,22 100,21 120,20";
  return (
    <svg className="spark" viewBox="0 0 120 38" preserveAspectRatio="none">
      <polyline points={points} fill="none"
        stroke={trend === "up" ? "var(--green)" : trend === "down" ? "var(--red)" : "var(--muted)"}
        strokeWidth="3" />
    </svg>
  );
}

function fmt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtPrem(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n/1000).toFixed(0)}K`;
  return `$${n}`;
}

const SYMBOLS = ["SPY", "QQQ", "IWM", "NVDA"];

export default function TopRibbon() {
  const [tiles, setTiles] = useState(SYMBOLS.map(s => ({ symbol: s, price: "—", change: "—", trend: "flat", stale: true })));
  const [flowStats, setFlowStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [countdown, setCountdown] = useState("—");
  const [eventLabel, setEventLabel] = useState("Loading...");

  // CPI countdown
  useEffect(() => {
  function tick() {
    const next = getNextMajorEvent();

    if (!next) {
      setEventLabel("No Scheduled Events");
      setCountdown("—");
      return;
    }

    const displayDate = next.date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "America/New_York",
    });

    setEventLabel(`${next.name} ${displayDate}`);
    setCountdown(formatCountdown(next.date.getTime() - Date.now()));
  }

  tick();
  const id = setInterval(tick, 1000);

  return () => clearInterval(id);
}, []);

  // Stock quotes
  async function fetchTiles() {
    const results = await Promise.all(SYMBOLS.map(async (symbol) => {
      try {
        const res = await fetch(`${API}/api/quote/${symbol}`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        const price = data.price ?? data.last ?? null;
        const changePct = data.changePct ?? data.change_percent ?? null;
        if (!price || Number(price) === 0) throw new Error("no price");
        const trend = Number(changePct) > 0 ? "up" : Number(changePct) < 0 ? "down" : "flat";
        return { symbol, price: fmt(price), change: fmtPct(changePct), trend, stale: false };
      } catch {
        return { symbol, price: "—", change: "—", trend: "flat", stale: true };
      }
    }));
    setTiles(results);
    setLastUpdate(new Date());
  }

  // Flow stats
  async function fetchFlowStats() {
    try {
      const res = await fetch(`${API}/api/flow/stats`);
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setFlowStats(data);
    } catch {
      setFlowStats(null);
    }
  }

  useEffect(() => {
    fetchTiles();
    fetchFlowStats();
    const t1 = setInterval(fetchTiles, 30000);
    const t2 = setInterval(fetchFlowStats, 15000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const sentimentColor = flowStats?.sentiment === "Bullish" ? "var(--green)"
    : flowStats?.sentiment === "Bearish" ? "var(--red)"
    : "var(--gold)";

  return (
    <header className="top">
      {/* Stock tiles */}
      {tiles.map((m) => (
        <div className="ticker" key={m.symbol} style={m.stale ? { opacity: 0.45 } : {}}>
          <div className="tickerText">
            <b>{m.symbol}</b>
            <span>{m.price}</span>
            <em className={m.trend === "up" ? "positive" : m.trend === "down" ? "negative" : ""}>
              {m.change}
            </em>
          </div>
          <Sparkline trend={m.trend} />
        </div>
      ))}

      {/* Flow stat tiles */}
      {flowStats && (
        <>
          <div className="ticker flowTile">
            <div className="tickerText">
              <b>FLOW SENTIMENT</b>
              <span style={{ color: sentimentColor, fontSize: "16px" }}>{flowStats.sentiment?.toUpperCase() ?? "—"}</span>
              <em style={{ color: sentimentColor }}>Ratio {flowStats.ratio ?? "—"}</em>
            </div>
          </div>

          <div className="ticker flowTile">
            <div className="tickerText">
              <b>CALL PREMIUM</b>
              <span style={{ color: "var(--green)", fontSize: "16px" }}>{fmtPrem(flowStats.callPremium)}</span>
              <em style={{ color: "var(--muted)" }}>{flowStats.sweepCount} sweeps</em>
            </div>
          </div>

          <div className="ticker flowTile">
            <div className="tickerText">
              <b>PUT PREMIUM</b>
              <span style={{ color: "var(--red)", fontSize: "16px" }}>{fmtPrem(flowStats.putPremium)}</span>
              <em style={{ color: "var(--muted)" }}>{flowStats.blockCount} blocks</em>
            </div>
          </div>
        </>
      )}

      {/* Market Status */}
      <div className="statusBox">
        <span className="dot" />
        <div>
          <b>Market Status</b>
          <p>{lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : "Loading..."}</p>
        </div>
      </div>

      {/* Next Event */}
      <div className="eventBox">
        <b>Next Event</b>
        <p>{eventLabel}</p>
        <span>{countdown}</span>
      </div>
    </header>
  );
}
