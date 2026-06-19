import React from "react";

const levels = [
  {
    title: "Beginner Trader",
    tag: "Level 1",
    progress: 0,
    status: "Start Here",
    lessons: [
      "Market Basics",
      "Stocks & ETFs",
      "Options Basics",
      "Candlesticks",
      "Support & Resistance",
      "Volume",
      "Risk Management",
      "Trading Psychology",
    ],
  },
  {
    title: "Intermediate Trader",
    tag: "Level 2",
    progress: 0,
    status: "Locked",
    lessons: [
      "Options Flow",
      "Sweeps vs Blocks",
      "Gamma Basics",
      "ORB Strategy",
      "Trade Planning",
      "Position Sizing",
    ],
  },
  {
    title: "Advanced Trader",
    tag: "Level 3",
    progress: 0,
    status: "Locked",
    lessons: [
      "Smart Money Analysis",
      "Gamma Exposure",
      "Market Regime",
      "Catalyst Trading",
      "Advanced Risk",
      "Execution Models",
    ],
  },
];

export default function AcademyPage() {
  return (
    <main className="pageStack">
      <section className="pageHeader">
        <div>
          <p>TRQX EDUCATION</p>
          <h1>Academy</h1>
          <span>
            Learn, practice, quiz, apply, and build real trading skill.
          </span>
        </div>

        <div className="flowProviderBadge">
          <span className="liveDot"></span>
          STUDY MODE
        </div>
      </section>

      <section className="flowQuickStats">
        <div className="flowMiniCard gold">
          <small>BEGINNER</small>
          <b>0%</b>
          <span>Progress</span>
        </div>

        <div className="flowMiniCard">
          <small>LESSONS</small>
          <b>20+</b>
          <span>Planned modules</span>
        </div>

        <div className="flowMiniCard bullish">
          <small>CERTIFICATION</small>
          <b>LOCKED</b>
          <span>Complete exams</span>
        </div>
      </section>

      <section className="academyGrid">
        {levels.map((level) => (
          <div key={level.title} className="academyLevelCard">
            <div className="academyLevelTop">
              <div>
                <small>{level.tag}</small>
                <h3>{level.title}</h3>
              </div>

              <span>{level.status}</span>
            </div>

            <div className="academyProgress">
              <div style={{ width: `${level.progress}%` }}></div>
            </div>

            <p>{level.progress}% Complete</p>

            <div className="academyLessonList">
              {level.lessons.map((lesson, i) => (
                <div key={lesson}>
                  <span>{i + 1}</span>
                  <b>{lesson}</b>
                </div>
              ))}
            </div>

            <button className="tradePlanBtn">
              {level.status === "Locked" ? "Locked" : "Continue Learning"}
            </button>
          </div>
        ))}
      </section>

      <section className="smartMoneySummary">
        <div>
          <small>TRQX STUDY PATH</small>
          <h3>Learn → Practice → Quiz → Apply → Certify</h3>
        </div>

        <div className="smartMoneyGrid">
          <div>
            <span>Learn</span>
            <b>Lessons</b>
          </div>

          <div>
            <span>Practice</span>
            <b>Chart Lab</b>
          </div>

          <div>
            <span>Quiz</span>
            <b>Pass 80%</b>
          </div>

          <div>
            <span>Apply</span>
            <b>Scanner Tasks</b>
          </div>

          <div>
            <span>Certify</span>
            <b>TRQX Badge</b>
          </div>
        </div>
      </section>
    </main>
  );
}