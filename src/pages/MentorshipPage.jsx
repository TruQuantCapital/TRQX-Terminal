import React, { useState } from "react";
import "./MentorshipPage.css";
import {
  CalendarDays,
  CheckCircle2,
  Crown,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";


const WHOP_MENTORSHIP_URL =
  "YOUR_FINAL_WHOP_CHECKOUT_URL";

const benefits = [
  "Two weekly live coaching sessions",
  "Weekly market preparation",
  "Weekly office hours and Q&A",
  "Private mentorship community",
  "Monthly one-on-one coaching call",
  "Trade reviews and feedback",
  "Homework and accountability",
  "Full TRQX Elite Terminal access",
  "Complete Academy access",
  "Exclusive resources and tools",
];

const sessions = [
  {
    day: "Tuesday",
    time: "7:00 PM ET",
    title: "Market Review & Coaching",
    points: [
      "Review winning and losing trades",
      "Market breakdown",
      "Trading psychology",
      "Live Q&A",
    ],
  },
  {
    day: "Thursday",
    time: "7:00 PM ET",
    title: "Market Prep Session",
    points: [
      "SPY, indices and sectors",
      "Gamma and options flow",
      "Earnings and events",
      "Watchlist and game plan",
    ],
  },
  {
    day: "Friday",
    time: "6:30 PM ET",
    title: "Office Hours",
    points: [
      "Open Q&A",
      "Platform support",
      "Trade reviews",
      "Anything trading-related",
    ],
  },
];

export default function MentorshipPage() {
  const [showCalendly, setShowCalendly] = useState(false);

  const openWhop = () => {
    if (WHOP_MENTORSHIP_URL === "#") {
      alert("Mentorship checkout link will be added soon.");
      return;
    }

    window.open(WHOP_MENTORSHIP_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="mentorshipPage">
      <section className="mentorshipHero">
        <div className="mentorshipHeroOverlay" />

        <div className="mentorshipHeroContent">
          <div className="mentorshipHeroCopy">
            <span className="mentorshipEyebrow">TRQX ELITE</span>

            <h1>
              Elite
              <br />
              Mentorship
            </h1>

            <h2>
              Trade with purpose.
              <br />
              Learn with confidence.
            </h2>

            <p>
              Master the framework disciplined traders use to prepare,
              execute, manage risk, and review performance.
            </p>

            <div className="mentorshipHeroActions">
  <button className="mentorshipPrimaryBtn" onClick={openWhop}>
    Join Mentorship
  </button>

  <button
    className="mentorshipSecondaryBtn"
    onClick={() => setShowCalendly((current) => !current)}
  >
    <CalendarDays size={18} />
    {showCalendly ? "Close Booking" : "Book a Mentoring Session"}
  </button>

  <button
    className="mentorshipSecondaryBtn"
    onClick={() =>
      document
        .getElementById("mentorship-program")
        ?.scrollIntoView({ behavior: "smooth" })
    }
  >
    <PlayCircle size={18} />
    View Program
  </button>
</div>

            <div className="mentorshipTrustRow">
              <span>
                <Users size={16} />
                Live coaching
              </span>

              <span>
                <MessageCircle size={16} />
                Private community
              </span>

              <span>
                <ShieldCheck size={16} />
                Proven framework
              </span>
            </div>
          </div>

          <div className="mentorshipHeroPortraitWrap">
            <img
              className="mentorshipHeroPortrait"
              src="/michael-mentorship.png"
              alt="Michael A. Valerio, founder of TRQX Capital"
            />
          </div>
        </div>
      </section>

{showCalendly && (
  <section className="mentorshipCalendly">
    <div className="mentorshipCalendlyHeader">
      <div>
        <span>BOOK A SESSION</span>
        <h2>Schedule a Mentoring Session</h2>
      </div>

      <button
        type="button"
        onClick={() => setShowCalendly(false)}
      >
        Close
      </button>
    </div>

    <div className="mentorshipCalendlyFrame">
      <iframe
        src="https://calendly.com/michaelvalerio/rqx-mentoring-session"
        width="100%"
        height="700"
        frameBorder="0"
        title="Book a Mentoring Session with Michael Valerio"
        style={{ display: "block" }}
      />
    </div>

    <p className="mentorshipCalendlyNote">
      Sessions are for TRQX Capital members only. Educational purposes only—not financial advice.
    </p>
  </section>
)}
      <section className="mentorshipFeatures" id="mentorship-program">
        <article>
          <CalendarDays size={30} />
          <h3>Weekly Live Coaching</h3>
          <p>Structured sessions focused on preparation, execution, and review.</p>
        </article>

        <article>
          <Target size={30} />
          <h3>Market Preparation</h3>
          <p>Build a plan around market structure, flow, catalysts, and risk.</p>
        </article>

        <article>
          <Users size={30} />
          <h3>Private Community</h3>
          <p>Learn alongside serious traders committed to disciplined growth.</p>
        </article>

        <article>
          <Crown size={30} />
          <h3>Elite Access</h3>
          <p>Use the TRQX Terminal, Academy, Gamma, flow, and research tools.</p>
        </article>
      </section>

      <section className="mentorshipProgramGrid">
        <div className="mentorshipSchedule">
          <div className="mentorshipSectionHeading">
            <span>PROGRAM SCHEDULE</span>
            <h2>Weekly Live Sessions</h2>
          </div>

          <div className="mentorshipSessionGrid">
            {sessions.map((session) => (
              <article className="mentorshipSessionCard" key={session.day}>
                <span>{session.day}</span>
                <small>{session.time}</small>
                <h3>{session.title}</h3>

                <ul>
                  {session.points.map((point) => (
                    <li key={point}>
                      <CheckCircle2 size={16} />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mentorshipRecordingNote">
            <PlayCircle size={24} />

            <div>
              <strong>Cannot attend live?</strong>
              <p>Sessions are recorded and available to mentorship members.</p>
            </div>
          </div>
        </div>

        <aside className="mentorshipPricingCard">
          <Crown size={34} />

          <span>ELITE MENTORSHIP</span>

          <div className="mentorshipPrice">
            <strong>$299</strong>
            <small>/month</small>
          </div>

          <p>
            Direct coaching, structured accountability, and full access to the
            TRQX educational ecosystem.
          </p>

          <ul>
            {benefits.map((benefit) => (
              <li key={benefit}>
                <CheckCircle2 size={16} />
                {benefit}
              </li>
            ))}
          </ul>

          <button onClick={openWhop}>Join Elite Mentorship</button>

          <small>Secure checkout powered by Whop</small>
        </aside>
      </section>

      <section className="mentorshipMentor">
        <div className="mentorshipSectionHeading">
          <span>MEET YOUR MENTOR</span>
          <h2>Michael A. Valerio</h2>
        </div>

        <div className="mentorshipMentorGrid">
          <img
            src="/michael-mentorship.png"
            alt="Michael A. Valerio"
          />

          <div>
            <h3>Founder of TRQX Capital</h3>

            <p>
              Michael brings together leadership, technical discipline, market
              education, and a structured approach to trading development.
            </p>

            <ul>
              <li>U.S. Navy veteran</li>
              <li>Federal cybersecurity leader</li>
              <li>Network architect and engineer</li>
              <li>Founder of TRQX Capital</li>
              <li>Trading educator and mentor</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mentorshipFinalCta">
        <span>DISCIPLINE. STRATEGY. EXECUTION.</span>

        <h2>Build a repeatable trading process.</h2>

        <p>
          Stop trading without structure. Learn how to prepare, execute, manage
          risk, and review every decision.
        </p>

        <button onClick={openWhop}>Apply for Mentorship</button>
      </section>
    </main>
  );
}