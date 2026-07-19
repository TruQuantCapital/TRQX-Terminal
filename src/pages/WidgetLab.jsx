import { useMemo, useState } from "react";
import GridLayout from "react-grid-layout";

import {
  AICoachWidget,
  AcademyProgressWidget,
  EconomicEventsWidget,
  MarketBriefWidget,
} from "../components/widgets";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./WidgetLab.css";

const STORAGE_KEY = "trqx-widget-lab-layout";

const defaultLayout = [
  { i: "market-brief", x: 0, y: 0, w: 12, h: 5, minW: 6, minH: 4 },
  { i: "economic-events", x: 0, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
  { i: "academy-progress", x: 6, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
  { i: "ai-coach", x: 0, y: 10, w: 12, h: 6, minW: 6, minH: 5 },
];

export default function WidgetLab() {
  const initialLayout = useMemo(() => {
    try {
      const savedLayout = localStorage.getItem(STORAGE_KEY);

      return savedLayout ? JSON.parse(savedLayout) : defaultLayout;
    } catch {
      return defaultLayout;
    }
  }, []);

  const [layout, setLayout] = useState(initialLayout);

  const handleLayoutChange = (nextLayout) => {
    setLayout(nextLayout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLayout));
  };

  const resetLayout = () => {
    setLayout(defaultLayout);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <main className="widget-lab">
      <header className="widget-lab__header">
        <div>
          <p className="widget-lab__eyebrow">
            TRQX DEVELOPMENT WORKSPACE
          </p>

          <h1>Widget Lab</h1>

          <p className="widget-lab__description">
            Drag cards to reposition them. Resize cards from the lower-right
            corner. Layout changes are saved in this browser.
          </p>
        </div>

        <div className="widget-lab__actions">
          <span className="widget-lab__status">Phase 2</span>

          <button
            type="button"
            className="widget-lab__reset"
            onClick={resetLayout}
          >
            Reset layout
          </button>
        </div>
      </header>

      <div className="widget-lab__workspace">
        <GridLayout
          className="widget-lab__grid"
          layout={layout}
          cols={12}
          rowHeight={70}
          width={1400}
          margin={[20, 20]}
          containerPadding={[0, 0]}
          draggableHandle=".widget-lab__drag-handle"
          onLayoutChange={handleLayoutChange}
          compactType="vertical"
          preventCollision={false}
          resizeHandles={["se"]}
        >
          <section key="market-brief" className="widget-lab__card">
            <div className="widget-lab__drag-handle">
              <span>Market Brief</span>
              <span aria-hidden="true">⋮⋮</span>
            </div>

            <div className="widget-lab__card-content">
              <MarketBriefWidget />
            </div>
          </section>

          <section key="economic-events" className="widget-lab__card">
            <div className="widget-lab__drag-handle">
              <span>Economic Events</span>
              <span aria-hidden="true">⋮⋮</span>
            </div>

            <div className="widget-lab__card-content">
              <EconomicEventsWidget />
            </div>
          </section>

          <section key="academy-progress" className="widget-lab__card">
            <div className="widget-lab__drag-handle">
              <span>Academy Progress</span>
              <span aria-hidden="true">⋮⋮</span>
            </div>

            <div className="widget-lab__card-content">
              <AcademyProgressWidget />
            </div>
          </section>

          <section key="ai-coach" className="widget-lab__card">
            <div className="widget-lab__drag-handle">
              <span>AI Coach</span>
              <span aria-hidden="true">⋮⋮</span>
            </div>

            <div className="widget-lab__card-content">
              <AICoachWidget />
            </div>
          </section>
        </GridLayout>
      </div>
    </main>
  );
}