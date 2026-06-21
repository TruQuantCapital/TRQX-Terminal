export const lesson13Drills = {
  clickIdentify: [
    {
      id: "gap-1",
      prices: [180, 186, 189, 192],
      prompt: "AAPL gapped up from 180 to 186 overnight on strong earnings. Click the point that confirms this is Gap Continuation, not a fill.",
      correctIndex: 3,
      explanation: "Price never traded back down to 180 - instead it kept climbing to 189 and 192. That sustained move away from the gap, without filling it, is Gap Continuation.",
    },
    {
      id: "gap-2",
      prices: [100, 97, 98, 100],
      prompt: "A stock gapped down from 100 to 97 with no real news. Click the point that confirms this gap eventually Filled.",
      correctIndex: 3,
      explanation: "Price traded back up through 98 and reached 100 again - fully retracing through the levels that were originally skipped during the gap. That's a Gap Fill.",
    },
  ],
  dragLabel: {
    prompt: "Drag each label onto the chart that matches what it shows.",
    labels: ["Gap Up - Continuation", "Gap Down - Fill"],
    charts: [
      { id: "chart-a", prices: [120, 128, 130, 133, 135], correctLabel: "Gap Up - Continuation" },
      { id: "chart-b", prices: [250, 240, 244, 248, 250], correctLabel: "Gap Down - Fill" },
    ],
  },
};
