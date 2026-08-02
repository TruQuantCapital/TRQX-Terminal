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

export function generateShootingStarScenario(options = {}) {
  const {
    startingPrice = 100,
    volatility = 1,
    confirmation = true,
    volumeProfile = "increasing",
  } = options;

  if (!Number.isFinite(startingPrice) || startingPrice <= 0) {
    throw new Error("startingPrice must be a positive number.");
  }

  if (!Number.isFinite(volatility) || volatility <= 0) {
    throw new Error("volatility must be a positive number.");
  }

  const step = startingPrice * 0.025 * volatility;
  const baseVolume = 1_000_000;
  const volumeMultiplier =
    volumeProfile === "increasing" ? 1.2 : 1;

  const candles = [];
  let price = startingPrice;

  for (let index = 0; index < 4; index += 1) {
    const open = price;
    const close = open + step;

    candles.push(
      createCandle({
        time: index + 1,
        open,
        high: close + step * 0.3,
        low: open - step * 0.2,
        close,
        volume: baseVolume * (1 + index * 0.08),
        role: "uptrend",
      })
    );

    price = close;
  }

  const starBody = step * 0.28;
  const starOpen = price;
  const starClose = starOpen - starBody;
  const starLow = starClose - starBody * 0.3;
  const resistance = starOpen + step * 2.6;

  candles.push(
    createCandle({
      time: 5,
      open: starOpen,
      high: resistance,
      low: starLow,
      close: starClose,
      volume: baseVolume * 1.65 * volumeMultiplier,
      role: "shooting-star",
    })
  );

  const confirmationLevel = starLow;

  if (confirmation) {
    const confirmationOpen = starClose - step * 0.08;
    const confirmationClose =
      confirmationLevel - step * 1.1;

    candles.push(
      createCandle({
        time: 6,
        open: confirmationOpen,
        high: confirmationOpen + step * 0.25,
        low: confirmationClose - step * 0.3,
        close: confirmationClose,
        volume: baseVolume * 1.9 * volumeMultiplier,
        role: "confirmation",
      })
    );

    candles.push(
      createCandle({
        time: 7,
        open: confirmationClose,
        high: confirmationClose + step * 0.3,
        low: confirmationClose - step * 1.25,
        close: confirmationClose - step * 0.9,
        volume: baseVolume * 1.45,
        role: "follow-through",
      })
    );
  } else {
    candles.push(
      createCandle({
        time: 6,
        open: starClose,
        high: resistance + step * 0.25,
        low: starLow - step * 0.1,
        close: starOpen + step * 0.65,
        volume: baseVolume * 0.85,
        role: "failed-confirmation",
      })
    );
  }

  assertValidOHLC(candles);

  return {
    id: `shooting-star-${Date.now()}`,
    type: "shooting-star",
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
      "shooting-star": "wait",
      confirmation: "sell",
      "failed-confirmation": "pass",
      "follow-through": "manage",
    },

    reasonMap: {
      uptrend:
        "The bullish trend remains active. No confirmed bearish reversal exists.",
      "shooting-star":
        "The Shooting Star formed at resistance, but sellers have not confirmed control.",
      confirmation:
        "Price broke below the Shooting Star low with increased participation.",
      "failed-confirmation":
        "Buyers reclaimed the rejection area and invalidated the bearish setup.",
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
          "Do not predict a reversal before evidence appears.",
      },
      "shooting-star": {
        tone: "warning",
        title: "Shooting Star detected",
        message:
          "A small body formed near the candle low with a long upper rejection wick at resistance.",
        rule:
          "Wait for a break below the Shooting Star low.",
      },
      confirmation: {
        tone: "positive",
        title: "Bearish confirmation",
        message:
          "Price broke below the Shooting Star low with stronger participation.",
        rule:
          "Evaluate entry, stop placement, and reward-to-risk.",
      },
      "failed-confirmation": {
        tone: "negative",
        title: "Setup invalidated",
        message:
          "Buyers reclaimed resistance and invalidated the bearish reversal.",
        rule:
          "Pass when seller confirmation fails.",
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
      pattern: "Shooting Star",
      validSetup: confirmation,
      action: confirmation
        ? "Wait for bearish confirmation, then evaluate a short entry."
        : "Pass. Seller confirmation failed.",
    },

    explanation: confirmation
      ? "The Shooting Star formed after a structured rally at resistance. The next candle broke below its low with increased volume."
      : "The candle had Shooting Star anatomy, but buyers invalidated the bearish setup.",
  };
}

export default generateShootingStarScenario;
