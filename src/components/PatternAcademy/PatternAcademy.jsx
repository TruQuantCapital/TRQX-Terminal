import React, { useMemo, useState } from "react";
import "./PatternAcademy.css";

const GOLD = "#d4af37";
const TEAL = "#26a69a";
const RED = "#ef5350";
const PURPLE = "#a78bfa";
const BLUE = "#3b82f6";

function slugify(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function inferTrend(pattern) {
  const signal = `${pattern.signal || ""} ${pattern.name || ""}`.toLowerCase();
  if (signal.includes("bullish reversal") || signal.includes("inverse")) return "Bearish → Bullish";
  if (signal.includes("bearish reversal") || signal.includes("head & shoulders")) return "Bullish → Bearish";
  if (signal.includes("bullish")) return "Bullish Continuation";
  if (signal.includes("bearish")) return "Bearish Continuation";
  return "Structure → Confirmation";
}

function labelHelp(text, pattern) {
  const t = String(text || "").toLowerCase();
  if (t.includes("neckline")) return "Key level connecting the reaction highs/lows";
  if (t.includes("resistance")) return "Area where sellers defended price";
  if (t.includes("support")) return "Area where buyers defended price";
  if (t.includes("shoulder")) return "One side of the Head & Shoulders structure";
  if (t.includes("head")) return pattern?.name?.toLowerCase().includes("inverse") ? "Deepest low in the structure" : "Highest peak in the structure";
  if (t.includes("breakout")) return "Confirmation move above the key level";
  if (t.includes("breakdown")) return "Confirmation move below the key level";
  if (t.includes("flag")) return "Controlled consolidation after the impulse";
  if (t.includes("pennant")) return "Coiling consolidation before continuation";
  if (t.includes("entry")) return pattern.entry || "Where the setup confirms";
  if (t.includes("stop")) return pattern.stop || "Where the trade idea becomes invalid";
  if (t.includes("target")) return pattern.target || "Projected target area";
  return "Identify this part of the pattern";
}

function labelColor(text = "", pattern) {
  const t = text.toLowerCase();
  if (t.includes("breakdown") || t.includes("bearish") || t.includes("resistance")) return "red";
  if (t.includes("breakout") || t.includes("bullish") || t.includes("support")) return "green";
  if (t.includes("neckline") || t.includes("trendline")) return "purple";
  if (t.includes("entry") || t.includes("target") || t.includes("stop")) return "blue";
  if (pattern?.signalColor === RED) return "red";
  if (pattern?.signalColor === TEAL) return "green";
  return "gold";
}

function getRange(candles = []) {
  const highs = candles.map((c) => c.h);
  const lows = candles.map((c) => c.l);
  const max = Math.max(...highs, 1);
  const min = Math.min(...lows, 0);
  const pad = Math.max(8, (max - min) * 0.14);
  return { min: min - pad, max: max + pad };
}

function priceToY(price, range) {
  const topPad = 14;
  const bottomPad = 88;
  const usable = 100 - topPad - bottomPad;
  return topPad + ((range.max - price) / Math.max(range.max - range.min, 1)) * usable;
}

function candleToX(index, candles) {
  if (!candles?.length) return 50;
  return 7 + (index / Math.max(candles.length - 1, 1)) * 84;
}

function normalizeAnnotationText(text) {
  return String(text || "")
    .replace(/[①②③]/g, "")
    .replace(/[↑↓✓⚡]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function challengeFromPattern(pattern, index, total) {
  const candles = pattern.candles || [];
  const range = getRange(candles);
  const annotations = Array.isArray(pattern.annotations) ? pattern.annotations : [];
  const zones = [];
  const labels = [];
  const lines = [];

  annotations.forEach((ann, i) => {
    if (!candles.length) return;
    const cIdx = clamp(Number(ann.candleIdx ?? 0), 0, candles.length - 1);
    const candle = candles[cIdx] || candles[0];
    const text = normalizeAnnotationText(ann.label || ann.text || ann.type || "Pattern Point");
    if (!text || text.length < 2) return;
    const id = `${slugify(text)}-${i}`;

    if (ann.type === "hline") {
      const lowerText = text.toLowerCase();
      let price = candle.c;
      if (lowerText.includes("resistance")) price = candle.h;
      else if (lowerText.includes("support") || lowerText.includes("neckline")) price = candle.l;
      const y = priceToY(price, range);
      lines.push({ id, text, y, color: lowerText.includes("resistance") ? RED : lowerText.includes("support") ? TEAL : GOLD });
      zones.push({ id, answer: id, label: text, x: 13, y, hint: labelHelp(text, pattern), kind: "line" });
      labels.push({ id, text, help: labelHelp(text, pattern), color: labelColor(text, pattern) });
      return;
    }

    if (ann.type === "bracket") return;

    const isLow = /bottom|low|support|head \(deepest\)|shoulder/i.test(text) && /inverse|bottom/i.test(pattern.name || "");
    const basePrice = isLow ? candle.l : candle.h;
    const y = clamp(priceToY(basePrice, range) + (Number(ann.offset || 0) / 7), 12, 82);
    const x = clamp(candleToX(cIdx, candles), 8, 90);
    zones.push({ id, answer: id, label: text, x, y, hint: labelHelp(text, pattern), kind: "annotation" });
    labels.push({ id, text, help: labelHelp(text, pattern), color: labelColor(text, pattern) });
  });

  // Add trade-management learning zones only when a pattern has too few structural labels.
  if (zones.length < 4 && pattern.entry) {
    const id = "entry-zone";
    zones.push({ id, answer: id, label: "Entry", x: 76, y: 28, hint: pattern.entry, kind: "trade" });
    labels.push({ id, text: "Entry", help: pattern.entry, color: "blue" });
  }
  if (zones.length < 5 && pattern.stop) {
    const id = "stop-zone";
    zones.push({ id, answer: id, label: "Stop", x: 32, y: 78, hint: pattern.stop, kind: "trade" });
    labels.push({ id, text: "Stop", help: pattern.stop, color: "red" });
  }
  if (zones.length < 6 && pattern.target) {
    const id = "Target-zone";
    zones.push({ id, answer: id, label: "Target", x: 88, y: 18, hint: pattern.target, kind: "trade" });
    labels.push({ id, text: "Target", help: pattern.target, color: "green" });
  }

  const finalZones = zones.slice(0, 7);
  const keepIds = new Set(finalZones.map((z) => z.answer));
  const finalLabels = labels.filter((l) => keepIds.has(l.id)).slice(0, 7);

  return {
    id: pattern.id,
    title: pattern.name,
    level: pattern.level || "Beginner",
    category: pattern.category || "Pattern",
    signal: pattern.signal || "Market Structure",
    signalColor: pattern.signalColor || GOLD,
    progress: `${index + 1} / ${total}`,
    trend: inferTrend(pattern),
    candles,
    range,
    lines,
    labels: finalLabels,
    zones: finalZones,
    description: pattern.description,
    entry: pattern.entry,
    stop: pattern.stop,
    target: pattern.target,
    explanation: [
      pattern.description,
      pattern.entry ? `Entry: ${pattern.entry}` : null,
      pattern.stop ? `Stop: ${pattern.stop}` : null,
      pattern.target ? `Target: ${pattern.target}` : null,
    ].filter(Boolean),
  };
}

function Candle({ candle, index, total, range }) {
  const x = candleToX(index, Array.from({ length: total }));
  const openY = priceToY(candle.o, range);
  const closeY = priceToY(candle.c, range);
  const highY = priceToY(candle.h, range);
  const lowY = priceToY(candle.l, range);
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(2.4, Math.abs(closeY - openY));
  const color = candle.bull ? "green" : "red";

  return (
    <div className={`pa-real-candle ${color}`} style={{ left: `${x}%` }}>
      <div className="pa-real-wick" style={{ top: `${highY}%`, height: `${Math.max(lowY - highY, 1)}%` }} />
      <div className="pa-real-body" style={{ top: `${bodyTop}%`, height: `${bodyHeight}%` }} />
    </div>
  );
}

export default function PatternAcademy({ patterns = [] }) {
  const lessons = useMemo(() => {
    const source = Array.isArray(patterns) && patterns.length ? patterns : [];
    return source.map((p, i) => challengeFromPattern(p, i, source.length)).filter((p) => p.candles?.length && p.labels?.length);
  }, [patterns]);

  const [lessonIndex, setLessonIndex] = useState(0);
  const [placed, setPlaced] = useState({});
  const [results, setResults] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(48);
  const [correctTotal, setCorrectTotal] = useState(38);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(2950);

  const lesson = lessons[lessonIndex] || lessons[0];

  const correctCount = Object.values(results).filter(Boolean).length;
  const checked = Object.keys(results).length > 0;
  const accuracy = Math.round((correctTotal / Math.max(attempts, 1)) * 100);
  const placedValues = Object.values(placed);

  const feedback = useMemo(() => {
    if (!checked || !lesson) return [];
    return lesson.zones.map((zone) => {
      const value = placed[zone.id];
      const correctLabel = lesson.labels.find((l) => l.id === zone.answer);
      const selected = lesson.labels.find((l) => l.id === value);
      if (value === zone.answer) {
        return { good: true, text: `Correct: ${correctLabel?.text}. ${zone.hint}` };
      }
      if (!value) return { good: false, text: `Missing: ${correctLabel?.text}. ${zone.hint}` };
      return { good: false, text: `Almost. You placed ${selected?.text || value}, but this location is ${correctLabel?.text}. ${zone.hint}` };
    });
  }, [checked, lesson, placed]);

  if (!lesson) {
    return (
      <section className="pattern-academy-shell">
        <div className="pa-topbar"><div><div className="pa-brandline">TRQX Pattern Academy</div><h2>No pattern data found.</h2></div></div>
      </section>
    );
  }

  function handleDragStart(e, labelId) {
    e.dataTransfer.setData("labelId", labelId);
  }

  function handleDrop(e, zoneId) {
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

  function checkAnswers() {
    const nextResults = {};
    lesson.zones.forEach((zone) => {
      nextResults[zone.id] = placed[zone.id] === zone.answer;
    });
    const newlyCorrect = Object.values(nextResults).filter(Boolean).length;
    setResults(nextResults);
    setAttempts((v) => v + lesson.zones.length);
    setCorrectTotal((v) => v + newlyCorrect);
    setStreak((v) => newlyCorrect === lesson.zones.length ? v + 1 : 0);
    setXp((v) => v + newlyCorrect * 25 + (newlyCorrect === lesson.zones.length ? 100 : 0));
  }

  function reset() {
    setPlaced({});
    setResults({});
    setShowHint(false);
  }

  function nextLesson() {
    setLessonIndex((idx) => (idx + 1) % lessons.length);
    reset();
  }

  const priceTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i < 7; i += 1) {
      const price = lesson.range.max - ((lesson.range.max - lesson.range.min) / 6) * i;
      ticks.push(price.toFixed(2));
    }
    return ticks;
  }, [lesson]);

  return (
    <section className="pattern-academy-shell">
      <div className="pa-topbar">
        <div>
          <div className="pa-brandline">TRQX Pattern Academy</div>
          <div className="pa-title-row">
            <h2>{lesson.title}</h2>
            <span className="pa-level-pill">{lesson.level}</span>
            <span className="pa-level-pill">{lesson.category}</span>
          </div>
          <div className="pa-subtext">Drag each label to the correct structure. This now uses your full pattern library.</div>
        </div>
        <div className="pa-stats-strip">
          <div className="pa-stat gold"><span>XP</span><strong>{xp.toLocaleString()}</strong></div>
          <div className="pa-stat"><span>Streak</span><strong>🔥 {streak}</strong></div>
          <div className="pa-stat green"><span>Accuracy</span><strong>{accuracy}%</strong></div>
          <div className="pa-stat blue"><span>Cards</span><strong>{lessons.length}</strong></div>
        </div>
      </div>

      <div className="pa-main-grid">
        <div className="pa-board">
          <div className="pa-board-head">
            <div>
              <span className="pa-day-pill">D1</span>
              <span className="pa-trend-pill">TREND: <span style={{ color: lesson.signalColor || '#22c55e' }}>{lesson.trend}</span></span>
            </div>
            <div className="pa-progress-wrap">
              <div className="pa-progress-label"><span>Progress</span><span>{lesson.progress}</span></div>
              <div className="pa-progress-track"><div className="pa-progress-fill" style={{ width: `${((lessonIndex + 1) / Math.max(lessons.length, 1)) * 100}%` }} /></div>
            </div>
          </div>

          <div className="pa-chart pa-chart-real">
            <div className="pa-price-axis">{priceTicks.map((t) => <span key={t}>{t}</span>)}</div>
            <div className="pa-time-axis"><span>Setup</span><span>Context</span><span>Pattern</span><span>Confirm</span><span>Entry</span></div>

            {lesson.lines.map((line) => (
              <div key={line.id} className="pa-structure-line" style={{ top: `${line.y}%`, borderColor: line.color || GOLD }}>
                <span>{line.text}</span>
              </div>
            ))}

            {lesson.candles.map((c, i) => (
              <Candle key={`${lesson.id}-${i}`} candle={c} index={i} total={lesson.candles.length} range={lesson.range} />
            ))}

            {lesson.zones.map((zone, index) => {
              const label = lesson.labels.find((l) => l.id === placed[zone.id]);
              const state = checked ? (results[zone.id] ? "correct" : "wrong") : "";
              const correctLabel = lesson.labels.find((l) => l.id === zone.answer);
              return (
                <div
                  key={zone.id}
                  className={`pa-zone ${state} ${!label ? "empty" : ""}`}
                  style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, zone.id)}
                  title={zone.hint}
                >
                  <span className="pa-zone-number">{index + 1}</span>
                  {checked && results[zone.id] && <span className="pa-zone-label">{correctLabel?.text}</span>}
                  <span className="pa-zone-text">{label?.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="pa-side-panel">
          <div className="pa-side-title">🏆 Drag these labels</div>
          {lesson.labels.map((label) => (
            <div
              key={label.id}
              draggable
              onDragStart={(e) => handleDragStart(e, label.id)}
              className={`pa-drag-label ${label.color || 'gold'} ${placedValues.includes(label.id) ? "used" : ""}`}
            >
              <strong>{label.text}</strong>
              <span>{label.help}</span>
            </div>
          ))}
          <div className="pa-control-card">
            <button className="pa-button ghost" onClick={() => setShowHint((v) => !v)}>💡 Hint</button>
            {showHint && <p className="pa-hint-text">{lesson.zones.find((z) => !placed[z.id])?.hint || "All zones have labels. Check your answer."}</p>}
            <button className="pa-button" onClick={checkAnswers}>Check Answer</button>
            <button className="pa-button secondary" onClick={reset}>Reset</button>
            <button className="pa-button next" onClick={nextLesson}>Next Pattern →</button>
          </div>
        </aside>
      </div>

      <div className="pa-bottom-grid">
        <div className="pa-info-panel">
          <h3>🤖 AI Tutor Feedback</h3>
          {!checked && <p>Drag the labels to the correct locations, then click <b style={{ color: GOLD }}>Check Answer</b>. The AI Tutor will explain each correct and incorrect answer.</p>}
          {feedback.map((f, i) => <div key={i} className={`pa-feedback-line ${f.good ? "good" : "bad"}`}>{f.good ? "✅" : "❌"} {f.text}</div>)}
        </div>
        <div className="pa-info-panel">
          <h3>📖 Pattern Explanation</h3>
          <ul>{lesson.explanation.map((line, i) => <li key={i}>{line}</li>)}</ul>
        </div>
        <div className="pa-info-panel">
          <h3>📈 Your Stats</h3>
          <div className="pa-accuracy-ring" style={{ "--deg": `${accuracy * 3.6}deg` }}><strong>{accuracy}%</strong></div>
          <div className="pa-mini-stats">
            <div className="pa-mini-stat"><span>Correct Answers</span><strong>{correctTotal}</strong></div>
            <div className="pa-mini-stat"><span>Total Attempts</span><strong>{attempts}</strong></div>
            <div className="pa-mini-stat"><span>Current Card</span><strong>{lessonIndex + 1}/{lessons.length}</strong></div>
            <div className="pa-mini-stat"><span>Current Score</span><strong>{checked ? `${correctCount}/${lesson.zones.length}` : "--"}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}
