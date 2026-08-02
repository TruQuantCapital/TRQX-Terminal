import React, { useEffect, useState } from "react";
import CandlestickChart from "./CandlestickChart";
import RecognitionQuiz from "./RecognitionQuiz";
import "./PatternAcademy.css";

export const PATTERNS = [
  {
    id: "fair-value-gap",
    title: "Fair Value Gap (FVG)",
    level: "Intermediate",
    type: "Market Inefficiency",
    icon: "⚖️",
    definition:
      "An imbalance created when price moves aggressively, leaving a gap between candles where limited trading occurred.",
    insights: [
      "⚖️ Represents an imbalance between buyers and sellers",
      "🧲 Price is often attracted back toward the imbalance",
      "🎯 Traders use the return into the gap as a potential setup",
    ],
    steps: [
      "A strong directional move begins",
      "Three candles move rapidly in the same direction",
      "A gap remains between Candle 1 and Candle 3",
      "Price returns toward the gap to rebalance",
    ],
    takeaway:
      "Fair Value Gaps highlight market imbalance. The setup is not complete until location, trend, and confirmation support the trade.",
    data: [
      { time: "1", close: 106, high: 108, low: 100, open: 102 },
      { time: "2", close: 114, high: 116, low: 104, open: 106 },
      { time: "3", close: 125, high: 128, low: 112, open: 114 },
      { time: "4", close: 133, high: 137, low: 126, open: 125 },
      { time: "5", close: 140, high: 145, low: 124, open: 133 },
      { time: "6", close: 146, high: 151, low: 128, open: 140 },
      { time: "7", close: 135, high: 148, low: 132, open: 146 },
      { time: "8", close: 138, high: 142, low: 130, open: 135 },
    ],
    zones: [
      { name: "FVG Zone", value: 120, color: "#d4af37" },
      { name: "Rebalance", value: 125, color: "#22c55e" },
    ],
  },
  {
    id: "head-shoulders",
    title: "Head & Shoulders Pattern",
    level: "Intermediate",
    type: "Trend Reversal",
    icon: "📊",
    definition:
      "A three-peak formation that may signal weakening bullish momentum and a potential bearish reversal.",
    insights: [
      "📈 The head forms above both shoulders",
      "🚫 A neckline break provides confirmation",
      "🎯 The measured target uses the head-to-neckline distance",
    ],
    steps: [
      "The left shoulder forms",
      "The head forms at a higher price",
      "The right shoulder forms below the head",
      "Price breaks below the neckline",
    ],
    takeaway:
      "The right shoulder alone is not confirmation. The neckline break and follow-through determine whether the reversal is actionable.",
    data: [
      { time: "1", close: 106, high: 108, low: 100, open: 102 },
      { time: "2", close: 114, high: 116, low: 104, open: 106 },
      { time: "3", close: 125, high: 128, low: 112, open: 114 },
      { time: "4", close: 133, high: 137, low: 123, open: 125 },
      { time: "5", close: 128, high: 139, low: 126, open: 133 },
      { time: "6", close: 122, high: 132, low: 119, open: 128 },
      { time: "7", close: 130, high: 132, low: 120, open: 122 },
      { time: "8", close: 143, high: 158, low: 141, open: 130 },
      { time: "9", close: 148, high: 160, low: 145, open: 143 },
    ],
    zones: [
      { name: "Head", value: 137, color: "#ef4444" },
      { name: "Neckline", value: 122, color: "#d4af37" },
    ],
  },
  {
    id: "double-top",
    title: "Double Top Pattern",
    level: "Beginner",
    type: "Trend Reversal",
    icon: "🔝",
    definition:
      "Two failed attempts to break resistance that may indicate buyer exhaustion and a potential bearish reversal.",
    insights: [
      "🔝 Sellers defend the same resistance area twice",
      "⬇️ The neckline break confirms weakness",
      "📉 Selling volume can strengthen confirmation",
    ],
    steps: [
      "The first top is rejected",
      "A pullback creates the neckline",
      "The second top is rejected",
      "Price breaks below the neckline",
    ],
    takeaway:
      "Two tops do not complete the pattern. The neckline break is the confirmation event.",
    data: [
      { time: "1", close: 108, high: 110, low: 100, open: 102 },
      { time: "2", close: 116, high: 118, low: 106, open: 108 },
      { time: "3", close: 128, high: 130, low: 114, open: 116 },
      { time: "4", close: 134, high: 137, low: 126, open: 128 },
      { time: "5", close: 128, high: 138, low: 126, open: 134 },
      { time: "6", close: 119, high: 132, low: 117, open: 128 },
      { time: "7", close: 126, high: 128, low: 119, open: 119 },
      { time: "8", close: 132, high: 134, low: 124, open: 126 },
    ],
    zones: [
      { name: "Resistance", value: 137, color: "#ef4444" },
      { name: "Neckline", value: 130, color: "#d4af37" },
    ],
  },
  {
    id: "double-bottom",
    title: "Double Bottom Pattern",
    level: "Beginner",
    type: "Trend Reversal",
    icon: "🔻",
    definition:
      "Two failed attempts to break support that may indicate seller exhaustion and a potential bullish reversal.",
    insights: [
      "🔻 Buyers defend the same support area twice",
      "⬆️ The neckline break confirms strength",
      "📈 Buying volume can strengthen confirmation",
    ],
    steps: [
      "The first bottom is defended",
      "A bounce creates the neckline",
      "The second bottom is defended",
      "Price breaks above the neckline",
    ],
    takeaway:
      "Two bottoms do not complete the pattern. The neckline breakout and follow-through confirm the reversal.",
    data: [
      { time: "1", close: 126, high: 140, low: 124, open: 138 },
      { time: "2", close: 117, high: 130, low: 115, open: 126 },
      { time: "3", close: 103, high: 121, low: 101, open: 117 },
      { time: "4", close: 102, high: 114, low: 99, open: 103 },
      { time: "5", close: 110, high: 122, low: 100, open: 102 },
      { time: "6", close: 118, high: 129, low: 108, open: 110 },
      { time: "7", close: 116, high: 129, low: 113, open: 118 },
      { time: "8", close: 103, high: 120, low: 101, open: 116 },
    ],
    zones: [
      { name: "Support", value: 107, color: "#22c55e" },
      { name: "Neckline", value: 120, color: "#d4af37" },
    ],
  },
  {
    id: "bull-flag",
    title: "Bull Flag Pattern",
    level: "Intermediate",
    type: "Bullish Continuation",
    icon: "🚩",
    definition:
      "A strong bullish impulse followed by controlled consolidation that may lead to continuation.",
    insights: [
      "📈 The flagpole shows bullish conviction",
      "🔄 The flag represents controlled profit-taking",
      "💥 A tighter consolidation may support a stronger breakout",
    ],
    steps: [
      "A strong bullish flagpole forms",
      "Price begins a controlled pullback",
      "The consolidation tightens",
      "Price breaks above the flag",
    ],
    takeaway:
      "The strongest Bull Flags show high volume during the impulse and lower volume during consolidation.",
    data: [
      { time: "1", close: 108, high: 110, low: 98, open: 100 },
      { time: "2", close: 120, high: 122, low: 106, open: 108 },
      { time: "3", close: 135, high: 137, low: 118, open: 120 },
      { time: "4", close: 148, high: 151, low: 132, open: 135 },
      { time: "5", close: 144, high: 154, low: 142, open: 148 },
      { time: "6", close: 140, high: 148, low: 137, open: 144 },
      { time: "7", close: 142, high: 146, low: 136, open: 140 },
      { time: "8", close: 136, high: 144, low: 133, open: 142 },
      { time: "9", close: 139, high: 141, low: 133, open: 136 },
    ],
    zones: [
      { name: "Flagpole", value: 148, color: "#22c55e" },
      { name: "Flag", value: 140, color: "#d4af37" },
    ],
  },
  {
    id: "ascending-triangle",
    title: "Ascending Triangle Pattern",
    level: "Intermediate",
    type: "Bullish Continuation",
    icon: "📈",
    definition:
      "A pattern with relatively flat resistance and rising support, showing increasingly aggressive buyers.",
    insights: [
      "⬆️ Higher lows show increasing buyer aggression",
      "🔝 Flat resistance represents recurring supply",
      "💪 A confirmed breakout may signal continuation",
    ],
    steps: [
      "Sellers defend a flat resistance level",
      "Buyers establish the first higher low",
      "Additional higher lows compress price",
      "Price breaks above resistance",
    ],
    takeaway:
      "The pattern is incomplete until price closes above resistance with confirmation and acceptable volume.",
    data: [
      { time: "1", close: 108, high: 110, low: 100, open: 102 },
      { time: "2", close: 116, high: 118, low: 106, open: 108 },
      { time: "3", close: 126, high: 128, low: 114, open: 116 },
      { time: "4", close: 124, high: 132, low: 122, open: 126 },
      { time: "5", close: 116, high: 126, low: 114, open: 124 },
      { time: "6", close: 124, high: 126, low: 117, open: 116 },
      { time: "7", close: 129, high: 131, low: 122, open: 124 },
      { time: "8", close: 123, high: 132, low: 121, open: 129 },
    ],
    zones: [
      { name: "Resistance", value: 132, color: "#ef4444" },
      { name: "Rising Support", value: 115, color: "#22c55e" },
    ],
  },
];

const DEFAULT_STATS = {
  mastered: [],
  xp: 0,
  streak: 0,
};

const DEFAULT_SESSION = {
  answered: 0,
  correct: 0,
  xp: 0,
};

function readStoredStats() {
  try {
    const stored = localStorage.getItem("pa_s");

    if (!stored) {
      return DEFAULT_STATS;
    }

    const parsed = JSON.parse(stored);

    return {
      mastered: Array.isArray(parsed.mastered)
        ? parsed.mastered
        : Array.isArray(parsed.m)
          ? parsed.m
          : [],
      xp: Number.isFinite(parsed.xp)
        ? parsed.xp
        : Number.isFinite(parsed.x)
          ? parsed.x
          : 0,
      streak: Number.isFinite(parsed.streak)
        ? parsed.streak
        : Number.isFinite(parsed.st)
          ? parsed.st
          : 0,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

function insightParts(text) {
  const characters = Array.from(text);
  const icon = characters[0] || "•";
  const body = characters.slice(1).join("").trim();

  return { icon, body };
}

export default function PatternAcademy() {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState("practice");
  const [stats, setStats] = useState(readStoredStats);
  const [session, setSession] = useState(DEFAULT_SESSION);

  const pattern = PATTERNS[index];
  const mastered = stats.mastered.includes(pattern.id);

  const sessionAccuracy = session.answered
    ? Math.round((session.correct / session.answered) * 100)
    : 0;

  const masteryProgress = PATTERNS.length
    ? Math.round(
        (stats.mastered.length / PATTERNS.length) * 100
      )
    : 0;

  useEffect(() => {
    localStorage.setItem("pa_s", JSON.stringify(stats));
  }, [stats]);

  function goToPattern(nextIndex) {
    setIndex(
      (nextIndex + PATTERNS.length) % PATTERNS.length
    );
  }

  function goPrevious() {
    goToPattern(index - 1);
  }

  function goNext() {
    goToPattern(index + 1);
  }

  function markMastered() {
    if (mastered) {
      return;
    }

    setStats((current) => ({
      mastered: [...current.mastered, pattern.id],
      xp: current.xp + 250,
      streak: current.streak + 1,
    }));
  }

  function handleRecognitionResult({ correct }) {
    setSession((current) => ({
      answered: current.answered + 1,
      correct: current.correct + (correct ? 1 : 0),
      xp: current.xp + (correct ? 100 : 25),
    }));

    if (correct) {
      setStats((current) => ({
        ...current,
        xp: current.xp + 100,
      }));
    }
  }

  function resetSession() {
    setSession(DEFAULT_SESSION);
    setIndex(0);
  }

  return (
    <main className="pa">
      <div className="pa-mode-switch">
        <div className="pa-mode-buttons">
          <button
            type="button"
            className={mode === "learn" ? "active" : ""}
            onClick={() => setMode("learn")}
          >
            Learn
          </button>

          <button
            type="button"
            className={mode === "practice" ? "active" : ""}
            onClick={() => setMode("practice")}
          >
            Practice
          </button>
        </div>

        <div className="pa-session-score">
          <span>Accuracy: {sessionAccuracy}%</span>
          <span>Answered: {session.answered}</span>
          <span>Session XP: {session.xp}</span>

          {session.answered > 0 ? (
            <button
              type="button"
              className="pa-session-reset"
              onClick={resetSession}
            >
              Reset Session
            </button>
          ) : null}
        </div>
      </div>

      <header className="pa-h">
        <div>
          <div className="pa-b">
            📚 TRQX Pattern Academy
          </div>

          <div className="pa-t">
            <span>{pattern.icon}</span>

            <div>
              <h1>{pattern.title}</h1>

              <div className="pa-m">
                <span>{pattern.level}</span>
                <span>{pattern.type}</span>
                <span>
                  #{index + 1}/{PATTERNS.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pa-s">
          <div>
            <strong>{stats.xp}</strong>
            XP
          </div>

          <div>
            <strong>🔥 {stats.streak}</strong>
            Streak
          </div>

          <div>
            <strong>{stats.mastered.length}</strong>
            Mastered
          </div>
        </div>
      </header>

      {mode === "learn" ? (
        <>
          <section className="pa-d">
            <h3>What is {pattern.title}?</h3>
            <p>{pattern.definition}</p>
          </section>

          <section className="pa-i">
            {pattern.insights.map((text, insightIndex) => {
              const { icon, body } = insightParts(text);

              return (
                <article
                  key={`${pattern.id}-insight-${insightIndex}`}
                  className="pa-ic"
                >
                  <span>{icon}</span>
                  <p>{body}</p>
                </article>
              );
            })}
          </section>
        </>
      ) : null}

      <section className="pa-ch">
        <h3>
          {mode === "practice"
            ? "Identify the Pattern"
            : "📊 Pattern Visualization"}
        </h3>

        <CandlestickChart
          data={pattern.data}
          zones={mode === "learn" ? pattern.zones : []}
        />
      </section>

      {mode === "practice" ? (
        <RecognitionQuiz
          key={`${pattern.id}-${session.answered}`}
          pattern={pattern}
          patterns={PATTERNS}
          onResult={handleRecognitionResult}
          onContinue={goNext}
        />
      ) : (
        <>
          <section className="pa-f">
            <h3>📊 How It Forms</h3>

            <div className="pa-st">
              {pattern.steps.map((text, stepIndex) => (
                <article
                  key={`${pattern.id}-step-${stepIndex}`}
                  className="pa-sc"
                >
                  <div>{stepIndex + 1}</div>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="pa-k">
            <span>💡</span>

            <div>
              <strong>Key Takeaway</strong>
              <p>{pattern.takeaway}</p>
            </div>
          </section>

          <div className="pa-a">
            <button type="button" onClick={goPrevious}>
              ← Previous
            </button>

            <button
              type="button"
              className="pr"
              onClick={markMastered}
              disabled={mastered}
            >
              {mastered ? "✓ Mastered" : "Mark as Mastered"}
            </button>

            <button type="button" onClick={goNext}>
              Next →
            </button>
          </div>
        </>
      )}

      <div
        className="pa-pg"
        role="progressbar"
        aria-label="Pattern mastery progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={masteryProgress}
      >
        <div style={{ width: `${masteryProgress}%` }} />
      </div>
    </main>
  );
}