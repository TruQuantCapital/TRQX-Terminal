import React, { useEffect, useMemo, useState } from "react";

const API = "https://trqx-flow-scanner-production.up.railway.app";

function impactClass(impact) {
  const x = String(impact || "").toLowerCase();
  if (x.includes("high")) return "highImpact";
  if (x.includes("med")) return "mediumImpact";
  return "lowImpact";
}

function trqxRead(event, impact) {
  const name = String(event || "").toLowerCase();
  const level = String(impact || "").toLowerCase();

  if (name.includes("cpi") || name.includes("inflation")) {
    return "Inflation data can create sharp index movement. Use caution before and after release.";
  }

  if (name.includes("fomc") || name.includes("fed") || name.includes("powell")) {
    return "Fed events can shift market direction fast. Avoid oversized positions into the announcement.";
  }

  if (name.includes("jobs") || name.includes("payroll") || name.includes("unemployment")) {
    return "Labor data can move yields, dollar strength, and index futures.";
  }

  if (level.includes("high")) return "High-impact event. Expect volatility and wider spreads.";
  if (level.includes("med")) return "Moderate-impact event. Watch for sector-specific reaction.";

  return "Low-impact event. Usually less market-moving unless surprise data hits.";
}

function tradeImpact(event, actual, forecast) {
  const name = String(event || "").toLowerCase();
  const a = parseFloat(String(actual).replace(/[^\d.-]/g, ""));
  const f = parseFloat(String(forecast).replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(a) || !Number.isFinite(f)) {
    return "Pending release — wait for actual data.";
  }

  const hotter = a > f;
  const cooler = a < f;

  if (name.includes("cpi") || name.includes("inflation")) {
    if (hotter) return "Hotter inflation: bearish for SPY/QQQ, bullish for yields/dollar.";
    if (cooler) return "Cooler inflation: bullish for SPY/QQQ, bearish for yields/dollar.";
    return "Inline inflation: reaction may fade after first move.";
  }

  if (name.includes("jobs") || name.includes("payroll") || name.includes("jolts")) {
    if (hotter) return "Stronger labor data: may pressure rate-cut expectations.";
    if (cooler) return "Softer labor data: may support rate-cut expectations.";
    return "Inline labor data: watch price action after the first reaction.";
  }

  return "Compare actual vs forecast and wait for market confirmation.";
}

function surpriseClass(actual, forecast) {
  const a = parseFloat(String(actual).replace(/[^\d.-]/g, ""));
  const f = parseFloat(String(forecast).replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(a) || !Number.isFinite(f)) return "neutralSurprise";
  if (a > f) return "hotSurprise";
  if (a < f) return "coolSurprise";
  return "neutralSurprise";
}

function parseTodayEventTime(timeText) {
  const now = new Date();
  const raw = String(timeText || "").trim();

  const match = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const ampm = match[3].toUpperCase();

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0
  );
}

function formatCountdown(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "LIVE / PASSED";

  const totalSeconds = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
}

export default function EconomicCalendarPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch(`${API}/api/economic-calendar`);
        if (res.ok) {
          const data = await res.json();
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn("Economic calendar failed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCalendar();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const highImpact = rows.filter((r) =>
    String(r?.[2] || "").toLowerCase().includes("high")
  );

  const nextHighImpact = useMemo(() => {
    return rows
      .filter((r) => String(r?.[2] || "").toLowerCase().includes("high"))
      .map((r) => ({ row: r, date: parseTodayEventTime(r?.[0]) }))
      .filter((x) => x.date && x.date.getTime() >= now)
      .sort((a, b) => a.date - b.date)[0];
  }, [rows, now]);

  const filteredRows = rows.filter((r) => {
    if (filter === "All") return true;
    return String(r?.[2] || "").toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <main className="pageStack">
      <section className="pageHeader">
        <div>
          <p>TRQX MODULE</p>
          <h1>Economic Calendar & Market Risk</h1>
          <span>
            Track high-impact market events, forecasts, actuals, and trader risk.
          </span>
        </div>

        <div className="flowProviderBadge">
          <span className="liveDot"></span>
          MARKET EVENTS
        </div>
      </section>

      <section className="flowQuickStats">
        <div className="flowMiniCard gold">
          <small>HIGH IMPACT</small>
          <b>{highImpact.length}</b>
          <span>Events today</span>
        </div>

        <div className="flowMiniCard">
          <small>TOTAL EVENTS</small>
          <b>{rows.length}</b>
          <span>Calendar rows</span>
        </div>

        <div className="flowMiniCard bearish">
          <small>TRADING RISK</small>
          <b>{highImpact.length ? "ELEVATED" : "NORMAL"}</b>
          <span>Based on scheduled news</span>
        </div>
      </section>

      <section className="nextEventCard">
        <div>
          <small>NEXT HIGH IMPACT EVENT</small>
          <h3>{nextHighImpact?.row?.[1] || "No upcoming high-impact event"}</h3>
          <span>{nextHighImpact?.row?.[0] || "--"}</span>
        </div>

        <div>
          <small>STARTS IN</small>
          <b>
            {nextHighImpact
              ? formatCountdown(nextHighImpact.date.getTime() - now)
              : "--"}
          </b>
          <span>{nextHighImpact?.row?.[2] || "No event pending"}</span>
        </div>
      </section>

      <section className="calendarFilterBar">
        {["All", "High", "Med", "Low"].map((x) => (
          <button
            key={x}
            className={filter === x ? "active" : ""}
            onClick={() => setFilter(x)}
          >
            {x}
          </button>
        ))}
      </section>

      <section className="calendarGrid">
        {loading ? (
          <div className="calendarCard">
            <b>Loading calendar...</b>
          </div>
        ) : filteredRows.length ? (
          filteredRows.map((r, i) => {
            const [time, event, impact, actual, forecast, previous] = r;
            const surprise = surpriseClass(actual, forecast);

            return (
              <div key={i} className={`calendarCard ${impactClass(impact)}`}>
                <div className="calendarTop">
                  <small>{time}</small>
                  <span>{impact}</span>
                </div>

                <h3>{event}</h3>

                <div className="calendarMetrics">
                  <div className={surprise}>
                    <small>Actual</small>
                    <b>{actual ?? "--"}</b>
                  </div>

                  <div>
                    <small>Forecast</small>
                    <b>{forecast ?? "--"}</b>
                  </div>

                  <div>
                    <small>Previous</small>
                    <b>{previous ?? "--"}</b>
                  </div>
                </div>

                <p>
                  <strong>TRQX Read:</strong> {trqxRead(event, impact)}
                </p>

                <p className="tradeImpactText">
                  <strong>TRQX Trade Impact:</strong>{" "}
                  {tradeImpact(event, actual, forecast)}
                </p>
              </div>
            );
          })
        ) : (
          <div className="calendarCard">
            <b>No economic events found.</b>
          </div>
        )}
      </section>
    </main>
  );
}