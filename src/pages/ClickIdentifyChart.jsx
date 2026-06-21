import React, { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";

export default function ClickIdentifyChart({ prices, correctIndex, prompt, explanation, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const width = 600;
  const height = 220;
  const padding = 40;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices.map((price, i) => {
    const x = padding + (i * (width - padding * 2)) / (prices.length - 1);
    const y = height - padding - ((price - min) / range) * (height - padding * 2);
    return { x, y, price, index: i };
  });

  const pathD = points.map((p, i) => (i === 0 ? "M " + p.x + " " + p.y : "L " + p.x + " " + p.y)).join(" ");

  function handleClick(index) {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (onComplete) onComplete(index === correctIndex);
  }

  function handleRetry() {
    setSelected(null);
    setAnswered(false);
  }

  const isCorrect = selected === correctIndex;

  return (
    <div className="drillContainer">
      <p className="drillPrompt">{prompt}</p>

      <svg viewBox={"0 0 " + width + " " + height} className="drillChart" role="img" aria-label="Price chart">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,.15)" strokeWidth="1" />
        <path d={pathD} fill="none" stroke="rgba(212,175,55,.6)" strokeWidth="2" />

        {points.map((p) => {
          const isSelected = selected === p.index;
          const isCorrectPoint = answered && p.index === correctIndex;
          const isWrongSelection = answered && isSelected && !isCorrectPoint;

          let fill = "#d4af37";
          if (answered) {
            if (isCorrectPoint) fill = "#22c55e";
            else if (isWrongSelection) fill = "#ef4444";
            else fill = "rgba(212,175,55,.3)";
          }

          return (
            <g key={p.index}>
              <circle
                cx={p.x}
                cy={p.y}
                r={answered ? 9 : 12}
                fill={fill}
                stroke={answered ? "none" : "rgba(212,175,55,.3)"}
                strokeWidth="6"
                style={{ cursor: answered ? "default" : "pointer" }}
                onClick={() => handleClick(p.index)}
              />
              <text
                x={p.x}
                y={p.y - 16}
                textAnchor="middle"
                fontSize="12"
                fill="#9ca3af"
                fontFamily="monospace"
              >
                {p.price}
              </text>
            </g>
          );
        })}
      </svg>

      {answered && (
        <div className={"drillResult " + (isCorrect ? "correct" : "incorrect")}>
          {isCorrect ? <Check size={16} /> : <X size={16} />}
          <span>{isCorrect ? "Correct!" : "Not quite - the answer was " + prices[correctIndex]}</span>
        </div>
      )}

      {answered && explanation && <p className="drillExplanation">{explanation}</p>}

      {answered && !isCorrect && (
        <button className="drillRetryBtn" onClick={handleRetry}>
          <RotateCcw size={14} /> Try again
        </button>
      )}
    </div>
  );
}
