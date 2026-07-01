import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { CheckCircle, XCircle, Crown, Zap, Star, Shield } from "lucide-react";

export default function Pricing() {
  const { tier } = useAuth();
  const FOUNDING_SPOTS = 50;
  const SPOTS_LEFT = 23;

  const PLANS = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      regularPrice: null,
      period: "forever",
      url: null,
      badge: null,
      icon: Shield,
      description: "Market intelligence and news — no credit card required",
      features: [
        { text: "Market Intelligence (AI daily brief)", included: true },
        { text: "News & Alerts feed", included: true },
        { text: "Economic Calendar", included: true },
        { text: "Landing page access", included: true },
        { text: "Academy & Education", included: false },
        { text: "Flow Scanner", included: false },
        { text: "GEMX Dashboard", included: false },
        { text: "Stock Research", included: false },
      ],
      cta: "Current Plan",
      disabled: true,
      highlight: false,
    },
    {
      id: "starter",
      name: "Starter",
      price: "$49",
      regularPrice: "$79",
      period: "/mo",
      url: "https://whop.com/tqpx-tru-quant-enterprise/trqx-flow-scanner-starter",
      badge: "FOUNDING",
      icon: Star,
      description: "Education and research tools for serious traders",
      features: [
        { text: "Everything in Free", included: true },
        { text: "TRQX Academy — all 3 levels", included: true },
        { text: "Flash Cards (28 pattern cards)", included: true },
        { text: "Platform Guide (How To Use)", included: true },
        { text: "Stock Research (fundamentals + ratings)", included: true },
        { text: "7-day free trial", included: true },
        { text: "Flow Scanner", included: false },
        { text: "GEMX Dashboard", included: false },
        { text: "AI Chat", included: false },
      ],
      cta: "Start Free Trial →",
      disabled: false,
      highlight: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$79",
      regularPrice: "$129",
      period: "/mo",
      url: "https://whop.com/tqpx-tru-quant-enterprise/trqx-flow-scanner-pro",
      badge: "MOST POPULAR",
      icon: Zap,
      description: "Full terminal access with institutional flow data",
      features: [
        { text: "Everything in Starter", included: true },
        { text: "Options Flow Scanner (real-time)", included: true },
        { text: "GEMX Gamma Dashboard", included: true },
        { text: "Trade Plan builder", included: true },
        { text: "AI Chat on Scanner & Academy", included: true },
        { text: "Golden flow alerts ($500K+)", included: true },
        { text: "Sector heatmap", included: true },
        { text: "TRQX Flow Score on every trade", included: true },
        { text: "Dark pool prints", included: true },
        { text: "7-day free trial", included: true },
        { text: "Discord webhook alerts", included: false },
        { text: "ORB Indicator access", included: false },
      ],
      cta: "Start Free Trial →",
      disabled: false,
      highlight: true,
    },
    {
      id: "elite",
      name: "Elite",
      price: "$149",
      regularPrice: "$249",
      period: "/mo",
      url: "https://whop.com/tqpx-tru-quant-enterprise/trqx-flow-scanner-elite",
      badge: "ALL ACCESS",
      icon: Crown,
      description: "The complete TRQX Capital experience",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Capital Allocator (AI portfolio builder)", included: true },
        { text: "Discord webhook alerts (custom)", included: true },
        { text: "ORB Indicator access", included: true },
        { text: "AI Chat everywhere in the terminal", included: true },
        { text: "MarketBrief AI read (live)", included: true },
        { text: "Stock Research full AI verdict", included: true },
        { text: "Smart money tracker", included: true },
        { text: "Flow replay", included: true },
        { text: "API access", included: true },
        { text: "Priority access to new features", included: true },
        { text: "7-day free trial", included: true },
      ],
      cta: "Start Free Trial →",
      disabled: false,
      highlight: false,
    },
  ];

  return (
    <main style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <p style={{ color: "#d4af37", fontSize: "12px", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>TRQX CAPITAL</p>
        <h1 style={{ color: "#f5f1e8", fontSize: "42px", fontWeight: "900", margin: "0 0 16px", letterSpacing: "-0.02em" }}>Choose Your Edge</h1>
        <p style={{ color: "#9ca3af", fontSize: "17px", maxWidth: "560px", margin: "0 auto 24px", lineHeight: "1.6" }}>
          From market intelligence to full institutional flow — every tier built for traders who are serious about execution.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "100px", padding: "8px 20px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ color: "#d4af37", fontSize: "13px", fontWeight: "700" }}>
            {SPOTS_LEFT} of {FOUNDING_SPOTS} founding member spots remaining
          </span>
        </div>
      </div>

      {/* Plans grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "48px" }}>
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = tier === plan.id;
          return (
            <div key={plan.id} style={{
              background: plan.highlight ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${plan.highlight ? "rgba(212,175,55,0.4)" : isCurrent ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "16px", padding: "28px",
              position: "relative",
              display: "flex", flexDirection: "column",
            }}>
              {/* Badge */}
              {plan.badge && (
                <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: plan.highlight ? "#d4af37" : plan.id === "elite" ? "#22c55e" : "rgba(212,175,55,0.2)", color: plan.highlight ? "#000" : plan.id === "elite" ? "#000" : "#d4af37", fontSize: "10px", fontWeight: "900", padding: "4px 14px", borderRadius: "100px", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                  {plan.badge}
                </div>
              )}
              {isCurrent && (
                <div style={{ position: "absolute", top: "-12px", right: "16px", background: "#22c55e", color: "#000", fontSize: "10px", fontWeight: "900", padding: "4px 14px", borderRadius: "100px" }}>
                  CURRENT
                </div>
              )}

              {/* Icon + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <Icon size={20} color={plan.highlight ? "#d4af37" : plan.id === "elite" ? "#22c55e" : "#9ca3af"} />
                <span style={{ color: "#f5f1e8", fontSize: "18px", fontWeight: "800" }}>{plan.name}</span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ color: plan.highlight ? "#d4af37" : "#f5f1e8", fontSize: "36px", fontWeight: "900" }}>{plan.price}</span>
                  <span style={{ color: "#9ca3af", fontSize: "14px" }}>{plan.period}</span>
                </div>
                {plan.regularPrice && (
                  <div style={{ color: "#6b7280", fontSize: "13px", textDecoration: "line-through" }}>Regular {plan.regularPrice}{plan.period}</div>
                )}
              </div>

              {/* Description */}
              <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: "1.5", marginBottom: "24px", minHeight: "40px" }}>{plan.description}</p>

              {/* CTA */}
              {plan.url ? (
                <a href={plan.url} target="_blank" rel="noreferrer" style={{
                  display: "block", textAlign: "center",
                  background: plan.highlight ? "#d4af37" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${plan.highlight ? "#d4af37" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "10px", padding: "12px",
                  color: plan.highlight ? "#000" : "#f5f1e8",
                  fontSize: "14px", fontWeight: "800",
                  textDecoration: "none", marginBottom: "24px",
                }}>
                  {plan.cta}
                </a>
              ) : (
                <div style={{ display: "block", textAlign: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px", color: "#6b7280", fontSize: "14px", fontWeight: "700", marginBottom: "24px" }}>
                  {plan.cta}
                </div>
              )}

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    {f.included
                      ? <CheckCircle size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: "2px" }} />
                      : <XCircle size={15} color="#374151" style={{ flexShrink: 0, marginTop: "2px" }} />
                    }
                    <span style={{ color: f.included ? "#f5f1e8" : "#6b7280", fontSize: "13px", lineHeight: "1.4" }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#6b7280", fontSize: "13px" }}>
          All plans include a 7-day free trial. Cancel anytime. Founding member pricing locked in for life.
        </p>
        <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "8px" }}>
          Billing and subscription management powered by <a href="https://whop.com" target="_blank" rel="noreferrer" style={{ color: "#9ca3af" }}>Whop</a>
        </p>
      </div>
    </main>
  );
}
