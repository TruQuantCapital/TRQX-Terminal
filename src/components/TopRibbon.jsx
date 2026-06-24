import React, { useEffect, useState } from "react";

const API = "https://trqx-flow-scanner-production.up.railway.app";

<<<<<<< HEAD
const DEFAULT_TILES = [
  { label: "SPY", symbol: "SPY", price: "—", change: "—", trend: "flat" },
  { label: "QQQ", symbol: "QQQ", price: "—", change: "—", trend: "flat" },
  { label: "IWM", symbol: "IWM", price: "—", change: "—", trend: "flat" },
  { label: "NVDA", symbol: "NVDA", price: "—", change: "—", trend: "flat" },

  { label: "/ES", symbol: "ES=F", price: "—", change: "—", trend: "flat" },
  { label: "/NQ", symbol: "NQ=F", price: "—", change: "—", trend: "flat" },
  { label: "/RTY", symbol: "RTY=F", price: "—", change: "—", trend: "flat" },
  { label: "/YM", symbol: "YM=F", price: "—", change: "—", trend: "flat" },
];

// Update these dates each quarter
const CPI_DATES = [
  new Date("2026-07-15T08:30:00-05:00"),
  new Date("2026-08-12T08:30:00-05:00"),
  new Date("2026-09-10T08:30:00-05:00"),
  new Date("2026-10-14T08:30:00-05:00"),
  new Date("2026-11-13T08:30:00-05:00"),
  new Date("2026-12-10T08:30:00-05:00"),
];

=======
const CPI_DATES = [
  new Date("2026-07-15T08:30:00-05:00"),
  new Date("2026-08-12T08:30:00-05:00"),
  new Date("2026-09-10T08:30:00-05:00"),
  new Date("2026-10-14T08:30:00-05:00"),
  new Date("2026-11-13T08:30:00-05:00"),
  new Date("2026-12-10T08:30:00-05:00"),
];

>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
function getNextCPI() {
  const now = new Date();
  return CPI_DATES.find((d) => d > now) ?? null;
}

function formatCountdown(ms) {
  if (ms <= 0) return "LIVE NOW";
<<<<<<< HEAD

=======
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hrs = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
<<<<<<< HEAD

  if (days > 0) {
    return `${days}d ${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
  }

  return `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
=======
  if (days > 0) return `${days}d ${String(hrs).padStart(2,"0")}h ${String(mins).padStart(2,"0")}m`;
  return `${String(hrs).padStart(2,"0")}h ${String(mins).padStart(2,"0")}m ${String(secs).padStart(2,"0")}s`;
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
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

<<<<<<< HEAD
function formatPrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatChangePct(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";

  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
=======
function fmt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
}

const SYMBOLS = ["SPY", "QQQ", "IWM", "NVDA"];

export default function TopRibbon() {
  const [tiles, setTiles] = useState(SYMBOLS.map(s => ({ symbol: s, price: "—", change: "—", trend: "flat", stale: true })));
  const [lastUpdate, setLastUpdate] = useState(null);
  const [countdown, setCountdown] = useState("—");
<<<<<<< HEAD
  const [cpiLabel, setCpiLabel] = useState("Next CPI");
=======
  const [cpiLabel, setCpiLabel] = useState("CPI Release");
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20

  useEffect(() => {
    function tick() {
      const next = getNextCPI();
<<<<<<< HEAD

      if (!next) {
        setCpiLabel("CPI");
        setCountdown("No upcoming CPI");
        return;
      }

      setCpiLabel(
        `CPI ${next.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`
      );

      setCountdown(formatCountdown(next - new Date()));
    }

    tick();
    const id = setInterval(tick, 1000);

    return () => clearInterval(id);
  }, []);

  async function fetchOne(item) {
    try {
      const res = await fetch(`${API}/api/quote/${encodeURIComponent(item.symbol)}`);

      if (!res.ok) {
        throw new Error(`Quote failed for ${item.symbol}`);
      }

      const data = await res.json();

      const price = data.price ?? data.last ?? data.c ?? data.close ?? null;

      const changePct =
        data.changePct ??
        data.change_percent ??
        data.percentChange ??
        data.dp ??
        null;

      if (!price || Number(price) === 0) {
        throw new Error(`Bad price for ${item.symbol}`);
      }

      const trend =
        Number(changePct) > 0 ? "up" : Number(changePct) < 0 ? "down" : "flat";

      return {
        ...item,
        price: formatPrice(price),
        change: formatChangePct(changePct),
        trend,
        stale: false,
      };
    } catch {
      return {
        ...item,
        price: "—",
        change: "—",
        trend: "flat",
        stale: true,
      };
=======
      if (!next) { setCpiLabel("CPI"); setCountdown("—"); return; }
      setCpiLabel(`CPI ${next.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
      setCountdown(formatCountdown(next - new Date()));
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

<<<<<<< HEAD
  async function fetchMarketTiles() {
    const results = await Promise.all(DEFAULT_TILES.map(fetchOne));
=======
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
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
    setTiles(results);
    setLastUpdate(new Date());
  }

  useEffect(() => {
<<<<<<< HEAD
    fetchMarketTiles();

    const interval = setInterval(fetchMarketTiles, 30000);

    return () => clearInterval(interval);
=======
    fetchTiles();
    const t = setInterval(fetchTiles, 30000);
    return () => clearInterval(t);
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
  }, []);

  return (
    <header className="top">
<<<<<<< HEAD
      <div className="tickerWrap">
        {tiles.map((m) => (
          <div
            className="ticker"
            key={m.symbol}
            style={m.stale ? { opacity: 0.45 } : {}}
          >
            <div>
              <b>{m.label}</b>
              <span>{m.price}</span>
              <em
                className={
                  m.trend === "up"
                    ? "positive"
                    : m.trend === "down"
                    ? "negative"
                    : ""
                }
              >
                {m.change}
              </em>
            </div>

            <Sparkline trend={m.trend} />
=======
      {tiles.map((m) => (
        <div className="ticker" key={m.symbol} style={m.stale ? { opacity: 0.45 } : {}}>
          <div className="tickerText">
            <b>{m.symbol}</b>
            <span>{m.price}</span>
            <em className={m.trend === "up" ? "positive" : m.trend === "down" ? "negative" : ""}>
              {m.change}
            </em>
>>>>>>> 53602ddfbaf52bec6ecb617c09eb0de6cea1ab20
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
