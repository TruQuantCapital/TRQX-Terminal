import { assertValidOHLC } from "../../../validation/validateOHLC";

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function createCandle(values) {
  return {
    ...values,
    open: round(values.open),
    high: round(values.high),
    low: round(values.low),
    close: round(values.close),
    volume: Math.round(values.volume),
  };
}

export function generateBullishEngulfingScenario(options = {}) {
  const {
    startingPrice = 100,
    volatility = 1,
    confirmation = true,
    volumeProfile = "increasing",
  } = options;

  const step = startingPrice * 0.025 * volatility;
  const baseVolume = 1_000_000;
  const volumeMultiplier =
    volumeProfile === "increasing" ? 1.2 : 1;

  const candles = [];
  let price = startingPrice;

  for (let index = 0; index < 3; index += 1) {
    const open = price;
    const close = open - step;

    candles.push(
      createCandle({
        time: index + 1,
        open,
        high: open + step * 0.25,
        low: close - step * 0.35,
        close,
        volume: baseVolume * (1 + index * 0.08),
        role: "downtrend",
      })
    );

    price = close;
  }

  const firstOpen = price;
  const firstClose = firstOpen - step * 0.65;

  candles.push(
    createCandle({
      time: 4,
      open: firstOpen,
      high: firstOpen + step * 0.18,
      low: firstClose - step * 0.25,
      close: firstClose,
      volume: baseVolume * 1.1,
      role: "setup-candle",
    })
  );

  const support = firstClose - step * 0.35;
  const engulfOpen = firstClose - step * 0.2;
  const engulfClose = firstOpen + step * 0.55;

  candles.push(
    createCandle({
      time: 5,
      open: engulfOpen,
      high: engulfClose + step * 0.28,
      low: support,
      close: engulfClose,
      volume: baseVolume * 1.85 * volumeMultiplier,
      role: "bullish-engulfing",
    })
  );

  const confirmationLevel = engulfClose;

  if (confirmation) {
    const confirmationOpen =
      engulfClose + step * 0.08;
    const confirmationClose =
      confirmationOpen + step * 0.95;

    candles.push(
      createCandle({
        time: 6,
        open: confirmationOpen,
        high: confirmationClose + step * 0.25,
        low: confirmationOpen - step * 0.2,
        close: confirmationClose,
        volume: baseVolume * 1.7 * volumeMultiplier,
        role: "confirmation",
      })
    );

    candles.push(
      createCandle({
        time: 7,
        open: confirmationClose,
        high: confirmationClose + step * 1.15,
        low: confirmationClose - step * 0.25,
        close: confirmationClose + step * 0.8,
        volume: baseVolume * 1.4,
        role: "follow-through",
      })
    );
  } else {
    candles.push(
      createCandle({
        time: 6,
        open: engulfClose,
        high: engulfClose + step * 0.2,
        low: firstClose - step * 0.7,
        close: firstClose - step * 0.25,
        volume: baseVolume * 0.9,
        role: "failed-confirmation",
      })
    );
  }

  assertValidOHLC(candles);

  return {
    id: `bullish-engulfing-${Date.now()}`,
    type: "bullish-engulfing",
    category: "candlestick",
    difficulty: confirmation ? "beginner" : "intermediate",

    context: {
      priorTrend: "downtrend",
      location: "support",
      confirmation,
      volumeProfile,
    },

    candles,

    levels: {
      support: round(support),
      confirmation: round(confirmationLevel),
      entry: round(confirmationLevel + step * 0.05),
      stop: round(support - step * 0.2),
      target1: round(confirmationLevel + step * 1.5),
      target2: round(confirmationLevel + step * 2.5),
    },

    decisionMap: {
      downtrend: "wait",
      "setup-candle": "wait",
      "bullish-engulfing": "wait",
      confirmation: "buy",
      "failed-confirmation": "pass",
      "follow-through": "manage",
    },

    reasonMap: {
      downtrend:
        "The bearish trend remains active. No confirmed reversal exists.",
      "setup-candle":
        "The first candle alone does not create an engulfing pattern.",
      "bullish-engulfing":
        "The bullish candle engulfed the prior bearish body, but follow-through is still required.",
      confirmation:
        "Price continued above the engulfing candle with increased participation.",
      "failed-confirmation":
        "Sellers immediately reclaimed control after the engulfing candle.",
      "follow-through":
        "The long entry already triggered. Manage the position instead of chasing.",
    },

    coachMap: {
      downtrend: {
        tone: "neutral",
        title: "Downtrend active",
        message:
          "Sellers remain in control while price continues lower.",
        rule:
          "Wait for a complete reversal pattern and confirmation.",
      },
      "setup-candle": {
        tone: "neutral",
        title: "First candle printed",
        message:
          "One bearish candle does not create a Bullish Engulfing pattern.",
        rule:
          "Wait for the second candle to complete the pattern.",
      },
      "bullish-engulfing": {
        tone: "warning",
        title: "Bullish Engulfing detected",
        message:
          "The second real body completely engulfed the first bearish body at support.",
        rule:
          "Pattern recognition is not confirmation.",
      },
      confirmation: {
        tone: "positive",
        title: "Buyer confirmation",
        message:
          "Price continued above the engulfing candle with increased participation.",
        rule:
          "Evaluate entry, stop placement, and reward-to-risk.",
      },
      "failed-confirmation": {
        tone: "negative",
        title: "Pattern failed",
        message:
          "Sellers reclaimed control immediately after the engulfing pattern.",
        rule:
          "Pass when follow-through fails.",
      },
      "follow-through": {
        tone: "positive",
        title: "Management phase",
        message:
          "The confirmed long is following through higher.",
        rule:
          "Manage risk. Do not chase an extended entry.",
      },
    },

    answer: {
      pattern: "Bullish Engulfing",
      validSetup: confirmation,
      action: confirmation
        ? "Wait for confirmation, then evaluate a long entry."
        : "Pass. Buyer confirmation failed.",
    },

    explanation: confirmation
      ? "The second candle engulfed the first candle body at support and received bullish follow-through."
      : "The engulfing shape formed, but the next candle invalidated the bullish setup.",
  };
}

export default generateBullishEngulfingScenario;
