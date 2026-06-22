import React from "react";

const W = 120;
const H = 140;
const MID = W / 2;

function Wick({ x, y1, y2 }) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />;
}

function Candle({ x, bodyTop, bodyBottom, wickTop, wickBottom, color }) {
  const bodyH = Math.max(bodyBottom - bodyTop, 3);
  return (
    <g>
      <Wick x={x} y1={wickTop} y2={bodyTop} />
      <rect x={x - 8} y={bodyTop} width={16} height={bodyH} fill={color} rx="1" />
      <Wick x={x} y1={bodyBottom} y2={wickBottom} />
    </g>
  );
}

function TrendLine({ points, color = "rgba(212,175,55,.35)", dashed = false }) {
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  return <path d={d} fill="none" stroke={color} strokeWidth="1" strokeDasharray={dashed ? "3 3" : "none"} />;
}

const patterns = {
  hammer: () => (
    <g>
      <TrendLine points={[[20,110],[55,85],[45,95],[60,75]]} />
      <Candle x={MID} bodyTop={55} bodyBottom={65} wickTop={53} wickBottom={110} color="#22c55e" />
    </g>
  ),
  "bullish-engulfing": () => (
    <g>
      <Candle x={MID-14} bodyTop={60} bodyBottom={85} wickTop={55} wickBottom={90} color="#ef4444" />
      <Candle x={MID+14} bodyTop={52} bodyBottom={90} wickTop={48} wickBottom={95} color="#22c55e" />
    </g>
  ),
  "tweezer-bottom": () => (
    <g>
      <Candle x={MID-12} bodyTop={50} bodyBottom={75} wickTop={45} wickBottom={105} color="#ef4444" />
      <Candle x={MID+12} bodyTop={55} bodyBottom={78} wickTop={50} wickBottom={105} color="#22c55e" />
      <line x1={MID-24} y1={105} x2={MID+24} y2={105} stroke="#d4af37" strokeWidth="1" strokeDasharray="2 2" />
    </g>
  ),
  "morning-star": () => (
    <g>
      <Candle x={MID-26} bodyTop={45} bodyBottom={75} wickTop={40} wickBottom={80} color="#ef4444" />
      <Candle x={MID} bodyTop={80} bodyBottom={85} wickTop={77} wickBottom={90} color="#9ca3af" />
      <Candle x={MID+26} bodyTop={52} bodyBottom={75} wickTop={48} wickBottom={78} color="#22c55e" />
    </g>
  ),
  "shooting-star": () => (
    <g>
      <TrendLine points={[[20,100],[55,70],[45,80],[60,60]]} />
      <Candle x={MID} bodyTop={75} bodyBottom={85} wickTop={30} wickBottom={87} color="#ef4444" />
    </g>
  ),
  "bearish-engulfing": () => (
    <g>
      <Candle x={MID-14} bodyTop={55} bodyBottom={80} wickTop={50} wickBottom={85} color="#22c55e" />
      <Candle x={MID+14} bodyTop={48} bodyBottom={88} wickTop={44} wickBottom={93} color="#ef4444" />
    </g>
  ),
  "tweezer-top": () => (
    <g>
      <Candle x={MID-12} bodyTop={50} bodyBottom={75} wickTop={25} wickBottom={78} color="#22c55e" />
      <Candle x={MID+12} bodyTop={55} bodyBottom={78} wickTop={25} wickBottom={82} color="#ef4444" />
      <line x1={MID-24} y1={25} x2={MID+24} y2={25} stroke="#d4af37" strokeWidth="1" strokeDasharray="2 2" />
    </g>
  ),
  "evening-star": () => (
    <g>
      <Candle x={MID-26} bodyTop={60} bodyBottom={90} wickTop={55} wickBottom={95} color="#22c55e" />
      <Candle x={MID} bodyTop={48} bodyBottom={53} wickTop={44} wickBottom={57} color="#9ca3af" />
      <Candle x={MID+26} bodyTop={55} bodyBottom={85} wickTop={50} wickBottom={90} color="#ef4444" />
    </g>
  ),
  "bull-flag": () => (
    <g>
      <TrendLine points={[[15,110],[45,55]]} color="#22c55e" />
      <TrendLine points={[[45,55],[65,65],[55,75],[75,80]]} />
      <TrendLine points={[[45,65],[65,75],[55,85],[75,90]]} dashed />
      <TrendLine points={[[75,75],[100,35]]} color="#22c55e" />
    </g>
  ),
  "bear-flag": () => (
    <g>
      <TrendLine points={[[15,30],[45,85]]} color="#ef4444" />
      <TrendLine points={[[45,85],[65,75],[55,65],[75,60]]} />
      <TrendLine points={[[45,95],[65,85],[55,75],[75,70]]} dashed />
      <TrendLine points={[[75,65],[100,110]]} color="#ef4444" />
    </g>
  ),
  "ascending-triangle": () => (
    <g>
      <line x1={20} y1={50} x2={100} y2={50} stroke="#d4af37" strokeWidth="1.5" />
      <TrendLine points={[[20,110],[40,90],[60,75],[80,60],[100,50]]} color="#22c55e" />
      <Candle x={85} bodyTop={52} bodyBottom={62} wickTop={50} wickBottom={70} color="#22c55e" />
      <path d="M 95 45 L 105 50 L 95 55" fill="none" stroke="#d4af37" strokeWidth="1.5" />
    </g>
  ),
  "descending-triangle": () => (
    <g>
      <line x1={20} y1={90} x2={100} y2={90} stroke="#d4af37" strokeWidth="1.5" />
      <TrendLine points={[[20,30],[40,45],[60,60],[80,75],[100,90]]} color="#ef4444" />
      <Candle x={85} bodyTop={78} bodyBottom={88} wickTop={72} wickBottom={90} color="#ef4444" />
      <path d="M 95 85 L 105 90 L 95 95" fill="none" stroke="#d4af37" strokeWidth="1.5" />
    </g>
  ),
  "bull-pennant": () => (
    <g>
      <TrendLine points={[[15,110],[50,55]]} color="#22c55e" />
      <TrendLine points={[[50,55],[70,60],[60,70],[75,65]]} />
      <TrendLine points={[[50,65],[65,68],[60,75],[75,72]]} dashed />
      <TrendLine points={[[75,62],[100,30]]} color="#22c55e" />
    </g>
  ),
  "bear-pennant": () => (
    <g>
      <TrendLine points={[[15,30],[50,85]]} color="#ef4444" />
      <TrendLine points={[[50,85],[70,80],[60,70],[75,75]]} />
      <TrendLine points={[[50,75],[65,72],[60,65],[75,68]]} dashed />
      <TrendLine points={[[75,78],[100,110]]} color="#ef4444" />
    </g>
  ),
  uptrend: () => (
    <g>
      <Candle x={20} bodyTop={100} bodyBottom={115} wickTop={95} wickBottom={118} color="#22c55e" />
      <Candle x={40} bodyTop={88} bodyBottom={102} wickTop={83} wickBottom={106} color="#ef4444" />
      <Candle x={60} bodyTop={72} bodyBottom={87} wickTop={67} wickBottom={92} color="#22c55e" />
      <Candle x={80} bodyTop={60} bodyBottom={74} wickTop={55} wickBottom={78} color="#ef4444" />
      <Candle x={100} bodyTop={44} bodyBottom={59} wickTop={39} wickBottom={63} color="#22c55e" />
      <text x={30} y={80} fontSize="9" fill="#22c55e" fontFamily="monospace">HH</text>
      <text x={70} y={55} fontSize="9" fill="#22c55e" fontFamily="monospace">HH</text>
      <text x={48} y={100} fontSize="9" fill="#22c55e" fontFamily="monospace">HL</text>
      <text x={88} y={75} fontSize="9" fill="#22c55e" fontFamily="monospace">HL</text>
    </g>
  ),
  downtrend: () => (
    <g>
      <Candle x={20} bodyTop={25} bodyBottom={40} wickTop={22} wickBottom={44} color="#ef4444" />
      <Candle x={40} bodyTop={38} bodyBottom={52} wickTop={34} wickBottom={56} color="#22c55e" />
      <Candle x={60} bodyTop={54} bodyBottom={69} wickTop={50} wickBottom={73} color="#ef4444" />
      <Candle x={80} bodyTop={66} bodyBottom={80} wickTop={62} wickBottom={84} color="#22c55e" />
      <Candle x={100} bodyTop={82} bodyBottom={97} wickTop={78} wickBottom={101} color="#ef4444" />
      <text x={28} y={58} fontSize="9" fill="#ef4444" fontFamily="monospace">LH</text>
      <text x={68} y={47} fontSize="9" fill="#ef4444" fontFamily="monospace">LH</text>
      <text x={48} y={70} fontSize="9" fill="#ef4444" fontFamily="monospace">LL</text>
      <text x={88} y={98} fontSize="9" fill="#ef4444" fontFamily="monospace">LL</text>
    </g>
  ),
  "sideways-range": () => (
    <g>
      <line x1={15} y1={45} x2={105} y2={45} stroke="#d4af37" strokeWidth="1" strokeDasharray="3 2" />
      <line x1={15} y1={95} x2={105} y2={95} stroke="#d4af37" strokeWidth="1" strokeDasharray="3 2" />
      <Candle x={25} bodyTop={55} bodyBottom={75} wickTop={47} wickBottom={93} color="#22c55e" />
      <Candle x={45} bodyTop={60} bodyBottom={80} wickTop={48} wickBottom={94} color="#ef4444" />
      <Candle x={65} bodyTop={52} bodyBottom={72} wickTop={47} wickBottom={93} color="#22c55e" />
      <Candle x={85} bodyTop={58} bodyBottom={78} wickTop={46} wickBottom={94} color="#ef4444" />
      <text x={108} y={48} fontSize="9" fill="#d4af37" fontFamily="monospace">R</text>
      <text x={108} y={98} fontSize="9" fill="#d4af37" fontFamily="monospace">S</text>
    </g>
  ),
  "stop-hunt": () => (
    <g>
      <line x1={15} y1={70} x2={105} y2={70} stroke="#d4af37" strokeWidth="1" strokeDasharray="3 2" />
      <Candle x={40} bodyTop={50} bodyBottom={68} wickTop={45} wickBottom={72} color="#22c55e" />
      <Candle x={60} bodyTop={48} bodyBottom={66} wickTop={44} wickBottom={95} color="#ef4444" />
      <Candle x={80} bodyTop={52} bodyBottom={67} wickTop={47} wickBottom={70} color="#22c55e" />
      <text x={52} y={108} fontSize="8" fill="#ef4444" fontFamily="monospace">SWEEP</text>
    </g>
  ),
  "bull-trap": () => (
    <g>
      <line x1={15} y1={65} x2={105} y2={65} stroke="#d4af37" strokeWidth="1" strokeDasharray="3 2" />
      <Candle x={40} bodyTop={50} bodyBottom={63} wickTop={45} wickBottom={66} color="#22c55e" />
      <Candle x={60} bodyTop={42} bodyBottom={56} wickTop={38} wickBottom={63} color="#22c55e" />
      <Candle x={80} bodyTop={65} bodyBottom={90} wickTop={52} wickBottom={95} color="#ef4444" />
      <path d="M 68 38 L 72 30 L 76 38" fill="none" stroke="#22c55e" strokeWidth="1.5" />
      <path d="M 88 95 L 88 105" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  "bear-trap": () => (
    <g>
      <line x1={15} y1={75} x2={105} y2={75} stroke="#d4af37" strokeWidth="1" strokeDasharray="3 2" />
      <Candle x={40} bodyTop={77} bodyBottom={90} wickTop={73} wickBottom={95} color="#ef4444" />
      <Candle x={60} bodyTop={80} bodyBottom={95} wickTop={75} wickBottom={105} color="#ef4444" />
      <Candle x={80} bodyTop={52} bodyBottom={73} wickTop={46} wickBottom={80} color="#22c55e" />
      <path d="M 68 105 L 72 113 L 76 105" fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <path d="M 88 46 L 88 36" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  "standard-doji": () => (
    <g>
      <line x1={MID} y1={30} x2={MID} y2={110} stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      <rect x={MID-10} y={68} width={20} height={4} fill="#d4af37" rx="1" />
    </g>
  ),
  "gravestone-doji": () => (
    <g>
      <line x1={MID} y1={30} x2={MID} y2={75} stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      <rect x={MID-10} y={73} width={20} height={4} fill="#ef4444" rx="1" />
      <line x1={MID} y1={77} x2={MID} y2={80} stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  ),
  "dragonfly-doji": () => (
    <g>
      <line x1={MID} y1={62} x2={MID} y2={65} stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      <rect x={MID-10} y={63} width={20} height={4} fill="#22c55e" rx="1" />
      <line x1={MID} y1={67} x2={MID} y2={110} stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  ),
  "long-legged-doji": () => (
    <g>
      <line x1={MID} y1={25} x2={MID} y2={115} stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      <rect x={MID-10} y={68} width={20} height={4} fill="#d4af37" rx="1" />
    </g>
  ),
  "rickshaw-man-doji": () => (
    <g>
      <line x1={MID} y1={20} x2={MID} y2={120} stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      <rect x={MID-10} y={65} width={20} height={10} fill="#d4af37" rx="1" />
    </g>
  ),
  "four-price-doji": () => (
    <g>
      <rect x={MID-12} y={68} width={24} height={4} fill="#9ca3af" rx="1" />
      <text x={MID} y={95} fontSize="9" fill="#9ca3af" textAnchor="middle" fontFamily="monospace">O=H=L=C</text>
    </g>
  ),
  "dragonfly-at-support": () => (
    <g>
      <line x1={15} y1={68} x2={105} y2={68} stroke="#d4af37" strokeWidth="1" strokeDasharray="3 2" />
      <line x1={MID} y1={62} x2={MID} y2={65} stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      <rect x={MID-10} y={63} width={20} height={4} fill="#22c55e" rx="1" />
      <line x1={MID} y1={67} x2={MID} y2={110} stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      <text x={108} y={71} fontSize="9" fill="#d4af37" fontFamily="monospace">S</text>
    </g>
  ),
  "gravestone-at-resistance": () => (
    <g>
      <line x1={15} y1={72} x2={105} y2={72} stroke="#d4af37" strokeWidth="1" strokeDasharray="3 2" />
      <line x1={MID} y1={30} x2={MID} y2={70} stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      <rect x={MID-10} y={70} width={20} height={4} fill="#ef4444" rx="1" />
      <line x1={MID} y1={74} x2={MID} y2={77} stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      <text x={108} y={75} fontSize="9" fill="#d4af37" fontFamily="monospace">R</text>
    </g>
  ),
};

export default function PatternSVG({ patternId }) {
  const draw = patterns[patternId];
  if (!draw) return null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight: "120px" }} aria-hidden="true">
      <rect width={W} height={H} fill="rgba(0,0,0,.25)" rx="8" />
      {draw()}
    </svg>
  );
}
