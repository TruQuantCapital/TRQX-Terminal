import React, { useEffect, useState } from "react";
import DecisionButtons from "./DecisionButtons";
import QuizFeedback from "./QuizFeedback";
import TradePlanQuiz from "./TradePlanQuiz";
import gradeDecision from "../grading/gradeDecision";
import "./quiz.css";

export default function DecisionQuizPanel({
  scenario,
  visibleCount,
  finished,
  onDecisionResult,
  onTradePlanResult,
}) {
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setSelected("");
    setResult(null);
  }, [visibleCount, scenario?.id]);

  function submitDecision() {
    if (!selected) {
      return;
    }

    const nextResult = gradeDecision({
      scenario,
      visibleCount,
      decision: selected,
    });

    setResult(nextResult);

    setHistory((current) => [
      ...current,
      {
        candle: visibleCount,
        ...nextResult,
      },
    ]);

    onDecisionResult?.(nextResult);
  }

  const correctAnswers = history.filter(
    (attempt) => attempt.correct
  ).length;

  const accuracy = history.length
    ? Math.round(
        (correctAnswers / history.length) * 100
      )
    : 0;

  return (
    <section className="trqx-decision-quiz">
      <div className="trqx-decision-quiz__header">
        <div>
          <small>DECISION TRAINING</small>

          <h3>
            What is the professional decision now?
          </h3>

          <p>
            Use only the candles currently visible.
          </p>
        </div>

        <div className="trqx-decision-quiz__stats">
          <span>
            Attempts <b>{history.length}</b>
          </span>

          <span>
            Accuracy <b>{accuracy}%</b>
          </span>
        </div>
      </div>

      <DecisionButtons
        selected={selected}
        disabled={Boolean(result)}
        onSelect={setSelected}
      />

      {!result ? (
        <button
          type="button"
          className="trqx-quiz-primary"
          disabled={!selected}
          onClick={submitDecision}
        >
          Submit Decision
        </button>
      ) : null}

      <QuizFeedback result={result} />

      {finished &&
      scenario?.answer?.validSetup ? (
        <TradePlanQuiz
          scenario={scenario}
          onResult={onTradePlanResult}
        />
      ) : null}
    </section>
  );
}
