import React, { useMemo } from "react";
import { validateOHLC } from "../validation/validateOHLC";

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function formatPrice(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(2);
}

export default function PatternRenderer({
  scenario,
  width = 920,
  height = 520,
  showLevels = true,
  showLabels = true,
}) {
  const candles = scenario?.candles ?? [];

  const validation = useMemo(
    () => validateOHLC(candles),
    [candles]
  );

  if (!scenario) {
    return (
      <div className="trqx-pattern-error">
        No scenario was supplied.
      </div>
    );
  }

  if (!validation.valid) {
    return (
      <div className="trqx-pattern-error">
        <strong>Invalid market scenario</strong>

        <ul>
          {validation.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  const padding = {
    top: 48,
    right: 110,
    bottom: 58,
    left: 72,
  };

  const chartWidth =
    width - padding.left - padding.right;

  const chartHeight =
    height - padding.top - padding.bottom;

  const allPrices = candles.flatMap((candle) => [
    candle.high,
    candle.low,
  ]);

  if (showLevels && scenario.levels) {
    Object.values(scenario.levels).forEach((value) => {
      if (Number.isFinite(value)) {
        allPrices.push(value);
      }
    });
  }

  const rawMinimum = Math.min(...allPrices);
  const rawMaximum = Math.max(...allPrices);
  const rawRange = rawMaximum - rawMinimum || 1;
  const pricePadding = rawRange * 0.12;

  const minimumPrice = rawMinimum - pricePadding;
  const maximumPrice = rawMaximum + pricePadding;
  const priceRange = maximumPrice - minimumPrice;

  const spacing = chartWidth / candles.length;
  const candleWidth = clamp(spacing * 0.52, 12, 54);

  function scaleX(index) {
    return padding.left + spacing * (index + 0.5);
  }

  function scaleY(price) {
    return (
      padding.top +
      chartHeight -
      ((price - minimumPrice) / priceRange) *
        chartHeight
    );
  }

  const levelStyles = {
    support: {
      label: "Support",
      stroke: "#38bdf8",
      dash: "8 6",
    },

    confirmation: {
      label: "Confirmation",
      stroke: "#f4d35e",
      dash: "6 5",
    },

    entry: {
      label: "Entry",
      stroke: "#22c55e",
      dash: "4 4",
    },

    stop: {
      label: "Stop",
      stroke: "#ef4444",
      dash: "4 4",
    },

    target1: {
      label: "Target 1",
      stroke: "#a78bfa",
      dash: "5 5",
    },

    target2: {
      label: "Target 2",
      stroke: "#c084fc",
      dash: "5 5",
    },
  };

  const visibleLevels = Object.entries(
    scenario.levels ?? {}
  ).filter(
    ([key, value]) =>
      showLevels &&
      levelStyles[key] &&
      Number.isFinite(value)
  );

  return (
    <section
      className="trqx-pattern-renderer"
      style={{
        border: "1px solid rgba(212,175,55,0.38)",
        borderRadius: "16px",
        overflow: "hidden",
        background:
          "linear-gradient(180deg,#0c1119 0%,#080b11 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          padding: "18px 22px",
          borderBottom:
            "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div>
          <small
            style={{
              color: "#d4af37",
              letterSpacing: "0.14em",
              fontWeight: 800,
            }}
          >
            TRQX MARKET SCENARIO
          </small>

          <h2
            style={{
              margin: "6px 0 2px",
              color: "#ffffff",
            }}
          >
            {scenario.answer?.pattern ??
              scenario.type}
          </h2>

          <span style={{ color: "#8f98aa" }}>
            {scenario.context?.priorTrend} ·{" "}
            {scenario.context?.location} ·{" "}
            {scenario.context?.confirmation
              ? "confirmed"
              : "unconfirmed"}
          </span>
        </div>

        <div
          style={{
            textAlign: "right",
            color: scenario.answer?.validSetup
              ? "#22c55e"
              : "#ef4444",
            fontWeight: 800,
          }}
        >
          {scenario.answer?.validSetup
            ? "VALID SETUP"
            : "PASS"}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label={`${scenario.answer?.pattern ?? scenario.type} market scenario`}
      >
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="#0b1017"
        />

        {[0, 0.25, 0.5, 0.75, 1].map(
          (percentage) => {
            const y =
              padding.top +
              chartHeight * percentage;

            const price =
              maximumPrice -
              priceRange * percentage;

            return (
              <g key={percentage}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="3 5"
                />

                <text
                  x={padding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fill="#7f899b"
                  fontSize="12"
                >
                  {formatPrice(price)}
                </text>
              </g>
            );
          }
        )}

        {visibleLevels.map(([key, value]) => {
          const style = levelStyles[key];
          const y = scaleY(value);

          return (
            <g key={key}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke={style.stroke}
                strokeWidth="2"
                strokeDasharray={style.dash}
                opacity="0.82"
              />

              <text
                x={width - padding.right + 10}
                y={y + 4}
                fill={style.stroke}
                fontSize="12"
                fontWeight="700"
              >
                {style.label} {formatPrice(value)}
              </text>
            </g>
          );
        })}

        {candles.map((candle, index) => {
          const x = scaleX(index);

          const openY = scaleY(candle.open);
          const closeY = scaleY(candle.close);
          const highY = scaleY(candle.high);
          const lowY = scaleY(candle.low);

          const bullish =
            candle.close >= candle.open;

          const color = bullish
            ? "#22c55e"
            : "#ef4444";

          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(
            Math.abs(closeY - openY),
            2
          );

          const isKeyCandle =
            candle.role === "hammer" ||
            candle.role === "confirmation" ||
            candle.role === "failed-confirmation";

          return (
            <g key={`${candle.time}-${index}`}>
              {isKeyCandle ? (
                <rect
                  x={x - candleWidth * 0.82}
                  y={padding.top}
                  width={candleWidth * 1.64}
                  height={chartHeight}
                  rx="8"
                  fill="rgba(244,211,94,0.055)"
                  stroke="rgba(244,211,94,0.24)"
                  strokeDasharray="4 4"
                />
              ) : null}

              <line
                x1={x}
                x2={x}
                y1={highY}
                y2={lowY}
                stroke={color}
                strokeWidth="3"
              />

              <rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                rx="2"
                fill={color}
                stroke={color}
              />

              <text
                x={x}
                y={height - 25}
                textAnchor="middle"
                fill="#7f899b"
                fontSize="12"
              >
                {candle.time}
              </text>

              {showLabels &&
              candle.role &&
              candle.role !== "downtrend" &&
              candle.role !== "follow-through" ? (
                <text
                  x={x}
                  y={Math.max(highY - 16, 24)}
                  textAnchor="middle"
                  fill="#f4d35e"
                  fontSize="12"
                  fontWeight="800"
                >
                  {candle.role
                    .replaceAll("-", " ")
                    .toUpperCase()}
                </text>
              ) : null}
            </g>
          );
        })}

        <text
          x={padding.left}
          y={height - 5}
          fill="#6f7888"
          fontSize="11"
        >
          Generated and validated by the TRQX Engine
        </text>
      </svg>

      <div
        style={{
          padding: "18px 22px",
          borderTop:
            "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <strong style={{ color: "#ffffff" }}>
          Decision
        </strong>

        <p
          style={{
            margin: "7px 0",
            color: "#cbd1dc",
          }}
        >
          {scenario.answer?.action}
        </p>

        <small style={{ color: "#8f98aa" }}>
          {scenario.explanation}
        </small>
      </div>
    </section>
  );
}
