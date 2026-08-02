import React from "react";
import {
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function QuizFeedback({
  result,
}) {
  if (!result) {
    return null;
  }

  return (
    <div
      className={[
        "trqx-quiz-feedback",
        result.correct ? "correct" : "incorrect",
      ].join(" ")}
    >
      <div className="trqx-quiz-feedback__title">
        {result.correct ? (
          <CheckCircle size={21} />
        ) : (
          <XCircle size={21} />
        )}

        <strong>
          {result.correct
            ? "Correct decision"
            : "Decision needs improvement"}
        </strong>
      </div>

      <p>{result.reason}</p>

      <div className="trqx-quiz-feedback__details">
        <span>
          Your decision:
          <b>{result.selected.toUpperCase()}</b>
        </span>

        <span>
          Professional decision:
          <b>{result.expected.toUpperCase()}</b>
        </span>

        <span>
          Score:
          <b>{result.score}%</b>
        </span>
      </div>
    </div>
  );
}
