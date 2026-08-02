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

export function generateDojiScenario(options = {}) {
  const {
    startingPrice = 100,
    volatility = 1,
    confirmation = true,
    volumeProfile = "mixed",
  } = options;

  const step = startingPrice * 0.025 * volatility;
  const baseVolume = 1_000_000;
  const candles = [];
  let price = startingPrice;

  for (let index = 0; index < 4; index += 1) {
    const open = price;
    const close = open - step;

    candles.push(
      createCandle({
        time: index + 1,
        open,
        high: open + step * 0.25,
        low: close - step * 0.35,
        close,
        volume: baseVolume * (1 + index * 0.06),
        role: "downtrend",
      })
    );

    price = close;
  }

  const support = price - step * 1.2;
  const dojiOpen = price;
  const dojiClose = dojiOpen + step * 0.03;
  const dojiHigh = dojiOpen + step * 0.9;

  candles.push(
    createCandle({
      time: 5,
      open: dojiOpen,
      high: dojiHigh,
      low: support,
      close: dojiClose,
      volume: baseVolume * 1.35,
      role: "doji",
    })
  );

  const confirmationLevel = dojiHigh;

  if (confirmation) {
    const confirmationOpen =
      dojiClose + step * 0.08;
    const confirmationClose =
      confirmationLevel + step * 0.85;

    candles.push(
      createCandle({
        time: 6,
        open: confirmationOpen,
        high: confirmationClose + step * 0.25,
        low: confirmationOpen - step * 0.2,
        close: confirmationClose,
        volume: baseVolume * 1.75,
        role: "confirmation",
      })
    );

    candles.push(
      createCandle({
        time: 7,
        open: confirmationClose,
        high: confirmationClose + step,
        low: confirmationClose - step * 0.25,
        close: confirmationClose + step * 0.7,
        volume: baseVolume * 1.35,
        role: "follow-through",
      })
    );
  } else {
    candles.push(
      createCandle({
        time: 6,
        open: dojiClose,
        high: dojiOpen + step * 0.35,
        low: support - step * 0.45,
        close: support - step * 0.2,
        volume: baseVolume * 1.2,
        role: "failed-confirmation",
      })
    );
  }

  assertValidOHLC(candles);

  return {
    id: `doji-${Date.now()}`,
    type: "doji",
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
      target1: round(confirmationLevel + step * 1.4),
      target2: round(confirmationLevel + step * 2.3),
    },

    decisionMap: {
      downtrend: "wait",
      doji: "wait",
      confirmation: "buy",
      "failed-confirmation": "pass",
      "follow-through": "manage",
    },

    reasonMap: {
      downtrend:
        "The bearish trend remains active.",
      doji:
        "A Doji shows indecision, not direction. Wait for the next candle.",
      confirmation:
        "The next candle resolved above the Doji high with stronger participation.",
      "failed-confirmation":
        "The indecision resolved bearish and invalidated the bullish reversal thesis.",
      "follow-through":
        "The confirmed long already triggered. Manage the position.",
    },

    coachMap: {
      downtrend: {
        tone: "neutral",
        title: "Downtrend active",
        message:
          "Sellers remain in control while price continues lower.",
        rule:
          "Do not assume a reversal before confirmation.",
      },
      doji: {
        tone: "warning",
        title: "Indecision",
        message:
          "The Doji shows balance between buyers and sellers but does not predict direction.",
        rule:
          "The next candle must resolve the indecision.",
      },
      confirmation: {
        tone: "positive",
        title: "Bullish resolution",
        message:
          "Price resolved above the Doji high with increased participation.",
        rule:
          "Evaluate the long setup and risk.",
      },
      "failed-confirmation": {
        tone: "negative",
        title: "Bearish resolution",
        message:
          "The market resolved below support after the Doji.",
        rule:
          "Pass on the bullish reversal thesis.",
      },
      "follow-through": {
        tone: "positive",
        title: "Management phase",
        message:
          "The confirmed reversal is following through higher.",
        rule:
          "Manage risk. Do not chase.",
      },
    },

    answer: {
      pattern: "Doji",
      validSetup: confirmation,
      action: confirmation
        ? "Wait for directional confirmation, then evaluate the trade."
        : "Pass. The Doji resolved against the reversal thesis.",
    },

    explanation: confirmation
      ? "The Doji formed after a decline at support and the next candle confirmed a bullish resolution."
      : "The Doji showed indecision, but the next candle resolved lower.",
  };
}

export default generateDojiScenario;
