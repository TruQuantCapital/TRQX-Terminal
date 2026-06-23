import React from "react";

export default function EconomicCalendarPage() {
  return (
    <main className="pageStack">
      <section className="pageHeader">
        <div>
          <p>TRQX MODULE</p>
          <h1>Economic Calendar & Market Risk</h1>
          <span>Track high-impact market events, forecasts, actuals, and trader risk.</span>
        </div>
        <div className="flowProviderBadge">
          <span className="liveDot"></span>
          LIVE DATA
        </div>
      </section>

      <div className="econWidgetWrap">
        <iframe
          src="https://www.investing.com/economic-calendar/"
          style={{
            width: "100%",
            height: "80vh",
            border: "none",
            borderRadius: "12px",
          }}
          title="Economic Calendar"
        />
      </div>
    </main>
  );
}
