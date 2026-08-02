import React from "react";
import {
  Award,
  CheckCircle2,
  Medal,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import "./certification.css";

function ScoreItem({
  label,
  value,
}) {
  const passed = value >= 80;

  return (
    <article
      className={[
        "trqx-certification__score",
        passed ? "passed" : "failed",
      ].join(" ")}
    >
      {passed ? (
        <CheckCircle2 size={16} />
      ) : (
        <XCircle size={16} />
      )}

      <span>{label}</span>
      <strong>{value}%</strong>
    </article>
  );
}

export default function CertificationPanel({
  result,
}) {
  if (!result) {
    return null;
  }

  return (
    <section className="trqx-certification">
      <header className="trqx-certification__header">
        <div>
          <small>TRQX PROFESSIONAL CERTIFICATION</small>

          <h2>
            <ShieldCheck size={23} />
            Certification Review
          </h2>

          <p>{result.summary}</p>
        </div>

        <div
          className={[
            "trqx-certification__badge",
            result.passed ? "passed" : "failed",
          ].join(" ")}
        >
          <Award size={28} />
          <span>{result.grade}</span>
          <strong>{result.score}%</strong>
        </div>
      </header>

      <div className="trqx-certification__status">
        {result.passed ? (
          <>
            <CheckCircle2 size={20} />
            CERTIFIED
          </>
        ) : (
          <>
            <XCircle size={20} />
            NOT CERTIFIED
          </>
        )}
      </div>

      <div className="trqx-certification__scores">
        <ScoreItem
          label="Replay Discipline"
          value={result.replayDiscipline}
        />

        <ScoreItem
          label="Decision Accuracy"
          value={result.decisionAccuracy}
        />

        <ScoreItem
          label="Pattern Recognition"
          value={result.patternRecognition}
        />

        <ScoreItem
          label="Execution"
          value={result.execution}
        />

        <ScoreItem
          label="Risk Management"
          value={result.riskManagement}
        />

        <ScoreItem
          label="Trade Thesis"
          value={result.thesis}
        />

        <ScoreItem
          label="Confidence"
          value={result.confidence}
        />
      </div>

      {result.achievements.length > 0 ? (
        <section className="trqx-certification__achievements">
          <h3>
            <Medal size={18} />
            Achievements
          </h3>

          <div>
            {result.achievements.map(
              (achievement) => (
                <article key={achievement.id}>
                  <strong>{achievement.title}</strong>
                  <span>{achievement.description}</span>
                </article>
              )
            )}
          </div>
        </section>
      ) : null}
    </section>
  );
}
