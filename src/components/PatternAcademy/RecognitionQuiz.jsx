import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";

function shuffle(values) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [
      result[randomIndex],
      result[index],
    ];
  }

  return result;
}

export default function RecognitionQuiz({
  pattern,
  patterns,
  onResult,
  onContinue,
}) {
  const startedAtRef = useRef(Date.now());

  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    startedAtRef.current = Date.now();
    setSelectedId(null);
    setSubmitted(false);
  }, [pattern?.id]);

  const options = useMemo(() => {
    if (!pattern || !Array.isArray(patterns)) {
      return [];
    }

    const distractors = shuffle(
      patterns.filter((item) => item.id !== pattern.id)
    ).slice(0, 3);

    return shuffle([pattern, ...distractors]);
  }, [pattern, patterns]);

  const selectedPattern = options.find(
    (option) => option.id === selectedId
  );

  const isCorrect =
    submitted && selectedId === pattern?.id;

  function handleSubmit() {
    if (!selectedId || submitted || !pattern) {
      return;
    }

    const correct = selectedId === pattern.id;
    const responseTimeMs = Date.now() - startedAtRef.current;

    setSubmitted(true);

    if (onResult) {
      onResult({
        correct,
        patternId: pattern.id,
        selectedId,
        responseTimeMs,
      });
    }
  }

  function handleRetry() {
    startedAtRef.current = Date.now();
    setSelectedId(null);
    setSubmitted(false);
  }

  function handleContinue() {
    setSelectedId(null);
    setSubmitted(false);

    if (onContinue) {
      onContinue();
    }
  }

  if (!pattern || options.length === 0) {
    return null;
  }

  return (
    <section className="recognition-quiz">
      <div className="recognition-quiz__header">
        <div>
          <span className="recognition-quiz__eyebrow">
            PATTERN RECOGNITION
          </span>

          <h3>What pattern is shown on the chart?</h3>

          <p>
            Identify the setup before revealing the lesson details.
          </p>
        </div>

        <span className="recognition-quiz__difficulty">
          {pattern.level}
        </span>
      </div>

      <div className="recognition-quiz__options">
        {options.map((option) => {
          const selected = selectedId === option.id;
          const correctOption =
            submitted && option.id === pattern.id;
          const incorrectOption =
            submitted &&
            selected &&
            option.id !== pattern.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={submitted}
              className={[
                "recognition-option",
                selected ? "selected" : "",
                correctOption ? "correct" : "",
                incorrectOption ? "incorrect" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setSelectedId(option.id)}
            >
              <span>{option.title}</span>

              {correctOption ? (
                <CheckCircle size={18} />
              ) : null}

              {incorrectOption ? (
                <XCircle size={18} />
              ) : null}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          type="button"
          className="recognition-submit"
          disabled={!selectedId}
          onClick={handleSubmit}
        >
          Check Answer
        </button>
      ) : (
        <div
          className={`recognition-feedback ${
            isCorrect ? "correct" : "incorrect"
          }`}
        >
          <div className="recognition-feedback__title">
            {isCorrect ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}

            <strong>
              {isCorrect
                ? "Correct"
                : `Not quite — this is ${pattern.title}`}
            </strong>
          </div>

          <p>{pattern.takeaway}</p>

          {!isCorrect && selectedPattern ? (
            <small>
              You selected {selectedPattern.title}. Compare the chart
              structure, confirmation level, and buyer-versus-seller
              psychology before answering again.
            </small>
          ) : null}

          <div className="recognition-feedback__actions">
            {!isCorrect ? (
              <button
                type="button"
                onClick={handleRetry}
              >
                <RotateCcw size={16} />
                Try Again
              </button>
            ) : null}

            <button
              type="button"
              className="primary"
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </section>
  );
}