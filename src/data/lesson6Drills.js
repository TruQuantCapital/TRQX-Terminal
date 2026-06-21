export const lesson6Drills = {
  clickIdentify: [
    {
      id: "sr-1",
      prices: [582, 580, 583, 580, 585, 580, 588],
      prompt: "Click the point where buyers most clearly defend this level for the final time before the breakout, confirming 580 as Support.",
      correctIndex: 5,
      explanation: "Price returns to 580 three separate times and bounces each time. This third touch (right before the move to 588) confirms 580 as a defended Support level.",
    },
    {
      id: "sr-2",
      prices: [598, 600, 597, 600, 595, 600, 592],
      prompt: "Click the point where sellers most clearly defend this level for the final time before price falls away, confirming 600 as Resistance.",
      correctIndex: 5,
      explanation: "Price reaches 600 three separate times and gets rejected each time. This third touch (right before the move down to 592) confirms 600 as a defended Resistance level.",
    },
  ],
  dragLabel: {
    prompt: "Drag each label onto the chart that matches what it shows.",
    labels: ["Support Holding", "Resistance Breaking (Breakout)", "Role Reversal"],
    charts: [
      { id: "chart-a", prices: [584, 580, 583, 580, 586], correctLabel: "Support Holding" },
      { id: "chart-b", prices: [598, 600, 597, 600, 605], correctLabel: "Resistance Breaking (Breakout)" },
      { id: "chart-c", prices: [598, 601, 599, 601, 603], correctLabel: "Role Reversal" },
    ],
  },
};
