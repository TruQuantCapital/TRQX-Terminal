export function buildCoachMessage({
  scenario,
  visibleCount,
  result,
}) {
  const candle =
    scenario?.candles?.[visibleCount - 1];

  if (!candle) {
    return {
      tone: "neutral",
      title: "Observe the market",
      message:
        "There is not enough printed information to make a professional decision.",
      rule:
        "React to evidence, not expectations.",
    };
  }

  if (!result) {
    if (candle.role === "hammer") {
      return {
        tone: "warning",
        title: "Pattern detected",
        message:
          "A Hammer-like rejection has printed at support, but buyer confirmation has not arrived.",
        rule:
          "Recognition is not confirmation. Wait for price to prove the reversal.",
      };
    }

    if (candle.role === "confirmation") {
      return {
        tone: "positive",
        title: "Confirmation printed",
        message:
          "Price has broken above the Hammer high with increased participation.",
        rule:
          "Evaluate entry, stop placement, and reward-to-risk before executing.",
      };
    }

    if (candle.role === "failed-confirmation") {
      return {
        tone: "negative",
        title: "Confirmation failed",
        message:
          "Buyers failed to maintain control after the rejection candle.",
        rule:
          "A recognizable shape is not enough. Pass when confirmation fails.",
      };
    }

    if (candle.role === "follow-through") {
      return {
        tone: "positive",
        title: "Trade management phase",
        message:
          "The confirmation entry has already triggered and price is following through.",
        rule:
          "Do not chase. Manage risk and protect the open position.",
      };
    }

    return {
      tone: "neutral",
      title: "Market developing",
      message:
        "The decline remains active. No reversal confirmation exists yet.",
      rule:
        "Patience is a position.",
    };
  }

  if (result.correct) {
    return {
      tone: "positive",
      title: "Professional decision",
      message: result.reason,
      rule:
        "Continue applying the same evidence-based process.",
    };
  }

  return {
    tone: "negative",
    title: "Review the decision",
    message: result.reason,
    rule:
      result.expected === "wait"
        ? "You acted before confirmation."
        : result.expected === "pass"
          ? "You accepted a setup that should have been rejected."
          : result.expected === "buy"
            ? "You missed the confirmed execution window."
            : "Reassess the current market phase.",
  };
}

export default buildCoachMessage;
