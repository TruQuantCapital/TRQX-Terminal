import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  ShieldAlert,
} from "lucide-react";
import {
  createEmptyTrade,
  validateTradeContract,
} from "../../contracts";
import "./tradeBuilder.css";

function calculateRewardRisk({
  direction,
  entry,
  stop,
  target,
}) {
  const parsedEntry = Number(entry);
  const parsedStop = Number(stop);
  const parsedTarget = Number(target);

  if (
    !Number.isFinite(parsedEntry) ||
    !Number.isFinite(parsedStop) ||
    !Number.isFinite(parsedTarget)
  ) {
    return null;
  }

  const risk = Math.abs(parsedEntry - parsedStop);

  if (risk <= 0) {
    return null;
  }

  const reward =
    direction === "sell"
      ? parsedEntry - parsedTarget
      : parsedTarget - parsedEntry;

  if (reward <= 0) {
    return null;
  }

  return reward / risk;
}

function PriceInput({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <label className="trqx-trade-builder__field">
      <span>{label}</span>

      <input
        type="number"
        step="0.01"
        name={name}
        value={value}
        onChange={onChange}
        placeholder="0.00"
      />
    </label>
  );
}

export default function TradeBuilderPanel({
  scenario,
  session,
  onTradeChange,
  onTradeSubmit,
}) {
  const [trade, setTrade] = useState(
    createEmptyTrade
  );

  const [submitted, setSubmitted] =
    useState(false);

  const validation = useMemo(
    () =>
      validateTradeContract(trade, {
        allowDraft: false,
      }),
    [trade]
  );

  const rewardRisk = useMemo(
    () =>
      calculateRewardRisk({
        direction: trade.direction,
        entry: trade.entry,
        stop: trade.stop,
        target: trade.target1,
      }),
    [
      trade.direction,
      trade.entry,
      trade.stop,
      trade.target1,
    ]
  );

  function updateField(event) {
    const {
      name,
      value,
    } = event.target;

    const nextTrade = {
      ...trade,
      [name]: value,
    };

    setTrade(nextTrade);
    setSubmitted(false);
    onTradeChange?.(nextTrade);
  }

  function setDirection(direction) {
    const nextTrade = {
      ...trade,
      direction,
    };

    setTrade(nextTrade);
    setSubmitted(false);
    onTradeChange?.(nextTrade);
  }

  function setConfidence(confidence) {
    const nextTrade = {
      ...trade,
      confidence,
    };

    setTrade(nextTrade);
    setSubmitted(false);
    onTradeChange?.(nextTrade);
  }

  function submitTrade() {
    const result = validateTradeContract(
      trade
    );

    if (!result.valid) {
      return;
    }

    const normalizedTrade = {
      ...trade,
      entry:
        trade.direction === "pass"
          ? null
          : Number(trade.entry),
      stop:
        trade.direction === "pass"
          ? null
          : Number(trade.stop),
      target1:
        trade.direction === "pass"
          ? null
          : Number(trade.target1),
      target2:
        trade.direction === "pass"
          ? null
          : Number(trade.target2),
      riskPercent:
        trade.direction === "pass"
          ? null
          : Number(trade.riskPercent),
      positionSize:
        trade.positionSize === ""
          ? null
          : Number(trade.positionSize),
      confidence: Number(
        trade.confidence
      ),
      rewardRisk:
        rewardRisk === null
          ? null
          : Number(
              rewardRisk.toFixed(2)
            ),
    };

    onTradeSubmit?.(normalizedTrade);
    setSubmitted(true);
  }

  const expectedDirection =
    scenario?.context?.priorTrend ===
    "uptrend"
      ? "sell"
      : "buy";

  return (
    <section className="trqx-trade-builder">
      <header className="trqx-trade-builder__header">
        <div>
          <small>
            PROFESSIONAL TRADE TICKET
          </small>

          <h2>
            <ClipboardCheck size={21} />
            Build the Trade
          </h2>

          <p>
            Create the complete plan before
            reviewing the professional answer.
          </p>
        </div>

        <div className="trqx-trade-builder__session">
          <span>Session</span>
          <strong>
            {session?.id
              ?.split("-")
              .slice(-1)[0] ??
              "Pending"}
          </strong>
        </div>
      </header>

      <div className="trqx-trade-builder__context">
        <article>
          <span>Pattern</span>
          <strong>
            {scenario?.answer?.pattern ??
              scenario?.type}
          </strong>
        </article>

        <article>
          <span>Setup Variant</span>
          <strong>
            {scenario?.answer?.validSetup
              ? "Confirmed"
              : "Failed"}
          </strong>
        </article>

        <article>
          <span>Expected Bias</span>
          <strong>
            {scenario?.answer?.validSetup
              ? expectedDirection.toUpperCase()
              : "PASS"}
          </strong>
        </article>

        <article>
          <span>Current R:R</span>
          <strong>
            {rewardRisk === null
              ? "—"
              : `${rewardRisk.toFixed(2)}:1`}
          </strong>
        </article>
      </div>

      <div className="trqx-trade-builder__directions">
        {[
          ["buy", "Bullish"],
          ["sell", "Bearish"],
          ["pass", "Pass"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={
              trade.direction === value
                ? "active"
                : ""
            }
            onClick={() =>
              setDirection(value)
            }
          >
            {label}
          </button>
        ))}
      </div>

      {trade.direction &&
      trade.direction !== "pass" ? (
        <>
          <div className="trqx-trade-builder__prices">
            <PriceInput
              label="Entry"
              name="entry"
              value={trade.entry}
              onChange={updateField}
            />

            <PriceInput
              label="Stop Loss"
              name="stop"
              value={trade.stop}
              onChange={updateField}
            />

            <PriceInput
              label="Target 1"
              name="target1"
              value={trade.target1}
              onChange={updateField}
            />

            <PriceInput
              label="Target 2"
              name="target2"
              value={trade.target2}
              onChange={updateField}
            />

            <PriceInput
              label="Risk Per Trade (%)"
              name="riskPercent"
              value={trade.riskPercent}
              onChange={updateField}
            />

            <PriceInput
              label="Position Size"
              name="positionSize"
              value={trade.positionSize}
              onChange={updateField}
            />
          </div>

          <div
            className={[
              "trqx-trade-builder__rr",
              rewardRisk !== null &&
              rewardRisk >= 2
                ? "acceptable"
                : "warning",
            ].join(" ")}
          >
            <ShieldAlert size={17} />

            <span>
              {rewardRisk === null
                ? "Enter entry, stop, and Target 1 to calculate reward-to-risk."
                : rewardRisk >= 2
                  ? `Reward-to-risk is ${rewardRisk.toFixed(2)}:1.`
                  : `Reward-to-risk is only ${rewardRisk.toFixed(2)}:1.`}
            </span>
          </div>
        </>
      ) : null}

      <section className="trqx-trade-builder__confidence">
        <div>
          <span>Confidence</span>
          <strong>
            {trade.confidence}/10
          </strong>
        </div>

        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={trade.confidence}
          onChange={(event) =>
            setConfidence(
              Number(
                event.target.value
              )
            )
          }
        />
      </section>

      <label className="trqx-trade-builder__thesis">
        <span>Trade Thesis</span>

        <textarea
          name="thesis"
          value={trade.thesis}
          onChange={updateField}
          rows={4}
          placeholder="Explain the pattern, location, confirmation, and risk logic."
        />
      </label>

      {!validation.valid ? (
        <div className="trqx-trade-builder__errors">
          {validation.errors.map(
            (error) => (
              <span key={error}>
                {error}
              </span>
            )
          )}
        </div>
      ) : null}

      <button
        type="button"
        className="trqx-trade-builder__submit"
        disabled={!validation.valid}
        onClick={submitTrade}
      >
        {submitted ? (
          <>
            <CheckCircle2 size={18} />
            Trade Submitted
          </>
        ) : (
          "Submit Trade"
        )}
      </button>
    </section>
  );
}
