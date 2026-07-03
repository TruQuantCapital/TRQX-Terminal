import React from "react";
import MarketBrief from "../components/MarketBrief";
import OnboardingModal from "../components/OnboardingModal";
import {
  GaugeCard,
  CalendarCard,
  AiSummary,
  BreadthCard,
  GammaCard,
  OptionsFlowCard,
  ScannerCard,
  AcademyCard,
} from "../components/Cards";

export default function Dashboard() {
  const [showOnboarding, setShowOnboarding] = React.useState(() => {
    return !localStorage.getItem("trqx_onboarding_complete");
  });

  const rowStyle = {
    display: "grid",
    gap: 14,
    alignItems: "stretch",
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ROW 1 — Market Intelligence */}
      <div style={{ ...rowStyle, gridTemplateColumns: "1.2fr 0.9fr 1.1fr" }}>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", minHeight: 260 }}><MarketBrief /></div>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", minHeight: 260 }}><CalendarCard /></div>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", minHeight: 260, maxHeight: 260, overflow: "auto" }}><AiSummary /></div>
      </div>

      {/* ROW 2 — Market Regime, Breadth, Gamma */}
      <div style={{ ...rowStyle, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", minHeight: 580 }}><GaugeCard /></div>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", minHeight: 580 }}><BreadthCard /></div>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", minHeight: 580 }}><GammaCard /></div>
      </div>

      {/* ROW 3 — Flow Tools */}
      <div style={{ ...rowStyle, gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", minHeight: 400 }}><OptionsFlowCard /></div>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", minHeight: 400 }}><ScannerCard /></div>
      </div>

      {/* ROW 4 — Academy */}
      <div style={{ minWidth: 0 }}>
        <AcademyCard />
      </div>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </main>
  );
}