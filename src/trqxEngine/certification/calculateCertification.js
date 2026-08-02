function clamp(value, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, value));
}

function gradeLabel(score) {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 75) return "C";
  if (score >= 70) return "D";
  return "F";
}

function calculateReplayDiscipline(session) {
  const replay = session?.replay ?? {};
  const analytics = session?.analytics ?? {};

  let score = 100;

  if ((analytics.rewindCount ?? 0) > 2) {
    score -= 10;
  }

  if ((analytics.pauseCount ?? 0) > 5) {
    score -= 8;
  }

  if (replay.finished !== true) {
    score -= 20;
  }

  return clamp(score);
}

function calculateDecisionAccuracy(session) {
  const total = session?.analytics?.decisionCount ?? 0;
  const correct = session?.analytics?.correctDecisionCount ?? 0;

  if (total <= 0) {
    return 0;
  }

  return clamp(Math.round((correct / total) * 100));
}

function calculateExecutionScore(tradeGrade) {
  if (!tradeGrade) {
    return 0;
  }

  const values = [
    tradeGrade.entry?.score ?? 0,
    tradeGrade.stop?.score ?? 0,
    tradeGrade.target1?.score ?? 0,
    tradeGrade.target2?.score ?? 0,
  ];

  return Math.round(
    values.reduce((total, value) => total + value, 0) /
      values.length
  );
}

function buildAchievements({
  score,
  certificationStatus,
  tradeGrade,
  session,
}) {
  const achievements = [];

  if (tradeGrade?.entry?.score === 100) {
    achievements.push({
      id: "perfect-entry",
      title: "Perfect Entry",
      description: "Matched the professional entry level.",
    });
  }

  if (tradeGrade?.riskManagement === 100) {
    achievements.push({
      id: "risk-master",
      title: "Risk Master",
      description: "Used professional risk management.",
    });
  }

  if ((session?.analytics?.correctDecisionCount ?? 0) >= 3) {
    achievements.push({
      id: "decision-discipline",
      title: "Decision Discipline",
      description: "Recorded multiple correct decisions.",
    });
  }

  if (score >= 90) {
    achievements.push({
      id: "grade-a",
      title: "A-Level Performance",
      description: "Earned an A-range certification score.",
    });
  }

  if (certificationStatus === "certified") {
    achievements.push({
      id: `certified-${session?.scenario?.type ?? "scenario"}`,
      title: `${session?.scenario?.type ?? "Pattern"} Certified`,
      description: "Passed the TRQX professional certification standard.",
    });
  }

  return achievements;
}

export function calculateCertification({
  session,
  tradeGrade,
}) {
  if (!session) {
    throw new Error("calculateCertification requires a session.");
  }

  if (!tradeGrade) {
    throw new Error("calculateCertification requires a trade grade.");
  }

  const replayDiscipline = calculateReplayDiscipline(session);
  const decisionAccuracy = calculateDecisionAccuracy(session);
  const patternRecognition = tradeGrade.direction?.score ?? 0;
  const execution = calculateExecutionScore(tradeGrade);
  const riskManagement = tradeGrade.riskManagement ?? 0;
  const thesis = tradeGrade.thesis ?? 0;
  const confidence = tradeGrade.confidence ?? 0;

  const score = Math.round(
    replayDiscipline * 0.15 +
    decisionAccuracy * 0.15 +
    patternRecognition * 0.15 +
    execution * 0.2 +
    riskManagement * 0.15 +
    thesis * 0.12 +
    confidence * 0.08
  );

  const status =
    score >= 85 && tradeGrade.passed
      ? "certified"
      : "not-certified";

  const result = {
    score,
    grade: gradeLabel(score),
    status,
    passed: status === "certified",
    replayDiscipline,
    decisionAccuracy,
    patternRecognition,
    execution,
    riskManagement,
    thesis,
    confidence,
    achievements: [],
    summary:
      status === "certified"
        ? "TRQX professional certification standard achieved."
        : "Additional practice is required before certification credit.",
  };

  result.achievements = buildAchievements({
    score,
    certificationStatus: status,
    tradeGrade,
    session,
  });

  return result;
}

export default calculateCertification;
