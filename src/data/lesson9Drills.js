export const lesson9Drills = {
  clickIdentify: [
    {
      id: "zone-1",
      prices: [582, 580, 583, 580, 585, 580, 588],
      prompt: "Price keeps bouncing at the same level. Click the point where buyers most clearly defend this level, confirming it as Support.",
      correctIndex: 5,
      explanation: "Each time price returns to 580, it bounces again rather than breaking through. The third touch at 580 (this point) confirms buyers are consistently defending this level - that repeated defense is what makes it Support.",
    },
    {
      id: "zone-2",
      prices: [570, 575, 571, 600],
      prompt: "Price explodes upward fast, leaving a level behind. Click the point right before the launch - this area likely became a Demand zone.",
      correctIndex: 1,
      explanation: "The fast, aggressive move from 575 to 600 with no real consolidation suggests institutional buying overwhelmed sellers at that price - leaving a Demand zone behind at the launch point.",
    },
    {
      id: "zone-3",
      prices: [620, 615, 618, 580],
      prompt: "Price collapses downward fast, leaving a level behind. Click the point right before the collapse - this area likely became a Supply zone.",
      correctIndex: 1,
      explanation: "The fast, aggressive move from 618 down to 580 with no consolidation suggests institutional selling overwhelmed buyers at that price - leaving a Supply zone behind at the launch point.",
    },
  ],
  dragLabel: {
    prompt: "Drag each label onto the chart that matches what it shows.",
    labels: ["Support Holding", "Resistance Holding", "Liquidity Sweep"],
    charts: [
      { id: "chart-a", prices: [584, 580, 583, 580, 586], correctLabel: "Support Holding" },
      { id: "chart-b", prices: [596, 600, 597, 600, 594], correctLabel: "Resistance Holding" },
      { id: "chart-c", prices: [598, 600, 604, 599, 595], correctLabel: "Liquidity Sweep" },
    ],
  },
};
