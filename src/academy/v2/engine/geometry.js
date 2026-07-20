import { CHART } from "./constants";

export function nx(value) {
  return CHART.plotLeft + value * (CHART.plotRight - CHART.plotLeft);
}

export function ny(value) {
  return CHART.plotTop + value * (CHART.plotBottom - CHART.plotTop);
}

export function rectsOverlap(a, b, padding = 0) {
  return !(
    a.x + a.width + padding <= b.x ||
    b.x + b.width + padding <= a.x ||
    a.y + a.height + padding <= b.y ||
    b.y + b.height + padding <= a.y
  );
}

export function estimateLabelBox(item) {
  const width = Math.max(78, String(item.text || item.answer || "").length * 7 + 22);
  return {
    x: nx(item.x) - width / 2,
    y: ny(item.y) - 15,
    width,
    height: 30,
  };
}

export function candleBox(candle) {
  const x = nx(candle.x);
  const bodyTop = ny(Math.min(candle.open, candle.close));
  const bodyBottom = ny(Math.max(candle.open, candle.close));

  return {
    x: x - (candle.width || 16) / 2,
    y: ny(candle.high),
    width: candle.width || 16,
    height: Math.max(6, ny(candle.low) - ny(candle.high)),
    bodyTop,
    bodyBottom,
  };
}
