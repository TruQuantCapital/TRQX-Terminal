import React from "react";

function C({ x, t, b, wt, wb, color }) {
  return (
    <g>
      <line x1={x} y1={wt} x2={x} y2={t} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
      <rect x={x - 10} y={t} width={20} height={Math.max(b - t, 4)} fill={color} rx="2" />
      <line x1={x} y1={b} x2={x} y2={wb} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function L({ pts, color = "#d4af37", dash = false }) {
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  return <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray={dash ? "4 3" : undefined} />;
}

const G = "#22c55e";
const R = "#ef4444";
const GR = "#6b7280";

const patterns = {
  hammer: () => (<g><L pts={[[20,130],[60,100],[50,115],[80,85]]} color="rgba(212,175,55,.4)" /><C x={110} t={45} b={65} wt={43} wb={140} color={G} /><L pts={[[130,80],[170,45]]} color="rgba(212,175,55,.4)" /></g>),
  "bullish-engulfing": () => (<g><C x={75} t={55} b={95} wt={48} wb={102} color={R} /><C x={125} t={42} b={108} wt={35} wb={115} color={G} /></g>),
  "tweezer-bottom": () => (<g><C x={70} t={40} b={75} wt={35} wb={120} color={R} /><C x={130} t={45} b={80} wt={40} wb={120} color={G} /><line x1={30} y1={120} x2={170} y2={120} stroke="#d4af37" strokeWidth="1.5" strokeDasharray="4 3" /><text x={100} y={145} textAnchor="middle" fontSize="11" fill="#d4af37" fontFamily="monospace">Same Low</text></g>),
  "morning-star": () => (<g><C x={45} t={30} b={75} wt={25} wb={80} color={R} /><C x={100} t={82} b={90} wt={78} wb={95} color={GR} /><C x={155} t={38} b={75} wt={33} wb={80} color={G} /></g>),
  "shooting-star": () => (<g><L pts={[[20,110],[60,80],[50,95],[80,65]]} color="rgba(212,175,55,.4)" /><C x={110} t={90} b={110} wt={30} wb={112} color={R} /><L pts={[[130,65],[170,95]]} color="rgba(212,175,55,.4)" /></g>),
  "bearish-engulfing": () => (<g><C x={75} t={55} b={95} wt={48} wb={102} color={G} /><C x={125} t={42} b={108} wt={35} wb={115} color={R} /></g>),
  "tweezer-top": () => (<g><C x={70} t={55} b={95} wt={20} wb={100} color={G} /><C x={130} t={50} b={90} wt={20} wb={95} color={R} /><line x1={30} y1={20} x2={170} y2={20} stroke="#d4af37" strokeWidth="1.5" strokeDasharray="4 3" /><text x={100} y={148} textAnchor="middle" fontSize="11" fill="#d4af37" fontFamily="monospace">Same High</text></g>),
  "evening-star": () => (<g><C x={45} t={60} b={105} wt={55} wb={110} color={G} /><C x={100} t={45} b={53} wt={40} wb={58} color={GR} /><C x={155} t={55} b={100} wt={50} wb={105} color={R} /></g>),
  "bull-flag": () => (<g><L pts={[[20,140],[65,50]]} color={G} /><L pts={[[65,50],[90,65],[80,80],[105,90]]} /><L pts={[[65,65],[90,80],[80,95],[105,105]]} dash /><L pts={[[105,88],[150,30]]} color={G} /></g>),
  "bear-flag": () => (<g><L pts={[[20,20],[65,110]]} color={R} /><L pts={[[65,110],[90,95],[80,82],[105,72]]} /><L pts={[[65,125],[90,110],[80,97],[105,87]]} dash /><L pts={[[105,80],[150,140]]} color={R} /></g>),
  "ascending-triangle": () => (<g><line x1={20} y1={40} x2={180} y2={40} stroke="#d4af37" strokeWidth="2" /><L pts={[[20,130],[50,110],[80,90],[110,68],[140,48],[170,40]]} color={G} /><C x={155} t={42} b={55} wt={40} wb={62} color={G} /></g>),
  "descending-triangle": () => (<g><line x1={20} y1={120} x2={180} y2={120} stroke="#d4af37" strokeWidth="2" /><L pts={[[20,30],[50,50],[80,70],[110,90],[140,108],[170,118]]} color={R} /><C x={155} t={105} b={118} wt={98} wb={120} color={R} /></g>),
  "bull-pennant": () => (<g><L pts={[[20,140],[60,55]]} color={G} /><L pts={[[60,55],[90,65],[75,80],[100,72]]} /><L pts={[[60,72],[85,78],[72,88],[100,84]]} dash /><L pts={[[100,76],[145,25]]} color={G} /></g>),
  "bear-pennant": () => (<g><L pts={[[20,20],[60,105]]} color={R} /><L pts={[[60,105],[90,95],[75,82],[100,88]]} /><L pts={[[60,88],[85,82],[72,70],[100,76]]} dash /><L pts={[[100,84],[145,135]]} color={R} /></g>),
  uptrend: () => (<g><C x={30} t={115} b={130} wt={110} wb={134} color={G} /><C x={65} t={100} b={114} wt={95} wb={118} color={R} /><C x={100} t={75} b={90} wt={70} wb={94} color={G} /><C x={135} t={58} b={72} wt={53} wb={76} color={R} /><C x={170} t={35} b={50} wt={30} wb={54} color={G} /><text x={22} y={90} fontSize="10" fill={G} fontFamily="monospace">HH</text><text x={57} y={68} fontSize="10" fill={G} fontFamily="monospace">HH</text><text x={72} y={115} fontSize="10" fill={G} fontFamily="monospace">HL</text><text x={107} y={90} fontSize="10" fill={G} fontFamily="monospace">HL</text></g>),
  downtrend: () => (<g><C x={30} t={25} b={40} wt={20} wb={44} color={R} /><C x={65} t={40} b={54} wt={35} wb={58} color={G} /><C x={100} t={60} b={75} wt={55} wb={79} color={R} /><C x={135} t={78} b={92} wt={73} wb={96} color={G} /><C x={170} t={98} b={113} wt={93} wb={117} color={R} /><text x={22} y={68} fontSize="10" fill={R} fontFamily="monospace">LH</text><text x={57} y={50} fontSize="10" fill={R} fontFamily="monospace">LH</text><text x={72} y={88} fontSize="10" fill={R} fontFamily="monospace">LL</text><text x={107} y={108} fontSize="10" fill={R} fontFamily="monospace">LL</text></g>),
  "sideways-range": () => (<g><line x1={15} y1={35} x2={185} y2={35} stroke="#d4af37" strokeWidth="1.5" strokeDasharray="4 3" /><line x1={15} y1={115} x2={185} y2={115} stroke="#d4af37" strokeWidth="1.5" strokeDasharray="4 3" /><C x={40} t={48} b={75} wt={37} wb={113} color={G} /><C x={80} t={52} b={80} wt={38} wb={114} color={R} /><C x={120} t={45} b={72} wt={36} wb={113} color={G} /><C x={160} t={50} b={78} wt={37} wb={114} color={R} /></g>),
  "stop-hunt": () => (<g><line x1={15} y1={80} x2={185} y2={80} stroke="#d4af37" strokeWidth="1.5" strokeDasharray="4 3" /><C x={55} t={50} b={78} wt={44} wb={82} color={G} /><C x={100} t={45} b={73} wt={40} wb={128} color={R} /><C x={145} t={48} b={76} wt={42} wb={82} color={G} /><text x={100} y={148} textAnchor="middle" fontSize="10" fill={R} fontFamily="monospace">LIQUIDITY SWEEP</text></g>),
  "bull-trap": () => (<g><line x1={15} y1={65} x2={185} y2={65} stroke="#d4af37" strokeWidth="1.5" strokeDasharray="4 3" /><C x={55} t={48} b={63} wt={42} wb={67} color={G} /><C x={95} t={38} b={54} wt={32} wb={65} color={G} /><C x={145} t={65} b={105} wt={50} wb={112} color={R} /><text x={100} y={148} textAnchor="middle" fontSize="10" fill={R} fontFamily="monospace">TRAP: Reverses Down</text></g>),
  "bear-trap": () => (<g><line x1={15} y1={95} x2={185} y2={95} stroke="#d4af37" strokeWidth="1.5" strokeDasharray="4 3" /><C x={55} t={97} b={115} wt={93} wb={120} color={R} /><C x={95} t={102} b={120} wt={97} wb={128} color={R} /><C x={145} t={55} b={90} wt={48} wb={96} color={G} /><text x={100} y={148} textAnchor="middle" fontSize="10" fill={G} fontFamily="monospace">TRAP: Reverses Up</text></g>),
  "standard-doji": () => (<g><line x1={100} y1={25} x2={100} y2={135} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" /><rect x={85} y={76} width={30} height={4} fill="#d4af37" rx="2" /><text x={100} y={155} textAnchor="middle" fontSize="11" fill="#d4af37" fontFamily="monospace">Open = Close</text></g>),
  "gravestone-doji": () => (<g><line x1={100} y1={25} x2={100} y2={90} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" /><rect x={85} y={88} width={30} height={4} fill={R} rx="2" /><line x1={100} y1={92} x2={100} y2={98} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" /><text x={100} y={125} textAnchor="middle" fontSize="11" fill={R} fontFamily="monospace">Buyers Rejected</text></g>),
  "dragonfly-doji": () => (<g><line x1={100} y1={60} x2={100} y2={66} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" /><rect x={85} y={64} width={30} height={4} fill={G} rx="2" /><line x1={100} y1={68} x2={100} y2={130} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" /><text x={100} y={150} textAnchor="middle" fontSize="11" fill={G} fontFamily="monospace">Sellers Rejected</text></g>),
  "long-legged-doji": () => (<g><line x1={100} y1={20} x2={100} y2={138} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" /><rect x={85} y={76} width={30} height={4} fill="#d4af37" rx="2" /><text x={100} y={155} textAnchor="middle" fontSize="11" fill="#d4af37" fontFamily="monospace">Extreme Indecision</text></g>),
  "rickshaw-man-doji": () => (<g><line x1={100} y1={15} x2={100} y2={143} stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" /><rect x={83} y={74} width={34} height={10} fill="#d4af37" rx="3" /><text x={100} y={157} textAnchor="middle" fontSize="10" fill="#d4af37" fontFamily="monospace">Max Indecision</text></g>),
  "four-price-doji": () => (<g><rect x={70} y={76} width={60} height={4} fill="#9ca3af" rx="2" /><text x={100} y={110} textAnchor="middle" fontSize="12" fill="#9ca3af" fontFamily="monospace">O=H=L=C</text><text x={100} y={135} textAnchor="middle" fontSize="10" fill="#6b7280" fontFamily="monospace">No movement</text></g>),
  "dragonfly-at-support": () => (<g><line x1={15} y1={68} x2={185} y2={68} stroke="#d4af37" strokeWidth="1.5" strokeDasharray="4 3" /><line x1={100} y1={55} x2={100} y2={61} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" /><rect x={85} y={59} width={30} height={4} fill={G} rx="2" /><line x1={100} y1={63} x2={100} y2={130} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" /><text x={100} y={152} textAnchor="middle" fontSize="11" fill="#d4af37" fontFamily="monospace">Support Level</text></g>),
  "gravestone-at-resistance": () => (<g><line x1={15} y1={95} x2={185} y2={95} stroke="#d4af37" strokeWidth="1.5" strokeDasharray="4 3" /><line x1={100} y1={30} x2={100} y2={88} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" /><rect x={85} y={86} width={30} height={4} fill={R} rx="2" /><line x1={100} y1={90} x2={100} y2={96} stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" /><text x={100} y={125} textAnchor="middle" fontSize="11" fill="#d4af37" fontFamily="monospace">Resistance Level</text></g>),
};

export default function PatternSVG({ patternId }) {
  const draw = patterns[patternId];
  if (!draw) return null;
  return (
    <svg viewBox="0 0 200 160" width="100%" height="100%" aria-hidden="true">
      <rect width="200" height="160" fill="rgba(0,0,0,.3)" rx="10" />
      {draw()}
    </svg>
  );
}
