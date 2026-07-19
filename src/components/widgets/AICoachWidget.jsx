import React from "react";
import { useNavigate } from "react-router-dom";
import WidgetShell from "./WidgetShell";
import "./AICoachWidget.css";

const DEFAULT_COACH_DATA = {
  greeting: "Good morning",
  marketRegime: "Risk On",
  confidence: 84,
  focus: "Wait for ORB confirmation and avoid entries inside consolidation.",
  economicEvent: "No major event selected",
  institutionalFlow: "Bullish flow remains constructive",
  gammaBias: "Long Gamma",
  journalGrade: "A-",
};

function getConfidenceTone(confidence) {
  if (confidence >= 75) return "high";
  if (confidence >= 50) return "medium";
  return "low";
}

export default function AICoachWidget({
  data = DEFAULT_COACH_DATA,
  userName = "Michael",
  height = "100%",
}) {
  const navigate = useNavigate();

  const confidence = Number.isFinite(data.confidence)
    ? Math.max(0, Math.min(100, data.confidence))
    : 0;

  const confidenceTone = getConfidenceTone(confidence);

  return (
    <WidgetShell
      eyebrow="TRQX Morning Coach"
      title={`${data.greeting}, ${userName}`}
      description="Your market context, execution focus, and trading discipline briefing."
      height={height}
      className="trqx-ai-coach-widget"
      action={
        <button
          type="button"
          className="trqx-ai-coach-action"
          onClick={() => navigate("/reports")}
        >
          Open Full Report
        </button>
      }
    >
      <div className="trqx-ai-coach-layout">
        <section className="trqx-ai-coach-summary">
          <div className="trqx-ai-coach-regime">
            <span>Market Regime</span>
            <strong>{data.marketRegime}</strong>
          </div>

          <div className="trqx-ai-coach-confidence">
            <div className="trqx-ai-coach-confidence-heading">
              <span>AI Confidence</span>
              <strong>{confidence}%</strong>
            </div>

            <div
              className="trqx-ai-coach-confidence-track"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={confidence}
              aria-label="AI confidence"
            >
              <div
                className={`trqx-ai-coach-confidence-fill ${confidenceTone}`}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>

          <div className="trqx-ai-coach-focus">
            <span>Today&apos;s Focus</span>
            <p>{data.focus}</p>
          </div>
        </section>

        <section className="trqx-ai-coach-metrics">
          <article>
            <span>Economic Events</span>
            <strong>{data.economicEvent}</strong>
          </article>

          <article>
            <span>Institutional Flow</span>
            <strong>{data.institutionalFlow}</strong>
          </article>

          <article>
            <span>Gamma Bias</span>
            <strong>{data.gammaBias}</strong>
          </article>

          <article>
            <span>Journal Grade</span>
            <strong>{data.journalGrade}</strong>
          </article>
        </section>
      </div>
    </WidgetShell>
  );
}