import React from "react";
import { CHART } from "./constants";
import {
  Arrow,
  Candle,
  ChartGrid,
  StageLabel,
  StaticLabel,
  TrendLine,
} from "./ChartPrimitives";
import DropTarget from "./DropTarget";

export default function PatternRenderer({
  pattern,
  answers,
  selectedLabel,
  onAssign,
  onClear,
}) {
  return (
    <svg
      className="trqx-v2-chart"
      viewBox={`0 0 ${CHART.width} ${CHART.height}`}
      role="img"
      aria-label={`${pattern.title} interactive chart`}
    >
      <ChartGrid />

      {(pattern.lines || []).map((line) => (
        <TrendLine key={line.id} line={line} />
      ))}

      {(pattern.candles || []).map((candle) => (
        <Candle key={candle.id} candle={candle} />
      ))}

      {(pattern.arrows || []).map((arrow) => (
        <Arrow key={arrow.id} arrow={arrow} />
      ))}

      {(pattern.labels || []).map((label) => (
        <StaticLabel key={label.id} label={label} />
      ))}

      {(pattern.targets || []).map((target) => (
        <DropTarget
          key={target.id}
          target={target}
          value={answers[target.id]}
          selectedLabel={selectedLabel}
          onAssign={onAssign}
          onClear={onClear}
        />
      ))}

      <StageLabel x={0.12} text="Setup" />
      <StageLabel x={0.32} text="Context" />
      <StageLabel x={0.56} text="Pattern" />
      <StageLabel x={0.76} text="Confirm" />
      <StageLabel x={0.92} text="Entry" />
    </svg>
  );
}
