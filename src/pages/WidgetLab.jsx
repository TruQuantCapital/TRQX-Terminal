import {
  AICoachWidget,
  EconomicEventsWidget,
  MarketBriefWidget,
} from "../components/widgets";

export default function WidgetLab() {
  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>Widget Lab</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
        }}
      >
        <AICoachWidget />
        <MarketBriefWidget />
        <EconomicEventsWidget />
      </div>
    </div>
  );
}