export default function CandlestickChart({ data }) {
  if (!data || data.length === 0) return null;

  const width = 600;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 30, left: 40 };

  // Find min/max for scaling
  const prices = data.flatMap(d => [d.low, d.high, d.open, d.close]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const candleWidth = (chartWidth / data.length) * 0.7;
  const spacing = chartWidth / data.length;

  // Scale functions
  const scaleY = (price) => {
    return padding.top + chartHeight - ((price - minPrice) / range) * chartHeight;
  };

  const scaleX = (index) => {
    return padding.left + (index + 0.5) * spacing;
  };

  return (
    <svg width={width} height={height} style={{ background: '#0f1419', border: '1px solid #d4af37' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = padding.top + chartHeight * (1 - pct);
        return <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,.1)" strokeDasharray="3 3" />;
      })}

      {/* Candles */}
      {data.map((candle, idx) => {
        const x = scaleX(idx);
        const high = scaleY(candle.high);
        const low = scaleY(candle.low);
        const open = scaleY(candle.open);
        const close = scaleY(candle.close);

        const isGreen = close < open; // Close higher = up candle
        const color = isGreen ? '#22c55e' : '#ef4444';
        const bodyTop = Math.min(open, close);
        const bodyHeight = Math.abs(close - open) || 1;

        return (
          <g key={idx}>
            {/* Wick (low to high) */}
            <line x1={x} y1={high} x2={x} y2={low} stroke={color} strokeWidth={1} opacity={0.6} />

            {/* Body (open to close) */}
            <rect
              x={x - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={color}
              opacity={0.8}
              stroke={color}
              strokeWidth={1}
            />

            {/* Time label */}
            <text x={x} y={height - 10} textAnchor="middle" fontSize="12" fill="#8b98ad">
              {candle.time}
            </text>
          </g>
        );
      })}

      {/* Y-axis labels */}
      {[0, 0.5, 1].map((pct, i) => {
        const price = minPrice + (range * pct);
        const y = padding.top + chartHeight * (1 - pct);
        return (
          <text key={i} x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#8b98ad">
            {Math.round(price)}
          </text>
        );
      })}
    </svg>
  );
}
