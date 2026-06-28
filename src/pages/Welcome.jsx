import { useEffect } from "react";
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
      p.x += p.dx; p.y += p.dy; p.r += p.dr;
      if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
    });
    frame = requestAnimationFrame(draw);
  };
  draw();
  setTimeout(() => { cancelAnimationFrame(frame); ctx.clearRect(0, 0, canvas.width, canvas.height); }, 5000);
}

const FEATURES = [
  { icon: "📊", title: "Flow Scanner", desc: "Live institutional sweeps, blocks & unusual activity in real time.", featureKey: "basic_flow", minTier: "pro" },
  { icon: "⚡", title: "GEMX Gamma Dashboard", desc: "Gamma exposure levels, dealer positioning & key price levels.", featureKey: "gemx", minTier: "pro" },
  { icon: "💰", title: "Dividend Channel", desc: "70 curated dividend stocks with live yields & deep reports.", featureKey: "stock_research", minTier: "starter" },
  { icon: "🔍", title: "Stock Research", desc: "AI-powered stock verdicts, technicals & institutional analysis.", featureKey: "stock_research", minTier: "starter" },
  { icon: "🎓", title: "Trading Academy", desc: "27 lessons, drills, flashcards & quizzes across 3 levels.", featureKey: "academy", minTier: "starter" },
  { icon: "📰", title: "Market News", desc: "Live market news, economic calendar & market intelligence.", featureKey: "news", minTier: "free" },
  { icon: "🤖", title: "AI Intelligence", desc: "Ask AI anything about flow, gamma, charts & trade setups.", featureKey: "ai_chat", minTier: "pro" },
  { icon: "📈", title: "Options Flow", desc: "Unusual options activity, sweeps & institutional positioning.", featureKey: "options_flow", minTier: "elite" },
];

const TIER_CONFIG = {
  elite: {
    badge: "✅ ELITE ACCESS ACTIVATED",
    badgeBg: "rgba(34,197,94,0.15)",
    badgeBorder: "rgba(34,197,94,0.4)",
    badgeColor: "#22c55e",
    subtitle: "You have full Elite access to every tool on the platform.",
    footerText: "You have full Elite access to everything above.",
    value: "$149/month",
    cost: "$0 TODAY",
    costColor: "#22c55e",
    costSub: "ELITE MEMBER",
  },
  pro: {
    badge: "⚡ PRO ACCESS ACTIVATED",
    badgeBg: "rgba(168,139,250,0.15)",
    badgeBorder: "rgba(168,139,250,0.4)",
    badgeColor: "#a78bfa",
    subtitle: "You have Pro access. Upgrade to Elite to unlock webhooks, API access & smart money flow.",
    footerText: "Some features require an Elite upgrade.",
    value: "$149/month",
    cost: "PRO PLAN",
    costColor: "#a78bfa",
    costSub: "UPGRADE TO ELITE",
  },
  starter: {
    badge: "🚀 STARTER ACCESS ACTIVATED",
    badgeBg: "rgba(59,130,246,0.15)",
    badgeBorder: "rgba(59,130,246,0.4)",
    badgeColor: "#93c5fd",
    subtitle: "You have Starter access. Upgrade to Pro or Elite to unlock live flow data, GEMX & AI tools.",
    footerText: "Upgrade anytime to unlock more tools.",
    value: "$149/month",
    cost: "STARTER PLAN",
    costColor: "#93c5fd",
    costSub: "UPGRADE TO PRO",
  },
  free: {
    badge: "👋 FREE PLAN ACTIVATED",
    badgeBg: "rgba(156,163,175,0.12)",
    badgeBorder: "rgba(156,163,175,0.3)",
    badgeColor: "#9ca3af",
    subtitle: "You're on the Free plan. Upgrade to access the full TRQX Capital Terminal.",
    footerText: "You're always in control. Upgrade anytime.",
    value: "$149/month",
    cost: "$0",
    costColor: "#22c55e",
    costSub: "FREE FOREVER",
  },
};

const TIER_RANK = { free: 0, starter: 1, pro: 2, elite: 3 };

function getTierBadge(minTier) {
  if (minTier === "free") return null;
  const colors = {
    starter: { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.4)", color: "#93c5fd", label: "STARTER+" },
    pro:     { bg: "rgba(168,139,250,0.15)", border: "rgba(168,139,250,0.4)", color: "#a78bfa", label: "PRO" },
    elite:   { bg: "rgba(201,168,76,0.15)", border: "rgba(201,168,76,0.4)", color: "#FFD700", label: "ELITE" },
  };
  return colors[minTier] || null;
}

export default function Welcome() {
  const navigate = useNavigate();
  const { tier, canAccess } = useAuth();
  const normalizedTier = (tier || "free").toLowerCase();
  const config = TIER_CONFIG[normalizedTier] || TIER_CONFIG.free;
  const userRank = TIER_RANK[normalizedTier] ?? 0;

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
      justifyContent: "flex-start",
      padding: "32px 16px 48px",
      position: "relative",
      overflow: "hidden",
    }}>
      <canvas id="confetti-canvas" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10 }} />

      {/* Tier badge top center */}
      <div style={{
        background: config.badgeBg,
        border: `1px solid ${config.badgeBorder}`,
        borderRadius: "20px",
        padding: "6px 20px",
        fontSize: "13px",
        fontWeight: 700,
        color: config.badgeColor,
        letterSpacing: "1px",
        marginBottom: "24px",
        fontFamily: "var(--font-head)",
        zIndex: 2,
      }}>
        {config.badge}
      </div>

      {/* Three column layout */}
      <div style={{
        width: "100%",
        maxWidth: "1200px",
        display: "grid",
        gridTemplateColumns: "280px 1fr 260px",
        gap: "20px",
        alignItems: "start",
        zIndex: 2,
      }}>

        {/* ── LEFT: Founder Panel ── */}
        <div style={{
          background: "linear-gradient(160deg, #0d1117 0%, #111827 100%)",
          border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            padding: "20px 20px 0",
            textAlign: "center",
          }}>
            <div style={{ color: "var(--text-muted)", fontSize: "10px", letterSpacing: "2px", fontFamily: "var(--font-head)", marginBottom: "4px" }}>WELCOME TO</div>
            <div style={{ color: "var(--gold)", fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-head)", letterSpacing: "2px" }}>TRQX CAPITAL</div>
            <div style={{ width: "40px", height: "2px", background: "var(--gold)", margin: "10px auto", borderRadius: "1px", opacity: 0.5 }} />
          </div>

          {/* Quote */}
          <div style={{ padding: "16px 20px 0", textAlign: "center" }}>
            <div style={{ color: "var(--gold)", fontSize: "24px", lineHeight: 1, marginBottom: "8px", opacity: 0.6 }}>"</div>
            <p style={{
              color: "var(--text-dim)",
              fontSize: "13px",
              lineHeight: 1.7,
              margin: 0,
              fontStyle: "italic",
            }}>
              My mission is simple: help traders think like professionals, manage risk, and execute with precision.
            </p>
          </div>

          {/* Signature */}
          <div style={{ padding: "12px 20px 0", textAlign: "center" }}>
            <div style={{
              fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
              fontSize: "22px",
              color: "var(--gold)",
              marginBottom: "2px",
            }}>Mike Valerio</div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px", letterSpacing: "2px", fontFamily: "var(--font-head)" }}>FOUNDER & CEO</div>
          </div>

          {/* Photo */}
          <div style={{ marginTop: "16px", position: "relative" }}>
            <img
              src="/mike-photo.png"
              alt="Mike Valerio"
              style={{
                width: "100%",
                height: "280px",
                objectFit: "cover",
                objectPosition: "top center",
                display: "block",
              }}
            />
            <div style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              height: "80px",
              background: "linear-gradient(to top, #0d1117, transparent)",
            }} />
          </div>

          {/* Bottom tagline */}
          <div style={{
            padding: "16px 20px 20px",
            textAlign: "center",
            background: "rgba(0,0,0,0.3)",
          }}>
            <div style={{ color: "var(--gold)", fontSize: "16px", fontWeight: 800, fontFamily: "var(--font-head)", letterSpacing: "1px", lineHeight: 1.4 }}>
              Precision.<br />Discipline.<br />Execution.
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px", letterSpacing: "3px", fontFamily: "var(--font-head)", marginTop: "8px" }}>I AM THE ALGO.</div>
          </div>
        </div>

        {/* ── CENTER: Main Card ── */}
        <div style={{
          background: "linear-gradient(160deg, #0d1117 0%, #111827 100%)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: "16px",
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
          {/* Crown + YOU'RE IN */}
          <img
            src="https://thetrulies.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-7-2026-09_11_29-PM.png"
            alt="TRQX Crown"
            style={{
              width: "80px",
              height: "auto",
              filter: "drop-shadow(0 0 20px rgba(255,180,0,0.8))",
              marginBottom: "12px",
              animation: "crown-pulse 3s ease-in-out infinite",
            }}
          />
          <h1 style={{
            fontFamily: "var(--font-head)",
            fontSize: "clamp(48px, 5vw, 72px)",
            fontWeight: 700,
            color: "var(--gold)",
            letterSpacing: "4px",
            margin: "0 0 10px",
            lineHeight: 1,
          }}>YOU'RE IN.</h1>
          <p style={{
            color: "var(--text-dim)",
            fontSize: "15px",
            textAlign: "center",
            maxWidth: "480px",
            lineHeight: 1.6,
            margin: "0 0 28px",
          }}>
            Welcome to the <strong style={{ color: "var(--gold)" }}>TRQX Capital Terminal</strong>. {config.subtitle}
          </p>

          {/* Section label */}
          <div style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ color: "var(--text-muted)", fontSize: "10px", letterSpacing: "3px", fontFamily: "var(--font-head)", whiteSpace: "nowrap" }}>WHAT'S INCLUDED IN YOUR PLAN</div>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Feature Grid */}
          <div style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "20px",
          }}>
            {FEATURES.map((f, i) => {
              const unlocked = canAccess(f.featureKey);
              const badge = getTierBadge(f.minTier);
              const minRank = TIER_RANK[f.minTier] ?? 0;
              const isLocked = userRank < minRank;

              return (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  background: isLocked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isLocked ? "rgba(255,255,255,0.06)" : "rgba(201,168,76,0.2)"}`,
                  borderRadius: "12px",
                  padding: "14px 16px",
                  opacity: isLocked ? 0.6 : 1,
                  position: "relative",
                  minHeight: "80px",
                }}>
                  <div style={{
                    fontSize: "22px",
                    minWidth: "28px",
                    textAlign: "center",
                    marginTop: "2px",
                    filter: isLocked ? "grayscale(1)" : "none",
                  }}>{f.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "var(--font-head)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: isLocked ? "var(--text-dim)" : "var(--text)",
                      marginBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}>
                      {f.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>{f.desc}</div>
                  </div>

                  {/* Tier badge top right */}
                  {isLocked && badge ? (
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                      borderRadius: "6px",
                      padding: "2px 7px",
                      fontSize: "9px",
                      fontWeight: 800,
                      color: badge.color,
                      letterSpacing: "0.5px",
                      fontFamily: "var(--font-head)",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}>
                      🔒 {badge.label}
                    </div>
                  ) : !isLocked ? (
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.3)",
                      borderRadius: "6px",
                      padding: "2px 7px",
                      fontSize: "9px",
                      fontWeight: 800,
                      color: "#22c55e",
                      letterSpacing: "0.5px",
                      fontFamily: "var(--font-head)",
                    }}>
                      ✓ FREE
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Upgrade banner — non-elite only */}
          {normalizedTier !== "elite" && (
            <div
              onClick={() => navigate("/pricing")}
              style={{
                width: "100%",
                background: "rgba(201,168,76,0.07)",
                border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: "12px",
                padding: "13px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>💎</span>
                <div>
                  <div style={{ color: "var(--gold)", fontSize: "13px", fontWeight: 700 }}>Unlock the full terminal</div>
                  <div style={{ color: "var(--text-dim)", fontSize: "11px" }}>Upgrade your plan to access all tools including live flow, GEMX, AI & more.</div>
                </div>
              </div>
              <div style={{ color: "var(--gold)", fontSize: "18px", fontWeight: 700 }}>›</div>
            </div>
          )}

          {/* New to trading banner */}
          <div
            onClick={() => navigate("/academy")}
            style={{
              width: "100%",
              background: "rgba(59,130,246,0.07)",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: "12px",
              padding: "13px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>🏆</span>
              <div>
                <div style={{ color: "#93c5fd", fontSize: "13px", fontWeight: 700 }}>New to trading?</div>
                <div style={{ color: "var(--text-dim)", fontSize: "11px" }}>Start with Academy Level 1 — it sets the foundation for every tool on this platform.</div>
              </div>
            </div>
            <div style={{ color: "#93c5fd", fontSize: "18px", fontWeight: 700 }}>›</div>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              width: "100%",
              padding: "18px",
              background: "linear-gradient(135deg, #C9A84C, #FFD700, #C9A84C)",
              color: "#000",
              border: "none",
              borderRadius: "12px",
              fontFamily: "var(--font-head)",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "2px",
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(201,168,76,0.35)",
            }}
          >
            ENTER TRQX TERMINAL →
          </button>
          <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            🛡️ {config.footerText}
          </div>
        </div>

        {/* ── RIGHT: Path to Mastery ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Path to Mastery card */}
          <div style={{
            background: "linear-gradient(160deg, #0d1117 0%, #111827 100%)",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: "16px",
            padding: "22px 20px",
          }}>
            <div style={{ color: "var(--gold)", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", fontFamily: "var(--font-head)", marginBottom: "20px", textAlign: "center" }}>YOUR PATH TO MASTERY</div>

            {[
              { level: "LEVEL 1", title: "LEARN", color: "#22c55e", desc: "Build a strong foundation with our free tools & Academy lessons.", icon: "🏆" },
              { level: "LEVEL 2", title: "EXECUTE", color: "#a78bfa", desc: "Unlock advanced tools, real-time data & AI intelligence.", icon: "🎯" },
              { level: "LEVEL 3", title: "MASTER", color: "var(--gold)", desc: "Gain full access to professional-grade tools & dominate the market.", icon: "⚡" },
            ].map((lvl, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", marginBottom: i < 2 ? "20px" : 0, position: "relative" }}>
                {/* Connector line */}
                {i < 2 && (
                  <div style={{
                    position: "absolute",
                    left: "19px",
                    top: "40px",
                    width: "2px",
                    height: "28px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "1px",
                  }} />
                )}
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: `${lvl.color}18`,
                  border: `2px solid ${lvl.color}60`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}>
                  {lvl.icon}
                </div>
                <div>
                  <div style={{ color: lvl.color, fontSize: "10px", fontWeight: 800, letterSpacing: "2px", fontFamily: "var(--font-head)" }}>{lvl.level}</div>
                  <div style={{ color: "var(--text)", fontSize: "16px", fontWeight: 800, fontFamily: "var(--font-head)", marginBottom: "4px" }}>{lvl.title}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px", lineHeight: 1.5 }}>{lvl.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Value box */}
          <div style={{
            background: "linear-gradient(160deg, #0d1117 0%, #111827 100%)",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: "16px",
            padding: "22px 20px",
            textAlign: "center",
          }}>
            <div style={{ color: "var(--gold)", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", fontFamily: "var(--font-head)", marginBottom: "8px" }}>INCLUDED VALUE</div>
            <div style={{ color: "var(--text)", fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-head)", marginBottom: "12px" }}>{config.value}</div>
            <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "12px" }} />
            <div style={{ color: "var(--text-muted)", fontSize: "11px", letterSpacing: "1px", fontFamily: "var(--font-head)", marginBottom: "4px" }}>YOUR COST TODAY</div>
            <div style={{ color: config.costColor, fontSize: "32px", fontWeight: 900, fontFamily: "var(--font-head)", lineHeight: 1 }}>{config.cost}</div>
            <div style={{ color: config.costColor, fontSize: "11px", fontWeight: 700, letterSpacing: "2px", fontFamily: "var(--font-head)", marginTop: "4px" }}>{config.costSub}</div>
          </div>

          {/* TRQX logo bottom right */}
          <div style={{
            background: "linear-gradient(160deg, #0d1117 0%, #111827 100%)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "16px",
            padding: "18px 20px",
            textAlign: "center",
          }}>
            <div style={{ color: "var(--gold)", fontSize: "22px", fontWeight: 900, fontFamily: "var(--font-head)", letterSpacing: "4px" }}>TRQX</div>
            <div style={{ color: "var(--text-muted)", fontSize: "9px", fontWeight: 700, letterSpacing: "3px", fontFamily: "var(--font-head)" }}>C A P I T A L</div>
            <div style={{ width: "40px", height: "1px", background: "rgba(201,168,76,0.3)", margin: "10px auto" }} />
            <div style={{ color: "var(--text-muted)", fontSize: "9px", letterSpacing: "2px", fontFamily: "var(--font-head)" }}>PRECISION. DISCIPLINE. EXECUTION.</div>
          </div>
        </div>
      </div>

      {/* Bottom trust bar */}
      <div style={{
        width: "100%",
        maxWidth: "1200px",
        marginTop: "24px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        zIndex: 2,
      }}>
        {[
          { icon: "🚫", title: "NO CREDIT CARD", desc: "No credit card required. Stay free forever." },
          { icon: "⏱", title: "REAL-TIME DATA", desc: "Live market data, news & institutional flow." },
          { icon: "🎯", title: "BUILT FOR TRADERS", desc: "Everything you need to learn, analyze & improve." },
          { icon: "⬆️", title: "UPGRADE ANYTIME", desc: "Unlock more power when you're ready." },
        ].map((t, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}>
            <span style={{ fontSize: "20px", flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ color: "var(--gold)", fontSize: "10px", fontWeight: 800, letterSpacing: "1.5px", fontFamily: "var(--font-head)", marginBottom: "3px" }}>{t.title}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "11px", lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}