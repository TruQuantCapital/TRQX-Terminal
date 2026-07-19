import React from "react";
import WidgetShell from "./WidgetShell";
import "./CommandWidgets.css";

export default function MissionWidget({
  regime = "Risk On",
  mission = "Wait for confirmation",
  execution = "Precision over activity",
  title = "Daily Execution Plan",
  height = "100%",
}) {
  return (
    <WidgetShell
      eyebrow="Mission Control"
      title={title}
      description="The operating standards for today's trading session."
      height={height}
      className="trqx-mission-widget"
    >
      <div className="trqx-mission-grid">
        <article>
          <span>Market Regime</span>
          <strong>{regime}</strong>
        </article>

        <article>
          <span>Today's Mission</span>
          <strong>{mission}</strong>
        </article>

        <article>
          <span>Execution Standard</span>
          <strong>{execution}</strong>
        </article>
      </div>
    </WidgetShell>
  );
}