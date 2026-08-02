import React from "react";
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle,
  GraduationCap,
  Target,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="mastery-stat-card">
      <div className="mastery-stat-card__icon">
        <Icon size={20} />
      </div>

      <div>
        <span className="mastery-stat-card__label">{label}</span>
        <strong className="mastery-stat-card__value">{value}</strong>
        <small className="mastery-stat-card__detail">{detail}</small>
      </div>
    </article>
  );
}

export default function MasteryDashboard({
  completedLessons = 8,
  totalLessons = 8,
  quizAverage = 0,
  flashcardsReviewed = 0,
  masteryScore = 0,
  examPassed = false,
}) {
  const lessonProgress = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return (
    <section className="mastery-dashboard">
      <div className="mastery-dashboard__header">
        <div>
          <p className="mastery-dashboard__eyebrow">
            TRQX UNIVERSITY
          </p>

          <h1>Candlestick Mastery Center</h1>

          <span>
            Review patterns, strengthen weak areas, and complete the
            Candlestick Foundations certification.
          </span>
        </div>

        <div className="mastery-dashboard__status">
          <span className="mastery-dashboard__status-dot" />

          {examPassed
            ? "CERTIFIED"
            : lessonProgress === 100
              ? "EXAM READY"
              : "IN PROGRESS"}
        </div>
      </div>

      <div className="mastery-dashboard__progress-panel">
        <div className="mastery-dashboard__progress-copy">
          <span>MODULE PROGRESS</span>

          <strong>{lessonProgress}%</strong>

          <small>
            {completedLessons} of {totalLessons} lessons completed
          </small>
        </div>

        <div
          className="mastery-dashboard__progress-track"
          role="progressbar"
          aria-label="Candlestick module progress"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={lessonProgress}
        >
          <div
            className="mastery-dashboard__progress-fill"
            style={{ width: `${lessonProgress}%` }}
          />
        </div>
      </div>

      <div className="mastery-dashboard__stats">
        <StatCard
          icon={BookOpen}
          label="Lessons"
          value={`${completedLessons}/${totalLessons}`}
          detail="Candlestick lessons"
        />

        <StatCard
          icon={Brain}
          label="Flashcards"
          value={flashcardsReviewed}
          detail="Cards reviewed"
        />

        <StatCard
          icon={Target}
          label="Quiz Average"
          value={`${quizAverage}%`}
          detail="80% required"
        />

        <StatCard
          icon={Award}
          label="Mastery Score"
          value={`${masteryScore}%`}
          detail="Overall proficiency"
        />

        <StatCard
          icon={GraduationCap}
          label="Final Exam"
          value={examPassed ? "Passed" : "Locked"}
          detail={
            examPassed
              ? "Certificate earned"
              : "Complete requirements"
          }
        />

        <StatCard
          icon={CheckCircle}
          label="Module Status"
          value={
            examPassed
              ? "Certified"
              : lessonProgress === 100
                ? "Ready"
                : "Learning"
          }
          detail="Candlestick Foundations"
        />
      </div>
    </section>
  );
}