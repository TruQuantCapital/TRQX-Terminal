export const lesson14Drills = {
  clickIdentify: [
    {
      id: "level-1",
      prices: [100, 100, 99, 100, 98, 100, 96],
      prompt: "This level at 100 has been tested several times. Click the point where the reaction is clearly getting weaker (a warning sign, not a strength).",
      correctIndex: 6,
      explanation: "Each bounce off 100 gets shallower - first to 99, then 98, then a break to 96. Progressively weaker reactions despite repeated tests is a sign the level is wearing down, not getting stronger.",
    },
  ],
  dragLabel: {
    prompt: "Drag each label onto the chart that matches its level strength.",
    labels: ["Strong Level (Weekly, volume, confluence)", "Weak Level (single touch, low timeframe)"],
    charts: [
      { id: "chart-a", prices: [100, 100, 99, 100, 99, 100], correctLabel: "Strong Level (Weekly, volume, confluence)" },
      { id: "chart-b", prices: [50, 50.2, 49.8, 51], correctLabel: "Weak Level (single touch, low timeframe)" },
    ],
  },
};
