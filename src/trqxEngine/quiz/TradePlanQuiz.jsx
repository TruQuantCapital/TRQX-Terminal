import React, { useState } from "react";
import gradeTradePlan from "../grading/gradeTradePlan";

function PriceField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className="trqx-price-field">
      <span>{label}</span>

      <input
        type="number"
        step="0.01"
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

export default function TradePlanQuiz({
  scenario,
  onResult,
}) {
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState(null);

  function submitPlan() {
    const nextResult = gradeTradePlan({
      scenario,
      entry: Number(entry),
      stop: Number(stop),
      target: Number(target),
    });

    setResult(nextResult);
    onResult?.(nextResult);
  }

  function resetPlan() {
    setEntry("");
    setStop("");
    setTarget("");
    setResult(null);
  }

  const complete =
    entry !== "" &&
    stop !== "" &&
    target !== "";

  return (
    <section className="trqx-trade-plan-quiz">
      <div className="trqx-trade-plan-quiz__header">
        <div>
          <small>EXECUTION TEST</small>
          <h3>Build the trade plan</h3>
          <p>
            Enter the professional entry, stop, and
            target based on the generated scenario.
          </p>
        </div>
      </div>

      <div className="trqx-trade-plan-fields">
        <PriceField
          label="Entry"
          value={entry}
          onChange={setEntry}
          placeholder="Enter price"
        />

        <PriceField
          label="Stop"
          value={stop}
          onChange={setStop}
          placeholder="Enter price"
        />

        <PriceField
          label="Target"
          value={target}
          onChange={setTarget}
          placeholder="Enter price"
        />
      </div>

      {!result ? (
        <button
          type="button"
          className="trqx-quiz-primary"
          disabled={!complete}
          onClick={submitPlan}
        >
          Grade Trade Plan
        </button>
      ) : (
        <div
          className={[
            "trqx-trade-plan-result",
            result.passed ? "passed" : "failed",
          ].join(" ")}
        >
          <h4>
            Trade Plan Score: {result.score}%
          </h4>

          <div className="trqx-trade-plan-result__grid">
            <span>
              Entry:
              <b>
                {result.entry.correct
                  ? "Correct"
                  : `Expected ${result.entry.expected}`}
              </b>
            </span>

            <span>
              Stop:
              <b>
                {result.stop.correct
                  ? "Correct"
                  : `Expected ${result.stop.expected}`}
              </b>
            </span>

            <span>
              Target:
              <b>
                {result.target.correct
                  ? "Correct"
                  : `Expected ${result.target.expected.join(
                      " or "
                    )}`}
              </b>
            </span>
          </div>

          <button
            type="button"
            onClick={resetPlan}
          >
            Try Again
          </button>
        </div>
      )}
    </section>
  );
}
