import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Ban,
  Check,
  CircleDollarSign,
  Clock3,
  Crosshair,
  Flag,
  Gauge,
  Radio,
  RotateCcw,
  ShieldCheck,
  Target,
  X,
} from "lucide-react";
import "./LiveTradeManager.css";

const MANAGEABLE_STATUSES = new Set([
  "watching",
  "active",
  "partial",
  "breakeven",
]);

const MARKET_API_ORIGIN = (
  import.meta.env.VITE_API_URL ||
  "https://trqx-flow-scanner-production.up.railway.app"
).replace(/\/+$/, "");

const QUOTE_REFRESH_MS = 15000;

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function titleCase(value) {
  return normalize(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return number.toFixed(2);
}

function formatR(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}R`;
}

function targetR(ticket, index) {
  const stored = Number(ticket?.target_rrs?.[index]);
  if (Number.isFinite(stored)) return stored;

  const entry = Number(ticket?.entry);
  const stop = Number(ticket?.stop);
  const target = Number(ticket?.targets?.[index]);
  if (![entry, stop, target].every(Number.isFinite)) return null;

  const bullish = ["long", "call"].includes(normalize(ticket.direction));
  const risk = bullish ? entry - stop : stop - entry;
  const reward = bullish ? target - entry : entry - target;
  return risk > 0 ? reward / risk : null;
}

function calculateCurrentR(ticket, currentPrice) {
  const entry = Number(ticket?.entry);
  const stop = Number(ticket?.stop);
  const price = Number(currentPrice);
  if (![entry, stop, price].every(Number.isFinite)) return null;

  const bullish = ["long", "call"].includes(normalize(ticket.direction));
  const risk = bullish ? entry - stop : stop - entry;
  if (risk <= 0) return null;

  const movement = bullish ? price - entry : entry - price;
  return movement / risk;
}

function nextTargetHits(ticket, targetNumber) {
  return Array.from(
    new Set([...(ticket.target_hits || []), targetNumber]),
  ).sort((a, b) => a - b);
}

function getEasternParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(now);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function marketClock(now = new Date()) {
  const p = getEasternParts(now);
  const weekday = p.weekday;
  const totalSeconds = Number(p.hour) * 3600 + Number(p.minute) * 60 + Number(p.second);
  const open = 9 * 3600 + 30 * 60;
  const close = 16 * 3600;
  const weekend = weekday === "Sat" || weekday === "Sun";

  if (weekend) {
    return { label: "Market Closed", value: "Weekend", phase: "closed" };
  }

  if (totalSeconds < open) {
    return {
      label: "Market Opens",
      value: formatDuration(open - totalSeconds),
      phase: "premarket",
    };
  }

  if (totalSeconds < close) {
    return {
      label: "Market Closes",
      value: formatDuration(close - totalSeconds),
      phase: "open",
    };
  }

  return { label: "Market Closed", value: "Session Complete", phase: "closed" };
}

function formatDuration(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return [hours, minutes, secs].map((value) => String(value).padStart(2, "0")).join(":");
}

function useMarketClock() {
  const [clock, setClock] = useState(() => marketClock());

  useEffect(() => {
    const timer = window.setInterval(() => setClock(marketClock()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return clock;
}

function useTicketQuotes(tickets) {
  const symbols = useMemo(
    () => Array.from(new Set(
      tickets
        .filter((ticket) => MANAGEABLE_STATUSES.has(normalize(ticket.status)))
        .map((ticket) => String(ticket.ticker || "").trim().toUpperCase())
        .filter(Boolean),
    )),
    [tickets],
  );

  const [quotes, setQuotes] = useState({});

  useEffect(() => {
    if (!symbols.length) {
      setQuotes({});
      return undefined;
    }

    let disposed = false;

    async function loadQuotes() {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const response = await fetch(
              `${MARKET_API_ORIGIN}/api/quote/${encodeURIComponent(symbol)}`,
              { headers: { Accept: "application/json" } },
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const price = Number(data?.price ?? data?.last ?? data?.c);
            if (!Number.isFinite(price)) throw new Error("Invalid quote");
            return [symbol, {
              price,
              changePct: Number(data?.changePct ?? data?.changesPercentage),
              source: data?.source || "market-data",
              updatedAt: new Date(),
              error: null,
            }];
          } catch (error) {
            return [symbol, {
              price: null,
              changePct: null,
              source: null,
              updatedAt: new Date(),
              error: error instanceof Error ? error.message : "Quote unavailable",
            }];
          }
        }),
      );

      if (!disposed) {
        setQuotes(Object.fromEntries(results));
      }
    }

    loadQuotes();
    const timer = window.setInterval(loadQuotes, QUOTE_REFRESH_MS);
    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [symbols.join("|")]);

  return quotes;
}

function TargetProgress({ ticket }) {
  const targets = Array.isArray(ticket.targets) ? ticket.targets : [];
  const hitSet = new Set(ticket.target_hits || []);

  if (!targets.length) return null;

  return (
    <div className="ltm-progress" aria-label="Trade target progress">
      {targets.map((_, index) => {
        const number = index + 1;
        const hit = hitSet.has(number);
        return (
          <React.Fragment key={`${ticket.id}-progress-${number}`}>
            {index > 0 && <span className={`ltm-progress-line ${hit ? "is-complete" : ""}`} />}
            <div className={`ltm-progress-step ${hit ? "is-complete" : ""}`}>
              <span>{hit ? <Check size={13} /> : number}</span>
              <small>TP{number}</small>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function TicketCard({ ticket, quote, busy, onAction }) {
  const [closeMode, setCloseMode] = useState(false);
  const [exitPrice, setExitPrice] = useState("");
  const [exitReason, setExitReason] = useState("");
  const status = normalize(ticket.status);
  const active = ["active", "partial", "breakeven"].includes(status);
  const targetHits = new Set(ticket.target_hits || []);
  const targets = Array.isArray(ticket.targets) ? ticket.targets : [];
  const currentR = calculateCurrentR(ticket, quote?.price);

  async function closeTrade() {
    const parsedExit = Number(exitPrice);
    if (!Number.isFinite(parsedExit) || parsedExit <= 0) return;

    await onAction(ticket.id, {
      status: "closed",
      exit_price: parsedExit,
      exit_reason: exitReason.trim() || "Manual close from Live Trade Manager",
    });
    setCloseMode(false);
    setExitPrice("");
    setExitReason("");
  }

  return (
    <article className={`ltm-ticket ltm-status-${status}`}>
      <header className="ltm-ticket-header">
        <div>
          <div className="ltm-trade-id">{ticket.trade_id || "TRQX TRADE"}</div>
          <h3>{ticket.ticker} <span>{titleCase(ticket.direction)}</span></h3>
          <p>{ticket.setup || "Trade setup"} · {ticket.timeframe || "—"}</p>
        </div>
        <div className={`ltm-status-pill is-${status}`}>
          <span />{titleCase(status)}
        </div>
      </header>

      <div className="ltm-live-strip">
        <div>
          <span><Radio size={13} /> Current Price</span>
          <strong>{quote?.price != null ? formatPrice(quote.price) : "—"}</strong>
          <small>{quote?.error ? "Quote unavailable" : quote?.source || "Waiting for market data"}</small>
        </div>
        <div>
          <span>Current R</span>
          <strong className={currentR == null ? "" : currentR >= 0 ? "is-positive" : "is-negative"}>
            {formatR(currentR)}
          </strong>
          <small>Based on underlying price</small>
        </div>
      </div>

      <div className="ltm-level-grid">
        <div><span>Entry</span><strong>{formatPrice(ticket.entry)}</strong></div>
        <div><span>Stop</span><strong>{formatPrice(ticket.stop)}</strong></div>
        <div><span>Risk</span><strong>{formatPrice(ticket.risk_amount)}</strong></div>
        <div><span>Max R</span><strong>{formatR(ticket.max_rr)}</strong></div>
      </div>

      <TargetProgress ticket={ticket} />

      <div className="ltm-target-list">
        {targets.map((target, index) => {
          const number = index + 1;
          const hit = targetHits.has(number);
          const rr = targetR(ticket, index);
          return (
            <div className={`ltm-target-row ${hit ? "is-hit" : ""}`} key={`${ticket.id}-tp-${number}`}>
              <div className="ltm-target-name">
                <span className="ltm-target-check">{hit ? <Check size={14} /> : number}</span>
                <div><strong>TP{number}</strong><small>{rr == null ? "—" : formatR(rr)}</small></div>
              </div>
              <strong>{formatPrice(target)}</strong>
              <button
                type="button"
                disabled={!active || hit || busy}
                onClick={() => onAction(ticket.id, {
                  status: number < targets.length ? "partial" : ticket.status,
                  target_hits: nextTargetHits(ticket, number),
                })}
              >
                {hit ? "Hit" : `Mark TP${number}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="ltm-action-grid">
        {status === "watching" && (
          <button className="is-primary" type="button" disabled={busy} onClick={() => onAction(ticket.id, { status: "active" })}>
            <Activity size={16} />Activate
          </button>
        )}
        {active && status !== "breakeven" && (
          <button type="button" disabled={busy} onClick={() => onAction(ticket.id, { status: "breakeven", breakeven_moved: true })}>
            <ShieldCheck size={16} />Move to BE
          </button>
        )}
        {active && (
          <button type="button" disabled={busy} onClick={() => setCloseMode((current) => !current)}>
            <Flag size={16} />Close Trade
          </button>
        )}
        {status === "watching" && (
          <button className="is-danger" type="button" disabled={busy} onClick={() => onAction(ticket.id, { status: "cancelled", exit_reason: "Cancelled before activation" })}>
            <Ban size={16} />Cancel
          </button>
        )}
      </div>

      {closeMode && (
        <div className="ltm-close-panel">
          <div className="ltm-close-heading">
            <div><strong>Close {ticket.ticker}</strong><span>Record the actual exit price.</span></div>
            <button type="button" onClick={() => setCloseMode(false)}><X size={17} /></button>
          </div>
          <div className="ltm-close-fields">
            <label>
              <span>Exit Price</span>
              <input inputMode="decimal" value={exitPrice} onChange={(event) => setExitPrice(event.target.value)} placeholder="0.00" />
            </label>
            <label>
              <span>Exit Reason</span>
              <input value={exitReason} onChange={(event) => setExitReason(event.target.value)} placeholder="Target, stop, structure shift..." />
            </label>
          </div>
          <button className="ltm-confirm-close" type="button" disabled={busy || !(Number(exitPrice) > 0)} onClick={closeTrade}>
            <CircleDollarSign size={16} />Confirm Close
          </button>
        </div>
      )}

      {(ticket.realized_rr != null || ticket.exit_price != null) && (
        <footer className="ltm-result">
          <span>Realized Result</span>
          <strong className={Number(ticket.realized_rr) >= 0 ? "is-positive" : "is-negative"}>{formatR(ticket.realized_rr)}</strong>
          <small>Exit {formatPrice(ticket.exit_price)}</small>
        </footer>
      )}
    </article>
  );
}

export default function LiveTradeManager({ tickets = [], onUpdate, onRefresh, disabled = false }) {
  const [workingId, setWorkingId] = useState("");
  const [filter, setFilter] = useState("live");
  const quotes = useTicketQuotes(tickets);
  const clock = useMarketClock();

  const filteredTickets = useMemo(() => {
    const ordered = [...tickets].sort((a, b) => {
      const aTime = new Date(a.status_updated_at || a.updated_at || a.created_at || 0).getTime();
      const bTime = new Date(b.status_updated_at || b.updated_at || b.created_at || 0).getTime();
      return bTime - aTime;
    });

    if (filter === "all") return ordered;
    if (filter === "closed") return ordered.filter((ticket) => ["closed", "cancelled"].includes(normalize(ticket.status)));
    return ordered.filter((ticket) => MANAGEABLE_STATUSES.has(normalize(ticket.status)));
  }, [tickets, filter]);

  const counts = useMemo(() => ({
    watching: tickets.filter((ticket) => normalize(ticket.status) === "watching").length,
    active: tickets.filter((ticket) => ["active", "partial", "breakeven"].includes(normalize(ticket.status))).length,
    closed: tickets.filter((ticket) => normalize(ticket.status) === "closed").length,
  }), [tickets]);

  async function handleAction(ticketId, payload) {
    setWorkingId(ticketId);
    try {
      await onUpdate(ticketId, payload);
    } finally {
      setWorkingId("");
    }
  }

  return (
    <section id="operations-live-trade-manager" className="ltm-shell">
      <header className="ltm-header">
        <div>
          <div className="ltm-eyebrow"><Crosshair size={15} />TRQX EXECUTION DESK</div>
          <h2>Live Trade Manager</h2>
          <p>Manage the full trade lifecycle without reopening the ticket form.</p>
        </div>
        <div className="ltm-header-tools">
          <div className={`ltm-market-clock is-${clock.phase}`}>
            <Clock3 size={16} />
            <div><span>{clock.label}</span><strong>{clock.value}</strong></div>
          </div>
          <button className="ltm-refresh" type="button" onClick={onRefresh} disabled={disabled}>
            <RotateCcw size={15} />Refresh Trades
          </button>
        </div>
      </header>

      <div className="ltm-summary">
        <div><Gauge size={17} /><span>Watching</span><strong>{counts.watching}</strong></div>
        <div><Activity size={17} /><span>Live</span><strong>{counts.active}</strong></div>
        <div><Target size={17} /><span>Closed</span><strong>{counts.closed}</strong></div>
      </div>

      <nav className="ltm-filters" aria-label="Trade manager filters">
        <button className={filter === "live" ? "is-selected" : ""} type="button" onClick={() => setFilter("live")}>Live Desk</button>
        <button className={filter === "closed" ? "is-selected" : ""} type="button" onClick={() => setFilter("closed")}>Closed</button>
        <button className={filter === "all" ? "is-selected" : ""} type="button" onClick={() => setFilter("all")}>All Tickets</button>
      </nav>

      {filteredTickets.length === 0 ? (
        <div className="ltm-empty">
          <Crosshair size={30} />
          <strong>No trades in this view</strong>
          <span>Create a Trade Ticket or select another filter.</span>
        </div>
      ) : (
        <div className="ltm-ticket-grid">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              quote={quotes[String(ticket.ticker || "").toUpperCase()]}
              busy={workingId === ticket.id || disabled}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </section>
  );
}
