import { roundPrice } from "./priceMath";

export function createCandle({
  time,
  open,
  high,
  low,
  close,
  volume = 0,
  role = "developing",
  metadata = {},
}) {
  const candle = {
    time,
    open: roundPrice(open),
    high: roundPrice(high),
    low: roundPrice(low),
    close: roundPrice(close),
    volume: Math.round(volume),
    role,
    metadata,
  };

  return candle;
}

export function bullishCandle({
  time,
  open,
  body,
  upperWick,
  lowerWick,
  volume,
  role,
  metadata,
}) {
  const close = open + body;

  return createCandle({
    time,
    open,
    close,
    high: close + upperWick,
    low: open - lowerWick,
    volume,
    role,
    metadata,
  });
}

export function bearishCandle({
  time,
  open,
  body,
  upperWick,
  lowerWick,
  volume,
  role,
  metadata,
}) {
  const close = open - body;

  return createCandle({
    time,
    open,
    close,
    high: open + upperWick,
    low: close - lowerWick,
    volume,
    role,
    metadata,
  });
}

export function indecisionCandle({
  time,
  open,
  body = 0.01,
  upperWick,
  lowerWick,
  volume,
  role,
  metadata,
}) {
  const close = open + body;

  return createCandle({
    time,
    open,
    close,
    high: Math.max(open, close) + upperWick,
    low: Math.min(open, close) - lowerWick,
    volume,
    role,
    metadata,
  });
}
