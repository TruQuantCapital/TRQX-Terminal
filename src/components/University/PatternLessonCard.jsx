import React, { useMemo, useState } from "react";
import "./PatternLessonCard.css";

function DetailList({ title, items, tone = "default" }) {
  if (!items?.length) return null;

  return (
    <section className={`tpl-section tpl-section--${tone}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ComparisonTable({ rows }) {
  if (!rows?.length) return null;

  return (
    <section className="tpl-section">
      <h3>Do Not Confuse It With</h3>
      <div className="tpl-comparisons">
        {rows.map((row) => (
          <div className="tpl-comparison" key={row.name}>
            <strong>{row.name}</strong>
            <p>{row.difference}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PatternLessonCard({ pattern, onComplete }) {
  const [activeCheck, setActiveCheck] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState([]);

  const completionLabel = useMemo(() => {
    if (pattern.classification?.toLowerCase().includes("bearish")) return "Bearish Reversal";
    if (pattern.classification?.toLowerCase().includes("bullish")) return "Bullish Pattern";
    return pattern.classification;
  }, [pattern.classification]);

  function toggleAnswer(id) {
    setRevealedAnswers((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <article className="tpl-shell">
      <header className="tpl-hero">
        <div className="tpl-hero__content">
          <div className="tpl-eyebrow">TRQX UNIVERSITY · CANDLESTICK LIBRARY</div>
          <div className="tpl-title-row">
            <div>
              <h1>{pattern.name}</h1>
              <p>{pattern.quickDefinition}</p>
            </div>
            <div className="tpl-badges">
              <span>{completionLabel}</span>
              <span>{pattern.candleCount} Candles</span>
              <span>{pattern.difficulty}</span>
              <span>{pattern.durationMinutes} Min</span>
            </div>
          </div>
        </div>
      </header>

      <div className="tpl-grid tpl-grid--hero">
        <section className="tpl-visual">
          <div className="tpl-section-label">Master Visual</div>
          <img src={pattern.image} alt={`${pattern.name} TRQX pattern guide`} />
          <p className="tpl-caption">
            Use the image to learn the idealized formation. Real market examples will vary in candle size and body shape.
          </p>
        </section>

        <section className="tpl-overview">
          <div className="tpl-section-label">Recognition Checklist</div>
          <div className="tpl-checklist">
            <button
              type="button"
              className={activeCheck === "trend" ? "is-active" : ""}
              onClick={() => setActiveCheck("trend")}
            >
              <span>1</span>
              <div><strong>Prior Trend</strong><p>{pattern.priorTrend}</p></div>
            </button>
            <button
              type="button"
              className={activeCheck === "location" ? "is-active" : ""}
              onClick={() => setActiveCheck("location")}
            >
              <span>2</span>
              <div><strong>Location</strong><p>{pattern.idealLocation[0]}</p></div>
            </button>
            <button
              type="button"
              className={activeCheck === "confirmation" ? "is-active" : ""}
              onClick={() => setActiveCheck("confirmation")}
            >
              <span>3</span>
              <div><strong>Confirmation</strong><p>{pattern.confirmation[0]}</p></div>
            </button>
            <button
              type="button"
              className={activeCheck === "risk" ? "is-active" : ""}
              onClick={() => setActiveCheck("risk")}
            >
              <span>4</span>
              <div><strong>Invalidation</strong><p>{pattern.invalidation[0]}</p></div>
            </button>
          </div>
        </section>
      </div>

      <section className="tpl-psychology">
        <div className="tpl-section-label">Buyer & Seller Psychology</div>
        <p>{pattern.psychology}</p>
      </section>

      <div className="tpl-grid tpl-grid--details">
        <DetailList title="Pattern Anatomy" items={pattern.anatomy} />
        <DetailList title="Ideal Market Location" items={pattern.idealLocation} />
        <DetailList title="Confirmation Evidence" items={pattern.confirmation} tone="positive" />
        <DetailList title="Invalidation Evidence" items={pattern.invalidation} tone="negative" />
        <DetailList title="Stronger When" items={pattern.strongerWhen} tone="positive" />
        <DetailList title="Weaker When" items={pattern.weakerWhen} tone="warning" />
      </div>

      <section className="tpl-formation">
        <div className="tpl-section-label">How the Pattern Forms</div>
        <div className="tpl-steps">
          {pattern.formationSteps.map((step, index) => (
            <div className="tpl-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <DetailList title="Common Beginner Mistakes" items={pattern.commonMistakes} tone="warning" />
      <ComparisonTable rows={pattern.comparisonPatterns} />

      <section className="tpl-framework">
        <div className="tpl-section-label">Educational Trading Framework</div>
        <div className="tpl-framework__grid">
          <div><span>Possible Trigger</span><strong>{pattern.educationalFramework.possibleTrigger}</strong></div>
          <div><span>Invalidation Reference</span><strong>{pattern.educationalFramework.invalidationReference}</strong></div>
          <div><span>First Evaluation Area</span><strong>{pattern.educationalFramework.firstEvaluationArea}</strong></div>
        </div>
        <p>{pattern.educationalFramework.riskReminder}</p>
      </section>

      <section className="tpl-quiz">
        <div className="tpl-section-label">Knowledge Check</div>
        <div className="tpl-quiz__items">
          {pattern.knowledgeCheck.map((item, index) => {
            const isOpen = revealedAnswers.includes(item.id);
            return (
              <div className="tpl-quiz__item" key={item.id}>
                <button type="button" onClick={() => toggleAnswer(item.id)}>
                  <span>{index + 1}</span>
                  <strong>{item.question}</strong>
                  <em>{isOpen ? "Hide answer" : "Reveal answer"}</em>
                </button>
                {isOpen && <p>{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="tpl-practice">
        <div>
          <div className="tpl-section-label">Written Practice</div>
          <h3>Explain the setup in your own words</h3>
          <p>{pattern.practicePrompt}</p>
        </div>
        <button type="button" onClick={() => onComplete?.(pattern.id)}>
          Mark Lesson Complete
        </button>
      </section>
    </article>
  );
}
