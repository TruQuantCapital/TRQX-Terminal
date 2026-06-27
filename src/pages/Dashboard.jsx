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
  WatchlistCard,
  NewsCard,
  AcademyCard,
} from "../components/Cards";

export default function Dashboard() {
  const [showOnboarding, setShowOnboarding] = React.useState(() => {
  return !localStorage.getItem("trqx_onboarding_complete");
});
  return (
    
    <main className="grid">
      <MarketBrief />
      <GaugeCard />
      <CalendarCard />
      <AiSummary />
      <BreadthCard />
      <GammaCard />
      <OptionsFlowCard />
      <ScannerCard />
      <WatchlistCard />
      <NewsCard />
      <AcademyCard />
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </main>
  );
}