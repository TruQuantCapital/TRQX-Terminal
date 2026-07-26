export const lesson5Drills = {
  clickIdentify: [
    {
      id: "trend-1",
      prices: [100, 105, 102, 110, 107, 115],
      prompt: "Click the point that shows the STRONGEST bullish confirmation (Higher High + Higher Low structure).",
      correctIndex: 5,
      explanation: "115 is a new Higher High (previous high 110) with pullback to 107 holding above the previous low 102. This sustained higher-highs and higher-lows pattern confirms strong uptrend continuation.",
    },
    {
      id: "trend-2",
      prices: [150, 145, 148, 140, 143, 135],
      prompt: "Click the point that shows BEARISH trend confirmation (Lower Low breaking previous support).",
      correctIndex: 5,
      explanation: "135 is a new Lower Low (breaking below previous low 140) while bounce to 143 failed to exceed previous high 148. Lower-highs and lower-lows confirm sustained downtrend.",
    },
    {
      id: "trend-3",
      prices: [80, 82, 79, 85, 82, 88],
      prompt: "Where is the first sign of this uptrend (initial Higher High formation)?",
      correctIndex: 3,
      explanation: "At 85, we get the first Higher High (above previous high of 82) with the pullback to 79 holding above the previous low of 80. This establishes the initial bullish structure.",
    },
    {
      id: "trend-4",
      prices: [200, 195, 198, 192, 195, 188],
      prompt: "Identify where this downtrend STARTS to weaken or reverse (pullback holds more than expected).",
      correctIndex: 4,
      explanation: "At 195, the pullback/bounce holds above the previous low of 192. If price now makes a new high above 198, downtrend structure would be broken. Watch this level for reversal confirmation.",
    },
    {
      id: "trend-5",
      prices: [100, 102, 99, 101, 98, 103],
      prompt: "This price action is confusing - where do you see no clear trend (sideways)?",
      correctIndex: 2,
      explanation: "At 99, we have neither a sustained higher-high pattern nor lower-lows. Price oscillates without establishing buyer or seller control. This is a range/consolidation area - watch for breakout.",
    },
  ],
  dragLabel: {
    prompt: "Drag each trend label to the chart it matches. Pay attention to Higher/Lower Highs and Lows.",
    labels: ["Strong Uptrend", "Strong Downtrend", "Weak/Range-Bound"],
    charts: [
      {
        id: "chart-a",
        prices: [50, 55, 52, 60, 57, 65],
        correctLabel: "Strong Uptrend",
        explanation: "Clear pattern: 50→55→52(pullback HLD)→60→57(pullback HLD)→65. Consistent higher highs and higher lows = strong uptrend.",
      },
      {
        id: "chart-b",
        prices: [200, 190, 195, 180, 185, 170],
        correctLabel: "Strong Downtrend",
        explanation: "Clear pattern: 200→190→195(bounce)→180→185(bounce)→170. Consistent lower lows and lower highs = strong downtrend.",
      },
      {
        id: "chart-c",
        prices: [120, 121, 119, 121, 119, 120],
        correctLabel: "Weak/Range-Bound",
        explanation: "Price oscillates 119-121 with no direction. No higher-highs, no lower-lows. This is consolidation/sideways - waiting for breakout.",
      },
    ],
  },
  identify: [
    {
      id: "trend-strength-1",
      prices: [80, 85, 83, 90, 87, 95],
      prompt: "How STRONG is this uptrend?",
      options: [
        "Weak - pullbacks are too deep",
        "Strong - consistent higher highs (85→90→95) with healthy pullbacks holding support",
        "Reverse -trend is breaking",
      ],
      correct: 1,
      explanation: "Each pullback (83, 87) holds above the previous low, and each new high (85→90→95) pushes higher. This is textbook strong uptrend structure.",
    },
  ],
};