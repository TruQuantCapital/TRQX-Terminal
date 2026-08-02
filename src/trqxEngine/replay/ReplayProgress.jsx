import React from "react";

export default function ReplayProgress({
  visibleCount,
  totalCandles,
  progress,
  finished,
}) {
  return (
    <section className="trqx-replay-progress">
      <div className="trqx-replay-progress__copy">
        <span>
          Candle {visibleCount} of {totalCandles}
        </span>

        <strong>
          {finished ? "Replay complete" : `${progress}%`}
        </strong>
      </div>

      <div
        className="trqx-replay-progress__track"
        role="progressbar"
        aria-label="Replay progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress}
      >
        <div
          className="trqx-replay-progress__fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}
