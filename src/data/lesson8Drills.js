export const lesson8Drills = {
  dragTimeline: {
    prompt: "Daily and 1 Hour are both Bullish. The 15 Minute chart just pulled back. Drag the correct read onto each timeframe.",
    chips: ["Bullish (sets direction)", "Bullish (confirms structure)", "Pullback, not a reversal"],
    slots: [
      { id: "slot-1", label: "Daily Chart", sublabel: "Higher Highs and Higher Lows", correctChip: "Bullish (sets direction)" },
      { id: "slot-2", label: "1 Hour Chart", sublabel: "Still aligned with Daily", correctChip: "Bullish (confirms structure)" },
      { id: "slot-3", label: "15 Minute Chart", sublabel: "Just dipped lower", correctChip: "Pullback, not a reversal" },
    ],
  },
};
