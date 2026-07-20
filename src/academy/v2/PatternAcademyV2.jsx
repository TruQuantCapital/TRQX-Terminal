import React, { useMemo, useState } from "react";
import PatternRenderer from "./engine/PatternRenderer";
import { validatePattern } from "./engine/validator";
import bullPennant from "./patterns/bullPennant";
import "./patternAcademyV2.css";

const LABELS = [
  "Flagpole",
  "Upper Pennant",
  "Lower Pennant",
  "Breakout",
  "Confirmation",
  "Entry",
];

export default function PatternAcademyV2() {
  const pattern = bullPennant;
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validation = useMemo(() => validatePattern(pattern), [pattern]);

  const score = pattern.targets.reduce((total, target) => {
    return total + (answers[target.id] === target.answer ? 1 : 0);
  }, 0);

  function assignLabel(targetId, label) {
    setAnswers((current) => ({ ...current, [targetId]: label }));
    setSelectedLabel(null);
    setSubmitted(false);
  }

  function clearTarget(targetId) {
    setAnswers((current) => {
      const next = { ...current };
      delete next[targetId];
      return next;
    });
    setSubmitted(false);
  }

  function resetExercise() {
    setAnswers({});
    setSelectedLabel(null);
    setSubmitted(false);
  }

  return (
    <section className="trqx-v2-shell">
      <header className="trqx-v2-header">
        <div>
          <p className="trqx-v2-kicker">TRQX PATTERN ACADEMY · ENGINE V2</p>
          <div className="trqx-v2-title-row">
            <h1>{pattern.title}</h1>
            <span>{pattern.difficulty}</span>
          </div>
          <p>
            Select a label, then select its location. Select a completed target
            to clear it.
          </p>
        </div>

        <div className="trqx-v2-xp">
          <small>XP</small>
          <strong>{submitted ? score * 20 : 0}</strong>
        </div>
      </header>

      {!validation.valid && (
        <div className="trqx-v2-validation-error">
          This pattern failed engine validation and should not be published.
        </div>
      )}

      <div className="trqx-v2-card">
        <div className="trqx-v2-card-top">
          <span>D1</span>
          <span>TREND: {pattern.category}</span>
          <span className="trqx-v2-status">{pattern.status.toUpperCase()}</span>
        </div>

        <PatternRenderer
          pattern={pattern}
          answers={answers}
          selectedLabel={selectedLabel}
          onAssign={assignLabel}
          onClear={clearTarget}
        />

        <div className="trqx-v2-label-bank">
          {LABELS.map((label) => {
            const used = Object.values(answers).includes(label);
            return (
              <button
                key={label}
                type="button"
                disabled={used}
                className={selectedLabel === label ? "is-selected" : ""}
                onClick={() =>
                  setSelectedLabel(selectedLabel === label ? null : label)
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="trqx-v2-actions">
          <button type="button" onClick={() => setSubmitted(true)}>
            Check Answers
          </button>
          <button type="button" className="secondary" onClick={resetExercise}>
            Reset
          </button>
          {submitted && (
            <strong>
              {score}/{pattern.targets.length} correct
            </strong>
          )}
        </div>
      </div>

      <div className="trqx-v2-panels">
        <article>
          <h2>Pattern Explanation</h2>
          <p>{pattern.explanation.pattern}</p>
        </article>
        <article>
          <h2>Confirmation</h2>
          <p>{pattern.explanation.confirmation}</p>
        </article>
        <article>
          <h2>Invalidation</h2>
          <p>{pattern.explanation.invalidation}</p>
        </article>
      </div>
    </section>
  );
}
