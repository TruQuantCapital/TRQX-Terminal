import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MarketBriefWidget from "../components/widgets/MarketBriefWidget";
import EconomicEventsWidget from "../components/widgets/EconomicEventsWidget";
import AcademyProgressWidget from "../components/widgets/AcademyProgressWidget";
import "./EliteCommandCenter.css";

const EASTERN_TIME_ZONE = "America/New_York";
const COACHING_DAY = 2; // Tuesday: Sunday = 0
const COACHING_HOUR = 19; // 7:00 PM
const COACHING_MINUTE = 0;

const DISCORD_URL = "https://discord.gg/jy3ta9qkfH";

function getTimeZoneParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });

  const parts = formatter.formatToParts(date);
  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  const weekdayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
    weekday: weekdayMap[values.weekday],
  };
}

function getTimeZoneOffset(date, timeZone) {
  const parts = getTimeZoneParts(date, timeZone);

  const representedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return representedAsUtc - date.getTime();
}

function easternDateTimeToUtc({
  year,
  month,
  day,
  hour,
  minute = 0,
  second = 0,
}) {
  const initialUtcGuess = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second)
  );

  const firstOffset = getTimeZoneOffset(
    initialUtcGuess,
    EASTERN_TIME_ZONE
  );

  let result = new Date(initialUtcGuess.getTime() - firstOffset);

  const correctedOffset = getTimeZoneOffset(
    result,
    EASTERN_TIME_ZONE
  );

  if (correctedOffset !== firstOffset) {
    result = new Date(initialUtcGuess.getTime() - correctedOffset);
  }

  return result;
}

function getNextCoachingSession(now = new Date()) {
  const easternNow = getTimeZoneParts(now, EASTERN_TIME_ZONE);

  let daysUntilSession =
    (COACHING_DAY - easternNow.weekday + 7) % 7;

  const sessionAlreadyPassedToday =
    daysUntilSession === 0 &&
    (
      easternNow.hour > COACHING_HOUR ||
      (
        easternNow.hour === COACHING_HOUR &&
        easternNow.minute >= COACHING_MINUTE
      )
    );

  if (sessionAlreadyPassedToday) {
    daysUntilSession = 7;
  }

  const easternTodayAtNoonUtc = easternDateTimeToUtc({
    year: easternNow.year,
    month: easternNow.month,
    day: easternNow.day,
    hour: 12,
  });

  const targetDate = new Date(
    easternTodayAtNoonUtc.getTime() +
      daysUntilSession * 24 * 60 * 60 * 1000
  );

  const targetParts = getTimeZoneParts(
    targetDate,
    EASTERN_TIME_ZONE
  );

  return easternDateTimeToUtc({
    year: targetParts.year,
    month: targetParts.month,
    day: targetParts.day,
    hour: COACHING_HOUR,
    minute: COACHING_MINUTE,
  });
}

function formatCountdown(milliseconds) {
  const safeMilliseconds = Math.max(0, milliseconds);
  const totalSeconds = Math.floor(safeMilliseconds / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

function getGreeting() {
  const currentHour = getTimeZoneParts(
    new Date(),
    EASTERN_TIME_ZONE
  ).hour;

  if (currentHour < 12) return "Good morning";
  if (currentHour < 17) return "Good afternoon";
  return "Good evening";
}

function formatSessionDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: EASTERN_TIME_ZONE,
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function EliteCommandCenter() {
  const navigate = useNavigate();

  const nextSession = useMemo(
    () => getNextCoachingSession(),
    []
  );

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const millisecondsUntilSession =
    nextSession.getTime() - now.getTime();

  const countdown = formatCountdown(
    millisecondsUntilSession
  );

  const isStartingSoon =
    millisecondsUntilSession > 0 &&
    millisecondsUntilSession <= 30 * 60 * 1000;

  const openDiscord = () => {
    window.open(
      DISCORD_URL,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openMentorship = () => {
    window.location.href = "/mentorship";
  };

  return (
    <main className="elite-page">
      <section className="elite-hero">
        <div className="elite-hero-copy">
          <div className="elite-tag">
            TRQX ELITE
          </div>

          <h1>Elite Command Center</h1>

          <p className="elite-welcome">
            {getGreeting()}. Your market preparation,
            coaching, education, and community resources
            are organized here.
          </p>

          <div className="elite-mission-strip">
            <div>
              <span>Market regime</span>
              <strong>Risk On</strong>
            </div>

            <div>
              <span>Today&apos;s mission</span>
              <strong>Wait for confirmation</strong>
            </div>

            <div>
              <span>Execution standard</span>
              <strong>Precision over activity</strong>
            </div>
          </div>
        </div>

        <div className="elite-session-panel">
          <div className="elite-session-header">
            <span
              className={
                isStartingSoon
                  ? "elite-live-dot starting"
                  : "elite-live-dot"
              }
            />

            <span>
              {isStartingSoon
                ? "Starting soon"
                : "Next live coaching"}
            </span>
          </div>

          <h2>{formatSessionDate(nextSession)}</h2>

          <p>7:00 PM Eastern</p>

          <div className="elite-countdown">
            <div>
              <strong>{countdown.days}</strong>
              <span>Days</span>
            </div>

            <div>
              <strong>
                {String(countdown.hours).padStart(2, "0")}
              </strong>
              <span>Hours</span>
            </div>

            <div>
              <strong>
                {String(countdown.minutes).padStart(2, "0")}
              </strong>
              <span>Minutes</span>
            </div>

            <div>
              <strong>
                {String(countdown.seconds).padStart(2, "0")}
              </strong>
              <span>Seconds</span>
            </div>
          </div>

          <button
            type="button"
            className="goldButton"
            onClick={openDiscord}
          >
            Join Live Coaching
          </button>
        </div>
      </section>

      <section className="elite-grid">
        <article className="elite-card">
          <h2>Today&apos;s Mission</h2>

          <h3>Trade the confirmation</h3>

          <p>
            Focus on clean momentum continuation.
            Avoid forcing entries inside consolidation.
          </p>

          <button
            type="button"
            className="goldButton"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Open Market Brief
          </button>
        </article>

        <article className="elite-card">
          <h2>Next Coaching Session</h2>

          <h3>{formatSessionDate(nextSession)}</h3>

          <p>
            Live coaching begins at 7:00 PM Eastern.
            The countdown updates automatically.
          </p>

          <button
            type="button"
            className="goldButton"
            onClick={openDiscord}
          >
            Join Session
          </button>
        </article>

        <article className="elite-card">
          <h2>This Week&apos;s Homework</h2>

          <h3>Market Structure</h3>

          <p>
            Complete the market-structure lesson and
            submit one annotated chart review.
          </p>

          <button
            type="button"
            className="goldButton"
            onClick={() => navigate("/academy")}
          >
            Open Assignment
          </button>
        </article>

        <article className="elite-card">
          <h2>Book Coaching</h2>

          <h3>One-on-one support</h3>

          <p>
            Schedule a private coaching session through
            the mentorship booking calendar.
          </p>

          <button
            type="button"
            className="goldButton"
            onClick={openMentorship}
          >
            Book Session
          </button>
        </article>

        <article className="elite-card">
          <h2>Elite Discord</h2>

          <h3>Trading Floor</h3>

          <p>
            Continue the discussion with members and
            access live coaching communication.
          </p>

          <button
            type="button"
            className="goldButton"
            onClick={openDiscord}
          >
            Open Discord
          </button>
        </article>

        <article className="elite-card">
          <h2>Latest Recording</h2>

          <h3>Market Structure Review</h3>

          <p>
            Review the latest coaching session and
            reinforce the week&apos;s primary concepts.
          </p>

          <button
            type="button"
            className="goldButton"
            onClick={() => {
              window.location.href = "/academy";
            }}
          >
            Open Coaching Vault
          </button>
        </article>
      </section>
      <section className="elite-live-section">
  <div className="elite-section-heading">
    <div>
      <span>LIVE INTELLIGENCE</span>
      <h2>Elite Trading Desk</h2>
    </div>

    <p>
      Current market preparation, economic events,
      and member education progress.
    </p>
  </div>

  <div className="elite-live-grid">
  <MarketBriefWidget
    height={874}
  />

  <EconomicEventsWidget
    height={430}
  />

  <AcademyProgressWidget
    height={430}
  />
</div>
    <div className="elite-live-panel elite-live-panel-wide">
      <div className="elite-panel-label">
        DAILY MARKET BRIEF
      </div>

      <div className="elite-widget-scroll">
        <MarketBrief />
      </div>
    </div>

    <div className="elite-live-panel">
      <div className="elite-panel-label">
        ECONOMIC EVENTS
      </div>

      <div className="elite-widget-scroll">
        <CalendarCard />
      </div>
    </div>

    <div className="elite-live-panel elite-academy-panel">
      <div className="elite-panel-label">
        ACADEMY PROGRESS
      </div>

      <div className="elite-widget-scroll">
        <AcademyCard />
      </div>
    </div>
  </div>
</section>
    </main>
  );
}