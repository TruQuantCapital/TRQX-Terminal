import React, { useMemo, useState } from "react";
import "./PatternAcademy.css";

const GOLD = "#d4af37";
const GREEN = "#22c55e";
const RED = "#ef4444";
const BLUE = "#38bdf8";
const PURPLE = "#a855f7";

const C = (x, o, h, l, c) => ({ x, o, h, l, c, bull: c >= o });

const CARDS = [
  {
    id: "head-shoulders",
    title: "Head & Shoulders Pattern",
    level: "Intermediate",
    trend: "Bullish → Bearish",
    range: { min: 1.095, max: 1.165 },
    candles: [
      C(7,1.105,1.112,1.102,1.110), C(10,1.110,1.118,1.108,1.116), C(13,1.116,1.128,1.114,1.125),
      C(16,1.125,1.138,1.122,1.134), C(19,1.134,1.140,1.130,1.132), C(22,1.132,1.135,1.122,1.124),
      C(25,1.124,1.131,1.120,1.129), C(29,1.129,1.141,1.127,1.138), C(33,1.138,1.151,1.136,1.148),
      C(37,1.148,1.159,1.145,1.156), C(40,1.156,1.161,1.149,1.151), C(43,1.151,1.154,1.140,1.142),
      C(47,1.142,1.148,1.138,1.146), C(51,1.146,1.152,1.144,1.150), C(55,1.150,1.153,1.142,1.144),
      C(58,1.144,1.146,1.134,1.136), C(61,1.136,1.140,1.130,1.139), C(65,1.139,1.143,1.134,1.141),
      C(69,1.141,1.144,1.133,1.135), C(72,1.135,1.137,1.126,1.128), C(76,1.128,1.130,1.119,1.121),
      C(80,1.121,1.124,1.113,1.116), C(84,1.116,1.118,1.108,1.111)
    ],
    lines: [
      { label: "Neckline", x1: 13, y1: 62, x2: 76, y2: 62, color: GOLD },
      { label: "Support Area", x1: 36, y1: 76, x2: 58, y2: 76, color: BLUE, soft: true }
    ],
    zones: [
      { id: "ls", label: "Left Shoulder", help: "First peak before the head", x: 18, y: 42 },
      { id: "head", label: "Head", help: "Highest peak between two shoulders", x: 38, y: 24 },
      { id: "rs", label: "Right Shoulder", help: "Lower peak after the head", x: 63, y: 43 },
      { id: "neck", label: "Neckline", help: "Support level connecting reaction lows", x: 45, y: 62 },
      { id: "break", label: "Breakdown", help: "Price breaks below neckline", x: 80, y: 70 },
      { id: "support", label: "Support Area", help: "Prior support under neckline", x: 48, y: 76 }
    ],
    explanation: [
      "The Head & Shoulders pattern forms after an uptrend and warns of a bearish reversal.",
      "The left shoulder and right shoulder are lower peaks around a higher head.",
      "The neckline connects the reaction lows. The pattern confirms only after price breaks below it.",
      "A clean retest or continuation below the neckline is stronger than guessing early."
    ]
  },
  {
    id: "inverse-head-shoulders",
    title: "Inverse Head & Shoulders Pattern",
    level: "Intermediate",
    trend: "Bearish → Bullish",
    range: { min: 1.095, max: 1.165 },
    candles: [
      C(7,1.154,1.157,1.146,1.148), C(10,1.148,1.151,1.139,1.142), C(13,1.142,1.145,1.130,1.133),
      C(17,1.133,1.136,1.122,1.126), C(20,1.126,1.132,1.123,1.130), C(24,1.130,1.136,1.128,1.134),
      C(28,1.134,1.137,1.125,1.127), C(32,1.127,1.130,1.113,1.116), C(36,1.116,1.120,1.106,1.109),
      C(40,1.109,1.115,1.104,1.113), C(44,1.113,1.123,1.111,1.121), C(48,1.121,1.131,1.119,1.128),
      C(52,1.128,1.135,1.125,1.133), C(56,1.133,1.137,1.124,1.126), C(60,1.126,1.131,1.121,1.129),
      C(64,1.129,1.137,1.127,1.135), C(68,1.135,1.143,1.133,1.141), C(72,1.141,1.151,1.139,1.148),
      C(76,1.148,1.158,1.146,1.155)
    ],
    lines: [
      { label: "Neckline", x1: 23, y1: 38, x2: 72, y2: 38, color: GOLD },
      { label: "Support Area", x1: 31, y1: 76, x2: 46, y2: 76, color: BLUE, soft: true }
    ],
    zones: [
      { id: "ls", label: "Left Shoulder", help: "First low before the head", x: 18, y: 61 },
      { id: "head", label: "Head", help: "Deepest low in the structure", x: 37, y: 78 },
      { id: "rs", label: "Right Shoulder", help: "Higher low after the head", x: 58, y: 61 },
      { id: "neck", label: "Neckline", help: "Resistance connecting reaction highs", x: 47, y: 38 },
      { id: "choch", label: "CHoCH", help: "Change of character as buyers regain control", x: 68, y: 32 },
      { id: "break", label: "Breakout", help: "Price breaks above neckline", x: 77, y: 25 }
    ],
    explanation: [
      "The Inverse Head & Shoulders pattern forms after a downtrend and signals a potential bullish reversal.",
      "The head is the deepest low. The right shoulder should hold higher than the head.",
      "The neckline acts as resistance. The breakout above it confirms the pattern.",
      "Do not assume reversal until the neckline is broken with strength."
    ]
  },
  {
    id: "double-top",
    title: "Double Top Pattern",
    level: "Beginner",
    trend: "Bullish → Bearish",
    range: { min: 95, max: 145 },
    candles: [
      C(8,105,110,103,109), C(12,109,116,107,115), C(16,115,124,113,122), C(20,122,134,120,131),
      C(24,131,137,126,128), C(28,128,130,118,120), C(32,120,124,115,122), C(36,122,130,120,128),
      C(40,128,136,126,134), C(44,134,138,130,132), C(48,132,133,122,124), C(52,124,126,116,118),
      C(56,118,120,110,112), C(60,112,114,104,106)
    ],
    lines: [
      { label: "Resistance", x1: 18, y1: 22, x2: 48, y2: 22, color: RED },
      { label: "Neckline", x1: 25, y1: 58, x2: 56, y2: 58, color: GOLD }
    ],
    zones: [
      { id: "top1", label: "First Top", help: "First rejection at resistance", x: 22, y: 22 },
      { id: "top2", label: "Second Top", help: "Second rejection at the same resistance", x: 42, y: 22 },
      { id: "neck", label: "Neckline", help: "Support between the two tops", x: 38, y: 58 },
      { id: "break", label: "Breakdown", help: "Price breaks below support", x: 55, y: 68 },
      { id: "res", label: "Resistance", help: "Level sellers defended twice", x: 33, y: 14 }
    ],
    explanation: ["Double tops show two failed attempts to break resistance.", "The setup confirms only when price breaks the neckline/support between the peaks.", "The target is often projected from resistance to neckline distance."]
  },
  {
    id: "double-bottom",
    title: "Double Bottom Pattern",
    level: "Beginner",
    trend: "Bearish → Bullish",
    range: { min: 95, max: 145 },
    candles: [
      C(8,138,130,140,128), C(12,130,122,132,120), C(16,122,113,124,111), C(20,113,105,115,102),
      C(24,105,110,112,101), C(28,110,118,120,108), C(32,118,124,126,116), C(36,124,116,126,114),
      C(40,116,108,118,103), C(44,108,113,115,102), C(48,113,124,126,112), C(52,124,133,135,122),
      C(56,133,140,142,131)
    ],
    lines: [
      { label: "Support", x1: 18, y1: 78, x2: 47, y2: 78, color: GREEN },
      { label: "Neckline", x1: 28, y1: 42, x2: 54, y2: 42, color: GOLD }
    ],
    zones: [
      { id: "bottom1", label: "First Bottom", help: "First defense at support", x: 21, y: 78 },
      { id: "bottom2", label: "Second Bottom", help: "Second defense at the same support", x: 43, y: 78 },
      { id: "neck", label: "Neckline", help: "Resistance between the two bottoms", x: 37, y: 42 },
      { id: "break", label: "Breakout", help: "Price breaks above neckline", x: 56, y: 30 },
      { id: "support", label: "Support", help: "Level buyers defended twice", x: 31, y: 86 }
    ],
    explanation: ["Double bottoms show two failed attempts to break support.", "The pattern confirms when price breaks the neckline/resistance between the lows.", "Wait for confirmation; buying the second low early is riskier."]
  },
  {
    id: "bull-flag",
    title: "Bull Flag Pattern",
    level: "Intermediate",
    trend: "Bullish Continuation",
    range: { min: 95, max: 165 },
    candles: [
      C(8,100,110,98,108), C(12,108,122,106,120), C(16,120,137,118,135), C(20,135,151,132,148),
      C(24,148,154,142,144), C(28,144,148,137,140), C(32,140,146,136,142), C(36,142,144,134,136),
      C(40,136,141,133,139), C(44,139,156,138,154), C(48,154,163,152,160)
    ],
    lines: [
      { label: "Flagpole", x1: 8, y1: 82, x2: 20, y2: 20, color: GREEN },
      { label: "Upper Flag", x1: 23, y1: 28, x2: 42, y2: 44, color: GOLD },
      { label: "Lower Flag", x1: 23, y1: 45, x2: 42, y2: 60, color: GOLD }
    ],
    zones: [
      { id: "flagpole", label: "Flagpole", help: "Strong impulse move before consolidation", x: 16, y: 36 },
      { id: "flag", label: "Flag", help: "Controlled pullback after the impulse", x: 32, y: 48 },
      { id: "upper", label: "Upper Trendline", help: "Breakout trigger area", x: 36, y: 38 },
      { id: "break", label: "Breakout", help: "Price breaks above the flag", x: 45, y: 25 },
      { id: "target", label: "Target", help: "Measured move based on flagpole", x: 55, y: 16 }
    ],
    explanation: ["A bull flag is a continuation pattern after a strong bullish impulse.", "The flag should be a controlled pullback, not a full reversal.", "The setup confirms when price breaks above the upper flag trendline."]
  },
  {
    id: "bear-flag",
    title: "Bear Flag Pattern",
    level: "Intermediate",
    trend: "Bearish Continuation",
    range: { min: 95, max: 165 },
    candles: [
      C(8,158,146,161,144), C(12,146,132,148,130), C(16,132,117,135,115), C(20,117,103,119,100),
      C(24,103,110,112,101), C(28,110,116,118,108), C(32,116,112,119,110), C(36,112,118,120,111),
      C(40,118,114,121,112), C(44,114,100,116,98), C(48,100,92,102,90)
    ],
    lines: [
      { label: "Flagpole", x1: 8, y1: 18, x2: 20, y2: 78, color: RED },
      { label: "Upper Flag", x1: 23, y1: 58, x2: 42, y2: 43, color: GOLD },
      { label: "Lower Flag", x1: 23, y1: 74, x2: 42, y2: 59, color: GOLD }
    ],
    zones: [
      { id: "flagpole", label: "Flagpole", help: "Strong bearish impulse before consolidation", x: 15, y: 47 },
      { id: "flag", label: "Flag", help: "Weak bounce after the selloff", x: 32, y: 58 },
      { id: "lower", label: "Lower Trendline", help: "Breakdown trigger area", x: 35, y: 70 },
      { id: "break", label: "Breakdown", help: "Price breaks below the flag", x: 45, y: 82 },
      { id: "target", label: "Target", help: "Measured move based on flagpole", x: 55, y: 90 }
    ],
    explanation: ["A bear flag is a continuation pattern after a strong bearish impulse.", "The flag is a weak upward drift, not real bullish strength.", "The setup confirms when price breaks below the lower flag trendline."]
  },
  {
    id: "ascending-triangle",
    title: "Ascending Triangle Pattern",
    level: "Intermediate",
    trend: "Bullish Continuation",
    range: { min: 95, max: 145 },
    candles: [
      C(8,102,110,100,108), C(12,108,118,106,116), C(16,116,128,114,126), C(20,126,132,122,124),
      C(24,124,118,126,116), C(28,118,126,117,124), C(32,124,131,122,129), C(36,129,124,132,123),
      C(40,124,121,126,120), C(44,121,129,120,128), C(48,128,136,127,134), C(52,134,142,132,140)
    ],
    lines: [
      { label: "Flat Resistance", x1: 16, y1: 28, x2: 48, y2: 28, color: RED },
      { label: "Rising Support", x1: 24, y1: 72, x2: 44, y2: 48, color: GREEN }
    ],
    zones: [
      { id: "res", label: "Flat Resistance", help: "Sellers defend the same upper level", x: 31, y: 28 },
      { id: "hl1", label: "Higher Low", help: "Buyers step in higher than before", x: 25, y: 70 },
      { id: "hl2", label: "Higher Low", help: "Pressure builds against resistance", x: 40, y: 50 },
      { id: "support", label: "Rising Support", help: "Trendline formed by higher lows", x: 34, y: 60 },
      { id: "break", label: "Breakout", help: "Price breaks above resistance", x: 50, y: 18 }
    ],
    explanation: ["Ascending triangles show buyers becoming more aggressive while sellers defend one level.", "Rising lows are the key clue.", "The setup confirms when price breaks above flat resistance."]
  },
  {
    id: "descending-triangle",
    title: "Descending Triangle Pattern",
    level: "Intermediate",
    trend: "Bearish Continuation",
    range: { min: 95, max: 145 },
    candles: [
      C(8,140,132,142,130), C(12,132,124,134,122), C(16,124,116,126,114), C(20,116,111,118,108),
      C(24,111,120,122,110), C(28,120,128,130,118), C(32,128,119,130,117), C(36,119,112,121,110),
      C(40,112,119,121,111), C(44,119,124,126,117), C(48,124,113,126,111), C(52,113,103,115,100)
    ],
    lines: [
      { label: "Flat Support", x1: 16, y1: 72, x2: 50, y2: 72, color: GREEN },
      { label: "Falling Resistance", x1: 26, y1: 32, x2: 48, y2: 58, color: RED }
    ],
    zones: [
      { id: "support", label: "Flat Support", help: "Buyers defend the same lower level", x: 33, y: 72 },
      { id: "lh1", label: "Lower High", help: "Sellers step in lower than before", x: 29, y: 35 },
      { id: "lh2", label: "Lower High", help: "Bearish pressure increases", x: 43, y: 55 },
      { id: "res", label: "Falling Resistance", help: "Trendline formed by lower highs", x: 37, y: 45 },
      { id: "break", label: "Breakdown", help: "Price breaks below support", x: 53, y: 82 }
    ],
    explanation: ["Descending triangles show sellers becoming more aggressive while buyers defend one level.", "Lower highs are the key clue.", "The setup confirms when price breaks below flat support."]
  },
  {
    id: "order-block-bos-choch",
    title: "Institutional Order Block + BOS / CHoCH",
    level: "Advanced",
    trend: "Structure → Confirmation",
    range: { min: 95, max: 165 },
    candles: [
      C(8,100,112,98,110), C(12,110,126,108,124), C(16,124,118,128,116), C(20,118,112,120,110),
      C(24,112,121,111,119), C(28,119,116,122,114), C(32,116,127,115,125), C(36,125,139,123,137),
      C(40,137,132,141,130), C(44,132,126,134,124), C(48,126,116,128,114), C(52,116,108,118,105),
      C(56,108,118,106,116), C(60,116,130,114,128), C(64,128,146,126,144), C(68,144,158,142,156)
    ],
    lines: [
      { label: "BOS", x1: 10, y1: 38, x2: 38, y2: 38, color: GOLD },
      { label: "Liquidity Grab", x1: 18, y1: 70, x2: 52, y2: 70, color: PURPLE, dashed: true },
      { label: "Order Block", x1: 8, y1: 78, x2: 42, y2: 78, color: BLUE, soft: true },
      { label: "OB", x1: 47, y1: 22, x2: 70, y2: 22, color: BLUE, soft: true }
    ],
    zones: [
      { id: "bos", label: "BOS", help: "Break of structure above prior swing high", x: 25, y: 38 },
      { id: "choch", label: "CHoCH", help: "Change of character after liquidity sweep", x: 57, y: 52 },
      { id: "liq", label: "Liquidity Grab", help: "Sweep below prior lows before reversal", x: 38, y: 70 },
      { id: "ob1", label: "Order Block", help: "Demand zone institutions defended", x: 27, y: 80 },
      { id: "ob2", label: "OB", help: "Supply/order block area price reacts from", x: 60, y: 23 },
      { id: "retest", label: "Retest", help: "Price returns to the block before continuation", x: 55, y: 66 }
    ],
    explanation: ["This structure teaches BOS, CHoCH, liquidity sweep, and order block reaction together.", "The liquidity grab clears stops before price reverses.", "The order block is the zone where institutional buying/selling appears to defend price.", "Confirmation matters: mark structure first, then wait for reaction."
    ]
  }
];

function priceToY(price, range) {
  return 8 + ((range.max - price) / Math.max(range.max - range.min, 0.0001)) * 82;
}

function Candle({ candle, range }) {
  const openY = priceToY(candle.o, range);
  const closeY = priceToY(candle.c, range);
  const highY = priceToY(candle.h, range);
  const lowY = priceToY(candle.l, range);
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(2.2, Math.abs(closeY - openY));
  const color = candle.bull ? "green" : "red";
  return (
    <div className={`pa-candle ${color}`} style={{ left: `${candle.x}%` }}>
      <div className="pa-wick" style={{ top: `${highY}%`, height: `${Math.max(lowY - highY, 1)}%` }} />
      <div className="pa-body" style={{ top: `${bodyTop}%`, height: `${bodyHeight}%` }} />
    </div>
  );
}

function Line({ line }) {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return (
    <div
      className={`pa-line ${line.soft ? "soft" : ""} ${line.dashed ? "dashed" : ""}`}
      style={{
        left: `${line.x1}%`,
        top: `${line.y1}%`,
        width: `${length}%`,
        transform: `rotate(${angle}deg)`,
        borderColor: line.color || GOLD
      }}
    >
      <span>{line.label}</span>
    </div>
  );
}

export default function PatternAcademy() {
  const [cardIndex, setCardIndex] = useState(0);
  const [placed, setPlaced] = useState({});
  const [results, setResults] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [xp, setXp] = useState(2950);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(48);
  const [correctTotal, setCorrectTotal] = useState(38);

  const card = CARDS[cardIndex];
  const checked = Object.keys(results).length > 0;
  const correctCount = Object.values(results).filter(Boolean).length;
  const accuracy = Math.round((correctTotal / Math.max(attempts, 1)) * 100);
  const used = Object.values(placed);

  const labels = useMemo(() => card.zones.map((z) => ({ id: z.id, label: z.label, help: z.help })), [card]);

  function dragStart(e, id) {
    e.dataTransfer.setData("labelId", id);
  }

  function drop(e, zoneId) {
    e.preventDefault();
    const labelId = e.dataTransfer.getData("labelId");
    if (!labelId) return;
    setPlaced((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === labelId) delete next[key];
      });
      next[zoneId] = labelId;
      return next;
    });
    setResults({});
  }

  function checkAnswer() {
    const next = {};
    card.zones.forEach((z) => { next[z.id] = placed[z.id] === z.id; });
    const count = Object.values(next).filter(Boolean).length;
    setResults(next);
    setAttempts((v) => v + card.zones.length);
    setCorrectTotal((v) => v + count);
    setStreak((v) => count === card.zones.length ? v + 1 : 0);
    setXp((v) => v + count * 25 + (count === card.zones.length ? 100 : 0));
  }

  function reset() {
    setPlaced({});
    setResults({});
    setShowHint(false);
  }

  function nextCard() {
    setCardIndex((i) => (i + 1) % CARDS.length);
    reset();
  }

  const feedback = checked ? card.zones.map((z) => {
    const picked = labels.find((l) => l.id === placed[z.id]);
    if (results[z.id]) return { ok: true, text: `Correct: ${z.label}. ${z.help}` };
    if (!picked) return { ok: false, text: `Missing: ${z.label}. ${z.help}` };
    return { ok: false, text: `Almost. You placed ${picked.label}, but this location is ${z.label}. ${z.help}` };
  }) : [];

  const priceTicks = Array.from({ length: 6 }, (_, i) => {
    const p = card.range.max - ((card.range.max - card.range.min) / 5) * i;
    return card.range.max < 10 ? p.toFixed(5) : p.toFixed(2);
  });

  return (
    <section className="pattern-academy-shell">
      <div className="pa-topbar">
        <div>
          <div className="pa-brandline">TRQX Pattern Academy</div>
          <div className="pa-title-row">
            <h2>{card.title}</h2>
            <span className="pa-level-pill">{card.level}</span>
          </div>
          <div className="pa-subtext">Drag each label to the correct area. These cards are hand-built for teaching, not auto-generated.</div>
        </div>
        <div className="pa-stats-strip">
          <div className="pa-stat gold"><span>XP</span><strong>{xp.toLocaleString()}</strong></div>
          <div className="pa-stat"><span>Streak</span><strong>🔥 {streak}</strong></div>
          <div className="pa-stat green"><span>Accuracy</span><strong>{accuracy}%</strong></div>
          <div className="pa-stat blue"><span>Cards</span><strong>{CARDS.length}</strong></div>
        </div>
      </div>

      <div className="pa-main-grid">
        <div className="pa-board">
          <div className="pa-board-head">
            <div>
              <span className="pa-day-pill">D1</span>
              <span className="pa-trend-pill">TREND: <b>{card.trend}</b></span>
            </div>
            <div className="pa-progress-wrap">
              <div className="pa-progress-label"><span>Progress</span><span>{cardIndex + 1}/{CARDS.length}</span></div>
              <div className="pa-progress-track"><div className="pa-progress-fill" style={{ width: `${((cardIndex + 1) / CARDS.length) * 100}%` }} /></div>
            </div>
          </div>

          <div className="pa-chart">
            <div className="pa-price-axis">{priceTicks.map((t) => <span key={t}>{t}</span>)}</div>
            <div className="pa-time-axis"><span>Setup</span><span>Context</span><span>Pattern</span><span>Confirm</span><span>Entry</span></div>

            {card.lines.map((line, i) => <Line key={`${line.label}-${i}`} line={line} />)}
            {card.candles.map((c, i) => <Candle key={`${card.id}-${i}`} candle={c} range={card.range} />)}

            {card.zones.map((zone, i) => {
              const picked = labels.find((l) => l.id === placed[zone.id]);
              const state = checked ? (results[zone.id] ? "correct" : "wrong") : "";
              return (
                <div
                  key={zone.id}
                  className={`pa-zone ${state} ${!picked ? "empty" : ""}`}
                  style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => drop(e, zone.id)}
                  title={zone.help}
                >
                  <span className="pa-zone-number">{i + 1}</span>
                  <span className="pa-zone-text">{picked?.label || "DROP"}</span>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="pa-side-panel">
          <div className="pa-side-title">🏆 Drag these labels</div>
          {labels.map((label) => (
            <div
              key={label.id}
              draggable
              onDragStart={(e) => dragStart(e, label.id)}
              className={`pa-drag-label ${used.includes(label.id) ? "used" : ""}`}
            >
              <strong>{label.label}</strong>
              <span>{label.help}</span>
            </div>
          ))}
          <div className="pa-control-card">
            <button className="pa-button ghost" onClick={() => setShowHint((v) => !v)}>💡 Hint</button>
            {showHint && <p className="pa-hint-text">Start with the biggest structure first: neckline/support/resistance, then label the peaks/lows, then confirmation.</p>}
            <button className="pa-button" onClick={checkAnswer}>Check Answer</button>
            <button className="pa-button secondary" onClick={reset}>Reset</button>
            <button className="pa-button next" onClick={nextCard}>Next Pattern →</button>
          </div>
        </aside>
      </div>

      <div className="pa-bottom-grid">
        <div className="pa-info-panel">
          <h3>🤖 AI Tutor Feedback</h3>
          {!checked && <p>Drag the labels to the correct locations, then click <b>Check Answer</b>. The tutor will explain what each structure means.</p>}
          {feedback.map((f, i) => <div key={i} className={`pa-feedback-line ${f.ok ? "good" : "bad"}`}>{f.ok ? "✅" : "❌"} {f.text}</div>)}
        </div>
        <div className="pa-info-panel">
          <h3>📖 Pattern Explanation</h3>
          <ul>{card.explanation.map((line, i) => <li key={i}>{line}</li>)}</ul>
        </div>
        <div className="pa-info-panel">
          <h3>📈 Your Stats</h3>
          <div className="pa-accuracy-ring" style={{ "--deg": `${accuracy * 3.6}deg` }}><strong>{accuracy}%</strong><span>Accuracy</span></div>
          <div className="pa-mini-stats">
            <div><span>Correct</span><strong>{correctTotal}</strong></div>
            <div><span>Attempts</span><strong>{attempts}</strong></div>
            <div><span>Current Card</span><strong>{cardIndex + 1}/{CARDS.length}</strong></div>
            <div><span>Current Score</span><strong>{checked ? `${correctCount}/${card.zones.length}` : "--"}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}
