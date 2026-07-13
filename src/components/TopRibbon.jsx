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
].sort((a, b) => a.date.getTime() - b.date.getTime());

const SYMBOLS = ["SPY", "QQQ", "IWM", "NVDA"];
const LIVE_WINDOW_MS = 30 * 60 * 1000;

function getNextMajorEvent() {
  const now = Date.now();

  const firstUpcoming = MAJOR_EVENTS.find(
    (event) => event.date.getTime() + LIVE_WINDOW_MS > now
  );

  if (!firstUpcoming) return null;

  const eventTime = firstUpcoming.date.getTime();
  const names = MAJOR_EVENTS
    .filter((event) => event.date.getTime() === eventTime)
    .map((event) => event.name);

  return {
    names,
    date: firstUpcoming.date,
  };
}

function formatCountdown(ms) {
  if (ms <= 0) return "LIVE NOW";

  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hrs = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (days > 0) {
    return `${days}d ${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
  }

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

function fmt(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtPct(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
}

function fmtPrem(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "—";
  if (number >= 1_000_000) return `$${(number / 1_000_000).toFixed(1)}M`;
  if (number >= 1_000) return `$${(number / 1_000).toFixed(0)}K`;

  return `$${number}`;
}

export default function TopRibbon() {
  const [tiles, setTiles] = useState(
    SYMBOLS.map((symbol) => ({
      symbol,
      price: "—",
      change: "—",
      trend: "flat",
      stale: true,
    }))
  );
  const [flowStats, setFlowStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [countdown, setCountdown] = useState("—");
  const [eventLabel, setEventLabel] = useState("Loading...");

  // Major economic-event countdown
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

      setEventLabel(`${next.names.join(" / ")} ${displayDate}`);
      setCountdown(formatCountdown(next.date.getTime() - Date.now()));
    }

    tick();
    const intervalId = setInterval(tick, 1000);

    return () => clearInterval(intervalId);
  }, []);

  async function fetchTiles() {
    const results = await Promise.all(
      SYMBOLS.map(async (symbol) => {
        try {
          const response = await fetch(`${API}/api/quote/${symbol}`);

          if (!response.ok) throw new Error("Quote request failed");

          const data = await response.json();
          const price = data.price ?? data.last ?? null;
          const changePct = data.changePct ?? data.change_percent ?? null;

          if (!price || Number(price) === 0) {
            throw new Error("Quote response did not include a valid price");
          }

          const trend =
            Number(changePct) > 0
              ? "up"
              : Number(changePct) < 0
                ? "down"
                : "flat";

          return {
            symbol,
            price: fmt(price),
            change: fmtPct(changePct),
            trend,
            stale: false,
          };
        } catch {
          return {
            symbol,
            price: "—",
            change: "—",
            trend: "flat",
            stale: true,
          };
        }
      })
    );

    setTiles(results);
    setLastUpdate(new Date());
  }

  async function fetchFlowStats() {
    try {
      const response = await fetch(`${API}/api/flow/stats`);

      if (!response.ok) throw new Error("Flow statistics request failed");

      const data = await response.json();
      setFlowStats(data);
    } catch {
      setFlowStats(null);
    }
  }

  useEffect(() => {
    fetchTiles();
    fetchFlowStats();

    const quotesIntervalId = setInterval(fetchTiles, 30_000);
    const flowIntervalId = setInterval(fetchFlowStats, 15_000);

    return () => {
      clearInterval(quotesIntervalId);
      clearInterval(flowIntervalId);
    };
  }, []);

  const sentimentColor =
    flowStats?.sentiment === "Bullish"
      ? "var(--green)"
      : flowStats?.sentiment === "Bearish"
        ? "var(--red)"
        : "var(--gold)";

  return (
    <header className="top">
      {/* Stock tiles */}
      {tiles.map((market) => (
        <div
          className="ticker"
          key={market.symbol}
          style={market.stale ? { opacity: 0.45 } : undefined}
        >
          <div className="tickerText">
            <b>{market.symbol}</b>
            <span>{market.price}</span>
            <em
              className={
                market.trend === "up"
                  ? "positive"
                  : market.trend === "down"
                    ? "negative"
                    : ""
              }
            >
              {market.change}
            </em>
          </div>

          <Sparkline trend={market.trend} />
        </div>
      ))}

      {/* Flow statistic tiles */}
      {flowStats && (
        <>
          <div className="ticker flowTile">
            <div className="tickerText">
              <b>FLOW SENTIMENT</b>
              <span style={{ color: sentimentColor, fontSize: "16px" }}>
                {flowStats.sentiment?.toUpperCase() ?? "—"}
              </span>
              <em style={{ color: sentimentColor }}>
                Ratio {flowStats.ratio ?? "—"}
              </em>
            </div>
          </div>

          <div className="ticker flowTile">
            <div className="tickerText">
              <b>CALL PREMIUM</b>
              <span style={{ color: "var(--green)", fontSize: "16px" }}>
                {fmtPrem(flowStats.callPremium)}
              </span>
              <em style={{ color: "var(--muted)" }}>
                {flowStats.sweepCount ?? 0} sweeps
              </em>
            </div>
          </div>

          <div className="ticker flowTile">
            <div className="tickerText">
              <b>PUT PREMIUM</b>
              <span style={{ color: "var(--red)", fontSize: "16px" }}>
                {fmtPrem(flowStats.putPremium)}
              </span>
              <em style={{ color: "var(--muted)" }}>
                {flowStats.blockCount ?? 0} blocks
              </em>
            </div>
          </div>
        </>
      )}

      {/* Market status */}
      <div className="statusBox">
        <span className="dot" />
        <div>
          <b>Market Status</b>
          <p>
            {lastUpdate
              ? `Updated ${lastUpdate.toLocaleTimeString()}`
              : "Loading..."}
          </p>
        </div>
      </div>

      {/* Next major event */}
      <div className="eventBox">
        <b>Next Event</b>
        <p>{eventLabel}</p>
        <span>{countdown}</span>
      </div>
    </header>
  );
}