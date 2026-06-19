import React from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Shield,
  Lock,
  Target,
  BarChart3,
  CalendarDays,
  Newspaper,
  Layers,
  Crown,
  GraduationCap,
  Trophy,
} from "lucide-react";
import "./LandingPage.css";

const plans = [
  {
    name: "TRQX ORB",
    price: "$49.99",
    icon: Target,
    features: [
      "Precision ORB Indicator",
      "Setup Guide",
      "ORB Academy Lessons",
      "Discord ORB Channel",
    ],
  },
  {
    name: "TRQX Scanner",
    price: "$79",
    icon: BarChart3,
    features: [
      "Options Flow Scanner",
      "Unusual Activity",
      "Dark Pool Activity",
      "Momentum Scanner",
      "Low Float Scanner",
      "Daily Watchlist",
    ],
  },
  {
    name: "TRQX Gamma Suite",
    price: "$79",
    icon: Zap,
    features: [
      "Gamma Dashboard",
      "Gamma Flip",
      "Call Wall / Put Wall",
      "Dealer Positioning",
      "Market Maker Analysis",
      "Daily Gamma Levels",
    ],
  },
  {
    name: "TRQX Market Intelligence",
    price: "$129",
    icon: Crown,
    popular: true,
    features: [
      "Everything in Scanner",
      "Everything in Gamma",
      "Market News",
      "Economic Calendar",
      "Trade Plan Engine",
    ],
  },
  {
    name: "TRQX Academy",
    price: "$99",
    icon: GraduationCap,
    features: [
      "Structured Lessons",
      "Quizzes & Homework",
      "Beginner to Intermediate",
      "Trading Fundamentals",
      "Community Access",
    ],
  },
  {
    name: "TRQX Mentorship",
    price: "$299",
    icon: Trophy,
    features: [
      "Everything in Market Intelligence",
      "Weekly Group Coaching",
      "Chart & Trade Reviews",
      "Direct Q&A Access",
      "Accountability & Support",
    ],
  },
];

export default function LandingPage() {
  return (
    <main className="landingPage">
      <nav className="landingNav">
        <div className="landingLogo">
          TRQ<span>X</span>
          <small>TERMINAL</small>
        </div>

        <div className="landingLinks">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#academy">Academy</a>
          <a href="#about">About</a>
        </div>

        <div className="landingActions">
          <a href="https://discord.gg/jy3ta9qkfH" target="_blank" rel="noreferrer">
            Discord
          </a>
          <Link to="/auth" className="outlineBtn">Login</Link>
          <Link to="/pricing" className="goldBtn">Get Started</Link>
        </div>
      </nav>

      <section className="landingHero">
        <div className="heroCopy">
          <div className="heroBadge">
            <Zap size={15} /> Real-Time Options Flow & Market Intelligence
          </div>

          <h1>
            The Edge <br />
            Retail Traders <br />
            <span>Deserve.</span>
          </h1>

          <p>
            TRQX Terminal delivers options flow, gamma exposure, market news,
            economic events, trade planning, and academy education inside one
            black-and-gold trading platform.
          </p>

          <div className="heroButtons">
            <Link to="/auth" className="goldBtn">Start Your Free Trial</Link>
            <a href="#pricing" className="outlineBtn">Explore Plans</a>
          </div>

          <div className="trustRow">
            <div><Zap /> Real-Time Data</div>
            <div><Shield /> Institutional Grade</div>
            <div><Lock /> Secure & Private</div>
          </div>
        </div>

        <div className="terminalPreview">
          <div className="previewSidebar">
            <b>TRQ<span>X</span></b>
            {["Dashboard", "Scanner", "Options Flow", "Gamma Ex", "Calendar", "News", "Academy"].map((x) => (
              <div key={x}>{x}</div>
            ))}
          </div>

          <div className="previewMain">
            <div className="marketTiles">
              {["SPY", "QQQ", "IWM", "VIX"].map((x, i) => (
                <div key={x}>
                  <small>{x}</small>
                  <b>{i === 3 ? "13.62" : i === 0 ? "534.21" : i === 1 ? "459.78" : "200.45"}</b>
                  <span className={i === 3 ? "red" : "green"}>{i === 3 ? "-2.11%" : "+0.72%"}</span>
                </div>
              ))}
            </div>

            <div className="previewGrid">
              <div className="previewPanel large">
                <h4>Options Flow</h4>
                {["SPY SWEEP CALL $2.4M", "QQQ BLOCK CALL $1.8M", "AAPL SWEEP CALL $1.2M", "TSLA PUT $950K"].map((x) => (
                  <p key={x}>{x}</p>
                ))}
              </div>

              <div className="previewPanel">
                <h4>Gamma Exposure</h4>
                <div className="gammaBars">
                  {[80, 70, 60, 45, 30].map((w) => <span key={w} style={{ width: `${w}%` }} />)}
                </div>
              </div>

              <div className="previewPanel large">
                <h4>Market News</h4>
                <p>Fed comments shift rate expectations</p>
                <p>NVDA AI demand remains strong</p>
                <p>Oil rises on supply concerns</p>
              </div>

              <div className="previewPanel">
                <h4>Economic Calendar</h4>
                <p>CPI Release — High</p>
                <p>FOMC Minutes — High</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="featureStrip">
        <div><Target /> <b>Real-Time Options Flow</b><span>See big money as it hits.</span></div>
        <div><BarChart3 /> <b>Gamma Exposure Maps</b><span>Know key market levels.</span></div>
        <div><CalendarDays /> <b>Economic Calendar</b><span>Track market-moving events.</span></div>
        <div><Newspaper /> <b>Breaking News Feed</b><span>Curated. Fast. Relevant.</span></div>
        <div><Layers /> <b>Multi-Asset Coverage</b><span>Stocks, ETFs, futures and more.</span></div>
      </section>

      <section id="pricing" className="pricingSection">
        <div className="sectionHeader">
          <small>CHOOSE YOUR EDGE</small>
          <h2>Pick the toolset that fits your trading level.</h2>
        </div>

        <div className="pricingGrid">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div key={plan.name} className={`pricingCard ${plan.popular ? "popular" : ""}`}>
                {plan.popular && <div className="popularBadge">Most Popular</div>}
                <Icon size={34} />
                <h3>{plan.name}</h3>
                <div className="price">{plan.price}<span>/month</span></div>

                <ul>
                  {plan.features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>

                <Link to="/pricing" className="goldBtn">
                  {plan.name.includes("Mentorship") ? "Apply Now" : "Get Started"}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="landingFooter">
        <div>
          <div className="landingLogo">TRQ<span>X</span><small>TERMINAL</small></div>
          <p>Options flow, gamma exposure, market intelligence, and trader education.</p>
        </div>

        <div>
          <b>Product</b>
          <a>Features</a>
          <a>Pricing</a>
          <a>Academy</a>
        </div>

        <div>
          <b>Community</b>
          <a href="https://discord.gg/jy3ta9qkfH" target="_blank" rel="noreferrer">Discord</a>
          <a>Support</a>
          <a>Contact</a>
        </div>
      </footer>
    </main>
  );
}
