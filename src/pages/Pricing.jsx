import { useState } from "react";

export default function Pricing() {
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
      description: "Get a feel for the flow",
      features: [
        { text: "20 trades visible", included: true },
        { text: "Basic call/put filter", included: true },
        { text: "Community access", included: true },
        { text: "Real-time data", included: false },
        { text: "AI Flow Analysis", included: false },
        { text: "Sweep & Block alerts", included: false },
      ],
      cta: "Current Plan",
      disabled: true,
      highlight: false,
    },
    {
      id: "starter",
      name: "Starter",
      price: "$27",
      regularPrice: "$47",
      period: "/mo",
      url: "https://whop.com/tqpx-tru-quant-enterprise/trqx-flow-scanner-starter",
      badge: "FOUNDING",
      description: "Real-time flow for active traders",
      features: [
        { text: "Real-time options flow", included: true },
        { text: "All tickers — no limits", included: true },
        { text: "Sweep, Block, Unusual filters", included: true },
        { text: "Premium size filter", included: true },
        { text: "Ask AI (flow analysis)", included: true },
        { text: "7-day free trial", included: true },
        { text: "Sector heatmap", included: false },
        { text: "Discord webhook alerts", included: false },
      ],
      cta: "Start Free Trial →",
      disabled: false,
      highlight: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$47",
      regularPrice: "$97",
      period: "/mo",
      url: "https://whop.com/tqpx-tru-quant-enterprise/trqx-flow-scanner-pro",
      badge: "MOST POPULAR",
      description: "Institutional-grade edge",
      features: [
        { text: "Everything in Starter", included: true },
        { text: "Golden flow alerts ($500K+)", included: true },
        { text: "Sector heat map", included: true },
        { text: "Hourly AI market reports", included: true },
        { text: "TRQX Flow Score on every trade", included: true },
        { text: "Dark pool prints", included: true },
        { text: "7-day free trial", included: true },
        { text: "Custom Discord webhooks", included: false },
      ],
      cta: "Start Free Trial →",
      disabled: false,
      highlight: true,
    },
    {
      id: "elite",
      name: "Elite",
      price: "$97",
      regularPrice: "$197",
      period: "/mo",
      url: "https://whop.com/tqpx-tru-quant-enterprise/trqx-flow-scanner-elite",
      badge: "FOUNDING",
      description: "The full arsenal",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Smart Money Tracker", included: true },
        { text: "Custom Discord webhooks", included: true },
        { text: "Raw API access", included: true },
        { text: "Priority support", included: true },
        { text: "Monthly TRQX strategy call", included: true },
        { text: "Flow Replay (coming soon)", included: true },
        { text: "7-day free trial", included: true },
      ],
      cta: "Start Free Trial →",
      disabled: false,
      highlight: false,
    },
  ];

  return (
    <div className="pricing-page">
      {/* Hero */}
      <div className="pricing-hero">
        <div className="pricing-eyebrow">👑 TRQX FLOW SCANNER</div>
        <h1 className="pricing-title">
          See Where <span className="pricing-title-gold">Institutional Money</span> Moves
        </h1>
        <p className="pricing-subtitle">
          Before the crowd does. Real-time options flow, AI analysis, and smart money tracking.
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
                    Save ${parseInt(plan.regularPrice.replace('$','')) - parseInt(plan.price.replace('$',''))}/mo · locked in forever
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

            {plan.id !== "free" && (
              <div className="plan-trial-note">7-day free trial · Cancel anytime</div>
            )}
          </div>
        ))}
      </div>

      {/* Features comparison */}
      <div className="pricing-features">
        <div className="pricing-features-title">Everything included in TRQX Flow Scanner</div>
        <div className="pricing-features-grid">
          {[
            { icon: "⚡", title: "Real-Time Flow", desc: "Polygon-powered options flow updated every 10 seconds" },
            { icon: "🤖", title: "Ask AI Anything", desc: "Query live flow data in plain English — instant analysis" },
            { icon: "📊", title: "Hourly Reports", desc: "AI generates market intelligence reports every hour" },
            { icon: "🏦", title: "Block Trade Detection", desc: "Spot institutional $1M+ orders as they hit the tape" },
            { icon: "⚡", title: "Sweep Scanner", desc: "Multi-leg cross-exchange sweeps flagged in real time" },
            { icon: "🗺️", title: "Sector Heat Map", desc: "See which sectors smart money is positioning in" },
            { icon: "🎯", title: "Smart Money Tracker", desc: "Track tickers with repeated institutional accumulation" },
            { icon: "💬", title: "Discord Alerts", desc: "Get notified instantly on qualifying flow in your server" },
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
        <div className="pricing-footer-tagline">Plan It. Trade It. Slay It.</div>
      </div>
    </div>
  );
}