import { assertValidOHLC } from "../../../validation/validateOHLC";

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function createCandle({
  time,
  open,
  high,
  low,
  close,
  volume,
  role,
}) {
  return {
    time,
    open: round(open),
    high: round(high),
    low: round(low),
    close: round(close),
    volume: Math.round(volume),
    role,
  };
}

/**
 * Generate a technically valid Hammer scenario.
 */
export function generateHammerScenario(options = {}) {
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

  // Structured downtrend.
  for (let index = 0; index < 4; index += 1) {
    const open = price;
    const close = open - step;
    const high = open + step * 0.25;
    const low = close - step * 0.35;

    candles.push(
      createCandle({
        time: index + 1,
        open,
        high,
        low,
        close,
        volume: baseVolume * (1 + index * 0.08),
        role: "downtrend",
      })
    );

    price = close;
  }

  const support = price - step * 2.6;

  // Hammer candle.
  const hammerOpen = price;
  const hammerBody = step * 0.28;
  const hammerClose = hammerOpen + hammerBody;
  const hammerHigh = hammerClose + hammerBody * 0.35;
  const hammerLow = support;

  candles.push(
    createCandle({
      time: 5,
      open: hammerOpen,
      high: hammerHigh,
      low: hammerLow,
      close: hammerClose,
      volume: baseVolume * 1.65 * volumeMultiplier,
      role: "hammer",
    })
  );

  const confirmationLevel = hammerHigh;

  if (confirmation) {
    const confirmationOpen = hammerClose + step * 0.08;
    const confirmationClose = confirmationLevel + step * 1.1;

    candles.push(
      createCandle({
        time: 6,
        open: confirmationOpen,
        high: confirmationClose + step * 0.3,
        low: confirmationOpen - step * 0.25,
        close: confirmationClose,
        volume: baseVolume * 1.9 * volumeMultiplier,
        role: "confirmation",
      })
    );

    candles.push(
      createCandle({
        time: 7,
        open: confirmationClose,
        high: confirmationClose + step * 1.25,
        low: confirmationClose - step * 0.3,
        close: confirmationClose + step * 0.9,
        volume: baseVolume * 1.45,
        role: "follow-through",
      })
    );
  } else {
    candles.push(
      createCandle({
        time: 6,
        open: hammerClose,
        high: hammerHigh + step * 0.15,
        low: hammerOpen - step * 0.6,
        close: hammerOpen - step * 0.25,
        volume: baseVolume * 0.85,
        role: "failed-confirmation",
      })
    );
  }

  assertValidOHLC(candles);

  const hammerIndex = candles.findIndex(
    (candle) => candle.role === "hammer"
  );

  return {
    id: `hammer-${Date.now()}`,
    type: "hammer",
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

    keyIndexes: {
      hammer: hammerIndex,
      confirmation: confirmation ? hammerIndex + 1 : null,
    },

    answer: {
      pattern: "Hammer",
      validSetup: confirmation,
      action: confirmation
        ? "Wait for confirmation, then evaluate a long entry."
        : "Pass. Buyer confirmation is missing.",
    },

    explanation: confirmation
      ? "The Hammer formed after a structured decline at support. The next candle broke above the Hammer high with increased volume."
      : "The candle has Hammer-like anatomy, but the next candle failed to confirm buyer control.",
  };
}

export default generateHammerScenario;