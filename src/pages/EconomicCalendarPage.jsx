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
          src="https://sslefp.forexprostools.com/widgets/html5/calendar/?width=100%25&height=100%25&lang=1&submitFilers=false&timeZone=0&timeFilter=time_remaining&countries=5&importance=3&features=datepicker,timezone,filters"
          style={{
            width: "100%",
            height: "80vh",
            border: "none",
            borderRadius: "12px",
            background: "var(--black-3)",
          }}
          title="Economic Calendar"
          allowFullScreen
        />
      </div>
    </main>
  );
}
