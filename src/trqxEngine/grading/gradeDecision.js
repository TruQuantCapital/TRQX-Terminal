function normalizeDecision(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function getExpectedDecision({
  scenario,
  visibleCount,
}) {
  const candles = scenario?.candles ?? [];
  const currentCandle = candles[visibleCount - 1];

  if (!currentCandle) {
    return {
      expected: "wait",
      reason: "Not enough market information is available yet.",
      stage: "developing",
    };
  }

  if (currentCandle.role === "hammer") {
    return {
      expected: "wait",
      reason:
        "The Hammer has formed, but the confirmation candle has not printed. A professional trader waits for proof.",
      stage: "pattern",
    };
  }

  if (currentCandle.role === "confirmation") {
    return {
      expected: "buy",
      reason:
        "The confirmation candle broke above the Hammer high with increased participation.",
      stage: "confirmation",
    };
  }

  if (currentCandle.role === "failed-confirmation") {
    return {
      expected: "pass",
      reason:
        "Buyer confirmation failed. The Hammer-like candle did not produce a valid long setup.",
      stage: "failed-confirmation",
    };
  }

  if (currentCandle.role === "follow-through") {
    return {
      expected: "manage",
      reason:
        "The valid entry has already triggered. The priority is now trade management, not chasing a new entry.",
      stage: "management",
    };
  }

  return {
    expected: "wait",
    reason:
      "The market is still developing. No confirmed reversal entry exists.",
    stage: "developing",
  };
}

export function gradeDecision({
  scenario,
  visibleCount,
  decision,
}) {
  const expectedResult = getExpectedDecision({
    scenario,
    visibleCount,
  });

  const normalizedDecision = normalizeDecision(decision);
  const correct =
    normalizedDecision === expectedResult.expected;

  return {
    correct,
    selected: normalizedDecision,
    expected: expectedResult.expected,
    reason: expectedResult.reason,
    stage: expectedResult.stage,
    score: correct ? 100 : 0,
  };
}

export default gradeDecision;
