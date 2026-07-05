import React, { useMemo, useState } from "react";

const PATTERN_CARDS = [
  {
    id: "market-structure-001",
    title: "Institutional Market Structure",
    category: "Market Structure",
    difficulty: "Level 2",
    masteryKey: "Market Structure",
    prompt: "Drag each label to the correct part of the chart, then check your answer.",
    labels: ["BOS", "ChoCH", "Order Block", "Liquidity Grab", "Retest", "Entry Zone"],
    zones: [
      {
        id: "bos",
        answer: "BOS",
        x: 73,
        y: 31,
        explainCorrect: "Correct. BOS means Break of Structure. Price broke above the prior swing high, confirming bullish continuation.",
        explainWrong: "This is the BOS area. BOS confirms continuation after price breaks a previous swing high or swing low."
      },
      {
        id: "choch",
        answer: "ChoCH",
        x: 34,
        y: 49,
        explainCorrect: "Correct. ChoCH means Change of Character. This is the first break against the prior bearish structure.",
        explainWrong: "This is ChoCH. It is the first sign that market character may be shifting from bearish to bullish."
      },
      {
        id: "order-block",
        answer: "Order Block",
        x: 46,
        y: 70,
        explainCorrect: "Correct. The Order Block is the last bearish candle area before the strong bullish displacement.",
        explainWrong: "This is the Order Block. Look for the final opposing candle before a strong move away."
      },
      {
        id: "liquidity-grab",
        answer: "Liquidity Grab",
        x: 23,
        y: 78,
        explainCorrect: "Correct. Price swept below the prior low, grabbed liquidity, then reversed aggressively.",
        explainWrong: "This is the Liquidity Grab. It usually appears as a sweep below obvious lows or above obvious highs before reversal."
      },
      {
        id: "retest",
        answer: "Retest",
        x: 58,
        y: 56,
        explainCorrect: "Correct. Price returned to test the broken structure area before continuing higher.",
        explainWrong: "This is the Retest. After a break, price often returns to test the level before continuation."
      },
      {
        id: "entry-zone",
        answer: "Entry Zone",
        x: 54,
        y: 79,
        explainCorrect: "Correct. The entry zone is near the defended order block after confirmation.",
        explainWrong: "This is the Entry Zone. It sits near the order block after structure confirms the setup."
      }
    ]
  }
];

function Pill({ children, tone = "gold" }) {
  return <span className={`pa-pill pa-pill-${tone}`}>{children}</span>;
}

function buildExplanations(card, placed, results) {
  if (!Object.keys(results).length) {
    return [
      "Place each label on the chart, then click Check Answers. The AI Tutor will explain each correct and incorrect label."
    ];
  }

  return card.zones.map((zone) => {
    const userAnswer = placed[zone.id];
    if (results[zone.id]) return `✅ ${zone.answer}: ${zone.explainCorrect}`;
    if (!userAnswer) return `⚠️ ${zone.answer}: You did not place a label here. ${zone.explainWrong}`;
    return `❌ You placed "${userAnswer}" where "${zone.answer}" belongs. ${zone.explainWrong}`;
  });
}

export default function PatternAcademy() {
  const [cardIndex, setCardIndex] = useState(0);
  const [placed, setPlaced] = useState({});
  const [results, setResults] = useState({});
  const [streak, setStreak] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const card = PATTERN_CARDS[cardIndex];
  const total = card.zones.length;
  const answered = Object.keys(results).length > 0;
  const correct = Object.values(results).filter(Boolean).length;
  const accuracy = answered ? Math.round((correct / total) * 100) : 0;
  const mastery = bestScore >= total ? "Mastered" : bestScore >= Math.ceil(total * 0.7) ? "Developing" : "Training";

  const availableLabels = useMemo(() => {
    const used = new Set(Object.values(placed));
    return card.labels.filter((label) => !used.has(label));
  }, [card.labels, placed]);

  const tutorMessages = buildExplanations(card, placed, results);

  function handleDragStart(e, label) {
    e.dataTransfer.setData("text/plain", label);
  }

  function handleDrop(e, zoneId) {
    e.preventDefault();
    const label = e.dataTransfer.getData("text/plain");
    if (!label) return;

    setPlaced((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === label) delete next[key];
      });
      next[zoneId] = label;
      return next;
    });
    setResults({});
  }

  function removePlaced(zoneId) {
    setPlaced((prev) => {
      const next = { ...prev };
      delete next[zoneId];
      return next;
    });
    setResults({});
  }

  function checkAnswers() {
    const checked = {};
    card.zones.forEach((zone) => {
      checked[zone.id] = placed[zone.id] === zone.answer;
    });
    const nextScore = Object.values(checked).filter(Boolean).length;
    setResults(checked);
    setBestScore((prev) => Math.max(prev, nextScore));
    setStreak((prev) => (nextScore === total ? prev + 1 : 0));
  }

  function resetCard() {
    setPlaced({});
    setResults({});
    setShowHint(false);
  }

  function showSolution() {
    const solved = {};
    card.zones.forEach((zone) => {
      solved[zone.id] = zone.answer;
    });
    setPlaced(solved);
    setResults({});
  }

  return (
    <div className="pattern-academy">
      <section className="pa-hero">
        <div>
          <Pill>{card.difficulty}</Pill>
          <Pill tone="blue">{card.category}</Pill>
          <h1>TRQX Pattern Academy</h1>
          <p>{card.prompt}</p>
        </div>

        <div className="pa-stats-grid">
          <div className="pa-stat"><span>Score</span><strong>{answered ? `${correct}/${total}` : "--"}</strong></div>
          <div className="pa-stat"><span>Accuracy</span><strong>{answered ? `${accuracy}%` : "--"}</strong></div>
          <div className="pa-stat"><span>Streak</span><strong>{streak}</strong></div>
          <div className="pa-stat"><span>Mastery</span><strong>{mastery}</strong></div>
        </div>
      </section>

      <section className="pa-badges">
        <div className={bestScore >= 2 ? "earned" : ""}>🏅 Structure Rookie</div>
        <div className={bestScore >= 4 ? "earned" : ""}>🎯 Liquidity Hunter</div>
        <div className={bestScore >= total ? "earned" : ""}>👑 BOS Master</div>
        <div className={streak >= 3 ? "earned" : ""}>🔥 Pattern Streak 3</div>
      </section>

      <main className="pa-layout">
        <aside className="pa-panel">
          <h2>Moveable Labels</h2>
          <p>Drag these onto the chart boxes.</p>

          <div className="pa-label-stack">
            {availableLabels.map((label) => (
              <button
                key={label}
                className="pa-drag-label"
                draggable
                onDragStart={(e) => handleDragStart(e, label)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="pa-actions vertical">
            <button onClick={checkAnswers}>Check Answers</button>
            <button className="secondary" onClick={() => setShowHint((v) => !v)}>Hint</button>
            <button className="secondary" onClick={showSolution}>Show Solution</button>
            <button className="danger" onClick={resetCard}>Reset</button>
          </div>

          {showHint && (
            <div className="pa-hint">
              <strong>Hint:</strong> Start by finding the liquidity sweep first. Then identify the first break against the old trend.
            </div>
          )}
        </aside>

        <section className="pa-chart-card">
          <div className="pa-chart-title">
            <div>
              <h2>{card.title}</h2>
              <p>Click a placed label to remove it.</p>
            </div>
            <Pill tone="green">Interactive Drill</Pill>
          </div>

          <div className="pa-chart-canvas">
            <svg viewBox="0 0 1000 620" className="pa-chart-svg" role="img" aria-label="Interactive market structure chart">
              <defs>
                <linearGradient id="paBg" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0d1524" />
                  <stop offset="100%" stopColor="#05070b" />
                </linearGradient>
                <linearGradient id="goldLine" x1="0" x2="1">
                  <stop offset="0%" stopColor="#f7d36b" />
                  <stop offset="100%" stopColor="#b8860b" />
                </linearGradient>
              </defs>

              <rect width="1000" height="620" rx="26" fill="url(#paBg)" />
              {[120, 220, 320, 420, 520].map((y) => (
                <line key={y} x1="60" y1={y} x2="940" y2={y} stroke="#263247" strokeWidth="2" opacity="0.45" />
              ))}
              {[120, 260, 400, 540, 680, 820].map((x) => (
                <line key={x} x1={x} y1="60" x2={x} y2="560" stroke="#263247" strokeWidth="2" opacity="0.28" />
              ))}

              <polyline
                points="90,410 175,455 260,500 345,380 430,430 515,305 610,350 705,230 810,270 915,145"
                fill="none"
                stroke="url(#goldLine)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="90,410 175,455 260,500 345,380 430,430 515,305 610,350 705,230 810,270 915,145"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />

              <rect x="385" y="430" width="215" height="86" rx="12" fill="#d4af3724" stroke="#d4af37" strokeWidth="3" strokeDasharray="10 8" />
              <rect x="185" y="490" width="155" height="42" rx="10" fill="#ef444422" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 7" />
              <line x1="650" y1="265" x2="910" y2="265" stroke="#3b82f6" strokeWidth="4" strokeDasharray="12 8" />
              <line x1="250" y1="425" x2="520" y2="425" stroke="#a78bfa" strokeWidth="4" strokeDasharray="12 8" />
              <circle cx="515" cy="305" r="12" fill="#22c55e" />
              <circle cx="260" cy="500" r="12" fill="#ef4444" />
              <circle cx="705" cy="230" r="12" fill="#3b82f6" />
              <circle cx="610" cy="350" r="12" fill="#d4af37" />
            </svg>

            {card.zones.map((zone) => (
              <div
                key={zone.id}
                className={`pa-drop-zone ${results[zone.id] === true ? "correct" : ""} ${results[zone.id] === false ? "wrong" : ""}`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, zone.id)}
                onClick={() => placed[zone.id] && removePlaced(zone.id)}
              >
                {placed[zone.id] || "Drop Label"}
              </div>
            ))}
          </div>
        </section>

        <aside className="pa-panel pa-tutor">
          <h2>AI Tutor</h2>
          <p className="pa-muted">Personalized pattern feedback.</p>

          <div className="pa-tutor-box">
            {tutorMessages.map((msg, index) => (
              <div key={index} className="pa-tutor-message">{msg}</div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
