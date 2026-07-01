import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const GOLD = "#d4af37";
const TEAL = "#26a69a";
const RED = "#ef5350";
const PURPLE = "#a78bfa";
const API = import.meta.env.VITE_API_URL || "https://trqx-flow-scanner-production.up.railway.app";

const STEPS = [
  { key: "amount", title: "How much capital are you starting with?" },
  { key: "goal", title: "What's your goal?" },
  { key: "target", title: "What's your target, and over what timeframe?" }, // conditional
  { key: "horizon", title: "How long can this money stay invested?" },
  { key: "sectors", title: "Any sector preference?" },
  { key: "lossReaction", title: "How would you feel if this lost 30% of its value?" },
];

const GOAL_OPTIONS = [
  { id: "steady", label: "Steady, lower-risk growth", desc: "Capital preservation matters more than big swings" },
  { id: "balanced", label: "Balanced growth", desc: "Some volatility is fine for better long-term returns" },
  { id: "aggressive", label: "Aggressive growth", desc: "I can handle big swings for bigger upside" },
  { id: "target", label: "I have a specific target", desc: "e.g. \"double it\" or \"triple it\" by a certain time" },
];

const HORIZON_OPTIONS = [
  { id: "days", label: "Days to weeks", desc: "Swing trades, short-term moves" },
  { id: "months", label: "A few months", desc: "Medium-term positioning" },
  { id: "year", label: "6-12 months", desc: "Letting positions develop" },
  { id: "long", label: "1+ years", desc: "Long-term hold" },
];

const SECTOR_OPTIONS = ["Technology", "Healthcare", "Energy", "Financials", "Consumer", "Industrials", "Crypto/Fintech", "No preference"];

const LOSS_OPTIONS = [
  { id: "panic", label: "I'd panic and want to sell", risk: "Low" },
  { id: "uncomfortable", label: "I'd be uncomfortable but hold", risk: "Moderate" },
  { id: "fine", label: "I'm fine with it — that's the game", risk: "High" },
];

export default function CapitalAllocatorPage() {
  const { canAccess, getToken } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    amount: "",
    goal: null,
    targetGoal: "",
    targetTimeframe: "",
    horizon: null,
    sectors: [],
    lossReaction: null,
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const hasAccess = canAccess("trade_plan");

  // Build the visible step list — skip "target" unless goal === "target"
  const visibleSteps = STEPS.filter(s => s.key !== "target" || answers.goal === "target");
  const currentStepKey = visibleSteps[step]?.key;

  function update(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  function toggleSector(sector) {
    setAnswers(prev => {
      const has = prev.sectors.includes(sector);
      if (sector === "No preference") return { ...prev, sectors: has ? [] : ["No preference"] };
      const withoutNoPref = prev.sectors.filter(s => s !== "No preference");
      return { ...prev, sectors: has ? withoutNoPref.filter(s => s !== sector) : [...withoutNoPref, sector] };
    });
  }

  function canProceed() {
    switch (currentStepKey) {
      case "amount": return Number(answers.amount) >= 50;
      case "goal": return !!answers.goal;
      case "target": return answers.targetGoal.trim().length > 0 && answers.targetTimeframe.trim().length > 0;
      case "horizon": return !!answers.horizon;
      case "sectors": return true; // optional
      case "lossReaction": return !!answers.lossReaction;
      default: return false;
    }
  }

  function goNext() {
    if (step < visibleSteps.length - 1) {
      setStep(step + 1);
    } else {
      generatePlan();
    }
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  async function generatePlan() {
    setLoading(true);
    setError(null);
    setPlan(null);
    setFeedback(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/capital-allocator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(answers),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate plan");
      }
      const data = await res.json();
      setPlan(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setStep(0);
    setAnswers({ amount: "", goal: null, targetGoal: "", targetTimeframe: "", horizon: null, sectors: [], lossReaction: null });
    setPlan(null);
    setError(null);
    setFeedback(null);
  }

  async function sendFeedback(helpful) {
    setFeedback(helpful);
    try {
      const token = await getToken();
      await fetch(`${API}/api/capital-allocator/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ helpful, planId: plan?.planId }),
      });
    } catch {}
  }

  if (!hasAccess) {
    return (
      <main className="pageStack" style={{ maxWidth: 700, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h1 style={{ marginBottom: 12 }}>Capital Allocator</h1>
        <p style={{ color: "#9ca3af", marginBottom: 24 }}>
          This feature is available on Pro and Elite plans. Get a personalized, AI-generated investment plan based on your capital, goals, and risk tolerance — built from real-time market data.
        </p>
        <button style={{ background: GOLD, border: "none", borderRadius: 10, color: "#000", fontWeight: 800, padding: "14px 32px", fontSize: 14, cursor: "pointer" }}>
          Upgrade to Pro
        </button>
      </main>
    );
  }

  return (
    <main className="pageStack" style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px 60px" }}>
      <section className="pageHeader" style={{ marginBottom: 24 }}>
        <p style={{ color: GOLD, fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>TRQX CAPITAL</p>
        <h1 style={{ margin: "4px 0 8px" }}>Capital Allocator</h1>
        <span style={{ color: "#9ca3af" }}>
          Tell us your capital and goals. We'll build a personalized, real-time investment plan — stock picks, position sizing, and an honest read on your timeframe.
        </span>
      </section>

      {!plan && !loading && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "32px 28px" }}>
          {/* Progress bar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {visibleSteps.map((s, i) => (
              <div key={s.key} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? GOLD : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
            ))}
          </div>

          <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
            STEP {step + 1} OF {visibleSteps.length}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: "#f5f1e8" }}>
            {visibleSteps[step]?.title}
          </h2>

          {/* AMOUNT */}
          {currentStepKey === "amount" && (
            <div>
              <div style={{ position: "relative", marginBottom: 8 }}>
                <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: GOLD, fontSize: 24, fontWeight: 800 }}>$</span>
                <input
                  type="number"
                  value={answers.amount}
                  onChange={e => update("amount", e.target.value)}
                  placeholder="1,000"
                  autoFocus
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "#fff", fontSize: 28, fontWeight: 800, padding: "18px 18px 18px 38px", outline: "none" }}
                />
              </div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>Minimum $50. This is illustrative — we won't execute any trades.</div>
            </div>
          )}

          {/* GOAL */}
          {currentStepKey === "goal" && (
            <div style={{ display: "grid", gap: 10 }}>
              {GOAL_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => update("goal", opt.id)}
                  style={{ textAlign: "left", background: answers.goal === opt.id ? `${GOLD}15` : "rgba(255,255,255,0.03)", border: `1.5px solid ${answers.goal === opt.id ? GOLD : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer" }}>
                  <div style={{ color: answers.goal === opt.id ? GOLD : "#f5f1e8", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ color: "#9ca3af", fontSize: 13 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* TARGET (conditional) */}
          {currentStepKey === "target" && (
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ color: "#9ca3af", fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block" }}>What's your target?</label>
                <input
                  value={answers.targetGoal}
                  onChange={e => update("targetGoal", e.target.value)}
                  placeholder='e.g. "Triple it" or "Turn $1,000 into $3,000"'
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "#fff", fontSize: 15, padding: "14px 16px", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ color: "#9ca3af", fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block" }}>Over what timeframe?</label>
                <input
                  value={answers.targetTimeframe}
                  onChange={e => update("targetTimeframe", e.target.value)}
                  placeholder='e.g. "3 months" or "by end of year"'
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "#fff", fontSize: 15, padding: "14px 16px", outline: "none" }}
                />
              </div>
              <div style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 10, padding: "12px 14px", color: GOLD, fontSize: 12, lineHeight: 1.6 }}>
                Heads up — we'll give you an honest read on whether this target is realistic for the risk it implies, not just a list of stocks.
              </div>
            </div>
          )}

          {/* HORIZON */}
          {currentStepKey === "horizon" && (
            <div style={{ display: "grid", gap: 10 }}>
              {HORIZON_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => update("horizon", opt.id)}
                  style={{ textAlign: "left", background: answers.horizon === opt.id ? `${GOLD}15` : "rgba(255,255,255,0.03)", border: `1.5px solid ${answers.horizon === opt.id ? GOLD : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer" }}>
                  <div style={{ color: answers.horizon === opt.id ? GOLD : "#f5f1e8", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ color: "#9ca3af", fontSize: 13 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* SECTORS */}
          {currentStepKey === "sectors" && (
            <div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {SECTOR_OPTIONS.map(sector => {
                  const active = answers.sectors.includes(sector);
                  return (
                    <button key={sector} onClick={() => toggleSector(sector)}
                      style={{ background: active ? `${TEAL}18` : "rgba(255,255,255,0.04)", border: `1.5px solid ${active ? TEAL : "rgba(255,255,255,0.12)"}`, borderRadius: 24, color: active ? TEAL : "#9ca3af", fontWeight: 700, fontSize: 13, padding: "10px 18px", cursor: "pointer" }}>
                      {sector}
                    </button>
                  );
                })}
              </div>
              <div style={{ color: "#6b7280", fontSize: 12, marginTop: 14 }}>Optional — skip if you're open to anything.</div>
            </div>
          )}

          {/* LOSS REACTION */}
          {currentStepKey === "lossReaction" && (
            <div style={{ display: "grid", gap: 10 }}>
              {LOSS_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => update("lossReaction", opt.id)}
                  style={{ textAlign: "left", background: answers.lossReaction === opt.id ? `${GOLD}15` : "rgba(255,255,255,0.03)", border: `1.5px solid ${answers.lossReaction === opt.id ? GOLD : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer" }}>
                  <div style={{ color: answers.lossReaction === opt.id ? GOLD : "#f5f1e8", fontWeight: 700, fontSize: 15 }}>{opt.label}</div>
                </button>
              ))}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            {step > 0 && (
              <button onClick={goBack} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#9ca3af", fontWeight: 700, padding: "14px 24px", cursor: "pointer" }}>
                ← Back
              </button>
            )}
            <button onClick={goNext} disabled={!canProceed()}
              style={{ flex: 1, background: canProceed() ? GOLD : "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, color: canProceed() ? "#000" : "#6b7280", fontWeight: 800, padding: "14px 24px", cursor: canProceed() ? "pointer" : "not-allowed", fontSize: 15 }}>
              {step === visibleSteps.length - 1 ? "Generate My Plan" : "Continue →"}
            </button>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ width: 48, height: 48, border: `3px solid rgba(212,175,55,0.2)`, borderTopColor: GOLD, borderRadius: "50%", margin: "0 auto 20px", animation: "spin 1s linear infinite" }} />
          <div style={{ color: "#f5f1e8", fontWeight: 700, marginBottom: 6 }}>Building your plan...</div>
          <div style={{ color: "#9ca3af", fontSize: 13 }}>Analyzing live market data across hundreds of tickers</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div style={{ background: "rgba(239,83,80,0.08)", border: "1px solid rgba(239,83,80,0.3)", borderRadius: 12, padding: "20px", color: RED, marginTop: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Something went wrong</div>
          <div style={{ fontSize: 13, marginBottom: 14 }}>{error}</div>
          <button onClick={generatePlan} style={{ background: RED, border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, padding: "10px 20px", cursor: "pointer" }}>Try Again</button>
        </div>
      )}

      {/* PLAN RESULT */}
      {plan && (
        <div>
          {/* Disclaimer banner — always visible, not buried */}
          <div style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 20, color: GOLD, fontSize: 13, lineHeight: 1.6 }}>
            <strong>Educational illustration only.</strong> This is not personalized financial advice and TRQX Capital is not a registered investment advisor. Markets carry real risk of loss, including total loss of capital. Always do your own research before investing.
          </div>

          {/* Target reality check, if applicable */}
          {plan.realityCheck && (
            <div style={{ background: "rgba(239,83,80,0.06)", border: "1px solid rgba(239,83,80,0.25)", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ color: RED, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>⚠️ REALITY CHECK</div>
              <div style={{ color: "#f5f1e8", fontSize: 14, lineHeight: 1.7 }}>{plan.realityCheck}</div>
            </div>
          )}

          {/* Summary header */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 26px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
              <div>
                <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>YOUR PLAN</div>
                <div style={{ color: "#f5f1e8", fontSize: 24, fontWeight: 900 }}>${Number(answers.amount).toLocaleString()} · {plan.riskTier} Risk</div>
              </div>
              <div style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}40`, borderRadius: 10, padding: "8px 16px" }}>
                <div style={{ color: "#9ca3af", fontSize: 10, fontWeight: 700 }}>TIMEFRAME ESTIMATE</div>
                {plan.cashRemaining > 0 && (
                <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 10 }}>
              💵 <strong style={{ color: "#f5f1e8" }}>${plan.cashRemaining}</strong> remaining cash after position sizing
                </div>
                )}
                <div style={{ color: GOLD, fontSize: 14, fontWeight: 800 }}>{plan.timeframeEstimate}</div>
              </div>
            </div>
            <div style={{ color: "#d1d5db", fontSize: 14, lineHeight: 1.7 }}>{plan.summary}</div>
          </div>

          {/* Stock list */}
          <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
            {plan.allocations?.map((stock, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#f5f1e8", fontSize: 18, fontWeight: 900 }}>{stock.ticker}</span>
                    <span style={{ color: "#9ca3af", fontSize: 13 }}>{stock.name}</span>
                    <span style={{ background: "rgba(38,166,154,0.12)", border: "1px solid rgba(38,166,154,0.3)", color: TEAL, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{stock.sector}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#f5f1e8", fontSize: 15, fontWeight: 800 }}>{stShow cash remainingock.shares} shares</div>
                    <div style={{ color: "#9ca3af", fontSize: 12 }}>${stock.price} · ${stock.dollarAmount} total</div>
                  </div>
                </div>
                <div style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6 }}>{stock.reasoning}</div>
              </div>
            ))}
          </div>

          {/* Sector breakdown */}
          {plan.sectorBreakdown && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>SECTOR BREAKDOWN</div>
              {Object.entries(plan.sectorBreakdown).map(([sector, pct]) => (
                <div key={sector} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "#d1d5db" }}>{sector}</span>
                    <span style={{ color: GOLD, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: GOLD, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Feedback */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <span style={{ color: "#9ca3af", fontSize: 13 }}>Was this plan helpful?</span>
            <button onClick={() => sendFeedback(true)} style={{ background: feedback === true ? `${TEAL}25` : "rgba(255,255,255,0.05)", border: `1px solid ${feedback === true ? TEAL : "rgba(255,255,255,0.12)"}`, borderRadius: 8, padding: "6px 14px", color: feedback === true ? TEAL : "#9ca3af", cursor: "pointer" }}>👍 Yes</button>
            <button onClick={() => sendFeedback(false)} style={{ background: feedback === false ? `${RED}25` : "rgba(255,255,255,0.05)", border: `1px solid ${feedback === false ? RED : "rgba(255,255,255,0.12)"}`, borderRadius: 8, padding: "6px 14px", color: feedback === false ? RED : "#9ca3af", cursor: "pointer" }}>👎 No</button>
          </div>

          <button onClick={startOver} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#f5f1e8", fontWeight: 700, padding: "14px 28px", cursor: "pointer" }}>
            ↺ Build a New Plan
          </button>
        </div>
      )}
    </main>
  );
}