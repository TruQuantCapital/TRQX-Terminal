import React from "react";

const DECISIONS = [
  {
    value: "buy",
    label: "Buy",
    description: "Enter a bullish position.",
  },
  {
    value: "sell",
    label: "Sell",
    description: "Enter a bearish position.",
  },
  {
    value: "wait",
    label: "Wait",
    description: "Require more confirmation.",
  },
  {
    value: "pass",
    label: "Pass",
    description: "Reject the setup.",
  },
  {
    value: "manage",
    label: "Manage",
    description: "Manage an existing position.",
  },
];

export default function DecisionButtons({
  selected,
  disabled,
  onSelect,
}) {
  return (
    <div className="trqx-decision-buttons">
      {DECISIONS.map((decision) => (
        <button
          key={decision.value}
          type="button"
          disabled={disabled}
          className={
            selected === decision.value
              ? "selected"
              : ""
          }
          onClick={() => onSelect(decision.value)}
        >
          <strong>{decision.label}</strong>
          <small>{decision.description}</small>
        </button>
      ))}
    </div>
  );
}
