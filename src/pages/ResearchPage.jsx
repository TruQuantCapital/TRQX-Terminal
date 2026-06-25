import React, { useState, useCallback } from "react";
import {
  Search, Star, TrendingUp, TrendingDown, CheckCircle,
  AlertTriangle, BarChart3, Users, Globe, Building,
  Calendar, DollarSign, Activity, ChevronRight, Loader,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://trqx-flow-scanner-production.up.railway.app";
const GOLD = "#d4af37";
const GOLD_DIM = "rgba(212,175,55,0.12)";
const GOLD_BORDER = "rgba(212,175,55,0.25)";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f5f1e8";
const MUTED = "#9ca3af";
const GREEN = "#22c55e";
const RED = "#ef4444";

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(v, dec = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(dec) : "--";
}
function fmtB(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
}
function fmtMktCap(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}T`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}B`;
  return `$${n.toFixed(0)}M`;
}
function colorVal(v, good = "positive") {
  const n = Number(v);
  if (!Number.isFinite(n)) return MUTED;
  if (good === "positive") return n > 0 ? GREEN : n < 0 ? RED : MUTED;
  return n < 0 ? GREEN : n > 0 ? RED : MUTED;
}
function verdictColor(v) {
  if (!v) return MUTED;
  if (v.includes("STRONG BUY")) return GREEN;
  if (v.includes("BUY")) return "#86efac";
  if (v.includes("HOLD")) return GOLD;
  if (v.includes("STRONG SELL")) return RED;
  if (v.includes("SELL")) return "#fca5a5";
  return MUTED;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: "14px", padding: "24px", ...style,
    }}>
      {children}
    </div>
  );
}
function SectionTitle({ children }) {
  return (
    <div style={{
      color: MUTED, fontSize: "11px", fontWeight: "700",
      textTransform: "uppercase", letterSpacing: "0.1em",
      marginBottom: "14px",
    }}>
      {children}
    </div>
  );
}
function MetricRow({ label, value, color, suffix = "" }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 0", borderBottom: `1px solid ${BORDER}`,
    }}>
      <span style={{ color: MUTED, fontSize: "13px" }}>{label}</span>
      <span style={{ color: color || TEXT, fontSize: "13px", fontWeight: "600" }}>
        {value}{suffix}
      </span>
    </div>
  );
}
function HealthRow({ label, value }) {
  const n = Number(value);
  const good = Number.isFinite(n) && n > 0;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", borderBottom: `1px solid ${BORDER}`,
    }}>
      <span style={{ color: TEXT, fontSize: "13px" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <CheckCircle size={14} color={good ? GREEN : MUTED} />
        <span style={{ color: good ? GREEN : MUTED, fontSize: "13px", fontWeight: "600" }}>
          {good ? "Strong" : Number.isFinite(n) ? "Moderate" : "--"}
        </span>
      </div>
    </div>
  );
}

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const s = Number(score) || 0;
  const pct = s / 10;
  const r = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const color = s >= 7 ? GREEN : s >= 5 ? GOLD : RED;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={BORDER} strokeWidth="8" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize="18" fontWeight="700">{s}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill={MUTED} fontSize="9">/10</text>
    </svg>
  );
}

// ── Analyst Donut ─────────────────────────────────────────────────────────────
function AnalystDonut({ ratings }) {
  const { strongBuy = 0, buy = 0, hold = 0, sell = 0, strongSell = 0, total = 0 } = ratings || {};
  if (!total) return <div style={{ color: MUTED, fontSize: "13px" }}>No ratings data</div>;
  const segments = [
    { label: "Strong Buy", value: strongBuy, color: GREEN },
    { label: "Buy", value: buy, color: "#86efac" },
    { label: "Hold", value: hold, color: GOLD },
    { label: "Sell", value: sell, color: "#fca5a5" },
    { label: "Strong Sell", value: strongSell, color: RED },
  ];
  const r = 50, cx = 60, cy = 60, stroke = 18;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {segments.map((seg, i) => {
          if (!seg.value) return null;
          const pct = seg.value / total;
          const dash = circ * pct;
          const el = (
            <circle
              key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += dash;
          return el;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={TEXT} fontSize="18" fontWeight="700">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={MUTED} fontSize="9">Ratings</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {segments.filter(s => s.value > 0).map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: seg.color }} />
            <span style={{ color: TEXT, fontSize: "12px" }}>{seg.label}</span>
            <span style={{ color: MUTED, fontSize: "12px" }}>
              {seg.value} ({Math.round((seg.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Revenue Chart ─────────────────────────────────────────────────────────────
function RevenueChart({ reports }) {
  if (!reports || reports.length === 0) return (
    <div style={{ color: MUTED, fontSize: "13px", padding: "20px 0" }}>No financial data available</div>
  );
  const maxVal = Math.max(...reports.map(r => Math.abs(Number(r.epsActual) || 0)));
  const CHART_H = 160;
  return (
    <div>
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: GREEN }} />
          <span style={{ color: MUTED, fontSize: "13px" }}>EPS Actual</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: GOLD }} />
          <span style={{ color: MUTED, fontSize: "13px" }}>EPS Estimate</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: `${CHART_H}px`, padding: "0 8px" }}>
        {reports.map((r, i) => {
          const actual = Number(r.epsActual) || 0;
          const estimate = Number(r.epsEstimate) || 0;
          const actualH = maxVal > 0 ? Math.max((Math.abs(actual) / maxVal) * (CHART_H - 30), 6) : 6;
          const estimateH = maxVal > 0 ? Math.max((Math.abs(estimate) / maxVal) * (CHART_H - 30), 6) : 6;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: `${CHART_H - 30}px` }}>
                <div style={{ position: "relative", width: "22px", height: `${actualH}px`, background: GREEN, borderRadius: "4px 4px 0 0" }}>
                  <span style={{ position: "absolute", top: "-18px", left: "50%", transform: "translateX(-50%)", color: GREEN, fontSize: "9px", whiteSpace: "nowrap", fontWeight: "700" }}>
                    ${fmt(actual)}
                  </span>
                </div>
                <div style={{ width: "22px", height: `${estimateH}px`, background: GOLD, borderRadius: "4px 4px 0 0" }} />
              </div>
              <span style={{ color: MUTED, fontSize: "11px", fontWeight: "600" }}>{r.year}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TradingView Chart ─────────────────────────────────────────────────────────
function TVChart({ symbol }) {
  return (
    <div style={{ width: "100%", height: "380px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", overflow: "hidden" }}>
      <iframe
        title={`${symbol} chart`}
        src={`https://s.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=${symbol}&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=0&saveimage=0&toolbarbg=000000&studies=[]&theme=dark&style=1&timezone=exchange&withdateranges=1&showpopupbutton=0`}
        style={{ width: "100%", height: "100%", border: "none" }}
        allowTransparency
        frameBorder="0"
      />
    </div>
  );
}

// ── Search Bar ────────────────────────────────────────────────────────────────
function SearchBar({ onSearch, loading }) {
  const [input, setInput] = useState("");
  const handleKey = (e) => { if (e.key === "Enter") onSearch(input.trim().toUpperCase()); };
  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
      <div style={{
        flex: 1, display: "flex", alignItems: "center", gap: "10px",
        background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
        borderRadius: "10px", padding: "12px 16px",
      }}>
        <Search size={18} color={MUTED} />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search any stock... (e.g. NVDA, AAPL, TSLA)"
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            color: TEXT, fontSize: "15px",
          }}
        />
      </div>
      <button
        onClick={() => onSearch(input.trim().toUpperCase())}
        disabled={loading || !input.trim()}
        style={{
          background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`,
          borderRadius: "10px", padding: "12px 24px",
          color: GOLD, fontSize: "14px", fontWeight: "700", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "8px",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? <Loader size={16} /> : <Search size={16} />}
        {loading ? "Loading..." : "Research"}
      </button>
    </div>
  );
}

// ── Quick Actions ─────────────────────────────────────────────────────────────
function QuickActions({ symbol }) {
  const actions = [
    { label: "View Options Flow", icon: Activity, href: `/options-flow` },
    { label: "Open Trade Plan", icon: BarChart3, href: `/trade-plan?ticker=${symbol}` },
    { label: "View on GEMX", icon: TrendingUp, href: `/gamma-ex` },
  ];
  return (
    <Card>
      <SectionTitle>Quick Actions</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <a key={i} href={a.href} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", background: "rgba(255,255,255,0.03)",
              border: `1px solid ${BORDER}`, borderRadius: "8px",
              color: TEXT, textDecoration: "none", fontSize: "13px", fontWeight: "600",
              transition: "border-color 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon size={15} color={GOLD} />
                {a.label}
              </div>
              <ChevronRight size={14} color={MUTED} />
            </a>
          );
        })}
      </div>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = ["Overview", "Financials", "Analyst Ratings", "News"];

export default function ResearchPage() {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [news, setNews] = useState([]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [error, setError] = useState(null);

  const fetchResearch = useCallback(async (sym) => {
    if (!sym) return;
    setLoading(true);
    setError(null);
    setProfile(null);
    setFinancials(null);
    setRatings(null);
    setVerdict(null);
    setNews([]);
    setSymbol(sym);
    setActiveTab("Overview");

    try {
      const [profileRes, financialsRes, ratingsRes, newsRes] = await Promise.all([
        fetch(`${API}/api/research/profile/${sym}`),
        fetch(`${API}/api/research/financials/${sym}`),
        fetch(`${API}/api/research/ratings/${sym}`),
        fetch(`${API}/api/news?ticker=${sym}&limit=10`),
      ]);

      const profileData = profileRes.ok ? await profileRes.json() : null;
      const financialsData = financialsRes.ok ? await financialsRes.json() : null;
      const ratingsData = ratingsRes.ok ? await ratingsRes.json() : null;
      const newsData = newsRes.ok ? await newsRes.json() : { rows: [] };

      setProfile(profileData);
      setFinancials(financialsData);
      setRatings(ratingsData);
      setNews(newsData.rows || []);

      if (profileData && ratingsData) {
        const verdictRes = await fetch(`${API}/api/research/ai-verdict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol: sym,
            profile: profileData,
            metrics: profileData,
            ratings: ratingsData,
          }),
        });
        if (verdictRes.ok) setVerdict(await verdictRes.json());
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ color: GOLD, fontSize: "24px", fontWeight: "700", margin: "0 0 4px" }}>Stock Research</h1>
        <p style={{ color: MUTED, fontSize: "14px", margin: 0 }}>
          Fundamental analysis, AI investment verdict, analyst ratings, and news — all in one place.
        </p>
      </div>

      {/* Search */}
      <SearchBar onSearch={fetchResearch} loading={loading} />

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "16px", color: "#fca5a5", fontSize: "14px", marginBottom: "20px" }}>
          Error loading data for {symbol}: {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px", color: MUTED }}>
          <Loader size={24} color={GOLD} />
          <span style={{ fontSize: "16px" }}>Analyzing {symbol}...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !profile && !error && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <Search size={48} color={MUTED} style={{ margin: "0 auto 16px" }} />
          <h2 style={{ color: TEXT, fontSize: "20px", fontWeight: "700", margin: "0 0 8px" }}>Search any stock to begin</h2>
          <p style={{ color: MUTED, fontSize: "14px" }}>Try NVDA, AAPL, TSLA, SPY, MSFT, AMZN</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px", flexWrap: "wrap" }}>
            {["NVDA", "AAPL", "TSLA", "MSFT", "AMZN", "META", "SPY", "QQQ"].map(s => (
              <button key={s} onClick={() => fetchResearch(s)} style={{
                background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`,
                borderRadius: "8px", padding: "8px 16px", color: GOLD,
                fontSize: "13px", fontWeight: "700", cursor: "pointer",
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && profile && (
        <div>
          {/* Company Header */}
          <div style={{
            background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: "12px", padding: "24px", marginBottom: "16px",
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            gap: "20px", flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flex: 1 }}>
              {profile.logo && (
                <img src={profile.logo} alt={profile.name} style={{ width: "56px", height: "56px", objectFit: "contain", borderRadius: "8px", background: "#fff", padding: "4px" }} />
              )}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                  <h2 style={{ color: TEXT, fontSize: "28px", fontWeight: "800", margin: 0 }}>{symbol}</h2>
                  <span style={{ color: MUTED, fontSize: "16px" }}>{profile.name}</span>
                </div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  {profile.industry && <span style={{ color: MUTED, fontSize: "13px" }}>{profile.industry}</span>}
                  {profile.exchange && <><span style={{ color: BORDER }}>•</span><span style={{ color: MUTED, fontSize: "13px" }}>{profile.exchange}</span></>}
                  {profile.country && <><span style={{ color: BORDER }}>•</span><span style={{ color: MUTED, fontSize: "13px" }}>{profile.country}</span></>}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                  <span style={{ color: TEXT, fontSize: "32px", fontWeight: "800" }}>
                    ${fmt(profile.price)}
                  </span>
                  <span style={{ color: colorVal(profile.change), fontSize: "16px", fontWeight: "700" }}>
                    {profile.change >= 0 ? "+" : ""}{fmt(profile.change)} ({profile.changePct >= 0 ? "+" : ""}{fmt(profile.changePct)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* AI Verdict */}
            {verdict && (
              <div style={{
                background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`,
                borderRadius: "12px", padding: "20px", minWidth: "240px",
              }}>
                <div style={{ color: MUTED, fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", marginBottom: "8px" }}>
                  INVESTMENT VERDICT
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div>
                    <div style={{ color: verdictColor(verdict.verdict), fontSize: "20px", fontWeight: "800", marginBottom: "6px" }}>
                      {verdict.verdict}
                    </div>
                    <p style={{ color: MUTED, fontSize: "12px", lineHeight: "1.4", margin: 0, maxWidth: "160px" }}>
                      {verdict.summary}
                    </p>
                  </div>
                  <ScoreRing score={verdict.score} />
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "20px", borderBottom: `1px solid ${BORDER}` }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: "none", border: "none", padding: "10px 20px",
                cursor: "pointer", fontSize: "14px", fontWeight: "600",
                color: activeTab === tab ? GOLD : MUTED,
                borderBottom: activeTab === tab ? `2px solid ${GOLD}` : "2px solid transparent",
                marginBottom: "-1px", transition: "color 0.2s",
              }}>
                {tab}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === "Overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>

              {/* 1. Company Overview */}
              <Card style={{ gridColumn: "1" }}>
                <SectionTitle>1. Company Overview</SectionTitle>
                <p style={{ color: MUTED, fontSize: "13px", lineHeight: "1.6", marginBottom: "16px" }}>
                  {profile.description}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { icon: Users, label: "CEO", value: profile.ceo },
                    { icon: Calendar, label: "Founded", value: profile.founded },
                    { icon: Building, label: "Employees", value: profile.employees?.toLocaleString() },
                    { icon: Globe, label: "Headquarters", value: profile.headquarter },
                    { icon: DollarSign, label: "Market Cap", value: fmtMktCap(profile.marketCap) },
                    { icon: Activity, label: "Sector", value: profile.industry },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return item.value ? (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <Icon size={14} color={MUTED} style={{ marginTop: "2px", flexShrink: 0 }} />
                        <div>
                          <div style={{ color: MUTED, fontSize: "10px", fontWeight: "600", textTransform: "uppercase" }}>{item.label}</div>
                          <div style={{ color: TEXT, fontSize: "12px", fontWeight: "600" }}>{item.value}</div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </Card>

              {/* 2. Price Chart */}
              <Card style={{ gridColumn: "2" }}>
                <SectionTitle>2. Price Performance</SectionTitle>
                <TVChart symbol={symbol} />
              </Card>

              {/* 3. Key Metrics */}
              <Card style={{ gridColumn: "3" }}>
                <SectionTitle>3. Key Metrics</SectionTitle>
                <MetricRow label="P/E Ratio (TTM)" value={fmt(profile.pe)} color={GOLD} />
                <MetricRow label="Forward P/E" value={fmt(profile.forwardPE)} color={GOLD} />
                <MetricRow label="PEG Ratio" value={fmt(profile.peg)} color={GOLD} />
                <MetricRow label="Price / Sales" value={fmt(profile.ps)} color={GOLD} />
                <MetricRow label="Price / Book" value={fmt(profile.pb)} color={GOLD} />
                <MetricRow label="ROE (TTM)" value={fmt(profile.roe)} suffix="%" color={profile.roe > 15 ? GREEN : MUTED} />
                <MetricRow label="Gross Margin" value={fmt(profile.grossMargin)} suffix="%" color={profile.grossMargin > 40 ? GREEN : MUTED} />
                <MetricRow label="Net Margin" value={fmt(profile.netMargin)} suffix="%" color={profile.netMargin > 10 ? GREEN : MUTED} />
                <MetricRow label="Debt / Equity" value={fmt(profile.debtEquity)} color={profile.debtEquity < 1 ? GREEN : RED} />
                <MetricRow label="Current Ratio" value={fmt(profile.currentRatio)} color={profile.currentRatio > 1.5 ? GREEN : MUTED} />
              </Card>

              {/* 4. Financial Health */}
              <Card style={{ gridColumn: "1" }}>
                <SectionTitle>4. Financial Health</SectionTitle>
                <HealthRow label="Revenue Growth (YoY)" value={profile.revenueGrowthYoy} />
                <HealthRow label="Earnings Growth (YoY)" value={profile.epsGrowthYoy} />
                <HealthRow label="Profit Margins" value={profile.netMargin} />
                <HealthRow label="Cash Flow" value={profile.currentRatio} />
                <HealthRow label="Balance Sheet" value={profile.currentRatio > 1.5 ? 1 : -1} />
              </Card>

              {/* 5. Revenue & Earnings */}
              <Card style={{ gridColumn: "2" }}>
                <SectionTitle>5. Revenue & Earnings Growth</SectionTitle>
                <RevenueChart reports={financials?.reports} />
              </Card>

              {/* 6. Analyst Ratings */}
              <Card style={{ gridColumn: "3" }}>
                <SectionTitle>6. Analyst Ratings</SectionTitle>
                <AnalystDonut ratings={ratings} />
                {ratings?.avgTarget && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "12px", borderTop: `1px solid ${BORDER}` }}>
                    <div>
                      <div style={{ color: MUTED, fontSize: "11px", fontWeight: "600" }}>AVG. PRICE TARGET</div>
                      <div style={{ color: GREEN, fontSize: "18px", fontWeight: "800" }}>${fmt(ratings.avgTarget)}</div>
                    </div>
                    {profile.price && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: MUTED, fontSize: "11px", fontWeight: "600" }}>UPSIDE</div>
                        <div style={{ color: GREEN, fontSize: "18px", fontWeight: "800" }}>
                          +{fmt(((ratings.avgTarget - profile.price) / profile.price) * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* 7. Competitive Advantages */}
              {verdict?.advantages && (
                <Card style={{ gridColumn: "1" }}>
                  <SectionTitle>7. Competitive Advantages</SectionTitle>
                  {verdict.advantages.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
                      <CheckCircle size={14} color={GREEN} style={{ marginTop: "2px", flexShrink: 0 }} />
                      <span style={{ color: TEXT, fontSize: "13px", lineHeight: "1.4" }}>{a}</span>
                    </div>
                  ))}
                </Card>
              )}

              {/* 8. Risks */}
              {verdict?.risks && (
                <Card style={{ gridColumn: "2" }}>
                  <SectionTitle>8. Risks to Consider</SectionTitle>
                  {verdict.risks.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
                      <AlertTriangle size={14} color="#f59e0b" style={{ marginTop: "2px", flexShrink: 0 }} />
                      <span style={{ color: TEXT, fontSize: "13px", lineHeight: "1.4" }}>{r}</span>
                    </div>
                  ))}
                </Card>
              )}

              {/* 9. Final Thoughts + Quick Actions */}
              <div style={{ gridColumn: "3", display: "flex", flexDirection: "column", gap: "16px" }}>
                {verdict?.finalThoughts && (
                  <Card>
                    <SectionTitle>9. Final Thoughts</SectionTitle>
                    <p style={{ color: TEXT, fontSize: "13px", lineHeight: "1.6", margin: "0 0 12px" }}>
                      {verdict.finalThoughts}
                    </p>
                    {verdict.bestFor && (
                      <div style={{ marginBottom: "4px" }}>
                        <span style={{ color: MUTED, fontSize: "12px" }}>Best For: </span>
                        <span style={{ color: GREEN, fontSize: "12px", fontWeight: "700" }}>{verdict.bestFor}</span>
                      </div>
                    )}
                    {verdict.timeHorizon && (
                      <div>
                        <span style={{ color: MUTED, fontSize: "12px" }}>Time Horizon: </span>
                        <span style={{ color: GOLD, fontSize: "12px", fontWeight: "700" }}>{verdict.timeHorizon}</span>
                      </div>
                    )}
                  </Card>
                )}
                <QuickActions symbol={symbol} />
              </div>
            </div>
          )}

          {/* FINANCIALS TAB */}
          {activeTab === "Financials" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Card>
                <SectionTitle>Annual Reports</SectionTitle>
                {financials?.reports?.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr>
                        {["Year", "Revenue", "Net Income", "Operating CF"].map(h => (
                          <th key={h} style={{ color: MUTED, fontWeight: "600", padding: "8px 0", textAlign: "left", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {financials.reports.map((r, i) => (
                        <tr key={i}>
                          <td style={{ color: TEXT, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>{r.year}</td>
                          <td style={{ color: GREEN, padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontWeight: "700" }}>${fmt(r.epsActual)}</td>
                          <td style={{ color: MUTED, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>${fmt(r.epsEstimate)}</td>
                          <td style={{ color: MUTED, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>{r.quarters || "--"} qtrs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: MUTED, fontSize: "13px" }}>No financial data available</p>}
              </Card>
              <Card>
                <SectionTitle>Earnings History</SectionTitle>
                {financials?.earnings?.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr>
                        {["Period", "Actual", "Estimate", "Surprise %"].map(h => (
                          <th key={h} style={{ color: MUTED, fontWeight: "600", padding: "8px 0", textAlign: "left", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {financials.earnings.map((e, i) => (
                        <tr key={i}>
                          <td style={{ color: TEXT, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>{e.period}</td>
                          <td style={{ color: TEXT, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>${fmt(e.actual)}</td>
                          <td style={{ color: MUTED, padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>${fmt(e.estimate)}</td>
                          <td style={{ color: e.surprisePercent > 0 ? GREEN : RED, padding: "10px 0", borderBottom: `1px solid ${BORDER}`, fontWeight: "700" }}>
                            {e.surprisePercent > 0 ? "+" : ""}{fmt(e.surprisePercent)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: MUTED, fontSize: "13px" }}>No earnings data available</p>}
              </Card>
            </div>
          )}

          {/* ANALYST RATINGS TAB */}
          {activeTab === "Analyst Ratings" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Card>
                <SectionTitle>Analyst Consensus</SectionTitle>
                <AnalystDonut ratings={ratings} />
                {ratings?.avgTarget && (
                  <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    {[
                      { label: "Average Target", value: `$${fmt(ratings.avgTarget)}`, color: GREEN },
                      { label: "High Target", value: `$${fmt(ratings.highTarget)}`, color: GREEN },
                      { label: "Low Target", value: `$${fmt(ratings.lowTarget)}`, color: RED },
                    ].map((t, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                        <div style={{ color: MUTED, fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>{t.label}</div>
                        <div style={{ color: t.color, fontSize: "18px", fontWeight: "800" }}>{t.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              <Card>
                <SectionTitle>AI Investment Verdict</SectionTitle>
                {verdict ? (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                      <ScoreRing score={verdict.score} />
                      <div>
                        <div style={{ color: verdictColor(verdict.verdict), fontSize: "22px", fontWeight: "800" }}>{verdict.verdict}</div>
                        <div style={{ color: MUTED, fontSize: "13px", marginTop: "4px" }}>{verdict.summary}</div>
                      </div>
                    </div>
                    <p style={{ color: TEXT, fontSize: "13px", lineHeight: "1.6" }}>{verdict.finalThoughts}</p>
                    <div style={{ marginTop: "12px" }}>
                      <span style={{ color: MUTED, fontSize: "12px" }}>Best For: </span>
                      <span style={{ color: GREEN, fontSize: "12px", fontWeight: "700" }}>{verdict.bestFor}</span>
                    </div>
                    <div>
                      <span style={{ color: MUTED, fontSize: "12px" }}>Time Horizon: </span>
                      <span style={{ color: GOLD, fontSize: "12px", fontWeight: "700" }}>{verdict.timeHorizon}</span>
                    </div>
                  </div>
                ) : <p style={{ color: MUTED }}>Loading verdict...</p>}
              </Card>
            </div>
          )}

          {/* NEWS TAB */}
          {activeTab === "News" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {news.length === 0 ? (
                <Card><p style={{ color: MUTED, fontSize: "13px" }}>No recent news found for {symbol}</p></Card>
              ) : news.map((n, i) => (
                <a key={i} href={n.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <Card style={{ transition: "border-color 0.2s", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: TEXT, fontSize: "14px", fontWeight: "700", marginBottom: "6px", lineHeight: "1.4" }}>{n.title}</div>
                        <div style={{ color: MUTED, fontSize: "13px", lineHeight: "1.5", marginBottom: "8px" }}>{n.description}</div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <span style={{ color: GOLD, fontSize: "12px", fontWeight: "600" }}>{n.source}</span>
                          <span style={{ color: MUTED, fontSize: "12px" }}>{new Date(n.published).toLocaleDateString()}</span>
                          {n.sentiment && (
                            <span style={{
                              background: n.sentiment === "positive" ? "rgba(34,197,94,0.1)" : n.sentiment === "negative" ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
                              color: n.sentiment === "positive" ? GREEN : n.sentiment === "negative" ? RED : MUTED,
                              border: `1px solid ${n.sentiment === "positive" ? "rgba(34,197,94,0.3)" : n.sentiment === "negative" ? "rgba(239,68,68,0.3)" : BORDER}`,
                              borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: "700",
                            }}>
                              {n.sentiment.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ marginTop: "24px", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", textAlign: "center" }}>
            <span style={{ color: MUTED, fontSize: "11px" }}>
              ⚠️ This is not financial advice. Data is provided for informational and educational purposes only. Always do your own research before investing.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
