import { COLORS } from "../engine/constants";

const bullPennant = {
  id: "bull-pennant-v2",
  sourcePatternId: "bull-pennant",
  title: "Bull Pennant Pattern",
  difficulty: "Intermediate",
  category: "Bullish Continuation",
  status: "approved",
  version: 2,

  candles: [
    { id: "pole-1", x: 0.08, open: 0.82, close: 0.70, high: 0.67, low: 0.85, width: 22 },
    { id: "pole-2", x: 0.115, open: 0.70, close: 0.52, high: 0.49, low: 0.74, width: 22 },
    { id: "pole-3", x: 0.15, open: 0.52, close: 0.32, high: 0.28, low: 0.55, width: 22 },
    { id: "pole-4", x: 0.185, open: 0.32, close: 0.18, high: 0.14, low: 0.35, width: 22 },

    { id: "pen-1", x: 0.26, open: 0.18, close: 0.30, high: 0.16, low: 0.33, width: 18 },
    { id: "pen-2", x: 0.31, open: 0.30, close: 0.27, high: 0.25, low: 0.32, width: 16 },
    { id: "pen-3", x: 0.36, open: 0.27, close: 0.34, high: 0.25, low: 0.36, width: 16 },
    { id: "pen-4", x: 0.41, open: 0.34, close: 0.31, high: 0.29, low: 0.36, width: 15 },
    { id: "pen-5", x: 0.46, open: 0.31, close: 0.36, high: 0.29, low: 0.38, width: 14 },

    { id: "breakout", x: 0.58, open: 0.34, close: 0.20, high: 0.16, low: 0.37, width: 22 },
    { id: "confirm", x: 0.66, open: 0.20, close: 0.12, high: 0.08, low: 0.23, width: 22 },
    { id: "entry", x: 0.77, open: 0.17, close: 0.09, high: 0.05, low: 0.20, width: 22 },
  ],

  lines: [
    {
      id: "flagpole",
      x1: 0.06,
      y1: 0.86,
      x2: 0.19,
      y2: 0.13,
      color: COLORS.green,
      width: 4,
    },
    {
      id: "upper-pennant",
      x1: 0.235,
      y1: 0.19,
      x2: 0.50,
      y2: 0.31,
      color: COLORS.gold,
      width: 3,
    },
    {
      id: "lower-pennant",
      x1: 0.235,
      y1: 0.42,
      x2: 0.50,
      y2: 0.33,
      color: COLORS.gold,
      width: 3,
    },
  ],

  arrows: [
    {
      id: "measured-move",
      x1: 0.79,
      y1: 0.12,
      x2: 0.93,
      y2: 0.04,
      color: COLORS.green,
      width: 4,
    },
  ],

  labels: [],

  targets: [
    { id: "flagpole-target", answer: "Flagpole", x: 0.10, y: 0.57 },
    { id: "upper-target", answer: "Upper Pennant", x: 0.31, y: 0.13 },
    { id: "lower-target", answer: "Lower Pennant", x: 0.34, y: 0.47 },
    { id: "breakout-target", answer: "Breakout", x: 0.56, y: 0.46 },
    { id: "confirmation-target", answer: "Confirmation", x: 0.67, y: 0.34 },
    { id: "entry-target", answer: "Entry", x: 0.82, y: 0.27 },
  ],

  explanation: {
    setup: "A sharp bullish impulse establishes the flagpole.",
    context: "Price pauses without giving back most of the impulse.",
    pattern: "The consolidation compresses between converging trendlines.",
    confirmation: "A candle closes above the upper pennant boundary.",
    entry: "The entry comes after breakout confirmation, not inside compression.",
    invalidation: "The setup weakens if price closes decisively below the lower pennant.",
  },
};

export default bullPennant;
