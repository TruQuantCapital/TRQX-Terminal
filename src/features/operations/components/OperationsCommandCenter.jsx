import React, { useMemo } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  FileText,
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import "./OperationsCommandCenter.css";

const CLOSED_STATUSES = new Set(["closed"]);
const ACTIVE_STATUSES = new Set(["active", "partial", "breakeven"]);
const PENDING_STATUSES = new Set(["watching", "pending", "planned"]);

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function formatStatus(value) {
  const normalized = normalizeStatus(value);
  if (!normalized) return "Not Set";
  return normalized.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "No session opened";
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function formatTime(value) {
  if (!value) return "--:--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--:--";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function metricValue(ticket) {
  const value = Number(ticket?.realized_rr);
  return Number.isFinite(value) ? value : null;
}

function buildActivity(tradingDay, levels, tickets) {
  const items = [];

  if (tradingDay) {
    items.push({
      id: `plan-${tradingDay.id}`,
      timestamp: tradingDay.created_at || tradingDay.updated_at,
      title: "Market Plan opened",
      detail: formatStatus(tradingDay.floor_status),
      tone: "gold",
    });

    if (tradingDay.discord_thread_id) {
      items.push({
        id: `discord-${tradingDay.id}`,
        timestamp: tradingDay.updated_at || tradingDay.created_at,
        title: "Discord floor connected",
        detail: tradingDay.discord_thread_name || "Trading-floor thread ready",
        tone: "green",
      });
    }
  }

  levels.forEach((level) => {
    items.push({
      id: `level-${level.id}`,
      timestamp: level.created_at || level.updated_at,
      title: `${level.ticker} levels published`,
      detail: `${(level.support_levels || []).length} support · ${(level.resistance_levels || []).length} resistance`,
      tone: "blue",
    });
  });

  tickets.forEach((ticket) => {
    const status = formatStatus(ticket.status);
    const realized = metricValue(ticket);
    items.push({
      id: `ticket-${ticket.id}`,
      timestamp: ticket.status_updated_at || ticket.updated_at || ticket.created_at,
      title: `${ticket.ticker} ${formatStatus(ticket.direction)}`,
      detail: realized == null ? status : `${status} · ${realized >= 0 ? "+" : ""}${realized.toFixed(2)}R`,
      tone: realized == null ? "gold" : realized >= 0 ? "green" : "red",
    });
  });

  return items
    .sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 8);
}

function StatCard({ icon: Icon, label, value, subtext, tone = "neutral" }) {
  return (
    <article className={`occ-stat occ-tone-${tone}`}>
      <div className="occ-stat-icon"><Icon size={18} /></div>
      <div>
        <div className="occ-stat-label">{label}</div>
        <div className="occ-stat-value">{value}</div>
        <div className="occ-stat-subtext">{subtext}</div>
      </div>
    </article>
  );
}

function scrollToElement(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function OperationsCommandCenter({
  apiStatus,
  tradingDay,
  tickets = [],
  premarketLevels = [],
  onRefresh,
  onOpenPublishing,
}) {
  const summary = useMemo(() => {
    const closed = tickets.filter((ticket) => CLOSED_STATUSES.has(normalizeStatus(ticket.status)));
    const active = tickets.filter((ticket) => ACTIVE_STATUSES.has(normalizeStatus(ticket.status)));
    const pending = tickets.filter((ticket) => PENDING_STATUSES.has(normalizeStatus(ticket.status)));
    const realized = closed.map(metricValue).filter((value) => value != null);
    const winners = realized.filter((value) => value > 0);
    const grossWins = winners.reduce((sum, value) => sum + value, 0);
    const grossLosses = Math.abs(realized.filter((value) => value < 0).reduce((sum, value) => sum + value, 0));
    const totalR = realized.reduce((sum, value) => sum + value, 0);

    return {
      closed: closed.length,
      active: active.length,
      pending: pending.length,
      totalR,
      averageR: realized.length ? totalR / realized.length : null,
      winRate: realized.length ? (winners.length / realized.length) * 100 : null,
      profitFactor: grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : null,
    };
  }, [tickets]);

  const activity = useMemo(
    () => buildActivity(tradingDay, premarketLevels, tickets),
    [tradingDay, premarketLevels, tickets],
  );

  const discordConnected = Boolean(tradingDay?.discord_thread_id);
  const floorStatus = formatStatus(tradingDay?.floor_status || "not_opened");

  return (
    <section className="occ-shell" aria-label="TRQX operations command center">
      <header className="occ-header">
        <div>
          <div className="occ-eyebrow">TRQX LIVE OPERATIONS</div>
          <h2>Trading Floor Command Center</h2>
          <p>{formatDate(tradingDay?.trading_date)}</p>
        </div>

        <div className="occ-status-cluster">
          <div className={`occ-connection ${apiStatus.online ? "is-live" : "is-offline"}`}>
            {apiStatus.online ? <Wifi size={15} /> : <WifiOff size={15} />}
            <span>{apiStatus.loading ? "Checking API" : apiStatus.online ? "API Online" : "API Offline"}</span>
          </div>
          <div className={`occ-connection ${discordConnected ? "is-live" : "is-standby"}`}>
            <MessageSquare size={15} />
            <span>{discordConnected ? "Discord Connected" : "Discord Standby"}</span>
          </div>
          <div className="occ-floor-badge"><CircleDot size={14} />{floorStatus}</div>
        </div>
      </header>

      <div className="occ-stat-grid">
        <StatCard icon={FileText} label="Market Plan" value={tradingDay ? "OPEN" : "CLOSED"} subtext={tradingDay ? formatStatus(tradingDay.market_bias) : "Create today's plan"} tone={tradingDay ? "gold" : "neutral"} />
        <StatCard icon={Target} label="Premarket Levels" value={premarketLevels.length} subtext={`${new Set(premarketLevels.map((level) => level.ticker)).size} tickers mapped`} tone="blue" />
        <StatCard icon={Activity} label="Active Trades" value={summary.active} subtext={`${summary.pending} waiting · ${summary.closed} closed`} tone={summary.active ? "green" : "neutral"} />
        <StatCard icon={BarChart3} label="Total R" value={`${summary.totalR >= 0 ? "+" : ""}${summary.totalR.toFixed(2)}R`} subtext="Realized performance" tone={summary.totalR > 0 ? "green" : summary.totalR < 0 ? "red" : "neutral"} />
      </div>

      <div className="occ-main-grid">
        <article className="occ-panel occ-performance-panel">
          <div className="occ-panel-heading">
            <div><span>SESSION PERFORMANCE</span><h3>Execution Metrics</h3></div>
            <ShieldCheck size={20} />
          </div>
          <div className="occ-performance-grid">
            <div><span>Win Rate</span><strong>{summary.winRate == null ? "—" : `${summary.winRate.toFixed(1)}%`}</strong></div>
            <div><span>Average R</span><strong>{summary.averageR == null ? "—" : `${summary.averageR >= 0 ? "+" : ""}${summary.averageR.toFixed(2)}R`}</strong></div>
            <div><span>Profit Factor</span><strong>{summary.profitFactor == null ? "—" : summary.profitFactor === Infinity ? "∞" : summary.profitFactor.toFixed(2)}</strong></div>
            <div><span>Closed Trades</span><strong>{summary.closed}</strong></div>
          </div>
        </article>

        <article className="occ-panel occ-activity-panel">
          <div className="occ-panel-heading">
            <div><span>MISSION LOG</span><h3>Latest Activity</h3></div>
            <Clock3 size={20} />
          </div>
          <div className="occ-activity-list">
            {activity.length === 0 ? (
              <div className="occ-empty-state">No activity recorded for today's trading floor.</div>
            ) : activity.map((item) => (
              <div className="occ-activity-row" key={item.id}>
                <div className={`occ-activity-dot is-${item.tone}`} />
                <time>{formatTime(item.timestamp)}</time>
                <div><strong>{item.title}</strong><span>{item.detail}</span></div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <footer className="occ-actions">
        <div className="occ-action-label"><TrendingUp size={17} />Quick Actions</div>
        <button type="button" onClick={() => scrollToElement("operations-market-plan")}><Plus size={15} />Market Plan</button>
        <button type="button" onClick={() => scrollToElement("operations-premarket-form")} disabled={!tradingDay}><Target size={15} />Premarket Levels</button>
        <button type="button" onClick={() => scrollToElement("operations-trade-ticket-form")} disabled={!tradingDay}><Activity size={15} />Trade Ticket</button>
        <button type="button" onClick={onOpenPublishing}><MessageSquare size={15} />Publishing</button>
        <button type="button" className="occ-refresh" onClick={onRefresh}><RefreshCw size={15} />Refresh</button>
      </footer>
    </section>
  );
}
