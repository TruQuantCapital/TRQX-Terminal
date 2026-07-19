import React from "react";
import { AcademyCard } from "../Cards";
import WidgetShell from "./WidgetShell";

export default function AcademyProgressWidget({
  height = 430,
}) {
  return (
    <WidgetShell
      eyebrow="Member Development"
      title="Academy Progress"
      description="Training tools, curriculum progress, and continuing education."
      height={height}
      scrollable
    >
      <AcademyCard />
    </WidgetShell>
  );
}