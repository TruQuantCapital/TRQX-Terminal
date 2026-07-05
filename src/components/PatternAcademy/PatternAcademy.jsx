import React, { useMemo, useState } from "react";
import "./PatternAcademy.css";

const GOLD = "#d4af37";

const lessons = [
  {
    id: "head-shoulders",
    title: "Head & Shoulder Pattern",
    level: "Intermediate",
    progress: "3 / 10",
    trend: "Bullish → Bearish",
    labels: [
      { id: "head", text: "Head", help: "Highest peak between two shoulders", color: "gold" },
      { id: "leftShoulder", text: "Left Shoulder", help: "First peak before the head", color: "blue" },
      { id: "rightShoulder", text: "Right Shoulder", help: "Lower peak after the head", color: "green" },
      { id: "neckline", text: "Neckline", help: "Support level connecting lows", color: "purple" },
      { id: "support", text: "Support Area", help: "Key support zone under neckline", color: "green" },
      { id: "breakdown", text: "Breakdown", help: "Price breaks below neckline", color: "red" },
    ],
    zones: [
      { id: "head", x: 49, y: 18, hint: "The highest peak sits in the middle." },
      { id: "leftShoulder", x: 27, y: 37, hint: "First peak before the highest point." },
      { id: "rightShoulder", x: 69, y: 39, hint: "Lower peak after the head." },
      { id: "neckline", x: 13, y: 60, hint: "Horizontal support connecting both major lows." },
      { id: "support", x: 50, y: 72, hint: "Area under the neckline where buyers tried to defend price." },
      { id: "breakdown", x: 86, y: 68, hint: "The move that confirms the bearish pattern." },
    ],
    candles: [
      [8,82,"green",24,0],[10,78,"green",30,0],[12,72,"green",34,1],[14,67,"green",36,0],[16,62,"green",40,1],[18,56,"green",42,0],[20,50,"green",46,1],
      [22,45,"red",34,0],[24,40,"green",38,1],[26,36,"red",34,1],[28,42,"red",42,0],[30,50,"red",44,1],[33,59,"green",35,0],[36,53,"green",34,0],
      [39,46,"green",34,1],[42,38,"green",38,0],[45,30,"green",48,1],[48,22,"green",54,1],[50,18,"red",60,1],[52,26,"red",44,1],[55,34,"red",40,0],
      [58,42,"green",32,0],[61,48,"red",36,0],[64,45,"green",34,0],[67,41,"green",38,0],[70,39,"red",42,1],[73,45,"red",42,0],[75,54,"red",48,1],
      [78,61,"red",44,1],[81,67,"red",40,0],[84,72,"red",36,0],[87,76,"red",34,1]
    ],
    supports: [{ x: 35, y: 60 }, { x: 65, y: 60 }],
    explanation: [
      "The Head & Shoulders pattern is a bearish reversal pattern that forms after an uptrend.",
      "It has three peaks: left shoulder, head, and right shoulder.",
      "The neckline connects the two major reaction lows.",
      "The breakdown below the neckline confirms the pattern."
    ],
    ai: {
      head: "Correct: the head is the highest peak and should stand above both shoulders.",
      leftShoulder: "Correct: the left shoulder is the first peak before price pushes into the higher head.",
      rightShoulder: "Correct: the right shoulder forms after the head and fails to make a new high.",
      neckline: "Correct: the neckline is the support level connecting the reaction lows.",
      support: "Correct: this support area is where buyers tried to defend the neckline before failure.",
      breakdown: "Correct: the breakdown confirms sellers have taken control after the neckline breaks."
    }
  },
  {
    id: "inverse-head-shoulders",
    title: "Inverse Head & Shoulder Pattern",
    level: "Intermediate",
    progress: "4 / 10",
    trend: "Bearish → Bullish",
    labels: [
      { id: "leftShoulder", text: "Left Shoulder", help: "First low before the head", color: "blue" },
      { id: "head", text: "Head", help: "Deepest low in the structure", color: "gold" },
      { id: "rightShoulder", text: "Right Shoulder", help: "Higher low after the head", color: "green" },
      { id: "neckline", text: "Neckline", help: "Resistance connecting highs", color: "purple" },
      { id: "choch", text: "CHoCH", help: "Change of character shift", color: "blue" },
      { id: "breakout", text: "Breakout", help: "Price breaks above neckline", color: "green" },
    ],
    zones: [
      { id: "leftShoulder", x: 27, y: 61, hint: "First low before the deepest low." },
      { id: "head", x: 50, y: 78, hint: "The deepest low is the head." },
      { id: "rightShoulder", x: 70, y: 61, hint: "Higher low after the head." },
      { id: "neckline", x: 16, y: 35, hint: "Resistance connecting the swing highs." },
      { id: "choch", x: 54, y: 43, hint: "First meaningful shift against the bearish trend." },
      { id: "breakout", x: 86, y: 25, hint: "Move above the neckline confirms bullish reversal." },
    ],
    candles: [
      [8,25,"red",30,0],[10,30,"red",34,0],[12,37,"red",38,1],[15,45,"green",30,0],[18,54,"red",42,1],[21,61,"green",36,0],[25,58,"green",38,1],
      [30,48,"green",32,0],[34,39,"red",34,0],[38,51,"red",42,1],[42,63,"red",46,0],[47,73,"red",50,1],[50,78,"green",48,1],[53,70,"green",38,0],
      [57,61,"green",36,0],[61,52,"green",34,1],[65,43,"red",34,0],[69,57,"red",38,0],[72,61,"green",36,1],[76,53,"green",38,0],[80,42,"green",44,1],
      [84,33,"green",46,1],[88,24,"green",50,1]
    ],
    supports: [{ x: 32, y: 35 }, { x: 66, y: 35 }],
    explanation: [
      "The Inverse Head & Shoulders pattern is a bullish reversal after a downtrend.",
      "It forms with three lows: left shoulder, head, and right shoulder.",
      "The neckline acts as resistance until buyers break through it.",
      "The breakout above the neckline confirms the reversal."
    ],
    ai: {
      leftShoulder: "Correct: this is the first major low before the deeper head forms.",
      head: "Correct: the head is the deepest low in the inverse structure.",
      rightShoulder: "Correct: the right shoulder is a higher low, showing sellers lost strength.",
      neckline: "Correct: the neckline connects the reaction highs and acts as resistance.",
      choch: "Correct: CHoCH marks the first shift against the old bearish structure.",
      breakout: "Correct: the breakout above the neckline confirms the bullish reversal."
    }
  }
];

function Candle({ x, y, color, h, focus }) {
  const width = Math.max(13, Math.min(23, h / 2.5));
  return (
    <div
      className={`pa-candle ${color} ${focus ? "focus" : ""}`}
      style={{ left: `${x}%`, top: `${y}%`, height: `${h}px`, "--w": `${width}px`, "--h": `${h}px` }}
    >
      <div className="wick" />
      <div className="body" />
    </div>
  );
}

export default function PatternAcademy() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [placed, setPlaced] = useState({});
  const [results, setResults] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(24);
  const [correctTotal, setCorrectTotal] = useState(22);
  const [streak, setStreak] = useState(14);
  const [xp, setXp] = useState(2450);
  const lesson = lessons[lessonIndex];

  const correctCount = Object.values(results).filter(Boolean).length;
  const checked = Object.keys(results).length > 0;
  const accuracy = Math.round((correctTotal / Math.max(attempts, 1)) * 100);
  const placedValues = Object.values(placed);

  const feedback = useMemo(() => {
    if (!checked) return [];
    return lesson.zones.map((zone) => {
      const value = placed[zone.id];
      if (value === zone.id) return { good: true, text: lesson.ai[zone.id] };
      if (!value) return { good: false, text: `Missing: ${lesson.labels.find(l => l.id === zone.id)?.text}. ${zone.hint}` };
      const selected = lesson.labels.find(l => l.id === value)?.text || value;
      const correct = lesson.labels.find(l => l.id === zone.id)?.text || zone.id;
      return { good: false, text: `Almost. You placed ${selected}, but this area is ${correct}. ${zone.hint}` };
    });
  }, [checked, lesson, placed]);

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
      nextResults[zone.id] = placed[zone.id] === zone.id;
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

  return (
    <section className="pattern-academy-shell">
      <div className="pa-topbar">
        <div>
          <div className="pa-brandline">TRQX Pattern Academy</div>
          <div className="pa-title-row">
            <h2>{lesson.title}</h2>
            <span className="pa-level-pill">{lesson.level}</span>
          </div>
          <div className="pa-subtext">Drag each label to the correct area on the chart. Check your answer to unlock AI Tutor feedback.</div>
        </div>
        <div className="pa-stats-strip">
          <div className="pa-stat gold"><span>XP</span><strong>{xp.toLocaleString()}</strong></div>
          <div className="pa-stat"><span>Streak</span><strong>🔥 {streak}</strong></div>
          <div className="pa-stat green"><span>Accuracy</span><strong>{accuracy}%</strong></div>
          <div className="pa-stat blue"><span>Level</span><strong>18</strong></div>
        </div>
      </div>

      <div className="pa-main-grid">
        <div className="pa-board">
          <div className="pa-board-head">
            <div>
              <span className="pa-day-pill">D1</span>
              <span className="pa-trend-pill">TREND: <span style={{ color: '#22c55e' }}>{lesson.trend.split('→')[0]}</span> → <span style={{ color: '#ef4444' }}>{lesson.trend.split('→')[1]}</span></span>
            </div>
            <div className="pa-progress-wrap">
              <div className="pa-progress-label"><span>Progress</span><span>{lesson.progress}</span></div>
              <div className="pa-progress-track"><div className="pa-progress-fill" style={{ width: `${((lessonIndex + 3) / 10) * 100}%` }} /></div>
            </div>
          </div>

          <div className="pa-chart">
            <div className="pa-price-axis"><span>1.16000</span><span>1.15000</span><span>1.14000</span><span>1.13000</span><span>1.12000</span><span>1.11000</span><span>1.10000</span></div>
            <div className="pa-time-axis"><span>Apr</span><span>15</span><span>May</span><span>15</span><span>Jun</span><span>15</span><span>Jul</span></div>
            {lesson.id === "head-shoulders" && <div className="pa-neckline" />}
            {lesson.supports?.map((s, i) => <div key={i} className="pa-support-circle" style={{ left: `${s.x}%`, top: `${s.y}%` }} />)}
            {lesson.candles.map((c, i) => <Candle key={i} x={c[0]} y={c[1]} color={c[2]} h={c[3]} focus={!!c[4]} />)}

            {lesson.zones.map((zone, index) => {
              const label = lesson.labels.find((l) => l.id === placed[zone.id]);
              const state = checked ? (results[zone.id] ? "correct" : "wrong") : "";
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
                  {checked && results[zone.id] && <span className="pa-zone-label">{lesson.labels.find(l => l.id === zone.id)?.text}</span>}
                  <span className="pa-zone-text">{label?.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="pa-side-panel">
          <div className="pa-side-title">🏆 Drag These Labels</div>
          {lesson.labels.map((label) => (
            <div
              key={label.id}
              draggable
              onDragStart={(e) => handleDragStart(e, label.id)}
              className={`pa-drag-label ${label.color} ${placedValues.includes(label.id) ? "used" : ""}`}
            >
              <strong>{label.text}</strong>
              <span>{label.help}</span>
            </div>
          ))}

          <div className="pa-control-card">
            <button className="pa-button ghost" onClick={() => setShowHint((v) => !v)}>💡 Hint</button>
            {showHint && <p style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.55, margin: '10px 0 0' }}>{lesson.zones.find(z => !placed[z.id])?.hint || "All labels placed. Check your answer."}</p>}
            <button className="pa-button" onClick={checkAnswers}>Check Answer</button>
            <button className="pa-button secondary" onClick={reset}>Reset</button>
            <button className="pa-button next" onClick={nextLesson}>Next Pattern →</button>
          </div>
        </aside>
      </div>

      <div className="pa-bottom-grid">
        <div className="pa-info-panel">
          <h3>🤖 AI Tutor Feedback</h3>
          {!checked ? (
            <p>Drag the labels to the correct locations, then click <b style={{ color: GOLD }}>Check Answer</b>. The AI Tutor will explain each correct and incorrect answer.</p>
          ) : (
            feedback.map((line, i) => <div key={i} className={`pa-feedback-line ${line.good ? 'good' : 'bad'}`}>{line.good ? '✅' : '❌'} {line.text}</div>)
          )}
        </div>

        <div className="pa-info-panel">
          <h3>📖 Pattern Explanation</h3>
          <ul>{lesson.explanation.map((line) => <li key={line}>{line}</li>)}</ul>
        </div>

        <div className="pa-info-panel">
          <h3>📈 Your Stats</h3>
          <div className="pa-accuracy-ring" style={{ "--deg": `${Math.min(accuracy, 100) * 3.6}deg` }}><strong>{accuracy}%</strong></div>
          <div className="pa-mini-stats">
            <div className="pa-mini-stat"><span>Correct Answers</span><strong>{correctTotal}</strong></div>
            <div className="pa-mini-stat"><span>Total Attempts</span><strong>{attempts}</strong></div>
            <div className="pa-mini-stat"><span>Best Streak</span><strong>{Math.max(streak, 18)}</strong></div>
            <div className="pa-mini-stat"><span>Patterns Mastered</span><strong>15 / 84</strong></div>
          </div>
          <div className="pa-badges"><span className="pa-badge">🏆</span><span className="pa-badge">🔥</span><span className="pa-badge">🎯</span><span className="pa-badge">👑</span></div>
        </div>
      </div>
    </section>
  );
}
