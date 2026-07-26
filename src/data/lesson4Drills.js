export const lesson4Drills = {
  clickIdentify: [
    {
      id: "bullbear-1",
      prices: [100, 105, 102, 108, 106, 112],
      prompt: "Click the point that confirms BULLISH market structure (Higher High after a Higher Low).",
      correctIndex: 5,
      explanation: "At price 112, we have a new Higher High (previous high 108). The pullback to 106 held above the previous low of 102. Higher Highs + Higher Lows = Bullish confirmation.",
    },
    {
      id: "bullbear-2",
      prices: [150, 145, 148, 140, 143, 135],
      prompt: "Click the point that shows clear BEARISH structure (Lower Low after a Lower High).",
      correctIndex: 5,
      explanation: "At price 135, we have a new Lower Low (previous low 140). The bounce to 143 failed to exceed the previous high of 148. Lower Lows + Lower Highs = Bearish confirmation.",
    },
    {
      id: "bullbear-3",
      prices: [50, 55, 52, 60, 58, 61],
      prompt: "What market structure is shown here? (Click the LAST price point as your answer)",
      correctIndex: 5,
      explanation: "This shows strong bullish structure: 50→55 (higher), 55→52 (pullback), 52→60 (new high), 60→58 (pullback holds), 58→61 (new high). Consistent higher lows and higher highs = sustained uptrend.",
    },
    {
      id: "bullbear-4",
      prices: [200, 190, 195, 185, 188, 180],
      prompt: "Identify the trend: Is this BULLISH or BEARISH? (Click last price to answer)",
      correctIndex: 5,
      explanation: "This is BEARISH: 200→190 (lower), 190→195 (bounce), 195→185 (new low), 185→188 (bounce), 188→180 (new low). Lower lows and lower highs create consistent downtrend.",
    },
    {
      id: "bullbear-5",
      prices: [75, 78, 77, 78, 76, 79],
      prompt: "What type of market is this? (Click last price point)",
      correctIndex: 5,
      explanation: "This is SIDEWAYS/RANGING: Prices oscillate between ~76-79 without establishing higher highs or lower lows. No clear trend direction = consolidation or range-bound market. Watch for breakout.",
    },
  ],
  dragLabel: {
    prompt: "Drag each market structure label to the correct price chart.",
    labels: ["Bullish Uptrend", "Bearish Downtrend", "Sideways Range"],
    charts: [
      {
        id: "chart-a",
        prices: [100, 105, 103, 110, 108, 115],
        correctLabel: "Bullish Uptrend",
        explanation: "Consistent higher highs (100→105→110→115) and higher lows (100→103→108) = Bullish",
      },
      {
        id: "chart-b",
        prices: [200, 195, 198, 190, 193, 185],
        correctLabel: "Bearish Downtrend",
        explanation: "Consistent lower highs (200→198→193) and lower lows (200→195→190→185) = Bearish",
      },
      {
        id: "chart-c",
        prices: [150, 152, 149, 151, 148, 152],
        correctLabel: "Sideways Range",
        explanation: "Price oscillates between 148-152 without establishing a clear trend direction = Range-bound",
      },
    ],
  },
  identify: [
    {
      id: "structure-identify-1",
      prices: [80, 85, 83, 88, 86, 92],
      prompt: "What is the current market structure at the last price point?",
      options: ["Higher High, Higher Low - Bullish", "Lower High, Lower Low - Bearish", "Equal Highs - Neutral"],
      correct: 0,
      explanation: "The last point at 92 represents a Higher High (previous high 88). The pullback to 86 held above the previous low of 83. This is bullish structure.",
    },
    {
      id: "structure-identify-2",
      prices: [120, 115, 118, 112, 115, 110],
      prompt: "Is this bullish, bearish, or neutral structure?",
      options: ["Bullish - new highs", "Bearish - new lows", "Neutral - sideways"],
      correct: 1,
      explanation: "Lower lows (120→115→112→110) and lower highs (120→118→115) indicate bearish structure with downtrend momentum.",
    },
  ],
};