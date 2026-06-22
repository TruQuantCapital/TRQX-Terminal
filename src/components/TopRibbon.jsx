import React, { useEffect, useState } from "react";

const API = "https://trqx-flow-scanner-production.up.railway.app";

const DEFAULT_TILES = [
  { symbol: "SPY", price: "—", change: "—", trend: "flat" },
  { symbol: "QQQ", price: "—", change: "—", trend: "flat" },
  { symbol: "IWM", price: "—", change: "—", trend: "flat" },
  { symbol: "SPX", price: "—", change: "—", trend: "flat" },
];

// ── CPI dates for 2025 – update this array each quarter ──────────────────
const CPI_DATES = [
  new Date("2025-07-15T08:30:00-05:00"),
  new Date("2025-08-12T08:30:00-05:00"),
  new Date("2025-09-10T08:30:00-05:00"),
  new Date("2025-10-14T08:30:00-05:00"),
  new Date("2025-11-13T08:30:00-05:00"),
  new Date("2025-12-10T08:30:00-05:00"),
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
  if (days > 0) return `${days}d ${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
  return `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
}

function Sparkline({ trend }) {
  const points =
    trend === "up"
      ? "0,32 20,28 40,22 55,24 72,14 90,18 120,6"
      : trend === "down"
      ? "0,10 18,15 36,13 55,22 75,18 94,29 120,32"
      : "0,22 20,20 40,21 60,20 80,22 100,21 120,20";

  return (
    <svg className="spark" viewBox="0 0 120 38" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={
          trend === "up"
            ? "var(--green)"
            : trend === "down"
            ? "var(--red)"
            : "var(--muted)"
        }
        strokeWidth="3"
      />
    </svg>
  );
}

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
}

export default function TopRibbon() {
  const [tiles, setTiles] = useState(DEFAULT_TILES);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [countdown, setCountdown] = useState("—");
  const [cpiLabel, setCpiLabel] = useState("Next CPI");

  // ── CPI countdown ticker ────────────────────────────────────────────────
  useEffect(() => {
    function tick() {
      const next = getNextCPI();
      if (!next) {
        setCpiLabel("CPI");
        setCountdown("—");
        return;
      }
      const diff = next - new Date();
      // Show date label like "Jul 15"
      setCpiLabel(
        `CPI ${next.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      );
      setCountdown(formatCountdown(diff));
    }
    tick(); // run immediately
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Market data fetching ────────────────────────────────────────────────
  async function fetchOne(symbol) {
    try {
      const res = await fetch(`${API}/api/quote/${symbol}`);
      if (!res.ok) throw new Error(`Quote failed for ${symbol}`);

      const data = await res.json();

      const price = data.price ?? data.last ?? data.c ?? data.close ?? null;
      const changePct =
        data.changePct ??
        data.change_percent ??
        data.percentChange ??
        data.dp ??
        null;

      // If we got back zeros or nulls, treat as fetch failure
      if (!price || Number(price) === 0) throw new Error(`Bad price for ${symbol}`);

      const trend =
        Number(changePct) > 0 ? "up" : Number(changePct) < 0 ? "down" : "flat";

      return {
        symbol,
        price: formatPrice(price),
        change: formatChangePct(changePct),
        trend,
        stale: false,
      };
    } catch {
      // Return dashes instead of wrong hardcoded numbers
      return {
        symbol,
        price: "—",
        change: "—",
        trend: "flat",
        stale: true,
      };
    }
  }

  async function fetchMarketTiles() {
    const symbols = ["SPY", "QQQ", "IWM", "SPX"];
    const results = await Promise.all(symbols.map(fetchOne));
    setTiles(results);
    setLastUpdate(new Date());
  }

  useEffect(() => {
    fetchMarketTiles();
    const interval = setInterval(fetchMarketTiles, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="top">
      <div className="tickerWrap">
        {tiles.map((m) => (
          <div className="ticker" key={m.symbol} style={m.stale ? { opacity: 0.45 } : {}}>
            <div>
              <b>{m.symbol}</b>
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
          </div>
        ))}
      </div>

      <div className="statusBox">
        <span className="dot"></span>
        <div>
          <b>Market Status</b>
          <p>
            {lastUpdate
              ? `Updated ${lastUpdate.toLocaleTimeString()}`
              : "Loading market data..."}
          </p>
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