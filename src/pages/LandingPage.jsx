import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, ArrowRight, BarChart3, BookOpen, Bot, CalendarDays,
  Check, ChevronRight, CircleDollarSign, Clock3, Crosshair,
  Gauge, GraduationCap, Layers3, Lock, MessageCircle, Radar,
  ShieldCheck, Sparkles, Target, TrendingUp, Users, Zap
} from "lucide-react";
import "./LandingPage.css";

const DISCORD_CHECKOUT = import.meta.env.VITE_WHOP_DISCORD_URL || "https://whop.com/tqpx-tru-quant-enterprise/";
const STARTER_CHECKOUT = import.meta.env.VITE_WHOP_STARTER_URL || "https://whop.com/tqpx-tru-quant-enterprise/trqx-capital-terminal-starter";
const PRO_CHECKOUT = import.meta.env.VITE_WHOP_PRO_URL || "https://whop.com/tqpx-tru-quant-enterprise/trqx-terminal-pro";
const ELITE_CHECKOUT = import.meta.env.VITE_WHOP_ELITE_URL || "https://whop.com/tqpx-tru-quant-enterprise/trqx-elite";
const ALL_ACCESS_CHECKOUT = import.meta.env.VITE_WHOP_ALL_ACCESS_URL || "https://whop.com/tqpx-tru-quant-enterprise/";

const plans = [
  { name: "TRQX Trading Floor", label: "Discord Membership", price: "$45.99", url: DISCORD_CHECKOUT, features: ["Full Discord access", "Daily market preparation", "Live trade discussions", "Education and chart reviews", "Cancel anytime"] },
  { name: "Terminal Starter", label: "Core Intelligence", price: "$49", url: STARTER_CHECKOUT, features: ["TRQX Academy", "Flash cards and drills", "AI stock research", "Dividend intelligence", "News and calendar"] },
  { name: "Terminal Pro", label: "Advanced Intelligence", price: "$79", url: PRO_CHECKOUT, popular: true, features: ["Everything in Starter", "Options flow scanner", "GEMX gamma dashboard", "Trade plan builder", "AI market intelligence"] },
  { name: "Terminal Elite", label: "Complete Terminal", price: "$149", url: ELITE_CHECKOUT, features: ["Everything in Pro", "Capital Allocator", "Smart money tracker", "Flow replay", "Priority support"] },
  { name: "TRQX All Access", label: "Terminal + Discord", price: "$189", url: ALL_ACCESS_CHECKOUT, features: ["Terminal Elite", "Trading Floor membership", "Priority onboarding", "Best total value", "One membership"] },
];

function MarketCard({ symbol, price, change, negative }) {
  return <div className="lp-market-card"><span>{symbol}</span><b>{price}</b><small className={negative ? "down" : "up"}>{change}</small><div className={`lp-spark ${negative ? "red" : "green"}`}><i/><i/><i/><i/><i/><i/></div></div>;
}

function TerminalPreview() {
  return <div className="lp-terminal-shell">
    <div className="lp-terminal-top"><div><span className="lp-terminal-mark">TQ</span><b>TRQX TERMINAL</b></div><div className="lp-window-dots"><i/><i/><i/></div></div>
    <div className="lp-terminal-body">
      <aside className="lp-mini-sidebar">{[Activity, Radar, Gauge, CalendarDays, Bot].map((Icon, i)=><Icon key={i} size={17}/>)}</aside>
      <div className="lp-terminal-main">
        <div className="lp-preview-title"><span>Market Overview</span><em>LIVE</em></div>
        <div className="lp-market-grid"><MarketCard symbol="SPY" price="$534.21" change="+0.72%"/><MarketCard symbol="QQQ" price="$459.78" change="+0.72%"/><MarketCard symbol="IWM" price="$200.45" change="+0.72%"/><MarketCard symbol="VIX" price="13.62" change="-2.11%" negative/></div>
        <div className="lp-terminal-lower">
          <div className="lp-flow-panel"><div className="lp-panel-head">Today's Flow <span>View All</span></div>{[["SPY","CALL SWEEP","$2.4M"],["NVDA","CALL SWEEP","$1.8M"],["AAPL","CALL SWEEP","$1.2M"],["TSLA","PUT SWEEP","$950K"]].map((r,i)=><div className="lp-flow-row" key={i}><b>{r[0]}</b><span className={i===3?"down":"up"}>{r[1]}</span><em>{r[2]}</em></div>)}</div>
          <div className="lp-gamma-panel"><div className="lp-panel-head">SPY Options Flow</div><div className="lp-bubble-chart">{Array.from({length:28}).map((_,i)=><i key={i} style={{left:`${8+(i%7)*13}%`,top:`${12+Math.floor(i/7)*21}%`,width:`${8+(i%5)*3}px`,height:`${8+(i%5)*3}px`}}/>)}</div></div>
        </div>
        <div className="lp-terminal-bottom"><div><b>Economic Calendar</b><span>08:30 AM · CPI Release</span></div><div><b>Dealer Positioning</b><span className="up">LONG GAMMA</span></div><div><b>AI Market Read</b><span>Risk-on, selective momentum</span></div></div>
      </div>
      <div className="lp-gamma-ring"><span>GAMMA</span><b>72%</b><small>LONG</small></div>
    </div>
  </div>;
}

function WorkflowCard({ number, icon: Icon, title, time, children, footer }) {
  return <article className="lp-workflow-card"><div className="lp-workflow-heading"><span>{number}</span><Icon size={20}/><div><h3>{title}</h3><p>{time}</p></div></div><div className="lp-workflow-content">{children}</div><small>{footer}</small></article>;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const go = (path) => navigate(path);
  const checkout = (url) => window.open(url, "_blank", "noopener,noreferrer");

  return <div className="trqx-landing">
    <header className="lp-nav"><button className="lp-brand" onClick={()=>go("/home")}><strong>TRQ<span>X</span></strong><small>TERMINAL</small></button><nav><a href="#terminal">Terminal</a><a href="#workflow">Trading Floor</a><a href="#academy">Academy</a><a href="#pricing">Pricing</a><a href="#why">About</a></nav><div className="lp-nav-actions"><button className="lp-login" onClick={()=>go("/auth")}>Login</button><button className="lp-gold-btn" onClick={()=>go("/auth")}>Start Free Trial</button></div></header>

    <main>
      <section className="lp-hero" id="terminal">
        <div className="lp-grid-bg"/>
        <div className="lp-hero-copy"><div className="lp-live-pill"><i/> LIVE MARKET STATUS <b>MARKET OPEN</b></div><h1>THE TRADING<br/><span>OPERATING SYSTEM</span></h1><h2>Read the Market. Build the Plan.<br/>Execute with Precision. Review Every Decision.</h2><p>TRQX combines institutional options flow, gamma intelligence, market preparation, education, and a complete execution workflow in one professional environment.</p><div className="lp-hero-actions"><button className="lp-primary" onClick={()=>go("/auth")}>ENTER THE TERMINAL <ArrowRight size={18}/></button><button className="lp-secondary" onClick={()=>go("/discord-membership")}>JOIN THE TRADING FLOOR <small>$45.99 / MONTH</small></button></div><div className="lp-trust-row"><div><Zap/><span><b>REAL-TIME DATA</b>As it happens</span></div><div><BarChart3/><span><b>INSTITUTIONAL GRADE</b>Built for serious traders</span></div><div><ShieldCheck/><span><b>SECURE & PRIVATE</b>Your data is protected</span></div><div><Target/><span><b>BUILT FOR TRADERS</b>By traders, for traders</span></div></div></div>
        <TerminalPreview/>
      </section>

      <div className="lp-tape"><span>TRADING INTELLIGENCE LIVE</span>{[["SPY","534.21","+0.72%"],["QQQ","459.78","+0.72%"],["IWM","200.45","+0.72%"],["VIX","13.62","-2.11%"],["/ES","5342.00","+0.68%"],["/NQ","18745.25","+0.71%"]].map((x,i)=><b key={x[0]}>{x[0]} {x[1]} <em className={i===3?"down":"up"}>{x[2]}</em></b>)}</div>

      <section className="lp-section" id="workflow"><div className="lp-section-head"><span>A COMPLETE WORKFLOW</span><h2>A DAY INSIDE TRQX</h2><p>From premarket preparation to post-market review.</p></div><div className="lp-workflow-grid">
        <WorkflowCard number="1" icon={Clock3} title="Premarket Preparation" time="7:45 AM – 9:30 AM" footer="Build the plan. Know your levels. Enter prepared."><ul><li><CalendarDays/>Economic Calendar</li><li><Bot/>AI Market Brief</li><li><Radar/>Options Flow Scanner</li><li><Gauge/>Gamma Dashboard</li><li><Layers3/>Premarket Levels</li></ul><div className="lp-mini-chart"><div className="lp-levels"><span>Resistance <b>$542.50</b></span><span>$541.20</span><span>$539.80</span><span className="up">Support <b>$537.10</b></span></div><svg viewBox="0 0 240 120"><polyline points="0,102 25,96 45,100 70,84 92,88 115,63 138,69 162,42 184,50 210,25 240,12"/></svg></div></WorkflowCard>
        <WorkflowCard number="2" icon={Crosshair} title="Live Execution" time="9:30 AM – 4:00 PM" footer="Execute with precision. Manage with discipline."><div className="lp-trade-chart"><div className="lp-trade-ticket"><b>SPY · LONG CALL</b><span>Entry $540.25</span><span>Stop $539.00</span><span>Risk 1.25R</span></div><svg viewBox="0 0 330 170"><polyline points="0,150 35,144 55,130 78,136 98,110 120,117 145,83 170,92 195,66 218,70 246,38 275,44 300,22 330,28"/></svg><i className="tp tp1">TP1 +3R</i><i className="tp be">BE MOVE</i><i className="tp tp2">TP2 +5R</i><i className="stop">STOP</i></div></WorkflowCard>
        <WorkflowCard number="3" icon={BookOpen} title="Post Market Review" time="4:00 PM – After Close" footer="Review every decision. Get better every day."><ul><li><Activity/>Trade Replay</li><li><BookOpen/>Journal & Notes</li><li><TrendingUp/>Performance Analytics</li><li><Target/>Win Rate & R-Multiples</li><li><Sparkles/>Lessons Learned</li></ul><div className="lp-performance"><span>Total Trades <b>7</b></span><span>Win Rate <b>71%</b></span><span>Total R <b className="up">+9.25R</b></span><span>Profit Factor <b className="up">2.45</b></span></div></WorkflowCard>
      </div></section>

      <section className="lp-discord" id="discord"><div className="lp-discord-copy"><span>THE TRQX</span><h2>TRADING FLOOR</h2><h3>A COMMUNITY OF SERIOUS TRADERS BUILDING CONSISTENT RESULTS.</h3><p>Daily preparation, live trade discussions, education, chart reviews, and accountability. We do not just talk about trading. We execute the process together.</p><button className="lp-primary" onClick={()=>go("/discord-membership")}><MessageCircle/> EXPLORE THE DISCORD</button><small>$45.99 / MONTH · CANCEL ANYTIME</small></div><div className="lp-discord-window"><aside><b>TRQX TRADING FLOOR</b><span>MARKET PREP</span><p># daily-plan</p><p># premarket-levels</p><p># economic-calendar</p><p># market-news</p><span>LIVE FLOOR</span><p className="active"># live-trades</p><p># trade-management</p><p># alerts</p><span>LEARN & GROW</span><p># chart-reviews</p><p># academy</p><p># psychology</p></aside><div className="lp-chat"><div className="lp-chat-head"># live-trades <span>342 online</span></div><article><b>TRQX Alerts <small>9:31 AM</small></b><p>SPY CALL $40</p><span>Stop: $39.00 · Targets: $43.25 / $45.50 / $48.00</span><div className="lp-chat-chart"><svg viewBox="0 0 500 130"><polyline points="0,105 45,95 80,103 115,82 150,88 190,60 230,72 270,43 320,52 360,31 410,38 455,18 500,25"/></svg></div></article><article><b>Floor Manager <small>9:42 AM</small></b><p className="up">TP1 HIT · +3R locked</p></article><article><b>TRQX Alerts <small>9:51 AM</small></b><p>Move stop to breakeven.</p></article></div><aside className="lp-members"><b>ONLINE NOW — 342</b>{["TRQX Founder","Floor Manager","AlphaTrader","ChartKing","DisciplineWins","LevelUp","PatiencePays"].map((x,i)=><p key={x}><i className={i<2?"gold":"green"}/>{x}</p>)}</aside></div></section>

      <section className="lp-section lp-pricing" id="pricing"><div className="lp-section-head"><span>CHOOSE YOUR EDGE</span><h2>POWERFUL TOOLS. SIMPLE PRICING.</h2><p>Choose software, community, or the complete TRQX experience.</p></div><div className="lp-pricing-grid">{plans.map(plan=><article key={plan.name} className={plan.popular?"popular":""}>{plan.popular&&<em>MOST POPULAR</em>}<small>{plan.label}</small><h3>{plan.name}</h3><div className="lp-price">{plan.price}<span>/mo</span></div><ul>{plan.features.map(f=><li key={f}><Check/>{f}</li>)}</ul><button onClick={()=>checkout(plan.url)}>{plan.name.includes("Floor")?"JOIN THE FLOOR":plan.name.includes("All")?"GET ALL ACCESS":"START NOW"}</button></article>)}</div></section>

      <section className="lp-why" id="why"><div className="lp-why-intro"><span>WHY TRADERS</span><h2>USE TRQX</h2><p>Structure, intelligence, discipline, education, and accountability—combined in one operating system.</p></div>{[[Users,"PROFESSIONAL PROCESS","A structured workflow from preparation through review."],[Radar,"REAL INTELLIGENCE","Institutional data translated into decisions."],[Target,"DISCIPLINE & ACCOUNTABILITY","Stay consistent with a process and community."],[GraduationCap,"EDUCATION THAT WORKS","Learn, practice, apply, and improve."],[TrendingUp,"FOCUS ON RESULTS","Execute the plan and let the edge compound."]].map(([Icon,t,d])=><div className="lp-why-item" key={t}><Icon/><b>{t}</b><p>{d}</p></div>)}<blockquote>“TRQX is not just a tool. It is the operating system for serious traders.”<span>— TRQX Founder</span></blockquote></section>

      <section className="lp-stats"><div><Users/><span><b>342</b>Members Online</span></div><div><Crosshair/><span><b>14</b>Trades Today</span></div><div><TrendingUp/><span><b>+18.25R</b>Total R Today</span></div><div><BookOpen/><span><b>7</b>Market Plans Published</span></div><div className="lp-next-event"><small>NEXT EVENT</small><b>CPI Release</b><span>08:30 AM ET</span></div><div className="lp-countdown"><b>02</b><i>:</i><b>14</b><i>:</i><b>37</b></div></section>
    </main>

    <footer className="lp-footer"><div className="lp-footer-brand"><strong>TRQ<span>X</span></strong><small>I AM THE ALGO</small><p>Educational content and tools only. No financial advice. Trading involves risk.</p></div><div><b>QUICK LINKS</b><a href="#terminal">Terminal</a><a href="#pricing">Pricing</a><a href="#academy">Academy</a><a href="#discord">Discord</a><a href="#why">About</a></div><div><b>STAY CONNECTED</b><div className="lp-socials"><button><MessageCircle/></button><button><Users/></button><button><Activity/></button></div><p>© 2026 TRQX Capital. All rights reserved.</p></div></footer>
  </div>;
}
