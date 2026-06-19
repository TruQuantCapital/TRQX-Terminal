import React from "react";
import MarketBrief from "../components/MarketBrief";
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
    </main>
  );
}