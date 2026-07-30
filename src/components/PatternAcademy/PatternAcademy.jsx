import React, { useState } from "react";
import CandlestickChart from "./CandlestickChart";
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
    takeaway: "FVGs highlight market inefficiencies. Price seeks balance, so returns to these gaps before continuing.",
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
      { name: "Rebalance", value: 125, color: "#22c55e" }
    ]
  },
  {
    id: "head-shoulders",
    title: "Head & Shoulders Pattern",
    level: "Intermediate",
    type: "Trend Reversal",
    icon: "📊",
    definition: "Three peaks showing declining momentum — signal downtrend reversal.",
    insights: ["📈 Each peak weaker — declining momentum visible", "🚫 Neckline break confirms sellers control", "🎯 Target from head to neckline"],
    steps: ["Left shoulder forms", "Head peaks higher but fails", "Right shoulder lower", "Neckline breaks — confirmed"],
    takeaway: "H&S marks exhaustion. Right shoulder must be lower.",
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
    zones: [{ name: "Head", value: 137, color: "#ef4444" }, { name: "Neckline", value: 122, color: "#d4af37" }]
  },
  {
    id: "double-top",
    title: "Double Top Pattern",
    level: "Beginner",
    type: "Trend Reversal",
    icon: "🔝",
    definition: "Two failed attempts to break resistance signal trend exhaustion.",
    insights: ["🔝 Sellers defended resistance twice", "⬇️ Neckline is real signal", "📉 Volume confirms selling"],
    steps: ["First top rejected", "Pullback creates valley", "Second top rejected", "Neckline breaks"],
    takeaway: "Double tops show supply. Break below neckline = signal.",
    data: [
      { time: "1", close: 108, high: 110, low: 100, open: 102 },
      { time: "2", close: 116, high: 118, low: 106, open: 108 },
      { time: "3", close: 128, high: 130, low: 114, open: 116 },
      { time: "4", close: 134, high: 137, low: 126, open: 128 },
      { time: "5", close: 128, high: 130, low: 138, open: 134 },
      { time: "6", close: 119, high: 121, low: 132, open: 128 },
      { time: "7", close: 126, high: 128, low: 119, open: 119 },
      { time: "8", close: 132, high: 134, low: 124, open: 126 },
    ],
    zones: [{ name: "Resistance", value: 137, color: "#ef4444" }, { name: "Neckline", value: 130, color: "#d4af37" }]
  },
  {
    id: "double-bottom",
    title: "Double Bottom Pattern",
    level: "Beginner",
    type: "Trend Reversal",
    icon: "🔻",
    definition: "Two failed attempts to break support signal capitulation and reversal.",
    insights: ["🔻 Buyers defended support twice", "⬆️ Neckline is breakout point", "📈 Volume confirms bullish"],
    steps: ["First bottom tested", "Bounce creates peak", "Second bottom tested", "Neckline breaks up"],
    takeaway: "Double bottoms show demand. Breakout above neckline = strong signal.",
    data: [
      { time: "1", close: 126, high: 128, low: 140, open: 138 },
      { time: "2", close: 117, high: 119, low: 130, open: 126 },
      { time: "3", close: 103, high: 107, low: 121, open: 117 },
      { time: "4", close: 102, high: 112, low: 114, open: 103 },
      { time: "5", close: 110, high: 120, low: 122, open: 102 },
      { time: "6", close: 118, high: 127, low: 129, open: 110 },
      { time: "7", close: 116, high: 118, low: 129, open: 118 },
      { time: "8", close: 103, high: 108, low: 120, open: 116 },
    ],
    zones: [{ name: "Support", value: 107, color: "#22c55e" }, { name: "Neckline", value: 120, color: "#d4af37" }]
  },
  {
    id: "bull-flag",
    title: "Bull Flag Pattern",
    level: "Intermediate",
    type: "Bullish Continuation",
    icon: "🚩",
    definition: "Strong bullish impulse followed by consolidation — 70%+ success rate.",
    insights: ["📈 Flagpole shows conviction", "🔄 Flag is profit-taking", "💥 Tighter flag = more explosive"],
    steps: ["Flagpole: Strong impulse", "Flag forms: Pullback", "Consolidation: Tightens", "Breakout: Above flag"],
    takeaway: "Flags are 70%+ reliable. Lower volume in flag than pole.",
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
    zones: [{ name: "Flagpole", value: 148, color: "#22c55e" }, { name: "Flag", value: 140, color: "#d4af37" }]
  },
  {
    id: "bull-flag-alt",
    title: "Ascending Triangle Pattern",
    level: "Intermediate",
    type: "Bullish Continuation",
    icon: "📈",
    definition: "Flat resistance with rising support — buyers become more aggressive.",
    insights: ["⬆️ Higher lows show aggression", "🔝 Flat resistance = supply", "💪 Breakout = bullish signal"],
    steps: ["Sellers defend flat level", "First higher low", "Buyers more aggressive", "Breakout above resistance"],
    takeaway: "Ascending triangles are bullish. Each low higher = mounting demand.",
    data: [
      { time: "1", close: 108, high: 110, low: 100, open: 102 },
      { time: "2", close: 116, high: 118, low: 106, open: 108 },
      { time: "3", close: 126, high: 128, low: 114, open: 116 },
      { time: "4", close: 124, high: 132, low: 122, open: 126 },
      { time: "5", close: 116, high: 118, low: 126, open: 124 },
      { time: "6", close: 124, high: 126, low: 117, open: 116 },
      { time: "7", close: 129, high: 131, low: 122, open: 124 },
      { time: "8", close: 123, high: 124, low: 132, open: 129 },
    ],
    zones: [{ name: "Resistance", value: 132, color: "#ef4444" }, { name: "Rising Support", value: 115, color: "#22c55e" }]
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

      <div className="pa-ch">
        <h3>📊 Pattern Visualization</h3>
        <CandlestickChart data={p.data} />
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