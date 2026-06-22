import React, { useEffect, useState } from "react";

const API = "https://trqx-flow-scanner-production.up.railway.app";

const CPI_DATES = [
  new Date("2026-07-15T08:30:00-05:00"),
  new Date("2026-08-12T08:30:00-05:00"),
  new Date("2026-09-10T08:30:00-05:00"),
  new Date("2026-10-14T08:30:00-05:00"),
  new Date("2026-11-13T08:30:00-05:00"),
  new Date("2026-12-10T08:30:00-05:00"),
];

function getNextCPI() {
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

const SYMBOLS = ["SPY", "QQQ", "IWM", "NVDA"];

export default function TopRibbon() {
  const [tiles, setTiles] = useState(SYMBOLS.map(s => ({ symbol: s, price: "—", change: "—", trend: "flat", stale: true })));
  const [lastUpdate, setLastUpdate] = useState(null);
  const [countdown, setCountdown] = useState("—");
  const [cpiLabel, setCpiLabel] = useState("CPI Release");

  useEffect(() => {
    function tick() {
      const next = getNextCPI();
      if (!next) { setCpiLabel("CPI"); setCountdown("—"); return; }
      setCpiLabel(`CPI ${next.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
      setCountdown(formatCountdown(next - new Date()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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

  useEffect(() => {
    fetchTiles();
    const t = setInterval(fetchTiles, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="top">
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

      <div className="statusBox">
        <span className="dot" />
        <div>
          <b>Market Status</b>
          <p>{lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : "Loading..."}</p>
        </div>
      </div>

      <div className="eventBox">
        <b>Next Event</b>
        <p>{cpiLabel}</p>
        <span>{countdown}</span>
      </div>
    </header>
  );
}
