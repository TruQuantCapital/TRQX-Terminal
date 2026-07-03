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
    <main style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ROW 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 1.1fr", gap: 16, alignItems: "stretch" }}>
        <div style={{ minWidth: 0 }}><MarketBrief /></div>
        <div style={{ minWidth: 0 }}><CalendarCard /></div>
        <div style={{ minWidth: 0, maxHeight: 300, overflowY: "auto", borderRadius: 12 }}><AiSummary /></div>
      </div>

      {/* ROW 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "stretch" }}>
        <div style={{ minWidth: 0 }}><GaugeCard /></div>
        <div style={{ minWidth: 0 }}><BreadthCard /></div>
        <div style={{ minWidth: 0 }}><GammaCard /></div>
      </div>

      {/* ROW 3 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "stretch" }}>
        <div style={{ minWidth: 0 }}><OptionsFlowCard /></div>
        <div style={{ minWidth: 0 }}><ScannerCard /></div>
      </div>

      {/* ROW 4 */}
      <div style={{ minWidth: 0 }}>
        <AcademyCard />
      </div>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </main>
  );
}