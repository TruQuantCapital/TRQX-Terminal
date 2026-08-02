function coachEntry({
  tone,
  title,
  message,
  rule,
}) {
  return {
    tone,
    title,
    message,
    rule,
  };
}

export function createBullishReversalCoachMap({
  patternRole,
  patternTitle,
}) {
  return {
    downtrend: coachEntry({
      tone: "neutral",
      title: "Downtrend active",
      message:
        "Sellers remain in control while price continues lower.",
      rule:
        "Do not predict a reversal before evidence appears.",
    }),

    [patternRole]: coachEntry({
      tone: "warning",
      title: `${patternTitle} detected`,
      message:
        `${patternTitle} anatomy has formed, but buyer confirmation is still missing.`,
      rule:
        "Recognition is not confirmation.",
    }),

    confirmation: coachEntry({
      tone: "positive",
      title: "Bullish confirmation",
      message:
        "Buyers confirmed the reversal with follow-through.",
      rule:
        "Evaluate entry, stop placement, and reward-to-risk.",
    }),

    "failed-confirmation": coachEntry({
      tone: "negative",
      title: "Setup invalidated",
      message:
        "Buyers failed to confirm the reversal.",
      rule:
        "Pass when confirmation fails.",
    }),

    "follow-through": coachEntry({
      tone: "positive",
      title: "Management phase",
      message:
        "The confirmed long position is following through.",
      rule:
        "Manage the position rather than chasing.",
    }),
  };
}

export function createBearishReversalCoachMap({
  patternRole,
  patternTitle,
}) {
  return {
    uptrend: coachEntry({
      tone: "neutral",
      title: "Uptrend active",
      message:
        "Buyers remain in control while price continues higher.",
      rule:
        "Do not predict a reversal before evidence appears.",
    }),

    [patternRole]: coachEntry({
      tone: "warning",
      title: `${patternTitle} detected`,
      message:
        `${patternTitle} anatomy has formed, but seller confirmation is still missing.`,
      rule:
        "Recognition is not confirmation.",
    }),

    confirmation: coachEntry({
      tone: "positive",
      title: "Bearish confirmation",
      message:
        "Sellers confirmed the reversal with follow-through.",
      rule:
        "Evaluate entry, stop placement, and reward-to-risk.",
    }),

    "failed-confirmation": coachEntry({
      tone: "negative",
      title: "Setup invalidated",
      message:
        "Sellers failed to confirm the reversal.",
      rule:
        "Pass when confirmation fails.",
    }),

    "follow-through": coachEntry({
      tone: "positive",
      title: "Management phase",
      message:
        "The confirmed short position is following through.",
      rule:
        "Manage the position rather than chasing.",
    }),
  };
}
