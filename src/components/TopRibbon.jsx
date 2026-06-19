import React, { useEffect, useState } from "react";

const API = "https://trqx-flow-scanner-production.up.railway.app";

const DEFAULT_TILES = [
  { symbol: "SPY", price: "—", change: "—", trend: "flat" },
  { symbol: "QQQ", price: "—", change: "—", trend: "flat" },
  { symbol: "IWM", price: "—", change: "—", trend: "flat" },
  { symbol: "SPX", price: "—", change: "—", trend: "flat" },
];

const FALLBACK = {
  SPY: { price: 740.96, changePct: -1.25 },
  QQQ: { price: 724.0, changePct: -0.8 },
  IWM: { price: 290.0, changePct: -0.72 },
  SPX: { price: 7420.1, changePct: -1.0 },
};

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

      const trend =
        Number(changePct) > 0 ? "up" : Number(changePct) < 0 ? "down" : "flat";

      return {
        symbol,
        price: formatPrice(price),
        change: formatChangePct(changePct),
        trend,
      };
    } catch {
      const fb = FALLBACK[symbol];
      const trend =
        Number(fb?.changePct) > 0
          ? "up"
          : Number(fb?.changePct) < 0
          ? "down"
          : "flat";

      return {
        symbol,
        price: formatPrice(fb?.price),
        change: formatChangePct(fb?.changePct),
        trend,
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
          <div className="ticker" key={m.symbol}>
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
        <p>CPI Release</p>
        <span>02h 45m 12s</span>
      </div>
    </header>
  );
}