export const TRADE_DIRECTIONS = ["buy", "sell", "pass"];

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

export function createEmptyTrade() {
  return {
    direction: "",
    entry: "",
    stop: "",
    target1: "",
    target2: "",
    riskPercent: "",
    positionSize: "",
    confidence: 5,
    thesis: "",
  };
}

export function validateTradeContract(trade, { allowDraft = false } = {}) {
  const errors = [];

  if (!trade || typeof trade !== "object" || Array.isArray(trade)) {
    return { valid: false, errors: ["Trade must be an object."] };
  }

  if (!allowDraft && !TRADE_DIRECTIONS.includes(trade.direction)) {
    errors.push(
      `Trade direction must be one of: ${TRADE_DIRECTIONS.join(", ")}.`
    );
  }

  if (trade.direction !== "pass") {
    for (const field of ["entry", "stop", "target1", "target2"]) {
      if (!allowDraft && !isFiniteNumber(trade[field])) {
        errors.push(`Trade requires a numeric "${field}".`);
      }
    }

    if (
      !allowDraft &&
      (!isFiniteNumber(trade.riskPercent) || Number(trade.riskPercent) <= 0)
    ) {
      errors.push("Trade riskPercent must be greater than zero.");
    }
  }

  const confidence = Number(trade.confidence);

  if (!Number.isFinite(confidence) || confidence < 1 || confidence > 10) {
    errors.push("Trade confidence must be between 1 and 10.");
  }

  if (
    !allowDraft &&
    trade.direction !== "pass" &&
    (typeof trade.thesis !== "string" || trade.thesis.trim().length < 10)
  ) {
    errors.push("Trade thesis must contain at least 10 characters.");
  }

  return { valid: errors.length === 0, errors };
}

export function assertTradeContract(trade, options) {
  const result = validateTradeContract(trade, options);

  if (!result.valid) {
    throw new Error(`Invalid trade contract:\n${result.errors.join("\n")}`);
  }

  return trade;
}

export default {
  directions: TRADE_DIRECTIONS,
  createEmpty: createEmptyTrade,
  validate: validateTradeContract,
  assert: assertTradeContract,
};
