export const lesson12Drills = {
  dragTimeline: {
    prompt: "Drag each session name onto the correct time slot.",
    chips: ["Premarket", "Opening Range", "Lunch Session", "Power Hour"],
    slots: [
      { id: "slot-1", label: "4:00 AM - 9:30 AM", sublabel: "Low volume, news-reactive", correctChip: "Premarket" },
      { id: "slot-2", label: "9:30 AM - 9:45 AM", sublabel: "Most volatile window", correctChip: "Opening Range" },
      { id: "slot-3", label: "11:30 AM - 1:30 PM", sublabel: "Volume drops, choppy", correctChip: "Lunch Session" },
      { id: "slot-4", label: "3:00 PM - 4:00 PM", sublabel: "Volume picks back up sharply", correctChip: "Power Hour" },
    ],
  },
};
