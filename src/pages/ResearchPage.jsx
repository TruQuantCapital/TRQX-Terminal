import React, { useState, useCallback } from "react";
import PageChatWidget from "../components/PageChatWidget";
import {
  Search, CheckCircle, AlertTriangle, Users, Globe,
  Building, Calendar, DollarSign, Activity, Loader,
  TrendingUp, TrendingDown, BarChart3,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://trqx-flow-scanner-production.up.railway.app";

const GOLD = "#d4af37";
const GOLD_DIM = "rgba(212,175,55,0.12)";
const GOLD_BORDER = "rgba(212,175,55,0.3)";
const CARD_BG = "rgba(255,255,255,0.03)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f5f1e8";
const MUTED = "#9ca3af";
const GREEN = "#22c55e";
const RED = "#ef4444";

function fmt(v, dec = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(dec) : "--";
}
function fmtMktCap(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}T`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}B`;
  return `$${n.toFixed(0)}M`;
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
function buildYearlyEPS(earnings) {
  if (!earnings || earnings.length === 0) return [];
  const byYear = {};
  earnings.forEach(e => {
    if (!e.period) return;
    const yr = e.period.substring(0, 4);
    if (!byYear[yr]) byYear[yr] = { year: yr, quarters: [], actualSum: 0, estimateSum: 0 };
    byYear[yr].quarters.push(e);
    byYear[yr].actualSum += Number(e.actual) || 0;
    byYear[yr].estimateSum += Number(e.estimate) || 0;
  });
  return Object.values(byYear)
    .sort((a, b) => a.year - b.year)
    .slice(-5)
    .map(yr => ({
      year: yr.year,
      epsActual: +yr.actualSum.toFixed(2),
      epsEstimate: +yr.estimateSum.toFixed(2),
      quarters: yr.quarters.length,
    }));
}

function ScoreRing({ score, size = 90 }) {
  const s = Number(score) || 0;
  const r = size * 0.4, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (s / 10);
  const color = s >= 7 ? GREEN : s >= 5 ? GOLD : RED;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={CARD_BORDER} strokeWidth="8" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 3} textAnchor="middle" fill={color} fontSize={size * 0.2} fontWeight="800">{s}</text>
      <text x={cx} y={cy + size * 0.14} textAnchor="middle" fill={MUTED} fontSize={size * 0.1}>/10</text>
    </svg>
  );
}

function AnalystDonut({ ratings, size = 120 }) {
  const { strongBuy = 0, buy = 0, hold = 0, sell = 0, strongSell = 0, total = 0 } = ratings || {};
  if (!total) return <div style={{ color: MUTED, fontSize: "14px" }}>No ratings data</div>;
  const segs = [
    { label: "Strong Buy", value: strongBuy, color: GREEN },
    { label: "Buy", value: buy, color: "#86efac" },
    { label: "Hold", value: hold, color: GOLD },
    { label: "Sell", value: sell, color: "#fca5a5" },
    { label: "Strong Sell", value: strongSell, color: RED },
  ];
  const r = size * 0.42, cx = size / 2, cy = size / 2, stroke = size * 0.15;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segs.map((seg, i) => {
          if (!seg.value) return null;
          const pct = seg.value / total;
          const dash = circ * pct;
          const el = (<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`} />);
          offset += dash;
          return el;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={TEXT} fontSize={size * 0.18} fontWeight="800">{total}</text>
        <text x={cx} y={cy + size * 0.12} textAnchor="middle" fill={MUTED} fontSize={size * 0.09}>Analysts</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {segs.filter(s => s.value > 0).map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: seg.color, flexShrink: 0 }} />
            <span style={{ color: TEXT, fontSize: "14px", fontWeight: "600" }}>{seg.label}</span>
            <span style={{ color: MUTED, fontSize: "13px" }}>{seg.value} ({Math.round((seg.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EPSChart({ reports }) {
  if (!reports || reports.length === 0) return (
    <div style={{ color: MUTED, fontSize: "14px", padding: "40px 0", textAlign: "center" }}>No earnings data available</div>
  );
  const maxVal = Math.max(...reports.map(r => Math.abs(Number(r.epsActual) || 0)), 0.01);
  const H = 180;
  return (
    <div>
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "14px", height: "14px", borderRadius: "3px", background: GREEN }} />
          <span style={{ color: MUTED, fontSize: "13px", fontWeight: "600" }}>EPS Actual</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "14px", height: "14px", borderRadius: "3px", background: GOLD, opacity: 0.7 }} />
          <span style={{ color: MUTED, fontSize: "13px", fontWeight: "600" }}>EPS Estimate</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", height: `${H}px` }}>
        {reports.map((r, i) => {
          const actual = Number(r.epsActual) || 0;
          const estimate = Number(r.epsEstimate) || 0;
          const aH = Math.max((Math.abs(actual) / maxVal) * (H - 32), 8);
          const eH = Math.max((Math.abs(estimate) / maxVal) * (H - 32), 8);
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: `${H - 32}px` }}>
                <div style={{ position: "relative", width: "28px", height: `${aH}px`, background: GREEN, borderRadius: "5px 5px 0 0" }}>
                  <span style={{ position: "absolute", top: "-22px", left: "50%", transform: "translateX(-50%)", color: GREEN, fontSize: "11px", whiteSpace: "nowrap", fontWeight: "700" }}>${fmt(actual)}</span>
                </div>
                <div style={{ width: "28px", height: `${eH}px`, background: GOLD, borderRadius: "5px 5px 0 0", opacity: 0.7 }} />
              </div>
              <span style={{ color: MUTED, fontSize: "12px", fontWeight: "700" }}>{r.year}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TVChart({ symbol }) {
  return (
    <div style={{ width: "100%", height: "420px", borderRadius: "10px", overflow: "hidden", background: "rgba(0,0,0,0.4)" }}>
      <iframe title={`${symbol} chart`}
        src={`https://s.tradingview.com/widgetembed/?frameElementId=tv&symbol=${symbol}&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&theme=dark&style=1&timezone=exchange&withdateranges=1`}
        style={{ width: "100%", height: "100%", border: "none" }} allowTransparency frameBorder="0" />
    </div>
  );
}

function Section({ title, children, style }) {
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: "14px", padding: "28px", ...style }}>
      {title && (
        <div style={{ color: MUTED, fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "20px" }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function MetricTile({ label, value, color, suffix = "" }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${CARD_BORDER}`, borderRadius: "10px", padding: "16px 20px" }}>
      <div style={{ color: MUTED, fontSize: "11px", fontWeight: "700", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ color: color || TEXT, fontSize: "22px", fontWeight: "800" }}>{value}{suffix}</div>
    </div>
  );
}

function HealthRow({ label, value }) {
  const n = Number(value);
  const good = Number.isFinite(n) && n > 0;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${CARD_BORDER}` }}>
      <span style={{ color: TEXT, fontSize: "15px" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <CheckCircle size={16} color={good ? GREEN : MUTED} />
        <span style={{ color: good ? GREEN : MUTED, fontSize: "14px", fontWeight: "700" }}>{good ? "Strong" : Number.isFinite(n) ? "Moderate" : "--"}</span>
      </div>
    </div>
  );
}

function SearchBar({ onSearch, loading }) {
  const [input, setInput] = useState("");
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "14px", background: "rgba(255,255,255,0.05)", border: `1px solid ${CARD_BORDER}`, borderRadius: "12px", padding: "16px 20px" }}>
        <Search size={20} color={MUTED} />
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSearch(input.trim().toUpperCase())}
          placeholder="Search any stock... (e.g. NVDA, AAPL, TSLA, SPY)"
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: TEXT, fontSize: "16px" }} />
      </div>
      <button onClick={() => onSearch(input.trim().toUpperCase())} disabled={loading || !input.trim()}
        style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "12px", padding: "16px 32px", color: GOLD, fontSize: "15px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", opacity: loading ? 0.6 : 1, whiteSpace: "nowrap" }}>
        {loading ? <Loader size={18} /> : <Search size={18} />}
        {loading ? "Analyzing..." : "Research"}
      </button>
    </div>
  );
}

const TABS = ["Overview", "Financials", "Analyst Ratings", "News"];

export default function ResearchPage() {
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [profile, setProfile] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [news, setNews] = useState([]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [error, setError] = useState(null);

  const fetchResearch = useCallback(async (sym) => {
    if (!sym) return;
    setLoading(true); setError(null); setProfile(null);
    setFinancials(null); setRatings(null); setVerdict(null);
    setNews([]); setSymbol(sym); setActiveTab("Overview");
    try {
      const [pRes, fRes, rRes, nRes] = await Promise.all([
        fetch(`${API}/api/research/profile/${sym}`),
        fetch(`${API}/api/research/financials/${sym}`),
        fetch(`${API}/api/research/ratings/${sym}`),
        fetch(`${API}/api/news?ticker=${sym}&limit=10`),
      ]);
      const p = pRes.ok ? await pRes.json() : null;
      const f = fRes.ok ? await fRes.json() : null;
      const r = rRes.ok ? await rRes.json() : null;
      const n = nRes.ok ? await nRes.json() : { rows: [] };
      setProfile(p); setFinancials(f); setRatings(r); setNews(n.rows || []);
      if (p && r) {
        const vRes = await fetch(`${API}/api/research/ai-verdict`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: sym, profile: p, metrics: p, ratings: r }),
        });
        if (vRes.ok) setVerdict(await vRes.json());
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const quickTickers = ["NVDA", "AAPL", "TSLA", "MSFT", "AMZN", "META", "SPY", "QQQ"];

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1500px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ color: GOLD, fontSize: "28px", fontWeight: "800", margin: "0 0 6px" }}>Stock Research</h1>
        <p style={{ color: MUTED, fontSize: "15px", margin: 0 }}>Fundamental analysis, AI investment verdict, analyst ratings, and news — all in one place.</p>
      </div>

      <SearchBar onSearch={fetchResearch} loading={loading} />

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "20px", color: "#fca5a5", fontSize: "15px", marginBottom: "24px" }}>
          Error loading {symbol}: {error}
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "80px" }}>
          <Loader size={36} color={GOLD} />
          <span style={{ fontSize: "18px", color: MUTED, fontWeight: "600" }}>Analyzing {symbol}...</span>
          <span style={{ fontSize: "14px", color: MUTED }}>Pulling financials, ratings, and generating AI verdict</span>
        </div>
      )}

      {!loading && !profile && !error && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <BarChart3 size={56} color={MUTED} style={{ margin: "0 auto 20px" }} />
          <h2 style={{ color: TEXT, fontSize: "24px", fontWeight: "700", margin: "0 0 10px" }}>Search any stock to begin</h2>
          <p style={{ color: MUTED, fontSize: "16px", marginBottom: "28px" }}>Get AI-powered analysis, fundamentals, and analyst ratings in seconds</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {quickTickers.map(s => (
              <button key={s} onClick={() => fetchResearch(s)} style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "10px", padding: "12px 24px", color: GOLD, fontSize: "15px", fontWeight: "800", cursor: "pointer" }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {!loading && profile && (
        <div>
          {/* Company Header */}
          <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: "16px", padding: "32px", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "12px" }}>
                {profile.logo && (<img src={profile.logo} alt={profile.name} style={{ width: "64px", height: "64px", objectFit: "contain", borderRadius: "10px", background: "#fff", padding: "6px" }} />)}
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
                    <span style={{ color: TEXT, fontSize: "36px", fontWeight: "900", letterSpacing: "-0.02em" }}>{symbol}</span>
                    <span style={{ color: MUTED, fontSize: "18px" }}>{profile.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                    {[profile.industry, profile.exchange, profile.country].filter(Boolean).map((v, i) => (
                      <span key={i} style={{ color: MUTED, fontSize: "14px" }}>{i > 0 ? "• " : ""}{v}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "24px" }}>
                <span style={{ color: TEXT, fontSize: "48px", fontWeight: "900", letterSpacing: "-0.02em" }}>${fmt(profile.price)}</span>
                <span style={{ color: profile.change >= 0 ? GREEN : RED, fontSize: "20px", fontWeight: "700" }}>
                  {profile.change >= 0 ? "+" : ""}{fmt(profile.change)} ({profile.changePct >= 0 ? "+" : ""}{fmt(profile.changePct)}%)
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {[
                  { label: "Market Cap", value: fmtMktCap(profile.marketCap) },
                  { label: "P/E Ratio", value: fmt(profile.pe) },
                  { label: "52W High", value: `$${fmt(profile.week52High)}` },
                  { label: "52W Low", value: `$${fmt(profile.week52Low)}` },
                  { label: "Beta", value: fmt(profile.beta) },
                  { label: "Div Yield", value: profile.dividendYield ? `${fmt(profile.dividendYield)}%` : "N/A" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${CARD_BORDER}`, borderRadius: "8px", padding: "8px 16px" }}>
                    <div style={{ color: MUTED, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "2px" }}>{s.label}</div>
                    <div style={{ color: TEXT, fontSize: "15px", fontWeight: "700" }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            {verdict ? (
              <div style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "14px", padding: "28px", minWidth: "300px" }}>
                <div style={{ color: MUTED, fontSize: "11px", fontWeight: "800", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Investment Verdict</div>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px" }}>
                  <div>
                    <div style={{ color: verdictColor(verdict.verdict), fontSize: "26px", fontWeight: "900", marginBottom: "8px" }}>{verdict.verdict}</div>
                    <p style={{ color: MUTED, fontSize: "13px", lineHeight: "1.5", margin: 0, maxWidth: "180px" }}>{verdict.summary}</p>
                  </div>
                  <ScoreRing score={verdict.score} size={100} />
                </div>
              </div>
            ) : (
              <div style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "14px", padding: "28px", minWidth: "280px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                <Loader size={20} color={GOLD} /><span style={{ color: MUTED }}>Generating verdict...</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: `1px solid ${CARD_BORDER}` }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: "none", border: "none", padding: "14px 28px", cursor: "pointer", fontSize: "15px", fontWeight: "700", color: activeTab === tab ? GOLD : MUTED, borderBottom: activeTab === tab ? `3px solid ${GOLD}` : "3px solid transparent", marginBottom: "-1px", transition: "color 0.2s" }}>{tab}</button>
            ))}
          </div>

          {/* OVERVIEW */}
          {activeTab === "Overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "20px" }}>
                <Section title="1. Company Overview">
                  <p style={{ color: MUTED, fontSize: "14px", lineHeight: "1.7", marginBottom: "20px" }}>{profile.description}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {[
                      { icon: Users, label: "CEO", value: profile.ceo },
                      { icon: Calendar, label: "Founded", value: profile.founded },
                      { icon: Building, label: "Employees", value: profile.employees?.toLocaleString() },
                      { icon: Globe, label: "Headquarters", value: profile.headquarter },
                      { icon: DollarSign, label: "Market Cap", value: fmtMktCap(profile.marketCap) },
                      { icon: Activity, label: "Sector", value: profile.industry },
                    ].map((item, i) => { const Icon = item.icon; return item.value ? (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Icon size={16} color={MUTED} style={{ flexShrink: 0 }} />
                        <span style={{ color: MUTED, fontSize: "13px", minWidth: "90px" }}>{item.label}</span>
                        <span style={{ color: TEXT, fontSize: "14px", fontWeight: "600" }}>{item.value}</span>
                      </div>
                    ) : null; })}
                  </div>
                </Section>
                <Section title="2. Price Performance">
                  <TVChart symbol={symbol} />
                </Section>
              </div>

              <Section title="3. Key Metrics">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
                  <MetricTile label="P/E Ratio (TTM)" value={fmt(profile.pe)} color={GOLD} />
                  <MetricTile label="Forward P/E" value={fmt(profile.forwardPE)} color={GOLD} />
                  <MetricTile label="Price / Sales" value={fmt(profile.ps)} color={GOLD} />
                  <MetricTile label="Price / Book" value={fmt(profile.pb)} color={GOLD} />
                  <MetricTile label="PEG Ratio" value={fmt(profile.peg)} color={GOLD} />
                  <MetricTile label="ROE (TTM)" value={fmt(profile.roe)} suffix="%" color={profile.roe > 15 ? GREEN : MUTED} />
                  <MetricTile label="Gross Margin" value={fmt(profile.grossMargin)} suffix="%" color={profile.grossMargin > 40 ? GREEN : MUTED} />
                  <MetricTile label="Net Margin" value={fmt(profile.netMargin)} suffix="%" color={profile.netMargin > 10 ? GREEN : MUTED} />
                  <MetricTile label="Debt / Equity" value={fmt(profile.debtEquity)} color={profile.debtEquity < 1 ? GREEN : RED} />
                  <MetricTile label="Current Ratio" value={fmt(profile.currentRatio)} color={profile.currentRatio > 1.5 ? GREEN : MUTED} />
                </div>
              </Section>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: "20px" }}>
                <Section title="4. Financial Health">
                  <HealthRow label="Revenue Growth (YoY)" value={profile.revenueGrowthYoy} />
                  <HealthRow label="Earnings Growth (YoY)" value={profile.epsGrowthYoy} />
                  <HealthRow label="Profit Margins" value={profile.netMargin} />
                  <HealthRow label="Cash Flow" value={profile.currentRatio} />
                  <HealthRow label="Balance Sheet" value={profile.currentRatio > 1.5 ? 1 : -1} />
                </Section>
                <Section title="5. Revenue & Earnings Growth">
                  <EPSChart reports={financials?.earnings ? buildYearlyEPS(financials.earnings) : []} />
                </Section>
                <Section title="6. Analyst Ratings">
                  <AnalystDonut ratings={ratings} size={140} />
                  {ratings?.avgTarget && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", paddingTop: "16px", borderTop: `1px solid ${CARD_BORDER}` }}>
                      <div>
                        <div style={{ color: MUTED, fontSize: "12px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Avg Target</div>
                        <div style={{ color: GREEN, fontSize: "22px", fontWeight: "800" }}>${fmt(ratings.avgTarget)}</div>
                      </div>
                      {profile.price && (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: MUTED, fontSize: "12px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Upside</div>
                          <div style={{ color: GREEN, fontSize: "22px", fontWeight: "800" }}>+{fmt(((ratings.avgTarget - profile.price) / profile.price) * 100)}%</div>
                        </div>
                      )}
                    </div>
                  )}
                </Section>
              </div>

              {verdict && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                  <Section title="7. Competitive Advantages">
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {(verdict.advantages || []).map((a, i) => (
                        <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                          <CheckCircle size={18} color={GREEN} style={{ flexShrink: 0, marginTop: "2px" }} />
                          <span style={{ color: TEXT, fontSize: "14px", lineHeight: "1.5" }}>{a}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                  <Section title="8. Risks to Consider">
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {(verdict.risks || []).map((r, i) => (
                        <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                          <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: "2px" }} />
                          <span style={{ color: TEXT, fontSize: "14px", lineHeight: "1.5" }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                  <Section title="9. Final Thoughts">
                    <p style={{ color: TEXT, fontSize: "14px", lineHeight: "1.7", marginBottom: "20px" }}>{verdict.finalThoughts}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <TrendingUp size={16} color={GREEN} />
                        <span style={{ color: MUTED, fontSize: "13px" }}>Best For:</span>
                        <span style={{ color: GREEN, fontSize: "14px", fontWeight: "700" }}>{verdict.bestFor}</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <Calendar size={16} color={GOLD} />
                        <span style={{ color: MUTED, fontSize: "13px" }}>Time Horizon:</span>
                        <span style={{ color: GOLD, fontSize: "14px", fontWeight: "700" }}>{verdict.timeHorizon}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <a href="/options-flow" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: `1px solid ${CARD_BORDER}`, borderRadius: "8px", color: TEXT, textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>View Options Flow →</a>
                      <a href={`/trade-plan?ticker=${symbol}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: `1px solid ${CARD_BORDER}`, borderRadius: "8px", color: TEXT, textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Open Trade Plan →</a>
                    </div>
                  </Section>
                </div>
              )}
            </div>
          )}

          {/* FINANCIALS */}
          {activeTab === "Financials" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <Section title="Annual EPS Summary">
                {financials?.earnings?.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Year", "EPS Actual", "EPS Estimate", "Quarters"].map(h => (
                      <th key={h} style={{ color: MUTED, fontWeight: "700", padding: "12px 0", textAlign: "left", borderBottom: `1px solid ${CARD_BORDER}`, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}</tr></thead>
                    <tbody>{buildYearlyEPS(financials.earnings).map((r, i) => (
                      <tr key={i}>
                        <td style={{ color: TEXT, padding: "14px 0", borderBottom: `1px solid ${CARD_BORDER}`, fontSize: "15px", fontWeight: "700" }}>{r.year}</td>
                        <td style={{ color: GREEN, padding: "14px 0", borderBottom: `1px solid ${CARD_BORDER}`, fontSize: "15px", fontWeight: "800" }}>${fmt(r.epsActual)}</td>
                        <td style={{ color: MUTED, padding: "14px 0", borderBottom: `1px solid ${CARD_BORDER}`, fontSize: "15px" }}>${fmt(r.epsEstimate)}</td>
                        <td style={{ color: MUTED, padding: "14px 0", borderBottom: `1px solid ${CARD_BORDER}`, fontSize: "15px" }}>{r.quarters} qtrs</td>
                      </tr>
                    ))}</tbody>
                  </table>
                ) : <p style={{ color: MUTED }}>No data available</p>}
              </Section>
              <Section title="Quarterly Earnings History">
                {financials?.earnings?.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Period", "Actual EPS", "Estimate", "Surprise %"].map(h => (
                      <th key={h} style={{ color: MUTED, fontWeight: "700", padding: "12px 0", textAlign: "left", borderBottom: `1px solid ${CARD_BORDER}`, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}</tr></thead>
                    <tbody>{financials.earnings.map((e, i) => (
                      <tr key={i}>
                        <td style={{ color: TEXT, padding: "14px 0", borderBottom: `1px solid ${CARD_BORDER}`, fontSize: "14px" }}>{e.period}</td>
                        <td style={{ color: TEXT, padding: "14px 0", borderBottom: `1px solid ${CARD_BORDER}`, fontSize: "14px", fontWeight: "700" }}>${fmt(e.actual)}</td>
                        <td style={{ color: MUTED, padding: "14px 0", borderBottom: `1px solid ${CARD_BORDER}`, fontSize: "14px" }}>${fmt(e.estimate)}</td>
                        <td style={{ color: e.surprisePercent > 0 ? GREEN : RED, padding: "14px 0", borderBottom: `1px solid ${CARD_BORDER}`, fontSize: "14px", fontWeight: "800" }}>{e.surprisePercent > 0 ? "+" : ""}{fmt(e.surprisePercent)}%</td>
                      </tr>
                    ))}</tbody>
                  </table>
                ) : <p style={{ color: MUTED }}>No data available</p>}
              </Section>
            </div>
          )}

          {/* ANALYST RATINGS */}
          {activeTab === "Analyst Ratings" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <Section title="Analyst Consensus">
                <AnalystDonut ratings={ratings} size={160} />
                {ratings?.avgTarget && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "24px" }}>
                    {[
                      { label: "Average Target", value: `$${fmt(ratings.avgTarget)}`, color: GREEN },
                      { label: "High Target", value: `$${fmt(ratings.highTarget)}`, color: GREEN },
                      { label: "Low Target", value: `$${fmt(ratings.lowTarget)}`, color: RED },
                    ].map((t, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${CARD_BORDER}`, borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                        <div style={{ color: MUTED, fontSize: "12px", fontWeight: "700", textTransform: "uppercase", marginBottom: "6px" }}>{t.label}</div>
                        <div style={{ color: t.color, fontSize: "22px", fontWeight: "800" }}>{t.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
              <Section title="AI Investment Verdict">
                {verdict ? (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px" }}>
                      <ScoreRing score={verdict.score} size={110} />
                      <div>
                        <div style={{ color: verdictColor(verdict.verdict), fontSize: "28px", fontWeight: "900", marginBottom: "10px" }}>{verdict.verdict}</div>
                        <p style={{ color: MUTED, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>{verdict.summary}</p>
                      </div>
                    </div>
                    <p style={{ color: TEXT, fontSize: "14px", lineHeight: "1.7", marginBottom: "16px" }}>{verdict.finalThoughts}</p>
                    <div style={{ display: "flex", gap: "20px" }}>
                      <div><span style={{ color: MUTED, fontSize: "13px" }}>Best For: </span><span style={{ color: GREEN, fontSize: "14px", fontWeight: "700" }}>{verdict.bestFor}</span></div>
                      <div><span style={{ color: MUTED, fontSize: "13px" }}>Time Horizon: </span><span style={{ color: GOLD, fontSize: "14px", fontWeight: "700" }}>{verdict.timeHorizon}</span></div>
                    </div>
                  </div>
                ) : <div style={{ display: "flex", alignItems: "center", gap: "12px", color: MUTED }}><Loader size={20} color={GOLD} /> Generating verdict...</div>}
              </Section>
            </div>
          )}

          {/* NEWS */}
          {activeTab === "News" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {news.length === 0 ? (
                <Section><p style={{ color: MUTED, fontSize: "15px" }}>No recent news found for {symbol}</p></Section>
              ) : news.map((n, i) => (
                <a key={i} href={n.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <Section style={{ cursor: "pointer" }}>
                    <div style={{ color: TEXT, fontSize: "17px", fontWeight: "700", marginBottom: "8px", lineHeight: "1.4" }}>{n.title}</div>
                    <div style={{ color: MUTED, fontSize: "14px", lineHeight: "1.6", marginBottom: "12px" }}>{n.description}</div>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <span style={{ color: GOLD, fontSize: "13px", fontWeight: "700" }}>{n.source}</span>
                      <span style={{ color: MUTED, fontSize: "13px" }}>{new Date(n.published).toLocaleDateString()}</span>
                      {n.sentiment && (
                        <span style={{ background: n.sentiment === "positive" ? "rgba(34,197,94,0.1)" : n.sentiment === "negative" ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)", color: n.sentiment === "positive" ? GREEN : n.sentiment === "negative" ? RED : MUTED, border: `1px solid ${n.sentiment === "positive" ? "rgba(34,197,94,0.3)" : n.sentiment === "negative" ? "rgba(239,68,68,0.3)" : CARD_BORDER}`, borderRadius: "5px", padding: "3px 10px", fontSize: "12px", fontWeight: "700" }}>
                          {n.sentiment.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </Section>
                </a>
              ))}
            </div>
          )}

          <div style={{ marginTop: "28px", padding: "14px 20px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", textAlign: "center" }}>
            <span style={{ color: MUTED, fontSize: "12px" }}>⚠️ This is not financial advice. Data is for informational and educational purposes only. Always do your own research before investing.</span>
          </div>
        </div>
      )}
      <PageChatWidget context="The user is on the Stock Research page analyzing fundamental data, AI investment verdicts, analyst ratings, and financial metrics." placeholder="Ask me about this stock, what the metrics mean, or how to interpret the analyst ratings." />
    </div>
  );
}
 