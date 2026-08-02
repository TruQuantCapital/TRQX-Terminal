function clamp(value, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, value));
}

function percentDifference(actual, expected) {
  if (!Number.isFinite(actual) || !Number.isFinite(expected) || expected === 0) {
    return 100;
  }

  return Math.abs((actual - expected) / expected) * 100;
}

function scorePrice(actual, expected, tolerancePercent = 0.35) {
  const difference = percentDifference(actual, expected);

  if (difference <= tolerancePercent) return 100;
  if (difference <= tolerancePercent * 2) return 90;
  if (difference <= tolerancePercent * 4) return 75;
  if (difference <= tolerancePercent * 7) return 55;
  return 20;
}

function scoreDirection(trade, scenario) {
  const expected = scenario?.answer?.validSetup
    ? scenario?.context?.priorTrend === "uptrend"
      ? "sell"
      : "buy"
    : "pass";

  return {
    expected,
    actual: trade.direction,
    score: trade.direction === expected ? 100 : 0,
    correct: trade.direction === expected,
  };
}

function scoreRiskReward(trade) {
  if (trade.direction === "pass") {
    return {
      value: null,
      score: 100,
      label: "Not applicable",
    };
  }

  const entry = Number(trade.entry);
  const stop = Number(trade.stop);
  const target1 = Number(trade.target1);

  const risk = Math.abs(entry - stop);

  if (!Number.isFinite(risk) || risk <= 0) {
    return {
      value: null,
      score: 0,
      label: "Invalid risk",
    };
  }

  const reward =
    trade.direction === "sell"
      ? entry - target1
      : target1 - entry;

  if (!Number.isFinite(reward) || reward <= 0) {
    return {
      value: null,
      score: 0,
      label: "Invalid target",
    };
  }

  const ratio = reward / risk;

  let score = 20;

  if (ratio >= 3) score = 100;
  else if (ratio >= 2.5) score = 95;
  else if (ratio >= 2) score = 90;
  else if (ratio >= 1.5) score = 70;
  else if (ratio >= 1) score = 45;

  return {
    value: Number(ratio.toFixed(2)),
    score,
    label: `${ratio.toFixed(2)}:1`,
  };
}

function scoreRiskPercent(trade) {
  if (trade.direction === "pass") {
    return 100;
  }

  const value = Number(trade.riskPercent);

  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  if (value <= 1) return 100;
  if (value <= 1.5) return 90;
  if (value <= 2) return 75;
  if (value <= 3) return 50;
  return 20;
}

function scoreThesis(trade, scenario) {
  if (trade.direction === "pass") {
    return trade.thesis?.trim().length >= 5 ? 100 : 70;
  }

  const thesis = String(trade.thesis ?? "").toLowerCase();
  const requiredConcepts = [];

  if (scenario?.context?.location) {
    requiredConcepts.push(String(scenario.context.location).toLowerCase());
  }

  if (scenario?.answer?.pattern) {
    requiredConcepts.push(String(scenario.answer.pattern).toLowerCase());
  }

  requiredConcepts.push("confirm");

  const matched = requiredConcepts.filter((term) =>
    thesis.includes(term)
  ).length;

  const lengthScore =
    thesis.length >= 80
      ? 100
      : thesis.length >= 45
        ? 85
        : thesis.length >= 20
          ? 65
          : 35;

  const conceptScore =
    requiredConcepts.length > 0
      ? Math.round((matched / requiredConcepts.length) * 100)
      : 100;

  return Math.round(lengthScore * 0.6 + conceptScore * 0.4);
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

export function gradeTradePlan({
  trade,
  scenario,
}) {
  if (!trade || !scenario) {
    throw new Error("gradeTradePlan requires trade and scenario.");
  }

  const direction = scoreDirection(trade, scenario);

  if (trade.direction === "pass") {
    const thesis = scoreThesis(trade, scenario);

    const overall = Math.round(
      direction.score * 0.8 +
      thesis * 0.2
    );

    return {
      overall,
      grade: gradeLabel(overall),
      passed: overall >= 80,
      direction,
      entry: { score: 100, expected: null, actual: null },
      stop: { score: 100, expected: null, actual: null },
      target1: { score: 100, expected: null, actual: null },
      target2: { score: 100, expected: null, actual: null },
      riskReward: {
        value: null,
        score: 100,
        label: "Not applicable",
      },
      riskManagement: 100,
      thesis,
      confidence: clamp(Number(trade.confidence) * 10),
      feedback: direction.correct
        ? "Correctly passed on an invalid setup."
        : "The setup was valid and should not have been passed.",
    };
  }

  const levels = scenario.levels ?? {};

  const entry = {
    score: scorePrice(Number(trade.entry), Number(levels.entry)),
    expected: Number(levels.entry),
    actual: Number(trade.entry),
  };

  const stop = {
    score: scorePrice(Number(trade.stop), Number(levels.stop), 0.5),
    expected: Number(levels.stop),
    actual: Number(trade.stop),
  };

  const target1 = {
    score: scorePrice(Number(trade.target1), Number(levels.target1), 0.75),
    expected: Number(levels.target1),
    actual: Number(trade.target1),
  };

  const target2 = {
    score: scorePrice(Number(trade.target2), Number(levels.target2), 1),
    expected: Number(levels.target2),
    actual: Number(trade.target2),
  };

  const riskReward = scoreRiskReward(trade);
  const riskManagement = scoreRiskPercent(trade);
  const thesis = scoreThesis(trade, scenario);
  const confidence = clamp(Number(trade.confidence) * 10);

  const overall = Math.round(
    direction.score * 0.22 +
    entry.score * 0.16 +
    stop.score * 0.16 +
    target1.score * 0.11 +
    target2.score * 0.08 +
    riskReward.score * 0.1 +
    riskManagement * 0.08 +
    thesis * 0.06 +
    confidence * 0.03
  );

  return {
    overall,
    grade: gradeLabel(overall),
    passed: overall >= 80,
    direction,
    entry,
    stop,
    target1,
    target2,
    riskReward,
    riskManagement,
    thesis,
    confidence,
    feedback:
      overall >= 90
        ? "Professional-quality trade plan."
        : overall >= 80
          ? "Passing plan with specific areas to refine."
          : "Review direction, levels, and risk before taking this setup.",
  };
}

export default gradeTradePlan;
