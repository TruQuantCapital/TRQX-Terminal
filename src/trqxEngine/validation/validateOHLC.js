export function validateCandle(candle, index = 0) {
  const requiredFields = ["open", "high", "low", "close"];
  const errors = [];

  if (!candle || typeof candle !== "object") {
    return {
      valid: false,
      errors: [`Candle ${index + 1} must be an object.`],
    };
  }

  for (const field of requiredFields) {
    if (!Number.isFinite(candle[field])) {
      errors.push(
        `Candle ${index + 1}: "${field}" must be a finite number.`
      );
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const bodyHigh = Math.max(candle.open, candle.close);
  const bodyLow = Math.min(candle.open, candle.close);

  if (candle.high < bodyHigh) {
    errors.push(
      `Candle ${index + 1}: high cannot be below open or close.`
    );
  }

  if (candle.low > bodyLow) {
    errors.push(
      `Candle ${index + 1}: low cannot be above open or close.`
    );
  }

  if (candle.high <= candle.low) {
    errors.push(
      `Candle ${index + 1}: high must be greater than low.`
    );
  }

  if (
    candle.volume !== undefined &&
    (!Number.isFinite(candle.volume) || candle.volume < 0)
  ) {
    errors.push(
      `Candle ${index + 1}: volume must be a non-negative number.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateOHLC(candles) {
  if (!Array.isArray(candles)) {
    return {
      valid: false,
      errors: ["Candles must be supplied as an array."],
    };
  }

  if (candles.length === 0) {
    return {
      valid: false,
      errors: ["At least one candle is required."],
    };
  }

  const errors = [];

  candles.forEach((candle, index) => {
    const result = validateCandle(candle, index);

    if (!result.valid) {
      errors.push(...result.errors);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function assertValidOHLC(candles) {
  const result = validateOHLC(candles);

  if (!result.valid) {
    throw new Error(
      `Invalid OHLC sequence:\n${result.errors.join("\n")}`
    );
  }

  return candles;
}

export default validateOHLC;
