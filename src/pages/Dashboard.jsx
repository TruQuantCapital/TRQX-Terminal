import React from "react";
import { useNavigate } from "react-router-dom";
import { Crown, ArrowRight } from "lucide-react";
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

// ── NYSE market schedule exceptions ───────────────────────────────
// FULL closures — dates are the OBSERVED closure date, not the
// calendar holiday. e.g. July 4, 2026 fell on a Saturday → market
// closed Friday July 3.
const NYSE_HOLIDAYS = {
  // 2026
  "2026-01-01": "New Year's Day",
  "2026-01-19": "Martin Luther King Jr. Day",
  "2026-02-16": "Washington's Birthday",
  "2026-04-03": "Good Friday",
  "2026-05-25": "Memorial Day",
  "2026-06-19": "Juneteenth",
  "2026-07-03": "Independence Day (observed)",
  "2026-09-07": "Labor Day",
  "2026-11-26": "Thanksgiving Day",
  "2026-12-25": "Christmas Day",
  // 2027
  "2027-01-01": "New Year's Day",
  "2027-01-18": "Martin Luther King Jr. Day",
  "2027-02-15": "Washington's Birthday",
  "2027-03-26": "Good Friday",
  "2027-05-31": "Memorial Day",
  "2027-06-18": "Juneteenth (observed)",
  "2027-07-05": "Independence Day (observed)",
  "2027-09-06": "Labor Day",
  "2027-11-25": "Thanksgiving Day",
  "2027-12-24": "Christmas Day (observed)",
};

// EARLY closes — NYSE equities close at 1:00 PM ET on these dates.
// 2027 has NO Christmas Eve early close: Christmas falls Saturday,
// so Fri Dec 24 is the observed full closure and Thu Dec 23 is a
// normal full session. Neither year has a July 3 early close.
const NYSE_EARLY_CLOSES = {
  "2026-11-27": "the day after Thanksgiving",
  "2026-12-24": "Christmas Eve",
  "2027-11-26": "the day after Thanksgiving",
};

// "YYYY-MM-DD" for a Date, evaluated in ET — immune to the user's
// local timezone and to UTC midnight drift.
function toEtDateString(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Day of week (0=Sun..6=Sat) for a Date, evaluated in ET.
function etDayOfWeek(date) {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
  }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

// Current ET time as fractional hours, e.g. 13.5 = 1:30 PM ET.
function etHoursNow(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === "hour").value);
  const m = Number(parts.find((p) => p.type === "minute").value);
  return h + m / 60;
}

// Walk forward from `date` to the next open trading day (skips
// weekends + full holidays), returns e.g. "Monday, July 6".
function nextTradingDayLabel(date) {
  const d = new Date(date.getTime());
  for (let i = 0; i < 10; i++) {
    d.setDate(d.getDate() + 1);
    const dow = etDayOfWeek(d);
    const isWeekend = dow === 0 || dow === 6;
    const isHoliday = !!NYSE_HOLIDAYS[toEtDateString(d)];
    if (!isWeekend && !isHoliday) {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(d);
    }
  }
  return "the next trading day";
}

const bannerStyle = {
  background: "rgba(212,175,55,0.08)",
  border: "1px solid rgba(212,175,55,0.3)",
  borderRadius: 10,
  padding: "10px 16px",
  color: "#d4af37",
  fontSize: 13,
  textAlign: "center",
};

function MarketScheduleBanner() {
  const now = new Date();
  const todayEt = toEtDateString(now);

  // Full closure — show all day.
  const holidayName = NYSE_HOLIDAYS[todayEt];
  if (holidayName) {
    return (
      <div style={bannerStyle}>
        🇺🇸 Markets closed for {holidayName} — live flow resumes{" "}
        {nextTradingDayLabel(now)} at 9:30 AM ET. Academy, Research &
        Capital Allocator are fully open.
      </div>
    );
  }

  // Early close — before 1 PM ET warn of the shortened session;
  // after 1 PM ET confirm the close and the next full session.
  const earlyReason = NYSE_EARLY_CLOSES[todayEt];
  if (earlyReason) {
    if (etHoursNow(now) < 13) {
      return (
        <div style={bannerStyle}>
          ⏰ Shortened session today — NYSE closes early at 1:00 PM ET for{" "}
          {earlyReason}. Live flow ends at the early close.
        </div>
      );
    }
    return (
      <div style={bannerStyle}>
        ⏰ Markets closed early today (1:00 PM ET) for {earlyReason} — live
        flow resumes {nextTradingDayLabel(now)} at 9:30 AM ET.
      </div>
    );
  }

  return null; // normal trading day → no banner
}

export default function Dashboard() {
    const navigate = useNavigate();

    const [showOnboarding, setShowOnboarding] = React.useState(() => {
    return !localStorage.getItem("trqx_onboarding_complete");
  });

  // Plain block cell — grid stretches it, content scrolls inside it.
  // NOT flex — flex is what ate the scrollbar last time.
  const scrollCell = { minWidth: 0, overflowY: "auto", borderRadius: 12 };

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 15 }}>
      <MarketScheduleBanner />
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
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

  <div style={{ minWidth: 0 }}>
    <AcademyCard />
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 24,
      padding: 24,
      borderRadius: 14,
      border: "1px solid rgba(212,175,55,.30)",
      background:
        "linear-gradient(135deg,#111319 0%,#0a0c10 100%)",
    }}
  >
    <div>
      <div
        style={{
          color: "#d4af37",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: 1,
          marginBottom: 8,
        }}
      >
        👑 TRQX ELITE MENTORSHIP
      </div>

      <h2
        style={{
          margin: 0,
          color: "#fff",
          fontSize: 28,
        }}
      >
        Learn Directly From Michael A. Valerio
      </h2>

      <p
        style={{
          marginTop: 12,
          color: "#a8b0ba",
          maxWidth: 700,
          lineHeight: 1.6,
        }}
      >
        Weekly live coaching, market preparation,
        trade reviews, trading psychology, risk
        management, and direct mentorship.
      </p>
    </div>

    <button
      onClick={() => navigate("/mentorship")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 22px",
        background: "#d4af37",
        color: "#111",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      Explore
      <ArrowRight size={18} />
    </button>
  </div>

</div>

{showOnboarding && (
  <OnboardingModal onClose={() => setShowOnboarding(false)} />
)}
    </main>
  );
}