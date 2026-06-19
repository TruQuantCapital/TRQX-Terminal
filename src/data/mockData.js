export const marketTiles = [
  { symbol: "SPY", price: "530.68", change: "+0.42%", trend: "up" },
  { symbol: "QQQ", price: "452.21", change: "+0.61%", trend: "up" },
  { symbol: "IWM", price: "200.34", change: "+0.28%", trend: "up" },
  { symbol: "VIX", price: "12.45", change: "-3.21%", trend: "down" },
];

export const scannerRows = [
  { rank: 1, ticker: "MSTR", price: "$1,542.30", change: "+14.25%", volume: "2.45M", relVolume: "3.2x", float: "12.8M", rsi: "78.4", setup: "Momentum" },
  { rank: 2, ticker: "PLTR", price: "$24.85", change: "+8.67%", volume: "89.3M", relVolume: "2.1x", float: "2.1B", rsi: "69.2", setup: "Breakout" },
  { rank: 3, ticker: "GME", price: "$18.42", change: "+7.31%", volume: "15.2M", relVolume: "4.7x", float: "304M", rsi: "65.1", setup: "Squeeze" },
  { rank: 4, ticker: "AMC", price: "$4.12", change: "+6.45%", volume: "23.1M", relVolume: "3.8x", float: "518M", rsi: "62.3", setup: "Momentum" },
  { rank: 5, ticker: "BBBYQ", price: "$0.1287", change: "+5.32%", volume: "8.7M", relVolume: "2.9x", float: "98.5M", rsi: "58.7", setup: "Breakout" },
];

export const optionsFlowRows = [
  { time: "9:13 AM", ticker: "NVDA", type: "Sweep", expiry: "05/17/24", strike: "950", cp: "C", premium: "$3.12M", details: "3,280 @ 9.50" },
  { time: "9:13 AM", ticker: "AAPL", type: "Sweep", expiry: "05/17/24", strike: "195", cp: "C", premium: "$2.45M", details: "1,250 @ 19.60" },
  { time: "9:13 AM", ticker: "TSLA", type: "Sweep", expiry: "05/24/24", strike: "180", cp: "P", premium: "$2.15M", details: "2,100 @ 10.25" },
  { time: "9:13 AM", ticker: "AMZN", type: "Sweep", expiry: "05/17/24", strike: "185", cp: "C", premium: "$1.89M", details: "1,020 @ 18.50" },
  { time: "9:13 AM", ticker: "QQQ", type: "Sweep", expiry: "05/17/24", strike: "455", cp: "C", premium: "$1.75M", details: "3,600 @ 4.86" },
];

export const economicRows = [
  ["08:30 AM", "CPI (MoM)", "High", "0.3%", "0.3%", "0.4%"],
  ["08:30 AM", "CPI (YoY)", "High", "3.4%", "3.4%", "3.5%"],
  ["10:00 AM", "Fed Chair Powell Speaks", "High", "--", "--", "--"],
  ["10:00 AM", "JOLTS Job Openings", "Med", "8.45M", "8.80M", "8.76M"],
  ["02:00 PM", "FOMC Minutes", "High", "--", "--", "--"],
];

export const gammaMetrics = [
  { label: "Call Wall", value: "535", detail: "+286.4K Gamma", tone: "green" },
  { label: "Put Wall", value: "525", detail: "-312.7K Gamma", tone: "red" },
  { label: "Gamma Flip", value: "528.75", detail: "Neutral", tone: "purple" },
  { label: "Max Pain", value: "529", detail: "Pin Risk", tone: "gold" },
  { label: "Net Gamma", value: "+1.2M", detail: "Positive", tone: "green" },
  { label: "Dealer Positioning", value: "Long Gamma", detail: "Bullish", tone: "green" },
];
