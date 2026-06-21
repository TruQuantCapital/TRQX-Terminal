export const lesson4Drills = {
  clickIdentify: [
    {
      id: "bullbear-1",
      prices: [580, 585, 582, 590, 588, 595],
      prompt: "Click the point that confirms buyers are in control of this market (a fresh Higher High after a Higher Low).",
      correctIndex: 3,
      explanation: "590 breaks above the prior high of 585, while the pullback to 582 held above the prior low of 580. Higher Highs and Higher Lows together confirm a bullish market.",
    },
    {
      id: "bullbear-2",
      prices: [580, 575, 578, 570, 573, 565],
      prompt: "Click the point that confirms sellers are in control of this market (a fresh Lower Low after a Lower High).",
      correctIndex: 3,
      explanation: "570 breaks below the prior low of 575, while the bounce to 578 failed to exceed the prior high of 580. Lower Highs and Lower Lows together confirm a bearish market.",
    },
  ],
  dragLabel: {
    prompt: "Drag each label onto the chart that matches its market type.",
    labels: ["Bullish", "Bearish", "Neutral"],
    charts: [
      { id: "chart-a", prices: [580, 586, 583, 592, 589, 598], correctLabel: "Bullish" },
      { id: "chart-b", prices: [580, 574, 577, 569, 572, 564], correctLabel: "Bearish" },
      { id: "chart-c", prices: [580, 582, 579, 581, 580, 583], correctLabel: "Neutral" },
    ],
  },
};
