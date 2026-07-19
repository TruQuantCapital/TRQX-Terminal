import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const navigate = useNavigate();

  const FOUNDING_SPOTS = 50;
  const SPOTS_LEFT = 23; // update this manually as spots fill
  

  const PLANS = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      regularPrice: null,
      period: "forever",
      url: null,
      badge: null,
      description: "See what the Terminal can do",
      features: [
        { text: "Market news & economic calendar", included: true },
        { text: "Market Intelligence preview", included: true },
        { text: "Academy Level 1 sampler", included: true },
        { text: "Full Trading Academy", included: false },
        { text: "Live options flow & GEMX", included: false },
        { text: "Morning Coach & AI tools", included: false },
      ],
      cta: "Current Plan",
      disabled: true,
      highlight: false,
      trialNote: null,
    },
    {
      id: "starter",
      name: "Starter",
      price: "$29.99",
      regularPrice: "$49.99",
      period: "/mo",
      url: "https://whop.com/tqpx-tru-quant-enterprise/trqx-capital-terminal-starter",
      badge: "FOUNDING",
      description: "Learn the game the right way",
      features: [
        { text: "Full Trading Academy + AI grader", included: true },
        { text: "28-pattern Flash Cards & drills", included: true },
        { text: "Stock Research with AI verdicts", included: true },
        { text: "Dividend Deep Dive — 70 stocks", included: true },
        { text: "Market Intelligence briefings", included: true },
        { text: "News + economic calendar", included: true },
        { text: "Live options flow & GEMX", included: false },
        { text: "Morning Coach", included: false },
      ],
      cta: "Start Free Trial →",
      disabled: false,
      highlight: false,
      trialNote: "7-day free trial · Cancel anytime",
    },
    {
      id: "pro",
      name: "Pro",
      price: "$79.99",
      regularPrice: "$99.99",
      period: "/mo",
      url: "https://whop.com/tqpx-tru-quant-enterprise/trqx-terminal-pro",
      badge: "MOST POPULAR",
      description: "The full trading intelligence suite",
      features: [
        { text: "Everything in Starter", included: true },
        { text: "Live Options Flow Scanner", included: true },
        { text: "GEMX Gamma Analytics", included: true },
        { text: "Morning Coach — daily AI briefing", included: true },
        { text: "Capital Allocator", included: true },
        { text: "TRQX Flow Score + AI Reports", included: true },
        { text: "Dark pool prints & golden sweeps", included: true },
        { text: "Discord community & API access", included: false },
      ],
      cta: "Start Free Trial →",
      disabled: false,
      highlight: true,
      trialNote: "7-day free trial · Cancel anytime",
    },
    {
      id: "elite",
      name: "Elite",
      price: "$149.99",
      regularPrice: "$199.99",
      period: "/mo",
      url: "https://whop.com/tqpx-tru-quant-enterprise/trqx-elite",
      badge: "FOUNDING",
      description: "The full institutional stack — and the room",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Smart Money Tracker", included: true },
        { text: "Flow Replay", included: true },
        { text: "Trade Plan Engine", included: true },
        { text: "TRQX Discord community access", included: true },
        { text: "Custom Discord webhooks", included: true },
        { text: "Raw API access", included: true },
        { text: "Priority support", included: true },
      ],
      cta: "Go Elite →",
      disabled: false,
      highlight: false,
      trialNote: "Instant full access · Cancel anytime",
    },
  ];

  return (
    <div className="pricing-page">
      {/* Hero */}
      <div className="pricing-hero">
        <div className="pricing-eyebrow">👑 TRQX CAPITAL TERMINAL</div>
        <h1 className="pricing-title">
          Trade With <span className="pricing-title-gold">Institutional Intelligence</span>
        </h1>
        <p className="pricing-subtitle">
          Live options flow, gamma analytics, an AI morning coach, and a complete trading academy — one terminal.
        </p>

        {/* Founding member banner */}
        <div className="founding-banner">
          <div className="founding-banner-left">
            <span className="founding-fire">🔥</span>
            <div>
              <div className="founding-title">Founding Member Pricing</div>
              <div className="founding-sub">Lock in this rate forever — prices increase after founding spots fill</div>
            </div>
          </div>
          <div className="founding-spots">
            <div className="spots-number">{SPOTS_LEFT}</div>
            <div className="spots-label">spots left<br/>of {FOUNDING_SPOTS}</div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="plans-grid">
        {PLANS.map(plan => (
          <div key={plan.id} className={`plan-card ${plan.highlight ? "plan-featured" : ""} ${plan.id === "free" ? "plan-free" : ""}`}>
            {/* Badge */}
            {plan.badge && (
              <div className={`plan-badge ${plan.badge === "MOST POPULAR" ? "badge-popular" : "badge-founding"}`}>
                {plan.badge === "MOST POPULAR" ? "⭐ MOST POPULAR" : "🔥 FOUNDING PRICE"}
              </div>
            )}
{/* Elite Mentorship */}
            {/* Header */}
            <div className="plan-header">
              <div className="plan-name">{plan.name}</div>
              <div className="plan-description">{plan.description}</div>
              <div className="plan-pricing">
                <div className="plan-price-row">
                  <span className="plan-price">{plan.price}</span>
                  <span className="plan-period">{plan.period}</span>
                  {plan.regularPrice && (
                    <span className="plan-regular">{plan.regularPrice}/mo</span>
                  )}
                </div>
                {plan.regularPrice && (
                  <div className="plan-savings">
                    Save ${Math.round(parseFloat(plan.regularPrice.replace('$','')) - parseFloat(plan.price.replace('$','')))}/mo · locked in forever
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <ul className="plan-features">
              {plan.features.map((f, i) => (
                <li key={i} className={`plan-feature ${!f.included ? "feature-excluded" : ""}`}>
                  <span className={`feature-icon ${f.included ? "icon-check" : "icon-x"}`}>
                    {f.included ? "✓" : "✕"}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              className={`plan-cta ${plan.highlight ? "cta-featured" : plan.disabled ? "cta-disabled" : "cta-default"}`}
              onClick={() => plan.url && window.open(plan.url, "_blank")}
              disabled={plan.disabled}
            >
              {plan.cta}
            </button>

            {plan.trialNote && (
              <div className="plan-trial-note">{plan.trialNote}</div>
            )}
          </div>
        ))}
      </div>
      {/* Elite Mentorship Promotion */}
      <section className="mentorship-pricing-promo">
        <div className="mentorship-pricing-copy">
          <div className="mentorship-pricing-eyebrow">
            👑 TRQX ELITE MENTORSHIP
          </div>

          <h2>
            Technology gives you data. Mentorship gives you structure.
          </h2>

          <p>
            Work directly with Michael A. Valerio through live coaching,
            market preparation, trade reviews, risk-management education,
            accountability, and private mentorship sessions.
          </p>

          <div className="mentorship-pricing-benefits">
            <span>✓ Weekly live coaching</span>
            <span>✓ Market preparation</span>
            <span>✓ Trade and chart reviews</span>
            <span>✓ Private community</span>
            <span>✓ Full Elite Terminal access</span>
            <span>✓ Session recordings</span>
          </div>
        </div>

        <div className="mentorship-pricing-offer">
          <small>ELITE MENTORSHIP</small>

          <div>
            <strong>$299</strong>
            <span>/month</span>
          </div>

          <p>
            Structured coaching for traders committed to improvement.
          </p>

          <button onClick={() => navigate("/mentorship")}>
            View Mentorship Program →
          </button>
        </div>
      </section>

      {/* Features comparison */}
      <div className="pricing-features">
        <div className="pricing-features-title">Everything included in the TRQX Capital Terminal</div>
        <div className="pricing-features-grid">
          {[
            { icon: "⚡", title: "Real-Time Flow", desc: "Institutional sweeps and blocks scored live by the TRQX Flow Score" },
            { icon: "🎯", title: "GEMX Gamma Analytics", desc: "Call walls, put walls, gamma flip, and dealer positioning — live" },
            { icon: "🧠", title: "Morning Coach", desc: "A daily AI briefing that reads overnight flow before you do" },
            { icon: "💼", title: "Capital Allocator", desc: "AI-guided portfolio construction with live market prices" },
            { icon: "📚", title: "Trading Academy", desc: "28 chart patterns, interactive drills, and an AI grader" },
            { icon: "🤖", title: "Ask AI Anything", desc: "Query live flow, gamma, and charts in plain English" },
            { icon: "🔍", title: "Smart Money Tracker", desc: "Track tickers with repeated institutional accumulation" },
            { icon: "💬", title: "Discord Alerts", desc: "Pipe qualifying flow straight into your own server" },
          ].map((f, i) => (
            <div key={i} className="pf-card">
              <div className="pf-icon">{f.icon}</div>
              <div className="pf-title">{f.title}</div>
              <div className="pf-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom note */}
      <div className="pricing-footer">
        <div className="pricing-footer-text">
          Powered by Whop · Cancel anytime · Founding member pricing locked in forever
        </div>
        <div className="pricing-footer-tagline">Precision. Discipline. Execution.</div>
      </div>
    </div>
  );
}
