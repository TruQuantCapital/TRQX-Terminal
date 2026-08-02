function distance(a, b) {
  return Math.abs(Number(a) - Number(b));
}

function withinTolerance(selected, expected, tolerance) {
  return distance(selected, expected) <= tolerance;
}

export function gradeTradePlan({
  scenario,
  entry,
  stop,
  target,
}) {
  const levels = scenario?.levels ?? {};

  const priceRange = Math.max(
    ...scenario.candles.map((candle) => candle.high)
  ) - Math.min(
    ...scenario.candles.map((candle) => candle.low)
  );

  const tolerance = Math.max(priceRange * 0.025, 0.05);

  const entryCorrect =
    Number.isFinite(Number(entry)) &&
    withinTolerance(entry, levels.entry, tolerance);

  const stopCorrect =
    Number.isFinite(Number(stop)) &&
    withinTolerance(stop, levels.stop, tolerance);

  const validTargets = [
    levels.target1,
    levels.target2,
  ].filter(Number.isFinite);

  const targetCorrect =
    Number.isFinite(Number(target)) &&
    validTargets.some((expectedTarget) =>
      withinTolerance(target, expectedTarget, tolerance)
    );

  const sections = [
    entryCorrect,
    stopCorrect,
    targetCorrect,
  ];

  const score = Math.round(
    (sections.filter(Boolean).length / sections.length) * 100
  );

  return {
    score,
    passed: score >= 80,
    entry: {
      correct: entryCorrect,
      selected: Number(entry),
      expected: levels.entry,
    },
    stop: {
      correct: stopCorrect,
      selected: Number(stop),
      expected: levels.stop,
    },
    target: {
      correct: targetCorrect,
      selected: Number(target),
      expected: validTargets,
    },
    tolerance,
  };
}

export default gradeTradePlan;
