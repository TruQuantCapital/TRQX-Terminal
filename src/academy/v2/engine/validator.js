import { CHART } from "./constants";
import { candleBox, estimateLabelBox, nx, ny, rectsOverlap } from "./geometry";

export function validatePattern(pattern) {
  const errors = [];
  const warnings = [];
  const targets = pattern.targets || [];
  const candles = pattern.candles || [];

  const targetBoxes = targets.map((target) => ({
    id: target.id,
    box: estimateLabelBox(target),
  }));

  targetBoxes.forEach(({ id, box }, index) => {
    if (
      box.x < CHART.plotLeft ||
      box.y < CHART.plotTop ||
      box.x + box.width > CHART.plotRight ||
      box.y + box.height > CHART.plotBottom
    ) {
      errors.push(`Target "${id}" is outside the safe plot area.`);
    }

    targetBoxes.slice(index + 1).forEach((other) => {
      if (rectsOverlap(box, other.box, 8)) {
        errors.push(`Targets "${id}" and "${other.id}" overlap.`);
      }
    });

    candles.forEach((candle) => {
      if (rectsOverlap(box, candleBox(candle), 8)) {
        warnings.push(`Target "${id}" is too close to candle "${candle.id}".`);
      }
    });
  });

  (pattern.lines || []).forEach((line) => {
    [line.x1, line.x2, line.y1, line.y2].forEach((value) => {
      if (value < 0 || value > 1) {
        errors.push(`Line "${line.id}" has a coordinate outside 0–1.`);
      }
    });
  });

  candles.forEach((candle) => {
    const values = [candle.x, candle.open, candle.close, candle.high, candle.low];
    if (values.some((value) => value < 0 || value > 1)) {
      errors.push(`Candle "${candle.id}" has a coordinate outside 0–1.`);
    }
    if (candle.high > Math.min(candle.open, candle.close)) {
      errors.push(`Candle "${candle.id}" high must be above the body.`);
    }
    if (candle.low < Math.max(candle.open, candle.close)) {
      errors.push(`Candle "${candle.id}" low must be below the body.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
