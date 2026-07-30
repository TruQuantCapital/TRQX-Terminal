import React from "react";

const G = "#22c55e";
const R = "#ef4444";
const GR = "#6b7280";
const GOLD = "#d4af37";
const TEAL = "#26a69a";
const BLUE = "#3b82f6";
const WICK = "#9ca3af";
const W = 280;
const H = 180;

// ── Candle ──
function C({ x, t, b, wt, wb, color, width = 14 }) {
  const bh = Math.max(b - t, 3);
  return (
    <g>
      <line x1={x} y1={wt} x2={x} y2={t} stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <rect x={x - width / 2} y={t} width={width} height={bh} fill={color} rx="2"
        style={{ filter: `drop-shadow(0 0 4px ${color}88)` }} />
      <line x1={x} y1={b} x2={x} y2={wb} stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </g>
  );
}

// ── Dashed or solid line ──
function L({ pts, color = GOLD, dash = false, width = 1.5 }) {
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  return <path d={d} fill="none" stroke={color} strokeWidth={width}
    strokeLinecap="round" strokeLinejoin="round"
    strokeDasharray={dash ? "5 3" : undefined} />;
}

// ── Arrow ──
function Arrow({ x1, y1, x2, y2, color, width = 2 }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 8;
  const ax = x2 - size * Math.cos(angle - 0.4);
  const ay = y2 - size * Math.sin(angle - 0.4);
  const bx = x2 - size * Math.cos(angle + 0.4);
  const by = y2 - size * Math.sin(angle + 0.4);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} fill={color} />
    </g>
  );
}

// ── Zone rectangle ──
function Zone({ x1, y1, x2, y2, color, label }) {
  return (
    <g>
      <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1}
        fill={`${color}22`} stroke={color} strokeWidth="1"
        strokeDasharray="4 2" rx="3" />
      {label && (
        <text x={(x1 + x2) / 2} y={y1 + (y2 - y1) / 2 + 4}
          textAnchor="middle" fontSize="9" fill={color}
          fontFamily="monospace" fontWeight="700">{label}</text>
      )}
    </g>
  );
}

// ── Label pill ──
function Label({ x, y, text, color, anchor = "middle" }) {
  const w = text.length * 6 + 12;
  const lx = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  return (
    <g>
      <rect x={lx} y={y - 10} width={w} height={14} fill="rgba(0,0,0,0.8)"
        stroke={color} strokeWidth="0.5" rx="3" />
      <text x={x} y={y + 1} textAnchor={anchor} fontSize="9"
        fill={color} fontFamily="monospace" fontWeight="700">{text}</text>
    </g>
  );
}

// ── Circle marker ──
function Circle({ x, y, color, r = 8 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth="2" />
      <circle cx={x} cy={y} r={3} fill={color} />
    </g>
  );
}

// ── BOS arrow with label ──
function BOS({ x1, y, x2, color = TEAL }) {
  return (
    <g>
      <Arrow x1={x1} y1={y} x2={x2} y2={y} color={color} />
      <Label x={x1 + 4} y={y - 6} text="BOS" color={color} anchor="start" />
    </g>
  );
}

const patterns = {

  // ════════════════════════════════════════════
  // BULLISH REVERSAL
  // ════════════════════════════════════════════

  hammer: () => (
    <g>
      {/* Downtrend context */}
      <C x={38} t={28} b={48} wt={22} wb={55} color={R} />
      <C x={62} t={40} b={60} wt={34} wb={67} color={R} />
      <C x={86} t={52} b={72} wt={46} wb={79} color={R} />
      <C x={110} t={64} b={84} wt={58} wb={91} color={R} />

      {/* HAMMER — tiny body at top, long lower wick 3x body */}
      <C x={142} t={72} b={82} wt={69} wb={148} color={G} width={16} />

      {/* Entry circle */}
      <Circle x={142} y={77} color={G} />

      {/* Support zone */}
      <Zone x1={18} y1={140} x2={262} y2={155} color={TEAL} label="SUPPORT ZONE" />

      {/* Projection arrow */}
      <Arrow x1={158} y1={72} x2={240} y2={25} color={G} width={2.5} />

      {/* Labels */}
      <Label x={142} y={62} text="Hammer" color={G} />
      <Label x={142} y={160} text="Long wick = rejection" color={GOLD} />

      {/* Wick label */}
      <line x1={152} y1={110} x2={168} y2={110} stroke={GOLD} strokeWidth="1" strokeDasharray="3 2" />
      <text x={170} y={113} fontSize="8" fill={GOLD} fontFamily="monospace">3x body</text>
    </g>
  ),

  "bullish-engulfing": () => (
    <g>
      {/* Downtrend */}
      <C x={30} t={22} b={42} wt={16} wb={49} color={R} />
      <C x={55} t={35} b={55} wt={29} wb={62} color={R} />
      <C x={80} t={48} b={68} wt={42} wb={75} color={R} />
      <C x={105} t={62} b={82} wt={56} wb={89} color={R} />

      {/* Small bearish candle */}
      <C x={138} t={70} b={95} wt={64} wb={101} color={R} width={14} />
      <Label x={138} y={58} text="Small red" color={R} />

      {/* LARGE BULLISH ENGULFING */}
      <C x={172} t={52} b={108} wt={44} wb={116} color={G} width={18} />
      <Label x={172} y={40} text="Engulfs!" color={G} />

      {/* Entry circle */}
      <Circle x={172} y={80} color={G} />

      {/* Demand zone */}
      <Zone x1={18} y1={135} x2={262} y2={150} color={TEAL} label="DEMAND ZONE" />

      {/* Projection */}
      <Arrow x1={188} y1={52} x2={255} y2={18} color={G} width={2.5} />

      {/* BOS */}
      <BOS x1={20} y={88} x2={58} color={TEAL} />

      <Label x={140} y={162} text="Green body engulfs red body" color={GOLD} />
    </g>
  ),

  "tweezer-bottom": () => (
    <g>
      {/* Downtrend */}
      <C x={30} t={20} b={40} wt={14} wb={47} color={R} />
      <C x={55} t={32} b={52} wt={26} wb={59} color={R} />
      <C x={80} t={45} b={65} wt={39} wb={72} color={R} />

      {/* TWEEZER — identical lows */}
      <C x={118} t={55} b={85} wt={48} wb={128} color={R} width={14} />
      <C x={148} t={60} b={88} wt={54} wb={128} color={G} width={14} />

      {/* Support line at identical lows */}
      <line x1={18} y1={128} x2={262} y2={128} stroke={GOLD} strokeWidth="1.5" strokeDasharray="5 3" />
      <Label x={200} y={122} text="Same Low" color={GOLD} anchor="end" />

      {/* Entry circle */}
      <Circle x={148} y={74} color={G} />

      {/* Demand zone */}
      <Zone x1={18} y1={132} x2={262} y2={148} color={TEAL} label="SUPPORT ZONE" />

      {/* Projection */}
      <Arrow x1={162} y1={60} x2={240} y2={20} color={G} width={2.5} />

      <Label x={140} y={160} text="Same lows = buyers defending" color={GOLD} />
    </g>
  ),

  "morning-star": () => (
    <g>
      {/* Downtrend */}
      <C x={28} t={18} b={38} wt={12} wb={45} color={R} />
      <C x={52} t={30} b={50} wt={24} wb={57} color={R} />

      {/* Candle 1 — large bearish */}
      <C x={88} t={40} b={88} wt={33} wb={95} color={R} width={16} />
      <Label x={88} y={28} text="① Large" color={R} />

      {/* Candle 2 — small star */}
      <C x={128} t={96} b={106} wt={91} wb={111} color={GR} width={10} />
      <Label x={128} y={118} text="② Star" color={GOLD} />

      {/* Candle 3 — large bullish */}
      <C x={168} t={45} b={93} wt={38} wb={98} color={G} width={16} />
      <Label x={168} y={33} text="③ Bullish" color={G} />

      {/* Entry circle */}
      <Circle x={168} y={69} color={G} />

      {/* Demand zone */}
      <Zone x1={18} y1={130} x2={262} y2={145} color={TEAL} label="DEMAND ZONE" />

      {/* Projection */}
      <Arrow x1={184} y1={45} x2={255} y2={15} color={G} width={2.5} />

      <Label x={140} y={158} text="Red · Star · Green = reversal" color={GOLD} />
    </g>
  ),

  // ════════════════════════════════════════════
  // BEARISH REVERSAL
  // ════════════════════════════════════════════

  "shooting-star": () => (
    <g>
      {/* Uptrend */}
      <C x={30} t={118} b={138} wt={112} wb={144} color={G} />
      <C x={55} t={100} b={120} wt={94} wb={126} color={G} />
      <C x={80} t={82} b={102} wt={76} wb={108} color={G} />
      <C x={105} t={65} b={85} wt={59} wb={91} color={G} />

      {/* SHOOTING STAR — tiny body at bottom, long upper wick */}
      <C x={142} t={78} b={90} wt={22} wb={94} color={R} width={16} />
      <Label x={142} y={12} text="Shooting Star" color={R} />

      {/* Resistance zone */}
      <Zone x1={18} y1={18} x2={262} y2={32} color={RED} label="SUPPLY ZONE" />

      {/* Entry circle */}
      <Circle x={142} y={84} color={R} />

      {/* Projection down */}
      <Arrow x1={158} y1={88} x2={240} y2={148} color={R} width={2.5} />

      {/* Wick label */}
      <line x1={152} y1={55} x2={170} y2={55} stroke={GOLD} strokeWidth="1" strokeDasharray="3 2" />
      <text x={172} y={58} fontSize="8" fill={GOLD} fontFamily="monospace">3x body</text>

      <Label x={140} y={165} text="Long wick = buyers rejected" color={GOLD} />
    </g>
  ),

  "bearish-engulfing": () => (
    <g>
      {/* Uptrend */}
      <C x={30} t={118} b={138} wt={112} wb={144} color={G} />
      <C x={55} t={98} b={118} wt={92} wb={124} color={G} />
      <C x={80} t={78} b={98} wt={72} wb={104} color={G} />
      <C x={105} t={58} b={78} wt={52} wb={84} color={G} />

      {/* Small bullish */}
      <C x={138} t={42} b={68} wt={36} wb={74} color={G} width={14} />
      <Label x={138} y={30} text="Small green" color={G} />

      {/* LARGE BEARISH ENGULFING */}
      <C x={172} t={28} b={82} wt={20} wb={90} color={R} width={18} />
      <Label x={172} y={16} text="Engulfs!" color={R} />

      {/* Supply zone */}
      <Zone x1={18} y1={12} x2={262} y2={26} color={R} label="SUPPLY ZONE" />

      {/* Entry circle */}
      <Circle x={172} y={55} color={R} />

      {/* Projection down */}
      <Arrow x1={188} y1={82} x2={255} y2={148} color={R} width={2.5} />

      {/* BOS */}
      <BOS x1={20} y={72} x2={58} color={R} />

      <Label x={140} y={162} text="Red body engulfs green body" color={GOLD} />
    </g>
  ),

  "tweezer-top": () => (
    <g>
      {/* Uptrend */}
      <C x={30} t={118} b={138} wt={112} wb={144} color={G} />
      <C x={55} t={98} b={118} wt={92} wb={124} color={G} />
      <C x={80} t={78} b={98} wt={72} wb={104} color={G} />

      {/* TWEEZER — identical highs */}
      <C x={118} t={42} b={72} wt={18} wb={78} color={G} width={14} />
      <C x={148} t={40} b={70} wt={18} wb={76} color={R} width={14} />

      {/* Resistance line */}
      <line x1={18} y1={18} x2={262} y2={18} stroke={GOLD} strokeWidth="1.5" strokeDasharray="5 3" />
      <Label x={200} y={28} text="Same High" color={GOLD} anchor="end" />

      {/* Supply zone */}
      <Zone x1={18} y1={12} x2={262} y2={28} color={R} label="SUPPLY ZONE" />

      {/* Entry circle */}
      <Circle x={148} y={55} color={R} />

      {/* Projection down */}
      <Arrow x1={162} y1={70} x2={240} y2={148} color={R} width={2.5} />

      <Label x={140} y={162} text="Same highs = sellers defending" color={GOLD} />
    </g>
  ),

  "evening-star": () => (
    <g>
      {/* Uptrend */}
      <C x={28} t={118} b={138} wt={112} wb={144} color={G} />
      <C x={52} t={98} b={118} wt={92} wb={124} color={G} />

      {/* Candle 1 — large bullish */}
      <C x={88} t={52} b={100} wt={45} wb={107} color={G} width={16} />
      <Label x={88} y={40} text="① Large" color={G} />

      {/* Candle 2 — small star */}
      <C x={128} t={38} b={48} wt={33} wb={53} color={GR} width={10} />
      <Label x={128} y={25} text="② Star" color={GOLD} />

      {/* Supply zone */}
      <Zone x1={18} y1={18} x2={262} y2={32} color={R} label="SUPPLY ZONE" />

      {/* Candle 3 — large bearish */}
      <C x={168} t={55} b={103} wt={48} wb={110} color={R} width={16} />
      <Label x={168} y={43} text="③ Bearish" color={R} />

      {/* Entry circle */}
      <Circle x={168} y={79} color={R} />

      {/* Projection down */}
      <Arrow x1={184} y1={103} x2={255} y2={155} color={R} width={2.5} />

      <Label x={140} y={165} text="Green · Star · Red = reversal" color={GOLD} />
    </g>
  ),

  // ════════════════════════════════════════════
  // CONTINUATION PATTERNS
  // ════════════════════════════════════════════

  "bull-flag": () => (
    <g>
      {/* FLAGPOLE — strong move up */}
      <C x={32} t={110} b={130} wt={104} wb={136} color={G} />
      <C x={56} t={82} b={102} wt={76} wb={108} color={G} />
      <C x={80} t={54} b={74} wt={48} wb={80} color={G} />
      <C x={104} t={28} b={48} wt={22} wb={54} color={G} />
      <Label x={68} y={18} text="FLAGPOLE" color={G} />

      {/* FLAG — tight downward channel */}
      <C x={130} t={52} b={66} wt={48} wb={70} color={R} width={10} />
      <C x={150} t={58} b={72} wt={54} wb={76} color={R} width={10} />
      <C x={170} t={64} b={78} wt={60} wb={82} color={R} width={10} />

      {/* Flag channel lines */}
      <L pts={[[118,48],[132,52],[152,58],[172,64],[185,68]]} color={GOLD} width={1.5} />
      <L pts={[[118,70],[132,66],[152,72],[172,78],[185,82]]} color={GOLD} dash width={1.5} />
      <Label x={152} y={40} text="FLAG" color={GOLD} />

      {/* Entry circle at breakout */}
      <Circle x={185} y={65} color={G} />

      {/* BREAKOUT arrow */}
      <Arrow x1={185} y1={62} x2={258} y2={18} color={G} width={2.5} />
      <Label x={230} y={30} text="BREAKOUT" color={G} />

      {/* Measured move bracket */}
      <line x1={265} y1={18} x2={265} y2={65} stroke={GOLD} strokeWidth="1" strokeDasharray="3 2" />
      <line x1={260} y1={18} x2={270} y2={18} stroke={GOLD} strokeWidth="1" />
      <line x1={260} y1={65} x2={270} y2={65} stroke={GOLD} strokeWidth="1" />
      <text x={272} y={44} fontSize="8" fill={GOLD} fontFamily="monospace" transform="rotate(90,272,44)">Target</text>

      <Label x={140} y={165} text="Pole · Flag · Breakout ↑" color={GOLD} />
    </g>
  ),

  "bear-flag": () => (
    <g>
      {/* FLAGPOLE — strong move down */}
      <C x={32} t={28} b={48} wt={22} wb={54} color={R} />
      <C x={56} t={55} b={75} wt={49} wb={81} color={R} />
      <C x={80} t={82} b={102} wt={76} wb={108} color={R} />
      <C x={104} t={108} b={128} wt={102} wb={134} color={R} />
      <Label x={68} y={18} text="FLAGPOLE" color={R} />

      {/* FLAG — tight upward channel */}
      <C x={130} t={102} b={116} wt={98} wb={120} color={G} width={10} />
      <C x={150} t={96} b={110} wt={92} wb={114} color={G} width={10} />
      <C x={170} t={90} b={104} wt={86} wb={108} color={G} width={10} />

      {/* Flag channel lines */}
      <L pts={[[118,134],[132,120],[152,114],[172,108],[185,104]]} color={GOLD} width={1.5} />
      <L pts={[[118,120],[132,116],[152,110],[172,104],[185,100]]} color={GOLD} dash width={1.5} />
      <Label x={152} y={88} text="FLAG" color={GOLD} />

      {/* Entry circle */}
      <Circle x={185} y={102} color={R} />

      {/* BREAKDOWN arrow */}
      <Arrow x1={185} y1={106} x2={258} y2={155} color={R} width={2.5} />
      <Label x={230} y={148} text="BREAKDOWN" color={R} />

      <Label x={140} y={165} text="Pole · Flag · Breakdown ↓" color={GOLD} />
    </g>
  ),

  "ascending-triangle": () => (
    <g>
      {/* FLAT RESISTANCE */}
      <line x1={18} y1={38} x2={240} y2={38} stroke={R} strokeWidth="2" strokeDasharray="5 3" />
      <Label x={130} y={30} text="RESISTANCE" color={R} />

      {/* RISING SUPPORT trendline */}
      <L pts={[[18,148],[65,128],[112,108],[159,88],[200,68]]} color={G} width={2} />
      <Label x={50} y={145} text="Rising Support" color={G} />

      {/* Candles showing bounces */}
      <C x={45} t={110} b={128} wt={104} wb={148} color={G} />
      <C x={75} t={95} b={38} wt={89} wb={38} color={R} />
      <C x={105} t={80} b={98} wt={74} wb={126} color={G} />
      <C x={135} t={62} b={38} wt={56} wb={38} color={R} />
      <C x={165} t={50} b={68} wt={44} wb={90} color={G} />

      {/* Entry circle at breakout */}
      <Circle x={200} y={38} color={G} />

      {/* BREAKOUT arrow */}
      <Arrow x1={205} y1={35} x2={258} y2={10} color={G} width={2.5} />

      <Label x={140} y={165} text="Higher lows → Flat resistance" color={GOLD} />
    </g>
  ),

  "descending-triangle": () => (
    <g>
      {/* FLAT SUPPORT */}
      <line x1={18} y1={138} x2={240} y2={138} stroke={TEAL} strokeWidth="2" strokeDasharray="5 3" />
      <Label x={130} y={150} text="SUPPORT" color={TEAL} />

      {/* FALLING RESISTANCE trendline */}
      <L pts={[[18,32],[65,52],[112,72],[159,92],[200,112]]} color={R} width={2} />
      <Label x={50} y={42} text="Lower Highs" color={R} />

      {/* Candles */}
      <C x={45} t={34} b={52} wt={28} wb={56} color={R} />
      <C x={75} t={55} b={138} wt={49} wb={142} color={G} />
      <C x={105} t={74} b={92} wt={68} wb={96} color={R} />
      <C x={135} t={94} b={138} wt={88} wb={142} color={G} />
      <C x={165} t={112} b={130} wt={106} wb={134} color={R} />

      {/* Entry circle */}
      <Circle x={200} y={138} color={R} />

      {/* BREAKDOWN arrow */}
      <Arrow x1={205} y1={141} x2={258} y2={165} color={R} width={2.5} />

      <Label x={140} y={165} text="Lower highs → Flat support" color={GOLD} />
    </g>
  ),

  "bull-pennant": () => (
    <g>
      {/* POLE */}
      <C x={28} t={118} b={138} wt={112} wb={144} color={G} />
      <C x={50} t={90} b={110} wt={84} wb={116} color={G} />
      <C x={72} t={62} b={82} wt={56} wb={88} color={G} />
      <C x={94} t={36} b={56} wt={30} wb={62} color={G} />
      <Label x={62} y={24} text="POLE" color={G} />

      {/* PENNANT — converging lines */}
      <L pts={[[106,36],[125,44],[145,50],[162,55]]} color={GOLD} width={1.5} />
      <L pts={[[106,56],[125,54],[145,54],[162,55]]} color={GOLD} dash width={1.5} />
      <Label x={134} y={34} text="PENNANT" color={GOLD} />

      {/* Entry circle */}
      <Circle x={162} y={55} color={G} />

      {/* BREAKOUT */}
      <Arrow x1={165} y1={52} x2={255} y2={12} color={G} width={2.5} />

      <Label x={140} y={165} text="Pole · Pennant · Breakout ↑" color={GOLD} />
    </g>
  ),

  "bear-pennant": () => (
    <g>
      {/* POLE down */}
      <C x={28} t={28} b={48} wt={22} wb={54} color={R} />
      <C x={50} t={55} b={75} wt={49} wb={81} color={R} />
      <C x={72} t={82} b={102} wt={76} wb={108} color={R} />
      <C x={94} t={108} b={128} wt={102} wb={134} color={R} />
      <Label x={62} y={18} text="POLE" color={R} />

      {/* PENNANT — converging */}
      <L pts={[[106,108],[125,100],[145,96],[162,94]]} color={GOLD} width={1.5} />
      <L pts={[[106,128],[125,120],[145,116],[162,94]]} color={GOLD} dash width={1.5} />
      <Label x={134} y={90} text="PENNANT" color={GOLD} />

      {/* Entry circle */}
      <Circle x={162} y={94} color={R} />

      {/* BREAKDOWN */}
      <Arrow x1={165} y1={97} x2={255} y2={155} color={R} width={2.5} />

      <Label x={140} y={165} text="Pole · Pennant · Breakdown ↓" color={GOLD} />
    </g>
  ),

  // ════════════════════════════════════════════
  // TREND PATTERNS
  // ════════════════════════════════════════════

  uptrend: () => (
    <g>
      {/* Rising trendline */}
      <L pts={[[18,148],[55,122],[95,96],[135,70],[175,44]]} color={G} width={2} dash />

      {/* Candles with HH and HL labels */}
      <C x={38} t={108} b={122} wt={102} wb={148} color={G} />
      <C x={62} t={98} b={112} wt={92} wb={124} color={R} />
      <C x={86} t={78} b={92} wt={72} wb={104} color={G} />
      <C x={110} t={65} b={79} wt={59} wb={92} color={R} />
      <C x={134} t={48} b={62} wt={42} wb={72} color={G} />
      <C x={158} t={32} b={46} wt={26} wb={52} color={G} />

      {/* HH labels */}
      <Label x={86} y={66} text="HH" color={G} />
      <Label x={134} y={36} text="HH" color={G} />
      <Label x={158} y={20} text="HH" color={G} />

      {/* HL labels */}
      <Label x={62} y={120} text="HL" color={TEAL} />
      <Label x={110} y={87} text="HL" color={TEAL} />

      {/* BOS arrow */}
      <BOS x1={20} y={110} x2={55} color={TEAL} />

      <Label x={140} y={165} text="Higher Highs · Higher Lows" color={GOLD} />
    </g>
  ),

  downtrend: () => (
    <g>
      {/* Falling trendline */}
      <L pts={[[18,32],[55,58],[95,84],[135,110],[175,136]]} color={R} width={2} dash />

      {/* Candles */}
      <C x={38} t={18} b={32} wt={12} wb={38} color={R} />
      <C x={62} t={28} b={42} wt={22} wb={58} color={G} />
      <C x={86} t={44} b={58} wt={38} wb={84} color={R} />
      <C x={110} t={68} b={82} wt={62} wb={108} color={G} />
      <C x={134} t={94} b={108} wt={88} wb={134} color={R} />
      <C x={158} t={118} b={132} wt={112} wb={148} color={R} />

      {/* LH labels */}
      <Label x={38} y={8} text="LH" color={R} />
      <Label x={86} y={32} text="LH" color={R} />
      <Label x={134} y={82} text="LH" color={R} />

      {/* LL labels */}
      <Label x={62} y={50} text="LL" color={R} />
      <Label x={110} y={90} text="LL" color={R} />
      <Label x={158} y={140} text="LL" color={R} />

      {/* BOS */}
      <BOS x1={20} y={40} x2={55} color={R} />

      <Label x={140} y={165} text="Lower Highs · Lower Lows" color={GOLD} />
    </g>
  ),

  "sideways-range": () => (
    <g>
      {/* Resistance */}
      <line x1={18} y1={35} x2={262} y2={35} stroke={R} strokeWidth="1.5" strokeDasharray="5 3" />
      <Label x={240} y={28} text="RESISTANCE" color={R} anchor="end" />

      {/* Support */}
      <line x1={18} y1={135} x2={262} y2={135} stroke={TEAL} strokeWidth="1.5" strokeDasharray="5 3" />
      <Label x={240} y={148} text="SUPPORT" color={TEAL} anchor="end" />

      {/* Zone fill */}
      <rect x={18} y={35} width={244} height={100} fill="rgba(212,175,55,0.06)" />

      {/* Candles bouncing inside range */}
      <C x={42} t={50} b={78} wt={36} wb={134} color={G} />
      <C x={80} t={55} b={80} wt={36} wb={134} color={R} />
      <C x={118} t={48} b={76} wt={36} wb={134} color={G} />
      <C x={156} t={52} b={80} wt={36} wb={134} color={R} />
      <C x={194} t={50} b={75} wt={36} wb={134} color={G} />

      {/* Arrows showing bounces */}
      <Arrow x1={42} y1={50} x2={42} y2={38} color={R} />
      <Arrow x1={80} y1={120} x2={80} y2={132} color={TEAL} />

      <Label x={140} y={165} text="Buy support · Sell resistance" color={GOLD} />
    </g>
  ),

  // ════════════════════════════════════════════
  // LIQUIDITY PATTERNS
  // ════════════════════════════════════════════

  "stop-hunt": () => (
    <g>
      {/* Support level */}
      <line x1={18} y1={95} x2={262} y2={95} stroke={GOLD} strokeWidth="1.5" strokeDasharray="5 3" />
      <Label x={240} y={88} text="SUPPORT" color={GOLD} anchor="end" />

      {/* Candles approaching support */}
      <C x={32} t={48} b={68} wt={42} wb={74} color={G} />
      <C x={58} t={52} b={72} wt={46} wb={78} color={G} />
      <C x={84} t={58} b={78} wt={52} wb={84} color={R} />
      <C x={110} t={62} b={82} wt={56} wb={88} color={R} />

      {/* STOP HUNT — wick dips far below support */}
      <C x={145} t={68} b={88} wt={62} wb={148} color={R} width={14} />
      <Label x={145} y={158} text="STOPS TRIGGERED" color={R} />

      {/* Demand zone */}
      <Zone x1={18} y1={130} x2={262} y2={150} color={TEAL} label="DEMAND ZONE" />

      {/* REVERSAL */}
      <C x={182} t={42} b={62} wt={36} wb={68} color={G} width={14} />
      <Circle x={182} y={52} color={G} />
      <Arrow x1={198} y1={42} x2={255} y2={12} color={G} width={2.5} />

      {/* BOS */}
      <BOS x1={20} y={78} x2={58} color={TEAL} />

      <Label x={140} y={165} text="Sweeps stops → Reverses up" color={GOLD} />
    </g>
  ),

  "bull-trap": () => (
    <g>
      {/* Resistance */}
      <line x1={18} y1={58} x2={262} y2={58} stroke={R} strokeWidth="1.5" strokeDasharray="5 3" />
      <Label x={240} y={50} text="RESISTANCE" color={R} anchor="end" />

      {/* Supply zone */}
      <Zone x1={18} y1={38} x2={262} y2={58} color={R} label="SUPPLY ZONE" />

      {/* Candles approaching */}
      <C x={32} t={88} b={108} wt={82} wb={114} color={G} />
      <C x={58} t={72} b={92} wt={66} wb={98} color={G} />
      <C x={84} t={58} b={78} wt={52} wb={84} color={G} />

      {/* FALSE BREAKOUT above resistance */}
      <C x={118} t={38} b={55} wt={30} wb={60} color={G} width={14} />
      <Label x={118} y={20} text="FALSE BREAK" color={R} />

      {/* REVERSAL down — trap */}
      <C x={152} t={55} b={88} wt={49} wb={95} color={R} width={14} />
      <C x={182} t={88} b={122} wt={82} wb={128} color={R} width={14} />
      <Circle x={152} y={72} color={R} />
      <Arrow x1={198} y1={118} x2={255} y2={155} color={R} width={2.5} />

      <Label x={140} y={165} text="Breaks out → Reverses down" color={GOLD} />
    </g>
  ),

  "bear-trap": () => (
    <g>
      {/* Support */}
      <line x1={18} y1={110} x2={262} y2={110} stroke={TEAL} strokeWidth="1.5" strokeDasharray="5 3" />
      <Label x={240} y={122} text="SUPPORT" color={TEAL} anchor="end" />

      {/* Demand zone */}
      <Zone x1={18} y1={110} x2={262} y2={130} color={TEAL} label="DEMAND ZONE" />

      {/* Candles approaching */}
      <C x={32} t={52} b={72} wt={46} wb={78} color={R} />
      <C x={58} t={68} b={88} wt={62} wb={94} color={R} />
      <C x={84} t={84} b={104} wt={78} wb={110} color={R} />

      {/* FALSE BREAKDOWN below support */}
      <C x={118} t={112} b={132} wt={106} wb={155} color={R} width={14} />
      <Label x={118} y={165} text="FALSE BREAK" color={TEAL} />

      {/* REVERSAL up — bear trap */}
      <C x={152} t={72} b={105} wt={66} wb={112} color={G} width={14} />
      <C x={182} t={42} b={75} wt={36} wb={78} color={G} width={14} />
      <Circle x={152} y={88} color={G} />
      <Arrow x1={198} y1={42} x2={255} y2={12} color={G} width={2.5} />

      <Label x={140} y={165} text="Breaks down → Reverses up" color={GOLD} />
    </g>
  ),

  // ════════════════════════════════════════════
  // DOJI LIBRARY
  // ════════════════════════════════════════════

  "standard-doji": () => (
    <g>
      {/* Context candles */}
      <C x={45} t={75} b={95} wt={69} wb={101} color={G} />
      <C x={75} t={65} b={85} wt={59} wb={91} color={G} />

      {/* DOJI */}
      <line x1={110} y1={28} x2={110} y2={128} stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x={94} y={76} width={32} height={4} fill={GOLD} rx="2" />
      <Label x={110} y={18} text="DOJI" color={GOLD} />

      {/* Labels */}
      <line x1={125} y1={28} x2={145} y2={28} stroke={GOLD} strokeWidth="1" strokeDasharray="3 2" />
      <text x={147} y={31} fontSize="8" fill={GOLD} fontFamily="monospace">Upper wick</text>
      <line x1={125} y1={128} x2={145} y2={128} stroke={GOLD} strokeWidth="1" strokeDasharray="3 2" />
      <text x={147} y={131} fontSize="8" fill={GOLD} fontFamily="monospace">Lower wick</text>
      <line x1={125} y1={78} x2={145} y2={78} stroke={GOLD} strokeWidth="1" strokeDasharray="3 2" />
      <text x={147} y={81} fontSize="8" fill={GOLD} fontFamily="monospace">Open = Close</text>

      <Label x={110} y={148} text="Indecision" color={GOLD} />
      <Label x={110} y={162} text="Wait for confirmation" color={GR} />
    </g>
  ),

  "gravestone-doji": () => (
    <g>
      {/* Context — uptrend */}
      <C x={35} t={108} b={122} wt={102} wb={128} color={G} />
      <C x={62} t={88} b={102} wt={82} wb={108} color={G} />
      <C x={89} t={68} b={82} wt={62} wb={88} color={G} />

      {/* GRAVESTONE — long upper wick, no lower wick */}
      <line x1={125} y1={22} x2={125} y2={88} stroke={WICK} strokeWidth="2.5" strokeLinecap="round" />
      <rect x={109} y={86} width={32} height={4} fill={R} rx="2" />
      <Label x={125} y={12} text="Gravestone Doji" color={R} />

      {/* Supply zone */}
      <Zone x1={18} y1={15} x2={262} y2={30} color={R} label="SUPPLY ZONE" />

      {/* Labels */}
      <line x1={140} y1={55} x2={162} y2={55} stroke={R} strokeWidth="1" strokeDasharray="3 2" />
      <text x={164} y={58} fontSize="8" fill={R} fontFamily="monospace">Buyers rejected</text>

      {/* Arrow down */}
      <Arrow x1={148} y1={88} x2={215} y2={148} color={R} width={2} />

      <Label x={140} y={165} text="Open = Close at LOW" color={R} />
    </g>
  ),

  "dragonfly-doji": () => (
    <g>
      {/* Context — downtrend */}
      <C x={35} t={22} b={36} wt={16} wb={42} color={R} />
      <C x={62} t={35} b={49} wt={29} wb={55} color={R} />
      <C x={89} t={48} b={62} wt={42} wb={68} color={R} />

      {/* DRAGONFLY — long lower wick, no upper wick */}
      <rect x={109} y={60} width={32} height={4} fill={G} rx="2" />
      <line x1={125} y1={64} x2={125} y2={138} stroke={WICK} strokeWidth="2.5" strokeLinecap="round" />
      <Label x={125} y={50} text="Dragonfly Doji" color={G} />

      {/* Demand zone */}
      <Zone x1={18} y1={130} x2={262} y2={148} color={TEAL} label="DEMAND ZONE" />

      {/* Labels */}
      <line x1={140} y1={100} x2={162} y2={100} stroke={G} strokeWidth="1" strokeDasharray="3 2" />
      <text x={164} y={103} fontSize="8" fill={G} fontFamily="monospace">Sellers rejected</text>

      {/* Arrow up */}
      <Arrow x1={148} y1={60} x2={215} y2={18} color={G} width={2} />

      <Label x={140} y={162} text="Open = Close at HIGH" color={G} />
    </g>
  ),

  "long-legged-doji": () => (
    <g>
      <line x1={100} y1={15} x2={100} y2={148} stroke={WICK} strokeWidth="2.5" strokeLinecap="round" />
      <rect x={82} y={79} width={36} height={5} fill={GOLD} rx="2" />
      <Label x={100} y={8} text="Long-Legged Doji" color={GOLD} />

      <line x1={118} y1={15} x2={148} y2={15} stroke={GOLD} strokeWidth="1" strokeDasharray="3 2" />
      <text x={150} y={18} fontSize="8" fill={GOLD} fontFamily="monospace">Equal wicks</text>
      <line x1={118} y1={148} x2={148} y2={148} stroke={GOLD} strokeWidth="1" strokeDasharray="3 2" />
      <text x={150} y={151} fontSize="8" fill={GOLD} fontFamily="monospace">Equal wicks</text>
      <line x1={118} y1={81} x2={148} y2={81} stroke={GOLD} strokeWidth="1" strokeDasharray="3 2" />
      <text x={150} y={84} fontSize="8" fill={GOLD} fontFamily="monospace">Open = Close</text>

      <Label x={100} y={162} text="Extreme indecision" color={GOLD} />
    </g>
  ),

  "rickshaw-man-doji": () => (
    <g>
      <line x1={100} y1={12} x2={100} y2={148} stroke={WICK} strokeWidth="2.5" strokeLinecap="round" />
      <rect x={80} y={76} width={40} height={8} fill={GOLD} rx="3" />
      <Label x={100} y={8} text="Rickshaw Man" color={GOLD} />
      <Label x={100} y={162} text="Maximum indecision" color={GOLD} />
      <text x={148} y={82} fontSize="8" fill={GOLD} fontFamily="monospace">← Body at midpoint</text>
    </g>
  ),

  "four-price-doji": () => (
    <g>
      <rect x={60} y={78} width={80} height={4} fill={WICK} rx="2" />
      <Label x={100} y={60} text="Four Price Doji" color={WICK} />
      <text x={100} y={105} textAnchor="middle" fontSize="12" fill={WICK} fontFamily="monospace" fontWeight="700">O = H = L = C</text>
      <text x={100} y={125} textAnchor="middle" fontSize="10" fill={GR} fontFamily="monospace">No price movement at all</text>
      <Label x={100} y={162} text="Complete market freeze" color={GR} />
    </g>
  ),

  "dragonfly-at-support": () => (
    <g>
      {/* Downtrend into support */}
      <C x={28} t={22} b={36} wt={16} wb={42} color={R} />
      <C x={52} t={35} b={49} wt={29} wb={55} color={R} />
      <C x={76} t={48} b={62} wt={42} wb={68} color={R} />

      {/* Support line */}
      <line x1={18} y1={98} x2={262} y2={98} stroke={GOLD} strokeWidth="1.5" strokeDasharray="5 3" />

      {/* DRAGONFLY AT SUPPORT */}
      <rect x={100} y={95} width={28} height={5} fill={G} rx="2" />
      <line x1={114} y1={100} x2={114} y2={148} stroke={WICK} strokeWidth="2.5" strokeLinecap="round" />

      {/* Demand zone */}
      <Zone x1={18} y1={130} x2={262} y2={148} color={TEAL} label="DEMAND ZONE" />

      {/* Circle entry */}
      <Circle x={114} y={97} color={G} />

      {/* Projection up */}
      <Arrow x1={130} y1={90} x2={240} y2={28} color={G} width={2.5} />

      <Label x={100} y={85} text="SUPPORT" color={GOLD} />
      <Label x={140} y={165} text="Dragonfly at support = strong buy" color={GOLD} />
    </g>
  ),

  "gravestone-at-resistance": () => (
    <g>
      {/* Uptrend into resistance */}
      <C x={28} t={118} b={132} wt={112} wb={138} color={G} />
      <C x={52} t={102} b={116} wt={96} wb={122} color={G} />
      <C x={76} t={86} b={100} wt={80} wb={106} color={G} />

      {/* Resistance line */}
      <line x1={18} y1={58} x2={262} y2={58} stroke={GOLD} strokeWidth="1.5" strokeDasharray="5 3" />

      {/* GRAVESTONE AT RESISTANCE */}
      <line x1={114} y1={18} x2={114} y2={55} stroke={WICK} strokeWidth="2.5" strokeLinecap="round" />
      <rect x={100} y={53} width={28} height={5} fill={R} rx="2" />

      {/* Supply zone */}
      <Zone x1={18} y1={38} x2={262} y2={58} color={R} label="SUPPLY ZONE" />

      {/* Circle entry */}
      <Circle x={114} y={55} color={R} />

      {/* Projection down */}
      <Arrow x1={130} y1={62} x2={240} y2={148} color={R} width={2.5} />

      <Label x={100} y={72} text="RESISTANCE" color={GOLD} />
      <Label x={140} y={165} text="Gravestone at resistance = strong sell" color={GOLD} />
    </g>
  ),
};

export default function PatternSVG({ patternId }) {
  const draw = patterns[patternId];
  if (!draw) return null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden="true">
      <rect width={W} height={H} fill="rgba(4,10,20,0.95)" rx="12" />
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map(f => (
        <line key={f} x1={18} y1={H * f} x2={W - 18} y2={H * f}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      {draw()}
    </svg>
  );
}