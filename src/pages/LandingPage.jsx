import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, ArrowRight, BarChart3, BookOpen, Bot, CalendarDays, Check,
  Clock3, Crosshair, Gauge, GraduationCap, Layers3, MessageCircle,
  MonitorPlay, Radar, ShieldCheck, Sparkles, Target, TrendingUp, Users,
  Video, Zap
} from "lucide-react";
import "./LandingPage.css";

const MARKET_API_URL = import.meta.env.VITE_MARKET_API_URL || "";
const DISCORD_CHECKOUT = import.meta.env.VITE_WHOP_DISCORD_ACCESS_URL || import.meta.env.VITE_WHOP_DISCORD_URL || "https://whop.com/tqpx-tru-quant-enterprise/";
const STARTER_CHECKOUT = import.meta.env.VITE_WHOP_STARTER_URL || "https://whop.com/tqpx-tru-quant-enterprise/trqx-capital-terminal-starter";
const PRO_CHECKOUT = import.meta.env.VITE_WHOP_PRO_URL || "https://whop.com/tqpx-tru-quant-enterprise/trqx-terminal-pro";
const ELITE_CHECKOUT = import.meta.env.VITE_WHOP_ELITE_URL || "https://whop.com/tqpx-tru-quant-enterprise/trqx-elite";

const fallbackQuotes = [
  { symbol: "SPY", price: 638.47, change: 0.42, series: [631,632,631.5,633,634.2,633.7,635.4,636,635.6,637.2,638.47] },
  { symbol: "QQQ", price: 571.24, change: 0.67, series: [563,564.5,564,565.7,566.9,566.1,568.2,569.4,568.8,570.3,571.24] },
  { symbol: "IWM", price: 224.18, change: -0.31, series: [226.1,225.7,225.9,225.1,224.7,225,224.4,224.8,224.3,224.6,224.18] },
  { symbol: "VIX", price: 15.72, change: -2.08, series: [16.5,16.3,16.4,16.1,16,16.2,15.9,15.8,15.95,15.7,15.72] },
  { symbol: "/ES", price: 6421.25, change: 0.39, series: [6386,6392,6388,6401,6405,6400,6410,6414,6409,6418,6421.25] },
  { symbol: "/NQ", price: 23384.5, change: 0.61, series: [23105,23144,23130,23192,23218,23196,23250,23288,23262,23335,23384.5] },
  { symbol: "/YM", price: 45082, change: 0.21, series: [44910,44935,44920,44980,45002,44988,45020,45038,45011,45064,45082] },
  { symbol: "/RTY", price: 2258.6, change: -0.18, series: [2266,2263,2264,2260,2258,2261,2257,2259,2256,2259,2258.6] },
  { symbol: "DXY", price: 97.46, change: -0.14, series: [97.8,97.7,97.72,97.63,97.58,97.61,97.53,97.5,97.55,97.48,97.46] },
  { symbol: "NVDA", price: 176.75, change: 1.28, series: [171.8,172.5,172.1,173.4,174.1,173.7,174.8,175.2,174.9,176.1,176.75] },
  { symbol: "TSLA", price: 316.06, change: -1.12, series: [322,320.7,321.2,319.5,318.7,319.1,317.8,318.4,317.1,316.7,316.06] },
  { symbol: "AMD", price: 168.92, change: 2.03, series: [163.2,164,163.7,165.1,165.8,165.3,166.4,167.1,166.8,168,168.92] },
  { symbol: "AAPL", price: 213.88, change: 0.55, series: [211.4,211.8,211.5,212.2,212.7,212.4,213,213.3,213.1,213.6,213.88] },
  { symbol: "META", price: 704.31, change: 1.07, series: [694,696,695,699,700,698,702,703,701,704,704.31] },
];

const fallbackFlow = [
  { ticker: "NVDA", contract: "180C · 08/01", premium: "$2.48M", bias: "BULLISH", time: "10:21" },
  { ticker: "SPY", contract: "640C · 07/28", premium: "$1.96M", bias: "BULLISH", time: "10:18" },
  { ticker: "TSLA", contract: "310P · 08/01", premium: "$1.41M", bias: "BEARISH", time: "10:13" },
  { ticker: "AMD", contract: "170C · 08/08", premium: "$987K", bias: "BULLISH", time: "10:08" },
];

const plans = [
  { name: "Discord Access", label: "Discord Only", price: "$45.99", url: DISCORD_CHECKOUT, features: ["Full Discord access", "Daily market preparation", "Live trade discussions", "Education and chart reviews", "Cancel anytime"] },
  { name: "Terminal Starter", label: "Core Intelligence", price: "$49", url: STARTER_CHECKOUT, features: ["TRQX Academy", "Flash cards and drills", "AI stock research", "Dividend intelligence", "News and calendar"] },
  { name: "Terminal Pro", label: "Advanced Intelligence", price: "$79", url: PRO_CHECKOUT, popular: true, features: ["Everything in Starter", "Options flow scanner", "GEMX gamma dashboard", "Trade plan builder", "AI market intelligence"] },
  { name: "Terminal Elite", label: "Complete Terminal", price: "$149", url: ELITE_CHECKOUT, features: ["Everything in Pro", "Capital Allocator", "Smart money tracker", "Flow replay", "Priority support"] },
  { name: "TRQX Mentorship", label: "Direct Education", price: "$189", path: "/mentorship", mentorship: true, features: ["Two live 1-hour reviews weekly", "Entries, exits and trade management", "5m through weekly analysis", "TradingView, indicators and EMAs", "Open Q&A and accountability"] },
];

function normalizePayload(payload) {
  const quotes = Array.isArray(payload?.quotes) ? payload.quotes : Array.isArray(payload) ? payload : [];
  if (!quotes.length) throw new Error("Market API returned no quotes");
  return {
    quotes: quotes.map((q) => ({
      symbol: String(q.symbol || q.ticker || "").toUpperCase(),
      price: Number(q.price ?? q.last ?? q.close),
      change: Number(q.changePercent ?? q.change ?? q.percentChange ?? 0),
      series: Array.isArray(q.series || q.history) ? (q.series || q.history).map(Number).filter(Number.isFinite) : [],
    })).filter((q) => q.symbol && Number.isFinite(q.price)),
    flow: Array.isArray(payload?.flow) ? payload.flow : fallbackFlow,
    breadth: payload?.breadth,
    gamma: payload?.gamma,
  };
}

function useMarketIntelligence() {
  const [state, setState] = useState({ quotes: fallbackQuotes, flow: fallbackFlow, source: "DEMO DATA", updatedAt: new Date(), loading: Boolean(MARKET_API_URL) });

  useEffect(() => {
    if (!MARKET_API_URL) return;
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(MARKET_API_URL, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`Market API failed: ${response.status}`);
        const normalized = normalizePayload(await response.json());
        if (!cancelled) setState({ ...normalized, source: "LIVE", updatedAt: new Date(), loading: false });
      } catch (error) {
        console.warn("TRQX landing market feed fallback:", error);
        if (!cancelled) setState({ quotes: fallbackQuotes, flow: fallbackFlow, source: "DEMO DATA", updatedAt: new Date(), loading: false });
      }
    };
    load();
    const interval = window.setInterval(load, 60000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, []);

  return state;
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: value >= 1000 ? 2 : 2, maximumFractionDigits: 2 }).format(value);
}

function Sparkline({ values = [], positive = true, compact = false }) {
  const safe = values.length > 1 ? values : [0, 1];
  const min = Math.min(...safe); const max = Math.max(...safe); const span = max - min || 1;
  const points = safe.map((v, i) => `${(i / (safe.length - 1)) * 100},${42 - ((v - min) / span) * 36}`).join(" ");
  const area = `0,44 ${points} 100,44`;
  return <svg className={`lp-real-spark ${compact ? "compact" : ""}`} viewBox="0 0 100 46" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id={`spark-${positive}-${compact}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".28"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs>
    <polygon points={area} fill={`url(#spark-${positive}-${compact})`} />
    <polyline points={points} fill="none" vectorEffect="non-scaling-stroke" />
  </svg>;
}

function CandleChart({ positive = true }) {
  const candles = positive
    ? [[128,132,126,130],[130,134,129,133],[133,135,130,131],[131,138,130,136],[136,140,134,139],[139,143,137,141],[141,147,140,146],[146,149,143,145],[145,152,144,151],[151,156,149,154]]
    : [[154,156,150,152],[152,154,148,149],[149,151,145,147],[147,150,143,145],[145,147,140,142],[142,145,138,140],[140,143,136,138],[138,141,134,136],[136,139,132,134],[134,136,129,131]];
  const high = Math.max(...candles.map(c => c[1])); const low = Math.min(...candles.map(c => c[2]));
  const y = (v) => 92 - ((v - low) / (high - low || 1)) * 78;
  return <svg className="lp-candle-chart" viewBox="0 0 240 100" preserveAspectRatio="none" aria-label="Illustrative candlestick chart">
    {[20,40,60,80].map(n => <line key={n} x1="0" y1={n} x2="240" y2={n} className="grid"/>)}
    {candles.map((c, i) => { const [o,h,l,cl] = c; const up = cl >= o; const x = 12 + i * 23; return <g key={i} className={up ? "candle-up" : "candle-down"}><line x1={x} y1={y(h)} x2={x} y2={y(l)}/><rect x={x-5} y={Math.min(y(o),y(cl))} width="10" height={Math.max(2,Math.abs(y(o)-y(cl)))} rx="1"/></g>; })}
  </svg>;
}

function MarketCard({ quote }) {
  const positive = quote.change >= 0;
  return <article className="lp-market-card">
    <div className="lp-market-symbol"><span>{quote.symbol}</span><i className={positive ? "up" : "down"}>{positive ? "▲" : "▼"} {Math.abs(quote.change).toFixed(2)}%</i></div>
    <b>{quote.symbol.startsWith("/") || quote.symbol === "VIX" || quote.symbol === "DXY" ? "" : "$"}{formatPrice(quote.price)}</b>
    <Sparkline values={quote.series} positive={positive}/>
  </article>;
}

function TerminalPreview({ market }) {
  const cards = ["SPY", "QQQ", "IWM", "VIX"].map(symbol => market.quotes.find(q => q.symbol === symbol)).filter(Boolean);
  return <div className="lp-terminal-shell">
    <div className="lp-terminal-top"><div><span className="lp-terminal-mark">TQ</span><b>TRQX INTELLIGENCE TERMINAL</b></div><div className="lp-window-dots"><i/><i/><i/></div></div>
    <div className="lp-terminal-body">
      <aside className="lp-mini-sidebar">{[Activity, Radar, Gauge, CalendarDays, Bot].map((Icon, i)=><Icon key={i} size={19}/>)}</aside>
      <div className="lp-terminal-main">
        <div className="lp-preview-title"><span>Cross-Asset Market Overview</span><em className={market.source === "LIVE" ? "live" : "demo"}>{market.source}</em></div>
        <div className="lp-market-grid">{cards.map(q => <MarketCard key={q.symbol} quote={q}/>)}</div>
        <div className="lp-terminal-lower">
          <div className="lp-flow-panel"><div className="lp-panel-head"><span>Institutional Flow</span><small>PREMIUM · CONTRACT · TIME</small></div>{market.flow.slice(0,4).map((r,i)=><div className="lp-flow-row" key={`${r.ticker}-${i}`}><b>{r.ticker}</b><span><strong className={String(r.bias).includes("BEAR") ? "down" : "up"}>{r.bias}</strong><small>{r.contract}</small></span><em>{r.premium}<small>{r.time}</small></em></div>)}</div>
          <div className="lp-positioning-panel"><div className="lp-panel-head"><span>Dealer Positioning</span><small>SPY · INTRADAY</small></div><div className="lp-positioning-meta"><b>LONG GAMMA</b><span>Volatility suppression above flip</span></div><CandleChart positive/><div className="lp-level-strip"><span>PUT WALL <b>630</b></span><span>GAMMA FLIP <b>635</b></span><span>CALL WALL <b>645</b></span></div></div>
        </div>
        <div className="lp-terminal-bottom"><div><small>NEXT CATALYST</small><b>GDP · 8:30 AM ET</b></div><div><small>MARKET BREADTH</small><b className="up">68% ADVANCING</b></div><div><small>AI MARKET READ</small><b>Risk-on · selective momentum</b></div></div>
      </div>
    </div>
  </div>;
}

function WorkflowCard({ number, icon: Icon, title, time, children, footer }) {
  return <article className="lp-workflow-card"><div className="lp-workflow-heading"><span>{number}</span><Icon size={22}/><div><h3>{title}</h3><p>{time}</p></div></div><div className="lp-workflow-content">{children}</div><small>{footer}</small></article>;
}

const academyTracks = [
  { tag: "FOUNDATIONS", title: "Market Structure", text: "Candles, support, resistance, trend and price-action context.", progress: 92 },
  { tag: "EXECUTION", title: "Entries & Exits", text: "Confirmation, invalidation, stops, targets and trade management.", progress: 76 },
  { tag: "TOOLS", title: "TradingView & Indicators", text: "Build clean layouts and use EMAs, VWAP and indicators with purpose.", progress: 68 },
  { tag: "PSYCHOLOGY", title: "Discipline & Risk", text: "Position sizing, patience, accountability and repeatable process.", progress: 55 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const market = useMarketIntelligence();
  const go = (path) => navigate(path);
  const checkout = (url) => window.open(url, "_blank", "noopener,noreferrer");
  const openPlan = (plan) => plan.path ? go(plan.path) : checkout(plan.url);
  const updated = useMemo(() => market.updatedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", timeZone: "America/New_York" }), [market.updatedAt]);

  return <div className="trqx-landing">
    <header className="lp-nav"><button className="lp-brand" onClick={()=>go("/home")}><strong>TRQ<span>X</span></strong><small>TERMINAL</small></button><nav><a href="#terminal">Terminal</a><a href="#workflow">Workflow</a><a href="#academy">Academy</a><a href="#pricing">Pricing</a><a href="#about">About</a></nav><div className="lp-nav-actions"><button className="lp-login" onClick={()=>go("/auth")}>Login</button><button className="lp-gold-btn" onClick={()=>go("/auth")}>Start Free Trial</button></div></header>

    <main>
      <section className="lp-hero" id="terminal"><div className="lp-grid-bg"/><div className="lp-hero-copy"><div className="lp-live-pill"><i className={market.source === "LIVE" ? "" : "demo"}/><span>MARKET INTELLIGENCE</span><b>{market.loading ? "CONNECTING" : market.source}</b><small>Updated {updated} ET</small></div><h1>THE TRADING<br/><span>OPERATING SYSTEM</span></h1><h2>Read the market. Build the plan.<br/>Execute with precision.</h2><p>TRQX combines options flow, gamma intelligence, market preparation, education, and disciplined execution tools in one professional environment.</p><div className="lp-hero-actions"><button className="lp-primary" onClick={()=>go("/auth")}>ENTER THE TERMINAL <ArrowRight size={19}/></button><button className="lp-secondary" onClick={()=>go("/mentorship")}>EXPLORE MENTORSHIP <small>$189 / MONTH</small></button></div><div className="lp-trust-row"><div><Zap/><span><b>MARKET INTELLIGENCE</b>One consolidated view</span></div><div><BarChart3/><span><b>PROFESSIONAL WORKFLOW</b>Built for serious traders</span></div><div><ShieldCheck/><span><b>SECURE & PRIVATE</b>Your data is protected</span></div><div><Target/><span><b>PROCESS FIRST</b>Precision over prediction</span></div></div></div><TerminalPreview market={market}/></section>

      <div className="lp-tape"><div className="lp-tape-status"><span>TRADING INTELLIGENCE</span><b className={market.source === "LIVE" ? "live" : "demo"}>{market.source}</b></div><div className="lp-tape-track">{[...market.quotes, ...market.quotes].map((q,i)=><strong key={`${q.symbol}-${i}`}><span>{q.symbol}</span>{q.symbol.startsWith("/") || q.symbol === "VIX" || q.symbol === "DXY" ? "" : "$"}{formatPrice(q.price)} <em className={q.change >= 0 ? "up" : "down"}>{q.change >= 0 ? "+" : ""}{q.change.toFixed(2)}%</em></strong>)}</div></div>

      <section className="lp-section" id="workflow"><div className="lp-section-head"><span>A COMPLETE WORKFLOW</span><h2>FROM MARKET NOISE TO A DEFINED PLAN</h2><p>Detect opportunity, validate the setup, execute risk, and review every decision.</p></div><div className="lp-workflow-grid">
        <WorkflowCard number="01" icon={Radar} title="Detect" time="Premarket intelligence" footer="Know where attention and liquidity are moving."><ul><li><CalendarDays/>Economic catalysts and earnings</li><li><Bot/>AI market regime brief</li><li><Radar/>Relative volume and top movers</li><li><Gauge/>Gamma walls and dealer position</li></ul><div className="lp-workflow-chart"><CandleChart positive/><div><span>Resistance <b>$645.00</b></span><span>Gamma flip <b>$635.00</b></span><span>Support <b>$630.00</b></span></div></div></WorkflowCard>
        <WorkflowCard number="02" icon={Crosshair} title="Validate & Execute" time="Live market workflow" footer="Define the trade before placing the trade."><div className="lp-execution-card"><div><small>NVDA · BULLISH CONTINUATION</small><b>Entry $176.40</b><span>Invalidation $174.90</span></div><CandleChart positive/><div className="lp-risk-grid"><span>RISK <b>$150</b></span><span>TP1 <b>1.5R</b></span><span>TP2 <b>3.0R</b></span></div></div></WorkflowCard>
        <WorkflowCard number="03" icon={BookOpen} title="Review & Improve" time="After-market process" footer="Turn each decision into usable feedback."><ul><li><Activity/>Trade replay and annotations</li><li><BookOpen/>Journal, thesis, and mistakes</li><li><TrendingUp/>Win rate and R-multiple analytics</li><li><Sparkles/>AI-assisted lessons learned</li></ul><div className="lp-performance"><span>Execution Score <b>86</b></span><span>Win Rate <b>71%</b></span><span>Total R <b className="up">+9.25R</b></span><span>Plan Adherence <b>92%</b></span></div></WorkflowCard>
      </div></section>

      <section className="lp-value"><div><span>ONE OPERATING SYSTEM</span><h2>Stop stitching together five disconnected tools.</h2><p>TRQX organizes preparation, options intelligence, market structure, execution planning, education, and review into one repeatable process.</p></div><div className="lp-value-grid">{[[Radar,"SCAN","Find momentum, flow, and catalysts."],[Gauge,"POSITION","Read gamma walls and dealer pressure."],[Crosshair,"PLAN","Define entry, invalidation, targets, and size."],[BookOpen,"REVIEW","Track execution quality and improve."]].map(([Icon,t,p])=><article key={t}><Icon/><b>{t}</b><p>{p}</p></article>)}</div><button className="lp-primary" onClick={()=>go("/auth")}>SEE THE TERMINAL <ArrowRight size={18}/></button></section>

      <section className="lp-section lp-academy" id="academy"><div className="lp-section-head"><span>LEARN THE PROCESS</span><h2>TRQX ACADEMY</h2><p>A structured learning path—not a random library of disconnected videos.</p></div><div className="lp-academy-stage"><div className="lp-academy-copy"><div className="lp-academy-badge"><GraduationCap/> BEGINNER TO ADVANCED</div><h3>Build the trader before chasing the trade.</h3><p>Study chart structure, execution, TradingView, indicators, risk management, and psychology through lessons, flash cards, drills, quizzes, and chart review.</p><button className="lp-primary" onClick={()=>go("/auth")}>ENTER THE ACADEMY <ArrowRight size={17}/></button></div><div className="lp-course-grid">{academyTracks.map((track,i)=><article key={track.title}><div className="lp-course-number">0{i+1}</div><small>{track.tag}</small><h3>{track.title}</h3><p>{track.text}</p><div className="lp-course-progress"><i style={{width:`${track.progress}%`}}/></div><span>{track.progress}% curriculum preview</span></article>)}</div></div></section>

      <section className="lp-mentorship" id="mentorship"><div className="lp-mentor-copy"><span>DIRECT EDUCATION</span><h2>TRQX MENTORSHIP</h2><h3>Learn to read the chart—not depend on someone else's call.</h3><p>Work directly with Michael through two live one-hour chart-review sessions each week. Bring your charts, previous trades, setups, and questions.</p><div className="lp-mentor-points"><span><Video/>2 live reviews every week</span><span><Crosshair/>Entries, exits, stops, invalidation</span><span><Layers3/>5-minute through weekly charts</span><span><MonitorPlay/>TradingView workflow</span><span><TrendingUp/>Indicators and trend structure</span><span><MessageCircle/>Open Q&A and accountability</span></div></div><article className="lp-mentor-offer"><small>FOUNDING MENTORSHIP RATE</small><div className="lp-price">$189<span>/month</span></div><p>Approximately eight live educational sessions per month.</p><ul><li><Check/>Two 1-hour sessions weekly</li><li><Check/>Member-submitted chart reviews</li><li><Check/>Multi-timeframe education</li><li><Check/>Questions submitted before sessions</li><li><Check/>Cancel anytime</li></ul><button className="lp-primary" onClick={()=>go("/mentorship")}>VIEW MENTORSHIP <ArrowRight size={17}/></button><span>Educational only. No trade signals or guarantees.</span></article></section>

      <section className="lp-about" id="about"><div className="lp-about-statement"><span>WHY TRQX EXISTS</span><h2>MOST TRADERS DO NOT NEED ANOTHER INDICATOR.</h2><p>They need structure, preparation, risk management, accountability, and a repeatable process. TRQX brings those pieces into one operating system built around disciplined decision-making.</p><div className="lp-process-line"><span>PREPARE</span><i/><span>ANALYZE</span><i/><span>EXECUTE</span><i/><span>REVIEW</span><i/><span>IMPROVE</span></div></div><article className="lp-founder-card"><div className="lp-founder-monogram">MV</div><small>MEET THE FOUNDER</small><h3>Michael A. Valerio</h3><p>Technologist, trader, educator, and builder of the TRQX ecosystem.</p><blockquote>“I AM THE ALGO means the trader develops the discipline to become the system.”</blockquote><button onClick={()=>go("/mentorship")}>LEARN WITH MICHAEL <ArrowRight size={15}/></button></article></section>

      <section className="lp-section lp-pricing" id="pricing"><div className="lp-section-head"><span>CHOOSE YOUR EDGE</span><h2>START WITH THE LEVEL THAT FITS YOUR PROCESS.</h2><p>Software, community, and direct education each have a distinct purpose.</p></div><div className="lp-pricing-grid">{plans.map(plan=><article key={plan.name} className={`${plan.popular?"popular":""} ${plan.mentorship?"mentorship-plan":""}`}>{plan.popular&&<em>MOST POPULAR</em>}{plan.mentorship&&<em>DIRECT ACCESS</em>}<small>{plan.label}</small><h3>{plan.name}</h3><div className="lp-price">{plan.price}<span>/mo</span></div><ul>{plan.features.map(f=><li key={f}><Check/>{f}</li>)}</ul><button onClick={()=>openPlan(plan)}>{plan.mentorship?"VIEW MENTORSHIP":plan.name === "Discord Access" ? "GET DISCORD ACCESS" : "START NOW"}</button></article>)}</div></section>
    </main>

    <footer className="lp-footer"><div className="lp-footer-brand"><strong>TRQ<span>X</span></strong><small>I AM THE ALGO</small><p>Educational content and tools only. No financial advice. Trading involves risk.</p></div><div><b>QUICK LINKS</b><a href="#terminal">Terminal</a><a href="#workflow">Workflow</a><a href="#pricing">Pricing</a><a href="#academy">Academy</a><a href="#about">About</a></div><div><b>STAY CONNECTED</b><div className="lp-socials"><button aria-label="Discord"><MessageCircle/></button><button aria-label="Community"><Users/></button><button aria-label="Market activity"><Activity/></button></div><p>© 2026 TRQX Capital. All rights reserved.</p></div></footer>
  </div>;
}