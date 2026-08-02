import React from "react";
import {
  CheckCircle2,
  GraduationCap,
  Target,
  XCircle,
} from "lucide-react";
import "./tradeGrade.css";

function ScoreRow({
  label,
  score,
  detail,
}) {
  const passed = score >= 80;

  return (
    <article
      className={[
        "trqx-trade-grade__row",
        passed ? "passed" : "failed",
      ].join(" ")}
    >
      {passed ? (
        <CheckCircle2 size={17} />
      ) : (
        <XCircle size={17} />
      )}

      <div>
        <span>{label}</span>
        {detail ? <small>{detail}</small> : null}
      </div>

      <strong>{score}%</strong>
    </article>
  );
}

function formatPrice(value) {
  return Number.isFinite(value)
    ? value.toFixed(2)
    : "—";
}

export default function TradeGradePanel({
  result,
}) {
  if (!result) {
    return null;
  }

  return (
    <section className="trqx-trade-grade">
      <header className="trqx-trade-grade__header">
        <div>
          <small>PROFESSIONAL REVIEW</small>

          <h2>
            <GraduationCap size={22} />
            Trade Grade
          </h2>

          <p>{result.feedback}</p>
        </div>

        <div
          className={[
            "trqx-trade-grade__overall",
            result.passed ? "passed" : "failed",
          ].join(" ")}
        >
          <span>{result.grade}</span>
          <strong>{result.overall}%</strong>
        </div>
      </header>

      <div className="trqx-trade-grade__grid">
        <ScoreRow
          label="Direction"
          score={result.direction.score}
          detail={`Expected ${result.direction.expected?.toUpperCase() ?? "PASS"}`}
        />

        <ScoreRow
          label="Entry"
          score={result.entry.score}
          detail={`Expected ${formatPrice(result.entry.expected)}`}
        />

        <ScoreRow
          label="Stop Placement"
          score={result.stop.score}
          detail={`Expected ${formatPrice(result.stop.expected)}`}
        />

        <ScoreRow
          label="Target 1"
          score={result.target1.score}
          detail={`Expected ${formatPrice(result.target1.expected)}`}
        />

        <ScoreRow
          label="Target 2"
          score={result.target2.score}
          detail={`Expected ${formatPrice(result.target2.expected)}`}
        />

        <ScoreRow
          label="Reward-to-Risk"
          score={result.riskReward.score}
          detail={result.riskReward.label}
        />

        <ScoreRow
          label="Risk Management"
          score={result.riskManagement}
          detail="Risk per trade"
        />

        <ScoreRow
          label="Trade Thesis"
          score={result.thesis}
          detail="Pattern, location, confirmation"
        />

        <ScoreRow
          label="Confidence"
          score={result.confidence}
          detail="Self-assessment calibration"
        />
      </div>

      <footer className="trqx-trade-grade__footer">
        <Target size={17} />

        <span>
          {result.passed
            ? "Trade plan passed the TRQX professional standard."
            : "Trade plan requires additional practice before certification credit."}
        </span>
      </footer>
    </section>
  );
}
