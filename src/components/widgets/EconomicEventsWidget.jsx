import React from "react";
import { CalendarCard } from "../Cards";
import WidgetShell from "./WidgetShell";

export default function EconomicEventsWidget({
  height = 430,
}) {
  return (
    <WidgetShell
      eyebrow="Economic Events"
      title="Market Calendar"
      description="Upcoming releases and scheduled market-moving events."
      height={height}
      scrollable
    >
      <CalendarCard />
    </WidgetShell>
  );
}