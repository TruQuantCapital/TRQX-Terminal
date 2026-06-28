import React, { useState } from "react";
import { Lock } from "lucide-react";
import { courseLevels } from "../data/courseLevels";
import { useAcademyProgress } from "../hooks/useAcademyProgress";
import LessonReader from "./LessonReader";
import "./academyInteractive.css";

export default function AcademyPage() {
  const { completed, loading, markComplete, levelProgress, isLevelUnlocked } =
    useAcademyProgress();

  const [openLesson, setOpenLesson] = useState(null);
  const [showCalendly, setShowCalendly] = useState(false);

  const totalLessons = courseLevels.reduce((sum, lvl) => sum + lvl.lessons.length, 0);
  const totalCompleted = Object.values(completed).reduce((sum, set) => sum + set.size, 0);
  const overallProgress = totalLessons ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const beginnerLevel = courseLevels[0];
  const beginnerProgress = levelProgress(beginnerLevel.key, beginnerLevel.lessons.length);

  function openLessonAt(levelKey, lessonIndex) {
    setOpenLesson({ levelKey, lessonIndex });
  }

  function closeLessonReader() {
    setOpenLesson(null);
  }

  const activeLevel = openLesson
    ? courseLevels.find((l) => l.key === openLesson.levelKey)
    : null;

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
          <b>{loading ? "..." : `${beginnerProgress}%`}</b>
          <span>Progress</span>
        </div>

        <div className="flowMiniCard">
          <small>LESSONS</small>
          <b>{totalLessons}</b>
          <span>Total modules</span>
        </div>

        <div className="flowMiniCard bullish">
          <small>OVERALL</small>
          <b>{loading ? "..." : `${overallProgress}%`}</b>
          <span>Course complete</span>
        </div>
      </section>

      <section className="academyGrid">
        {courseLevels.map((level, levelIndex) => {
          const unlocked = isLevelUnlocked(levelIndex, courseLevels);
          const progress = levelProgress(level.key, level.lessons.length);
          const completedSet = completed[level.key] || new Set();

          return (
            <div key={level.key} className="academyLevelCard">
              <div className="academyLevelTop">
                <div>
                  <small>{level.tag}</small>
                  <h3>{level.title}</h3>
                </div>

                <span>
                  {!unlocked ? "Locked" : progress === 100 ? "Complete" : "In Progress"}
                </span>
              </div>

              <div className="academyProgress">
                <div style={{ width: `${progress}%` }}></div>
              </div>

              <p>{progress}% Complete</p>

              <div className="academyLessonList">
                {level.lessons.map((lesson, i) => {
                  const isDone = completedSet.has(i);
                  return (
                    <button
                      key={lesson.title}
                      className={`academyLessonRow ${isDone ? "lessonDone" : ""} ${!unlocked ? "lessonLocked" : ""}`}
                      onClick={() => unlocked && openLessonAt(level.key, i)}
                      disabled={!unlocked}
                    >
                      <span>{!unlocked ? <Lock size={12} /> : i + 1}</span>
                      <b>{lesson.title}</b>
                      {isDone && <span className="lessonCheckIcon">OK</span>}
                    </button>
                  );
                })}
              </div>

              <button
                className="tradePlanBtn"
                disabled={!unlocked}
                onClick={() => unlocked && openLessonAt(level.key, 0)}
              >
                {!unlocked ? "Locked" : progress === 100 ? "Review Lessons" : "Continue Learning"}
              </button>
            </div>
          );
        })}
      </section>

      <section className="smartMoneySummary">
        <div>
          <small>TRQX STUDY PATH</small>
          <h3>Learn -&gt; Practice -&gt; Quiz -&gt; Apply -&gt; Certify</h3>
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

      {/* ── MENTORING BOOKING SECTION ── */}
      <section style={{
        background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03))",
        border: "1px solid rgba(201,168,76,0.25)",
        borderRadius: 16,
        padding: "32px",
        marginTop: 24,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 12,
              background: "rgba(201,168,76,0.12)",
              border: "1px solid rgba(201,168,76,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26,
            }}>👨‍🏫</div>
            <div>
              <div style={{ color: "var(--gold)", fontSize: 11, fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>1-ON-1 MENTORING</div>
              <div style={{ color: "var(--text)", fontSize: 22, fontWeight: 900 }}>Book a Session with Mike</div>
              <div style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 2 }}>
                Schedule time to review your trades, ask questions, and get personalized guidance.
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCalendly(!showCalendly)}
            style={{
              background: showCalendly ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #C9A84C, #FFD700)",
              color: showCalendly ? "var(--text-dim)" : "#000",
              border: showCalendly ? "1px solid rgba(255,255,255,0.1)" : "none",
              borderRadius: 10,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "var(--font-head)",
              letterSpacing: 1,
              whiteSpace: "nowrap",
            }}
          >
            {showCalendly ? "Hide Calendar" : "BOOK A SESSION →"}
          </button>
        </div>

        {/* What to expect */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: showCalendly ? 24 : 0 }}>
          {[
            { icon: "📊", title: "Trade Review", desc: "Walk through your recent trades and get feedback on entry, exit, and sizing." },
            { icon: "🎯", title: "Strategy Session", desc: "Build a personalized trading plan based on your goals, schedule, and risk tolerance." },
            { icon: "🧠", title: "Concept Deep Dive", desc: "Get clarity on any lesson, concept, or tool you're struggling with." },
          ].map((item) => (
            <div key={item.title} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "16px 18px",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                <div style={{ color: "var(--text-dim)", fontSize: 12, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendly embed */}
        {showCalendly && (
          <div style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "#fff",
            marginTop: 8,
          }}>
            <iframe
              src="https://calendly.com/michaelvalerio/rqx-mentoring-session"
              width="100%"
              height="700px"
              frameBorder="0"
              title="Book a Mentoring Session with Mike"
              style={{ display: "block" }}
            />
          </div>
        )}

        {/* Footer note */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>🛡️</span>
          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
            Sessions are for TRQX Capital members only. For educational purposes — not financial advice.
          </span>
        </div>
      </section>

      {openLesson && activeLevel && (
        <LessonReader
          level={activeLevel}
          lessonIndex={openLesson.lessonIndex}
          isCompleted={(completed[openLesson.levelKey] || new Set()).has(openLesson.lessonIndex)}
          onClose={closeLessonReader}
          onComplete={(idx) => markComplete(openLesson.levelKey, idx)}
          onNavigate={(newIndex) =>
            setOpenLesson({ levelKey: openLesson.levelKey, lessonIndex: newIndex })
          }
        />
      )}
    </main>
  );
}