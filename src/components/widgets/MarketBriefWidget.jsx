import React from "react";
import MarketBrief from "../MarketBrief";
import WidgetShell from "./WidgetShell";

export default function MarketBriefWidget({
  height = 430,
}) {
  return (
    <WidgetShell
      eyebrow="Daily Market Brief"
      title="Market Intelligence"
      description="Dealer positioning, institutional flow, sentiment, and key catalysts."
      height={height}
      scrollable
    >
      <MarketBrief />
    </WidgetShell>
  );
}