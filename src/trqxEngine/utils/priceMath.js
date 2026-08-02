export function roundPrice(value, decimals = 2) {
  if (!Number.isFinite(value)) {
    throw new Error("roundPrice requires a finite number.");
  }

  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function priceRange(candles = []) {
  if (!Array.isArray(candles) || candles.length === 0) {
    return 0;
  }

  const highs = candles.map((candle) => candle.high);
  const lows = candles.map((candle) => candle.low);

  return Math.max(...highs) - Math.min(...lows);
}

export function percentageOfPrice(price, percentage) {
  if (!Number.isFinite(price) || !Number.isFinite(percentage)) {
    throw new Error(
      "percentageOfPrice requires finite price and percentage values."
    );
  }

  return price * percentage;
}
