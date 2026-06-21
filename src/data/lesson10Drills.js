export const lesson10Drills = {
  clickIdentify: [
    {
      id: "confirm-1",
      prices: [598, 599, 600, 603, 606, 609],
      prompt: "Resistance sits at 600. Click the point where the breakout first gets confirmed (price closes above 600 and keeps climbing, not just a brief poke through).",
      correctIndex: 3,
      explanation: "603 is the first close that's genuinely above resistance, followed by continued follow-through to 606 and 609. A single tick above a level isn't confirmation - sustained follow-through is.",
    },
    {
      id: "confirm-2",
      prices: [598, 600, 601, 599, 597],
      prompt: "Resistance sits at 600. Click the point where this breakout attempt fails (price pokes above, then falls back below the level).",
      correctIndex: 3,
      explanation: "Price briefly traded at 601, just above resistance, but immediately fell back to 599 - below the level. This lack of follow-through marks it as a failed breakout, or trap.",
    },
  ],
  dragLabel: {
    prompt: "Drag each label onto the chart that matches what it shows.",
    labels: ["Confirmed Breakout", "Breakout Trap", "Low Conviction Move"],
    charts: [
      { id: "chart-a", prices: [598, 600, 604, 608, 612], correctLabel: "Confirmed Breakout" },
      { id: "chart-b", prices: [598, 600, 602, 599, 596], correctLabel: "Breakout Trap" },
      { id: "chart-c", prices: [598, 599, 600, 599, 600], correctLabel: "Low Conviction Move" },
    ],
  },
};
