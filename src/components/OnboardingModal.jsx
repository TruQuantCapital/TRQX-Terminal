import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, TrendingUp, DollarSign, ChevronRight, X } from "lucide-react";

const GOLD = "#d4af37";
const GOLD_DIM = "rgba(212,175,55,0.12)";
const GOLD_BORDER = "rgba(212,175,55,0.3)";
const CARD_BG = "rgba(255,255,255,0.04)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f5f1e8";
const MUTED = "#9ca3af";
const GREEN = "#22c55e";

const STEPS = [
  {
    id: "experience",
    question: "How much trading experience do you have?",
    subtitle: "This helps us point you in the right direction",
    options: [
      { value: "beginner", label: "Complete Beginner", desc: "I'm new to stocks and investing", icon: "🌱" },
      { value: "intermediate", label: "Intermediate Trader", desc: "I trade stocks and understand basic options", icon: "📈" },
      { value: "advanced", label: "Active Options Trader", desc: "I trade options regularly and understand Greeks", icon: "⚡" },
    ],
  },
  {
    id: "goal",
    question: "What's your main goal with TRQX?",
    subtitle: "We'll customize your experience around what matters most to you",
    options: [
      { value: "learn", label: "Learn to Trade", desc: "Build my knowledge from the ground up", icon: "🎓" },
      { value: "setups", label: "Find Trade Setups", desc: "Use flow data and gamma to find high-probability trades", icon: "🎯" },
      { value: "income", label: "Build Passive Income", desc: "Research dividend stocks and build a portfolio", icon: "💰" },
    ],
  },
  {
    id: "time",
    question: "How much time can you dedicate per day?",
    subtitle: "Be honest — consistency beats intensity every time",
    options: [
      { value: "15min", label: "15 Minutes", desc: "Quick daily check-in before work", icon: "⏱" },
      { value: "1hour", label: "About an Hour", desc: "Morning routine before market open", icon: "🕐" },
      { value: "fulltime", label: "Full Time", desc: "I'm actively watching the market", icon: "🖥" },
    ],
  },
];

function getRecommendation(answers) {
  const { experience, goal, time } = answers;

  if (experience === "beginner" || goal === "learn") {
    return {
      title: "Start with the Academy",
      description: "Based on your answers, the best place to start is Level 1 of the TRQX Academy. Build your foundation first — the trading tools will make much more sense once you understand the concepts behind them.",
      steps: [
        "Watch the Welcome video in How To Use",
        "Start Academy Level 1, Lesson 1",
        "Check the Dashboard every morning for market context",
        "Browse Dividend Stocks to understand passive income",
        "Come back to the Flow Scanner after finishing Level 1",
      ],
      primaryPath: "/academy",
      primaryLabel: "Go to Academy →",
      secondaryPath: "/guide",
      secondaryLabel: "Watch How To Use",
      color: "#3b82f6",
    };
  }

  if (goal === "income") {
    return {
      title: "Start with Dividend Stocks",
      description: "Since building passive income is your goal, head to the Dividend Stocks page first. Browse the curated list, run Deep Dive reports on stocks you know, and use the Academy to understand the fundamentals behind each pick.",
      steps: [
        "Open Dividend Stocks and browse by sector",
        "Run a Deep Dive on 3-5 stocks that interest you",
        "Check Stock Research for AI verdicts on your top picks",
        "Complete Academy Level 2 — Introduction to Options",
        "Set up alerts for ex-dividend dates on your watchlist",
      ],
      primaryPath: "/dividends",
      primaryLabel: "Go to Dividend Stocks →",
      secondaryPath: "/research",
      secondaryLabel: "Open Stock Research",
      color: GOLD,
    };
  }

  if (experience === "advanced" || (experience === "intermediate" && goal === "setups")) {
    return {
      title: "Jump into the Trading Tools",
      description: "You're ready for the full terminal. Start with the Options Flow Scanner to see what institutions are doing right now, then use GEMX to understand the gamma environment before placing any trades.",
      steps: [
        "Open Options Flow and watch for large sweeps",
        "Pull up GEMX on SPY and QQQ — find the gamma flip",
        "Set up Discord webhook alerts in Settings",
        "Use the AI chat on GEMX and Research pages for confirmation",
        "Complete Academy Level 3 — Advanced Options Foundation",
      ],
      primaryPath: "/options-flow",
      primaryLabel: "Go to Options Flow →",
      secondaryPath: "/gamma-ex",
      secondaryLabel: "Open GEMX",
      color: GREEN,
    };
  }

  // Default — intermediate + setups
  return {
    title: "Start with the Flow Scanner",
    description: "You have the foundation to use the trading tools. Start by watching the Options Flow for tickers you already follow, then layer in GEMX to understand the market structure around your setups.",
    steps: [
      "Open the Flow Scanner — watch momentum and unusual volume",
      "Pull up Options Flow and filter for Sweeps",
      "Check GEMX on any ticker you're considering trading",
      "Run Stock Research on your watchlist tickers",
      "Complete Academy Level 2 to sharpen your options knowledge",
    ],
    primaryPath: "/scanner",
    primaryLabel: "Go to Flow Scanner →",
    secondaryPath: "/options-flow",
    secondaryLabel: "Open Options Flow",
    color: GREEN,
  };
}

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const recommendation = showResult ? getRecommendation(answers) : null;

  function handleSelect(value) {
    setSelected(value);
  }

  function handleNext() {
    if (!selected) return;
    const newAnswers = { ...answers, [currentStep.id]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (isLastStep) {
      setShowResult(true);
    } else {
      setStep(s => s + 1);
    }
  }

  function handleNavigate(path) {
    localStorage.setItem("trqx_onboarding_complete", "true");
    onClose();
    navigate(path);
  }

  function handleSkip() {
    localStorage.setItem("trqx_onboarding_complete", "true");
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "580px", background: "#0b1420", border: `1px solid ${GOLD_BORDER}`, borderRadius: "20px", padding: "40px", position: "relative" }}>

        {/* Skip button */}
        <button onClick={handleSkip} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.06)", border: `1px solid ${CARD_BORDER}`, borderRadius: "8px", padding: "8px 14px", color: MUTED, fontSize: "12px", cursor: "pointer" }}>
          Skip for now
        </button>

        {!showResult ? (
          <>
            {/* Progress dots */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{ width: i === step ? "24px" : "8px", height: "8px", borderRadius: "4px", background: i <= step ? GOLD : "rgba(255,255,255,0.15)", transition: "all 0.3s" }} />
              ))}
            </div>

            {/* Logo */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ color: GOLD, fontSize: "11px", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>TRQX Capital</div>
              <div style={{ color: MUTED, fontSize: "13px" }}>Step {step + 1} of {STEPS.length}</div>
            </div>

            {/* Question */}
            <h2 style={{ color: TEXT, fontSize: "22px", fontWeight: "800", margin: "0 0 8px", lineHeight: "1.3" }}>{currentStep.question}</h2>
            <p style={{ color: MUTED, fontSize: "14px", margin: "0 0 28px", lineHeight: "1.5" }}>{currentStep.subtitle}</p>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {currentStep.options.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  style={{
                    background: selected === option.value ? GOLD_DIM : CARD_BG,
                    border: `2px solid ${selected === option.value ? GOLD : CARD_BORDER}`,
                    borderRadius: "12px", padding: "16px 20px",
                    cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", gap: "16px",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: "24px", flexShrink: 0 }}>{option.icon}</span>
                  <div>
                    <div style={{ color: selected === option.value ? GOLD : TEXT, fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>{option.label}</div>
                    <div style={{ color: MUTED, fontSize: "13px" }}>{option.desc}</div>
                  </div>
                  {selected === option.value && (
                    <div style={{ marginLeft: "auto", width: "20px", height: "20px", borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "#000", fontSize: "12px", fontWeight: "900" }}>✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={!selected}
              style={{
                width: "100%", padding: "16px",
                background: selected ? GOLD_DIM : "rgba(255,255,255,0.03)",
                border: `1px solid ${selected ? GOLD_BORDER : CARD_BORDER}`,
                borderRadius: "12px",
                color: selected ? GOLD : MUTED,
                fontSize: "15px", fontWeight: "800",
                cursor: selected ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "all 0.2s",
              }}
            >
              {isLastStep ? "Get My Recommendation" : "Next"}
              <ChevronRight size={18} />
            </button>
          </>
        ) : (
          <>
            {/* Result */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎯</div>
              <div style={{ color: GOLD, fontSize: "11px", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Your Personalized Path</div>
              <h2 style={{ color: TEXT, fontSize: "24px", fontWeight: "900", margin: "0 0 12px" }}>{recommendation.title}</h2>
              <p style={{ color: MUTED, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>{recommendation.description}</p>
            </div>

            {/* Steps */}
            <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: "14px", padding: "20px", marginBottom: "24px" }}>
              <div style={{ color: MUTED, fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>Your First 7 Days</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {recommendation.steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: `${recommendation.color}20`, border: `1px solid ${recommendation.color}60`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                      <span style={{ color: recommendation.color, fontSize: "11px", fontWeight: "800" }}>{i + 1}</span>
                    </div>
                    <span style={{ color: TEXT, fontSize: "13px", lineHeight: "1.5" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => handleNavigate(recommendation.primaryPath)}
                style={{ width: "100%", padding: "16px", background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "12px", color: GOLD, fontSize: "15px", fontWeight: "800", cursor: "pointer" }}
              >
                {recommendation.primaryLabel}
              </button>
              <button
                onClick={() => handleNavigate(recommendation.secondaryPath)}
                style={{ width: "100%", padding: "14px", background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: "12px", color: TEXT, fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
              >
                {recommendation.secondaryLabel}
              </button>
              <button
                onClick={handleSkip}
                style={{ width: "100%", padding: "12px", background: "none", border: "none", color: MUTED, fontSize: "13px", cursor: "pointer" }}
              >
                I'll explore on my own
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
