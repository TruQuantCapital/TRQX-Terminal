export const XP_REWARDS = {
  correctDecision: 100,
  incorrectDecision: 20,
  perfectTradePlan: 250,
  passedTradePlan: 150,
  completedScenario: 75,
};

export function calculateAccuracy(correct, attempts) {
  if (!attempts) {
    return 0;
  }

  return Math.round((correct / attempts) * 100);
}

export function calculateDecisionXP(result) {
  return result?.correct
    ? XP_REWARDS.correctDecision
    : XP_REWARDS.incorrectDecision;
}

export function calculateTradePlanXP(result) {
  if (!result) {
    return 0;
  }

  if (result.score === 100) {
    return XP_REWARDS.perfectTradePlan;
  }

  if (result.passed) {
    return XP_REWARDS.passedTradePlan;
  }

  return 25;
}

export function calculateSessionGrade({
  decisionAccuracy = 0,
  tradePlanScore = null,
  completed = false,
}) {
  const decisionWeight = tradePlanScore === null ? 1 : 0.6;
  const tradePlanWeight = tradePlanScore === null ? 0 : 0.4;

  let grade =
    decisionAccuracy * decisionWeight +
    (tradePlanScore ?? 0) * tradePlanWeight;

  if (!completed) {
    grade *= 0.9;
  }

  return Math.round(grade);
}

export function gradeLabel(score) {
  if (score >= 95) return "ELITE";
  if (score >= 90) return "PROFICIENT";
  if (score >= 80) return "PASSING";
  if (score >= 70) return "DEVELOPING";
  return "REVIEW REQUIRED";
}
