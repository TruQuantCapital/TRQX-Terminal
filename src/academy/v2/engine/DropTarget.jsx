import React from "react";
import { COLORS } from "./constants";
import { nx, ny } from "./geometry";

export default function DropTarget({
  target,
  value,
  selectedLabel,
  onAssign,
  onClear,
}) {
  const width = Math.max(112, String(value || target.answer).length * 7 + 34);
  const x = nx(target.x) - width / 2;
  const y = ny(target.y) - 18;

  function handleClick() {
    if (value) {
      onClear(target.id);
      return;
    }

    if (selectedLabel) {
      onAssign(target.id, selectedLabel);
    }
  }

  const correct = Boolean(value) && value === target.answer;

  return (
    <g
      role="button"
      tabIndex="0"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
      aria-label={`${target.answer} drop target`}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={36}
        rx={9}
        fill={value ? "rgba(8,18,31,0.96)" : "rgba(8,18,31,0.72)"}
        stroke={value ? (correct ? COLORS.green : COLORS.red) : COLORS.drop}
        strokeWidth="2"
        strokeDasharray={value ? undefined : "7 5"}
      />
      <text
        x={nx(target.x)}
        y={ny(target.y) + 5}
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fill={value ? (correct ? COLORS.green : COLORS.red) : COLORS.muted}
      >
        {value || "DROP"}
      </text>
    </g>
  );
}
