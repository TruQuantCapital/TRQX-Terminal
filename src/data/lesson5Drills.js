export const lesson5Drills = {
  clickIdentify: [
    {
      id: "trend-1",
      prices: [100, 105, 102, 110, 107],
      prompt: "Click the point that confirms this chart is in an Uptrend (a Higher High breaking above the prior swing high of 105).",
      correctIndex: 3,
      explanation: "110 is a Higher High, breaking above the prior high of 105, while the pullback to 102 held above the previous low. Higher Highs and Higher Lows together confirm an uptrend.",
    },
    {
      id: "trend-2",
      prices: [100, 95, 98, 90, 92],
      prompt: "Click the point that confirms this chart is in a Downtrend (a Lower Low breaking below the prior swing low of 95).",
      correctIndex: 3,
      explanation: "90 is a Lower Low, breaking below the prior low of 95, while the bounce to 98 failed to exceed the prior high of 100. Lower Highs and Lower Lows together confirm a downtrend.",
    },
    {
      id: "trend-3",
      prices: [100, 101, 99, 100, 101],
      prompt: "This price action lacks a clear trend. Click the point that best represents the range staying contained (sideways movement).",
      correctIndex: 4,
      explanation: "Price oscillates between roughly 99 and 101 with no Higher-Highs/Higher-Lows or Lower-Highs/Lower-Lows pattern. Neither side controls price here.",
    },
  ],
  dragLabel: {
    prompt: "Drag each label onto the chart that matches its trend type.",
    labels: ["Uptrend", "Downtrend", "Sideways"],
    charts: [
      { id: "chart-a", prices: [100, 104, 102, 109, 106, 114], correctLabel: "Uptrend" },
      { id: "chart-b", prices: [114, 108, 110, 103, 105, 99], correctLabel: "Downtrend" },
      { id: "chart-c", prices: [100, 101, 99, 101, 100, 102], correctLabel: "Sideways" },
    ],
  },
};
