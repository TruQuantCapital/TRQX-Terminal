import React from "react";
import { CHART, COLORS } from "./constants";
import { nx, ny } from "./geometry";

export function ChartGrid() {
  const vertical = Array.from({ length: 12 }, (_, i) => i / 11);
  const horizontal = Array.from({ length: 6 }, (_, i) => i / 5);

  return (
    <g>
      <rect
        x={0}
        y={0}
        width={CHART.width}
        height={CHART.height}
        rx={18}
        fill={COLORS.background}
      />

      {vertical.map((value) => (
        <line
          key={`v-${value}`}
          x1={nx(value)}
          y1={CHART.plotTop}
          x2={nx(value)}
          y2={CHART.plotBottom}
          stroke={COLORS.grid}
          strokeWidth="1"
        />
      ))}

      {horizontal.map((value) => (
        <line
          key={`h-${value}`}
          x1={CHART.plotLeft}
          y1={ny(value)}
          x2={CHART.plotRight}
          y2={ny(value)}
          stroke={COLORS.grid}
          strokeWidth="1"
        />
      ))}
    </g>
  );
}

export function Candle({ candle }) {
  const color = candle.close <= candle.open ? COLORS.green : COLORS.red;
  const x = nx(candle.x);
  const bodyTop = ny(Math.min(candle.open, candle.close));
  const bodyBottom = ny(Math.max(candle.open, candle.close));
  const width = candle.width || 18;

  return (
    <g data-candle-id={candle.id}>
      <line
        x1={x}
        y1={ny(candle.high)}
        x2={x}
        y2={ny(candle.low)}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect
        x={x - width / 2}
        y={bodyTop}
        width={width}
        height={Math.max(8, bodyBottom - bodyTop)}
        rx="5"
        fill={color}
        style={{ filter: `drop-shadow(0 0 8px ${color}55)` }}
      />
    </g>
  );
}

export function TrendLine({ line }) {
  return (
    <line
      x1={nx(line.x1)}
      y1={ny(line.y1)}
      x2={nx(line.x2)}
      y2={ny(line.y2)}
      stroke={line.color || COLORS.gold}
      strokeWidth={line.width || 3}
      strokeDasharray={line.dashed ? "9 7" : undefined}
      strokeLinecap="round"
    />
  );
}

export function Arrow({ arrow }) {
  const markerId = `arrow-${arrow.id}`;

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={arrow.color || COLORS.green} />
        </marker>
      </defs>
      <line
        x1={nx(arrow.x1)}
        y1={ny(arrow.y1)}
        x2={nx(arrow.x2)}
        y2={ny(arrow.y2)}
        stroke={arrow.color || COLORS.green}
        strokeWidth={arrow.width || 4}
        markerEnd={`url(#${markerId})`}
        strokeLinecap="round"
      />
    </g>
  );
}

export function StaticLabel({ label }) {
  const width = Math.max(92, label.text.length * 7.2 + 24);
  const x = nx(label.x) - width / 2;
  const y = ny(label.y) - 15;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={30}
        rx={8}
        fill="rgba(3,8,18,0.92)"
        stroke={label.color || COLORS.gold}
      />
      <text
        x={nx(label.x)}
        y={ny(label.y) + 5}
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fill={label.color || COLORS.text}
      >
        {label.text}
      </text>
    </g>
  );
}

export function StageLabel({ x, text }) {
  return (
    <text
      x={nx(x)}
      y={CHART.height - 18}
      textAnchor="middle"
      fill={COLORS.text}
      fontSize="14"
      fontWeight="800"
    >
      {text}
    </text>
  );
}
