import React from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  ShieldCheck,
  Lock,
  Target,
  BarChart3,
  CalendarDays,
  Newspaper,
  ClipboardList,
  GraduationCap,
  Crown,
  Users,
  CandlestickChart,
} from "lucide-react";
import "./LandingPage.css";
import trqxLionHero from "../assets/trqx-lion-hero.png";

const marketRows = [
  ["SPY", "$534.21", "+0.72%"],
  ["QQQ", "$459.78", "+0.72%"],
  ["IWM", "$200.45", "+0.72%"],
  ["VIX", "13.62", "-2.11%"],
];

const smartMoney = [
  ["SPY", "$2.4M", "CALL SWEEP"],
  ["NVDA", "$1.8M", "CALL SWEEP"],
  ["AAPL", "$1.2M", "CALL SWEEP"],
  ["TSLA", "$950K", "PUT SWEEP"],
];

const features = [
  ["Options Flow Scanner", "Detect institutional activity as it happens.", Target],
  ["Gamma Exposure", "Know where market makers defend price.", BarChart3],
  ["Economic Calendar", "Never get surprised by major news.", CalendarDays],
  ["Market News", "AI-curated market headlines.", Newspaper],
  ["Trade Planning", "Build complete trade plans.", ClipboardList],
  ["Academy", "Learn from beginner to advanced.", GraduationCap],
];

const plans = [
  {
    name: "TRQX ORB Indicator",
    price: "$49.99",
    features: ["Precision ORB Indicator", "Setup Guide", "ORB Academy Lessons", "Discord ORB Channel"],
  },
  {
    name: "TRQX Scanner + Gamma",
    price: "$79",
    features: ["Options Flow Scanner", "Gamma Dashboard", "Unusual Activity", "Dark Pool Activity", "Daily Watchlist"],
  },
  {
    name: "TRQX Academy",
    price: "$99",
    features: ["Structured Lessons", "Quizzes & Homework", "Beginner to Advanced", "Trading Fundamentals", "Community Access"],
  },
  {
    name: "TRQX Elite",
    price: "$149",
    badge: "Best Value",
    features: ["Everything in Scanner", "Everything in Academy", "Market News", "Economic Calendar", "Trade Plan Engine", "Multi-Asset Coverage"],
  },
  {
    name: "TRQX Mentorship",
    price: "$299",
    features: ["Everything in Elite", "Weekly Group Coaching", "Chart & Trade Reviews", "Direct Q&A Access", "Accountability & Support"],
  },
];

export default function LandingPage() {
  return (
    <main className="trqxLanding">
      <nav className="trqxNav">
        <Link to="/home" className="trqxLogo">
          TRQ<span>X</span>
          <small>TERMINAL</small>
        </Link>

        <div className="trqxNavLinks">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#pricing">Academy</a>
          <a href="#stats">About</a>
          <a href="https://discord.gg/jy3ta9qkfH" target="_blank" rel="noreferrer">Discord</a>
        </div>

        <Link to="/auth" className="navCta">Start Free Trial</Link>
      </nav>

      <section className="heroShell">
        <div className="lionPanel" aria-hidden="true">
          <div className="lionCircle">
            <img src={trqxLionHero} alt="" className="lionHeroImage" />
          </div>
        </div>

        <div className="heroCenter">
          <div className="brandMark">TRQ<span>X</span></div>
          <div className="brandSub">TERMINAL</div>

          <h1>
            Institutional <br />
            <span>Options Flow</span> <br />
            Intelligence
          </h1>

          <h2>Follow smart money. Understand gamma. Trade with precision.</h2>

          <p>
            Track options flow, gamma exposure, economic events, market news,
            and trade planning from one unified platform.
          </p>

          <div className="heroButtons">
            <Link to="/auth" className="goldButton">Start Free Trial</Link>
            <a href="#pricing" className="darkButton">View Plans</a>
          </div>

          <div className="trustGrid">
            <div><Zap /><b>Real-Time Data</b><span>As it happens</span></div>
            <div><ShieldCheck /><b>Institutional Grade</b><span>Built for serious traders</span></div>
            <div><Lock /><b>Secure & Private</b><span>Your data is protected</span></div>
          </div>
        </div>

        <aside className="intelRail">
          <div className="intelCard">
            <div className="cardTop">
              <b>Live Market Overview</b>
              <Link to="/dashboard">View All →</Link>
            </div>
            <div className="marketGrid">
              {marketRows.map(([sym, price, change]) => (
                <div key={sym} className="marketMini">
                  <b>{sym}</b>
                  <strong>{price}</strong>
                  <span className={change.startsWith("-") ? "loss" : "gain"}>{change}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="intelCard">
            <div className="cardTop">
              <b>Today's Smart Money</b>
              <Link to="/options-flow">View Flow →</Link>
            </div>
            {smartMoney.map(([sym, prem, type]) => (
              <div key={sym} className="flowRow">
                <b>{sym}</b>
                <strong className={type.includes("PUT") ? "loss" : "gain"}>{prem}</strong>
                <span>{type}</span>
              </div>
            ))}
          </div>

          <div className="intelCard">
            <div className="cardTop">
              <b>Gamma Dashboard</b>
              <Link to="/gamma-ex">View Map →</Link>
            </div>
            <div className="gammaLine"><span>Gamma Flip</span><div><i style={{ width: "82%" }} /></div><b>534</b></div>
            <div className="gammaLine"><span>Call Wall</span><div><i style={{ width: "70%" }} /></div><b>560</b></div>
            <div className="gammaLine"><span>Put Wall</span><div><i className="redBar" style={{ width: "48%" }} /></div><b>460</b></div>
            <div className="dealer">Dealer Positioning <b>Long Gamma</b></div>
          </div>

          <div className="intelCard">
            <div className="cardTop">
              <b>Economic Calendar</b>
              <Link to="/economic-calendar">View Calendar →</Link>
            </div>
            <div className="eventRow"><span>08:30 AM</span><b>CPI Release</b><em>High</em></div>
            <div className="eventRow"><span>10:00 AM</span><b>FOMC Minutes</b><em>High</em></div>
            <div className="eventRow"><span>02:00 PM</span><b>Fed Chair Powell</b><em>Med</em></div>
          </div>
        </aside>
      </section>

      <section id="features" className="whySection">
        <div className="sectionTitle">
          <span />
          <h2>Why Traders Use TRQX</h2>
          <span />
        </div>

        <div className="featureGrid">
          {features.map(([title, text, Icon]) => (
            <div className="featureCard" key={title}>
              <Icon size={48} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="pricingBlock">
        <small>Choose Your Edge</small>
        <h2>Powerful Tools. Simple Pricing.</h2>

        <div className="planGrid">
          {plans.map((plan) => (
            <div key={plan.name} className={`planCard ${plan.badge ? "featuredPlan" : ""}`}>
              {plan.badge && <div className="planBadge">{plan.badge}</div>}
              <h3>{plan.name}</h3>
              <div className="planPrice">{plan.price}<span>/mo</span></div>
              <ul>
                {plan.features.map((item) => <li key={item}>✓ {item}</li>)}
              </ul>
              <Link to="/pricing" className={plan.badge ? "goldButton" : "darkButton"}>
                {plan.name.includes("Mentorship") ? "Apply Now" : "Get Started"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="stats" className="statsBar">
        <div><CandlestickChart /><b>$500M+</b><span>Flow Analyzed</span></div>
        <div><BarChart3 /><b>50,000+</b><span>Contracts Tracked</span></div>
        <div><Users /><b>2,000+</b><span>Members</span></div>
        <div><ShieldCheck /><b>99.9%</b><span>Uptime</span></div>
        <div><CalendarDays /><b>2024</b><span>Live Since</span></div>
      </section>

      <section className="bottomCta">
        <Crown />
        <div>
          <h2>Ready To Trade Smarter?</h2>
          <p>Join TRQX and see what institutions are doing before the crowd.</p>
        </div>
        <Link to="/auth" className="goldButton">Start Free Trial</Link>
        <a href="https://discord.gg/jy3ta9qkfH" target="_blank" rel="noreferrer" className="darkButton">Join Discord</a>
      </section>
    </main>
  );
}
