export function createBullishReversalMaps({
  patternRole,
  developingReason,
  patternReason,
  confirmationReason,
  failureReason,
  managementReason,
}) {
  return {
    decisionMap: {
      downtrend: "wait",
      developing: "wait",
      [patternRole]: "wait",
      confirmation: "buy",
      "failed-confirmation": "pass",
      "follow-through": "manage",
    },

    reasonMap: {
      downtrend:
        developingReason ??
        "The bearish trend remains active.",
      developing:
        developingReason ??
        "The market is still developing.",
      [patternRole]:
        patternReason ??
        "The pattern formed, but buyer confirmation is still required.",
      confirmation:
        confirmationReason ??
        "Buyers confirmed the reversal.",
      "failed-confirmation":
        failureReason ??
        "The bullish setup failed confirmation.",
      "follow-through":
        managementReason ??
        "The long entry triggered. Manage the position.",
    },
  };
}

export function createBearishReversalMaps({
  patternRole,
  developingReason,
  patternReason,
  confirmationReason,
  failureReason,
  managementReason,
}) {
  return {
    decisionMap: {
      uptrend: "wait",
      developing: "wait",
      [patternRole]: "wait",
      confirmation: "sell",
      "failed-confirmation": "pass",
      "follow-through": "manage",
    },

    reasonMap: {
      uptrend:
        developingReason ??
        "The bullish trend remains active.",
      developing:
        developingReason ??
        "The market is still developing.",
      [patternRole]:
        patternReason ??
        "The pattern formed, but seller confirmation is still required.",
      confirmation:
        confirmationReason ??
        "Sellers confirmed the reversal.",
      "failed-confirmation":
        failureReason ??
        "The bearish setup failed confirmation.",
      "follow-through":
        managementReason ??
        "The short entry triggered. Manage the position.",
    },
  };
}
