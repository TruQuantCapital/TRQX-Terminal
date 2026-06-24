import React from "react";

const G = "#22c55e";
const R = "#ef4444";
const GR = "#6b7280";
const GOLD = "#d4af37";
const WICK = "#9ca3af";

// Candle component: x=center, t=body top, b=body bottom, wt=wick top, wb=wick bottom
function C({ x, t, b, wt, wb, color }) {
  const h = Math.max(b - t, 3);
  return (
    <g>
      <line x1={x} y1={wt} x2={x} y2={t} stroke={WICK} strokeWidth="1.5" strokeLinecap="round" />
      <rect x={x - 8} y={t} width={16} height={h} fill={color} rx="1.5" />
      <line x1={x} y1={b} x2={x} y2={wb} stroke={WICK} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

// Line path
function L({ pts, color = GOLD, dash = false, width = 1.5 }) {
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? "4 3" : undefined} />;
}

// Arrow
function Arrow({ x1, y1, x2, y2, color }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 7;
  const ax = x2 - size * Math.cos(angle - 0.4);
  const ay = y2 - size * Math.sin(angle - 0.4);
  const bx = x2 - size * Math.cos(angle + 0.4);
  const by = y2 - size * Math.sin(angle + 0.4);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} fill={color} />
    </g>
  );
}

const patterns = {

  // ── BULLISH REVERSAL ──────────────────────────────────────────────
  hammer: () => (
    <g>
      {/* Downtrend context */}
      <C x={35} t={30} b={50} wt={25} wb={58} color={R} />
      <C x={60} t={38} b={58} wt={33} wb={66} color={R} />
      <C x={85} t={46} b={66} wt={41} wb={74} color={R} />
      {/* Hammer: small body top, long lower wick */}
      <C x={120} t={58} b={70} wt={55} wb={125} color={G} />
      {/* Arrow up */}
      <Arrow x1={145} y1={110} x2={165} y2={75} color={G} />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Small body · Long lower wick</text>
    </g>
  ),

  "bullish-engulfing": () => (
    <g>
      {/* Small red candle */}
      <C x={75} t={55} b={95} wt={48} wb={102} color={R} />
      {/* Large green candle engulfs */}
      <C x={125} t={42} b={108} wt={35} wb={115} color={G} />
      <Arrow x1={148} y1={90} x2={168} y2={60} color={G} />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Green engulfs red body</text>
    </g>
  ),

  "tweezer-bottom": () => (
    <g>
      <C x={70} t={40} b={80} wt={35} wb={120} color={R} />
      <C x={120} t={45} b={82} wt={40} wb={120} color={G} />
      <line x1={25} y1={120} x2={175} y2={120} stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={100} y={140} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Same Low = Support</text>
      <Arrow x1={143} y1={100} x2={163} y2={65} color={G} />
    </g>
  ),

  "morning-star": () => (
    <g>
      {/* Large red */}
      <C x={45} t={28} b={78} wt={22} wb={83} color={R} />
      {/* Small indecision */}
      <C x={100} t={84} b={92} wt={80} wb={97} color={GR} />
      {/* Large green */}
      <C x={155} t={35} b={78} wt={30} wb={83} color={G} />
      <Arrow x1={170} y1={65} x2={185} y2={35} color={G} />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Red · Star · Green</text>
    </g>
  ),

  // ── BEARISH REVERSAL ──────────────────────────────────────────────
  "shooting-star": () => (
    <g>
      {/* Uptrend context */}
      <C x={35} t={105} b={125} wt={100} wb={130} color={G} />
      <C x={60} t={88} b={108} wt={83} wb={113} color={G} />
      <C x={85} t={72} b={92} wt={67} wb={97} color={G} />
      {/* Shooting star: small body bottom, long upper wick */}
      <C x={120} t={88} b={100} wt={30} wb={103} color={R} />
      <Arrow x1={143} y1={80} x2={163} y2={115} color={R} />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Small body · Long upper wick</text>
    </g>
  ),

  "bearish-engulfing": () => (
    <g>
      <C x={75} t={55} b={95} wt={48} wb={102} color={G} />
      <C x={125} t={42} b={108} wt={35} wb={115} color={R} />
      <Arrow x1={148} y1={70} x2={168} y2={110} color={R} />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Red engulfs green body</text>
    </g>
  ),

  "tweezer-top": () => (
    <g>
      <C x={70} t={48} b={88} wt={20} wb={93} color={G} />
      <C x={120} t={45} b={85} wt={20} wb={90} color={R} />
      <line x1={25} y1={20} x2={175} y2={20} stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={100} y={115} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Same High = Resistance</text>
      <Arrow x1={143} y1={65} x2={163} y2={105} color={R} />
    </g>
  ),

  "evening-star": () => (
    <g>
      <C x={45} t={55} b={105} wt={50} wb={110} color={G} />
      <C x={100} t={42} b={50} wt={38} wb={55} color={GR} />
      <C x={155} t={58} b={108} wt={53} wb={113} color={R} />
      <Arrow x1={170} y1={75} x2={185} y2={115} color={R} />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Green · Star · Red</text>
    </g>
  ),

  // ── CONTINUATION ─────────────────────────────────────────────────
  "bull-flag": () => (
    <g>
      {/* Pole up */}
      <Arrow x1={20} y1={135} x2={65} y2={45} color={G} />
      {/* Flag channel down */}
      <L pts={[[65,45],[85,58],[78,70],[98,80]]} color={GOLD} />
      <L pts={[[65,58],[85,72],[78,84],[98,94]]} color={GOLD} dash />
      {/* Breakout */}
      <Arrow x1={98} y1={78} x2={175} y2={20} color={G} />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Pole · Flag · Breakout</text>
    </g>
  ),

  "bear-flag": () => (
    <g>
      {/* Pole down */}
      <Arrow x1={20} y1={20} x2={65} y2={110} color={R} />
      {/* Flag channel up */}
      <L pts={[[65,110],[85,97],[78,85],[98,75]]} color={GOLD} />
      <L pts={[[65,123],[85,110],[78,98],[98,88]]} color={GOLD} dash />
      {/* Breakdown */}
      <Arrow x1={98} y1={82} x2={175} y2={148} color={R} />
      <text x={100} y={155} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Pole · Flag · Breakdown</text>
    </g>
  ),

  "ascending-triangle": () => (
    <g>
      {/* Flat resistance */}
      <line x1={15} y1={38} x2={175} y2={38} stroke={GOLD} strokeWidth="2" />
      {/* Rising support trendline */}
      <L pts={[[15,125],[55,105],[95,82],[135,58],[165,40]]} color={G} />
      {/* Candles */}
      <C x={35} t={95} b={110} wt={90} wb={124} color={G} />
      <C x={75} t={72} b={88} wt={67} wb={104} color={G} />
      <C x={115} t={50} b={65} wt={45} wb={81} color={G} />
      {/* Breakout arrow */}
      <Arrow x1={155} y1={38} x2={185} y2={15} color={G} />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Higher lows · Flat resistance</text>
    </g>
  ),

  "descending-triangle": () => (
    <g>
      {/* Flat support */}
      <line x1={15} y1={118} x2={175} y2={118} stroke={GOLD} strokeWidth="2" />
      {/* Falling resistance trendline */}
      <L pts={[[15,30],[55,50],[95,72],[135,95],[165,115]]} color={R} />
      {/* Candles */}
      <C x={35} t={42} b={58} wt={32} wb={62} color={R} />
      <C x={75} t={62} b={78} wt={52} wb={116} color={R} />
      <C x={115} t={84} b={100} wt={74} wb={117} color={R} />
      {/* Breakdown arrow */}
      <Arrow x1={155} y1={118} x2={185} y2={148} color={R} />
      <text x={100} y={155} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Lower highs · Flat support</text>
    </g>
  ),

  "bull-pennant": () => (
    <g>
      {/* Strong pole up */}
      <Arrow x1={15} y1={140} x2={60} y2={50} color={G} />
      {/* Tight symmetrical triangle */}
      <L pts={[[60,50],[80,58],[70,65],[90,68]]} color={GOLD} />
      <L pts={[[60,65],[80,62],[70,70],[90,68]]} color={GOLD} dash />
      {/* Breakout */}
      <Arrow x1={90} y1={65} x2={175} y2={15} color={G} />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Strong move · Tight pennant</text>
    </g>
  ),

  "bear-pennant": () => (
    <g>
      {/* Strong pole down */}
      <Arrow x1={15} y1={15} x2={60} y2={105} color={R} />
      {/* Tight symmetrical triangle */}
      <L pts={[[60,105],[80,97],[70,90],[90,88]]} color={GOLD} />
      <L pts={[[60,90],[80,92],[70,85],[90,88]]} color={GOLD} dash />
      {/* Breakdown */}
      <Arrow x1={90} y1={92} x2={175} y2={148} color={R} />
      <text x={100} y={155} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Strong drop · Tight pennant</text>
    </g>
  ),

  // ── TREND PATTERNS ────────────────────────────────────────────────
  uptrend: () => (
    <g>
      <C x={28} t={108} b={120} wt={104} wb={124} color={G} />
      <C x={55} t={95} b={106} wt={92} wb={110} color={R} />
      <C x={82} t={72} b={84} wt={68} wb={88} color={G} />
      <C x={109} t={56} b={68} wt={52} wb={72} color={R} />
      <C x={136} t={35} b={47} wt={31} wb={51} color={G} />
      <L pts={[[15,125],[55,107],[95,85],[135,48]]} color={G} dash />
      <text x={25} y={100} fontSize="9" fill={G} fontFamily="monospace">HL</text>
      <text x={52} y={88} fontSize="9" fill={G} fontFamily="monospace">HL</text>
      <text x={20} y={122} fontSize="9" fill={G} fontFamily="monospace">HH</text>
      <text x={78} y={65} fontSize="9" fill={G} fontFamily="monospace">HH</text>
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Higher Highs · Higher Lows</text>
    </g>
  ),

  downtrend: () => (
    <g>
      <C x={28} t={22} b={34} wt={18} wb={38} color={R} />
      <C x={55} t={35} b={46} wt={32} wb={50} color={G} />
      <C x={82} t={55} b={67} wt={51} wb={71} color={R} />
      <C x={109} t={72} b={84} wt={68} wb={88} color={G} />
      <C x={136} t={92} b={104} wt={88} wb={108} color={R} />
      <L pts={[[15,28],[55,43],[95,62],[135,98]]} color={R} dash />
      <text x={25} y={50} fontSize="9" fill={R} fontFamily="monospace">LH</text>
      <text x={52} y={65} fontSize="9" fill={R} fontFamily="monospace">LH</text>
      <text x={48} y={48} fontSize="9" fill={R} fontFamily="monospace">LL</text>
      <text x={105} y={88} fontSize="9" fill={R} fontFamily="monospace">LL</text>
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Lower Highs · Lower Lows</text>
    </g>
  ),

  "sideways-range": () => (
    <g>
      <line x1={12} y1={32} x2={188} y2={32} stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1={12} y1={112} x2={188} y2={112} stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" />
      <C x={38} t={45} b={72} wt={33} wb={111} color={G} />
      <C x={75} t={48} b={75} wt={34} wb={110} color={R} />
      <C x={112} t={44} b={70} wt={33} wb={111} color={G} />
      <C x={149} t={47} b={74} wt={33} wb={110} color={R} />
      <text x={100} y={135} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Support ↔ Resistance</text>
    </g>
  ),

  // ── LIQUIDITY PATTERNS ────────────────────────────────────────────
  "stop-hunt": () => (
    <g>
      <line x1={12} y1={78} x2={188} y2={78} stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" />
      <C x={38} t={48} b={76} wt={42} wb={80} color={G} />
      <C x={70} t={45} b={73} wt={39} wb={80} color={G} />
      {/* Sweep below support */}
      <C x={108} t={48} b={76} wt={42} wb={128} color={R} />
      <text x={115} y={142} fontSize="9" fill={R} fontFamily="monospace">Stops</text>
      {/* Reversal up */}
      <C x={146} t={42} b={70} wt={36} wb={76} color={G} />
      <Arrow x1={160} y1={60} x2={180} y2={30} color={G} />
      <text x={100} y={155} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Sweeps stops · Then reverses</text>
    </g>
  ),

  "bull-trap": () => (
    <g>
      <line x1={12} y1={62} x2={188} y2={62} stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" />
      <C x={38} t={45} b={60} wt={40} wb={65} color={G} />
      <C x={70} t={42} b={57} wt={37} wb={62} color={G} />
      {/* False breakout above resistance */}
      <C x={108} t={32} b={48} wt={27} wb={62} color={G} />
      <text x={118} y={22} fontSize="9" fill={R} fontFamily="monospace">Stops</text>
      {/* Reversal down */}
      <C x={146} t={62} b={98} wt={55} wb={105} color={R} />
      <Arrow x1={160} y1={90} x2={180} y2={125} color={R} />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Breaks out · Reverses down</text>
    </g>
  ),

  "bear-trap": () => (
    <g>
      <line x1={12} y1={95} x2={188} y2={95} stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" />
      <C x={38} t={98} b={115} wt={93} wb={120} color={R} />
      <C x={70} t={100} b={118} wt={95} wb={123} color={R} />
      {/* False breakdown below support */}
      <C x={108} t={105} b={122} wt={100} wb={140} color={R} />
      <text x={118} y={153} fontSize="9" fill={G} fontFamily="monospace">Stops</text>
      {/* Reversal up */}
      <C x={146} t={52} b={88} wt={45} wb={95} color={G} />
      <Arrow x1={160} y1={65} x2={180} y2={30} color={G} />
      <text x={100} y={155} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Breaks down · Reverses up</text>
    </g>
  ),

  // ── DOJI LIBRARY ──────────────────────────────────────────────────
  "standard-doji": () => (
    <g>
      <line x1={100} y1={28} x2={100} y2={128} stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x={82} y={76} width={36} height={4} fill={GOLD} rx="2" />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Open = Close</text>
      <text x={100} y={160} textAnchor="middle" fontSize="9" fill={GR} fontFamily="monospace">Indecision</text>
    </g>
  ),

  "gravestone-doji": () => (
    <g>
      {/* Long upper wick */}
      <line x1={100} y1={22} x2={100} y2={88} stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      {/* Tiny body at bottom */}
      <rect x={82} y={86} width={36} height={4} fill={R} rx="2" />
      {/* No lower wick */}
      <text x={100} y={110} textAnchor="middle" fontSize="10" fill={R} fontFamily="monospace">Bearish Reversal</text>
      <text x={100} y={125} textAnchor="middle" fontSize="9" fill={GR} fontFamily="monospace">Buyers rejected at high</text>
    </g>
  ),

  "dragonfly-doji": () => (
    <g>
      {/* No upper wick */}
      {/* Tiny body at top */}
      <rect x={82} y={48} width={36} height={4} fill={G} rx="2" />
      {/* Long lower wick */}
      <line x1={100} y1={52} x2={100} y2={128} stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={G} fontFamily="monospace">Bullish Reversal</text>
      <text x={100} y={160} textAnchor="middle" fontSize="9" fill={GR} fontFamily="monospace">Sellers rejected at low</text>
    </g>
  ),

  "long-legged-doji": () => (
    <g>
      <line x1={100} y1={18} x2={100} y2={138} stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x={82} y={76} width={36} height={4} fill={GOLD} rx="2" />
      <text x={100} y={155} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Extreme Indecision</text>
    </g>
  ),

  "rickshaw-man-doji": () => (
    <g>
      <line x1={100} y1={15} x2={100} y2={140} stroke={WICK} strokeWidth="2.5" strokeLinecap="round" />
      <rect x={82} y={73} width={36} height={10} fill={GOLD} rx="3" />
      <text x={100} y={155} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Max Indecision</text>
    </g>
  ),

  "four-price-doji": () => (
    <g>
      <rect x={65} y={76} width={70} height={4} fill={WICK} rx="2" />
      <text x={100} y={105} textAnchor="middle" fontSize="11" fill={WICK} fontFamily="monospace">O = H = L = C</text>
      <text x={100} y={125} textAnchor="middle" fontSize="10" fill={GR} fontFamily="monospace">No movement</text>
    </g>
  ),

  "dragonfly-at-support": () => (
    <g>
      <line x1={12} y1={65} x2={188} y2={65} stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" />
      <rect x={82} y={62} width={36} height={4} fill={G} rx="2" />
      <line x1={100} y1={66} x2={100} y2={128} stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <Arrow x1={145} y1={80} x2={165} y2={45} color={G} />
      <text x={100} y={148} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Support Level</text>
      <text x={100} y={160} textAnchor="middle" fontSize="9" fill={G} fontFamily="monospace">Strong bullish signal</text>
    </g>
  ),

  "gravestone-at-resistance": () => (
    <g>
      <line x1={12} y1={92} x2={188} y2={92} stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1={100} y1={28} x2={100} y2={88} stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x={82} y={86} width={36} height={4} fill={R} rx="2" />
      <Arrow x1={145} y1={75} x2={165} y2={115} color={R} />
      <text x={100} y={118} textAnchor="middle" fontSize="10" fill={GOLD} fontFamily="monospace">Resistance Level</text>
      <text x={100} y={132} textAnchor="middle" fontSize="9" fill={R} fontFamily="monospace">Strong bearish signal</text>
    </g>
  ),
};

export default function PatternSVG({ patternId }) {
  const draw = patterns[patternId];
  if (!draw) return null;
  return (
    <svg viewBox="0 0 200 165" width="100%" height="100%" aria-hidden="true">
      <rect width="200" height="165" fill="rgba(0,0,0,0.35)" rx="10" />
      {draw()}
    </svg>
  );
}
