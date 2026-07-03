import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const GOLD = "#d4af37";
const TEAL = "#26a69a";
const RED = "#ef5350";
const API = import.meta.env.VITE_API_URL || "https://trqx-flow-scanner-production.up.railway.app";

const STORAGE_KEY = "trqx_morning_coach_date";

export default function MorningCoach() {
  const { tier, getToken, canAccess } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coach, setCoach] = useState(null);
  const [error, setError] = useState(null);

  const hasAccess = canAccess("morning_coach");

  useEffect(() => {
    if (!hasAccess) return;
    // Only show once per day
    const today = new Date().toISOString().slice(0, 10);
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen !== today) {
      setVisible(true);
      fetchCoach();
    }
  }, [hasAccess]);

  async function fetchCoach() {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/morning-coach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to load morning coach");
      const data = await res.json();
      setCoach(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function dismiss() {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEY, today);
    setVisible(false);
  }

  if (!visible || !hasAccess) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={dismiss} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        zIndex: 3000, backdropFilter: "blur(4px)"
      }} />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%", maxWidth: 620,
        background: "#0b1420",
        border: `1px solid ${GOLD}40`,
        borderRadius: 20, padding: "32px 36px",
        zIndex: 3001, maxHeight: "90vh", overflowY: "auto",
      }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ color: GOLD, fontSize: 10, fontWeight: 800, letterSpacing: 3, marginBottom: 6 }}>
              TRQX CAPITAL · MORNING COACH
            </div>
            <div style={{ color: "#f5f1e8", fontSize: 22, fontWeight: 900 }}>
              {coach?.date || new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {coach?.isOpEx && (
              <span style={{ background: `${RED}20`, border: `1px solid ${RED}50`, color: RED, fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 6, letterSpacing: 1 }}>
                ⚡ OPEX
              </span>
            )}
            {coach?.sentiment && (
              <span style={{
                background: coach.sentiment === "Bullish" ? `${TEAL}20` : `${RED}20`,
                border: `1px solid ${coach.sentiment === "Bullish" ? TEAL : RED}50`,
                color: coach.sentiment === "Bullish" ? TEAL : RED,
                fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 6, letterSpacing: 1
              }}>
                {coach.sentiment === "Bullish" ? "🟢" : "🔴"} FLOW {coach.sentiment?.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{
              width: 40, height: 40,
              border: `3px solid rgba(212,175,55,0.2)`,
              borderTopColor: GOLD, borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite"
            }} />
            <div style={{ color: "#9ca3af", fontSize: 14 }}>Your coach is preparing your briefing...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ color: RED, fontSize: 14, textAlign: "center", padding: "20px 0" }}>
            {error}
            <br />
            <button onClick={fetchCoach} style={{ marginTop: 12, background: "none", border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontWeight: 700 }}>
              Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {coach && !loading && (
          <div style={{ display: "grid", gap: 20 }}>

            {/* Greeting */}
            <div style={{ color: "#f5f1e8", fontSize: 17, fontWeight: 600, lineHeight: 1.65, borderLeft: `3px solid ${GOLD}`, paddingLeft: 16 }}>
              {coach.greeting}
            </div>

            {/* High impact events banner */}
            {coach.highImpactEvents?.length > 0 && (
              <div style={{ background: `${RED}10`, border: `1px solid ${RED}30`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ color: RED, fontSize: 10, fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>⚠️ HIGH IMPACT EVENTS TODAY</div>
                {coach.highImpactEvents.map((e, i) => (
                  <div key={i} style={{ color: "#f5f1e8", fontSize: 13, fontWeight: 600 }}>
                    {e.time} — {e.event}
                  </div>
                ))}
              </div>
            )}

            {/* Market Brief */}
            <div>
              <div style={{ color: GOLD, fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>MARKET BRIEF</div>
              <div style={{ color: "#d1d5db", fontSize: 14, lineHeight: 1.75 }}>{coach.marketBrief}</div>
            </div>

            {/* Game Plan */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ color: TEAL, fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>TODAY'S GAME PLAN</div>
              <div style={{ color: "#d1d5db", fontSize: 14, lineHeight: 1.8 }}>{coach.gamePlan}</div>
            </div>

            {/* Mindset */}
            <div style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}25`, borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ color: GOLD, fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>MINDSET</div>
              <div style={{ color: "#f5f1e8", fontSize: 14, fontWeight: 600, lineHeight: 1.7, fontStyle: "italic" }}>"{coach.mindset}"</div>
            </div>

            {/* Platform Reminders */}
            <div>
              <div style={{ color: "#9ca3af", fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>PLATFORM REMINDERS</div>
              <div style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.7 }}>{coach.platformReminders}</div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#4b5563", fontSize: 11 }}>Shows once per day · Pro & Elite only</div>
          <button onClick={dismiss} style={{
            background: GOLD, border: "none", borderRadius: 10,
            color: "#000", fontWeight: 800, fontSize: 14,
            padding: "12px 28px", cursor: "pointer",
          }}>
            Let's Trade 🔥
          </button>
        </div>
      </div>
    </>
  );
}