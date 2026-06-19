import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://trqx-flow-scanner-production.up.railway.app";

// Pull the Supabase access token from localStorage (default sb-* auth key)
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

// Fire-and-forget: backend dedupes via welcome_sent, so this can never double-send
function triggerWelcomeEmail(attempt = 0) {
  const token = getAccessToken();
  if (!token) {
    // Session may not be written to localStorage yet right after signup — retry briefly
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

const STEPS = [
  {
    icon: "📊",
    title: "Explore the Flow Scanner",
    desc: "See live institutional options flow, top contracts, and unusual activity in real time.",
    action: "scanner",
  },
  {
    icon: "🤖",
    title: "Learn to read the flow",
    desc: "Use the Ask AI feature to break down any trade — just ask what a sweep or block means.",
    action: "ai",
  },
  {
    icon: "💬",
    title: "Join the community",
    desc: "Connect with traders sharing ideas and setups in the TRQX Discord.",
    action: "discord",
  },
];

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    confetti();
    triggerWelcomeEmail();
  }, []);

  const handleStep = (action) => {
    if (action === "scanner") navigate("/scanner");
    else if (action === "ai") window.open("https://thetrulies.com/wp-content/uploads/2026/06/TRQX-Flow-Scanner-User-Guide.pdf", "_blank");
    else if (action === "discord") window.open("https://discord.gg/jy3ta9qkfH", "_blank");
  };

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
      <canvas id="confetti-canvas" style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:10 }} />

      {/* Trial badge */}
      <div style={{
        background: "rgba(34,197,94,0.15)",
        border: "1px solid rgba(34,197,94,0.4)",
        borderRadius: "20px",
        padding: "6px 18px",
        fontSize: "13px",
        fontWeight: 700,
        color: "#22c55e",
        letterSpacing: "1px",
        marginBottom: "28px",
        fontFamily: "var(--font-head)",
      }}>
        ✅ ELITE ACCESS ACTIVATED
      </div>

      {/* Hero */}
      <div style={{ textAlign:"center", marginBottom:"40px" }}>
        <div style={{ marginBottom:"16px" }}>
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
          fontSize: "16px",
          marginTop: "12px",
          maxWidth: "420px",
        }}>
          Welcome to TRQX Flow Scanner. You now have access to institutional-grade options flow data.
        </p>
      </div>

      {/* Steps */}
      <div style={{
        width: "100%",
        maxWidth: "560px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginBottom: "32px",
      }}>
        <div style={{
          fontFamily: "var(--font-head)",
          fontSize: "11px",
          letterSpacing: "3px",
          color: "var(--text-muted)",
          marginBottom: "4px",
          textAlign: "center",
        }}>GET STARTED IN 3 STEPS</div>

        {STEPS.map((s, i) => (
          <div
            key={i}
            onClick={() => handleStep(s.action)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "var(--black-3)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "16px 20px",
              cursor: "pointer",
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
              e.currentTarget.style.background = "var(--black-4)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)";
              e.currentTarget.style.background = "var(--black-3)";
            }}
          >
            <div style={{ fontSize:"28px", minWidth:"36px", textAlign:"center" }}>{s.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"var(--font-head)", fontSize:"16px", fontWeight:700, color:"var(--text)", marginBottom:"3px" }}>{s.title}</div>
              <div style={{ fontSize:"13px", color:"var(--text-dim)", lineHeight:1.5 }}>{s.desc}</div>
            </div>
            <div style={{ color:"var(--gold)", fontSize:"20px", fontWeight:700 }}>›</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate("/scanner")}
        style={{
          width: "100%",
          maxWidth: "560px",
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
        GO TO SCANNER →
      </button>

      <div style={{ marginTop:"12px", fontSize:"12px", color:"var(--text-muted)" }}>
        Cancel anytime · No contracts
      </div>
    </div>
  );
}
