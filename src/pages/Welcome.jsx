import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "https://trqx-flow-scanner-production.up.railway.app";

function getAccessToken() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const session = JSON.parse(localStorage.getItem(key));
        return session?.access_token ?? null;
      }
    }
  } catch {}
  return null;
}

function triggerWelcomeEmail(attempt = 0) {
  const token = getAccessToken();
  if (!token) {
    if (attempt < 3) setTimeout(() => triggerWelcomeEmail(attempt + 1), 1500);
    return;
  }
  fetch(`${API_URL}/api/email/welcome`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

function confetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    w: Math.random() * 10 + 6,
    h: Math.random() * 5 + 4,
    r: Math.random() * Math.PI * 2,
    dr: (Math.random() - 0.5) * 0.15,
    dx: (Math.random() - 0.5) * 2,
    dy: Math.random() * 3 + 2,
    color: ["#C9A84C","#FFD700","#22c55e","#a78bfa","#FFFFFF","#f97316"][Math.floor(Math.random()*6)],
    opacity: 1,
  }));

  let frame;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
      p.x += p.dx;
      p.y += p.dy;
      p.r += p.dr;
      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });
    frame = requestAnimationFrame(draw);
  };
  draw();
  setTimeout(() => {
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 5000);
}

// All features with the canAccess feature key that gates them
const FEATURES = [
  {
    icon: "📊",
    title: "Flow Scanner",
    desc: "Live institutional sweeps, blocks & unusual activity in real time.",
    featureKey: "basic_flow",
  },
  {
    icon: "⚡",
    title: "GEMX Gamma Dashboard",
    desc: "Gamma exposure levels, dealer positioning & key price levels.",
    featureKey: "gemx",
  },
  {
    icon: "💰",
    title: "Dividend Channel",
    desc: "70 curated dividend stocks with live yields & deep dive reports.",
    featureKey: "stock_research",
  },
  {
    icon: "🔍",
    title: "Stock Research",
    desc: "AI-powered stock verdicts, technicals & institutional analysis.",
    featureKey: "stock_research",
  },
  {
    icon: "🎓",
    title: "Trading Academy",
    desc: "27 lessons, drills, flashcards & quizzes across 3 levels.",
    featureKey: "academy",
  },
  {
    icon: "📰",
    title: "Market News",
    desc: "Live market news, economic calendar & market intelligence.",
    featureKey: "news",
  },
  {
    icon: "🤖",
    title: "AI Intelligence",
    desc: "Ask AI anything about flow, gamma, charts & trade setups.",
    featureKey: "ai_chat",
  },
  {
    icon: "📈",
    title: "Options Flow",
    desc: "Unusual options activity, sweeps & institutional positioning.",
    featureKey: "options_flow",
  },
];

// Tier display config
const TIER_CONFIG = {
  elite: {
    badge: "✅ ELITE ACCESS ACTIVATED",
    badgeBg: "rgba(34,197,94,0.15)",
    badgeBorder: "rgba(34,197,94,0.4)",
    badgeColor: "#22c55e",
    subtitle: "You have full Elite access to every tool on the platform.",
    footerText: "You have full Elite access to everything above.",
  },
  pro: {
    badge: "⚡ PRO ACCESS ACTIVATED",
    badgeBg: "rgba(168,139,250,0.15)",
    badgeBorder: "rgba(168,139,250,0.4)",
    badgeColor: "#a78bfa",
    subtitle: "You have Pro access. Upgrade to Elite to unlock webhooks, API access & smart money flow.",
    footerText: "Some features require an Elite upgrade.",
  },
  starter: {
    badge: "🚀 STARTER ACCESS ACTIVATED",
    badgeBg: "rgba(59,130,246,0.15)",
    badgeBorder: "rgba(59,130,246,0.4)",
    badgeColor: "#93c5fd",
    subtitle: "You have Starter access. Upgrade to Pro or Elite to unlock live flow data, GEMX & AI tools.",
    footerText: "Upgrade anytime to unlock more tools.",
  },
  free: {
    badge: "👋 FREE PLAN ACTIVATED",
    badgeBg: "rgba(156,163,175,0.12)",
    badgeBorder: "rgba(156,163,175,0.3)",
    badgeColor: "#9ca3af",
    subtitle: "You're on the Free plan. Upgrade to access the full TRQX Capital Terminal.",
    footerText: "Upgrade to unlock the full platform.",
  },
};

export default function Welcome() {
  const navigate = useNavigate();
  const { tier, canAccess } = useAuth();

  const normalizedTier = (tier || "free").toLowerCase();
  const config = TIER_CONFIG[normalizedTier] || TIER_CONFIG.free;

  useEffect(() => {
    confetti();
    triggerWelcomeEmail();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--black)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      position: "relative",
      overflow: "hidden",
    }}>
      <canvas id="confetti-canvas" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10 }} />

      {/* Tier badge */}
      <div style={{
        background: config.badgeBg,
        border: `1px solid ${config.badgeBorder}`,
        borderRadius: "20px",
        padding: "6px 18px",
        fontSize: "13px",
        fontWeight: 700,
        color: config.badgeColor,
        letterSpacing: "1px",
        marginBottom: "28px",
        fontFamily: "var(--font-head)",
      }}>
        {config.badge}
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <div style={{ marginBottom: "16px" }}>
          <img
            src="https://thetrulies.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-7-2026-09_11_29-PM.png"
            alt="TRQX Crown"
            style={{
              width: "100px",
              height: "auto",
              filter: "drop-shadow(0 0 24px rgba(255,180,0,0.8)) drop-shadow(0 0 48px rgba(201,168,76,0.5))",
              animation: "crown-pulse 3s ease-in-out infinite",
            }}
          />
        </div>
        <h1 style={{
          fontFamily: "var(--font-head)",
          fontSize: "clamp(40px, 6vw, 72px)",
          fontWeight: 700,
          color: "var(--gold)",
          letterSpacing: "4px",
          margin: 0,
          lineHeight: 1,
        }}>YOU'RE IN.</h1>
        <p style={{
          color: "var(--text-dim)",
          fontSize: "15px",
          marginTop: "12px",
          maxWidth: "480px",
          margin: "12px auto 0",
          lineHeight: 1.6,
        }}>
          Welcome to the <strong style={{ color: "var(--gold)" }}>TRQX Capital Terminal</strong>.{" "}
          {config.subtitle}
        </p>
      </div>

      {/* Feature Grid */}
      <div style={{ width: "100%", maxWidth: "700px", marginBottom: "16px" }}>
        <div style={{
          fontFamily: "var(--font-head)",
          fontSize: "11px",
          letterSpacing: "3px",
          color: "var(--text-muted)",
          marginBottom: "14px",
          textAlign: "center",
        }}>WHAT'S INCLUDED IN YOUR PLAN</div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
        }}>
          {FEATURES.map((f, i) => {
            const unlocked = canAccess(f.featureKey);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  background: unlocked ? "var(--black-3)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${unlocked ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: "12px",
                  padding: "16px 18px",
                  opacity: unlocked ? 1 : 0.5,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Lock overlay for locked features */}
                {!unlocked && (
                  <div style={{
                    position: "absolute",
                    top: "10px",
                    right: "12px",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                  }}>🔒</div>
                )}

                <div style={{
                  fontSize: "24px",
                  minWidth: "32px",
                  textAlign: "center",
                  marginTop: "2px",
                  filter: unlocked ? "none" : "grayscale(1)",
                }}>{f.icon}</div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--font-head)",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: unlocked ? "var(--text)" : "var(--text-dim)",
                    marginBottom: "4px",
                  }}>{f.title}</div>
                  <div style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}>{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade banner — only show if not elite */}
      {normalizedTier !== "elite" && (
        <div
          onClick={() => navigate("/pricing")}
          style={{
            width: "100%",
            maxWidth: "700px",
            background: "rgba(201,168,76,0.08)",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: "12px",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>⬆️</span>
            <div>
              <div style={{ color: "var(--gold)", fontSize: "13px", fontWeight: 700 }}>Unlock the full terminal</div>
              <div style={{ color: "var(--text-dim)", fontSize: "12px" }}>Upgrade your plan to access all tools including live flow, GEMX, AI & more.</div>
            </div>
          </div>
          <div style={{ color: "var(--gold)", fontSize: "18px", fontWeight: 700, flexShrink: 0 }}>›</div>
        </div>
      )}

      {/* New to trading banner */}
      <div
        onClick={() => navigate("/academy")}
        style={{
          width: "100%",
          maxWidth: "700px",
          background: "rgba(59,130,246,0.08)",
          border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: "12px",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px" }}>🌱</span>
          <div>
            <div style={{ color: "#93c5fd", fontSize: "13px", fontWeight: 700 }}>New to trading?</div>
            <div style={{ color: "var(--text-dim)", fontSize: "12px" }}>Start with Academy Level 1 — it sets the foundation for every tool on this platform.</div>
          </div>
        </div>
        <div style={{ color: "#93c5fd", fontSize: "18px", fontWeight: 700, flexShrink: 0 }}>›</div>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          width: "100%",
          maxWidth: "700px",
          padding: "18px",
          background: "linear-gradient(135deg, #C9A84C, #FFD700, #C9A84C)",
          backgroundSize: "200% auto",
          color: "#000",
          border: "none",
          borderRadius: "12px",
          fontFamily: "var(--font-head)",
          fontSize: "20px",
          fontWeight: 700,
          letterSpacing: "2px",
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(201,168,76,0.3)",
        }}
      >
        ENTER THE TERMINAL →
      </button>

      <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
        {config.footerText}
      </div>
    </div>
  );
}