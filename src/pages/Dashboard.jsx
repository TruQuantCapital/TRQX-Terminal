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
      <div style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 10, padding: "10px 16px", color: "#d4af37", fontSize: 13, textAlign: "center" }}>
        🇺🇸 Markets closed for Independence Day — live flow resumes Monday, July 6 at 9:30 AM ET. Academy, Research & Capital Allocator are fully open.
      </div>
      {/* ROW 1 — fixed 360px, everything scrolls internally */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 1.1fr", gap: 16, gridAutoRows: "360px" }}>
        <div className="cell-fill" style={scrollCell}><MarketBrief /></div>
        <div className="cell-fill" style={scrollCell}><CalendarCard /></div>
        <div className="cell-fill" style={scrollCell}><AiSummary /></div>
      </div>

      {/* ROW 2 — fixed 560px (Regime/Gauge is dense), all scroll */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, gridAutoRows: "560px" }}>
        <div className="cell-fill" style={scrollCell}><GaugeCard /></div>
        <div className="cell-fill" style={scrollCell}><BreadthCard /></div>
        <div className="cell-fill" style={scrollCell}><GammaCard /></div>
      </div>

      {/* ROW 3 — fixed 480px */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, gridAutoRows: "480px" }}>
        <div className="cell-fill" style={scrollCell}><OptionsFlowCard /></div>
        <div className="cell-fill" style={scrollCell}><ScannerCard /></div>
      </div>

      {/* ROW 4 — content-sized, it's just 4 quick links */}
      <div style={{ minWidth: 0 }}>
        <AcademyCard />
      </div>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </main>
  );
}