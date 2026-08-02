import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

export default function ReplayControls({
  playing,
  finished,
  visibleCount,
  totalCandles,
  speed,
  speedOptions = [0.5, 1, 2, 5],
  onPrevious,
  onNext,
  onTogglePlay,
  onReset,
  onRevealAll,
  onSpeedChange,
}) {
  const canGoPrevious = visibleCount > 1;
  const canGoNext = visibleCount < totalCandles;

  return (
    <section className="trqx-replay-controls">
      <div className="trqx-replay-controls__transport">
        <button
          type="button"
          onClick={onReset}
          title="Restart replay"
          aria-label="Restart replay"
        >
          <RotateCcw size={17} />
        </button>

        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          title="Previous candle"
          aria-label="Previous candle"
        >
          <ChevronLeft size={19} />
        </button>

        <button
          type="button"
          className="trqx-replay-controls__play"
          onClick={onTogglePlay}
          disabled={totalCandles <= 1 || (finished && !playing)}
          title={playing ? "Pause replay" : "Play replay"}
        >
          {playing ? <Pause size={19} /> : <Play size={19} />}
          {playing ? "Pause" : finished ? "Complete" : "Play"}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          title="Next candle"
          aria-label="Next candle"
        >
          <ChevronRight size={19} />
        </button>

        <button
          type="button"
          onClick={onRevealAll}
          disabled={finished}
          title="Reveal all candles"
        >
          <Eye size={17} />
          Reveal
        </button>
      </div>

      <div className="trqx-replay-controls__speed">
        <span>Speed</span>

        {speedOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={speed === option ? "active" : ""}
            onClick={() => onSpeedChange(option)}
          >
            {option}x
          </button>
        ))}
      </div>
    </section>
  );
}
