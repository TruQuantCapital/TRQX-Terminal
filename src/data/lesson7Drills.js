export const lesson7Drills = {
  clickIdentify: [
    {
      id: "structure-1",
      prices: [100, 105, 102, 110, 107],
      prompt: "Click the point that confirms this is a Bullish structure (a Higher High breaking above the prior high of 105).",
      correctIndex: 3,
      explanation: "110 is a Higher High - it breaks above the previous swing high of 105, while the pullback to 102 held above the prior low. That combination (HH + HL) confirms bullish structure.",
    },
    {
      id: "structure-2",
      prices: [110, 105, 108, 100, 103],
      prompt: "Click the point that confirms this is a Bearish structure (a Lower Low breaking below the prior low of 105).",
      correctIndex: 3,
      explanation: "100 is a Lower Low - it breaks below the previous swing low of 105, while the bounce to 108 failed to exceed the prior high of 110. That combination (LH + LL) confirms bearish structure.",
    },
    {
      id: "structure-3",
      prices: [100, 101, 99, 100, 101],
      prompt: "This price action shows no clear trend. Click the point that best represents the range staying contained (consolidation).",
      correctIndex: 4,
      explanation: "Price oscillates between roughly 99 and 101 with no higher-highs/higher-lows or lower-highs/lower-lows pattern forming. Neither buyers nor sellers gain control - this is consolidation.",
    },
  ],

  dragLabel: {
    prompt: "Drag each label onto the chart that matches its structure type.",
    labels: ["Bullish", "Bearish", "Consolidation"],
    charts: [
      { id: "chart-a", prices: [102, 106, 104, 111, 109, 115], correctLabel: "Bullish" },
      { id: "chart-b", prices: [115, 109, 111, 104, 106, 100], correctLabel: "Bearish" },
      { id: "chart-c", prices: [100, 102, 99, 101, 100, 102], correctLabel: "Consolidation" },
    ],
  },
};
