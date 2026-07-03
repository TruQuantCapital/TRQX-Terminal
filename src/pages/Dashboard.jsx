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

 // one helper style — every cell becomes a flex box so the card inside stretches
  const cell = { minWidth: 0, display: "flex", flexDirection: "column" };

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ROW 1 — pinned to 340px */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 1.1fr", gap: 16, gridAutoRows: "340px" }}>
        <div style={cell}><MarketBrief /></div>
        <div style={cell}><CalendarCard /></div>
        <div style={{ ...cell, overflowY: "auto", borderRadius: 12 }}><AiSummary /></div>
      </div>

      {/* ROW 2 — pinned to 520px */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, gridAutoRows: "520px" }}>
        <div style={cell}><GaugeCard /></div>
        <div style={cell}><BreadthCard /></div>
        <div style={cell}><GammaCard /></div>
      </div>

      {/* ROW 3 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "stretch" }}>
        <div style={cell}><OptionsFlowCard /></div>
        <div style={cell}><ScannerCard /></div>
      </div>

      {/* ROW 4 */}
      <div style={{ minWidth: 0 }}>
        <AcademyCard />
      </div>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </main>
  );
}