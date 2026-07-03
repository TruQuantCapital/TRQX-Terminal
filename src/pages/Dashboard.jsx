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

  // Plain block cell — grid stretches it, content scrolls inside it.
  // NOT flex — flex is what ate the scrollbar last time.
  const scrollCell = { minWidth: 0, overflowY: "auto", borderRadius: 12 };

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 15 }}>
      <div style={{ color: "red", fontSize: 20 }}>BUILD v2 — {new Date().toISOString()}</div>

      {/* ROW 1 — fixed 360px, everything scrolls internally */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 1.1fr", gap: 16, gridAutoRows: "360px" }}>
        <div style={scrollCell}><MarketBrief /></div>
        <div style={scrollCell}><CalendarCard /></div>
        <div style={scrollCell}><AiSummary /></div>
      </div>

      {/* ROW 2 — fixed 560px (Regime/Gauge is dense), all scroll */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, gridAutoRows: "560px" }}>
        <div style={scrollCell}><GaugeCard /></div>
        <div style={scrollCell}><BreadthCard /></div>
        <div style={scrollCell}><GammaCard /></div>
      </div>

      {/* ROW 3 — fixed 480px */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, gridAutoRows: "480px" }}>
        <div style={scrollCell}><OptionsFlowCard /></div>
        <div style={scrollCell}><ScannerCard /></div>
      </div>

      {/* ROW 4 — content-sized, it's just 4 quick links */}
      <div style={{ minWidth: 0 }}>
        <AcademyCard />
      </div>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </main>
  );
}