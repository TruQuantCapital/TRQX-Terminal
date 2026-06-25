import React from "react";

export default function EconomicCalendarPage() {
  return (
    <main className="pageStack">
      <section className="pageHeader">
        <div>
          <p>TRQX MODULE</p>
          <h1>Economic Calendar</h1>
          <span>Track high-impact market events, forecasts, actuals, and trader risk.</span>
        </div>
        <div className="flowProviderBadge">
          <span className="liveDot"></span>
          LIVE DATA
        </div>
      </section>
      <div className="econWidgetWrap">
        <iframe
          src="https://s.tradingview.com/embed-widget/events/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22importanceFilter%22%3A%22-1%2C0%2C1%22%2C%22countryFilter%22%3A%22us%22%7D"
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