import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageChatWidget from "../components/PageChatWidget";
import {
  Search, SearchCheck, X, Loader2, Sparkles, Building2, CircleDollarSign,
  Landmark, PieChart, Newspaper, Target, CheckCircle2, AlertTriangle,
  GraduationCap, LineChart, CalendarDays, ShieldAlert, TrendingUp,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://trqx-flow-scanner-production.up.railway.app";

const C = {
  surface: "#0d1117", raised: "#11161d", text: "#f5f1e8", soft: "#d8d3c7",
  muted: "#8e98a8", dim: "#5e6877", gold: "#d4af37", green: "#35d07f",
  red: "#ff626b", amber: "#f2b84b", border: "rgba(255,255,255,.085)",
  borderStrong: "rgba(255,255,255,.14)", goldSoft: "rgba(212,175,55,.12)",
  goldBorder: "rgba(212,175,55,.35)", greenSoft: "rgba(53,208,127,.10)",
  redSoft: "rgba(255,98,107,.10)", amberSoft: "rgba(242,184,75,.10)",
};

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const finite = (v) => Number.isFinite(Number(v));
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const fmt = (v, d = 2) => finite(v) ? Number(v).toFixed(d) : "Unavailable";
const pct = (v, d = 1) => finite(v) ? `${Number(v).toFixed(d)}%` : "Unavailable";
const money = (v, d = 2) => finite(v) && Number(v) > 0
  ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(v))
  : "Unavailable";
const mktCap = (v) => finite(v) && Number(v) > 0 ? `$${compact.format(Number(v) * 1_000_000)}` : "Unavailable";

function scoreGrade(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return "—";
  const s = n <= 10 ? n * 10 : n;
  if (s >= 93) return "A+"; if (s >= 87) return "A"; if (s >= 80) return "A-";
  if (s >= 73) return "B+"; if (s >= 67) return "B"; if (s >= 60) return "B-";
  if (s >= 50) return "C"; if (s >= 40) return "D"; return "F";
}

function metricState(key, value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return { label: "Not reported", tone: "neutral", score: 0 };
  const map = {
    revenue: n >= 20 ? ["Excellent growth", "positive", 90] : n >= 8 ? ["Healthy growth", "positive", 72] : n >= 0 ? ["Slow growth", "warning", 48] : ["Revenue declining", "negative", 20],
    earnings: n >= 20 ? ["Strong improvement", "positive", 88] : n >= 5 ? ["Improving", "positive", 68] : n >= 0 ? ["Limited growth", "warning", 45] : ["Earnings weakening", "negative", 18],
    margin: n >= 20 ? ["Highly profitable", "positive", 90] : n >= 10 ? ["Profitable", "positive", 72] : n >= 0 ? ["Thin profitability", "warning", 48] : ["Not profitable", "negative", 18],
    gross: n >= 50 ? ["Strong pricing power", "positive", 86] : n >= 30 ? ["Healthy margin", "positive", 68] : n >= 15 ? ["Moderate margin", "warning", 48] : ["Low margin", "negative", 25],
    liquidity: n >= 2 ? ["Strong liquidity", "positive", 86] : n >= 1.2 ? ["Adequate liquidity", "positive", 66] : n >= 1 ? ["Tight liquidity", "warning", 45] : ["Liquidity concern", "negative", 20],
    debt: n <= .5 ? ["Low debt", "positive", 86] : n <= 1.2 ? ["Manageable debt", "positive", 65] : n <= 2 ? ["Elevated debt", "warning", 42] : ["High debt", "negative", 18],
    pe: n <= 0 ? ["Not meaningful", "neutral", 0] : n <= 18 ? ["Reasonable valuation", "positive", 75] : n <= 30 ? ["Premium valuation", "warning", 55] : ["Expensive valuation", "negative", 28],
    beta: n < .8 ? ["Lower volatility", "positive", 82] : n <= 1.2 ? ["Market-like volatility", "positive", 68] : n <= 1.8 ? ["High volatility", "warning", 42] : ["Very high volatility", "negative", 20],
  };
  const [label, tone, score] = map[key] || ["Available", "neutral", 50];
  return { label, tone, score };
}

function toneColors(tone) {
  if (tone === "positive") return { color: C.green, bg: C.greenSoft };
  if (tone === "negative") return { color: C.red, bg: C.redSoft };
  if (tone === "warning") return { color: C.amber, bg: C.amberSoft };
  return { color: C.muted, bg: "rgba(255,255,255,.04)" };
}

function riskLevel(p) {
  let points = 0;
  const beta = Number(p?.beta), margin = Number(p?.netMargin), debt = Number(p?.debtEquity), growth = Number(p?.revenueGrowthYoy);
  if (Number.isFinite(beta)) points += beta > 1.8 ? 3 : beta > 1.2 ? 2 : 1;
  if (Number.isFinite(margin)) points += margin < 0 ? 3 : margin < 8 ? 2 : 1;
  if (Number.isFinite(debt)) points += debt > 2 ? 3 : debt > 1 ? 2 : 1;
  if (Number.isFinite(growth)) points += growth < 0 ? 2 : growth < 8 ? 1 : 0;
  return points >= 8 ? "High" : points >= 5 ? "Moderate" : "Lower";
}

function Card({ children, className = "", style }) {
  return <section className={`rq-card ${className}`} style={style}>{children}</section>;
}
function Eyebrow({ children, icon: Icon }) {
  return <div className="rq-eyebrow">{Icon ? <Icon size={14} /> : null}{children}</div>;
}
function Badge({ children, tone = "neutral" }) {
  const c = toneColors(tone);
  return <span className="rq-badge" style={{ color: c.color, background: c.bg, borderColor: `${c.color}44` }}>{children}</span>;
}
function ScoreRing({ score }) {
  const raw = Number(score), normalized = Number.isFinite(raw) ? clamp(raw <= 10 ? raw * 10 : raw, 0, 100) : 0;
  const color = normalized >= 75 ? C.green : normalized >= 55 ? C.gold : C.red;
  return <div className="rq-score" style={{ background: `conic-gradient(${color} ${normalized}%, rgba(255,255,255,.08) 0)` }}><div><strong style={{ color }}>{Number.isFinite(raw) ? Math.round(normalized) : "—"}</strong><span>TRQX Score</span></div></div>;
}
function HealthBar({ label, state }) {
  const c = toneColors(state.tone);
  return <div className="rq-health"><div><span><b>{label}</b><small>{state.label}</small></span><strong style={{ color: c.color }}>{state.score}</strong></div><i><em style={{ width: `${state.score}%`, background: c.color }} /></i></div>;
}
function BulletList({ items = [], positive = true }) {
  const Icon = positive ? CheckCircle2 : AlertTriangle, color = positive ? C.green : C.amber;
  return <div className="rq-bullets">{items.map((item, i) => <div key={`${item}-${i}`}><Icon size={18} color={color} /><span>{item}</span></div>)}</div>;
}
function Metric({ label, value, state, explanation }) {
  const [open, setOpen] = useState(false);
  const c = toneColors(state?.tone || "neutral");
  return <div className="rq-metric"><div className="rq-metric-top"><div><span>{label}</span><strong>{value}</strong></div><Badge tone={state?.tone}>{state?.label || "Available"}</Badge></div><button onClick={() => setOpen(v => !v)}><GraduationCap size={15} />{open ? "Hide explanation" : "What does this mean?"}</button>{open ? <p style={{ borderLeftColor: c.color }}>{explanation}</p> : null}</div>;
}

function SmartSearch({ loading, onSearch }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [focused, setFocused] = useState(false);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults([]); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`${API}/api/research/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!r.ok) throw new Error();
        const data = await r.json(); setResults(Array.isArray(data) ? data : data.results || []);
      } catch (e) { if (e.name !== "AbortError") setResults([]); }
      finally { setSearching(false); }
    }, 280);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);
  const submit = (value = query) => { const clean = String(value).trim(); if (!clean || loading) return; setFocused(false); setResults([]); onSearch(clean); };
  return <div className="rq-search-wrap"><div className="rq-search"><Search size={21} color={C.muted} /><input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)} onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") setFocused(false); }} placeholder="Search by company name or ticker — Rocket Lab, Apple, NVDA..." />{query ? <button onClick={() => setQuery("")}><X size={17} /></button> : null}{searching ? <Loader2 className="rq-spin" size={18} color={C.gold} /> : null}</div><button className="rq-search-btn" disabled={loading || !query.trim()} onClick={() => submit()}>{loading ? <Loader2 className="rq-spin" size={18} /> : <SearchCheck size={18} />}{loading ? "Analyzing" : "Research"}</button>{focused && results.length ? <div className="rq-results">{results.slice(0, 8).map((r, i) => { const s = r.symbol || r.displaySymbol; return <button key={`${s}-${i}`} onMouseDown={e => e.preventDefault()} onClick={() => { setQuery(s); submit(s); }}><b>{s}</b><span>{r.name || r.description || "Security"}</span><small>{r.exchange || r.type || ""}</small></button>; })}</div> : null}</div>;
}

function TVChart({ symbol }) {
  return <div className="rq-tv"><iframe title={`${symbol} chart`} src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&theme=dark&style=1&timezone=exchange&withdateranges=1`} allowTransparency /></div>;
}

function AnalystDonut({ ratings }) {
  const segments = [["Strong Buy", +ratings?.strongBuy || 0, C.green], ["Buy", +ratings?.buy || 0, "#7fe1a8"], ["Hold", +ratings?.hold || 0, C.gold], ["Sell", +ratings?.sell || 0, "#ff9c9f"], ["Strong Sell", +ratings?.strongSell || 0, C.red]];
  const total = segments.reduce((s, x) => s + x[1], 0);
  if (!total) return <div className="rq-empty-small">No current analyst consensus is available.</div>;
  let start = 0; const gradient = segments.filter(x => x[1] > 0).map(([, count, color]) => { const from = start; start += count / total * 100; return `${color} ${from}% ${start}%`; }).join(",");
  return <div className="rq-analyst"><div className="rq-donut" style={{ background: `conic-gradient(${gradient})` }}><div><strong>{total}</strong><span>Analysts</span></div></div><div className="rq-legend">{segments.map(([label, count, color]) => <div key={label}><i style={{ background: color }} /><b>{label}</b><em>{count}</em></div>)}</div></div>;
}

function fallbackAssessment(profile, ratings) {
  const states = [metricState("revenue", profile?.revenueGrowthYoy), metricState("earnings", profile?.epsGrowthYoy), metricState("margin", profile?.netMargin), metricState("liquidity", profile?.currentRatio), metricState("debt", profile?.debtEquity), metricState("pe", profile?.pe), metricState("beta", profile?.beta)].filter(x => x.score);
  const score = states.length ? Math.round(states.reduce((s, x) => s + x.score, 0) / states.length) : null;
  const positives = [], concerns = [];
  if (+profile?.revenueGrowthYoy >= 8) positives.push("Revenue is growing at a healthy rate.");
  if (+profile?.epsGrowthYoy >= 5) positives.push("Earnings are improving.");
  if (+profile?.netMargin >= 10) positives.push("The company is producing a healthy net profit margin.");
  if (+profile?.currentRatio >= 1.2) positives.push("Short-term liquidity appears adequate.");
  if ((+ratings?.strongBuy || 0) + (+ratings?.buy || 0) > (+ratings?.sell || 0) + (+ratings?.strongSell || 0)) positives.push("Wall Street ratings currently lean positive.");
  if (+profile?.netMargin < 0) concerns.push("The company is not currently profitable.");
  if (+profile?.beta > 1.5) concerns.push("The stock has historically moved more sharply than the overall market.");
  if (+profile?.debtEquity > 1.5) concerns.push("Debt is elevated relative to shareholder equity.");
  if (+profile?.pe > 30) concerns.push("The valuation requires strong future execution.");
  if (+profile?.revenueGrowthYoy < 0) concerns.push("Revenue has recently declined.");
  return { score, grade: scoreGrade(score), risk: riskLevel(profile), positives: positives.length ? positives : ["The available data does not identify a decisive fundamental advantage."], concerns: concerns.length ? concerns : ["No major warning was detected from the limited metrics available."] };
}

function normalizeUnified(data) {
  if (!data?.security) return null;
  const c = data.company || {}, q = data.quote || {}, f = data.financialHealth || {}, g = data.growth || {}, v = data.valuation || {}, a = data.analysts || {};
  return {
    symbol: data.security.symbol,
    profile: { symbol: data.security.symbol, name: data.security.name, logo: c.logo, exchange: data.security.exchange, industry: c.industry, country: c.country, currency: c.currency, marketCap: c.marketCap, employees: c.employees, ceo: c.ceo, founded: c.founded, headquarter: c.headquarter, weburl: c.weburl, description: c.description, price: q.price ?? q.last, change: q.change, changePct: q.changePct, pe: v.pe, forwardPE: v.forwardPE, peg: v.peg, ps: v.ps, pb: v.pb, roe: f.roe, grossMargin: f.grossMargin, netMargin: f.netMargin, debtEquity: f.debtEquity, currentRatio: f.currentRatio, revenueGrowthYoy: g.revenueGrowthYoy, epsGrowthYoy: g.epsGrowthYoy, week52High: q.week52High, week52Low: q.week52Low, beta: q.beta ?? data.risk?.beta, dividendYield: data.dividends?.yield },
    financials: data.earnings || data.financials || {}, ratings: a, news: data.news || [], dataQuality: data.dataQuality,
    verdict: data.assessment ? { verdict: data.assessment.decisionCategory || data.assessment.verdict, score: data.assessment.score, grade: data.assessment.grade, riskLevel: data.assessment.riskLevel, summary: data.assessment.summary, advantages: data.assessment.positives, risks: data.assessment.concerns, finalThoughts: data.assessment.finalThoughts } : null,
  };
}

export default function ResearchPage() {
  const [loading, setLoading] = useState(false), [symbol, setSymbol] = useState(""), [profile, setProfile] = useState(null), [financials, setFinancials] = useState(null), [ratings, setRatings] = useState(null), [verdict, setVerdict] = useState(null), [news, setNews] = useState([]), [dataQuality, setDataQuality] = useState(null), [error, setError] = useState(""), [activeTab, setActiveTab] = useState("Summary");
  const fallback = useMemo(() => fallbackAssessment(profile, ratings), [profile, ratings]);
  const assessment = { score: finite(verdict?.score) ? (Number(verdict.score) <= 10 ? Number(verdict.score) * 10 : Number(verdict.score)) : fallback.score, grade: verdict?.grade || scoreGrade(verdict?.score) || fallback.grade, decision: verdict?.verdict || "RESEARCH FURTHER", risk: verdict?.riskLevel || fallback.risk, positives: verdict?.advantages?.length ? verdict.advantages : fallback.positives, concerns: verdict?.risks?.length ? verdict.risks : fallback.concerns };

  const resolve = async (query) => {
    const clean = String(query).trim();
    if (/^[A-Za-z][A-Za-z0-9.\-]{0,9}$/.test(clean) && !clean.includes(" ")) return clean.toUpperCase();
    const r = await fetch(`${API}/api/research/search?q=${encodeURIComponent(clean)}`); if (!r.ok) throw new Error("Company search is temporarily unavailable.");
    const data = await r.json(), first = (Array.isArray(data) ? data : data.results || [])[0]; if (!first?.symbol) throw new Error(`No publicly traded company matched “${clean}”.`); return first.symbol.toUpperCase();
  };

  const legacy = async (ticker) => {
    const settled = await Promise.allSettled([fetch(`${API}/api/research/profile/${ticker}`), fetch(`${API}/api/research/financials/${ticker}`), fetch(`${API}/api/research/ratings/${ticker}`), fetch(`${API}/api/news?ticker=${ticker}&limit=12`)]);
    const read = async (r, f = null) => r.status === "fulfilled" && r.value.ok ? r.value.json() : f;
    const p = await read(settled[0]), fin = await read(settled[1], {}), rat = await read(settled[2], {}), n = await read(settled[3], { rows: [] });
    if (!p || (!p.name && !finite(p.price))) throw new Error("No valid security data was returned. Select a ticker from search results or verify the symbol.");
    setProfile(p); setFinancials(fin); setRatings(rat); setNews(n?.rows || []);
    try { const vr = await fetch(`${API}/api/research/ai-verdict`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symbol: ticker, profile: p, metrics: p, ratings: rat }) }); if (vr.ok) setVerdict(await vr.json()); } catch { /* deterministic score remains */ }
  };

  const fetchResearch = useCallback(async (query) => {
    setLoading(true); setError(""); setProfile(null); setFinancials(null); setRatings(null); setVerdict(null); setNews([]); setDataQuality(null); setActiveTab("Summary");
    try {
      const ticker = await resolve(query); setSymbol(ticker);
      try { const r = await fetch(`${API}/api/research/${ticker}`); if (r.ok) { const unified = normalizeUnified(await r.json()); if (unified?.profile) { setProfile(unified.profile); setFinancials(unified.financials); setRatings(unified.ratings); setVerdict(unified.verdict); setNews(unified.news); setDataQuality(unified.dataQuality); return; } } } catch { /* fallback */ }
      await legacy(ticker);
    } catch (e) { setError(e?.message || "Research could not be loaded."); }
    finally { setLoading(false); }
  }, []);

  const states = { revenue: metricState("revenue", profile?.revenueGrowthYoy), earnings: metricState("earnings", profile?.epsGrowthYoy), margin: metricState("margin", profile?.netMargin), gross: metricState("gross", profile?.grossMargin), liquidity: metricState("liquidity", profile?.currentRatio), debt: metricState("debt", profile?.debtEquity), pe: metricState("pe", profile?.pe), beta: metricState("beta", profile?.beta) };
  const upside = +profile?.price > 0 && +ratings?.avgTarget > 0 ? ((+ratings.avgTarget - +profile.price) / +profile.price) * 100 : null;
  const tabs = [["Summary", Sparkles], ["Company", Building2], ["Financial Health", CircleDollarSign], ["Valuation", Landmark], ["Analysts", PieChart], ["News", Newspaper]];
  const quick = ["NVDA", "AAPL", "MSFT", "AMZN", "META", "RKLB", "SMCI", "TSLA"];

  return <div className="rq-page">
    <style>{`
      .rq-page{color:${C.text};padding:30px 32px 90px;max-width:1540px;margin:0 auto}.rq-page *{box-sizing:border-box}.rq-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:24px}.rq-head h1{color:${C.gold};font-size:30px;margin:0 0 7px;letter-spacing:-.02em}.rq-head p{color:${C.muted};margin:0;font-size:15px;line-height:1.6}.rq-chip{color:${C.green};background:${C.greenSoft};border:1px solid rgba(53,208,127,.25);border-radius:999px;padding:7px 11px;font-size:11px;font-weight:900;letter-spacing:.08em;white-space:nowrap}.rq-search-wrap{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;position:relative;margin-bottom:18px}.rq-search{min-height:58px;display:flex;align-items:center;gap:13px;background:${C.surface};border:1px solid ${C.borderStrong};border-radius:14px;padding:0 18px}.rq-search:focus-within{border-color:${C.goldBorder};box-shadow:0 0 0 3px rgba(212,175,55,.07)}.rq-search input{flex:1;border:0;outline:0;background:transparent;color:${C.text};font-size:15px;min-width:0}.rq-search input::placeholder{color:${C.dim}}.rq-search>button{background:transparent;color:${C.muted};border:0;padding:4px;display:grid;place-items:center;cursor:pointer}.rq-search-btn{min-width:142px;border:1px solid ${C.goldBorder};border-radius:14px;background:linear-gradient(180deg,rgba(212,175,55,.19),rgba(212,175,55,.10));color:${C.gold};padding:0 22px;font-weight:900;display:flex;justify-content:center;align-items:center;gap:9px;cursor:pointer}.rq-search-btn:disabled{opacity:.48;cursor:not-allowed}.rq-results{position:absolute;z-index:30;top:66px;left:0;right:154px;background:#0d1117;border:1px solid ${C.borderStrong};border-radius:13px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.55)}.rq-results button{width:100%;display:grid;grid-template-columns:74px minmax(0,1fr) auto;align-items:center;gap:12px;border:0;border-bottom:1px solid ${C.border};background:transparent;color:${C.text};padding:13px 16px;cursor:pointer;text-align:left}.rq-results button:hover{background:rgba(212,175,55,.075)}.rq-results b{color:${C.gold}}.rq-results span{color:${C.soft};overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rq-results small{color:${C.dim}}.rq-quick{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:26px}.rq-quick>span{color:${C.dim};font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.rq-quick button{color:${C.muted};background:rgba(255,255,255,.025);border:1px solid ${C.border};border-radius:999px;padding:7px 12px;font-size:12px;font-weight:800;cursor:pointer}.rq-card{background:linear-gradient(180deg,rgba(17,22,29,.96),rgba(12,16,21,.96));border:1px solid ${C.border};border-radius:17px;padding:24px;box-shadow:0 18px 45px rgba(0,0,0,.16)}.rq-eyebrow{color:${C.muted};font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.12em;display:flex;gap:8px;align-items:center;margin-bottom:15px}.rq-badge{border:1px solid;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:900;text-transform:uppercase;white-space:nowrap}.rq-hero{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(360px,.75fr);gap:18px;margin-bottom:18px}.rq-company{padding:28px}.rq-company-id{display:flex;gap:16px;align-items:center;margin-bottom:24px}.rq-logo{width:64px;height:64px;border-radius:14px;padding:7px;object-fit:contain;background:#fff}.rq-logo-fallback{width:64px;height:64px;border-radius:14px;display:grid;place-items:center;background:${C.goldSoft};border:1px solid ${C.goldBorder};color:${C.gold};font-weight:950}.rq-title{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}.rq-title h2{margin:0;font-size:36px;letter-spacing:-.035em}.rq-title span{color:${C.soft};font-size:18px}.rq-meta{color:${C.muted};display:flex;gap:8px;flex-wrap:wrap;margin-top:7px;font-size:13px}.rq-price{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:20px}.rq-price strong{font-size:47px;letter-spacing:-.04em}.rq-price span{font-size:18px;font-weight:900}.rq-stats{display:grid;grid-template-columns:repeat(6,minmax(110px,1fr));gap:9px}.rq-stat{background:rgba(255,255,255,.028);border:1px solid ${C.border};border-radius:10px;padding:11px 12px}.rq-stat span{display:block;color:${C.dim};font-size:10px;text-transform:uppercase;font-weight:900;margin-bottom:5px}.rq-stat strong{display:block;color:${C.soft};font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rq-assessment{display:flex;flex-direction:column;justify-content:space-between}.rq-assessment-main{display:flex;align-items:center;gap:20px;margin-bottom:18px}.rq-score{width:132px;height:132px;border-radius:50%;padding:10px;flex:0 0 auto}.rq-score>div{width:100%;height:100%;border-radius:50%;background:${C.surface};display:grid;place-content:center;text-align:center}.rq-score strong{font-size:30px;line-height:1}.rq-score span{color:${C.dim};font-size:10px;text-transform:uppercase;font-weight:900;margin-top:6px}.rq-decision small{display:block;color:${C.dim};text-transform:uppercase;font-size:10px;font-weight:900}.rq-decision strong{display:block;color:${C.gold};font-size:28px;margin:5px 0 9px}.rq-decision p{color:${C.muted};font-size:13px;line-height:1.55;margin:0}.rq-assessment-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.rq-assessment-grid div{border:1px solid ${C.border};border-radius:10px;padding:10px;background:rgba(255,255,255,.025)}.rq-assessment-grid span{display:block;color:${C.dim};font-size:9px;text-transform:uppercase;font-weight:900;margin-bottom:4px}.rq-tabs{display:flex;gap:4px;overflow-x:auto;border-bottom:1px solid ${C.border};margin-bottom:20px}.rq-tabs button{display:flex;gap:8px;align-items:center;flex:0 0 auto;border:0;border-bottom:3px solid transparent;background:transparent;color:${C.muted};padding:14px 18px;font-weight:850;cursor:pointer}.rq-tabs button.active{color:${C.gold};border-bottom-color:${C.gold}}.rq-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.rq-summary{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(330px,.72fr);gap:18px;margin-bottom:18px}.rq-copy{font-size:16px;line-height:1.75;color:${C.soft};margin:0}.rq-callout{margin-top:18px;display:flex;gap:11px;align-items:flex-start;padding:14px;border-radius:12px;background:${C.goldSoft};border:1px solid ${C.goldBorder};color:${C.soft};font-size:13px;line-height:1.55}.rq-bullets{display:flex;flex-direction:column;gap:13px}.rq-bullets>div{display:flex;gap:11px;align-items:flex-start;color:${C.soft};font-size:14px;line-height:1.55}.rq-bullets svg{flex:0 0 auto;margin-top:2px}.rq-health{padding:13px 0;border-bottom:1px solid ${C.border}}.rq-health>div{display:flex;justify-content:space-between;gap:15px;margin-bottom:9px}.rq-health span b,.rq-health span small{display:block}.rq-health span small{color:${C.dim};font-size:12px;margin-top:3px}.rq-health i{display:block;height:6px;background:rgba(255,255,255,.055);border-radius:999px;overflow:hidden}.rq-health em{display:block;height:100%;border-radius:inherit}.rq-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.rq-metric{border:1px solid ${C.border};border-radius:13px;padding:16px;background:rgba(255,255,255,.023)}.rq-metric-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.rq-metric-top>div>span{display:block;color:${C.muted};font-size:11px;font-weight:900;text-transform:uppercase;margin-bottom:7px}.rq-metric-top>div>strong{font-size:23px}.rq-metric>button{margin-top:14px;border:0;padding:0;background:transparent;color:${C.gold};display:flex;align-items:center;gap:7px;font-size:12px;font-weight:800;cursor:pointer}.rq-metric>p{margin-top:12px;border-left:3px solid;padding:10px 0 10px 12px;color:${C.muted};font-size:13px;line-height:1.6}.rq-tv{height:440px;overflow:hidden;border-radius:12px;background:#050608}.rq-tv iframe{width:100%;height:100%;border:0}.rq-analyst{display:flex;align-items:center;gap:28px;flex-wrap:wrap}.rq-donut{width:154px;height:154px;border-radius:50%;padding:17px}.rq-donut>div{width:100%;height:100%;background:${C.surface};border-radius:50%;display:grid;place-content:center;text-align:center}.rq-donut strong{font-size:29px}.rq-donut span{color:${C.dim};font-size:11px;text-transform:uppercase}.rq-legend{min-width:190px;flex:1}.rq-legend>div{display:grid;grid-template-columns:10px 1fr auto;gap:9px;align-items:center;padding:7px 0}.rq-legend i{width:9px;height:9px;border-radius:3px}.rq-legend em{color:${C.muted};font-style:normal}.rq-targets{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:18px}.rq-targets div{border:1px solid ${C.border};border-radius:10px;padding:12px;background:rgba(255,255,255,.025)}.rq-targets span{display:block;color:${C.dim};font-size:10px;text-transform:uppercase;font-weight:900;margin-bottom:5px}.rq-news{display:grid;gap:12px}.rq-news a{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;color:inherit;text-decoration:none;border:1px solid ${C.border};background:rgba(255,255,255,.022);border-radius:13px;padding:18px}.rq-news h3{margin:0 0 8px;font-size:16px}.rq-news p{margin:0;color:${C.muted};font-size:13px;line-height:1.55}.rq-news-meta{display:flex;gap:10px;margin-top:12px;color:${C.dim};font-size:11px;font-weight:800;text-transform:uppercase}.rq-empty,.rq-loading{text-align:center;padding:84px 20px;border:1px dashed ${C.borderStrong};border-radius:17px}.rq-empty h2{margin:16px 0 8px}.rq-empty p,.rq-empty-small,.rq-loading{color:${C.muted}}.rq-loading{display:grid;place-content:center;justify-items:center;gap:13px}.rq-error{color:#ffb0b4;background:${C.redSoft};border:1px solid rgba(255,98,107,.28);border-radius:13px;padding:16px 18px;margin-bottom:20px}.rq-disclaimer{margin-top:22px;padding:14px 16px;border:1px solid ${C.border};border-radius:12px;color:${C.dim};font-size:11px;line-height:1.6;text-align:center}.rq-spin{animation:rq-spin .85s linear infinite}@keyframes rq-spin{to{transform:rotate(360deg)}}@media(max-width:1180px){.rq-hero,.rq-summary{grid-template-columns:1fr}.rq-stats{grid-template-columns:repeat(3,1fr)}.rq-metrics{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.rq-page{padding:22px 16px 80px}.rq-chip{display:none}.rq-search-wrap{grid-template-columns:1fr}.rq-search-btn{min-height:52px}.rq-results{right:0;top:64px}.rq-title h2{font-size:29px}.rq-price strong{font-size:39px}.rq-stats{grid-template-columns:repeat(2,1fr)}.rq-grid2,.rq-metrics{grid-template-columns:1fr}.rq-targets{grid-template-columns:repeat(2,1fr)}.rq-card{padding:19px}}
    `}</style>

    <header className="rq-head"><div><h1>Stock Research</h1><p>Understand the business, financial health, valuation, risks, and investor fit before making a decision.</p></div><div className="rq-chip">DATA-DRIVEN · BEGINNER FRIENDLY</div></header>
    <SmartSearch loading={loading} onSearch={fetchResearch} />
    <div className="rq-quick"><span>Popular</span>{quick.map(t => <button key={t} onClick={() => fetchResearch(t)}>{t}</button>)}</div>
    {error ? <div className="rq-error">{error}</div> : null}
    {loading ? <div className="rq-loading"><Loader2 className="rq-spin" size={38} color={C.gold} /><strong>Building the research report</strong><span>Reviewing company data, financial strength, valuation, analyst opinion, and risk.</span></div> : null}
    {!loading && !profile && !error ? <div className="rq-empty"><LineChart size={54} color={C.gold} /><h2>Research any publicly traded company</h2><p>Search by company name or ticker. Every important metric includes a plain-language explanation.</p></div> : null}

    {!loading && profile ? <>
      <div className="rq-hero">
        <Card className="rq-company"><div className="rq-company-id">{profile.logo ? <img className="rq-logo" src={profile.logo} alt="" /> : <div className="rq-logo-fallback">{symbol.slice(0,2)}</div>}<div><div className="rq-title"><h2>{symbol}</h2><span>{profile.name || symbol}</span></div><div className="rq-meta">{[profile.industry, profile.exchange, profile.country].filter(Boolean).map((x,i) => <React.Fragment key={x}>{i ? <span>•</span> : null}<span>{x}</span></React.Fragment>)}</div></div></div><div className="rq-price"><strong>{money(profile.price)}</strong>{finite(profile.changePct) ? <span style={{ color:+profile.changePct >= 0 ? C.green : C.red }}>{+profile.changePct >= 0 ? "▲" : "▼"} {Math.abs(+profile.change || 0).toFixed(2)} ({Math.abs(+profile.changePct).toFixed(2)}%)</span> : <span style={{ color:C.dim }}>Live price unavailable</span>}</div><div className="rq-stats">{[["Market cap",mktCap(profile.marketCap)],["P/E ratio",fmt(profile.pe)],["52-week high",money(profile.week52High)],["52-week low",money(profile.week52Low)],["Volatility",states.beta.label],["Dividend",+profile.dividendYield > 0 ? pct(profile.dividendYield) : "None"]].map(([l,v]) => <div className="rq-stat" key={l}><span>{l}</span><strong title={v}>{v}</strong></div>)}</div></Card>
        <Card className="rq-assessment"><Eyebrow icon={Target}>TRQX Research Assessment</Eyebrow><div className="rq-assessment-main"><ScoreRing score={assessment.score} /><div className="rq-decision"><small>Decision category</small><strong>{assessment.decision}</strong><p>A research classification based on the available fundamentals—not a guarantee or personal recommendation.</p></div></div><div className="rq-assessment-grid"><div><span>Grade</span><strong>{assessment.grade}</strong></div><div><span>Risk</span><strong>{assessment.risk}</strong></div><div><span>Style</span><strong>{+profile.netMargin < 0 ? "Speculative growth" : "Growth / quality"}</strong></div></div></Card>
      </div>

      <nav className="rq-tabs">{tabs.map(([tab,Icon]) => <button key={tab} className={activeTab===tab?"active":""} onClick={() => setActiveTab(tab)}><Icon size={16}/>{tab}</button>)}</nav>

      {activeTab === "Summary" ? <>
        <div className="rq-summary"><Card><Eyebrow icon={Sparkles}>Executive summary</Eyebrow><p className="rq-copy">{verdict?.summary || profile.description || `${profile.name || symbol} is a publicly traded company. Review its growth, profitability, valuation, balance sheet, and risk before deciding whether it fits your goals.`}</p><div className="rq-callout"><GraduationCap size={19} color={C.gold}/><span><b style={{color:C.gold}}>Beginner takeaway:</b> A strong company can still be a poor investment when the price is too high, the risk is unsuitable, or the investor may need the money soon.</span></div></Card><Card><Eyebrow icon={ShieldAlert}>Investor fit</Eyebrow><div className="rq-bullets"><div><CheckCircle2 size={18} color={C.green}/><span>Best suited to investors who understand the company and can tolerate a {assessment.risk.toLowerCase()} level of risk.</span></div><div><CalendarDays size={18} color={C.gold}/><span>A multi-year time horizon is generally safer than relying on short-term price predictions.</span></div><div><AlertTriangle size={18} color={C.amber}/><span>A single stock should not represent money needed for emergencies or near-term bills.</span></div></div></Card></div>
        <div className="rq-grid2" style={{marginBottom:18}}><Card><Eyebrow icon={TrendingUp}>Why investors may consider it</Eyebrow><BulletList items={assessment.positives}/></Card><Card><Eyebrow icon={AlertTriangle}>Why investors may avoid it</Eyebrow><BulletList items={assessment.concerns} positive={false}/></Card></div>
        <div className="rq-grid2" style={{marginBottom:18}}><Card><Eyebrow icon={CircleDollarSign}>Financial health snapshot</Eyebrow><HealthBar label="Revenue growth" state={states.revenue}/><HealthBar label="Profitability" state={states.margin}/><HealthBar label="Liquidity" state={states.liquidity}/><HealthBar label="Debt position" state={states.debt}/></Card><Card><Eyebrow icon={Landmark}>Valuation and volatility</Eyebrow><HealthBar label="Valuation" state={states.pe}/><HealthBar label="Price stability" state={states.beta}/><HealthBar label="Earnings trend" state={states.earnings}/><p style={{color:C.muted,fontSize:12,lineHeight:1.6}}>These bars are interpretation aids. They do not predict the stock price.</p></Card></div>
        <Card><Eyebrow icon={LineChart}>Price performance</Eyebrow><TVChart symbol={symbol}/></Card>
      </> : null}

      {activeTab === "Company" ? <div className="rq-grid2"><Card><Eyebrow icon={Building2}>What the company does</Eyebrow><p className="rq-copy">{profile.description || "A verified company description is not currently available."}</p>{profile.weburl ? <a href={profile.weburl} target="_blank" rel="noreferrer" style={{color:C.gold,display:"inline-block",marginTop:18,fontWeight:800}}>Visit company website →</a> : null}</Card><Card><Eyebrow icon={Building2}>Company facts</Eyebrow><BulletList items={[["Chief executive",profile.ceo],["Employees",+profile.employees>0?Number(profile.employees).toLocaleString("en-US"):null],["Founded / IPO date",profile.founded],["Headquarters",profile.headquarter],["Industry",profile.industry],["Exchange",profile.exchange]].map(([l,v]) => `${l}: ${v || "Not reported"}`)}/></Card><Card style={{gridColumn:"1 / -1"}}><Eyebrow icon={GraduationCap}>How to evaluate the business</Eyebrow><div className="rq-metrics"><Metric label="Revenue growth" value={pct(profile.revenueGrowthYoy)} state={states.revenue} explanation="Revenue growth measures whether the company is selling more than it did during the comparable prior period. Growth is useful only when the company can eventually convert those sales into sustainable profit and cash flow."/><Metric label="Gross margin" value={pct(profile.grossMargin)} state={states.gross} explanation="Gross margin shows how much sales revenue remains after direct product or service costs. Higher margins can provide more room to fund operations and profit."/><Metric label="Net margin" value={pct(profile.netMargin)} state={states.margin} explanation="Net margin is the percentage of revenue left as profit after major expenses. A negative value means the company spent more than it earned during the measured period."/></div></Card></div> : null}

      {activeTab === "Financial Health" ? <Card><Eyebrow icon={CircleDollarSign}>Financial health explained</Eyebrow><div className="rq-metrics"><Metric label="Revenue growth" value={pct(profile.revenueGrowthYoy)} state={states.revenue} explanation="This compares recent revenue with the prior-year period. Positive growth indicates expansion, but rapid growth can still be unprofitable."/><Metric label="Earnings growth" value={pct(profile.epsGrowthYoy)} state={states.earnings} explanation="Earnings-per-share growth shows whether profit attributable to each share is improving. Share issuance and one-time items can affect it."/><Metric label="Net profit margin" value={pct(profile.netMargin)} state={states.margin} explanation="For every $100 of revenue, this estimates how many dollars remain as profit. A 12% margin represents about $12 of profit per $100 of revenue."/><Metric label="Gross margin" value={pct(profile.grossMargin)} state={states.gross} explanation="Gross margin focuses on product economics before operating costs. Compare it with similar companies because normal margins differ by industry."/><Metric label="Current ratio" value={fmt(profile.currentRatio)} state={states.liquidity} explanation="The current ratio compares assets expected to become cash within one year with bills due within one year. Above 1 generally means current assets exceed current liabilities."/><Metric label="Debt to equity" value={fmt(profile.debtEquity)} state={states.debt} explanation="Debt-to-equity compares borrowed money with shareholder capital. Higher debt can magnify returns and financial stress."/><Metric label="Return on equity" value={pct(profile.roe)} state={{label:+profile.roe>=15?"Efficient":"Review carefully",tone:+profile.roe>=15?"positive":"warning"}} explanation="Return on equity estimates how effectively the company produces profit from shareholder capital. Very high values can also be influenced by heavy debt."/><Metric label="Dividend yield" value={+profile.dividendYield>0?pct(profile.dividendYield):"No dividend"} state={{label:+profile.dividendYield>0?"Income component":"Reinvesting capital",tone:"neutral"}} explanation={+profile.dividendYield>0?"Dividend yield estimates annual cash distributions as a percentage of the current stock price. A high yield is not automatically safe.":"The company does not currently report a dividend yield. Growth companies often retain cash to fund expansion instead of distributing it."}/></div></Card> : null}

      {activeTab === "Valuation" ? <div className="rq-grid2"><Card><Eyebrow icon={Landmark}>Is the stock expensive?</Eyebrow><Metric label="Price-to-earnings ratio" value={fmt(profile.pe)} state={states.pe} explanation="The P/E ratio compares the share price with annual earnings per share. A P/E of 20 means investors are paying about $20 for each $1 of current annual earnings. Compare it with growth, risk, the industry, and the company’s history."/><div style={{height:12}}/><Metric label="Forward P/E" value={fmt(profile.forwardPE)} state={{label:"Estimate based",tone:"neutral"}} explanation="Forward P/E uses analyst estimates of future earnings. It becomes unreliable when actual future earnings differ from expectations."/></Card><Card><Eyebrow icon={ShieldAlert}>Valuation context</Eyebrow><BulletList positive={false} items={["A low valuation can indicate opportunity, but it can also reflect weak growth or serious business risk.","A high valuation can be justified by exceptional growth, but disappointment can produce sharp declines.","Compare valuation with direct competitors and the company’s historical range.","Do not treat an analyst price target as guaranteed fair value."]}/></Card><Card style={{gridColumn:"1 / -1"}}><Eyebrow icon={LineChart}>Additional valuation measures</Eyebrow><div className="rq-metrics"><Metric label="Price to sales" value={fmt(profile.ps)} state={{label:"Sales valuation",tone:"neutral"}} explanation="Price-to-sales compares market value with revenue. It is often used when earnings are negative, but it does not account for expenses."/><Metric label="Price to book" value={fmt(profile.pb)} state={{label:"Asset valuation",tone:"neutral"}} explanation="Price-to-book compares market value with accounting equity. It is generally more useful for banks and asset-heavy businesses."/><Metric label="PEG ratio" value={fmt(profile.peg)} state={{label:"Growth adjusted",tone:"neutral"}} explanation="PEG attempts to compare the P/E ratio with expected earnings growth. Its usefulness depends heavily on the quality of that estimate."/></div></Card></div> : null}

      {activeTab === "Analysts" ? <div className="rq-grid2"><Card><Eyebrow icon={PieChart}>Wall Street consensus</Eyebrow><AnalystDonut ratings={ratings}/><div className="rq-targets">{[["Average target",money(ratings?.avgTarget)],["High target",money(ratings?.highTarget)],["Low target",money(ratings?.lowTarget)],["Implied change",Number.isFinite(upside)?`${upside>=0?"+":""}${upside.toFixed(1)}%`:"Unavailable"]].map(([l,v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}</div></Card><Card><Eyebrow icon={GraduationCap}>How to use analyst ratings</Eyebrow><BulletList positive={false} items={["Ratings represent opinions and models, not guaranteed outcomes.","Targets can change immediately after earnings, guidance, acquisitions, or major news.","Review how many analysts contribute; one estimate is less informative than a broad consensus.","Use analyst views alongside financial statements, valuation, and risk."]}/></Card></div> : null}

      {activeTab === "News" ? <Card><Eyebrow icon={Newspaper}>Recent company news</Eyebrow>{news.length ? <div className="rq-news">{news.map((n,i) => { const sentiment=String(n.sentiment||"neutral").toLowerCase(), tone=sentiment==="positive"?"positive":sentiment==="negative"?"negative":"neutral"; return <a href={n.url} target="_blank" rel="noreferrer" key={`${n.url||n.title}-${i}`}><div><h3>{n.title}</h3>{n.description?<p>{n.description}</p>:null}<div className="rq-news-meta"><span>{n.source||"Market news"}</span><span>{n.published?new Date(n.published).toLocaleDateString("en-US"):""}</span></div></div><Badge tone={tone}>{sentiment}</Badge></a>; })}</div> : <div className="rq-empty-small">No recent ticker-specific news is currently available.</div>}</Card> : null}

      <div className="rq-disclaimer">TRQX Stock Research is educational and informational. Scores, classifications, AI summaries, analyst estimates, and market data can be incomplete or incorrect and are not personalized financial advice. Verify material facts through company filings and consider your objectives, time horizon, diversification, and ability to lose money before investing.{dataQuality?.asOf ? ` Data updated ${new Date(dataQuality.asOf).toLocaleString("en-US")}.` : ""}</div>
    </> : null}

    <PageChatWidget context={`The user is on the TRQX Stock Research page${symbol ? ` researching ${symbol}` : ""}. Explain financial metrics in beginner-friendly language, distinguish facts from estimates, discuss both upside and risk, and do not present guaranteed outcomes.`} placeholder="Ask what a metric means, why this stock is risky, or what to research next." />
  </div>;
}