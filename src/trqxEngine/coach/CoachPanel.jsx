import React from "react";
import {
  Brain,
  CheckCircle,
  ShieldAlert,
  Target,
} from "lucide-react";
import buildCoachMessage from "./buildCoachMessage";
import "./coach.css";

const ICONS = {
  positive: CheckCircle,
  warning: ShieldAlert,
  negative: ShieldAlert,
  neutral: Brain,
};

export default function CoachPanel({
  scenario,
  visibleCount,
  latestResult,
  progress,
  achievements = [],
}) {
  const feedback = buildCoachMessage({
    scenario,
    visibleCount,
    result: latestResult,
  });

  const Icon = ICONS[feedback.tone] ?? Brain;

  return (
    <aside className="trqx-coach">
      <div className="trqx-coach__header">
        <div className="trqx-coach__icon">
          <Brain size={21} />
        </div>

        <div>
          <small>TRQX COACH</small>
          <h3>Live Decision Review</h3>
        </div>
      </div>

      <article
        className={`trqx-coach__feedback ${feedback.tone}`}
      >
        <div className="trqx-coach__feedback-title">
          <Icon size={18} />
          <strong>{feedback.title}</strong>
        </div>

        <p>{feedback.message}</p>

        <div className="trqx-coach__rule">
          <Target size={15} />
          <span>{feedback.rule}</span>
        </div>
      </article>

      <section className="trqx-coach__stats">
        <div>
          <span>Accuracy</span>
          <strong>{progress.accuracy}%</strong>
        </div>

        <div>
          <span>XP</span>
          <strong>{progress.xp}</strong>
        </div>

        <div>
          <span>Current Streak</span>
          <strong>{progress.currentStreak}</strong>
        </div>

        <div>
          <span>Best Streak</span>
          <strong>{progress.bestStreak}</strong>
        </div>

        <div>
          <span>Scenarios</span>
          <strong>
            {progress.scenariosCompleted}
          </strong>
        </div>

        <div>
          <span>Trade Plan Avg.</span>
          <strong>
            {progress.averageTradePlanScore}%
          </strong>
        </div>
      </section>

      <section className="trqx-coach__achievements">
        <h4>Achievements</h4>

        {achievements.length === 0 ? (
          <p>
            Complete simulator decisions to unlock
            achievements.
          </p>
        ) : (
          achievements.map((achievement) => (
            <article key={achievement.id}>
              <CheckCircle size={15} />
              <div>
                <strong>
                  {achievement.title}
                </strong>
                <span>
                  {achievement.description}
                </span>
              </div>
            </article>
          ))
        )}
      </section>
    </aside>
  );
}
