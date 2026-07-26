import React, { useState } from "react";
import "./PatternAcademy.css";

const PATTERNS = [
  {
    id: "fair-value-gap",
    title: "Fair Value Gap (FVG)",
    level: "Intermediate",
    type: "Market Inefficiency",
    icon: "⚖️",
    definition: "An imbalance created when price moves aggressively, leaving a gap between candles where no trading occurred.",
    insights: [
      "⚖️ Represents inefficiency between buyers and sellers",
      "🧲 Price naturally attracted to rebalance these gaps",
      "🎯 Used by Smart Money for high-probability entries"
    ],
    steps: [
      "Strong directional move begins",
      "Three candles move rapidly in same direction",
      "Gap created between candle 1 high and candle 3 low",
      "Price returns to rebalance — setup triggered"
    ],
    takeaway: "FVGs highlight market inefficiencies. Price seeks balance, so returns to these gaps before continuing."
  },
  {
    id: "head-shoulders",
    title: "Head & Shoulders Pattern",
    level: "Intermediate",
    type: "Trend Reversal",
    icon: "📊",
    definition: "Three peaks (left shoulder, head, right shoulder) that show declining momentum and signal downtrend reversal.",
    insights: [
      "📈 Each peak weaker — declining momentum visible",
      "🚫 Neckline break confirms sellers control market",
      "🎯 Target measured from head to neckline"
    ],
    steps: [
      "Left shoulder forms — traders take profits",
      "Head peaks higher — but fails to sustain",
      "Right shoulder lower — momentum clearly declining",
      "Neckline breaks — reversal confirmed"
    ],
    takeaway: "H&S marks exhaustion. Right shoulder must be lower. Volume confirms reliability."
  },
  {
    id: "double-top",
    title: "Double Top Pattern",
    level: "Beginner",
    type: "Trend Reversal",
    icon: "🔝",
    definition: "Two failed attempts to break resistance at same level signal trend exhaustion and reversal.",
    insights: [
      "🔝 Sellers defended same resistance twice",
      "⬇️ Neckline support is real signal point",
      "📉 Volume on breakdown confirms institutional selling"
    ],
    steps: [
      "First top rejected at resistance",
      "Pullback creates neckline valley",
      "Second top rejected at same level",
      "Neckline breaks — pattern confirmed"
    ],
    takeaway: "Double tops show supply. Break below neckline with volume = confirmed signal."
  },
  {
    id: "double-bottom",
    title: "Double Bottom Pattern",
    level: "Beginner",
    type: "Trend Reversal",
    icon: "🔻",
    definition: "Two failed attempts to break support signal capitulation and reversal to uptrend.",
    insights: [
      "🔻 Buyers defended same support twice",
      "⬆️ Neckline resistance is breakout point",
      "📈 Volume spike confirms bullish continuation"
    ],
    steps: [
      "First bottom tested",
      "Bounce creates neckline peak",
      "Second bottom tested again",
      "Neckline breaks up — reversal confirmed"
    ],
    takeaway: "Double bottoms show demand. Breakout above neckline with volume = strong signal."
  },
  {
    id: "bull-flag",
    title: "Bull Flag Pattern",
    level: "Intermediate",
    type: "Bullish Continuation",
    icon: "🚩",
    definition: "Strong bullish impulse followed by consolidation. Most reliable continuation pattern (70%+ success rate).",
    insights: [
      "📈 Flagpole shows strong directional conviction",
      "🔄 Flag is profit-taking, lower volume expected",
      "💥 Tighter flag = more explosive breakout"
    ],
    steps: [
      "Flagpole: Strong bullish impulse",
      "Flag forms: Controlled pullback begins",
      "Consolidation: Range tightens",
      "Breakout: Price breaks above flag"
    ],
    takeaway: "Flags are 70%+ reliable. Lower flag volume than flagpole. Tighter = more explosive."
  },
  {
    id: "bear-flag",
    title: "Bear Flag Pattern",
    level: "Intermediate",
    type: "Bearish Continuation",
    icon: "🚩",
    definition: "Strong bearish impulse followed by weak bounce, then continuation lower.",
    insights: [
      "📉 Flagpole shows strong bearish conviction",
      "🤔 Bounce is weak — short-covering, not buying",
      "💥 Breakdown continues downtrend"
    ],
    steps: [
      "Flagpole: Strong bearish impulse",
      "Flag forms: Weak bounce recovery",
      "Consolidation: Range tightens",
      "Breakdown: Price breaks below flag"
    ],
    takeaway: "Bear flags continue downtrends reliably. Weak bounce volume. Breakdown confirms."
  },
  {
    id: "ascending-triangle",
    title: "Ascending Triangle Pattern",
    level: "Intermediate",
    type: "Bullish Continuation",
    icon: "📈",
    definition: "Flat resistance with rising support. Rising lows show increasing buyer aggression.",
    insights: [
      "⬆️ Higher lows show buyers more aggressive",
      "🔝 Flat resistance = sellers holding level",
      "💪 Breakout above = strong bullish signal"
    ],
    steps: [
      "Sellers defend flat resistance level",
      "First higher low appears",
      "Buyers become more aggressive each bounce",
      "Breakout above resistance confirmed"
    ],
    takeaway: "Ascending triangles are bullish. Each low higher = mounting demand. Buyers winning."
  },
  {
    id: "descending-triangle",
    title: "Descending Triangle Pattern",
    level: "Intermediate",
    type: "Bearish Continuation",
    icon: "📉",
    definition: "Flat support with falling resistance. Lower highs show increasing seller aggression.",
    insights: [
      "⬇️ Lower highs show sellers more aggressive",
      "🔻 Flat support = buyers defending level",
      "💪 Breakdown below = strong bearish signal"
    ],
    steps: [
      "Buyers defend flat support level",
      "First lower high appears",
      "Sellers become more aggressive each bounce",
      "Breakdown below support confirmed"
    ],
    takeaway: "Descending triangles are bearish. Each high lower = mounting supply. Sellers winning."
  },
  {
    id: "symmetrical-triangle",
    title: "Symmetrical Triangle Pattern",
    level: "Intermediate",
    type: "Breakout Setup",
    icon: "🔺",
    definition: "Converging trendlines show equilibrium. Can break either direction — wait for confirmation.",
    insights: [
      "⚖️ Balance between buyers and sellers",
      "📉 Volume decreases into apex, surges on breakout",
      "🎲 Don't predict — trade after confirmation only"
    ],
    steps: [
      "Lower highs begin forming",
      "Higher lows begin forming",
      "Triangle tightens and compresses",
      "Price breaks decisively with volume"
    ],
    takeaway: "Do NOT predict direction. Trade ONLY after confirmed breakout. Follow first strong close."
  },
];

export default function PatternAcademy() {
  const [index, setIndex] = useState(0);
  const [stats, setStats] = useState(() => {
    try {
      const s = localStorage.getItem("pa_s");
      return s ? JSON.parse(s) : { m: [], x: 0, st: 0 };
    } catch {
      return { m: [], x: 0, st: 0 };
    }
  });

  const p = PATTERNS[index];
  const m = stats.m.includes(p.id);

  function master() {
    if (!m) {
      const n = { ...stats, x: stats.x + 250, m: [...stats.m, p.id], st: stats.st + 1 };
      setStats(n);
      localStorage.setItem("pa_s", JSON.stringify(n));
    }
  }

  return (
    <div className="pa">
      <div className="pa-h">
        <div>
          <div className="pa-b">📚 TRQX Pattern Academy</div>
          <div className="pa-t">
            <span>{p.icon}</span>
            <div>
              <h1>{p.title}</h1>
              <div className="pa-m">
                <span>{p.level}</span>
                <span>{p.type}</span>
                <span>#{index + 1}/{PATTERNS.length}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="pa-s">
          <div><strong>{stats.x}</strong>XP</div>
          <div><strong>🔥{stats.st}</strong>Streak</div>
          <div><strong>{stats.m.length}</strong>Mastered</div>
        </div>
      </div>

      <div className="pa-d">
        <h3>What is {p.title}?</h3>
        <p>{p.definition}</p>
      </div>

      <div className="pa-i">
        {p.insights.map((text, j) => (
          <div key={j} className="pa-ic">
            <span>{text[0]}</span>
            <p>{text.slice(2)}</p>
          </div>
        ))}
      </div>

      <div className="pa-f">
        <h3>📊 How It Forms</h3>
        <div className="pa-st">
          {p.steps.map((text, j) => (
            <div key={j} className="pa-sc">
              <div>{j + 1}</div>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pa-k">
        <span>💡</span>
        <div>
          <strong>Key Takeaway</strong>
          <p>{p.takeaway}</p>
        </div>
      </div>

      <div className="pa-a">
        <button onClick={() => setIndex((index - 1 + PATTERNS.length) % PATTERNS.length)}>← Prev</button>
        <button className="pr" onClick={master} disabled={m}>{m ? "✓ Mastered" : "Understand"}</button>
        <button onClick={() => setIndex((index + 1) % PATTERNS.length)}>Next →</button>
      </div>

      <div className="pa-pg"><div style={{ width: `${(stats.m.length / PATTERNS.length) * 100}%` }} /></div>
    </div>
  );
}