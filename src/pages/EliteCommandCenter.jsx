import React from "react";

export default function EliteCommandCenter() {
  return (
    <main className="elite-page">

      <section className="elite-hero">
        <div>
          <div className="elite-tag">
            TRQX ELITE
          </div>

          <h1>
            Elite Command Center
          </h1>

          <p>
            Welcome back.
            This is your daily trading headquarters.
          </p>
        </div>

        <button className="goldButton">
          Join Live Coaching
        </button>
      </section>

      <section className="elite-grid">

        <div className="elite-card">
          <h2>Today's Mission</h2>

          <h3>Risk On Environment</h3>

          <p>
            Focus on momentum continuation.
            Avoid forcing trades.
          </p>
        </div>

        <div className="elite-card">
          <h2>Next Coaching Session</h2>

          <h3>Tuesday</h3>

          <p>
            7:00 PM EST
          </p>

          <button className="goldButton">
            Join Session
          </button>
        </div>

        <div className="elite-card">
          <h2>This Week's Homework</h2>

          <p>
            Complete Market Structure Lesson
            and submit one chart review.
          </p>
        </div>

        <div className="elite-card">
          <h2>Book Coaching</h2>

          <p>
            Need one-on-one help?
          </p>

          <button className="goldButton">
            Book Session
          </button>
        </div>

        <div className="elite-card">
          <h2>Discord</h2>

          <p>
            Continue the discussion with Elite members.
          </p>

          <button className="goldButton">
            Open Discord
          </button>
        </div>

        <div className="elite-card">
          <h2>Latest Recording</h2>

          <p>
            Market Structure Review
          </p>

          <button className="goldButton">
            Watch Recording
          </button>
        </div>

      </section>

    </main>
  );
}