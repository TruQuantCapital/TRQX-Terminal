import React, { useState } from "react";
import { Lock } from "lucide-react";
import { courseLevels } from "../data/courseLevels";
import { useAcademyProgress } from "../hooks/useAcademyProgress";
import LessonReader from "./LessonReader";
import "./academyInteractive.css";
// remove this from AcademyPage.jsx for now

export default function AcademyPage() {
  const { completed, loading, markComplete, levelProgress, isLevelUnlocked } =
    useAcademyProgress();

  const [openLesson, setOpenLesson] = useState(null);

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


