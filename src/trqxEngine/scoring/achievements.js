export const ACHIEVEMENTS = [
  {
    id: "first-correct",
    title: "First Read",
    description: "Make your first correct market decision.",
    test: (stats) => stats.correct >= 1,
  },
  {
    id: "five-correct",
    title: "Pattern Reader",
    description: "Make five correct decisions.",
    test: (stats) => stats.correct >= 5,
  },
  {
    id: "ten-streak",
    title: "Locked In",
    description: "Reach a 10-decision correct streak.",
    test: (stats) => stats.bestStreak >= 10,
  },
  {
    id: "ninety-accuracy",
    title: "Precision Trader",
    description: "Maintain at least 90% accuracy over 10 attempts.",
    test: (stats) =>
      stats.attempts >= 10 &&
      stats.accuracy >= 90,
  },
  {
    id: "one-thousand-xp",
    title: "Simulator Veteran",
    description: "Earn 1,000 simulator XP.",
    test: (stats) => stats.xp >= 1000,
  },
];

export function evaluateAchievements(stats) {
  return ACHIEVEMENTS.filter((achievement) =>
    achievement.test(stats)
  );
}
