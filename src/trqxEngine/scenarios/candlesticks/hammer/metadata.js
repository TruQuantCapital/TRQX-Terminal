const hammerMetadata = {
  id: "hammer",
  title: "Hammer",
  category: "candlestick",
  family: "bullish-reversal",
  difficulty: "beginner",

  description:
    "A potential bullish reversal candle with a small body near the top of its range and a long lower wick.",

  requiredContext: {
    priorTrend: "downtrend",
    preferredLocation: "support",
    confirmationRequired: true,
  },

  structureRules: {
    minimumLowerWickToBodyRatio: 2,
    maximumUpperWickToBodyRatio: 0.5,
    bodyLocation: "upper-range",
  },

  psychology:
    "Sellers forced price lower, but buyers absorbed the selling pressure and pushed price back near the high before the candle closed.",

  professionalRule:
    "A Hammer is not an entry by itself. Require location, confirmation, volume, and acceptable risk.",

  commonMistakes: [
    "Trading a Hammer in random consolidation.",
    "Ignoring the prior downtrend.",
    "Entering before confirmation.",
    "Calling every long lower wick a Hammer.",
  ],

  tags: [
    "hammer",
    "bullish reversal",
    "support",
    "rejection",
    "candlestick",
  ],
};

export { hammerMetadata };
export default hammerMetadata;
