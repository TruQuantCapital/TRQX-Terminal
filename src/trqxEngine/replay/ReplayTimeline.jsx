import React from "react";

export default function ReplayTimeline({
  candles,
  visibleCount,
  onSelect,
}) {
  return (
    <div className="trqx-replay-timeline">
      {candles.map((candle, index) => {
        const count = index + 1;
        const visible = count <= visibleCount;
        const current = count === visibleCount;

        return (
          <button
            key={`${candle.time}-${index}`}
            type="button"
            className={[
              "trqx-replay-timeline__step",
              visible ? "visible" : "",
              current ? "current" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect(count)}
            title={`Go to candle ${count}`}
          >
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
