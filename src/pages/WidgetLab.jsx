import {
  AICoachWidget,
  AcademyProgressWidget,
  EconomicEventsWidget,
  MarketBriefWidget,
} from "../components/widgets";

import "./WidgetLab.css";

export default function WidgetLab() {
  return (
    <main className="widget-lab">
      <header className="widget-lab__header">
        <div>
          <p className="widget-lab__eyebrow">TRQX DEVELOPMENT WORKSPACE</p>
          <h1>Widget Lab</h1>
          <p className="widget-lab__description">
            Test reusable dashboard widgets before deploying them to the live
            trading workspace.
          </p>
        </div>

        <span className="widget-lab__status">Phase 2</span>
      </header>

      <section className="widget-lab__grid">
        <div className="widget-lab__item widget-lab__item--wide">
          <MarketBriefWidget />
        </div>

        <div className="widget-lab__item">
          <EconomicEventsWidget />
        </div>

        <div className="widget-lab__item">
          <AcademyProgressWidget />
        </div>

        <div className="widget-lab__item widget-lab__item--wide">
          <AICoachWidget />
        </div>
      </section>
    </main>
  );
}