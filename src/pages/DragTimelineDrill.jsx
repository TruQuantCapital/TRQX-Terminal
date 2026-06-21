import React, { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";

export default function DragTimelineDrill({ slots, chips, prompt, onComplete }) {
  const [placements, setPlacements] = useState({});
  const [draggedChip, setDraggedChip] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const usedChips = Object.values(placements);
  const availableChips = chips.filter((c) => !usedChips.includes(c));
  const allPlaced = Object.keys(placements).length === slots.length;

  function handleDragStart(chip) {
    if (submitted) return;
    setDraggedChip(chip);
  }

  function handleDrop(slotId) {
    if (submitted || !draggedChip) return;
    setPlacements((prev) => ({ ...prev, [slotId]: draggedChip }));
    setDraggedChip(null);
  }

  function handleRemove(slotId) {
    if (submitted) return;
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }

  function handleSubmit() {
    setSubmitted(true);
    const allCorrect = slots.every((s) => placements[s.id] === s.correctChip);
    if (onComplete) onComplete(allCorrect);
  }

  function handleRetry() {
    setPlacements({});
    setSubmitted(false);
  }

  return (
    <div className="drillContainer">
      <p className="drillPrompt">{prompt}</p>

      <div className="dragLabelPool">
        {availableChips.map((chip) => (
          <div
            key={chip}
            className="dragLabelChip"
            draggable={!submitted}
            onDragStart={() => handleDragStart(chip)}
          >
            {chip}
          </div>
        ))}
        {availableChips.length === 0 && !submitted && (
          <span className="dragLabelPoolEmpty">All placed - review and submit</span>
        )}
      </div>

      <div className="timelineTrack">
        {slots.map((slot) => {
          const placedChip = placements[slot.id];
          const isCorrect = submitted && placedChip === slot.correctChip;
          const isWrong = submitted && placedChip && placedChip !== slot.correctChip;

          return (
            <div
              key={slot.id}
              className={"timelineSlot " + (isCorrect ? "correct" : "") + " " + (isWrong ? "incorrect" : "")}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(slot.id)}
            >
              <div className="timelineSlotTime">{slot.label}</div>
              {slot.sublabel && <div className="timelineSlotSub">{slot.sublabel}</div>}

              {placedChip ? (
                <button
                  className="dragChartLabel"
                  onClick={() => handleRemove(slot.id)}
                  disabled={submitted}
                >
                  {placedChip}
                  {submitted && (isCorrect ? <Check size={14} /> : <X size={14} />)}
                </button>
              ) : (
                <div className="dragChartPlaceholder">Drop here</div>
              )}

              {submitted && isWrong && (
                <div className="dragChartCorrectAnswer">Correct: {slot.correctChip}</div>
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
