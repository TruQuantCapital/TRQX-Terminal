import React, { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";

export default function DragLabelDrill({ charts, labels, prompt, onComplete }) {
  const [placements, setPlacements] = useState({});
  const [draggedLabel, setDraggedLabel] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const usedLabels = Object.values(placements);
  const availableLabels = labels.filter((l) => !usedLabels.includes(l));
  const allPlaced = Object.keys(placements).length === charts.length;

  function handleDragStart(label) {
    if (submitted) return;
    setDraggedLabel(label);
  }

  function handleDrop(chartId) {
    if (submitted || !draggedLabel) return;
    setPlacements((prev) => ({ ...prev, [chartId]: draggedLabel }));
    setDraggedLabel(null);
  }

  function handleRemove(chartId) {
    if (submitted) return;
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[chartId];
      return next;
    });
  }

  function handleSubmit() {
    setSubmitted(true);
    const allCorrect = charts.every((c) => placements[c.id] === c.correctLabel);
    if (onComplete) onComplete(allCorrect);
  }

  function handleRetry() {
    setPlacements({});
    setSubmitted(false);
  }

  function miniChartPath(prices, w, h, pad) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const pts = prices.map((price, i) => {
      const x = pad + (i * (w - pad * 2)) / (prices.length - 1);
      const y = h - pad - ((price - min) / range) * (h - pad * 2);
      return (i === 0 ? "M " : "L ") + x + " " + y;
    });
    return pts.join(" ");
  }

  return (
    <div className="drillContainer">
      <p className="drillPrompt">{prompt}</p>

      <div className="dragLabelPool">
        {availableLabels.map((label) => (
          <div
            key={label}
            className="dragLabelChip"
            draggable={!submitted}
            onDragStart={() => handleDragStart(label)}
          >
            {label}
          </div>
        ))}
        {availableLabels.length === 0 && !submitted && (
          <span className="dragLabelPoolEmpty">All labels placed - review and submit</span>
        )}
      </div>

      <div className="dragChartGrid">
        {charts.map((chart) => {
          const placedLabel = placements[chart.id];
          const isCorrect = submitted && placedLabel === chart.correctLabel;
          const isWrong = submitted && placedLabel && placedLabel !== chart.correctLabel;

          return (
            <div
              key={chart.id}
              className={"dragChartSlot " + (isCorrect ? "correct" : "") + " " + (isWrong ? "incorrect" : "")}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(chart.id)}
            >
              <svg viewBox="0 0 200 100" className="dragMiniChart">
                <path
                  d={miniChartPath(chart.prices, 200, 100, 16)}
                  fill="none"
                  stroke="rgba(212,175,55,.7)"
                  strokeWidth="2"
                />
              </svg>

              {placedLabel ? (
                <button
                  className="dragChartLabel"
                  onClick={() => handleRemove(chart.id)}
                  disabled={submitted}
                >
                  {placedLabel}
                  {submitted && (isCorrect ? <Check size={14} /> : <X size={14} />)}
                </button>
              ) : (
                <div className="dragChartPlaceholder">Drop label here</div>
              )}

              {submitted && isWrong && (
                <div className="dragChartCorrectAnswer">Correct: {chart.correctLabel}</div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button className="drillSubmitBtn" disabled={!allPlaced} onClick={handleSubmit}>
          Submit
        </button>
      ) : (
        <button className="drillRetryBtn" onClick={handleRetry}>
          <RotateCcw size={14} /> Try again
        </button>
      )}
    </div>
  );
}
