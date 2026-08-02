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

export function generateBearishEngulfingScenario(options = {}) {
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
    const close = open + step;

    candles.push(
      createCandle({
        time: index + 1,
        open,
        high: close + step * 0.35,
        low: open - step * 0.25,
        close,
        volume: baseVolume * (1 + index * 0.08),
        role: "uptrend",
      })
    );

    price = close;
  }

  const firstOpen = price;
  const firstClose = firstOpen + step * 0.65;

  candles.push(
    createCandle({
      time: 4,
      open: firstOpen,
      high: firstClose + step * 0.25,
      low: firstOpen - step * 0.18,
      close: firstClose,
      volume: baseVolume * 1.1,
      role: "setup-candle",
    })
  );

  const resistance = firstClose + step * 0.35;
  const engulfOpen = firstClose + step * 0.2;
  const engulfClose = firstOpen - step * 0.55;

  candles.push(
    createCandle({
      time: 5,
      open: engulfOpen,
      high: resistance,
      low: engulfClose - step * 0.28,
      close: engulfClose,
      volume: baseVolume * 1.85 * volumeMultiplier,
      role: "bearish-engulfing",
    })
  );

  const confirmationLevel = engulfClose;

  if (confirmation) {
    const confirmationOpen =
      engulfClose - step * 0.08;
    const confirmationClose =
      confirmationOpen - step * 0.95;

    candles.push(
      createCandle({
        time: 6,
        open: confirmationOpen,
        high: confirmationOpen + step * 0.2,
        low: confirmationClose - step * 0.25,
        close: confirmationClose,
        volume: baseVolume * 1.7 * volumeMultiplier,
        role: "confirmation",
      })
    );

    candles.push(
      createCandle({
        time: 7,
        open: confirmationClose,
        high: confirmationClose + step * 0.25,
        low: confirmationClose - step * 1.15,
        close: confirmationClose - step * 0.8,
        volume: baseVolume * 1.4,
        role: "follow-through",
      })
    );
  } else {
    candles.push(
      createCandle({
        time: 6,
        open: engulfClose,
        high: firstClose + step * 0.7,
        low: engulfClose - step * 0.2,
        close: firstClose + step * 0.25,
        volume: baseVolume * 0.9,
        role: "failed-confirmation",
      })
    );
  }

  assertValidOHLC(candles);

  return {
    id: `bearish-engulfing-${Date.now()}`,
    type: "bearish-engulfing",
    category: "candlestick",
    difficulty: confirmation ? "beginner" : "intermediate",

    context: {
      priorTrend: "uptrend",
      location: "resistance",
      confirmation,
      volumeProfile,
    },

    candles,

    levels: {
      resistance: round(resistance),
      confirmation: round(confirmationLevel),
      entry: round(confirmationLevel - step * 0.05),
      stop: round(resistance + step * 0.2),
      target1: round(confirmationLevel - step * 1.5),
      target2: round(confirmationLevel - step * 2.5),
    },

    decisionMap: {
      uptrend: "wait",
      "setup-candle": "wait",
      "bearish-engulfing": "wait",
      confirmation: "sell",
      "failed-confirmation": "pass",
      "follow-through": "manage",
    },

    reasonMap: {
      uptrend:
        "The bullish trend remains active. No confirmed bearish reversal exists.",
      "setup-candle":
        "The first candle alone does not create an engulfing pattern.",
      "bearish-engulfing":
        "The bearish candle engulfed the prior bullish body, but follow-through is still required.",
      confirmation:
        "Price continued below the engulfing candle with increased participation.",
      "failed-confirmation":
        "Buyers immediately reclaimed control after the engulfing candle.",
      "follow-through":
        "The short entry already triggered. Manage the position instead of chasing.",
    },

    coachMap: {
      uptrend: {
        tone: "neutral",
        title: "Uptrend active",
        message:
          "Buyers remain in control while price continues higher.",
        rule:
          "Wait for a complete reversal pattern and confirmation.",
      },
      "setup-candle": {
        tone: "neutral",
        title: "First candle printed",
        message:
          "One bullish candle does not create a Bearish Engulfing pattern.",
        rule:
          "Wait for the second candle to complete the pattern.",
      },
      "bearish-engulfing": {
        tone: "warning",
        title: "Bearish Engulfing detected",
        message:
          "The second real body completely engulfed the first bullish body at resistance.",
        rule:
          "Pattern recognition is not confirmation.",
      },
      confirmation: {
        tone: "positive",
        title: "Seller confirmation",
        message:
          "Price continued below the engulfing candle with increased participation.",
        rule:
          "Evaluate entry, stop placement, and reward-to-risk.",
      },
      "failed-confirmation": {
        tone: "negative",
        title: "Pattern failed",
        message:
          "Buyers reclaimed control immediately after the engulfing pattern.",
        rule:
          "Pass when follow-through fails.",
      },
      "follow-through": {
        tone: "positive",
        title: "Management phase",
        message:
          "The confirmed short is following through lower.",
        rule:
          "Manage risk. Do not chase an extended entry.",
      },
    },

    answer: {
      pattern: "Bearish Engulfing",
      validSetup: confirmation,
      action: confirmation
        ? "Wait for confirmation, then evaluate a short entry."
        : "Pass. Seller confirmation failed.",
    },

    explanation: confirmation
      ? "The second candle engulfed the first candle body at resistance and received bearish follow-through."
      : "The engulfing shape formed, but the next candle invalidated the bearish setup.",
  };
}

export default generateBearishEngulfingScenario;
