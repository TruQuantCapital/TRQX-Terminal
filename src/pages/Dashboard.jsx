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
} from "../components/Cards";

export default function Dashboard() {
  const [showOnboarding, setShowOnboarding] = React.useState(() => {
    return !localStorage.getItem("trqx_onboarding_complete");
  });

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ROW 1 — Market Intelligence */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 1.1fr", gap: 14 }}>
        <MarketBrief />
        <CalendarCard />
        <AiSummary />
      </div>

      {/* ROW 2 — Market Regime, Breadth, Gamma */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <GaugeCard />
        <BreadthCard />
        <GammaCard />
      </div>

      {/* ROW 3 — Flow Tools */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <OptionsFlowCard />
        <ScannerCard />
      </div>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </main>
  );
}