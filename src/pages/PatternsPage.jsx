import React, { useState, useEffect, useRef } from "react";

const GOLD = "#d4af37";
const TEAL = "#26a69a";
const RED = "#ef5350";
const PURPLE = "#a78bfa";
const BLUE = "#3b82f6";

// ─────────────────────────────────────────────
// PATTERN DATA — Batch 1 (Patterns 1-28)
// ─────────────────────────────────────────────
const PATTERNS = [
  {
    id: 1, name: "Bullish Engulfing", level: "Beginner",
    category: "Single Candle", signal: "Bullish Reversal", signalColor: TEAL,
    description: "A large bullish candle completely engulfs the previous bearish candle. Signals that buyers have overwhelmed sellers and a reversal is likely.",
    entry: "Open of next candle after the engulfing pattern forms",
    stop: "Below the low of the engulfing candle",
    target: "1.5-2x the height of the pattern",
    candles: [
      // Downtrend establishing context
      {o:240,c:232,h:242,l:230,bull:false},
      {o:232,c:224,h:234,l:222,bull:false},
      {o:224,c:216,h:226,l:214,bull:false},
      {o:216,c:208,h:218,l:206,bull:false},
      {o:208,c:200,h:210,l:198,bull:false},
      // Small bearish candle — the one that gets engulfed
      {o:200,c:194,h:202,l:192,bull:false},
      // THE ENGULFING — opens well below prev close, closes well above prev open
      {o:190,c:204,h:206,l:188,bull:true},
      // Confirmation and continuation up
      {o:204,c:212,h:214,l:202,bull:true},
      {o:212,c:220,h:222,l:210,bull:true},
      {o:220,c:228,h:230,l:218,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:5,offset:-18,text:'Small Bearish',color:RED},
      {type:'label',candleIdx:6,offset:-18,text:'ENGULFS IT ↑',color:TEAL},
      {type:'bracket',start:5,end:6,label:'Engulfing Pattern'},
    ]
  },
  {
    id: 2, name: "Hammer", level: "Beginner",
    category: "Single Candle", signal: "Bullish Reversal", signalColor: TEAL,
    description: "A candle with a small body at the top and a long lower wick (at least 2x the body). Signals buyers violently rejected lower prices — reversal likely.",
    entry: "Above the high of the hammer candle",
    stop: "Below the tip of the hammer wick",
    target: "Previous swing high",
    candles: [
      // Downtrend
      {o:240,c:230,h:242,l:228,bull:false},
      {o:230,c:220,h:232,l:218,bull:false},
      {o:220,c:210,h:222,l:208,bull:false},
      {o:210,c:200,h:212,l:198,bull:false},
      {o:200,c:192,h:202,l:190,bull:false},
      // THE HAMMER — tiny body at top, wick is 3x body going way down
      {o:192,c:195,h:196,l:174,bull:true},
      // Confirmation — strong green candle
      {o:195,c:206,h:208,l:194,bull:true},
      {o:206,c:216,h:218,l:204,bull:true},
      {o:216,c:226,h:228,l:214,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:5,offset:-35,text:'← Long wick = rejection',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'Confirmed ✓',color:GOLD},
    ]
  },
  {
    id: 3, name: "Inverted Hammer", level: "Beginner",
    category: "Single Candle", signal: "Bullish Reversal", signalColor: TEAL,
    description: "Small body at bottom, long upper wick at the BOTTOM of a downtrend. Bulls tried to push higher — sellers pushed back but couldn't close low. Needs confirmation.",
    entry: "Above the high of the next bullish confirmation candle",
    stop: "Below the low of the inverted hammer",
    target: "Previous swing high",
    candles: [
      {o:240,c:230,h:242,l:228,bull:false},
      {o:230,c:220,h:232,l:218,bull:false},
      {o:220,c:210,h:222,l:208,bull:false},
      {o:210,c:200,h:212,l:198,bull:false},
      {o:200,c:192,h:202,l:190,bull:false},
      // INVERTED HAMMER — tiny body at bottom, long upper wick
      {o:190,c:192,h:208,l:189,bull:true},
      // Confirmation needed
      {o:192,c:202,h:204,l:191,bull:true},
      {o:202,c:213,h:215,l:200,bull:true},
      {o:213,c:222,h:224,l:211,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:5,offset:-32,text:'Upper wick = bulls tried',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'Confirm needed ✓',color:GOLD},
    ]
  },
  {
    id: 4, name: "Dragonfly Doji", level: "Beginner",
    category: "Single Candle", signal: "Bullish Reversal", signalColor: TEAL,
    description: "Open AND close are at the very TOP of the candle with a massive lower wick. Bulls completely rejected the selloff. One of the strongest single-candle reversals.",
    entry: "Above the high of the dragonfly doji",
    stop: "Below the tip of the long lower wick",
    target: "1.5-2x the wick length projected upward",
    candles: [
      {o:240,c:230,h:242,l:228,bull:false},
      {o:230,c:220,h:232,l:218,bull:false},
      {o:220,c:210,h:222,l:208,bull:false},
      {o:210,c:200,h:212,l:198,bull:false},
      // DRAGONFLY — open = close at top, massive lower wick
      {o:198,c:198,h:199,l:176,bull:true},
      // Strong reversal follows
      {o:198,c:210,h:212,l:197,bull:true},
      {o:210,c:222,h:224,l:208,bull:true},
      {o:222,c:232,h:234,l:220,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-38,text:'Open = Close at top',color:TEAL},
      {type:'label',candleIdx:4,offset:-52,text:'Massive lower wick ↓',color:GOLD},
    ]
  },
  {
    id: 5, name: "Bullish Marubozu", level: "Beginner",
    category: "Single Candle", signal: "Bullish Continuation", signalColor: TEAL,
    description: "A full bullish candle with NO wicks at all. Opens at the absolute low, closes at the absolute high. Total buyer domination from open to close. Pure momentum.",
    entry: "Open of the very next candle",
    stop: "Below the open of the Marubozu (no mercy zone)",
    target: "Measured move equal to the Marubozu body length",
    candles: [
      // Base — slight consolidation before
      {o:190,c:194,h:196,l:189,bull:true},
      {o:194,c:198,h:200,l:193,bull:true},
      {o:198,c:195,h:200,l:194,bull:false},
      {o:195,c:199,h:201,l:194,bull:true},
      // THE MARUBOZU — open=low, close=high, ZERO wicks
      {o:197,c:218,h:218,l:197,bull:true},
      // Continuation momentum
      {o:218,c:226,h:228,l:217,bull:true},
      {o:226,c:234,h:236,l:225,bull:true},
      {o:234,c:240,h:242,l:233,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'NO wicks — pure power',color:TEAL},
    ]
  },
  {
    id: 6, name: "Piercing Pattern", level: "Beginner",
    category: "Single Candle", signal: "Bullish Reversal", signalColor: TEAL,
    description: "After a large bearish candle, the next candle opens BELOW the low then closes above the MIDPOINT of the bearish candle. Buyers pierced through seller territory.",
    entry: "Above the high of the piercing candle",
    stop: "Below the low of the piercing candle",
    target: "Top of the prior bearish candle and beyond",
    candles: [
      {o:238,c:228,h:240,l:226,bull:false},
      {o:228,c:218,h:230,l:216,bull:false},
      {o:218,c:208,h:220,l:206,bull:false},
      {o:208,c:198,h:210,l:196,bull:false},
      // Large bearish candle
      {o:200,c:184,h:202,l:182,bull:false},
      // PIERCING — opens below low (182), closes above midpoint (192)
      {o:180,c:194,h:196,l:179,bull:true},
      {o:194,c:204,h:206,l:193,bull:true},
      {o:204,c:214,h:216,l:203,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Large bearish',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Pierces midpoint ↑',color:TEAL},
    ]
  },
  {
    id: 7, name: "Bearish Engulfing", level: "Beginner",
    category: "Single Candle", signal: "Bearish Reversal", signalColor: RED,
    description: "A large bearish candle completely engulfs the previous bullish candle. Sellers overwhelmed buyers in one candle. Strong reversal signal at the top of an uptrend.",
    entry: "Open of the next candle after engulfing forms",
    stop: "Above the high of the engulfing candle",
    target: "1.5-2x the pattern height below entry",
    candles: [
      // Uptrend
      {o:180,c:190,h:192,l:178,bull:true},
      {o:190,c:200,h:202,l:188,bull:true},
      {o:200,c:210,h:212,l:198,bull:true},
      {o:210,c:220,h:222,l:208,bull:true},
      {o:220,c:230,h:232,l:218,bull:true},
      // Small bullish before engulfing
      {o:230,c:236,h:238,l:228,bull:true},
      // THE ENGULFING — opens above, closes well below small bullish open
      {o:238,c:224,h:240,l:222,bull:false},
      // Continuation down
      {o:224,c:214,h:226,l:212,bull:false},
      {o:214,c:204,h:216,l:202,bull:false},
      {o:204,c:194,h:206,l:192,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:5,offset:-18,text:'Small bullish',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'ENGULFS IT ↓',color:RED},
      {type:'bracket',start:5,end:6,label:'Engulfing Pattern'},
    ]
  },
  {
    id: 8, name: "Shooting Star", level: "Beginner",
    category: "Single Candle", signal: "Bearish Reversal", signalColor: RED,
    description: "Small body at the BOTTOM with a long upper wick at the TOP of an uptrend. Buyers pushed hard but got completely rejected. Sellers took over by close.",
    entry: "Below the low of the shooting star candle",
    stop: "Above the tip of the upper wick",
    target: "Previous swing low",
    candles: [
      // Uptrend
      {o:180,c:190,h:192,l:178,bull:true},
      {o:190,c:200,h:202,l:188,bull:true},
      {o:200,c:210,h:212,l:198,bull:true},
      {o:210,c:220,h:222,l:208,bull:true},
      // SHOOTING STAR — tiny body at bottom, upper wick 3x body
      {o:220,c:218,h:238,l:217,bull:false},
      // Sellers confirm
      {o:218,c:208,h:220,l:206,bull:false},
      {o:208,c:198,h:210,l:196,bull:false},
      {o:198,c:188,h:200,l:186,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-35,text:'Buyers rejected hard ↑',color:RED},
      {type:'label',candleIdx:4,offset:-20,text:'Tiny body at bottom',color:GOLD},
    ]
  },
  {
    id: 9, name: "Hanging Man", level: "Beginner",
    category: "Single Candle", signal: "Bearish Reversal", signalColor: RED,
    description: "Same shape as Hammer but at the TOP of an uptrend. Small body at top, long lower wick. Sellers tested much lower prices — a warning that bears are waking up.",
    entry: "Below the low of the confirmation bearish candle",
    stop: "Above the high of the hanging man",
    target: "Previous swing low",
    candles: [
      // Uptrend
      {o:180,c:190,h:192,l:178,bull:true},
      {o:190,c:200,h:202,l:188,bull:true},
      {o:200,c:210,h:212,l:198,bull:true},
      {o:210,c:220,h:222,l:208,bull:true},
      // HANGING MAN — small body at top, long lower wick
      {o:220,c:222,h:223,l:204,bull:true},
      // Bearish confirmation
      {o:222,c:212,h:224,l:210,bull:false},
      {o:212,c:202,h:214,l:200,bull:false},
      {o:202,c:192,h:204,l:190,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-32,text:'Bears tested low ↓',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Confirm bearish ✓',color:GOLD},
    ]
  },
  {
    id: 10, name: "Gravestone Doji", level: "Beginner",
    category: "Single Candle", signal: "Bearish Reversal", signalColor: RED,
    description: "Open AND close at the BOTTOM with a massive upper wick. Bears completely rejected the rally. Mirror image of the Dragonfly Doji — one of the strongest top signals.",
    entry: "Below the low of the gravestone doji",
    stop: "Above the tip of the upper wick",
    target: "1.5-2x the wick length projected downward",
    candles: [
      // Uptrend
      {o:180,c:190,h:192,l:178,bull:true},
      {o:190,c:200,h:202,l:188,bull:true},
      {o:200,c:210,h:212,l:198,bull:true},
      {o:210,c:220,h:222,l:208,bull:true},
      // GRAVESTONE — open = close at bottom, massive upper wick
      {o:220,c:220,h:240,l:219,bull:false},
      // Strong reversal follows
      {o:220,c:210,h:222,l:208,bull:false},
      {o:210,c:200,h:212,l:198,bull:false},
      {o:200,c:190,h:202,l:188,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-38,text:'Open = Close at bottom',color:RED},
      {type:'label',candleIdx:4,offset:-52,text:'Massive upper wick ↑',color:GOLD},
    ]
  },
  {
    id: 11, name: "Bearish Marubozu", level: "Beginner",
    category: "Single Candle", signal: "Bearish Continuation", signalColor: RED,
    description: "Full bearish candle with NO wicks. Opens at the absolute high, closes at the absolute low. Total seller domination from open to close. Pure bearish momentum.",
    entry: "Open of the very next candle",
    stop: "Above the open of the Marubozu",
    target: "Measured move equal to the Marubozu body length below",
    candles: [
      {o:240,c:236,h:242,l:234,bull:false},
      {o:236,c:232,h:238,l:230,bull:false},
      {o:232,c:236,h:238,l:231,bull:true},
      {o:236,c:232,h:238,l:230,bull:false},
      // THE MARUBOZU — open=high, close=low, ZERO wicks
      {o:234,c:212,h:234,l:212,bull:false},
      // Continuation momentum
      {o:212,c:204,h:214,l:202,bull:false},
      {o:204,c:196,h:206,l:194,bull:false},
      {o:196,c:188,h:198,l:186,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'NO wicks — pure seller power',color:RED},
    ]
  },
  {
    id: 12, name: "Dark Cloud Cover", level: "Beginner",
    category: "Single Candle", signal: "Bearish Reversal", signalColor: RED,
    description: "After a large bullish candle, the next opens ABOVE the high then closes below the MIDPOINT of the bullish candle. Sellers invaded buyer territory. Bearish reversal incoming.",
    entry: "Below the low of the dark cloud candle",
    stop: "Above the high of the dark cloud candle",
    target: "Bottom of the prior bullish candle and beyond",
    candles: [
      {o:180,c:190,h:192,l:178,bull:true},
      {o:190,c:200,h:202,l:188,bull:true},
      {o:200,c:210,h:212,l:198,bull:true},
      // Large bullish candle
      {o:208,c:226,h:228,l:206,bull:true},
      // DARK CLOUD — opens above high (230), closes below midpoint (217)
      {o:230,c:215,h:231,l:213,bull:false},
      {o:215,c:205,h:217,l:203,bull:false},
      {o:205,c:195,h:207,l:193,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Large bullish',color:TEAL},
      {type:'label',candleIdx:4,offset:-18,text:'Closes below midpoint ↓',color:RED},
    ]
  },
  {
    id: 13, name: "Doji", level: "Beginner",
    category: "Single Candle", signal: "Indecision", signalColor: GOLD,
    description: "Open and close at virtually the same price with wicks above and below. Perfect equilibrium between buyers and sellers. The CONTEXT tells you the next direction.",
    entry: "Wait for the confirmation candle — do not trade the Doji itself",
    stop: "Beyond the Doji wick in the opposite direction of your trade",
    target: "Based on trend direction and confirmation candle",
    candles: [
      {o:200,c:207,h:209,l:198,bull:true},
      {o:207,c:214,h:216,l:205,bull:true},
      {o:214,c:210,h:216,l:208,bull:false},
      // DOJI — open very nearly equals close
      {o:210,c:210,h:220,l:200,bull:true},
      // Resolution — bullish in this context
      {o:210,c:218,h:220,l:209,bull:true},
      {o:218,c:226,h:228,l:217,bull:true},
      {o:226,c:234,h:236,l:225,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-32,text:'Open ≈ Close',color:GOLD},
      {type:'label',candleIdx:3,offset:-45,text:'Indecision ⚡',color:GOLD},
      {type:'label',candleIdx:4,offset:-18,text:'Context decides →',color:TEAL},
    ]
  },
  {
    id: 14, name: "Long-Legged Doji", level: "Beginner",
    category: "Single Candle", signal: "Indecision", signalColor: GOLD,
    description: "A Doji with extremely long wicks on BOTH sides. Both bulls and bears fought intensely but ended in a draw. Massive volatility signal — a big move is coming.",
    entry: "Wait for a strong breakout candle above or below the Doji range",
    stop: "Opposite end of the Doji wick range",
    target: "Equal to the total wick length in the breakout direction",
    candles: [
      {o:200,c:207,h:209,l:198,bull:true},
      {o:207,c:214,h:216,l:205,bull:true},
      {o:214,c:210,h:216,l:208,bull:false},
      // LONG-LEGGED DOJI — equal open/close, extreme wicks both ways
      {o:210,c:210,h:230,l:190,bull:true},
      {o:210,c:218,h:220,l:209,bull:true},
      {o:218,c:228,h:230,l:217,bull:true},
      {o:228,c:236,h:238,l:227,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-42,text:'Epic battle — no winner',color:GOLD},
      {type:'label',candleIdx:4,offset:-18,text:'Breakout incoming ⚡',color:TEAL},
    ]
  },
  {
    id: 15, name: "Spinning Top", level: "Beginner",
    category: "Single Candle", signal: "Indecision", signalColor: GOLD,
    description: "Small body in the middle with equal-length wicks above and below. Market is pausing and deciding. Often signals trend continuation after a brief rest.",
    entry: "Wait for the next candle to break above the high or below the low",
    stop: "Opposite end of the spinning top",
    target: "Prior trend continuation — measured move",
    candles: [
      {o:198,c:206,h:208,l:196,bull:true},
      {o:206,c:214,h:216,l:204,bull:true},
      {o:214,c:210,h:216,l:208,bull:false},
      // SPINNING TOP — small body, equal upper and lower wicks
      {o:210,c:214,h:222,l:202,bull:true},
      // Continuation
      {o:214,c:222,h:224,l:213,bull:true},
      {o:222,c:230,h:232,l:221,bull:true},
      {o:230,c:238,h:240,l:229,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-30,text:'Small body = pause',color:GOLD},
      {type:'label',candleIdx:4,offset:-18,text:'Trend resumes →',color:TEAL},
    ]
  },
  {
    id: 16, name: "High Wave Candle", level: "Beginner",
    category: "Single Candle", signal: "Indecision", signalColor: GOLD,
    description: "Extreme Spinning Top — tiny body with very long wicks in BOTH directions. The market violently moved up AND down but closed nearly where it opened. Maximum uncertainty.",
    entry: "Only after an extremely strong breakout candle — not before",
    stop: "Beyond the full wick range",
    target: "Equal to the wick length in the confirmed direction",
    candles: [
      {o:205,c:212,h:214,l:203,bull:true},
      {o:212,c:218,h:220,l:210,bull:true},
      {o:218,c:214,h:220,l:212,bull:false},
      // HIGH WAVE — tiny body, extreme wicks both ways
      {o:214,c:215,h:236,l:194,bull:true},
      // Breakout after the chaos
      {o:215,c:224,h:226,l:214,bull:true},
      {o:224,c:234,h:236,l:223,bull:true},
      {o:234,c:242,h:244,l:233,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-45,text:'Extreme volatility',color:GOLD},
      {type:'label',candleIdx:3,offset:-58,text:'Tiny body inside chaos',color:GOLD},
    ]
  },
  {
    id: 17, name: "Morning Star", level: "Beginner",
    category: "Multi Candle", signal: "Bullish Reversal", signalColor: TEAL,
    description: "3-candle bottom reversal: (1) Large bearish candle, (2) Small star candle gaps down — indecision at the low, (3) Large bullish closes above the midpoint of candle 1. Dawn after darkness.",
    entry: "Above the close of the third (bullish) candle",
    stop: "Below the low of the middle star candle",
    target: "Back to the top of candle 1 and beyond",
    candles: [
      {o:240,c:230,h:242,l:228,bull:false},
      {o:230,c:220,h:232,l:218,bull:false},
      {o:220,c:210,h:222,l:208,bull:false},
      {o:210,c:200,h:212,l:198,bull:false},
      // CANDLE 1 — large bearish
      {o:202,c:186,h:204,l:184,bull:false},
      // CANDLE 2 — small star, gaps down, shows indecision
      {o:183,c:184,h:187,l:181,bull:true},
      // CANDLE 3 — large bullish, closes above midpoint of candle 1
      {o:184,c:198,h:200,l:183,bull:true},
      // Continuation
      {o:198,c:208,h:210,l:197,bull:true},
      {o:208,c:218,h:220,l:207,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'① Big bearish',color:RED},
      {type:'label',candleIdx:5,offset:-22,text:'② Star',color:GOLD},
      {type:'label',candleIdx:6,offset:-18,text:'③ Big bullish',color:TEAL},
      {type:'bracket',start:4,end:6,label:'Morning Star'},
    ]
  },
  {
    id: 18, name: "Morning Doji Star", level: "Intermediate",
    category: "Multi Candle", signal: "Bullish Reversal", signalColor: TEAL,
    description: "Like the Morning Star but the middle candle is a Doji — perfect standoff at the bottom. Even stronger signal because the indecision is absolute before the bullish surge.",
    entry: "Above the close of the third candle",
    stop: "Below the low of the Doji",
    target: "Previous swing high",
    candles: [
      {o:240,c:230,h:242,l:228,bull:false},
      {o:230,c:219,h:232,l:217,bull:false},
      {o:219,c:208,h:221,l:206,bull:false},
      {o:208,c:196,h:210,l:194,bull:false},
      // CANDLE 1 — large bearish
      {o:198,c:182,h:200,l:180,bull:false},
      // CANDLE 2 — DOJI, open = close exactly
      {o:180,c:180,h:184,l:176,bull:true},
      // CANDLE 3 — strong bullish confirmation
      {o:181,c:196,h:198,l:180,bull:true},
      {o:196,c:208,h:210,l:195,bull:true},
      {o:208,c:220,h:222,l:207,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'① Large bearish',color:RED},
      {type:'label',candleIdx:5,offset:-28,text:'② Doji = perfect standoff',color:GOLD},
      {type:'label',candleIdx:6,offset:-18,text:'③ Bullish surge',color:TEAL},
      {type:'bracket',start:4,end:6,label:'Morning Doji Star'},
    ]
  },
  {
    id: 19, name: "Three White Soldiers", level: "Beginner",
    category: "Multi Candle", signal: "Bullish Reversal", signalColor: TEAL,
    description: "Three consecutive large bullish candles, each opening INSIDE the prior body and closing at a new high. An army of buyers marching higher. One of the most powerful reversal signals.",
    entry: "Open of the candle after the third soldier",
    stop: "Below the low of the first soldier",
    target: "Measured move equal to the three-candle total range",
    candles: [
      {o:240,c:230,h:242,l:228,bull:false},
      {o:230,c:220,h:232,l:218,bull:false},
      {o:220,c:210,h:222,l:208,bull:false},
      {o:210,c:200,h:212,l:198,bull:false},
      // THREE SOLDIERS — each large, each opens inside prev, each closes higher
      {o:198,c:212,h:214,l:197,bull:true},
      {o:208,c:222,h:224,l:207,bull:true},
      {o:218,c:234,h:236,l:217,bull:true},
      // Result — strong uptrend
      {o:234,c:242,h:244,l:233,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Soldier 1 ↑',color:TEAL},
      {type:'label',candleIdx:5,offset:-18,text:'Soldier 2 ↑',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'Soldier 3 ↑',color:TEAL},
    ]
  },
  {
    id: 20, name: "Bullish Harami", level: "Beginner",
    category: "Multi Candle", signal: "Bullish Reversal", signalColor: TEAL,
    description: "A small bullish candle whose ENTIRE body fits inside the prior large bearish candle. Harami means 'pregnant' in Japanese. The small candle is the baby — momentum is slowing.",
    entry: "Above the high of the small inside candle",
    stop: "Below the low of the large bearish mother candle",
    target: "Previous swing high",
    candles: [
      {o:240,c:230,h:242,l:228,bull:false},
      {o:230,c:220,h:232,l:218,bull:false},
      {o:220,c:210,h:222,l:208,bull:false},
      // LARGE BEARISH MOTHER CANDLE
      {o:212,c:192,h:214,l:190,bull:false},
      // SMALL BULLISH BABY — body entirely inside mother
      {o:195,c:202,h:204,l:194,bull:true},
      // Confirmation and breakout
      {o:202,c:212,h:214,l:201,bull:true},
      {o:212,c:222,h:224,l:211,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Large mother candle',color:RED},
      {type:'label',candleIdx:4,offset:-18,text:'Baby inside ↑',color:TEAL},
      {type:'bracket',start:3,end:4,label:'Harami'},
    ]
  },
  {
    id: 21, name: "Tweezer Bottom", level: "Intermediate",
    category: "Multi Candle", signal: "Bullish Reversal", signalColor: TEAL,
    description: "Two candles with the EXACT same low — first bearish, then bullish. Price tested the same level twice and buyers defended it both times. Double confirmation of support.",
    entry: "Above the high of the second (bullish) candle",
    stop: "Below the shared low — if it breaks, the setup is invalid",
    target: "Previous swing high",
    candles: [
      {o:240,c:230,h:242,l:228,bull:false},
      {o:230,c:220,h:232,l:218,bull:false},
      {o:220,c:210,h:222,l:208,bull:false},
      {o:210,c:200,h:212,l:198,bull:false},
      // TWEEZER — identical lows at 188
      {o:202,c:190,h:204,l:188,bull:false},
      {o:190,c:202,h:204,l:188,bull:true},
      // Buyers confirmed
      {o:202,c:212,h:214,l:201,bull:true},
      {o:212,c:222,h:224,l:211,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-28,text:'Same low = support',color:GOLD},
      {type:'label',candleIdx:5,offset:-28,text:'Defended again ✓',color:TEAL},
      {type:'hline',candleIdx:4,label:'Support Level'},
    ]
  },
  {
    id: 22, name: "Abandoned Baby Bottom", level: "Advanced",
    category: "Multi Candle", signal: "Bullish Reversal", signalColor: TEAL,
    description: "RARE: Large bearish → Doji that GAPS below with space on both sides → Large bullish that GAPS above. The Doji is completely isolated — abandoned. Extremely high accuracy bottom signal.",
    entry: "Above the close of the third (bullish) candle",
    stop: "Below the low of the isolated Doji",
    target: "Full recovery to the top of candle 1 and beyond",
    candles: [
      {o:240,c:228,h:242,l:226,bull:false},
      {o:228,c:216,h:230,l:214,bull:false},
      {o:216,c:204,h:218,l:202,bull:false},
      // CANDLE 1 — large bearish
      {o:206,c:190,h:208,l:188,bull:false},
      // CANDLE 2 — DOJI, completely isolated with gaps
      {o:185,c:185,h:187,l:183,bull:true},
      // CANDLE 3 — large bullish, gaps up from Doji
      {o:190,c:206,h:208,l:189,bull:true},
      {o:206,c:218,h:220,l:205,bull:true},
      {o:218,c:230,h:232,l:217,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'① Bearish',color:RED},
      {type:'label',candleIdx:4,offset:-28,text:'② Isolated Doji',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'③ Bullish gap up',color:TEAL},
    ]
  },
  {
    id: 23, name: "Evening Star", level: "Beginner",
    category: "Multi Candle", signal: "Bearish Reversal", signalColor: RED,
    description: "3-candle top reversal: (1) Large bullish, (2) Small star gaps up — indecision at the high, (3) Large bearish closes below midpoint of candle 1. The party is over.",
    entry: "Below the close of the third (bearish) candle",
    stop: "Above the high of the middle star candle",
    target: "Back to the bottom of candle 1 and below",
    candles: [
      {o:180,c:192,h:194,l:178,bull:true},
      {o:192,c:204,h:206,l:190,bull:true},
      {o:204,c:216,h:218,l:202,bull:true},
      {o:216,c:228,h:230,l:214,bull:true},
      // CANDLE 1 — large bullish
      {o:226,c:242,h:244,l:224,bull:true},
      // CANDLE 2 — small star, gaps up, indecision
      {o:244,c:245,h:248,l:242,bull:true},
      // CANDLE 3 — large bearish, closes below midpoint of candle 1
      {o:244,c:228,h:246,l:226,bull:false},
      // Continuation down
      {o:228,c:216,h:230,l:214,bull:false},
      {o:216,c:204,h:218,l:202,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'① Big bullish',color:TEAL},
      {type:'label',candleIdx:5,offset:-22,text:'② Star',color:GOLD},
      {type:'label',candleIdx:6,offset:-18,text:'③ Big bearish',color:RED},
      {type:'bracket',start:4,end:6,label:'Evening Star'},
    ]
  },
  {
    id: 24, name: "Evening Doji Star", level: "Intermediate",
    category: "Multi Candle", signal: "Bearish Reversal", signalColor: RED,
    description: "Like the Evening Star but the middle candle is a perfect Doji — total indecision at the peak. Even stronger signal than regular Evening Star. Sellers take complete control after.",
    entry: "Below the close of the third candle",
    stop: "Above the high of the Doji",
    target: "Previous swing low",
    candles: [
      {o:180,c:192,h:194,l:178,bull:true},
      {o:192,c:204,h:206,l:190,bull:true},
      {o:204,c:216,h:218,l:202,bull:true},
      // CANDLE 1 — large bullish
      {o:214,c:230,h:232,l:212,bull:true},
      // CANDLE 2 — DOJI at top, open = close exactly
      {o:232,c:232,h:236,l:228,bull:true},
      // CANDLE 3 — powerful bearish reversal
      {o:231,c:215,h:233,l:213,bull:false},
      {o:215,c:203,h:217,l:201,bull:false},
      {o:203,c:191,h:205,l:189,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'① Large bullish',color:TEAL},
      {type:'label',candleIdx:4,offset:-28,text:'② Doji = peak indecision',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'③ Sellers surge',color:RED},
      {type:'bracket',start:3,end:5,label:'Evening Doji Star'},
    ]
  },
  {
    id: 25, name: "Three Black Crows", level: "Beginner",
    category: "Multi Candle", signal: "Bearish Reversal", signalColor: RED,
    description: "Three consecutive large bearish candles, each opening INSIDE the prior body and closing at a new low. Mirror of Three White Soldiers. Sellers are in complete control.",
    entry: "Open of candle after the third crow",
    stop: "Above the high of the first crow",
    target: "Measured move equal to the three-candle total range below",
    candles: [
      {o:180,c:192,h:194,l:178,bull:true},
      {o:192,c:204,h:206,l:190,bull:true},
      {o:204,c:216,h:218,l:202,bull:true},
      {o:216,c:228,h:230,l:214,bull:true},
      // THREE BLACK CROWS — each large, each opens inside prev, each new low
      {o:228,c:214,h:230,l:212,bull:false},
      {o:217,c:202,h:219,l:200,bull:false},
      {o:205,c:189,h:207,l:187,bull:false},
      // Result — strong downtrend
      {o:189,c:180,h:191,l:178,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Crow 1 ↓',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Crow 2 ↓',color:RED},
      {type:'label',candleIdx:6,offset:-18,text:'Crow 3 ↓',color:RED},
    ]
  },
  {
    id: 26, name: "Bearish Harami", level: "Beginner",
    category: "Multi Candle", signal: "Bearish Reversal", signalColor: RED,
    description: "A small bearish candle whose entire body is INSIDE the prior large bullish candle. Upward momentum is stalling. The baby bearish candle signals a change of power.",
    entry: "Below the low of the small inside candle",
    stop: "Above the high of the large bullish mother candle",
    target: "Previous swing low",
    candles: [
      {o:180,c:192,h:194,l:178,bull:true},
      {o:192,c:204,h:206,l:190,bull:true},
      {o:204,c:216,h:218,l:202,bull:true},
      // LARGE BULLISH MOTHER CANDLE
      {o:214,c:234,h:236,l:212,bull:true},
      // SMALL BEARISH BABY — body inside mother
      {o:230,c:222,h:232,l:220,bull:false},
      // Confirmation and breakdown
      {o:222,c:212,h:224,l:210,bull:false},
      {o:212,c:202,h:214,l:200,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Large mother candle',color:TEAL},
      {type:'label',candleIdx:4,offset:-18,text:'Baby inside ↓',color:RED},
      {type:'bracket',start:3,end:4,label:'Harami'},
    ]
  },
  {
    id: 27, name: "Tweezer Top", level: "Intermediate",
    category: "Multi Candle", signal: "Bearish Reversal", signalColor: RED,
    description: "Two candles with the EXACT same high — first bullish, then bearish. Price tested the same resistance level twice and sellers defended it both times. Resistance confirmed.",
    entry: "Below the low of the second (bearish) candle",
    stop: "Above the shared high — if it breaks, setup is invalid",
    target: "Previous swing low",
    candles: [
      {o:180,c:192,h:194,l:178,bull:true},
      {o:192,c:204,h:206,l:190,bull:true},
      {o:204,c:216,h:218,l:202,bull:true},
      {o:216,c:228,h:230,l:214,bull:true},
      // TWEEZER — identical highs at 238
      {o:226,c:236,h:238,l:224,bull:true},
      {o:236,c:224,h:238,l:222,bull:false},
      // Sellers confirmed
      {o:224,c:214,h:226,l:212,bull:false},
      {o:214,c:204,h:216,l:202,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-25,text:'Same high = resistance',color:GOLD},
      {type:'label',candleIdx:5,offset:-25,text:'Rejected again ✓',color:RED},
      {type:'hline',candleIdx:4,label:'Resistance Level'},
    ]
  },
  {
    id: 28, name: "Abandoned Baby Top", level: "Advanced",
    category: "Multi Candle", signal: "Bearish Reversal", signalColor: RED,
    description: "RARE: Large bullish → Doji that GAPS above with space on both sides → Large bearish that GAPS below. The Doji is completely isolated — abandoned at the top. Extremely high accuracy.",
    entry: "Below the close of the third (bearish) candle",
    stop: "Above the high of the isolated Doji",
    target: "Full decline to the bottom of candle 1 and beyond",
    candles: [
      {o:180,c:194,h:196,l:178,bull:true},
      {o:194,c:208,h:210,l:192,bull:true},
      {o:208,c:222,h:224,l:206,bull:true},
      // CANDLE 1 — large bullish
      {o:220,c:236,h:238,l:218,bull:true},
      // CANDLE 2 — DOJI completely isolated, gaps above
      {o:240,c:240,h:243,l:237,bull:true},
      // CANDLE 3 — large bearish, gaps below Doji
      {o:236,c:220,h:238,l:218,bull:false},
      {o:220,c:206,h:222,l:204,bull:false},
      {o:206,c:192,h:208,l:190,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'① Bullish',color:TEAL},
      {type:'label',candleIdx:4,offset:-28,text:'② Isolated Doji',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'③ Bearish gap down',color:RED},
    ]
  },
];
// ─────────────────────────────────────────────
// BATCH 2 — Patterns 29-84
// ─────────────────────────────────────────────
const BATCH2 = [
  // ── Bullish Continuation Chart Patterns ──
  {
    id: 29, name: "Bull Flag", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Continuation", signalColor: TEAL,
    description: "A strong bullish impulse (the flagpole) followed by a tight downward consolidation (the flag). Sellers try to push back but fail. Breakout above the flag signals trend continuation.",
    entry: "Break above the upper flag trendline with volume",
    stop: "Below the lower flag trendline",
    target: "Flagpole length added to the breakout point",
    candles: [
      // FLAGPOLE — explosive move up
      {o:180,c:194,h:196,l:178,bull:true},
      {o:194,c:210,h:212,l:192,bull:true},
      {o:210,c:226,h:228,l:208,bull:true},
      {o:226,c:240,h:242,l:224,bull:true},
      // FLAG — tight downward consolidation, lower highs/lows
      {o:240,c:234,h:242,l:232,bull:false},
      {o:234,c:228,h:236,l:226,bull:false},
      {o:228,c:232,h:234,l:226,bull:true},
      {o:232,c:226,h:234,l:224,bull:false},
      {o:226,c:230,h:232,l:224,bull:true},
      // BREAKOUT — explodes above flag
      {o:230,c:244,h:246,l:228,bull:true},
      {o:244,c:256,h:258,l:242,bull:true},
      {o:256,c:266,h:268,l:254,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Flagpole ↑',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'Flag — tight consolidation',color:GOLD},
      {type:'label',candleIdx:9,offset:-18,text:'Breakout! ↑',color:TEAL},
    ]
  },
  {
    id: 30, name: "Bull Pennant", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Continuation", signalColor: TEAL,
    description: "Like a Bull Flag but the consolidation forms a symmetrical triangle (pennant) — converging trendlines, tightening range. Energy coiling before the next explosive move up.",
    entry: "Break above the upper pennant trendline",
    stop: "Below the lower pennant trendline",
    target: "Flagpole length added to breakout point",
    candles: [
      // FLAGPOLE
      {o:180,c:196,h:198,l:178,bull:true},
      {o:196,c:214,h:216,l:194,bull:true},
      {o:214,c:230,h:232,l:212,bull:true},
      // PENNANT — converging, each swing smaller
      {o:230,c:222,h:232,l:220,bull:false},
      {o:222,c:228,h:230,l:220,bull:true},
      {o:228,c:222,h:229,l:221,bull:false},
      {o:222,c:226,h:227,l:221,bull:true},
      {o:226,c:223,h:227,l:222,bull:false},
      {o:223,c:225,h:226,l:222,bull:true},
      // BREAKOUT
      {o:225,c:240,h:242,l:224,bull:true},
      {o:240,c:254,h:256,l:238,bull:true},
      {o:254,c:264,h:266,l:252,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Flagpole ↑',color:TEAL},
      {type:'label',candleIdx:5,offset:-18,text:'Pennant — converging',color:GOLD},
      {type:'label',candleIdx:9,offset:-18,text:'Breakout! ↑',color:TEAL},
    ]
  },
  {
    id: 31, name: "Ascending Triangle", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Continuation", signalColor: TEAL,
    description: "Flat resistance at the top with rising lows. Buyers are getting more aggressive — each pullback stops higher than the last. Sellers hold the line until they can't. Breakout inevitable.",
    entry: "Break above the flat resistance level with volume",
    stop: "Below the most recent higher low",
    target: "Triangle height added to breakout point",
    candles: [
      // Approach to resistance
      {o:188,c:198,h:200,l:186,bull:true},
      {o:198,c:208,h:210,l:196,bull:true},
      // HIT RESISTANCE at 216
      {o:208,c:216,h:218,l:206,bull:true},
      {o:216,c:206,h:217,l:204,bull:false},
      // HIGHER LOW 1
      {o:206,c:200,h:207,l:198,bull:false},
      {o:200,c:210,h:212,l:199,bull:true},
      // HIT RESISTANCE again
      {o:210,c:216,h:218,l:208,bull:true},
      {o:216,c:208,h:217,l:206,bull:false},
      // HIGHER LOW 2 — higher than first
      {o:208,c:204,h:209,l:203,bull:false},
      {o:204,c:214,h:216,l:203,bull:true},
      // BREAKOUT above resistance
      {o:214,c:226,h:228,l:213,bull:true},
      {o:226,c:238,h:240,l:225,bull:true},
      {o:238,c:248,h:250,l:237,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Resistance',color:RED},
      {type:'label',candleIdx:6,offset:-18,text:'Resistance again',color:RED},
      {type:'label',candleIdx:8,offset:-22,text:'Higher low ↑',color:TEAL},
      {type:'label',candleIdx:10,offset:-18,text:'Breakout! ↑',color:TEAL},
      {type:'hline',candleIdx:2,label:'Flat Resistance'},
    ]
  },
  {
    id: 32, name: "Cup and Handle", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Continuation", signalColor: TEAL,
    description: "A rounded bowl (the cup) followed by a small downward drift (the handle). The cup shows gradual accumulation. The handle is a final shakeout before the breakout. Very reliable pattern.",
    entry: "Break above the handle's upper resistance",
    stop: "Below the handle's lowest point",
    target: "Cup depth added to the breakout point",
    candles: [
      // LEFT RIM of cup
      {o:228,c:220,h:230,l:218,bull:false},
      {o:220,c:212,h:222,l:210,bull:false},
      // CUP BOTTOM — gradual rounding
      {o:212,c:206,h:214,l:204,bull:false},
      {o:206,c:202,h:208,l:200,bull:false},
      {o:202,c:200,h:204,l:198,bull:false},
      {o:200,c:202,h:204,l:199,bull:true},
      {o:202,c:206,h:208,l:201,bull:true},
      {o:206,c:212,h:214,l:205,bull:true},
      {o:212,c:220,h:222,l:211,bull:true},
      // RIGHT RIM — back to prior high
      {o:220,c:228,h:230,l:219,bull:true},
      // HANDLE — small pullback
      {o:228,c:222,h:230,l:220,bull:false},
      {o:222,c:218,h:224,l:217,bull:false},
      {o:218,c:222,h:224,l:217,bull:true},
      // BREAKOUT
      {o:222,c:236,h:238,l:221,bull:true},
      {o:236,c:248,h:250,l:235,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-22,text:'Cup bottom',color:GOLD},
      {type:'label',candleIdx:11,offset:-22,text:'Handle',color:GOLD},
      {type:'label',candleIdx:13,offset:-18,text:'Breakout! ↑',color:TEAL},
    ]
  },
  {
    id: 33, name: "Rectangle Breakout", level: "Beginner",
    category: "Chart Pattern", signal: "Bullish Continuation", signalColor: TEAL,
    description: "Price bounces between flat support and flat resistance — a rectangle zone. Buyers and sellers are equal inside the box. When price breaks ABOVE resistance with volume, bulls win.",
    entry: "Close above the rectangle resistance with volume expansion",
    stop: "Below the rectangle support",
    target: "Rectangle height added to the breakout point",
    candles: [
      // Approach
      {o:186,c:196,h:198,l:184,bull:true},
      {o:196,c:206,h:208,l:194,bull:true},
      // INSIDE RECTANGLE — bouncing between 206 support and 220 resistance
      {o:206,c:218,h:220,l:204,bull:true},
      {o:218,c:208,h:221,l:206,bull:false},
      {o:208,c:218,h:220,l:206,bull:true},
      {o:218,c:207,h:220,l:205,bull:false},
      {o:207,c:219,h:220,l:206,bull:true},
      {o:219,c:208,h:221,l:206,bull:false},
      {o:208,c:218,h:220,l:207,bull:true},
      {o:218,c:207,h:220,l:205,bull:false},
      // BREAKOUT above resistance
      {o:207,c:224,h:226,l:206,bull:true},
      {o:224,c:236,h:238,l:223,bull:true},
      {o:236,c:246,h:248,l:235,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Resistance 220',color:RED},
      {type:'label',candleIdx:4,offset:-22,text:'Support 206',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'Rectangle zone',color:GOLD},
      {type:'label',candleIdx:10,offset:-18,text:'BREAKOUT ↑',color:TEAL},
    ]
  },
  {
    id: 34, name: "Rising Channel", level: "Beginner",
    category: "Chart Pattern", signal: "Bullish Continuation", signalColor: TEAL,
    description: "Price moves higher within two parallel upward-sloping trendlines. Buy near the LOWER channel line (support), take profits near the UPPER channel line (resistance). Ride the trend.",
    entry: "Bounce off the lower channel trendline",
    stop: "Close below the lower channel line",
    target: "Upper channel trendline",
    candles: [
      {o:184,c:192,h:194,l:182,bull:true},
      {o:192,c:200,h:202,l:190,bull:true},
      {o:200,c:210,h:212,l:198,bull:true},
      // HITS UPPER CHANNEL, pulls back
      {o:210,c:218,h:220,l:208,bull:true},
      {o:218,c:210,h:220,l:208,bull:false},
      // BOUNCES LOWER CHANNEL
      {o:210,c:206,h:212,l:204,bull:false},
      {o:206,c:216,h:218,l:204,bull:true},
      {o:216,c:226,h:228,l:214,bull:true},
      // HITS UPPER CHANNEL again, pulls back
      {o:226,c:232,h:234,l:224,bull:true},
      {o:232,c:224,h:234,l:222,bull:false},
      // BOUNCES LOWER CHANNEL — buy zone
      {o:224,c:220,h:226,l:218,bull:false},
      {o:220,c:232,h:234,l:218,bull:true},
      {o:232,c:242,h:244,l:230,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:5,offset:-22,text:'Buy zone ↑',color:TEAL},
      {type:'label',candleIdx:7,offset:-18,text:'Upper channel',color:RED},
      {type:'label',candleIdx:10,offset:-22,text:'Buy zone ↑',color:TEAL},
    ]
  },
  // ── Bearish Continuation ──
  {
    id: 35, name: "Bear Flag", level: "Intermediate",
    category: "Chart Pattern", signal: "Bearish Continuation", signalColor: RED,
    description: "A strong bearish impulse (flagpole) followed by a tight upward consolidation (flag). Bulls try to bounce but can't sustain it. Breakdown below the flag signals trend continuation lower.",
    entry: "Break below the lower flag trendline",
    stop: "Above the upper flag trendline",
    target: "Flagpole length subtracted from breakdown point",
    candles: [
      // FLAGPOLE — explosive drop
      {o:260,c:246,h:262,l:244,bull:false},
      {o:246,c:230,h:248,l:228,bull:false},
      {o:230,c:214,h:232,l:212,bull:false},
      {o:214,c:200,h:216,l:198,bull:false},
      // FLAG — tight upward drift, higher highs/lows but weak
      {o:200,c:206,h:208,l:198,bull:true},
      {o:206,c:212,h:214,l:204,bull:true},
      {o:212,c:208,h:214,l:206,bull:false},
      {o:208,c:214,h:216,l:206,bull:true},
      {o:214,c:210,h:216,l:208,bull:false},
      // BREAKDOWN
      {o:210,c:196,h:212,l:194,bull:false},
      {o:196,c:182,h:198,l:180,bull:false},
      {o:182,c:170,h:184,l:168,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Flagpole ↓',color:RED},
      {type:'label',candleIdx:6,offset:-18,text:'Flag — weak bounce',color:GOLD},
      {type:'label',candleIdx:9,offset:-18,text:'Breakdown! ↓',color:RED},
    ]
  },
  {
    id: 36, name: "Bear Pennant", level: "Intermediate",
    category: "Chart Pattern", signal: "Bearish Continuation", signalColor: RED,
    description: "Like a Bear Flag but the consolidation forms a converging triangle. Range tightens after the drop. Sellers regrouping before the next leg down. Breakdown is imminent.",
    entry: "Break below the lower pennant trendline",
    stop: "Above the upper pennant trendline",
    target: "Flagpole length subtracted from breakdown",
    candles: [
      // FLAGPOLE
      {o:260,c:244,h:262,l:242,bull:false},
      {o:244,c:228,h:246,l:226,bull:false},
      {o:228,c:212,h:230,l:210,bull:false},
      // PENNANT — converging swings
      {o:212,c:220,h:222,l:210,bull:true},
      {o:220,c:214,h:221,l:212,bull:false},
      {o:214,c:220,h:221,l:213,bull:true},
      {o:220,c:215,h:221,l:214,bull:false},
      {o:215,c:219,h:220,l:214,bull:true},
      {o:219,c:216,h:220,l:215,bull:false},
      // BREAKDOWN
      {o:216,c:202,h:218,l:200,bull:false},
      {o:202,c:188,h:204,l:186,bull:false},
      {o:188,c:176,h:190,l:174,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Flagpole ↓',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Pennant — converging',color:GOLD},
      {type:'label',candleIdx:9,offset:-18,text:'Breakdown! ↓',color:RED},
    ]
  },
  {
    id: 37, name: "Descending Triangle", level: "Intermediate",
    category: "Chart Pattern", signal: "Bearish Continuation", signalColor: RED,
    description: "Flat support at the bottom with lower highs forming a descending line. Sellers are getting more aggressive each bounce. Buyers hold the floor until they can't. Breakdown inevitable.",
    entry: "Break below the flat support with volume",
    stop: "Above the most recent lower high",
    target: "Triangle height subtracted from breakdown",
    candles: [
      // Approach to support
      {o:248,c:238,h:250,l:236,bull:false},
      {o:238,c:228,h:240,l:226,bull:false},
      // HIT SUPPORT at 218
      {o:228,c:220,h:230,l:218,bull:false},
      {o:220,c:228,h:230,l:218,bull:true},
      // LOWER HIGH 1
      {o:228,c:234,h:236,l:226,bull:true},
      {o:234,c:224,h:235,l:222,bull:false},
      // HIT SUPPORT again
      {o:224,c:220,h:226,l:218,bull:false},
      {o:220,c:228,h:230,l:218,bull:true},
      // LOWER HIGH 2
      {o:228,c:230,h:231,l:226,bull:true},
      {o:230,c:220,h:231,l:218,bull:false},
      // BREAKDOWN below support
      {o:220,c:208,h:222,l:206,bull:false},
      {o:208,c:196,h:210,l:194,bull:false},
      {o:196,c:184,h:198,l:182,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-22,text:'Support 218',color:TEAL},
      {type:'label',candleIdx:4,offset:-18,text:'Lower high ↓',color:RED},
      {type:'label',candleIdx:8,offset:-18,text:'Lower high ↓',color:RED},
      {type:'label',candleIdx:10,offset:-18,text:'BREAKDOWN ↓',color:RED},
      {type:'hline',candleIdx:2,label:'Flat Support'},
    ]
  },
  {
    id: 38, name: "Rectangle Breakdown", level: "Beginner",
    category: "Chart Pattern", signal: "Bearish Continuation", signalColor: RED,
    description: "Price consolidates between flat support and resistance after a downtrend. When price breaks BELOW support with volume, sellers win and the downtrend resumes.",
    entry: "Close below the rectangle support with volume",
    stop: "Above the rectangle resistance",
    target: "Rectangle height subtracted from breakdown",
    candles: [
      // Approach
      {o:258,c:248,h:260,l:246,bull:false},
      {o:248,c:238,h:250,l:236,bull:false},
      // INSIDE RECTANGLE — bouncing between 224 support and 238 resistance
      {o:238,c:226,h:240,l:224,bull:false},
      {o:226,c:236,h:238,l:224,bull:true},
      {o:236,c:225,h:238,l:224,bull:false},
      {o:225,c:236,h:238,l:224,bull:true},
      {o:236,c:226,h:238,l:224,bull:false},
      {o:226,c:235,h:238,l:224,bull:true},
      {o:235,c:225,h:237,l:224,bull:false},
      // BREAKDOWN below support
      {o:225,c:210,h:226,l:208,bull:false},
      {o:210,c:196,h:212,l:194,bull:false},
      {o:196,c:184,h:198,l:182,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Resistance 238',color:RED},
      {type:'label',candleIdx:4,offset:-22,text:'Support 224',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'Rectangle zone',color:GOLD},
      {type:'label',candleIdx:9,offset:-18,text:'BREAKDOWN ↓',color:RED},
    ]
  },
  {
    id: 39, name: "Falling Channel", level: "Beginner",
    category: "Chart Pattern", signal: "Bearish Continuation", signalColor: RED,
    description: "Price moves lower within two parallel downward-sloping trendlines. Sell near the UPPER channel line (resistance), take profits near the LOWER channel line (support). Ride the downtrend.",
    entry: "Rejection from the upper channel trendline",
    stop: "Close above the upper channel line",
    target: "Lower channel trendline",
    candles: [
      {o:256,c:248,h:258,l:246,bull:false},
      {o:248,c:240,h:250,l:238,bull:false},
      {o:240,c:232,h:242,l:230,bull:false},
      // HITS LOWER CHANNEL, bounces
      {o:232,c:224,h:234,l:222,bull:false},
      {o:224,c:232,h:234,l:222,bull:true},
      // HITS UPPER CHANNEL — sell zone
      {o:232,c:236,h:238,l:230,bull:true},
      {o:236,c:228,h:238,l:226,bull:false},
      {o:228,c:220,h:230,l:218,bull:false},
      // HITS LOWER CHANNEL, bounces
      {o:220,c:212,h:222,l:210,bull:false},
      {o:212,c:220,h:222,l:210,bull:true},
      // HITS UPPER CHANNEL — sell zone again
      {o:220,c:224,h:226,l:218,bull:true},
      {o:224,c:214,h:226,l:212,bull:false},
      {o:214,c:204,h:216,l:202,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:5,offset:-18,text:'Sell zone ↓',color:RED},
      {type:'label',candleIdx:8,offset:-22,text:'Lower channel',color:TEAL},
      {type:'label',candleIdx:10,offset:-18,text:'Sell zone ↓',color:RED},
    ]
  },
  // ── Reversal Chart Patterns: Bullish ──
  {
    id: 40, name: "Double Bottom", level: "Beginner",
    category: "Chart Pattern", signal: "Bullish Reversal", signalColor: TEAL,
    description: "Two lows at the SAME price level — classic W shape. Price tested support twice and buyers defended it both times. Break above the middle peak (neckline) confirms the reversal.",
    entry: "Break above the neckline (middle peak) with volume",
    stop: "Below the second bottom",
    target: "Distance from bottom to neckline, added to breakout",
    candles: [
      // Downtrend into first bottom
      {o:248,c:238,h:250,l:236,bull:false},
      {o:238,c:226,h:240,l:224,bull:false},
      // FIRST BOTTOM at 214
      {o:226,c:216,h:228,l:214,bull:false},
      {o:216,c:214,h:218,l:212,bull:false},
      {o:214,c:222,h:224,l:213,bull:true},
      // RALLY TO NECKLINE at 234
      {o:222,c:230,h:232,l:220,bull:true},
      {o:230,c:234,h:236,l:228,bull:true},
      // PULLBACK TO SECOND BOTTOM — same level 214
      {o:234,c:224,h:236,l:222,bull:false},
      {o:224,c:216,h:226,l:214,bull:false},
      {o:216,c:214,h:218,l:212,bull:false},
      {o:214,c:224,h:226,l:213,bull:true},
      // BREAK ABOVE NECKLINE
      {o:224,c:238,h:240,l:222,bull:true},
      {o:238,c:250,h:252,l:236,bull:true},
      {o:250,c:260,h:262,l:248,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-25,text:'Bottom 1',color:TEAL},
      {type:'label',candleIdx:9,offset:-25,text:'Bottom 2',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'Neckline',color:GOLD},
      {type:'label',candleIdx:11,offset:-18,text:'BREAKOUT ↑',color:TEAL},
      {type:'hline',candleIdx:6,label:'Neckline'},
    ]
  },
  {
    id: 41, name: "Triple Bottom", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Reversal", signalColor: TEAL,
    description: "Three lows at the SAME price level. Even stronger than Double Bottom — buyers defended the same level THREE times. Sellers completely exhausted. Break above resistance = powerful reversal.",
    entry: "Break above the resistance connecting the two peaks",
    stop: "Below the third bottom",
    target: "Distance from bottom to resistance, added to breakout",
    candles: [
      {o:248,c:236,h:250,l:234,bull:false},
      // BOTTOM 1 at 220
      {o:236,c:222,h:238,l:220,bull:false},
      {o:222,c:220,h:224,l:218,bull:false},
      {o:220,c:228,h:230,l:219,bull:true},
      {o:228,c:234,h:236,l:226,bull:true},
      // BOTTOM 2 at 220
      {o:234,c:222,h:236,l:220,bull:false},
      {o:222,c:220,h:224,l:218,bull:false},
      {o:220,c:228,h:230,l:219,bull:true},
      {o:228,c:234,h:236,l:226,bull:true},
      // BOTTOM 3 at 220
      {o:234,c:222,h:236,l:220,bull:false},
      {o:222,c:220,h:224,l:218,bull:false},
      {o:220,c:230,h:232,l:219,bull:true},
      // BREAKOUT above 234 resistance
      {o:230,c:244,h:246,l:229,bull:true},
      {o:244,c:256,h:258,l:243,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-25,text:'Bot 1',color:TEAL},
      {type:'label',candleIdx:6,offset:-25,text:'Bot 2',color:TEAL},
      {type:'label',candleIdx:10,offset:-25,text:'Bot 3',color:TEAL},
      {type:'label',candleIdx:12,offset:-18,text:'BREAKOUT ↑',color:TEAL},
      {type:'hline',candleIdx:4,label:'Resistance'},
    ]
  },
  {
    id: 42, name: "Inverse Head & Shoulders", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Reversal", signalColor: TEAL,
    description: "Upside-down H&S: left shoulder, DEEPER head, right shoulder at same level. The head is the final exhaustion of sellers. Neckline break = major bullish reversal. Very reliable.",
    entry: "Break above the neckline with volume",
    stop: "Below the right shoulder low",
    target: "Distance from head to neckline, added to breakout",
    candles: [
      {o:248,c:238,h:250,l:236,bull:false},
      {o:238,c:228,h:240,l:226,bull:false},
      // LEFT SHOULDER bottom at 220
      {o:228,c:222,h:230,l:220,bull:false},
      {o:222,c:228,h:230,l:220,bull:true},
      {o:228,c:234,h:236,l:226,bull:true},
      // HEAD — goes much deeper to 208
      {o:234,c:224,h:236,l:222,bull:false},
      {o:224,c:212,h:226,l:210,bull:false},
      {o:212,c:208,h:214,l:206,bull:false},
      {o:208,c:218,h:220,l:207,bull:true},
      {o:218,c:228,h:230,l:216,bull:true},
      {o:228,c:234,h:236,l:226,bull:true},
      // RIGHT SHOULDER — same as left, 220
      {o:234,c:224,h:236,l:222,bull:false},
      {o:224,c:220,h:226,l:219,bull:false},
      {o:220,c:228,h:230,l:219,bull:true},
      // NECKLINE BREAK
      {o:228,c:240,h:242,l:227,bull:true},
      {o:240,c:252,h:254,l:239,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-25,text:'L Shoulder',color:GOLD},
      {type:'label',candleIdx:7,offset:-28,text:'Head (deepest)',color:GOLD},
      {type:'label',candleIdx:12,offset:-25,text:'R Shoulder',color:GOLD},
      {type:'label',candleIdx:14,offset:-18,text:'Breakout ↑',color:TEAL},
      {type:'hline',candleIdx:4,label:'Neckline'},
    ]
  },
  {
    id: 43, name: "Rounded Bottom", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Reversal", signalColor: TEAL,
    description: "A slow, gradual curve from downtrend to uptrend — like a bowl or saucer. Selling pressure exhausts over time and buying gradually takes over. Signals a major long-term reversal.",
    entry: "Break above the resistance at the start of the curve",
    stop: "Below the lowest point of the bowl",
    target: "Depth of the bowl added to breakout",
    candles: [
      // Gradual decline
      {o:240,c:234,h:242,l:232,bull:false},
      {o:234,c:228,h:236,l:226,bull:false},
      {o:228,c:222,h:230,l:220,bull:false},
      {o:222,c:218,h:224,l:216,bull:false},
      {o:218,c:214,h:220,l:212,bull:false},
      // BOWL BOTTOM — very gradual
      {o:214,c:212,h:216,l:210,bull:false},
      {o:212,c:212,h:214,l:210,bull:true},
      {o:212,c:214,h:216,l:211,bull:true},
      {o:214,c:218,h:220,l:213,bull:true},
      {o:218,c:222,h:224,l:217,bull:true},
      {o:222,c:228,h:230,l:221,bull:true},
      {o:228,c:234,h:236,l:227,bull:true},
      {o:234,c:240,h:242,l:233,bull:true},
      // BREAKOUT
      {o:240,c:250,h:252,l:239,bull:true},
      {o:250,c:260,h:262,l:249,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:6,offset:-25,text:'Bowl bottom',color:GOLD},
      {type:'label',candleIdx:13,offset:-18,text:'Breakout ↑',color:TEAL},
    ]
  },
  {
    id: 44, name: "Falling Wedge", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Reversal", signalColor: TEAL,
    description: "Two CONVERGING downward trendlines — lower highs and lower lows, but the range is tightening. Sellers losing steam. Despite looking bearish, the breakout is UPWARD. Surprise reversal.",
    entry: "Break above the upper falling trendline",
    stop: "Below the most recent low within the wedge",
    target: "Height of the wedge added to breakout point",
    candles: [
      // FALLING WEDGE — converging, shrinking range
      {o:250,c:238,h:252,l:236,bull:false},
      {o:238,c:244,h:246,l:236,bull:true},
      {o:244,c:234,h:246,l:232,bull:false},
      {o:234,c:240,h:241,l:232,bull:true},
      {o:240,c:232,h:241,l:230,bull:false},
      {o:232,c:237,h:238,l:230,bull:true},
      {o:237,c:230,h:238,l:229,bull:false},
      {o:230,c:234,h:235,l:229,bull:true},
      {o:234,c:229,h:235,l:228,bull:false},
      {o:229,c:232,h:233,l:228,bull:true},
      // BREAKOUT UP — surprise!
      {o:232,c:244,h:246,l:231,bull:true},
      {o:244,c:256,h:258,l:243,bull:true},
      {o:256,c:266,h:268,l:255,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Lower high',color:RED},
      {type:'label',candleIdx:6,offset:-18,text:'Converging ↓',color:GOLD},
      {type:'label',candleIdx:10,offset:-18,text:'Surprise breakout ↑',color:TEAL},
    ]
  },
  {
    id: 45, name: "Adam & Eve Bottom", level: "Advanced",
    category: "Chart Pattern", signal: "Bullish Reversal", signalColor: TEAL,
    description: "A sharp V-shaped bottom (Adam) followed by a wider rounded bottom (Eve) at a similar level. Adam = panic selling spike. Eve = gradual exhaustion. Together = powerful institutional accumulation signal.",
    entry: "Break above the neckline between Adam and Eve",
    stop: "Below the lower of the two bottoms",
    target: "Depth of the pattern added to breakout",
    candles: [
      {o:248,c:238,h:250,l:236,bull:false},
      {o:238,c:226,h:240,l:224,bull:false},
      // ADAM — sharp V spike down
      {o:226,c:212,h:228,l:210,bull:false},
      {o:212,c:208,h:214,l:206,bull:false},
      {o:208,c:220,h:222,l:207,bull:true},
      {o:220,c:232,h:234,l:218,bull:true},
      // NECKLINE area
      {o:232,c:238,h:240,l:230,bull:true},
      // EVE — wide rounded bottom
      {o:238,c:228,h:240,l:226,bull:false},
      {o:228,c:218,h:230,l:216,bull:false},
      {o:218,c:212,h:220,l:210,bull:false},
      {o:212,c:216,h:218,l:210,bull:true},
      {o:216,c:224,h:226,l:215,bull:true},
      {o:224,c:232,h:234,l:223,bull:true},
      // BREAKOUT
      {o:232,c:246,h:248,l:231,bull:true},
      {o:246,c:258,h:260,l:245,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-25,text:'Adam (sharp)',color:GOLD},
      {type:'label',candleIdx:9,offset:-25,text:'Eve (rounded)',color:GOLD},
      {type:'label',candleIdx:13,offset:-18,text:'Breakout ↑',color:TEAL},
      {type:'hline',candleIdx:6,label:'Neckline'},
    ]
  },
  // ── Reversal Chart Patterns: Bearish ──
  {
    id: 46, name: "Double Top", level: "Beginner",
    category: "Chart Pattern", signal: "Bearish Reversal", signalColor: RED,
    description: "Two highs at the SAME price level — classic M shape. Price tested resistance twice and sellers defended it both times. Break below the middle low (neckline) confirms the reversal.",
    entry: "Break below the neckline (middle low) with volume",
    stop: "Above the second top",
    target: "Distance from top to neckline, subtracted from breakdown",
    candles: [
      // Uptrend into first top
      {o:188,c:200,h:202,l:186,bull:true},
      {o:200,c:212,h:214,l:198,bull:true},
      // FIRST TOP at 226
      {o:212,c:222,h:226,l:210,bull:true},
      {o:222,c:226,h:228,l:220,bull:true},
      {o:226,c:218,h:228,l:216,bull:false},
      // PULLBACK TO NECKLINE at 212
      {o:218,c:212,h:220,l:210,bull:false},
      {o:212,c:218,h:220,l:210,bull:true},
      // SECOND TOP — same level 226
      {o:218,c:226,h:228,l:216,bull:true},
      {o:226,c:222,h:228,l:220,bull:false},
      {o:222,c:212,h:224,l:210,bull:false},
      // BREAK BELOW NECKLINE
      {o:212,c:200,h:214,l:198,bull:false},
      {o:200,c:188,h:202,l:186,bull:false},
      {o:188,c:178,h:190,l:176,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Top 1',color:RED},
      {type:'label',candleIdx:7,offset:-18,text:'Top 2',color:RED},
      {type:'label',candleIdx:5,offset:-22,text:'Neckline',color:GOLD},
      {type:'label',candleIdx:10,offset:-18,text:'BREAKDOWN ↓',color:RED},
      {type:'hline',candleIdx:5,label:'Neckline'},
    ]
  },
  {
    id: 47, name: "Triple Top", level: "Intermediate",
    category: "Chart Pattern", signal: "Bearish Reversal", signalColor: RED,
    description: "Three highs at the SAME price — resistance tested and rejected THREE times. Buyers completely exhausted. Each failed attempt shows sellers getting stronger. Breakdown is powerful.",
    entry: "Break below the support connecting the two lows",
    stop: "Above the third top",
    target: "Distance from top to support, subtracted from breakdown",
    candles: [
      {o:188,c:200,h:202,l:186,bull:true},
      // TOP 1 at 218
      {o:200,c:214,h:218,l:198,bull:true},
      {o:214,c:218,h:220,l:212,bull:true},
      {o:218,c:210,h:220,l:208,bull:false},
      {o:210,c:206,h:212,l:204,bull:false},
      // TOP 2 at 218
      {o:206,c:214,h:218,l:204,bull:true},
      {o:214,c:218,h:220,l:212,bull:true},
      {o:218,c:208,h:220,l:206,bull:false},
      {o:208,c:204,h:210,l:202,bull:false},
      // TOP 3 at 218
      {o:204,c:212,h:218,l:202,bull:true},
      {o:212,c:218,h:220,l:210,bull:true},
      {o:218,c:206,h:220,l:204,bull:false},
      // BREAKDOWN
      {o:206,c:194,h:208,l:192,bull:false},
      {o:194,c:182,h:196,l:180,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Top 1',color:RED},
      {type:'label',candleIdx:6,offset:-18,text:'Top 2',color:RED},
      {type:'label',candleIdx:10,offset:-18,text:'Top 3',color:RED},
      {type:'label',candleIdx:12,offset:-18,text:'BREAKDOWN ↓',color:RED},
      {type:'hline',candleIdx:2,label:'Resistance'},
    ]
  },
  {
    id: 48, name: "Head & Shoulders", level: "Beginner",
    category: "Chart Pattern", signal: "Bearish Reversal", signalColor: RED,
    description: "Left shoulder → Higher head → Right shoulder at same height as left. The head is the final push by bulls — then they fail. Neckline break confirms sellers are in control. Classic reversal.",
    entry: "Break below the neckline with volume",
    stop: "Above the right shoulder high",
    target: "Distance from head to neckline, subtracted from breakdown",
    candles: [
      {o:188,c:200,h:202,l:186,bull:true},
      {o:200,c:210,h:212,l:198,bull:true},
      // LEFT SHOULDER top at 220
      {o:210,c:218,h:222,l:208,bull:true},
      {o:218,c:220,h:222,l:216,bull:true},
      {o:220,c:212,h:222,l:210,bull:false},
      {o:212,c:208,h:214,l:206,bull:false},
      // HEAD — goes higher to 234
      {o:208,c:220,h:222,l:206,bull:true},
      {o:220,c:232,h:236,l:218,bull:true},
      {o:232,c:234,h:236,l:230,bull:true},
      {o:234,c:222,h:236,l:220,bull:false},
      {o:222,c:210,h:224,l:208,bull:false},
      // RIGHT SHOULDER — same as left, 220
      {o:210,c:220,h:222,l:208,bull:true},
      {o:220,c:218,h:222,l:216,bull:false},
      {o:218,c:208,h:220,l:206,bull:false},
      // NECKLINE BREAK
      {o:208,c:196,h:210,l:194,bull:false},
      {o:196,c:184,h:198,l:182,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'L Shoulder',color:GOLD},
      {type:'label',candleIdx:8,offset:-18,text:'Head (highest)',color:GOLD},
      {type:'label',candleIdx:12,offset:-18,text:'R Shoulder',color:GOLD},
      {type:'label',candleIdx:14,offset:-18,text:'Breakdown ↓',color:RED},
      {type:'hline',candleIdx:5,label:'Neckline'},
    ]
  },
  {
    id: 49, name: "Rounded Top", level: "Intermediate",
    category: "Chart Pattern", signal: "Bearish Reversal", signalColor: RED,
    description: "A slow gradual curve from uptrend to downtrend — like a dome or arch. Buying pressure slowly exhausts and selling gradually takes over. Signals a major long-term top.",
    entry: "Break below the support at the start of the curve",
    stop: "Above the highest point of the dome",
    target: "Height of the dome subtracted from breakdown",
    candles: [
      // Gradual rise
      {o:196,c:202,h:204,l:194,bull:true},
      {o:202,c:208,h:210,l:200,bull:true},
      {o:208,c:214,h:216,l:206,bull:true},
      {o:214,c:220,h:222,l:212,bull:true},
      {o:220,c:224,h:226,l:218,bull:true},
      // DOME TOP — gradual
      {o:224,c:226,h:228,l:222,bull:true},
      {o:226,c:226,h:228,l:224,bull:false},
      {o:226,c:224,h:228,l:222,bull:false},
      {o:224,c:220,h:226,l:218,bull:false},
      {o:220,c:214,h:222,l:212,bull:false},
      {o:214,c:208,h:216,l:206,bull:false},
      {o:208,c:202,h:210,l:200,bull:false},
      {o:202,c:196,h:204,l:194,bull:false},
      // BREAKDOWN
      {o:196,c:184,h:198,l:182,bull:false},
      {o:184,c:172,h:186,l:170,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:6,offset:-18,text:'Dome peak',color:GOLD},
      {type:'label',candleIdx:13,offset:-18,text:'Breakdown ↓',color:RED},
    ]
  },
  {
    id: 50, name: "Rising Wedge", level: "Intermediate",
    category: "Chart Pattern", signal: "Bearish Reversal", signalColor: RED,
    description: "Two CONVERGING upward trendlines — higher highs and higher lows but the range is tightening. Buyers losing steam despite pushing higher. Breakdown is DOWNWARD. Deceptive top pattern.",
    entry: "Break below the lower rising trendline",
    stop: "Above the most recent high within the wedge",
    target: "Height of the wedge subtracted from breakdown",
    candles: [
      // RISING WEDGE — converging, shrinking range going up
      {o:196,c:208,h:210,l:194,bull:true},
      {o:208,c:202,h:210,l:200,bull:false},
      {o:202,c:212,h:214,l:200,bull:true},
      {o:212,c:206,h:213,l:205,bull:false},
      {o:206,c:215,h:216,l:205,bull:true},
      {o:215,c:210,h:216,l:209,bull:false},
      {o:210,c:217,h:218,l:210,bull:true},
      {o:217,c:213,h:218,l:212,bull:false},
      {o:213,c:218,h:219,l:213,bull:true},
      {o:218,c:215,h:219,l:214,bull:false},
      // BREAKDOWN — surprise drop
      {o:215,c:203,h:216,l:201,bull:false},
      {o:203,c:191,h:205,l:189,bull:false},
      {o:191,c:179,h:193,l:177,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Higher high',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'Converging ↑',color:GOLD},
      {type:'label',candleIdx:10,offset:-18,text:'Surprise drop ↓',color:RED},
    ]
  },
  {
    id: 51, name: "Adam & Eve Top", level: "Advanced",
    category: "Chart Pattern", signal: "Bearish Reversal", signalColor: RED,
    description: "A sharp spike top (Adam) followed by a wider rounded top (Eve). Adam = FOMO panic buying spike. Eve = distribution topping process. Together = smart money selling into retail excitement.",
    entry: "Break below the neckline between Adam and Eve",
    stop: "Above the higher of the two tops",
    target: "Depth of the pattern subtracted from breakdown",
    candles: [
      {o:188,c:200,h:202,l:186,bull:true},
      {o:200,c:212,h:214,l:198,bull:true},
      // ADAM — sharp spike up
      {o:212,c:224,h:228,l:210,bull:true},
      {o:224,c:228,h:230,l:222,bull:true},
      {o:228,c:214,h:230,l:212,bull:false},
      {o:214,c:206,h:216,l:204,bull:false},
      // NECKLINE area
      {o:206,c:212,h:214,l:204,bull:true},
      // EVE — wide rounded top
      {o:212,c:220,h:222,l:210,bull:true},
      {o:220,c:226,h:228,l:218,bull:true},
      {o:226,c:228,h:230,l:224,bull:true},
      {o:228,c:222,h:230,l:220,bull:false},
      {o:222,c:214,h:224,l:212,bull:false},
      {o:214,c:208,h:216,l:206,bull:false},
      // BREAKDOWN
      {o:208,c:194,h:210,l:192,bull:false},
      {o:194,c:180,h:196,l:178,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Adam (sharp)',color:GOLD},
      {type:'label',candleIdx:9,offset:-18,text:'Eve (rounded)',color:GOLD},
      {type:'label',candleIdx:13,offset:-18,text:'Breakdown ↓',color:RED},
      {type:'hline',candleIdx:6,label:'Neckline'},
    ]
  },
  // ── Market Structure ──
  {
    id: 52, name: "Higher High", level: "Beginner",
    category: "Market Structure", signal: "Bullish Continuation", signalColor: TEAL,
    description: "Each successive peak is HIGHER than the previous peak. This IS the definition of an uptrend. As long as higher highs keep forming, bulls are in control. Never fight this structure.",
    entry: "On pullbacks to higher lows within the structure",
    stop: "Below the most recent higher low",
    target: "Next measured move based on swing size",
    candles: [
      {o:190,c:198,h:200,l:188,bull:true},
      {o:198,c:202,h:204,l:196,bull:true},
      // HH 1 at 208
      {o:202,c:208,h:210,l:200,bull:true},
      {o:208,c:200,h:210,l:198,bull:false},
      {o:200,c:196,h:202,l:194,bull:false},
      {o:196,c:204,h:206,l:194,bull:true},
      // HH 2 — higher at 218
      {o:204,c:216,h:220,l:202,bull:true},
      {o:216,c:206,h:220,l:204,bull:false},
      {o:206,c:200,h:208,l:198,bull:false},
      {o:200,c:210,h:212,l:199,bull:true},
      // HH 3 — even higher at 228
      {o:210,c:226,h:230,l:208,bull:true},
      {o:226,c:214,h:230,l:212,bull:false},
      {o:214,c:208,h:216,l:206,bull:false},
      {o:208,c:220,h:222,l:207,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'HH 1',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'HH 2 ↑',color:TEAL},
      {type:'label',candleIdx:10,offset:-18,text:'HH 3 ↑↑',color:TEAL},
    ]
  },
  {
    id: 53, name: "Higher Low", level: "Beginner",
    category: "Market Structure", signal: "Bullish Continuation", signalColor: TEAL,
    description: "Each successive pullback low is HIGHER than the previous low. Along with higher highs, this confirms the uptrend. The higher low IS the buy zone — where smart money adds positions.",
    entry: "At or near the higher low formation with a bullish signal",
    stop: "Below the higher low",
    target: "Previous higher high and beyond",
    candles: [
      {o:190,c:202,h:204,l:188,bull:true},
      {o:202,c:212,h:214,l:200,bull:true},
      {o:212,c:204,h:214,l:202,bull:false},
      // HL 1 at 200
      {o:204,c:200,h:206,l:198,bull:false},
      {o:200,c:212,h:214,l:198,bull:true},
      {o:212,c:222,h:224,l:210,bull:true},
      {o:222,c:212,h:224,l:210,bull:false},
      // HL 2 — higher at 208
      {o:212,c:208,h:214,l:207,bull:false},
      {o:208,c:222,h:224,l:207,bull:true},
      {o:222,c:232,h:234,l:220,bull:true},
      {o:232,c:220,h:234,l:218,bull:false},
      // HL 3 — even higher at 216
      {o:220,c:216,h:222,l:215,bull:false},
      {o:216,c:232,h:234,l:215,bull:true},
      {o:232,c:242,h:244,l:231,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-25,text:'HL 1',color:TEAL},
      {type:'label',candleIdx:7,offset:-25,text:'HL 2 ↑',color:TEAL},
      {type:'label',candleIdx:11,offset:-25,text:'HL 3 ↑↑',color:TEAL},
    ]
  },
  {
    id: 54, name: "Lower High", level: "Beginner",
    category: "Market Structure", signal: "Bearish Continuation", signalColor: RED,
    description: "Each successive bounce peak is LOWER than the previous one. This IS the definition of a downtrend. Every rally is weaker than the last. Never buy into a lower high structure.",
    entry: "On bounces to lower highs — short entry opportunity",
    stop: "Above the lower high",
    target: "Previous lower low and beyond",
    candles: [
      {o:250,c:238,h:252,l:236,bull:false},
      {o:238,c:228,h:240,l:226,bull:false},
      {o:228,c:236,h:238,l:226,bull:true},
      // LH 1 at 240
      {o:236,c:240,h:242,l:234,bull:true},
      {o:240,c:228,h:242,l:226,bull:false},
      {o:228,c:218,h:230,l:216,bull:false},
      {o:218,c:228,h:230,l:216,bull:true},
      // LH 2 — lower at 232
      {o:228,c:232,h:234,l:226,bull:true},
      {o:232,c:220,h:234,l:218,bull:false},
      {o:220,c:210,h:222,l:208,bull:false},
      {o:210,c:218,h:220,l:208,bull:true},
      // LH 3 — even lower at 222
      {o:218,c:222,h:224,l:216,bull:true},
      {o:222,c:208,h:224,l:206,bull:false},
      {o:208,c:196,h:210,l:194,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'LH 1',color:RED},
      {type:'label',candleIdx:7,offset:-18,text:'LH 2 ↓',color:RED},
      {type:'label',candleIdx:11,offset:-18,text:'LH 3 ↓↓',color:RED},
    ]
  },
  {
    id: 55, name: "Lower Low", level: "Beginner",
    category: "Market Structure", signal: "Bearish Continuation", signalColor: RED,
    description: "Each successive trough is LOWER than the previous trough. The fundamental definition of a downtrend. As long as lower lows keep forming, bears are in control. Respect the structure.",
    entry: "On bounces to lower highs — short entry",
    stop: "Above the lower high preceding the lower low",
    target: "Next measured move lower",
    candles: [
      {o:250,c:240,h:252,l:238,bull:false},
      {o:240,c:248,h:250,l:238,bull:true},
      {o:248,c:238,h:250,l:236,bull:false},
      // LL 1 at 230
      {o:238,c:230,h:240,l:228,bull:false},
      {o:230,c:240,h:242,l:228,bull:true},
      {o:240,c:230,h:242,l:228,bull:false},
      // LL 2 — lower at 218
      {o:230,c:218,h:232,l:216,bull:false},
      {o:218,c:228,h:230,l:216,bull:true},
      {o:228,c:218,h:230,l:216,bull:false},
      // LL 3 — even lower at 206
      {o:218,c:206,h:220,l:204,bull:false},
      {o:206,c:216,h:218,l:204,bull:true},
      {o:216,c:204,h:218,l:202,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-25,text:'LL 1',color:RED},
      {type:'label',candleIdx:6,offset:-25,text:'LL 2 ↓',color:RED},
      {type:'label',candleIdx:9,offset:-25,text:'LL 3 ↓↓',color:RED},
    ]
  },
  {
    id: 56, name: "Break of Structure", level: "Intermediate",
    category: "Market Structure", signal: "Bearish Reversal", signalColor: RED,
    description: "In an uptrend, price breaks BELOW a previous higher low. This is the FIRST WARNING that the trend is ending. Smart money traders use this to anticipate reversals before they happen.",
    entry: "After confirmed close below the broken structure level",
    stop: "Above the most recent high before the break",
    target: "Previous swing low",
    candles: [
      // Uptrend with higher highs and higher lows
      {o:190,c:202,h:204,l:188,bull:true},
      {o:202,c:212,h:214,l:200,bull:true},
      {o:212,c:204,h:214,l:202,bull:false},
      // HIGHER LOW at 200 — this is the level that will break
      {o:204,c:200,h:206,l:198,bull:false},
      {o:200,c:214,h:216,l:198,bull:true},
      {o:214,c:222,h:224,l:212,bull:true},
      {o:222,c:212,h:224,l:210,bull:false},
      {o:212,c:208,h:214,l:206,bull:false},
      // BOS — BREAKS BELOW the previous higher low at 200
      {o:208,c:196,h:210,l:194,bull:false},
      {o:196,c:184,h:198,l:182,bull:false},
      {o:184,c:174,h:186,l:172,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-25,text:'Higher Low (200)',color:TEAL},
      {type:'label',candleIdx:8,offset:-18,text:'BOS — breaks below!',color:RED},
      {type:'bracket',start:8,end:10,label:'Break of Structure'},
      {type:'hline',candleIdx:3,label:'Broken HL'},
    ]
  },
  {
    id: 57, name: "Change of Character", level: "Advanced",
    category: "Market Structure", signal: "Bullish Reversal", signalColor: TEAL,
    description: "In a downtrend, price breaks ABOVE a previous lower high. This is the FIRST SIGN the trend may be reversing. CHoCH is where smart money begins accumulating before the crowd notices.",
    entry: "After confirmed close above the broken lower high",
    stop: "Below the most recent low before the break",
    target: "Previous swing high",
    candles: [
      // Downtrend with lower highs and lower lows
      {o:250,c:238,h:252,l:236,bull:false},
      {o:238,c:228,h:240,l:226,bull:false},
      {o:228,c:236,h:238,l:226,bull:true},
      // LOWER HIGH at 238 — this is the level that will be broken
      {o:236,c:238,h:240,l:234,bull:true},
      {o:238,c:226,h:240,l:224,bull:false},
      {o:226,c:214,h:228,l:212,bull:false},
      {o:214,c:222,h:224,l:212,bull:true},
      // CHoCH — BREAKS ABOVE the previous lower high at 238
      {o:222,c:236,h:238,l:220,bull:true},
      {o:236,c:248,h:250,l:234,bull:true},
      {o:248,c:258,h:260,l:246,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Lower High (238)',color:RED},
      {type:'label',candleIdx:7,offset:-18,text:'CHoCH — breaks above!',color:TEAL},
      {type:'bracket',start:7,end:9,label:'Change of Character'},
      {type:'hline',candleIdx:3,label:'Broken LH'},
    ]
  },
  {
    id: 58, name: "Market Structure Shift", level: "Advanced",
    category: "Market Structure", signal: "Bullish Reversal", signalColor: TEAL,
    description: "A more decisive CHoCH — breaks a lower high with STRONG momentum candles. Confirms the trend has fully reversed from bearish to bullish. The crowd starts noticing here.",
    entry: "On the first pullback after the MSS confirmation",
    stop: "Below the MSS breakout candle low",
    target: "Previous major swing high",
    candles: [
      {o:250,c:238,h:252,l:236,bull:false},
      {o:238,c:226,h:240,l:224,bull:false},
      {o:226,c:234,h:236,l:224,bull:true},
      {o:234,c:222,h:236,l:220,bull:false},
      {o:222,c:210,h:224,l:208,bull:false},
      {o:210,c:218,h:220,l:208,bull:true},
      {o:218,c:208,h:220,l:206,bull:false},
      // MSS — explosive break with momentum through lower high
      {o:208,c:224,h:226,l:206,bull:true},
      {o:224,c:238,h:240,l:222,bull:true},
      // Pullback — buy here
      {o:238,c:230,h:240,l:228,bull:false},
      {o:230,c:244,h:246,l:228,bull:true},
      {o:244,c:256,h:258,l:242,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:1,offset:-18,text:'Downtrend',color:RED},
      {type:'label',candleIdx:7,offset:-18,text:'MSS — explosive!',color:TEAL},
      {type:'label',candleIdx:9,offset:-22,text:'Buy the pullback',color:GOLD},
      {type:'bracket',start:7,end:8,label:'Structure Shift'},
    ]
  },
  // ── Support & Resistance ──
  {
    id: 59, name: "Support Bounce", level: "Beginner",
    category: "Support & Resistance", signal: "Bullish Reversal", signalColor: TEAL,
    description: "Price falls to a previously established support level and bounces strongly. Buyers defend the level. The more times support has been tested, the stronger it is. Classic bread-and-butter setup.",
    entry: "First bullish candle off the support level",
    stop: "Below the support level",
    target: "Previous resistance or 2:1 minimum",
    candles: [
      // Establish support at 210 initially
      {o:230,c:220,h:232,l:218,bull:false},
      {o:220,c:212,h:222,l:210,bull:false},
      {o:212,c:210,h:214,l:208,bull:false},
      {o:210,c:218,h:220,l:208,bull:true},
      {o:218,c:228,h:230,l:216,bull:true},
      {o:228,c:238,h:240,l:226,bull:true},
      // PULLBACK TO SUPPORT
      {o:238,c:228,h:240,l:226,bull:false},
      {o:228,c:218,h:230,l:216,bull:false},
      {o:218,c:212,h:220,l:210,bull:false},
      // BOUNCE OFF SUPPORT at 210
      {o:212,c:210,h:214,l:208,bull:false},
      {o:210,c:222,h:224,l:208,bull:true},
      {o:222,c:234,h:236,l:220,bull:true},
      {o:234,c:244,h:246,l:232,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-25,text:'Support established',color:TEAL},
      {type:'label',candleIdx:9,offset:-25,text:'Support tested',color:GOLD},
      {type:'label',candleIdx:10,offset:-18,text:'BOUNCE ↑',color:TEAL},
      {type:'hline',candleIdx:3,label:'Support Level'},
    ]
  },
  {
    id: 60, name: "Resistance Rejection", level: "Beginner",
    category: "Support & Resistance", signal: "Bearish Reversal", signalColor: RED,
    description: "Price rallies to a previously established resistance level and gets rejected. Sellers defend the level. Mirror of the Support Bounce. The more rejections, the stronger the resistance.",
    entry: "First bearish candle after rejection from resistance",
    stop: "Above the resistance level",
    target: "Previous support or 2:1 minimum",
    candles: [
      // Establish resistance at 236
      {o:206,c:218,h:220,l:204,bull:true},
      {o:218,c:230,h:232,l:216,bull:true},
      {o:230,c:238,h:238,l:228,bull:true},
      {o:238,c:228,h:240,l:226,bull:false},
      {o:228,c:218,h:230,l:216,bull:false},
      {o:218,c:208,h:220,l:206,bull:false},
      // RALLY BACK TO RESISTANCE
      {o:208,c:220,h:222,l:206,bull:true},
      {o:220,c:232,h:234,l:218,bull:true},
      {o:232,c:236,h:238,l:230,bull:true},
      // REJECTION at resistance 236
      {o:236,c:238,h:240,l:234,bull:true},
      {o:238,c:226,h:240,l:224,bull:false},
      {o:226,c:214,h:228,l:212,bull:false},
      {o:214,c:202,h:216,l:200,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Resistance established',color:RED},
      {type:'label',candleIdx:9,offset:-18,text:'Resistance tested',color:GOLD},
      {type:'label',candleIdx:10,offset:-18,text:'REJECTION ↓',color:RED},
      {type:'hline',candleIdx:3,label:'Resistance Level'},
    ]
  },
  {
    id: 61, name: "Break and Retest", level: "Intermediate",
    category: "Support & Resistance", signal: "Bullish Continuation", signalColor: TEAL,
    description: "Price breaks ABOVE resistance, then pulls back to retest it — which now acts as SUPPORT. This flip from resistance to support is the optimal entry. Best risk-reward entry in technical analysis.",
    entry: "On the retest of the broken resistance (now support)",
    stop: "Below the retested level — if it fails, the breakout failed",
    target: "Measured move equal to the prior range",
    candles: [
      {o:196,c:206,h:208,l:194,bull:true},
      {o:206,c:214,h:216,l:204,bull:true},
      // RESISTANCE at 220 — tested and held
      {o:214,c:220,h:222,l:212,bull:true},
      {o:220,c:212,h:222,l:210,bull:false},
      {o:212,c:218,h:220,l:210,bull:true},
      // BREAKOUT above 220
      {o:218,c:230,h:232,l:216,bull:true},
      {o:230,c:240,h:242,l:228,bull:true},
      // RETEST — pulls back to 220 (now support)
      {o:240,c:230,h:242,l:228,bull:false},
      {o:230,c:222,h:232,l:220,bull:false},
      // HOLDS at 220 — perfect entry
      {o:222,c:220,h:224,l:218,bull:false},
      {o:220,c:232,h:234,l:218,bull:true},
      // CONTINUATION
      {o:232,c:244,h:246,l:230,bull:true},
      {o:244,c:254,h:256,l:242,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Resistance 220',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'BREAKOUT ↑',color:TEAL},
      {type:'label',candleIdx:9,offset:-22,text:'RETEST — buy here',color:GOLD},
      {type:'label',candleIdx:10,offset:-18,text:'Continues ↑',color:TEAL},
      {type:'hline',candleIdx:3,label:'R → S Flip'},
    ]
  },
  {
    id: 62, name: "Failed Breakout", level: "Intermediate",
    category: "Support & Resistance", signal: "Bearish Reversal", signalColor: RED,
    description: "Price breaks ABOVE resistance but immediately reverses back below it — trapping bulls who bought the breakout. Their forced selling creates a sharp drop. Also called a Bull Trap.",
    entry: "When price closes back below the breakout level",
    stop: "Above the failed breakout high",
    target: "Previous support level",
    candles: [
      {o:196,c:208,h:210,l:194,bull:true},
      {o:208,c:218,h:220,l:206,bull:true},
      // Resistance at 224
      {o:218,c:224,h:226,l:216,bull:true},
      {o:224,c:216,h:226,l:214,bull:false},
      {o:216,c:222,h:224,l:214,bull:true},
      // FALSE BREAKOUT — breaks above but immediately fails
      {o:222,c:230,h:232,l:220,bull:true},
      {o:230,c:222,h:234,l:220,bull:false},
      // BULL TRAP — closes back below resistance
      {o:222,c:212,h:224,l:210,bull:false},
      {o:212,c:200,h:214,l:198,bull:false},
      {o:200,c:190,h:202,l:188,bull:false},
      {o:190,c:180,h:192,l:178,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Resistance 224',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'False break ↑',color:GOLD},
      {type:'label',candleIdx:7,offset:-18,text:'TRAP — drops hard ↓',color:RED},
      {type:'bracket',start:5,end:6,label:'Bull Trap'},
    ]
  },
  {
    id: 63, name: "Failed Breakdown", level: "Intermediate",
    category: "Support & Resistance", signal: "Bullish Reversal", signalColor: TEAL,
    description: "Price breaks BELOW support but immediately reverses back above — trapping bears who shorted the breakdown. Their forced covering creates a sharp rally. Also called a Bear Trap.",
    entry: "When price closes back above the breakdown level",
    stop: "Below the failed breakdown low",
    target: "Previous resistance level",
    candles: [
      {o:250,c:240,h:252,l:238,bull:false},
      {o:240,c:230,h:242,l:228,bull:false},
      // Support at 222
      {o:230,c:224,h:232,l:222,bull:false},
      {o:224,c:230,h:232,l:222,bull:true},
      {o:230,c:224,h:232,l:222,bull:false},
      // FALSE BREAKDOWN — breaks below but immediately recovers
      {o:224,c:214,h:226,l:212,bull:false},
      {o:214,c:226,h:228,l:212,bull:true},
      // BEAR TRAP — closes back above support
      {o:226,c:236,h:238,l:224,bull:true},
      {o:236,c:248,h:250,l:234,bull:true},
      {o:248,c:258,h:260,l:246,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-22,text:'Support 222',color:TEAL},
      {type:'label',candleIdx:5,offset:-22,text:'False break ↓',color:GOLD},
      {type:'label',candleIdx:6,offset:-18,text:'BEAR TRAP — rockets ↑',color:TEAL},
      {type:'bracket',start:5,end:6,label:'Bear Trap'},
    ]
  },
  {
    id: 64, name: "Range Expansion", level: "Intermediate",
    category: "Support & Resistance", signal: "Bullish Continuation", signalColor: TEAL,
    description: "After a period of tight range-bound trading (low volatility), price breaks out with a dramatically larger candle — range expansion. This signals the start of a new directional move.",
    entry: "On the expansion candle or first retest",
    stop: "Below the consolidation low",
    target: "Measured move equal to the consolidation height",
    candles: [
      // TIGHT RANGE — consolidation
      {o:208,c:212,h:214,l:206,bull:true},
      {o:212,c:208,h:214,l:206,bull:false},
      {o:208,c:212,h:214,l:206,bull:true},
      {o:212,c:209,h:214,l:207,bull:false},
      {o:209,c:212,h:214,l:207,bull:true},
      {o:212,c:209,h:214,l:207,bull:false},
      {o:209,c:211,h:213,l:208,bull:true},
      // EXPANSION — massive candle breaks out
      {o:211,c:230,h:232,l:209,bull:true},
      {o:230,c:244,h:246,l:228,bull:true},
      {o:244,c:256,h:258,l:242,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Tight range — coiling',color:GOLD},
      {type:'label',candleIdx:7,offset:-18,text:'EXPANSION ↑',color:TEAL},
    ]
  },
  {
    id: 65, name: "Range Contraction", level: "Intermediate",
    category: "Support & Resistance", signal: "Indecision", signalColor: GOLD,
    description: "Candles get progressively SMALLER — the market is coiling like a spring. This IS the setup. Do not trade the contraction itself. Wait for the explosion in either direction.",
    entry: "On breakout above or below the contracting range — not before",
    stop: "Opposite end of the contraction",
    target: "Equal to the contraction length in breakout direction",
    candles: [
      {o:200,c:214,h:216,l:198,bull:true},
      {o:214,c:202,h:216,l:200,bull:false},
      {o:202,c:212,h:214,l:200,bull:true},
      {o:212,c:204,h:214,l:202,bull:false},
      {o:204,c:210,h:212,l:202,bull:true},
      {o:210,c:205,h:212,l:204,bull:false},
      {o:205,c:209,h:210,l:204,bull:true},
      {o:209,c:206,h:210,l:205,bull:false},
      {o:206,c:208,h:209,l:205,bull:true},
      // BREAKOUT — explosion
      {o:208,c:222,h:224,l:207,bull:true},
      {o:222,c:234,h:236,l:221,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:1,offset:-18,text:'Wide range',color:GOLD},
      {type:'label',candleIdx:4,offset:-18,text:'Narrowing...',color:GOLD},
      {type:'label',candleIdx:7,offset:-18,text:'Almost there...',color:GOLD},
      {type:'label',candleIdx:9,offset:-18,text:'EXPLOSION ↑',color:TEAL},
    ]
  },
  // ── Price Action ──
  {
    id: 66, name: "Inside Bar", level: "Beginner",
    category: "Price Action", signal: "Indecision", signalColor: GOLD,
    description: "A candle whose high AND low are completely within the range of the previous candle (the mother bar). The market is pausing. Energy is building. Trade the breakout — not the inside bar itself.",
    entry: "Break above the mother bar high (bull) or below the low (bear)",
    stop: "Opposite end of the inside bar",
    target: "Measured move equal to the mother bar range",
    candles: [
      {o:196,c:206,h:208,l:194,bull:true},
      {o:206,c:216,h:218,l:204,bull:true},
      {o:216,c:226,h:228,l:214,bull:true},
      // MOTHER BAR — large range
      {o:226,c:212,h:230,l:210,bull:false},
      // INSIDE BAR — entire range fits inside mother
      {o:220,c:216,h:222,l:214,bull:false},
      // BREAKOUT UP
      {o:216,c:232,h:234,l:214,bull:true},
      {o:232,c:244,h:246,l:230,bull:true},
      {o:244,c:254,h:256,l:242,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Mother bar',color:GOLD},
      {type:'label',candleIdx:4,offset:-18,text:'Inside bar',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'BREAKOUT ↑',color:TEAL},
    ]
  },
  {
    id: 67, name: "Outside Bar", level: "Beginner",
    category: "Price Action", signal: "Indecision", signalColor: GOLD,
    description: "A candle that engulfs the ENTIRE range of the previous candle — higher high AND lower low. Represents volatility expansion. The direction of the CLOSE tells you the bias.",
    entry: "In the direction of the outside bar close",
    stop: "Beyond the outside bar extreme opposite the close",
    target: "Previous swing high (bullish close) or low (bearish close)",
    candles: [
      {o:200,c:208,h:210,l:198,bull:true},
      {o:208,c:214,h:216,l:206,bull:true},
      {o:214,c:210,h:216,l:208,bull:false},
      // OUTSIDE BAR — wider than prev, closes bullish
      {o:208,c:220,h:222,l:204,bull:true},
      {o:220,c:230,h:232,l:218,bull:true},
      {o:230,c:240,h:242,l:228,bull:true},
      {o:240,c:250,h:252,l:238,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Previous bar',color:GOLD},
      {type:'label',candleIdx:3,offset:-25,text:'Outside bar — engulfs all',color:TEAL},
      {type:'label',candleIdx:3,offset:-38,text:'Bullish close = bull bias',color:TEAL},
    ]
  },
  {
    id: 68, name: "NR7", level: "Advanced",
    category: "Price Action", signal: "Indecision", signalColor: GOLD,
    description: "The NARROWEST Range candle of the last 7 candles. Extreme compression. Statistically, NR7 candles are followed by significant moves. The spring is fully coiled. Wait for the pop.",
    entry: "Break above NR7 high (bull) or below NR7 low (bear)",
    stop: "Opposite end of the NR7 candle",
    target: "Average of the prior 7 candle ranges from breakout",
    candles: [
      {o:200,c:214,h:218,l:198,bull:true},
      {o:214,c:204,h:218,l:202,bull:false},
      {o:204,c:216,h:218,l:202,bull:true},
      {o:216,c:206,h:218,l:204,bull:false},
      {o:206,c:214,h:216,l:204,bull:true},
      {o:214,c:207,h:216,l:205,bull:false},
      // NR7 — absolute narrowest candle
      {o:208,c:210,h:211,l:207,bull:true},
      // EXPLOSIVE BREAKOUT
      {o:210,c:226,h:228,l:209,bull:true},
      {o:226,c:240,h:242,l:224,bull:true},
      {o:240,c:252,h:254,l:238,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:6,offset:-22,text:'NR7 — narrowest!',color:GOLD},
      {type:'label',candleIdx:7,offset:-18,text:'EXPLOSION ↑',color:TEAL},
    ]
  },
  {
    id: 69, name: "Fakey Pattern", level: "Advanced",
    category: "Price Action", signal: "Bullish Reversal", signalColor: TEAL,
    description: "An inside bar breaks out in one direction (the fake), then immediately reverses and explodes the opposite way. The market fakes out the obvious traders then goes the real direction. High accuracy.",
    entry: "When price reverses back through the inside bar range",
    stop: "Beyond the fakeout extreme",
    target: "Measured move in the true direction",
    candles: [
      {o:196,c:208,h:210,l:194,bull:true},
      {o:208,c:218,h:220,l:206,bull:true},
      // MOTHER BAR
      {o:218,c:208,h:222,l:206,bull:false},
      // INSIDE BAR
      {o:212,c:216,h:218,l:210,bull:true},
      // FAKEOUT — breaks below the inside bar low
      {o:216,c:206,h:218,l:204,bull:false},
      // REVERSAL — real direction is UP
      {o:206,c:220,h:222,l:204,bull:true},
      {o:220,c:234,h:236,l:218,bull:true},
      {o:234,c:246,h:248,l:232,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Inside bar',color:GOLD},
      {type:'label',candleIdx:4,offset:-25,text:'FAKEOUT ↓',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Real move ↑',color:TEAL},
      {type:'bracket',start:4,end:5,label:'Fakey'},
    ]
  },
  {
    id: 70, name: "Pin Bar Reversal", level: "Beginner",
    category: "Price Action", signal: "Bullish Reversal", signalColor: TEAL,
    description: "A candle with a tiny body and a very long wick (2-3x the body) pointing INTO a key level. The wick = rejection of that price. The longer the wick, the stronger the signal. Very clean setup.",
    entry: "Above the high of the bullish pin bar (below the low for bearish)",
    stop: "Beyond the tip of the pin bar wick",
    target: "Previous swing high or 2:1 minimum",
    candles: [
      {o:242,c:232,h:244,l:230,bull:false},
      {o:232,c:222,h:234,l:220,bull:false},
      {o:222,c:212,h:224,l:210,bull:false},
      {o:212,c:204,h:214,l:202,bull:false},
      // BULLISH PIN BAR — tiny body, massive lower wick into support
      {o:202,c:204,h:205,l:182,bull:true},
      // Strong recovery
      {o:204,c:216,h:218,l:202,bull:true},
      {o:216,c:228,h:230,l:214,bull:true},
      {o:228,c:240,h:242,l:226,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-35,text:'Tiny body',color:TEAL},
      {type:'label',candleIdx:4,offset:-48,text:'Massive wick = rejection',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'Strong recovery ↑',color:TEAL},
    ]
  },
  {
    id: 71, name: "Expansion Candle", level: "Intermediate",
    category: "Price Action", signal: "Bullish Continuation", signalColor: TEAL,
    description: "A candle dramatically larger than the recent average — sudden surge in momentum and volume. Institutional participation is obvious. Often leads to trend continuation in the same direction.",
    entry: "Open of the next candle or first retest of expansion candle midpoint",
    stop: "Below the midpoint of the expansion candle",
    target: "Measured move equal to the expansion candle length",
    candles: [
      // Small candles — normal activity
      {o:196,c:200,h:202,l:194,bull:true},
      {o:200,c:196,h:202,l:194,bull:false},
      {o:196,c:200,h:202,l:194,bull:true},
      {o:200,c:197,h:202,l:195,bull:false},
      // EXPANSION CANDLE — massive vs prior
      {o:197,c:222,h:224,l:195,bull:true},
      // Continuation
      {o:222,c:232,h:234,l:220,bull:true},
      {o:232,c:242,h:244,l:230,bull:true},
      {o:242,c:250,h:252,l:240,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Normal size candles',color:GOLD},
      {type:'label',candleIdx:4,offset:-18,text:'EXPANSION — institutions!',color:TEAL},
    ]
  },
  {
    id: 72, name: "Exhaustion Candle", level: "Intermediate",
    category: "Price Action", signal: "Bearish Reversal", signalColor: RED,
    description: "A very large candle in the trend direction that closes near its OPEN after a massive upper wick. All buyers exhausted in one bar — no one left to buy. Reversal signal.",
    entry: "Wait for next candle to confirm reversal",
    stop: "Beyond the exhaustion candle extreme",
    target: "50-61.8% retracement of the exhaustion candle",
    candles: [
      {o:188,c:200,h:202,l:186,bull:true},
      {o:200,c:212,h:214,l:198,bull:true},
      {o:212,c:224,h:226,l:210,bull:true},
      {o:224,c:234,h:236,l:222,bull:true},
      // EXHAUSTION — huge wick up, closes near open
      {o:234,c:236,h:256,l:232,bull:true},
      // REVERSAL begins
      {o:236,c:224,h:238,l:222,bull:false},
      {o:224,c:212,h:226,l:210,bull:false},
      {o:212,c:200,h:214,l:198,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Huge wick = exhaustion',color:RED},
      {type:'label',candleIdx:4,offset:-32,text:'Closes near open',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'Reversal starts ↓',color:RED},
    ]
  },
  // ── Gap Patterns ──
  {
    id: 73, name: "Gap Up Continuation", level: "Intermediate",
    category: "Gap Pattern", signal: "Bullish Continuation", signalColor: TEAL,
    description: "Price GAPS UP at the open — a space between yesterday's close and today's open — and keeps going higher without filling the gap. Strong institutional buying. The unfilled gap acts as support.",
    entry: "Open of the gap-up session or first pullback to the gap",
    stop: "Below the bottom of the gap",
    target: "Measured move equal to the prior trend leg",
    candles: [
      {o:190,c:200,h:202,l:188,bull:true},
      {o:200,c:210,h:212,l:198,bull:true},
      {o:210,c:208,h:212,l:206,bull:false},
      {o:208,c:212,h:214,l:206,bull:true},
      // GAP UP — opens way above prior close
      {o:222,c:232,h:234,l:220,bull:true},
      {o:232,c:242,h:244,l:230,bull:true},
      {o:242,c:250,h:252,l:240,bull:true},
      // Pullback — gap acts as support
      {o:250,c:240,h:252,l:238,bull:false},
      {o:240,c:248,h:250,l:238,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Pre-gap close',color:GOLD},
      {type:'label',candleIdx:4,offset:-18,text:'GAP UP ↑',color:TEAL},
      {type:'bracket',start:3,end:4,label:'Gap Zone'},
    ]
  },
  {
    id: 74, name: "Gap Up Reversal", level: "Intermediate",
    category: "Gap Pattern", signal: "Bearish Reversal", signalColor: RED,
    description: "Price gaps UP but immediately sells off and reverses, closing the gap and going below the prior close. Known as an exhaustion gap. The buying was the last gasp — now sellers take over.",
    entry: "When price closes below the bottom of the gap",
    stop: "Above the gap-up open",
    target: "Prior swing low",
    candles: [
      {o:188,c:200,h:202,l:186,bull:true},
      {o:200,c:212,h:214,l:198,bull:true},
      {o:212,c:222,h:224,l:210,bull:true},
      {o:222,c:230,h:232,l:220,bull:true},
      // GAP UP then immediate reversal
      {o:242,c:236,h:248,l:234,bull:false},
      {o:236,c:224,h:238,l:222,bull:false},
      {o:224,c:212,h:226,l:210,bull:false},
      {o:212,c:200,h:214,l:198,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Pre-gap close',color:GOLD},
      {type:'label',candleIdx:4,offset:-18,text:'Gap up — then FAIL ↓',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Sellers take over',color:RED},
    ]
  },
  {
    id: 75, name: "Gap Fill", level: "Beginner",
    category: "Gap Pattern", signal: "Bearish Reversal", signalColor: RED,
    description: "After a gap up, price retraces all the way back to fill the gap (return to pre-gap prices). Markets fill gaps approximately 70% of the time. The gap acts like a magnet pulling price back.",
    entry: "Short when gap fill begins OR at the gap's top targeting full fill",
    stop: "Above the high of the gap-up session",
    target: "Bottom of the gap (full fill)",
    candles: [
      {o:192,c:202,h:204,l:190,bull:true},
      {o:202,c:210,h:212,l:200,bull:true},
      {o:210,c:208,h:212,l:206,bull:false},
      // GAP UP
      {o:220,c:230,h:232,l:218,bull:true},
      {o:230,c:238,h:240,l:228,bull:true},
      // FILLING THE GAP — price falls back
      {o:238,c:228,h:240,l:226,bull:false},
      {o:228,c:218,h:230,l:216,bull:false},
      {o:218,c:210,h:220,l:208,bull:false},
      // GAP FILLED — back to pre-gap level
      {o:210,c:208,h:212,l:206,bull:false},
      {o:208,c:214,h:216,l:206,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Pre-gap level',color:GOLD},
      {type:'label',candleIdx:3,offset:-18,text:'GAP UP',color:TEAL},
      {type:'label',candleIdx:7,offset:-22,text:'Filling gap ↓',color:RED},
      {type:'label',candleIdx:8,offset:-22,text:'GAP FILLED ✓',color:GOLD},
      {type:'bracket',start:2,end:3,label:'Gap Zone'},
    ]
  },
  {
    id: 76, name: "Breakaway Gap", level: "Advanced",
    category: "Gap Pattern", signal: "Bullish Continuation", signalColor: TEAL,
    description: "A gap that occurs at the breakout from a consolidation pattern. It SIGNALS the start of a major new move. These gaps rarely fill quickly — they represent genuine institutional conviction.",
    entry: "Open of the breakaway gap session",
    stop: "Below the bottom of the gap",
    target: "Measured move from the pattern height — these run far",
    candles: [
      // Consolidation
      {o:208,c:214,h:216,l:206,bull:true},
      {o:214,c:208,h:216,l:206,bull:false},
      {o:208,c:214,h:216,l:206,bull:true},
      {o:214,c:209,h:216,l:207,bull:false},
      {o:209,c:213,h:215,l:208,bull:true},
      // BREAKAWAY GAP — explodes out of consolidation with a gap
      {o:222,c:234,h:236,l:220,bull:true},
      {o:234,c:246,h:248,l:232,bull:true},
      {o:246,c:256,h:258,l:244,bull:true},
      {o:256,c:266,h:268,l:254,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Consolidation zone',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'BREAKAWAY GAP ↑',color:TEAL},
      {type:'bracket',start:4,end:5,label:'The Gap'},
    ]
  },
  {
    id: 77, name: "Exhaustion Gap", level: "Advanced",
    category: "Gap Pattern", signal: "Bearish Reversal", signalColor: RED,
    description: "A gap at the END of a strong trend — the last desperate move by the crowd before reversal. High volume, extreme sentiment. Smart money is selling into the gap. Fade this gap.",
    entry: "After reversal confirmation on high volume",
    stop: "Beyond the exhaustion gap extreme",
    target: "50-61.8% retracement of the entire trend",
    candles: [
      {o:188,c:202,h:204,l:186,bull:true},
      {o:202,c:216,h:218,l:200,bull:true},
      {o:216,c:228,h:230,l:214,bull:true},
      {o:228,c:238,h:240,l:226,bull:true},
      // EXHAUSTION GAP — gaps up at end of trend then reverses
      {o:252,c:246,h:260,l:244,bull:false},
      {o:246,c:234,h:248,l:232,bull:false},
      {o:234,c:220,h:236,l:218,bull:false},
      {o:220,c:208,h:222,l:206,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Trend end',color:GOLD},
      {type:'label',candleIdx:4,offset:-18,text:'EXHAUSTION GAP ↑ then ↓',color:RED},
      {type:'bracket',start:3,end:4,label:'Final Gap'},
    ]
  },
  {
    id: 78, name: "Runaway Gap", level: "Advanced",
    category: "Gap Pattern", signal: "Bullish Continuation", signalColor: TEAL,
    description: "A gap in the MIDDLE of a strong trend — also called a measuring or continuation gap. Confirms the trend has significant momentum remaining. Use the gap to measure how far the trend will go.",
    entry: "Open of the runaway gap session",
    stop: "Below the bottom of the gap",
    target: "Distance from trend start to gap, projected forward from gap",
    candles: [
      // Start of trend
      {o:186,c:198,h:200,l:184,bull:true},
      {o:198,c:210,h:212,l:196,bull:true},
      {o:210,c:218,h:220,l:208,bull:true},
      // RUNAWAY GAP in the middle of trend
      {o:228,c:240,h:242,l:226,bull:true},
      {o:240,c:250,h:252,l:238,bull:true},
      {o:250,c:260,h:262,l:248,bull:true},
      {o:260,c:268,h:270,l:258,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Mid-trend',color:TEAL},
      {type:'label',candleIdx:3,offset:-18,text:'RUNAWAY GAP ↑',color:TEAL},
      {type:'bracket',start:2,end:3,label:'Gap'},
    ]
  },
  // ── Volume Patterns ──
  {
    id: 79, name: "Volume Spike Breakout", level: "Intermediate",
    category: "Volume Pattern", signal: "Bullish Continuation", signalColor: TEAL,
    description: "A breakout from a key level accompanied by a volume SPIKE 2-3x above average. Volume is the fuel — without it, breakouts fail. With it, institutions are participating and the move is real.",
    entry: "On the high-volume breakout candle",
    stop: "Below the breakout level",
    target: "Measured move from the consolidation height",
    candles: [
      // Consolidation near resistance
      {o:208,c:214,h:216,l:206,bull:true},
      {o:214,c:208,h:216,l:206,bull:false},
      {o:208,c:213,h:215,l:207,bull:true},
      {o:213,c:208,h:215,l:206,bull:false},
      {o:208,c:212,h:215,l:207,bull:true},
      // VOLUME SPIKE BREAKOUT — massive volume + large candle
      {o:212,c:228,h:230,l:210,bull:true},
      {o:228,c:242,h:244,l:226,bull:true},
      {o:242,c:254,h:256,l:240,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Consolidation',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'VOL SPIKE + BREAK ↑',color:TEAL},
    ]
  },
  {
    id: 80, name: "Volume Climax", level: "Advanced",
    category: "Volume Pattern", signal: "Bearish Reversal", signalColor: RED,
    description: "Extremely high volume on a move that quickly reverses. Every available buyer/seller exhausted in one massive burst. The crowd panics in — smart money walks out. Classic reversal signal.",
    entry: "After price reverses from the climax candle",
    stop: "Beyond the climax candle extreme",
    target: "50-61.8% retracement of the prior move",
    candles: [
      {o:188,c:200,h:202,l:186,bull:true},
      {o:200,c:212,h:214,l:198,bull:true},
      {o:212,c:224,h:226,l:210,bull:true},
      {o:224,c:234,h:236,l:222,bull:true},
      // CLIMAX — massive move but reverses
      {o:234,c:228,h:252,l:226,bull:false},
      {o:228,c:216,h:230,l:214,bull:false},
      {o:216,c:204,h:218,l:202,bull:false},
      {o:204,c:192,h:206,l:190,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'CLIMAX — massive vol',color:RED},
      {type:'label',candleIdx:4,offset:-32,text:'Reverses hard ↓',color:RED},
    ]
  },
  {
    id: 81, name: "Volume Divergence", level: "Advanced",
    category: "Volume Pattern", signal: "Bearish Reversal", signalColor: RED,
    description: "Price makes HIGHER highs while volume makes LOWER highs. The rally is happening on less and less fuel. Institutional selling is absorbing the buying. Volume leads price — divergence warns of reversal.",
    entry: "After price confirms the divergence with a reversal candle",
    stop: "Above the most recent high",
    target: "Previous swing low",
    candles: [
      {o:188,c:200,h:202,l:186,bull:true},
      {o:200,c:210,h:212,l:198,bull:true},
      {o:210,c:206,h:212,l:204,bull:false},
      // Higher high but weaker
      {o:206,c:216,h:218,l:204,bull:true},
      {o:216,c:210,h:218,l:208,bull:false},
      // Even higher high, even weaker volume implied
      {o:210,c:220,h:222,l:208,bull:true},
      {o:220,c:212,h:222,l:210,bull:false},
      // REVERSAL
      {o:212,c:200,h:214,l:198,bull:false},
      {o:200,c:188,h:202,l:186,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'HH — normal vol',color:TEAL},
      {type:'label',candleIdx:5,offset:-18,text:'HH — lower vol ⚠',color:GOLD},
      {type:'label',candleIdx:7,offset:-18,text:'Reversal ↓',color:RED},
    ]
  },
  {
    id: 82, name: "Accumulation", level: "Advanced",
    category: "Volume Pattern", signal: "Bullish Reversal", signalColor: TEAL,
    description: "Sideways price action with RISING volume on up days and DECLINING volume on down days. Smart money quietly buying. Price hasn't moved yet — but the fuel is building. Breakout is coming.",
    entry: "On breakout above the accumulation range with volume",
    stop: "Below the low of the accumulation zone",
    target: "Measured move equal to the accumulation range height",
    candles: [
      {o:242,c:230,h:244,l:228,bull:false},
      {o:230,c:220,h:232,l:218,bull:false},
      // ACCUMULATION — sideways with subtle signs of buying
      {o:220,c:226,h:228,l:218,bull:true},
      {o:226,c:220,h:228,l:218,bull:false},
      {o:220,c:228,h:230,l:218,bull:true},
      {o:228,c:222,h:230,l:220,bull:false},
      {o:222,c:230,h:232,l:220,bull:true},
      // BREAKOUT — accumulated energy releases
      {o:230,c:246,h:248,l:228,bull:true},
      {o:246,c:260,h:262,l:244,bull:true},
      {o:260,c:272,h:274,l:258,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Smart money buying',color:GOLD},
      {type:'label',candleIdx:7,offset:-18,text:'BREAKOUT ↑',color:TEAL},
    ]
  },
  {
    id: 83, name: "Distribution", level: "Advanced",
    category: "Volume Pattern", signal: "Bearish Reversal", signalColor: RED,
    description: "Sideways price action at a TOP with rising volume on down days and declining volume on up days. Smart money quietly SELLING. Price looks stable but the foundation is crumbling. Breakdown coming.",
    entry: "On breakdown below the distribution range with volume",
    stop: "Above the high of the distribution zone",
    target: "Measured move equal to the distribution range height",
    candles: [
      {o:188,c:200,h:202,l:186,bull:true},
      {o:200,c:212,h:214,l:198,bull:true},
      // DISTRIBUTION — sideways with subtle selling
      {o:212,c:220,h:222,l:210,bull:true},
      {o:220,c:212,h:222,l:210,bull:false},
      {o:212,c:220,h:222,l:210,bull:true},
      {o:220,c:212,h:222,l:210,bull:false},
      {o:212,c:218,h:222,l:210,bull:true},
      // BREAKDOWN — distribution complete
      {o:218,c:204,h:220,l:202,bull:false},
      {o:204,c:190,h:206,l:188,bull:false},
      {o:190,c:178,h:192,l:176,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Smart money selling',color:GOLD},
      {type:'label',candleIdx:7,offset:-18,text:'BREAKDOWN ↓',color:RED},
    ]
  },
  {
    id: 84, name: "Dry-Up Volume", level: "Intermediate",
    category: "Volume Pattern", signal: "Bullish Continuation", signalColor: TEAL,
    description: "Volume DRIES UP completely during a pullback in an uptrend. Low volume on pullbacks means sellers are NOT motivated — nobody wants to sell. The trend will resume when buyers step back in.",
    entry: "When volume picks back up in the trend direction",
    stop: "Below the low of the dry-up pullback",
    target: "Previous high and continuation of the trend",
    candles: [
      // Strong uptrend
      {o:188,c:202,h:204,l:186,bull:true},
      {o:202,c:216,h:218,l:200,bull:true},
      {o:216,c:228,h:230,l:214,bull:true},
      // DRY-UP PULLBACK — tiny candles, no volume
      {o:228,c:224,h:230,l:222,bull:false},
      {o:224,c:221,h:226,l:220,bull:false},
      {o:221,c:223,h:225,l:220,bull:true},
      {o:223,c:221,h:225,l:220,bull:false},
      // VOLUME RETURNS — trend resumes
      {o:221,c:236,h:238,l:219,bull:true},
      {o:236,c:250,h:252,l:234,bull:true},
      {o:250,c:262,h:264,l:248,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Dry-up — no sellers',color:GOLD},
      {type:'label',candleIdx:7,offset:-18,text:'Volume returns ↑',color:TEAL},
    ]
  },
];


// ─────────────────────────────────────────────
// TRQX EDUCATION ENRICHMENT ENGINE
// Adds deeper flash-card learning fields to every pattern automatically.
// Keeps your original candle data and annotations untouched.
// ─────────────────────────────────────────────
function getPatternBias(pattern) {
  const s = (pattern.signal || "").toLowerCase();
  if (s.includes("bullish")) return "bullish";
  if (s.includes("bearish")) return "bearish";
  return "neutral";
}

function getOppositeLevel(pattern) {
  const bias = getPatternBias(pattern);
  if (bias === "bullish") return "resistance";
  if (bias === "bearish") return "support";
  return "opposite side of the range";
}

function getDirectionWord(pattern) {
  const bias = getPatternBias(pattern);
  if (bias === "bullish") return "higher";
  if (bias === "bearish") return "lower";
  return "in the breakout direction";
}

function getOptionsPlay(pattern) {
  const bias = getPatternBias(pattern);
  if (bias === "bullish") {
    return "For options traders, consider ATM or slightly ITM calls after confirmation. Avoid chasing if implied volatility is elevated or price is directly under resistance.";
  }
  if (bias === "bearish") {
    return "For options traders, consider ATM or slightly ITM puts after confirmation. Avoid chasing if implied volatility is elevated or price is directly above support.";
  }
  return "For options traders, wait for directional confirmation first. Neutral patterns should not be traded with calls or puts until price breaks structure.";
}

function getConfidence(pattern) {
  const name = (pattern.name || "").toLowerCase();
  const signal = (pattern.signal || "").toLowerCase();

  if (name.includes("abandoned baby")) return 9.0;
  if (name.includes("three white") || name.includes("three black")) return 8.8;
  if (name.includes("engulfing")) return 8.5;
  if (name.includes("morning") || name.includes("evening")) return 8.4;
  if (name.includes("hammer") || name.includes("shooting star")) return 8.1;
  if (name.includes("triangle") || name.includes("flag") || name.includes("pennant")) return 8.0;
  if (name.includes("doji") || signal.includes("indecision")) return 6.8;
  if (name.includes("channel") || name.includes("rectangle")) return 7.5;

  return pattern.level === "Advanced" ? 8.2 : pattern.level === "Intermediate" ? 7.8 : 7.3;
}

function getSuccessRate(pattern) {
  const c = getConfidence(pattern);
  if (c >= 8.8) return "70-78% with strong confirmation";
  if (c >= 8.2) return "65-72% with confirmation";
  if (c >= 7.5) return "60-68% with confirmation";
  if (c >= 6.8) return "55-62% with confirmation";
  return "Context-dependent";
}

function getIdealLocation(pattern) {
  const bias = getPatternBias(pattern);
  const category = pattern.category || "";

  if (category.includes("Chart")) {
    return "Clean trend structure, major support/resistance, VWAP, prior day high/low, supply/demand zones, and areas where volume confirms the breakout or rejection.";
  }

  if (bias === "bullish") {
    return "Major support, demand zone, VWAP reclaim, 20 EMA, 50 EMA, previous day low, gamma flip support, put wall, or bullish order block.";
  }

  if (bias === "bearish") {
    return "Major resistance, supply zone, VWAP rejection, 20 EMA, 50 EMA, previous day high, call wall, gamma flip rejection, or bearish order block.";
  }

  return "Major support/resistance, VWAP, high-volume nodes, previous day high/low, or any key level where a breakout could define the next move.";
}

function enhancePattern(pattern) {
  const bias = getPatternBias(pattern);
  const direction = getDirectionWord(pattern);
  const opposite = getOppositeLevel(pattern);
  const isNeutral = bias === "neutral";
  const isBullish = bias === "bullish";
  const isBearish = bias === "bearish";

  const psychology = isBullish
    ? "Sellers were in control, but buyers stepped in with enough force to absorb supply and shift control. The pattern shows demand building and a possible move higher."
    : isBearish
    ? "Buyers were in control, but sellers stepped in with enough force to absorb demand and shift control. The pattern shows supply building and a possible move lower."
    : "Buyers and sellers are fighting for control. Neither side has full command yet, so confirmation is required before taking a trade.";

  const marketContext = isBullish
    ? "Best after a pullback, selloff, or reaction into support. Weak if it appears in the middle of chop or directly under major resistance."
    : isBearish
    ? "Best after a rally, failed breakout, or reaction into resistance. Weak if it appears in the middle of chop or directly above major support."
    : "Best near key levels where a break of the candle range can define direction. Avoid forcing trades before confirmation.";

  const requirements = isNeutral
    ? [
        "Pattern should form near a meaningful level.",
        "Range should be clearly visible.",
        "Wait for a candle to break and close outside the pattern range.",
        "Avoid entering before direction is confirmed."
      ]
    : [
        `Pattern should appear after pressure in the opposite direction or near a key ${isBullish ? "support" : "resistance"} level.`,
        "Pattern shape should be clear and easy to identify.",
        "The signal candle should close with conviction.",
        "Higher volume increases reliability."
      ];

  const confirmation = isNeutral
    ? [
        "Break above or below the pattern range.",
        "Strong follow-through candle.",
        "Volume expansion on the breakout.",
        "Market direction supports the move."
      ]
    : [
        "Follow-through candle in the expected direction.",
        `Break of nearby ${isBullish ? "resistance" : "support"} or structure.`,
        "Volume expansion on the signal candle.",
        "Broad market or sector confirmation."
      ];

  const institutionalClues = isBullish
    ? [
        "Unusual call flow appears after the pattern.",
        "Dark pool support prints near the low.",
        "Price reclaims VWAP.",
        "Gamma flip, put wall, or demand zone sits near support."
      ]
    : isBearish
    ? [
        "Unusual put flow appears after the pattern.",
        "Dark pool resistance prints near the high.",
        "Price rejects VWAP.",
        "Gamma flip, call wall, or supply zone sits near resistance."
      ]
    : [
        "Flow begins stacking after the breakout direction is confirmed.",
        "VWAP acceptance confirms direction.",
        "Volume expands after compression.",
        "Market internals support the breakout."
      ];

  return {
    ...pattern,

    confidence: pattern.confidence ?? getConfidence(pattern),
    successRate: pattern.successRate ?? getSuccessRate(pattern),

    psychology: pattern.psychology ?? psychology,

    marketContext: pattern.marketContext ?? marketContext,

    idealLocation: pattern.idealLocation ?? getIdealLocation(pattern),

    requirements: pattern.requirements ?? requirements,

    confirmation: pattern.confirmation ?? confirmation,

    volumeProfile:
      pattern.volumeProfile ??
      "Best when volume expands on the signal candle or breakout. Low volume reduces reliability and increases the chance of a fakeout.",

    timeframe:
      pattern.timeframe ?? ["5m", "15m", "1H", "4H", "Daily"],

    aggressiveEntry:
      pattern.aggressiveEntry ??
      (isNeutral
        ? "Enter only after the range breaks with strong volume."
        : "Enter immediately after the signal candle closes, only if it forms at a strong level."),

    conservativeEntry:
      pattern.conservativeEntry ??
      (isNeutral
        ? "Wait for breakout, retest, and continuation."
        : `Wait for price to break structure and confirm movement ${direction}.`),

    riskReward:
      pattern.riskReward ?? "Minimum 2:1 preferred.",

    bestIndicators:
      pattern.bestIndicators ??
      ["VWAP", "Volume", "RSI", "20 EMA", "50 EMA", "Market Structure"],

    optionsPlay:
      pattern.optionsPlay ?? getOptionsPlay(pattern),

    institutionalClues:
      pattern.institutionalClues ?? institutionalClues,

    commonMistakes:
      pattern.commonMistakes ??
      [
        "Entering before confirmation.",
        "Ignoring the higher-timeframe trend.",
        `Taking the setup directly into ${opposite}.`,
        "Ignoring volume.",
        "Skipping the stop loss."
      ],

    proTips:
      pattern.proTips ??
      [
        "Higher timeframe signals are stronger.",
        "The best setups form at obvious levels.",
        "Volume and market context matter more than the pattern name.",
        "Do not treat any pattern as automatic confirmation."
      ],

    relatedPatterns:
      pattern.relatedPatterns ??
      ["Support Bounce", "Break and Retest", "VWAP Reclaim/Reject", "Market Structure Shift"],

    example:
      pattern.example ??
      `${pattern.name} forms near a key level, confirms with volume, and price follows through ${direction}.`,

    homework:
      pattern.homework ??
      `Find 10 examples of ${pattern.name} on TradingView. Mark the setup, entry, stop, target, confirmation candle, and outcome.`,

    quiz:
      pattern.quiz ??
      {
        question: `What is the most important confirmation for ${pattern.name}?`,
        choices: [
          "A clean pattern shape only",
          "Volume and follow-through",
          "Entering before the candle closes",
          "Ignoring the higher timeframe"
        ],
        answer: "Volume and follow-through"
      }
  };
}

function InfoBox({ title, children, color = GOLD }) {
  return (
    <div style={{ background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 10, padding: '11px 14px' }}>
      <div style={{ color, fontSize: 10, fontWeight: 900, letterSpacing: 1.2, marginBottom: 6 }}>{title}</div>
      <div style={{ color: '#f5f1e8', fontSize: 12, lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function BulletList({ items }) {
  if (!items || !items.length) return null;
  return (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {items.map((item, idx) => (
        <li key={idx} style={{ marginBottom: 5 }}>{item}</li>
      ))}
    </ul>
  );
}

// Merge all patterns
// ─────────────────────────────────────────────
// BATCH 3 — Patterns 85-125 (TRQX Exclusive)
// ─────────────────────────────────────────────
const BATCH3 = [
  // ── Momentum Patterns ──
  {
    id: 85, name: "VWAP Reclaim", level: "Intermediate",
    category: "Momentum", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Price dips below VWAP then reclaims it with a strong bullish candle and volume. Signals institutional buyers stepped in. One of the highest-probability intraday setups.",
    entry: "Close back above VWAP with volume confirmation",
    stop: "Below the low of the reclaim candle",
    target: "Previous high or VWAP + 1x the reclaim candle range",
    confidence: 8.2, successRate: "65-72% with confirmation",
    psychology: "Price briefly dips below the institutional reference level (VWAP), shaking out weak longs. Strong hands absorb the selling and reclaim control above VWAP — signaling the dip was a trap, not a trend change.",
    marketContext: "Best during uptrending days or after a gap-up open. Weak if the overall market is in a downtrend or below VWAP on higher timeframes.",
    idealLocation: "VWAP, combined with a key support level, prior day high, or demand zone. Best in the first two hours of the trading session.",
    requirements: ["Price must close back above VWAP", "Volume should expand on the reclaim candle", "Broader market should be supportive", "Best in first 2 hours of session"],
    confirmation: ["Strong bullish candle closing above VWAP", "Volume spike on the reclaim", "Price holds above VWAP on first retest", "Market internals green"],
    volumeProfile: "Volume must expand on the reclaim candle. Low-volume reclaims fail frequently. Watch for institutional size prints near VWAP.",
    timeframe: ["1m", "5m", "15m"],
    aggressiveEntry: "Enter on the candle that reclaims VWAP while it's happening",
    conservativeEntry: "Wait for price to retest VWAP from above and hold",
    riskReward: "Minimum 2:1 preferred",
    bestIndicators: ["VWAP", "Volume", "Market Internals", "RSI"],
    optionsPlay: "ATM or slightly ITM calls with same-day or next-day expiration. Keep size small — intraday setups move fast.",
    institutionalClues: ["Large call sweeps appearing at VWAP reclaim", "Dark pool prints near VWAP support", "Market makers defending VWAP level"],
    commonMistakes: ["Entering before price closes above VWAP", "Ignoring overall market direction", "Trading VWAP reclaim in a strong downtrend", "Using on low-volume days"],
    proTips: ["The best VWAP reclaims happen fast — hesitation kills the entry", "First VWAP reclaim of the day is the strongest", "Combine with options flow for confirmation"],
    relatedPatterns: ["VWAP Reject", "EMA Reclaim", "Support Bounce", "Break and Retest"],
    example: "SPY gaps up, pulls back below VWAP at 10:15am, then reclaims with a large green candle and 3x volume — textbook VWAP reclaim long.",
    homework: "Find 10 VWAP reclaim setups on SPY or QQQ 5-minute charts. Mark entry, stop, target, and result.",
    quiz: { question: "What is the most critical confirmation for a VWAP Reclaim?", choices: ["Price touches VWAP", "Close above VWAP with volume", "RSI above 50", "Price gaps above VWAP"], answer: "Close above VWAP with volume" },
    candles: [
  {o:222,c:234,h:236,l:220,bull:true},
  {o:234,c:244,h:246,l:232,bull:true},
  {o:244,c:238,h:246,l:236,bull:false},
  {o:238,c:228,h:240,l:226,bull:false},
  {o:228,c:218,h:230,l:216,bull:false},
  {o:218,c:210,h:220,l:208,bull:false},
  {o:210,c:228,h:230,l:208,bull:true},
  {o:228,c:242,h:244,l:226,bull:true},
  {o:242,c:254,h:256,l:240,bull:true},
],
annotations: [
  {type:'hline',candleIdx:5,label:'VWAP'},
  {type:'label',candleIdx:5,offset:-22,text:'Below VWAP',color:'#ef5350'},
  {type:'label',candleIdx:6,offset:-18,text:'RECLAIM ↑',color:'#26a69a'},
],
  },
  {
    id: 86, name: "VWAP Reject", level: "Intermediate",
    category: "Momentum", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price rallies up to VWAP from below and gets rejected with a strong bearish candle. Signals sellers are defending the institutional reference level. High-probability short setup.",
    entry: "Close back below VWAP after the rejection candle",
    stop: "Above the high of the rejection candle",
    target: "Session low or VWAP minus the rejection candle range",
    confidence: 8.0, successRate: "63-70% with confirmation",
    psychology: "Price bounces toward VWAP — the institutional benchmark — but sellers defend it aggressively. The rejection signals that institutions are using VWAP as a distribution level.",
    marketContext: "Best during downtrending days or after a gap-down open. Weak if market is in a strong uptrend or if price has been above VWAP for most of the session.",
    idealLocation: "VWAP combined with a resistance level, prior day low, or supply zone. Best within the first two hours.",
    requirements: ["Price must fail to close above VWAP", "Rejection candle should have a clear upper wick", "Volume should expand on rejection", "Broader market should be weak"],
    confirmation: ["Bearish candle closing back below VWAP", "Volume expansion on rejection", "Price fails first retest of VWAP from below", "Market internals red"],
    volumeProfile: "Volume must expand on the rejection candle. Watch for sell programs and institutional distribution at VWAP.",
    timeframe: ["1m", "5m", "15m"],
    aggressiveEntry: "Enter short as the rejection candle closes below VWAP",
    conservativeEntry: "Wait for price to retest VWAP from below and fail",
    riskReward: "Minimum 2:1 preferred",
    bestIndicators: ["VWAP", "Volume", "Market Internals", "RSI"],
    optionsPlay: "ATM or slightly ITM puts with same-day or next-day expiration. Tight stops required.",
    institutionalClues: ["Large put sweeps at VWAP rejection", "Dark pool resistance prints near VWAP", "Heavy selling volume on VWAP touch"],
    commonMistakes: ["Shorting before price confirms rejection", "Trading against a strong uptrend", "Ignoring market internals", "No stop loss above the rejection high"],
    proTips: ["VWAP rejections on weak market days are among the cleanest setups available", "The more times price has been rejected at VWAP, the stronger the level", "Combine with put flow for conviction"],
    relatedPatterns: ["VWAP Reclaim", "Resistance Rejection", "EMA Reject", "Lower High"],
    example: "QQQ gaps down, bounces toward VWAP at 10:30am, gets rejected with a large red candle and heavy volume — textbook VWAP reject short.",
    homework: "Find 10 VWAP rejection setups on QQQ or SPY 5-minute charts. Mark each entry, stop, and target.",
    quiz: { question: "What confirms a VWAP Reject setup?", choices: ["Price touches VWAP and bounces", "Rejection candle closes below VWAP with volume", "RSI below 30", "Price gaps below VWAP"], answer: "Rejection candle closes below VWAP with volume" },
    candles: [
  {o:218,c:206,h:220,l:204,bull:false},
  {o:206,c:194,h:208,l:192,bull:false},
  {o:194,c:184,h:196,l:182,bull:false},
  {o:184,c:194,h:196,l:182,bull:true},
  {o:194,c:206,h:208,l:192,bull:true},
  {o:206,c:212,h:214,l:204,bull:true},
  {o:212,c:200,h:216,l:198,bull:false},
  {o:200,c:188,h:202,l:186,bull:false},
  {o:188,c:176,h:190,l:174,bull:false},
],
annotations: [
  {type:'hline',candleIdx:5,label:'VWAP'},
  {type:'label',candleIdx:5,offset:-18,text:'VWAP Test',color:'#d4af37'},
  {type:'label',candleIdx:6,offset:-18,text:'REJECTION ↓',color:'#ef5350'},
],
  },
  {
    id: 87, name: "EMA Reclaim", level: "Intermediate",
    category: "Momentum", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Price closes back above a key EMA (20, 50, or 200) after being below it. Signals a shift in momentum. The longer the EMA period, the more significant the reclaim.",
    entry: "Daily close back above the EMA",
    stop: "Below the low of the reclaim candle",
    target: "Previous swing high or next major resistance",
    confidence: 7.8, successRate: "62-68% with confirmation",
    psychology: "Moving averages act as dynamic support and resistance. A reclaim signals buyers have regained control of the trend. Institutions often use EMA levels as reference points for entries.",
    marketContext: "Best after a pullback to a rising EMA in an uptrend. The 20 EMA reclaim is short-term bullish. The 200 EMA reclaim is a major long-term signal.",
    idealLocation: "At a rising 20 EMA, 50 EMA, or 200 EMA. Best when the EMA aligns with a key price level or VWAP.",
    requirements: ["Price must close above the EMA", "Volume should expand on the reclaim candle", "EMA should be rising or flat (not sharply falling)", "No major resistance directly above"],
    confirmation: ["Strong close above EMA", "Volume expansion", "First retest holds above EMA", "Broad market supportive"],
    volumeProfile: "Higher than average volume on the reclaim candle confirms institutional participation. Low-volume reclaims tend to fail.",
    timeframe: ["15m", "1H", "4H", "Daily"],
    aggressiveEntry: "Enter on the candle that reclaims the EMA",
    conservativeEntry: "Wait for the first retest of the EMA from above",
    riskReward: "Minimum 2:1 preferred",
    bestIndicators: ["20 EMA", "50 EMA", "200 EMA", "Volume", "VWAP"],
    optionsPlay: "ATM calls with 2-5 days to expiration for short-term reclaims. Further-dated options for 50/200 EMA reclaims.",
    institutionalClues: ["Call flow appearing on EMA reclaim", "Price gap fill completes at EMA", "Sector leaders reclaiming same EMA simultaneously"],
    commonMistakes: ["Buying a falling EMA reclaim in a downtrend", "Ignoring volume", "Not waiting for close above EMA", "Using wrong EMA for the timeframe"],
    proTips: ["200 EMA reclaims on daily charts are among the most powerful signals in trading", "Multiple EMAs converging creates the strongest support", "Reclaim after a shakeout is the best entry"],
    relatedPatterns: ["VWAP Reclaim", "Support Bounce", "EMA Reject", "Break and Retest"],
    example: "AAPL pulls back to the 50-day EMA, closes back above it on strong volume — EMA reclaim long setup.",
    homework: "Find 10 EMA reclaim setups on daily charts of large-cap stocks. Track which EMA (20/50/200) and the outcome.",
    quiz: { question: "Which EMA reclaim is the most significant long-term signal?", choices: ["20 EMA", "50 EMA", "200 EMA", "9 EMA"], answer: "200 EMA" },
    candles: [
      {o:215,c:210,h:216,l:209,bull:false},{o:210,c:205,h:211,l:204,bull:false},
      {o:205,c:200,h:206,l:199,bull:false},{o:200,c:196,h:201,l:195,bull:false},
      {o:196,c:194,h:197,l:193,bull:false},
      {o:194,c:200,h:193,l:202,bull:true},
      {o:200,c:207,h:199,l:209,bull:true},{o:207,c:213,h:206,l:215,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-22,text:'Below EMA',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Reclaim',color:TEAL},
      {type:'hline',candleIdx:4,label:'Key EMA'},
    ]
  },
  {
    id: 88, name: "EMA Reject", level: "Intermediate",
    category: "Momentum", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price rallies back up to a key EMA from below and gets rejected. The EMA acts as dynamic resistance. Signals the downtrend is resuming after a dead-cat bounce.",
    entry: "Close back below the EMA after rejection",
    stop: "Above the high of the rejection candle",
    target: "Previous swing low or next major support",
    confidence: 7.8, successRate: "60-67% with confirmation",
    psychology: "In a downtrend, EMAs act as dynamic resistance. Bears use bounces to the EMA to add short positions. A rejection confirms sellers are still in control.",
    marketContext: "Best in a downtrending market. The 20 EMA rejection is short-term bearish. The 200 EMA rejection is a major long-term signal of trend weakness.",
    idealLocation: "At a declining 20 EMA, 50 EMA, or 200 EMA. Best when EMA aligns with a prior support turned resistance.",
    requirements: ["Price must fail to close above the EMA", "Rejection candle should close below EMA", "EMA should be declining or flat", "Weak market conditions support the setup"],
    confirmation: ["Bearish close below EMA", "Volume on rejection candle", "First retest of EMA fails", "Market internals weak"],
    volumeProfile: "Selling volume on the rejection confirms distribution. Watch for institutional selling at the EMA.",
    timeframe: ["15m", "1H", "4H", "Daily"],
    aggressiveEntry: "Enter short as rejection candle closes below EMA",
    conservativeEntry: "Wait for first retest of EMA from below to fail",
    riskReward: "Minimum 2:1 preferred",
    bestIndicators: ["20 EMA", "50 EMA", "200 EMA", "Volume", "RSI"],
    optionsPlay: "ATM puts with 2-5 days to expiration for short-term rejections. Further-dated for 50/200 EMA rejections.",
    institutionalClues: ["Put sweeps appearing on EMA rejection", "Distribution volume at EMA", "Sector weakness confirming EMA rejection"],
    commonMistakes: ["Shorting a rising EMA in an uptrend", "No stop above rejection high", "Ignoring broad market strength", "Using wrong EMA for the timeframe"],
    proTips: ["The 200 EMA rejection on a daily chart is one of the most reliable bearish signals", "First rejection of a falling EMA after a bounce is the strongest", "Combine with put flow for conviction"],
    relatedPatterns: ["VWAP Reject", "Resistance Rejection", "EMA Reclaim", "Lower High"],
    example: "TSLA bounces to the declining 50-day EMA, gets rejected with high volume — EMA reject short setup.",
    homework: "Find 10 EMA rejection setups on daily charts. Track EMA used, entry, stop, target, outcome.",
    quiz: { question: "What does an EMA Reject signal in a downtrend?", choices: ["Trend reversal higher", "Buyers taking control", "Sellers still in control at resistance", "Breakout incoming"], answer: "Sellers still in control at resistance" },
    candles: [
      {o:190,c:195,h:189,l:197,bull:true},{o:195,c:200,h:194,l:202,bull:true},
      {o:200,c:205,h:199,l:207,bull:true},{o:205,c:210,h:204,l:211,bull:true},
      {o:210,c:213,h:209,l:214,bull:true},
      {o:213,c:208,h:215,l:207,bull:false},
      {o:208,c:202,h:209,l:201,bull:false},{o:202,c:196,h:203,l:195,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'EMA Test',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'Reject',color:RED},
      {type:'hline',candleIdx:4,label:'Key EMA'},
    ]
  },
  {
    id: 89, name: "RSI Divergence Bullish", level: "Advanced",
    category: "Momentum", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Price makes a lower low but RSI makes a higher low. This divergence signals bullish momentum is building even as price falls. One of the strongest leading indicators of a reversal.",
    entry: "When price confirms with a bullish candle after the divergence",
    stop: "Below the second (higher) low",
    target: "Previous swing high or measured move equal to prior decline",
    confidence: 8.4, successRate: "66-73% with confirmation",
    psychology: "Sellers are pushing price lower but with less and less force. RSI reveals that downward momentum is weakening. Smart money is quietly accumulating as price makes new lows.",
    marketContext: "Best after an extended downtrend of at least 10-15 candles. Weak if it appears in the middle of a strong trend without a clear turning point.",
    idealLocation: "Oversold RSI territory (below 30-40), at a major support level, VWAP, or key Fibonacci level.",
    requirements: ["Price makes lower low", "RSI makes higher low simultaneously", "RSI should be in oversold territory", "Look for a confirming bullish candle"],
    confirmation: ["Bullish engulfing or hammer at the second low", "RSI crosses back above 40", "Volume increases on the reversal candle", "Price breaks above the most recent swing high"],
    volumeProfile: "Volume should decline on the second price low (confirming seller exhaustion) then expand on the reversal candle.",
    timeframe: ["15m", "1H", "4H", "Daily"],
    aggressiveEntry: "Enter at the second low when divergence is confirmed",
    conservativeEntry: "Wait for price to break above the swing high between the two lows",
    riskReward: "Minimum 2:1, often 3:1 or better given the setup quality",
    bestIndicators: ["RSI (14)", "Volume", "MACD", "Support Levels"],
    optionsPlay: "ATM or slightly OTM calls with 5-14 days to expiration. The setup often leads to multi-day moves.",
    institutionalClues: ["Bullish flow appearing at the second low", "Dark pool accumulation prints", "Options unusual activity on calls at support"],
    commonMistakes: ["Entering at the first low before divergence is confirmed", "Ignoring the broader trend", "Not waiting for price confirmation", "Using on very short timeframes where noise is high"],
    proTips: ["The greater the divergence (wider gap between RSI lows and price lows), the stronger the signal", "Daily chart RSI divergence leads to the biggest moves", "Hidden bullish divergence (higher low on price, lower low on RSI) signals trend continuation"],
    relatedPatterns: ["RSI Divergence Bearish", "Double Bottom", "Volume Divergence", "Morning Star"],
    example: "SPY makes a new low at 440 but RSI shows a higher low at 32 vs 28 — bullish RSI divergence, long on confirmation.",
    homework: "Find 5 RSI bullish divergence setups on daily charts of major ETFs. Mark both lows on price and RSI and track the outcome.",
    quiz: { question: "In bullish RSI divergence, what happens to RSI while price makes a lower low?", choices: ["RSI also makes a lower low", "RSI makes a higher low", "RSI goes to 0", "RSI stays flat"], answer: "RSI makes a higher low" },
    candles: [
      {o:215,c:210,h:216,l:209,bull:false},{o:210,c:204,h:211,l:203,bull:false},
      {o:204,c:198,h:205,l:197,bull:false},{o:198,c:193,h:199,l:192,bull:false},
      {o:193,c:196,h:192,l:197,bull:true},{o:196,c:192,h:197,l:191,bull:false},
      {o:192,c:198,h:191,l:200,bull:true},{o:198,c:205,h:197,l:207,bull:true},
      {o:205,c:212,h:204,l:214,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-22,text:'Price LL',color:RED},
      {type:'label',candleIdx:5,offset:-22,text:'Price HL',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'Reversal',color:TEAL},
      {type:'bracket',start:3,end:5,label:'RSI Divergence'},
    ]
  },
  {
    id: 90, name: "RSI Divergence Bearish", level: "Advanced",
    category: "Momentum", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price makes a higher high but RSI makes a lower high. Signals bullish momentum is fading even as price rises. One of the most reliable leading indicators of a top.",
    entry: "When price confirms with a bearish candle after the divergence",
    stop: "Above the second (lower) high",
    target: "Previous swing low or measured move equal to prior rally",
    confidence: 8.4, successRate: "65-72% with confirmation",
    psychology: "Buyers are pushing price higher but with decreasing force. RSI reveals that upward momentum is fading. Smart money is quietly distributing into strength as price makes new highs.",
    marketContext: "Best after an extended uptrend of at least 10-15 candles. Look for overbought RSI territory and a key resistance level.",
    idealLocation: "Overbought RSI territory (above 60-70), at a major resistance level, call wall, or key Fibonacci extension.",
    requirements: ["Price makes higher high", "RSI makes lower high simultaneously", "RSI should be in overbought territory", "Look for a confirming bearish candle"],
    confirmation: ["Bearish engulfing or shooting star at the second high", "RSI drops below 60", "Volume increases on the reversal candle", "Price breaks below the swing low between the two highs"],
    volumeProfile: "Volume should decline on the second price high (confirming buyer exhaustion) then expand on the reversal candle.",
    timeframe: ["15m", "1H", "4H", "Daily"],
    aggressiveEntry: "Enter at the second high when divergence is confirmed",
    conservativeEntry: "Wait for price to break below the swing low between the two highs",
    riskReward: "Minimum 2:1, often 3:1 given setup quality",
    bestIndicators: ["RSI (14)", "Volume", "MACD", "Resistance Levels"],
    optionsPlay: "ATM or slightly OTM puts with 5-14 days to expiration. Often leads to multi-day moves.",
    institutionalClues: ["Bearish put flow at the second high", "Dark pool distribution prints", "Unusual put activity at resistance"],
    commonMistakes: ["Entering at the first high before divergence confirmed", "Ignoring broader trend", "Not waiting for price confirmation", "Using on very short timeframes"],
    proTips: ["The greater the divergence, the stronger the signal", "Daily chart bearish RSI divergence leads to the largest drops", "Always wait for price to confirm with a breakdown"],
    relatedPatterns: ["RSI Divergence Bullish", "Double Top", "Volume Divergence", "Evening Star"],
    example: "NVDA makes a new high at 500 but RSI shows a lower high at 72 vs 78 — bearish RSI divergence, short on confirmation.",
    homework: "Find 5 RSI bearish divergence setups on daily charts. Mark both highs on price and RSI and track the outcome.",
    quiz: { question: "In bearish RSI divergence, what happens to RSI while price makes a higher high?", choices: ["RSI also makes a higher high", "RSI makes a lower high", "RSI goes to 100", "RSI stays flat"], answer: "RSI makes a lower high" },
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},{o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},{o:208,c:214,h:207,l:216,bull:true},
      {o:214,c:211,h:215,l:212,bull:false},{o:211,c:216,h:210,l:218,bull:true},
      {o:216,c:210,h:218,l:209,bull:false},{o:210,c:204,h:211,l:203,bull:false},
      {o:204,c:198,h:205,l:197,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Price HH',color:TEAL},
      {type:'label',candleIdx:5,offset:-18,text:'Price LH',color:RED},
      {type:'label',candleIdx:6,offset:-18,text:'Reversal',color:RED},
      {type:'bracket',start:3,end:5,label:'RSI Divergence'},
    ]
  },

  // ── Options Flow Patterns ──
  {
    id: 91, name: "Bullish Sweep Confirmation", level: "Advanced",
    category: "Options Flow", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A large aggressive call sweep — buyer paying full ask across multiple exchanges simultaneously — confirms a bullish directional bias. Signals institutional urgency to get long before a move.",
    entry: "On the next pullback after the sweep is confirmed on the chart",
    stop: "Below the sweep candle low or key support",
    target: "Measured move equal to prior trend leg or options target strike",
    confidence: 8.5, successRate: "67-74% when combined with chart confirmation",
    psychology: "Sweeps signal urgency — someone needs to be filled NOW regardless of price. This institutional conviction is the most actionable signal in options flow. They believe a move is imminent.",
    marketContext: "Best when overall market is bullish, the ticker is above key moving averages, and the sweep occurs at or near support. Weak if price is directly under major resistance.",
    idealLocation: "At support, VWAP reclaim, EMA reclaim, or after a clean chart pattern breakout. Sweep size matters — $500K+ is institutional conviction.",
    requirements: ["Sweep must be $500K+ premium for significance", "Calls must be short-dated (weekly or monthly)", "Chart must support the bullish direction", "No major resistance directly overhead"],
    confirmation: ["Price holds above sweep candle low", "Follow-through bullish candle on next bar", "Volume expansion on confirmation", "No reversal of the sweep position in flow"],
    volumeProfile: "Volume should expand in the direction of the sweep. Heavy call volume with rising stock price is the ideal combination.",
    timeframe: ["1m", "5m", "15m", "1H"],
    aggressiveEntry: "Enter immediately on the sweep signal if chart aligns",
    conservativeEntry: "Wait for price to dip and retest the sweep level with holding",
    riskReward: "2:1 minimum, often 3:1+ given the directional conviction",
    bestIndicators: ["Options Flow Scanner", "Volume", "VWAP", "Key Support Levels"],
    optionsPlay: "Mirror the sweep — same strike, same expiration, or next expiration out. Never exceed 5% of account on a single flow trade.",
    institutionalClues: ["Multiple sweeps in the same direction within minutes", "Dark pool prints confirming the level", "Block trades following the sweep"],
    commonMistakes: ["Chasing a sweep after price has already moved 5%+", "Ignoring the chart setup", "Copying every sweep without chart confirmation", "Going too large on a single flow signal"],
    proTips: ["The first sweep of the day on a liquid ticker is the most actionable", "Multi-leg sweeps (calls at multiple strikes) signal extreme conviction", "Always check if the sweep is opening or closing — opening is directional"],
    relatedPatterns: ["Bearish Sweep Confirmation", "Block Trade Confirmation", "Unusual Flow Expansion", "VWAP Reclaim"],
    example: "AAPL gets a $2M call sweep at the 185 strike expiring this Friday — price is above VWAP at key support — textbook bullish sweep confirmation.",
    homework: "Track 10 large call sweeps in the TRQX Flow Scanner for one week. Record the chart setup, entry, and outcome.",
    quiz: { question: "What makes a call sweep 'institutional' in size?", choices: ["Any call sweep", "$100K+ premium", "$500K+ premium", "$1M+ only"], answer: "$500K+ premium" },
    candles: [
      {o:200,c:204,h:199,l:206,bull:true},{o:204,c:202,h:205,l:201,bull:false},
      {o:202,c:205,h:201,l:207,bull:true},{o:205,c:202,h:206,l:201,bull:false},
      {o:202,c:210,h:201,l:212,bull:true},
      {o:210,c:216,h:209,l:218,bull:true},{o:216,c:222,h:215,l:224,bull:true},
      {o:222,c:220,h:223,l:219,bull:false},{o:220,c:226,h:219,l:228,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'SWEEP',color:TEAL},
      {type:'label',candleIdx:5,offset:-18,text:'Follow-Through',color:TEAL},
      {type:'bracket',start:4,end:6,label:'Bullish Flow'},
    ]
  },
  {
    id: 92, name: "Bearish Sweep Confirmation", level: "Advanced",
    category: "Options Flow", signal: "Bearish Continuation",
    signalColor: RED,
    description: "A large aggressive put sweep confirms bearish directional bias. Institutional traders are paying full ask to get short immediately. Signals a move lower is expected imminently.",
    entry: "On the next bounce after the sweep is confirmed on the chart",
    stop: "Above the sweep candle high or key resistance",
    target: "Measured move lower or options target strike",
    confidence: 8.5, successRate: "66-73% when combined with chart confirmation",
    psychology: "A large put sweep signals someone expects a significant move lower and needs to be positioned NOW. The urgency of a sweep — crossing multiple exchanges at ask — is the key signal of conviction.",
    marketContext: "Best when the overall market is bearish, the ticker is below key moving averages, and the sweep occurs at or near resistance. Weak if directly above major support.",
    idealLocation: "At resistance, VWAP rejection, EMA reject, or after a chart pattern breakdown. $500K+ sweep is institutional.",
    requirements: ["Sweep must be $500K+ premium", "Puts must be short-dated", "Chart must support bearish direction", "No major support directly below"],
    confirmation: ["Price fails to reclaim sweep candle high", "Follow-through bearish candle", "Volume expansion on confirmation", "No reversal of put position in flow"],
    volumeProfile: "Heavy put volume with falling stock price is the ideal combination. Watch for dark pool prints confirming the level.",
    timeframe: ["1m", "5m", "15m", "1H"],
    aggressiveEntry: "Enter immediately on sweep signal if chart aligns",
    conservativeEntry: "Wait for price to bounce and fail at the sweep level",
    riskReward: "2:1 minimum",
    bestIndicators: ["Options Flow Scanner", "Volume", "VWAP", "Key Resistance Levels"],
    optionsPlay: "Mirror the sweep — same strike, same expiration, or next out. Keep size disciplined.",
    institutionalClues: ["Multiple put sweeps on same ticker within minutes", "Dark pool prints at resistance", "Block trades following the sweep"],
    commonMistakes: ["Chasing after price has moved 5%+", "Ignoring chart context", "Treating every put sweep as a short signal", "Not using a stop"],
    proTips: ["Put sweeps on index ETFs (SPY, QQQ) often precede broad market moves", "Size of sweep matters more than the strike", "Always check if puts are opening — closing puts are bullish"],
    relatedPatterns: ["Bullish Sweep Confirmation", "Block Trade Confirmation", "VWAP Reject", "Resistance Rejection"],
    example: "SPY receives a $3M put sweep at the 440 strike — price is below VWAP and rejecting the 50 EMA — bearish sweep confirmation short.",
    homework: "Track 10 large put sweeps in the TRQX Flow Scanner for one week. Record chart setup, entry, and outcome.",
    quiz: { question: "What does a large put sweep signal about institutional positioning?", choices: ["Bullish conviction", "Neutral hedging", "Bearish conviction expecting a move lower", "Market making activity"], answer: "Bearish conviction expecting a move lower" },
    candles: [
      {o:215,c:212,h:216,l:211,bull:false},{o:212,c:215,h:211,l:216,bull:true},
      {o:215,c:213,h:216,l:212,bull:false},{o:213,c:215,h:212,l:216,bull:true},
      {o:215,c:207,h:216,l:206,bull:false},
      {o:207,c:201,h:208,l:200,bull:false},{o:201,c:195,h:202,l:194,bull:false},
      {o:195,c:198,h:194,l:199,bull:true},{o:198,c:192,h:199,l:191,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'PUT SWEEP',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Follow-Through',color:RED},
      {type:'bracket',start:4,end:6,label:'Bearish Flow'},
    ]
  },
  {
    id: 93, name: "Block Trade Confirmation", level: "Advanced",
    category: "Options Flow", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A single large block trade (1 exchange, negotiated) appearing at a key level confirms directional bias. Blocks are often institutional hedges or large directional bets. Context determines direction.",
    entry: "After confirming the block is directional (not a hedge) using chart context",
    stop: "Below the block trade level (bullish) or above it (bearish)",
    target: "Based on chart structure and options strike",
    confidence: 7.5, successRate: "58-65% — requires chart confirmation",
    psychology: "Block trades represent large negotiated transactions between institutions. Unlike sweeps, they don't signal urgency — but their size indicates conviction. Context is everything.",
    marketContext: "Best when block trades appear at key levels (support, resistance, VWAP) and align with the chart setup. Alone they mean little — with chart confirmation they are powerful.",
    idealLocation: "At major support or resistance, near key earnings dates, at round number strikes, or following a large price move.",
    requirements: ["Block must be $1M+ for significance", "Must determine if opening or closing position", "Chart setup must align", "Check if calls or puts"],
    confirmation: ["Price moves in expected direction within 1-2 candles", "Volume confirms direction", "Chart pattern supports", "No opposing flow of similar size"],
    volumeProfile: "Block trades often occur in low-liquidity environments. Watch for volume spike on the underlying stock confirming the direction.",
    timeframe: ["5m", "15m", "1H", "Daily"],
    aggressiveEntry: "Enter on block confirmation if chart aligns",
    conservativeEntry: "Wait for price movement confirming the block direction",
    riskReward: "Minimum 2:1",
    bestIndicators: ["Options Flow Scanner", "Volume", "Chart Patterns", "Open Interest"],
    optionsPlay: "Mirror the block if directional — same or adjacent strike. Always verify it is an opening position.",
    institutionalClues: ["Block at key support or resistance", "Multiple blocks at same strike on same day", "Block appears before major catalyst"],
    commonMistakes: ["Treating all blocks as directional — many are hedges", "Ignoring whether position is opening or closing", "Not checking chart context", "Going too large"],
    proTips: ["Blocks at round-number strikes are most likely directional", "Blocks before earnings are often hedge positions", "Sweep + Block on same ticker in same direction = very high conviction"],
    relatedPatterns: ["Bullish Sweep Confirmation", "Bearish Sweep Confirmation", "Unusual Flow Expansion"],
    example: "NVDA gets a $5M call block at the 500 strike with 30 days to expiry — price at major support — treat as bullish block confirmation.",
    homework: "Track 5 block trades in the TRQX Flow Scanner. Determine if each is likely directional or a hedge based on context.",
    quiz: { question: "What is the key difference between a sweep and a block trade?", choices: ["Size", "Strike price", "Sweep crosses multiple exchanges urgently; block is negotiated on one", "Blocks are always bearish"], answer: "Sweep crosses multiple exchanges urgently; block is negotiated on one" },
    candles: [
      {o:198,c:202,h:197,l:204,bull:true},{o:202,c:200,h:203,l:199,bull:false},
      {o:200,c:204,h:199,l:205,bull:true},{o:204,c:201,h:205,l:200,bull:false},
      {o:201,c:210,h:200,l:212,bull:true},
      {o:210,c:218,h:209,l:220,bull:true},{o:218,c:224,h:217,l:226,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Block Trade',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'Confirmed',color:TEAL},
    ]
  },
  {
    id: 94, name: "Unusual Flow Expansion", level: "Advanced",
    category: "Options Flow", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A sudden spike in options activity far above normal daily volume — often 5-10x average — signals that institutional traders are positioning for an imminent major move.",
    entry: "After chart confirms direction of the unusual flow",
    stop: "Below key support (bullish) or above key resistance (bearish)",
    target: "Based on options strike clustering and chart structure",
    confidence: 8.0, successRate: "62-70% with chart alignment",
    psychology: "When options volume spikes dramatically above average, it means informed money is moving. This isn't retail — retail doesn't move the needle on volume this dramatically. Someone knows something or has extreme conviction.",
    marketContext: "Best when unusual flow appears before a catalyst (earnings, FDA, economic event). Also powerful when it appears on a quiet day with no obvious catalyst.",
    idealLocation: "In quiet tickers with normally low options volume. A 10x volume spike on a normally quiet stock is more significant than 2x on a highly active one.",
    requirements: ["Flow must be 5x+ normal daily volume", "Directional bias (calls vs puts) must be clear", "Chart must support the direction", "Check for upcoming catalysts"],
    confirmation: ["Price moves in flow direction within 1-2 days", "Volume on underlying expands", "Additional flow appears in same direction", "No news explaining the activity"],
    volumeProfile: "Unprecedented volume spike is the entire signal. Watch for call/put ratio shift and open interest building.",
    timeframe: ["Daily", "Weekly"],
    aggressiveEntry: "Same-day entry if chart confirms",
    conservativeEntry: "Wait for price to move in flow direction and enter on pullback",
    riskReward: "2:1 minimum — these setups often deliver 5:1+",
    bestIndicators: ["Options Flow Scanner", "Volume", "Open Interest", "Chart Patterns"],
    optionsPlay: "Mirror the unusual flow — same or adjacent strike, same expiration. Size appropriately — these are speculative.",
    institutionalClues: ["Flow across multiple strikes in same direction", "Both calls AND stock buying simultaneously", "Dark pool prints accompanying the flow"],
    commonMistakes: ["Chasing after price already moved", "Ignoring the options expiration date", "Not checking for earnings or catalyst dates", "Treating every unusual flow as a guaranteed trade"],
    proTips: ["Unusual flow before earnings is hedging — wait for the event", "Unusual flow on a quiet random day is the most actionable signal", "Multi-strike unusual flow (buying calls at 5 different strikes) signals extreme conviction"],
    relatedPatterns: ["Bullish Sweep Confirmation", "Block Trade Confirmation", "Call Laddering"],
    example: "A small biotech with 200 average daily contracts suddenly gets 5,000 call contracts in one morning — unusual flow expansion signal.",
    homework: "Monitor the TRQX Flow Scanner daily for one week. Identify 3 unusual flow expansions and track outcomes.",
    quiz: { question: "What volume multiple generally qualifies as 'unusual' options flow?", choices: ["2x normal", "5x+ normal", "1.5x normal", "Any increase"], answer: "5x+ normal" },
    candles: [
      {o:200,c:203,h:199,l:205,bull:true},{o:203,c:201,h:204,l:200,bull:false},
      {o:201,c:203,h:200,l:204,bull:true},{o:203,c:201,h:204,l:200,bull:false},
      {o:201,c:212,h:200,l:214,bull:true},
      {o:212,c:220,h:211,l:222,bull:true},{o:220,c:228,h:219,l:230,bull:true},
      {o:228,c:235,h:227,l:237,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Flow Spike',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'Expansion',color:TEAL},
    ]
  },
  {
    id: 95, name: "Call Laddering", level: "Advanced",
    category: "Options Flow", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "Institutional buyers purchasing calls at multiple ascending strike prices simultaneously — creating a 'ladder' of bullish exposure. Signals strong conviction in a sustained move higher.",
    entry: "On any pullback after the laddering is confirmed on the chart",
    stop: "Below the lowest strike of the call ladder",
    target: "Highest strike of the call ladder as a price target",
    confidence: 8.8, successRate: "70-77% when chart and flow align",
    psychology: "Buying calls at multiple strikes simultaneously signals the institution expects a large sustained move — not just a small pop. The ladder structure shows they are prepared for price to run through multiple levels.",
    marketContext: "Best in strong uptrending markets or before known catalysts. The presence of call laddering on a breakout setup is one of the highest-conviction signals available.",
    idealLocation: "At a major breakout level, after a consolidation, or before a known catalyst. The lowest rung of the ladder typically marks key support.",
    requirements: ["Calls must be bought at 3+ different strikes", "All strikes must be calls (not mixed)", "Strikes should be ascending (30, 35, 40 for example)", "Must be opening positions"],
    confirmation: ["Price breaks above the first strike level", "Volume confirms the breakout", "No offsetting put positions of similar size", "Chart pattern supports bullish thesis"],
    volumeProfile: "Each rung of the call ladder adds to cumulative bullish exposure. Watch for open interest building at each strike as confirmation.",
    timeframe: ["Daily", "Weekly"],
    aggressiveEntry: "Enter on breakout above first strike level",
    conservativeEntry: "Wait for price to hold above first strike on a retest",
    riskReward: "3:1 or better — these setups target large sustained moves",
    bestIndicators: ["Options Flow Scanner", "Open Interest", "Volume", "Chart Breakouts"],
    optionsPlay: "Buy the first ITM call of the ladder. Alternatively, buy a call spread between the first and last strike.",
    institutionalClues: ["Same expiration across all strikes confirms coordinated positioning", "Dark pool accumulation accompanying the flow", "Sector peers showing similar bullish flow"],
    commonMistakes: ["Confusing laddering with unrelated flow at multiple strikes", "Ignoring expiration dates", "Not confirming with chart setup", "Entering after the majority of the move has occurred"],
    proTips: ["The tighter the strikes, the more precise the target", "Call laddering before earnings can signal informed positioning", "When in doubt about direction, call laddering removes ambiguity"],
    relatedPatterns: ["Put Laddering", "Bullish Sweep Confirmation", "Unusual Flow Expansion", "Bull Flag"],
    example: "NVDA sees call buying at 450, 460, 470, and 480 strikes all in the same expiration — classic call laddering signal.",
    homework: "Find 3 examples of call laddering in the TRQX Flow Scanner. Verify the chart setup and track the outcome.",
    quiz: { question: "What does call laddering signal about institutional expectations?", choices: ["Small short-term pop", "Large sustained move higher through multiple price levels", "Neutral hedging", "Bearish protection"], answer: "Large sustained move higher through multiple price levels" },
    candles: [
      {o:195,c:198,h:194,l:200,bull:true},{o:198,c:202,h:197,l:204,bull:true},
      {o:202,c:200,h:203,l:199,bull:false},{o:200,c:203,h:199,l:205,bull:true},
      {o:203,c:212,h:202,l:214,bull:true},
      {o:212,c:221,h:211,l:223,bull:true},{o:221,c:230,h:220,l:232,bull:true},
      {o:230,c:238,h:229,l:240,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Call Ladder',color:TEAL},
      {type:'label',candleIdx:5,offset:-18,text:'Strike 1',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'Strike 2',color:TEAL},
      {type:'label',candleIdx:7,offset:-18,text:'Strike 3',color:TEAL},
    ]
  },
  {
    id: 96, name: "Put Laddering", level: "Advanced",
    category: "Options Flow", signal: "Bearish Continuation",
    signalColor: RED,
    description: "Institutional traders purchasing puts at multiple descending strike prices simultaneously. Signals strong conviction in a sustained move lower through multiple price levels.",
    entry: "On any bounce after the laddering is confirmed on the chart",
    stop: "Above the highest strike of the put ladder",
    target: "Lowest strike of the put ladder as a downside price target",
    confidence: 8.8, successRate: "70-77% when chart and flow align",
    psychology: "Buying puts at multiple strikes signals the institution expects a large sustained move lower. The ladder shows preparedness for price to fall through multiple support levels.",
    marketContext: "Best in strong downtrending markets or before known negative catalysts. Put laddering on a breakdown setup is one of the highest-conviction bearish signals.",
    idealLocation: "At a major breakdown level, after a distribution pattern, or before a known negative catalyst.",
    requirements: ["Puts must be bought at 3+ different strikes", "Strikes must be descending", "Must be opening positions", "Chart must support bearish thesis"],
    confirmation: ["Price breaks below the first strike level", "Volume confirms breakdown", "No offsetting call positions", "Chart pattern supports bearish thesis"],
    volumeProfile: "Each rung adds to cumulative bearish exposure. Watch for put open interest building at each strike.",
    timeframe: ["Daily", "Weekly"],
    aggressiveEntry: "Enter on breakdown below first strike level",
    conservativeEntry: "Wait for retest of first strike from below and failure",
    riskReward: "3:1 or better",
    bestIndicators: ["Options Flow Scanner", "Open Interest", "Volume", "Chart Breakdowns"],
    optionsPlay: "Buy the first ITM put of the ladder or a put spread between first and last strike.",
    institutionalClues: ["Same expiration across all strikes", "Dark pool distribution at resistance", "Sector peers showing similar bearish flow"],
    commonMistakes: ["Not verifying all strikes are opening positions", "Ignoring chart context", "Entering after the majority of the move", "No stop loss"],
    proTips: ["Put laddering before earnings often signals informed bearish positioning", "The wider the ladder range, the larger the expected move", "Combine with bearish chart patterns for highest conviction"],
    relatedPatterns: ["Call Laddering", "Bearish Sweep Confirmation", "Unusual Flow Expansion", "Bear Flag"],
    example: "META sees put buying at 300, 290, 280, and 270 strikes in the same expiration — classic put laddering signal.",
    homework: "Find 3 examples of put laddering in the TRQX Flow Scanner. Verify chart setup and track outcomes.",
    quiz: { question: "What does put laddering signal about institutional expectations?", choices: ["Small short-term dip", "Large sustained move lower through multiple price levels", "Bullish protection", "Neutral hedging"], answer: "Large sustained move lower through multiple price levels" },
    candles: [
      {o:220,c:216,h:221,l:215,bull:false},{o:216,c:212,h:217,l:211,bull:false},
      {o:212,c:215,h:211,l:216,bull:true},{o:215,c:211,h:216,l:210,bull:false},
      {o:211,c:202,h:212,l:201,bull:false},
      {o:202,c:193,h:203,l:192,bull:false},{o:193,c:184,h:194,l:183,bull:false},
      {o:184,c:176,h:185,l:175,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Put Ladder',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Strike 1',color:RED},
      {type:'label',candleIdx:6,offset:-18,text:'Strike 2',color:RED},
      {type:'label',candleIdx:7,offset:-18,text:'Strike 3',color:RED},
    ]
  },

  // ── Gamma / Dealer Positioning Patterns ──
  {
    id: 97, name: "Gamma Flip Reclaim", level: "Advanced",
    category: "Gamma Pattern", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Price reclaims the gamma flip level — the price where dealer gamma transitions from negative to positive. Above the flip, dealers stabilize price by buying dips and selling rips. Major structural shift.",
    entry: "Close back above the gamma flip level with volume",
    stop: "Below the gamma flip level",
    target: "Call wall above as first target",
    confidence: 8.6, successRate: "68-75% when confirmed",
    psychology: "Below the gamma flip, dealers amplify moves (negative gamma = volatility). Above it, dealers dampen moves (positive gamma = stability). Reclaiming the flip is a major regime change that signals stabilization and potential upside.",
    marketContext: "Most powerful during high-options-activity periods (OpEx week, VIX elevated). Best when reclaim happens with a strong bullish candle and volume.",
    idealLocation: "The gamma flip level itself. Check GEMX on the TRQX Terminal every morning for the current flip level.",
    requirements: ["Price must close above gamma flip", "Volume should expand on reclaim", "Check GEMX for current flip level", "Broader market should support"],
    confirmation: ["Hold above gamma flip on first retest", "VIX declining as price reclaims", "Options flow turning bullish", "Dealer hedging activity supports"],
    volumeProfile: "Volume expansion on the reclaim confirms institutional participation. Watch for call flow appearing simultaneously.",
    timeframe: ["5m", "15m", "1H", "Daily"],
    aggressiveEntry: "Enter on close above gamma flip",
    conservativeEntry: "Wait for first retest of gamma flip from above and hold",
    riskReward: "2:1 minimum — call wall provides natural target",
    bestIndicators: ["GEMX Gamma Dashboard", "VWAP", "Volume", "VIX"],
    optionsPlay: "ATM calls with 1-2 weeks to expiration. Gamma flip reclaims often lead to sustained moves to the call wall.",
    institutionalClues: ["Dealer buying as gamma flips positive", "Call flow increasing above the flip", "VIX declining confirming positive gamma environment"],
    commonMistakes: ["Not checking GEMX for current flip level daily", "Confusing gamma flip with regular support", "Trading without confirming the level in GEMX", "Ignoring VIX"],
    proTips: ["The gamma flip changes daily — always check GEMX fresh each morning", "Gamma flip reclaims on high-VIX days have the most explosive upside", "Use TRQX GEMX dashboard to find the exact flip level for SPY and QQQ"],
    relatedPatterns: ["Gamma Flip Rejection", "Call Wall Rejection", "Put Wall Bounce", "VWAP Reclaim"],
    example: "SPY gamma flip is at 445. Price dips below to 443 then reclaims 445 on strong volume — gamma flip reclaim long.",
    homework: "Check GEMX every morning for one week. Track where the gamma flip is for SPY and whether price is above or below it.",
    quiz: { question: "What happens to dealer behavior when price is above the gamma flip?", choices: ["Dealers amplify moves", "Dealers stabilize price by buying dips and selling rips", "Dealers stop hedging", "Dealers go net short"], answer: "Dealers stabilize price by buying dips and selling rips" },
    candles: [
      {o:208,c:205,h:209,l:204,bull:false},{o:205,c:202,h:206,l:201,bull:false},
      {o:202,c:199,h:203,l:198,bull:false},{o:199,c:197,h:200,l:196,bull:false},
      {o:197,c:195,h:198,l:194,bull:false},
      {o:195,c:203,h:194,l:205,bull:true},
      {o:203,c:210,h:202,l:212,bull:true},{o:210,c:216,h:209,l:218,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-22,text:'Below Flip',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Reclaim',color:TEAL},
      {type:'hline',candleIdx:4,label:'Gamma Flip'},
    ]
  },
  {
    id: 98, name: "Gamma Flip Rejection", level: "Advanced",
    category: "Gamma Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price rallies up to the gamma flip level from below and gets rejected. Confirms the negative gamma environment is intact and dealers will continue amplifying moves lower.",
    entry: "Close back below the gamma flip after rejection",
    stop: "Above the gamma flip level",
    target: "Put wall below as first target",
    confidence: 8.4, successRate: "66-73% when confirmed",
    psychology: "When price is below the gamma flip, the market is in a negative gamma regime — volatile and trending. A failed attempt to reclaim the flip signals sellers are still in control and volatility will remain elevated.",
    marketContext: "Most powerful during high-VIX periods and OpEx weeks. Best when the flip rejection aligns with a bearish chart pattern or VWAP rejection.",
    idealLocation: "The gamma flip level. Always check GEMX for the current flip level before trading.",
    requirements: ["Price must fail to close above gamma flip", "Rejection candle should be bearish", "Check GEMX for current flip level", "VIX should remain elevated"],
    confirmation: ["Price fails on first retest of gamma flip from below", "VIX rising as price rejects", "Put flow increasing", "Dealer hedging amplifies move lower"],
    volumeProfile: "Selling volume on rejection confirms dealer hedging is amplifying the move. Watch for put flow accompanying.",
    timeframe: ["5m", "15m", "1H", "Daily"],
    aggressiveEntry: "Enter short as rejection candle closes below gamma flip",
    conservativeEntry: "Wait for first retest of gamma flip from below to fail",
    riskReward: "2:1 minimum — put wall provides natural target",
    bestIndicators: ["GEMX Gamma Dashboard", "VWAP", "Volume", "VIX"],
    optionsPlay: "ATM puts with 1-2 weeks to expiration. Gamma flip rejections in negative gamma environments can accelerate sharply.",
    institutionalClues: ["Dealer selling as gamma flip holds as resistance", "Put flow increasing on rejection", "VIX rising confirming negative gamma environment"],
    commonMistakes: ["Not checking GEMX for current flip level", "Trading without the GEMX context", "Ignoring VIX direction", "No stop above flip level"],
    proTips: ["The gamma flip is the single most important level to monitor daily on GEMX", "In negative gamma, moves are faster and bigger — size accordingly", "Flip rejection + VWAP rejection = double confirmation short"],
    relatedPatterns: ["Gamma Flip Reclaim", "Put Wall Bounce", "Call Wall Rejection", "VWAP Reject"],
    example: "SPY gamma flip at 445. Price bounces from 440 to 444 and gets rejected — gamma flip rejection short with target at put wall 438.",
    homework: "Track gamma flip rejections on SPY for one week using GEMX. Record the rejection candle and subsequent move.",
    quiz: { question: "What does a gamma flip rejection confirm about the current market regime?", choices: ["Positive gamma — stable", "Negative gamma — volatile, amplified moves", "Neutral gamma", "High liquidity environment"], answer: "Negative gamma — volatile, amplified moves" },
    candles: [
      {o:195,c:198,h:194,l:200,bull:true},{o:198,c:202,h:197,l:204,bull:true},
      {o:202,c:206,h:201,l:208,bull:true},{o:206,c:210,h:205,l:211,bull:true},
      {o:210,c:213,h:209,l:214,bull:true},
      {o:213,c:208,h:215,l:207,bull:false},
      {o:208,c:202,h:209,l:201,bull:false},{o:202,c:196,h:203,l:195,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Flip Test',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'Reject',color:RED},
      {type:'hline',candleIdx:4,label:'Gamma Flip'},
    ]
  },
  {
    id: 99, name: "Call Wall Rejection", level: "Advanced",
    category: "Gamma Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price approaches the call wall — the strike with the heaviest call open interest — and gets rejected. Dealers sell their delta hedge as price rises toward the call wall, creating strong resistance.",
    entry: "First bearish candle after the call wall rejection",
    stop: "Above the call wall strike",
    target: "Gamma flip or put wall below",
    confidence: 8.2, successRate: "64-71% with confirmation",
    psychology: "At the call wall, market makers who sold those calls must sell shares to hedge. This mechanical selling creates a real ceiling. The more open interest at the strike, the stronger the wall.",
    marketContext: "Most powerful near options expiration (OpEx). The call wall acts as a magnet then a ceiling. Find the current call wall on GEMX each morning.",
    idealLocation: "The call wall strike price. Use GEMX to identify the heaviest call open interest level for SPY or QQQ.",
    requirements: ["Price must be approaching the call wall", "Call wall must have significant open interest", "Check GEMX for current call wall level", "In positive gamma environment for cleaner rejection"],
    confirmation: ["Bearish rejection candle at the call wall", "Volume expansion on rejection", "Price fails multiple tests of the call wall", "Call flow slowing or reversing"],
    volumeProfile: "Watch for selling volume as price hits the call wall — this is dealer hedging selling shares. High volume rejection is most reliable.",
    timeframe: ["5m", "15m", "1H", "Daily"],
    aggressiveEntry: "Short as price touches the call wall and first rejection candle forms",
    conservativeEntry: "Wait for close below call wall and retest failure",
    riskReward: "2:1 — gamma flip or put wall provides natural target",
    bestIndicators: ["GEMX Gamma Dashboard", "Volume", "Options Open Interest", "Price Action"],
    optionsPlay: "ATM or slightly OTM puts near call wall. Short-dated for maximum gamma sensitivity.",
    institutionalClues: ["Dealer hedging selling at call wall", "Large call positions at that strike in flow data", "Price unable to sustain closes above the wall"],
    commonMistakes: ["Not checking GEMX for current call wall level", "Trading call wall rejection without gamma context", "Ignoring open interest at the strike", "No stop above the wall"],
    proTips: ["The call wall moves daily as options expire and new ones are opened — always check GEMX fresh", "OpEx Friday call walls are the strongest", "A break above the call wall often leads to a rapid squeeze to the next wall"],
    relatedPatterns: ["Put Wall Bounce", "Gamma Flip Rejection", "Resistance Rejection", "Double Top"],
    example: "SPY call wall at 450. Price rallies to 449.80 and gets rejected with heavy volume — call wall rejection short.",
    homework: "Each morning for one week, check GEMX and identify the call wall for SPY. Track how price reacts when it approaches that level.",
    quiz: { question: "Why does the call wall create resistance?", choices: ["Retail traders sell there", "Market makers sell shares to hedge their short call exposure", "It is a psychological round number", "Options expire there"], answer: "Market makers sell shares to hedge their short call exposure" },
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},{o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},{o:208,c:212,h:207,l:214,bull:true},
      {o:212,c:215,h:211,l:215,bull:true},
      {o:215,c:210,h:216,l:209,bull:false},
      {o:210,c:204,h:211,l:203,bull:false},{o:204,c:198,h:205,l:197,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Call Wall',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Rejection',color:RED},
      {type:'hline',candleIdx:4,label:'Call Wall'},
    ]
  },
  {
    id: 100, name: "Put Wall Bounce", level: "Advanced",
    category: "Gamma Pattern", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Price drops to the put wall — the strike with heaviest put open interest — and bounces. Dealers buy shares to cover their short delta as price falls toward the put wall, creating strong support.",
    entry: "First bullish candle after the put wall bounce",
    stop: "Below the put wall strike",
    target: "Gamma flip or call wall above",
    confidence: 8.2, successRate: "65-72% with confirmation",
    psychology: "At the put wall, market makers who sold those puts must buy shares to hedge. This mechanical buying creates real support. The more open interest at the strike, the stronger the floor.",
    marketContext: "Most powerful near options expiration. The put wall acts as a magnet then a floor. Find the current put wall on GEMX each morning.",
    idealLocation: "The put wall strike price. Use GEMX to identify the heaviest put open interest level.",
    requirements: ["Price must be approaching the put wall", "Put wall must have significant open interest", "Check GEMX for current put wall level", "In positive gamma environment for best results"],
    confirmation: ["Bullish candle bouncing off put wall", "Volume expansion on bounce", "Price holds above put wall on first retest", "VIX declining as bounce occurs"],
    volumeProfile: "Buying volume at the put wall confirms dealer hedging buying. Watch for the bounce to occur with high volume.",
    timeframe: ["5m", "15m", "1H", "Daily"],
    aggressiveEntry: "Long as price touches put wall and first bounce candle forms",
    conservativeEntry: "Wait for close above put wall and hold on retest",
    riskReward: "2:1 — call wall or gamma flip provides natural target",
    bestIndicators: ["GEMX Gamma Dashboard", "Volume", "Options Open Interest", "VIX"],
    optionsPlay: "ATM or slightly OTM calls near put wall. Short-dated for maximum sensitivity.",
    institutionalClues: ["Dealer buying at put wall", "Large put positions at that strike in flow data", "Price bouncing multiple times at put wall"],
    commonMistakes: ["Not checking GEMX for put wall level daily", "Trading without gamma context", "Ignoring open interest at the strike", "No stop below the wall"],
    proTips: ["Put walls provide the strongest support in positive gamma environments", "OpEx Friday put walls are bulletproof until they're not — always have a stop", "When price breaks below the put wall, it often accelerates sharply"],
    relatedPatterns: ["Call Wall Rejection", "Gamma Flip Reclaim", "Support Bounce", "Double Bottom"],
    example: "SPY put wall at 440. Price drops to 440.20 and bounces with heavy volume — put wall bounce long with target at gamma flip 445.",
    homework: "Each morning for one week, identify the put wall for SPY on GEMX. Track how price reacts when it approaches.",
    quiz: { question: "Why does the put wall create support?", choices: ["Retail traders buy there", "Market makers buy shares to hedge their short put exposure", "It is a round number", "Options are cheapest there"], answer: "Market makers buy shares to hedge their short put exposure" },
    candles: [
      {o:215,c:210,h:216,l:209,bull:false},{o:210,c:205,h:211,l:204,bull:false},
      {o:205,c:200,h:206,l:199,bull:false},{o:200,c:196,h:201,l:195,bull:false},
      {o:196,c:194,h:197,l:194,bull:false},
      {o:194,c:201,h:193,l:203,bull:true},
      {o:201,c:208,h:200,l:210,bull:true},{o:208,c:214,h:207,l:216,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-22,text:'Put Wall',color:TEAL},
      {type:'label',candleIdx:5,offset:-18,text:'Bounce',color:TEAL},
      {type:'hline',candleIdx:4,label:'Put Wall'},
    ]
  },
  {
    id: 101, name: "Long Gamma Chop", level: "Intermediate",
    category: "Gamma Pattern", signal: "Indecision",
    signalColor: GOLD,
    description: "When dealers are net long gamma, they buy dips and sell rips — creating a choppy, mean-reverting market. Price oscillates in a tight range. Trend strategies fail. Range strategies work best.",
    entry: "Sell upper range of chop zone, buy lower range",
    stop: "Outside the defined chop range",
    target: "Opposite side of the chop range",
    confidence: 7.5, successRate: "Range-bound — not directional",
    psychology: "Positive gamma creates a self-stabilizing market. Every move away from equilibrium triggers dealer hedging that pushes price back. This is the market fighting itself — neither bulls nor bears win decisively.",
    marketContext: "Common between major catalyst events, during low-VIX periods, and when price is near the gamma flip with balance between calls and puts.",
    idealLocation: "Between the put wall (lower bound) and call wall (upper bound) with the gamma flip in the middle.",
    requirements: ["Price must be in positive gamma environment", "Check GEMX to confirm positive gamma", "VIX should be low and declining", "Clear range between put and call wall"],
    confirmation: ["Multiple failed breakouts from the range", "VIX staying low", "Price reverting after each move", "Dealers clearly damping volatility"],
    volumeProfile: "Volume is typically low and declining in long gamma chop. Volume spikes signal potential breakout of the chop zone.",
    timeframe: ["5m", "15m", "1H"],
    aggressiveEntry: "Fade moves at range extremes",
    conservativeEntry: "Wait for clear rejection at upper or lower range bound",
    riskReward: "1:1 to 1.5:1 — chop strategies have tight targets",
    bestIndicators: ["GEMX Gamma Dashboard", "VIX", "Bollinger Bands", "RSI"],
    optionsPlay: "Sell premium — iron condors or short strangles work well in long gamma chop. Avoid directional options.",
    institutionalClues: ["VIX term structure in contango", "Low realized volatility", "Dealer flow nets out to near zero"],
    commonMistakes: ["Trying to trend trade in a long gamma environment", "Buying breakouts that immediately fail", "Ignoring GEMX gamma reading", "Not checking VIX"],
    proTips: ["Long gamma chop is when premium sellers make their money", "When chop breaks, it breaks hard — have a plan for the breakout", "The longer the chop, the bigger the eventual breakout"],
    relatedPatterns: ["Short Gamma Expansion", "Gamma Flip Reclaim", "Range Contraction", "Inside Bar"],
    example: "SPY oscillates between 445 and 449 for three days with VIX at 13 — classic long gamma chop. Sell at 449, buy at 445.",
    homework: "Identify one week of long gamma chop on SPY using GEMX. Practice fading the extremes of the range.",
    quiz: { question: "What trading strategy works best in a long gamma chop environment?", choices: ["Trend following", "Breakout trading", "Range trading and premium selling", "Momentum trading"], answer: "Range trading and premium selling" },
    candles: [
      {o:202,c:206,h:201,l:208,bull:true},{o:206,c:202,h:207,l:201,bull:false},
      {o:202,c:206,h:201,l:208,bull:true},{o:206,c:203,h:207,l:202,bull:false},
      {o:203,c:206,h:202,l:207,bull:true},{o:206,c:202,h:207,l:201,bull:false},
      {o:202,c:205,h:201,l:207,bull:true},{o:205,c:202,h:206,l:201,bull:false},
      {o:202,c:206,h:201,l:207,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-18,text:'Chop Zone',color:GOLD},
      {type:'hline',candleIdx:0,label:'Upper Bound'},
    ]
  },
  {
    id: 102, name: "Short Gamma Expansion", level: "Advanced",
    category: "Gamma Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "When dealers are net short gamma, they amplify price moves — buying when price rises and selling when price falls. This creates explosive, trending moves. Breakouts run harder. Selloffs accelerate.",
    entry: "In the direction of the trend after confirming negative gamma environment",
    stop: "Recent swing point against the trade",
    target: "Measured move — negative gamma moves often extend 1.5-2x normal",
    confidence: 8.0, successRate: "65-72% directionally",
    psychology: "Short gamma creates a self-amplifying market. Every move in one direction triggers dealer hedging that accelerates it. This is the market feeding on itself — moves become explosive and extended.",
    marketContext: "Common during high-VIX periods, major catalyst events, and when price is below the gamma flip. VIX above 20 often signals short gamma territory.",
    idealLocation: "Below the gamma flip (for bearish expansion) or above the gamma flip after a confirmed breakout (for bullish expansion).",
    requirements: ["Price must be in negative gamma environment", "Check GEMX to confirm negative gamma", "VIX should be elevated (above 18-20)", "Clear directional trigger needed"],
    confirmation: ["Trend continues with increased velocity", "VIX rising confirming negative gamma", "Volume expanding on each move", "Dealer hedging amplifying direction"],
    volumeProfile: "Volume expands dramatically in short gamma expansion. Each price move is met with increasing dealer flow amplifying the move.",
    timeframe: ["1m", "5m", "15m", "1H"],
    aggressiveEntry: "Enter in trend direction on any small pullback",
    conservativeEntry: "Enter after a brief consolidation in the trend direction",
    riskReward: "2:1 minimum — negative gamma moves extend further than expected",
    bestIndicators: ["GEMX Gamma Dashboard", "VIX", "Volume", "Trend indicators"],
    optionsPlay: "Buy directional options — negative gamma environments mean moves are faster and bigger. Use shorter-dated options for maximum leverage.",
    institutionalClues: ["VIX term structure in backwardation", "High realized volatility", "Dealer flow amplifying in one direction"],
    commonMistakes: ["Fading moves in a short gamma environment", "Using range strategies when market is in negative gamma", "Not checking GEMX before trading", "Ignoring VIX"],
    proTips: ["Short gamma environments are where the biggest single-day moves happen", "Never fade a move in short gamma without extreme conviction", "The gamma flip level is the key — know it every day from GEMX"],
    relatedPatterns: ["Long Gamma Chop", "Gamma Flip Rejection", "Volatility Expansion", "Squeeze Breakout"],
    example: "SPY breaks below gamma flip at 445 with VIX spiking to 25 — short gamma expansion in force, trend trades only.",
    homework: "Identify 3 short gamma expansion days on SPY using VIX and GEMX. Track how far price moved vs a normal day.",
    quiz: { question: "In a short gamma environment, what happens to price moves?", choices: ["They are dampened and mean-revert", "They are amplified and extend further", "They stop at VWAP", "They reverse at EMA"], answer: "They are amplified and extend further" },
    candles: [
      {o:200,c:204,h:199,l:206,bull:true},{o:204,c:210,h:203,l:212,bull:true},
      {o:210,c:218,h:209,l:220,bull:true},{o:218,c:226,h:217,l:228,bull:true},
      {o:226,c:222,h:227,l:221,bull:false},
      {o:222,c:230,h:221,l:232,bull:true},{o:230,c:238,h:229,l:240,bull:true},
      {o:238,c:246,h:237,l:248,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:1,offset:-18,text:'Negative Gamma',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Expansion',color:TEAL},
    ]
  },
  {
    id: 103, name: "Gamma Squeeze Setup", level: "Advanced",
    category: "Gamma Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A feedback loop where rising price forces dealers to buy more shares to hedge their short calls, which drives price higher, which forces more buying — a self-reinforcing squeeze. Can produce explosive moves.",
    entry: "On breakout above the call wall that triggers the squeeze",
    stop: "Below the call wall level",
    target: "Next major call wall above — measure the distance between walls",
    confidence: 8.8, successRate: "72-80% once triggered",
    psychology: "As price approaches and breaks above the call wall, dealers who sold those calls must buy shares. This buying drives price to the next call wall, where the same process repeats — a mechanical cascade of buying.",
    marketContext: "Best during high-options-activity periods. Most common on stocks with heavy retail call buying (meme stocks, high-momentum names). Also occurs on major index ETFs around OpEx.",
    idealLocation: "Just above a major call wall where open interest is very high. Use GEMX to identify call wall clusters.",
    requirements: ["Heavy call open interest at a key strike", "Price approaching or breaking above call wall", "Positive directional momentum", "Check GEMX for call wall density"],
    confirmation: ["Price breaks above call wall on strong volume", "VIX drops as squeeze begins", "Rapid price acceleration above the wall", "Dealer buying visible in tape"],
    volumeProfile: "Volume explodes as the squeeze begins. This is mechanical buying from dealers — not discretionary. The move is faster than normal.",
    timeframe: ["1m", "5m", "15m"],
    aggressiveEntry: "Enter immediately on call wall breakout",
    conservativeEntry: "Enter on first retest of call wall from above",
    riskReward: "3:1 or better — squeezes move fast and far",
    bestIndicators: ["GEMX Gamma Dashboard", "Volume", "Options Open Interest", "Price Momentum"],
    optionsPlay: "ATM or slightly OTM calls with short expiration for maximum gamma leverage during the squeeze. Be ready to exit quickly.",
    institutionalClues: ["Call wall open interest density", "Rapid volume spike on breakout", "Dealer flow accelerating in one direction"],
    commonMistakes: ["Chasing after the squeeze is already 10%+ underway", "Not having an exit plan before entering", "Holding through the inevitable reversal", "Ignoring the next call wall as a target"],
    proTips: ["Gamma squeezes end as fast as they start — always have a target and take profits", "The next call wall above is your exit target", "Pre-market gamma squeeze setups are most explosive at the open"],
    relatedPatterns: ["Call Wall Rejection", "Short Gamma Expansion", "Volatility Expansion", "Breakaway Gap"],
    example: "GME call wall at 20. Price breaks above 20 with massive volume — dealers forced to buy shares, squeezing price to next wall at 25.",
    homework: "Research 3 historical gamma squeeze events. Identify when the squeeze started, how far it ran, and when it reversed.",
    quiz: { question: "What triggers a gamma squeeze?", choices: ["Large short sellers covering", "Dealers forced to buy shares as price breaks above call wall", "Retail FOMO buying", "Earnings surprise"], answer: "Dealers forced to buy shares as price breaks above call wall" },
    candles: [
      {o:198,c:202,h:197,l:204,bull:true},{o:202,c:206,h:201,l:208,bull:true},
      {o:206,c:204,h:207,l:203,bull:false},{o:204,c:208,h:203,l:210,bull:true},
      {o:208,c:218,h:207,l:220,bull:true},
      {o:218,c:230,h:217,l:232,bull:true},{o:230,c:242,h:229,l:244,bull:true},
      {o:242,c:252,h:241,l:254,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Call Wall',color:RED},
      {type:'label',candleIdx:4,offset:-18,text:'Squeeze Start',color:TEAL},
      {type:'label',candleIdx:6,offset:-18,text:'Expansion',color:TEAL},
    ]
  },
  {
    id: 104, name: "Max Pain Magnet", level: "Advanced",
    category: "Gamma Pattern", signal: "Indecision",
    signalColor: GOLD,
    description: "As options expiration approaches, price tends to gravitate toward max pain — the strike where the maximum number of options expire worthless. This creates a predictable gravitational pull on price near OpEx.",
    entry: "Trade toward max pain as expiration approaches (Thursday/Friday of OpEx week)",
    stop: "If price breaks away from max pain direction by 1%+",
    target: "The max pain strike itself",
    confidence: 7.2, successRate: "55-65% — strongest within 48 hours of expiration",
    psychology: "Options market makers maximize their profits when options expire worthless. Their hedging activity naturally moves price toward the level where the most contracts expire worthless — max pain.",
    marketContext: "Most powerful in the final 48 hours before monthly or weekly options expiration. Weakest when there is a major catalyst (earnings, Fed) overriding the gravitational pull.",
    idealLocation: "When current price is significantly away from max pain (more than 1-2%). The pull is strongest when price needs to travel to reach max pain.",
    requirements: ["Must be within 48 hours of expiration", "Price must be away from max pain", "Check GEMX for current max pain level", "No major catalyst overriding"],
    confirmation: ["Price begins moving toward max pain", "Volume supports the move", "VIX stable", "No major news opposing the direction"],
    volumeProfile: "Max pain moves are often low-volume drifts rather than explosive moves. Don't expect a big surge — expect a slow gravitational pull.",
    timeframe: ["15m", "1H", "Daily"],
    aggressiveEntry: "Trade toward max pain immediately on Thursday of OpEx week",
    conservativeEntry: "Wait for price to begin moving toward max pain on its own",
    riskReward: "1.5:1 — max pain is not a huge move but highly predictable",
    bestIndicators: ["GEMX Gamma Dashboard", "Max Pain Calculator", "Volume", "Time to Expiration"],
    optionsPlay: "Avoid buying options near expiration — theta decay is extreme. If trading, use the underlying stock or very short-term debit spreads.",
    institutionalClues: ["Market makers defending max pain level", "Put/call ratio normalizing near expiration", "Unusual hedging activity in final hours"],
    commonMistakes: ["Applying max pain theory too early in the week", "Ignoring catalysts that override the pull", "Using max pain in individual stocks where one trade can dominate", "Over-relying on max pain without chart context"],
    proTips: ["Max pain works best on SPY and QQQ — liquid, heavily traded instruments", "Monthly OpEx max pain is stronger than weekly", "Always check GEMX for the current max pain level — it changes daily"],
    relatedPatterns: ["Long Gamma Chop", "Call Wall Rejection", "Put Wall Bounce", "Gamma Flip Reclaim"],
    example: "SPY max pain is 445 on Friday OpEx. On Thursday, price is at 449. Expect drift toward 445 — short toward max pain.",
    homework: "Track max pain on SPY for 4 consecutive OpEx Fridays using GEMX. Record where price closes relative to max pain.",
    quiz: { question: "When is the max pain magnet effect strongest?", choices: ["Monday of OpEx week", "Within 48 hours of expiration", "When VIX is high", "During pre-market"], answer: "Within 48 hours of expiration" },
    candles: [
      {o:210,c:208,h:211,l:207,bull:false},{o:208,c:207,h:209,l:206,bull:false},
      {o:207,c:208,h:206,l:209,bull:true},{o:208,c:207,h:209,l:206,bull:false},
      {o:207,c:206,h:208,l:205,bull:false},{o:206,c:207,h:205,l:208,bull:true},
      {o:207,c:205,h:208,l:204,bull:false},{o:205,c:204,h:206,l:203,bull:false},
      {o:204,c:205,h:203,l:206,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:1,offset:-18,text:'Above Max Pain',color:RED},
      {type:'label',candleIdx:7,offset:-22,text:'Max Pain',color:GOLD},
      {type:'hline',candleIdx:7,label:'Max Pain Strike'},
    ]
  },

  // ── Smart Money Concepts ──
  {
    id: 105, name: "Liquidity Sweep", level: "Advanced",
    category: "Smart Money", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Price briefly dips below a key low (sweeping the stop losses of retail longs), then immediately reverses higher. Smart money uses this to accumulate at favorable prices before the real move begins.",
    entry: "When price quickly reverses above the swept level",
    stop: "Below the sweep low",
    target: "Previous high or next key resistance",
    confidence: 8.6, successRate: "68-75% when reversal is swift",
    psychology: "Institutions know where retail stop losses sit — below obvious swing lows. They engineer a brief move to those levels to trigger stops (buying the shares retail is forced to sell), then reverse hard. The sweep IS the entry signal.",
    marketContext: "Best at major swing lows, previous day lows, round numbers, and any obvious support level where retail stop orders cluster.",
    idealLocation: "Below a well-defined swing low, previous day low, or equal lows where stop orders are obviously clustered.",
    requirements: ["Price must breach the key low", "Reversal must be swift — within 1-3 candles", "Volume should spike on the sweep", "Price must close back above the swept level"],
    confirmation: ["Strong bullish reversal candle after the sweep", "Price closes above the swept level", "Volume spike on the sweep candle", "Follow-through bullish candles"],
    volumeProfile: "Volume spikes dramatically on the sweep candle as retail stops are triggered and institutional buyers absorb the selling. Watch for the reversal to come with continued strong volume.",
    timeframe: ["5m", "15m", "1H", "4H"],
    aggressiveEntry: "Enter as price reverses above the swept level",
    conservativeEntry: "Wait for price to close above the swept level and retest it",
    riskReward: "3:1 or better — sweeps often lead to explosive moves",
    bestIndicators: ["Volume", "Price Action", "Market Structure", "Key Swing Levels"],
    optionsPlay: "ATM calls with 3-7 days to expiration. Liquidity sweeps often lead to sharp, fast moves higher.",
    institutionalClues: ["Extreme volume on the sweep candle", "Immediate reversal with no follow-through lower", "Dark pool buying prints appearing after the sweep"],
    commonMistakes: ["Entering as price is still sweeping lower", "Confusing a real breakdown with a sweep", "Not waiting for reversal confirmation", "Stop too tight below the sweep"],
    proTips: ["The faster the reversal after the sweep, the stronger the signal", "Sweeps at equal lows (double bottom levels) are the strongest", "If price doesn't reverse quickly after the sweep, it's a real breakdown — exit"],
    relatedPatterns: ["Equal Low Sweep", "Failed Breakdown", "Bullish Engulfing", "Pin Bar Reversal"],
    example: "SPY makes equal lows at 440. Price briefly trades to 439.50, then snaps back above 440 on massive volume — liquidity sweep, long.",
    homework: "Find 5 liquidity sweep setups on 5-minute charts. Mark the swept level, entry, stop, target, and outcome.",
    quiz: { question: "What is the purpose of a liquidity sweep from an institutional perspective?", choices: ["To create a new downtrend", "To trigger retail stop losses and accumulate at better prices", "To test support legitimacy", "To confuse technical analysts"], answer: "To trigger retail stop losses and accumulate at better prices" },
    candles: [
      {o:208,c:204,h:209,l:203,bull:false},{o:204,c:200,h:205,l:199,bull:false},
      {o:200,c:197,h:201,l:196,bull:false},{o:197,c:194,h:198,l:193,bull:false},
      {o:194,c:191,h:195,l:188,bull:false},
      {o:189,c:199,h:188,l:201,bull:true},
      {o:199,c:208,h:198,l:210,bull:true},{o:208,c:216,h:207,l:218,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-25,text:'Sweep Low',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Reversal',color:TEAL},
      {type:'bracket',start:4,end:5,label:'Liquidity Sweep'},
    ]
  },
  {
    id: 106, name: "Equal High Sweep", level: "Advanced",
    category: "Smart Money", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price briefly breaks above a series of equal highs (sweeping buy-stop orders above resistance), then reverses sharply lower. Institutions use this to distribute at favorable prices.",
    entry: "When price quickly reverses below the swept high level",
    stop: "Above the sweep high",
    target: "Previous low or next key support",
    confidence: 8.4, successRate: "66-73% when reversal is swift",
    psychology: "Equal highs are obvious to retail traders who place buy-stop orders above them. Institutions sweep those levels to fill their short positions at the best price, then reverse hard.",
    marketContext: "Best at major swing highs, previous day highs, round numbers, and any obvious resistance level where buy-stop orders cluster.",
    idealLocation: "Above a well-defined double top, equal highs, or previous day high where buy stops are clustered.",
    requirements: ["Price must breach the equal high level", "Reversal must be swift — within 1-3 candles", "Volume spike on the sweep", "Price must close back below the swept level"],
    confirmation: ["Strong bearish reversal candle after sweep", "Close below swept level", "Volume spike on sweep", "Follow-through bearish candles"],
    volumeProfile: "Volume spikes as retail buy stops trigger and institutions distribute. Watch for immediate reversal with continued selling volume.",
    timeframe: ["5m", "15m", "1H", "4H"],
    aggressiveEntry: "Enter short as price reverses below the swept high",
    conservativeEntry: "Wait for close below swept level and failed retest",
    riskReward: "3:1 or better",
    bestIndicators: ["Volume", "Price Action", "Market Structure", "Equal Highs"],
    optionsPlay: "ATM puts with 3-7 days to expiration. Equal high sweeps often produce sharp fast moves lower.",
    institutionalClues: ["Spike volume on sweep candle", "Immediate reversal with no follow-through higher", "Dark pool selling prints after the sweep"],
    commonMistakes: ["Shorting as price is still sweeping higher", "Confusing a real breakout with a sweep", "Not waiting for reversal confirmation", "Stop too tight above the sweep"],
    proTips: ["The faster the reversal, the stronger the signal", "Equal highs that have been tested multiple times produce the strongest sweeps", "If price doesn't reverse quickly — it's a real breakout, not a sweep"],
    relatedPatterns: ["Equal Low Sweep", "Liquidity Sweep", "Failed Breakout", "Shooting Star"],
    example: "QQQ has equal highs at 380. Price briefly trades to 380.80, then snaps back below 380 on heavy volume — equal high sweep short.",
    homework: "Find 5 equal high sweep setups. Mark the swept level, entry, stop, target, and outcome.",
    quiz: { question: "What triggers the reversal in an equal high sweep?", choices: ["Retail selling at resistance", "Institutions filling short positions at the sweep high then reversing", "Options expiration", "Earnings miss"], answer: "Institutions filling short positions at the sweep high then reversing" },
    candles: [
      {o:192,c:196,h:191,l:198,bull:true},{o:196,c:200,h:195,l:202,bull:true},
      {o:200,c:204,h:199,l:206,bull:true},{o:204,c:208,h:203,l:209,bull:true},
      {o:208,c:212,h:207,l:215,bull:true},
      {o:214,c:206,h:216,l:205,bull:false},
      {o:206,c:199,h:207,l:198,bull:false},{o:199,c:193,h:200,l:192,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Sweep High',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Reversal',color:RED},
      {type:'bracket',start:4,end:5,label:'Equal High Sweep'},
    ]
  },
  {
    id: 107, name: "Equal Low Sweep", level: "Advanced",
    category: "Smart Money", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Price briefly breaches a double bottom or equal low level (sweeping stop losses below), then reverses sharply higher. The equal low sweep is one of the most reliable Smart Money setups.",
    entry: "When price reverses above the equal low level after the sweep",
    stop: "Below the sweep low",
    target: "Previous high or 2x the sweep distance",
    confidence: 8.6, successRate: "69-76% when reversal is swift",
    psychology: "Equal lows are a neon sign for retail traders' stop losses. Institutions target these levels to accumulate, trigger the stops, absorb the selling, and launch the real move.",
    marketContext: "Best at double bottoms, equal swing lows, previous day lows, and round number supports where stop-loss clusters are obvious.",
    idealLocation: "Below a well-defined double bottom or series of equal lows that have been tested multiple times.",
    requirements: ["Price must breach below equal lows", "Reversal must happen within 1-3 candles", "Volume spike on sweep", "Close back above equal low level"],
    confirmation: ["Bullish reversal candle after sweep", "Close above swept level", "Volume spike", "Sustained follow-through higher"],
    volumeProfile: "High volume on the sweep candle as stops trigger, then continued buying volume on the reversal confirms institutional accumulation.",
    timeframe: ["5m", "15m", "1H", "4H"],
    aggressiveEntry: "Enter long as reversal candle forms",
    conservativeEntry: "Wait for close above equal low and retest hold",
    riskReward: "3:1 or better",
    bestIndicators: ["Volume", "Price Action", "Equal Lows on Chart", "Market Structure"],
    optionsPlay: "ATM calls with 3-7 days to expiration. Equal low sweeps often launch sharp rallies.",
    institutionalClues: ["Volume spike on sweep", "Immediate price reversal", "Call flow appearing after the sweep"],
    commonMistakes: ["Buying during the sweep before reversal", "Missing the entry by waiting too long", "Stop too tight", "Not identifying equal lows beforehand"],
    proTips: ["Mark equal lows in pre-market so you're ready when the sweep happens", "The deeper below the equal lows the sweep goes, the more violent the reversal", "Triple equal lows produce the strongest sweeps"],
    relatedPatterns: ["Equal High Sweep", "Liquidity Sweep", "Double Bottom", "Failed Breakdown"],
    example: "AAPL has equal lows at 175. Price briefly trades to 174.20, immediately reverses above 175 on heavy volume — equal low sweep long.",
    homework: "Mark equal lows on 5 different tickers in pre-market. Watch for sweeps during the trading session and track outcomes.",
    quiz: { question: "What makes equal lows a prime target for institutional liquidity sweeps?", choices: ["They are round numbers", "They represent obvious stop-loss clusters for retail traders", "They always hold as support", "They appear in all market conditions"], answer: "They represent obvious stop-loss clusters for retail traders" },
    candles: [
      {o:210,c:206,h:211,l:205,bull:false},{o:206,c:202,h:207,l:201,bull:false},
      {o:202,c:198,h:203,l:197,bull:false},{o:198,c:195,h:199,l:194,bull:false},
      {o:195,c:192,h:196,l:189,bull:false},
      {o:190,c:200,h:189,l:202,bull:true},
      {o:200,c:209,h:199,l:211,bull:true},{o:209,c:217,h:208,l:219,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-25,text:'Equal Lows Swept',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Reversal',color:TEAL},
    ]
  },
  {
    id: 108, name: "Order Block Bounce", level: "Advanced",
    category: "Smart Money", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Price returns to the last bearish candle before a major bullish move (the order block) and bounces. This candle represents where institutions placed their large buy orders — they defend it on retests.",
    entry: "First bullish candle when price returns to the order block zone",
    stop: "Below the bottom of the order block",
    target: "Previous high or origin of the impulse move",
    confidence: 8.4, successRate: "66-74% at well-defined order blocks",
    psychology: "Institutions place their buy orders in one spot — the order block. They cannot fill their entire position in one go, so when price returns to that level, they continue buying. This creates reliable support.",
    marketContext: "Best when price has made a significant bullish impulse move away from the order block and returns for the first retest. The longer price stays away, the stronger the eventual return reaction.",
    idealLocation: "The last bearish candle body before a major bullish move. This is the order block — the zone where institutional buying began.",
    requirements: ["Identify the last bearish candle before a large bullish move", "Price must return to that candle's body", "First retest is strongest", "Volume should expand on the bounce"],
    confirmation: ["Bullish candle forming in the order block zone", "Volume expansion", "Price closes above the order block", "Pattern confirmation (hammer, engulfing)"],
    volumeProfile: "Volume should expand when price returns to the order block, indicating institutions are defending their position.",
    timeframe: ["15m", "1H", "4H", "Daily"],
    aggressiveEntry: "Enter as price enters the order block zone",
    conservativeEntry: "Wait for a bullish candle to form and confirm bounce",
    riskReward: "3:1 or better — well-defined order blocks are high-accuracy",
    bestIndicators: ["Price Action", "Volume", "Market Structure", "Key Levels"],
    optionsPlay: "ATM calls with 5-14 days to expiration. Order block bounces are reliable enough for slightly more aggressive sizing.",
    institutionalClues: ["Absorption of selling at the order block", "Volume spike on bounce", "Call flow appearing at the order block level"],
    commonMistakes: ["Confusing any support with an order block", "Trading the 2nd or 3rd retest (weaker)", "Not marking the exact candle body as the zone", "Stop too tight"],
    proTips: ["The order block is the specific candle body — not a vague zone", "First retest is 80% more reliable than subsequent retests", "Order blocks combined with FVG create the strongest setups"],
    relatedPatterns: ["Order Block Rejection", "Fair Value Gap", "Support Bounce", "Liquidity Sweep"],
    example: "NVDA makes a big bullish move from 450. The last bearish candle before the move has a body from 448-452. Price returns to 450 — order block bounce long.",
    homework: "Mark 5 order blocks on daily charts. Track the next retest and outcome for each.",
    quiz: { question: "What defines a bullish order block?", choices: ["Any support level", "The last bearish candle before a significant bullish impulse move", "A round number", "The moving average zone"], answer: "The last bearish candle before a significant bullish impulse move" },
    candles: [
      {o:210,c:215,h:209,l:217,bull:true},{o:215,c:222,h:214,l:224,bull:true},
      {o:222,c:230,h:221,l:232,bull:true},
      {o:230,c:224,h:231,l:223,bull:false},{o:224,c:218,h:225,l:217,bull:false},
      {o:218,c:214,h:219,l:213,bull:false},
      {o:214,c:220,h:213,l:222,bull:true},
      {o:220,c:228,h:219,l:230,bull:true},{o:228,c:235,h:227,l:237,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:5,offset:-22,text:'Order Block',color:GOLD},
      {type:'label',candleIdx:6,offset:-18,text:'Bounce',color:TEAL},
    ]
  },
  {
    id: 109, name: "Order Block Rejection", level: "Advanced",
    category: "Smart Money", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price returns to the last bullish candle before a major bearish move (the bearish order block) and gets rejected. Institutions defend their short positions at this level on retests.",
    entry: "First bearish candle when price returns to the order block zone",
    stop: "Above the top of the order block",
    target: "Previous low or origin of the bearish impulse",
    confidence: 8.4, successRate: "65-73% at well-defined order blocks",
    psychology: "Institutions placed their sell orders in the order block. When price returns, they continue to sell at those favorable levels — creating reliable resistance.",
    marketContext: "Best when price has made a significant bearish impulse move away from the order block and returns for the first retest.",
    idealLocation: "The last bullish candle body before a major bearish move. This is the bearish order block.",
    requirements: ["Identify last bullish candle before large bearish move", "Price must return to that candle body", "First retest is strongest", "Volume expands on rejection"],
    confirmation: ["Bearish candle forming in order block zone", "Volume expansion", "Close below order block", "Bearish pattern confirmation"],
    volumeProfile: "Volume expands on rejection confirming institutional selling.",
    timeframe: ["15m", "1H", "4H", "Daily"],
    aggressiveEntry: "Enter as price enters the order block zone",
    conservativeEntry: "Wait for bearish candle to confirm rejection",
    riskReward: "3:1 or better",
    bestIndicators: ["Price Action", "Volume", "Market Structure", "Key Levels"],
    optionsPlay: "ATM puts with 5-14 days to expiration.",
    institutionalClues: ["Distribution at order block", "Volume spike on rejection", "Put flow at order block level"],
    commonMistakes: ["Trading 2nd or 3rd retests", "Not marking the exact candle body", "Stop too tight", "Confusing with regular resistance"],
    proTips: ["Bearish order block + FVG = highest conviction short setup", "First retest is critical — mark the candle before entering", "Combine with bearish market structure for best results"],
    relatedPatterns: ["Order Block Bounce", "Fair Value Gap", "Resistance Rejection", "Liquidity Sweep"],
    example: "SPY makes a sharp selloff from 450. The last bullish candle before the drop has body from 448-452. Price returns to 450 — order block rejection short.",
    homework: "Mark 5 bearish order blocks on daily charts. Track the next retest and outcome.",
    quiz: { question: "What defines a bearish order block?", choices: ["Any resistance level", "The last bullish candle before a significant bearish impulse move", "A Fibonacci level", "The 200 EMA"], answer: "The last bullish candle before a significant bearish impulse move" },
    candles: [
      {o:200,c:194,h:201,l:193,bull:false},{o:194,c:188,h:195,l:187,bull:false},
      {o:188,c:182,h:189,l:181,bull:false},
      {o:182,c:188,h:181,l:189,bull:true},{o:188,c:194,h:187,l:195,bull:true},
      {o:194,c:198,h:193,l:199,bull:true},
      {o:198,c:192,h:199,l:191,bull:false},
      {o:192,c:186,h:193,l:185,bull:false},{o:186,c:180,h:187,l:179,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:5,offset:-18,text:'Order Block',color:GOLD},
      {type:'label',candleIdx:6,offset:-18,text:'Rejection',color:RED},
    ]
  },
  {
    id: 110, name: "Fair Value Gap (FVG)", level: "Advanced",
    category: "Smart Money", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A three-candle pattern where the middle candle moves so fast that it leaves a gap between candle 1's high and candle 3's low. Price tends to return to fill this imbalance before continuing in the original direction.",
    entry: "When price returns to fill the FVG and shows rejection",
    stop: "Below the bottom of the FVG (bullish) or above the top (bearish)",
    target: "Origin of the impulse that created the FVG",
    confidence: 8.2, successRate: "65-72% when price returns to fill",
    psychology: "The FVG represents an area of market imbalance — price moved so fast that there was no two-sided trading. The market has a natural tendency to return to areas of imbalance and establish fair value before continuing.",
    marketContext: "Best in trending markets where impulse moves create clear FVGs. The first fill of an FVG is the most reliable trade.",
    idealLocation: "Any FVG created by a strong impulse move. The most powerful FVGs are created by news-driven gaps or momentum bursts.",
    requirements: ["Candle 3 low must be above Candle 1 high (bullish FVG)", "The gap must be clear and measurable", "First fill is strongest", "Overall trend should support direction"],
    confirmation: ["Price enters FVG zone and shows rejection", "Bullish candle forming at bottom of FVG", "Volume expansion on rejection", "Broader trend supports"],
    volumeProfile: "Low volume when price returns to FVG is ideal — it means the move back is a weak retracement. High volume expansion on the rejection confirms the FVG holds.",
    timeframe: ["5m", "15m", "1H", "4H", "Daily"],
    aggressiveEntry: "Enter as price enters the FVG zone",
    conservativeEntry: "Wait for rejection candle within the FVG",
    riskReward: "3:1 — the target is the origin of the impulse",
    bestIndicators: ["Price Action", "Volume", "Market Structure", "Order Blocks"],
    optionsPlay: "ATM calls with 3-7 days to expiration when price fills a bullish FVG and rejects.",
    institutionalClues: ["Absorption at FVG zone", "Bullish flow at FVG level", "Dark pool prints in FVG zone"],
    commonMistakes: ["Trading FVGs against the trend", "Not marking exact FVG boundaries", "Entering before rejection confirmed", "Trading 2nd or 3rd fills"],
    proTips: ["FVG + Order Block at the same level = the highest conviction Smart Money setup", "Not all FVGs get filled — prioritize ones in the direction of the trend", "Daily chart FVGs lead to the largest moves"],
    relatedPatterns: ["Order Block Bounce", "Imbalance Fill", "Liquidity Sweep", "Break and Retest"],
    example: "AAPL creates a bullish FVG between 175 and 177. Price returns to 176, shows a hammer — FVG fill long entry.",
    homework: "Find 5 FVGs on hourly charts. Mark the exact boundaries, track when price fills them, and record the outcome.",
    quiz: { question: "What creates a Fair Value Gap?", choices: ["A slow grinding move", "A fast impulse candle leaving a gap between candle 1 high and candle 3 low", "A doji candle", "An inside bar"], answer: "A fast impulse candle leaving a gap between candle 1 high and candle 3 low" },
    candles: [
      {o:195,c:200,h:194,l:202,bull:true},
      {o:200,c:212,h:199,l:214,bull:true},
      {o:212,c:218,h:211,l:220,bull:true},
      {o:218,c:214,h:219,l:213,bull:false},{o:214,c:210,h:215,l:209,bull:false},
      {o:210,c:206,h:211,l:205,bull:false},
      {o:206,c:212,h:205,l:214,bull:true},
      {o:212,c:219,h:211,l:221,bull:true},{o:219,c:226,h:218,l:228,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:1,offset:-18,text:'FVG Created',color:GOLD},
      {type:'label',candleIdx:5,offset:-22,text:'FVG Fill',color:GOLD},
      {type:'label',candleIdx:6,offset:-18,text:'Rejection',color:TEAL},
      {type:'bracket',start:0,end:2,label:'FVG Zone'},
    ]
  },
  {
    id: 111, name: "Imbalance Fill", level: "Intermediate",
    category: "Smart Money", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price returns to fill a previous area of imbalance (gap or FVG) before reversing. Markets seek equilibrium. Imbalance fills are high-probability counter-trend trades or continuation setups.",
    entry: "At the imbalance zone with confirmation of rejection or acceptance",
    stop: "Beyond the full imbalance zone",
    target: "Opposite side of the imbalance",
    confidence: 7.8, successRate: "62-70% on first fill",
    psychology: "Markets are auctions. When price moves too fast in one direction, it leaves areas where no fair two-sided trading occurred. The market naturally returns to these areas to establish fair value.",
    marketContext: "Best when price has moved significantly away from an imbalance zone and begins to retrace. Works in all market conditions.",
    idealLocation: "Any clearly defined gap or FVG on any timeframe. Higher timeframe imbalances (daily/weekly) are the strongest.",
    requirements: ["Clear imbalance zone must be identified", "Price must be returning to the zone", "First fill is most reliable", "Determine direction (fill then continue, or fill then reverse)"],
    confirmation: ["Price enters imbalance zone", "Rejection or acceptance confirmed by candle", "Volume supports direction", "Market structure confirms"],
    volumeProfile: "Watch for volume behavior within the imbalance — low volume fill suggests the zone will hold, high volume fill suggests price will blow through.",
    timeframe: ["15m", "1H", "4H", "Daily"],
    aggressiveEntry: "Enter at the edge of the imbalance zone",
    conservativeEntry: "Wait for candle confirmation within the zone",
    riskReward: "2:1 minimum",
    bestIndicators: ["Price Action", "Volume", "FVG Zones", "Market Structure"],
    optionsPlay: "Match direction of the expected move after fill. ATM options with 3-7 days to expiration.",
    institutionalClues: ["Institutional prints at imbalance", "Volume anomalies within the zone", "Flow direction at the imbalance level"],
    commonMistakes: ["Assuming all imbalances fill", "Not distinguishing fill-and-continue from fill-and-reverse", "Ignoring trend direction", "No stop beyond the zone"],
    proTips: ["Not every imbalance fills — prioritize those aligned with the trend", "Daily chart imbalances take longer to fill but produce larger moves", "FVG is a specific type of imbalance — use the same principles"],
    relatedPatterns: ["Fair Value Gap", "Order Block Bounce", "Gap Fill", "Break and Retest"],
    example: "QQQ leaves an imbalance between 370-372. Price returns to 371, rejects — imbalance fill complete, continue long.",
    homework: "Mark 5 imbalance zones on daily charts. Track which ones fill and what happens after the fill.",
    quiz: { question: "Why do markets tend to fill imbalances?", choices: ["Technical analysis says so", "Markets seek equilibrium and return to areas of unfair two-sided trading", "Retail traders force them to fill", "Options expiration causes fills"], answer: "Markets seek equilibrium and return to areas of unfair two-sided trading" },
    candles: [
      {o:200,c:196,h:201,l:195,bull:false},{o:196,c:192,h:197,l:191,bull:false},
      {o:192,c:188,h:193,l:187,bull:false},
      {o:188,c:192,h:187,l:193,bull:true},{o:192,c:196,h:191,l:197,bull:true},
      {o:196,c:200,h:195,l:201,bull:true},
      {o:200,c:196,h:201,l:195,bull:false},
      {o:196,c:190,h:197,l:189,bull:false},{o:190,c:184,h:191,l:183,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-22,text:'Imbalance',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'Fill Complete',color:GOLD},
      {type:'label',candleIdx:6,offset:-18,text:'Reversal',color:RED},
    ]
  },
  {
    id: 112, name: "Mitigation Block", level: "Advanced",
    category: "Smart Money", signal: "Bearish Reversal",
    signalColor: RED,
    description: "A failed order block — price returns to an order block but instead of bouncing, it pushes through. The mitigation block becomes resistance as institutions exit losing positions on the retest.",
    entry: "Short on the retest of the mitigated (failed) order block",
    stop: "Above the top of the mitigation block",
    target: "Next major support or previous low",
    confidence: 7.8, successRate: "60-68% on first retest",
    psychology: "When an order block fails (price pushes through), trapped institutional longs need to exit. When price returns to the failed order block, they use that rally to exit their positions — creating strong resistance.",
    marketContext: "Best after a clear order block has been broken through. The first retest of the mitigated block is the entry.",
    idealLocation: "The exact body of the failed bullish order block, now acting as resistance.",
    requirements: ["A bullish order block must have been broken through", "Price must return to test the failed level", "First retest is strongest", "Chart should show bearish structure"],
    confirmation: ["Bearish candle forming at mitigation block", "Volume expansion on rejection", "Market structure remains bearish", "No recovery above mitigation block"],
    volumeProfile: "Watch for distribution volume at the mitigation block — trapped longs exiting their positions.",
    timeframe: ["15m", "1H", "4H", "Daily"],
    aggressiveEntry: "Enter short as price enters the mitigation block",
    conservativeEntry: "Wait for bearish candle confirmation at the mitigation block",
    riskReward: "2:1 minimum",
    bestIndicators: ["Price Action", "Volume", "Market Structure", "Order Blocks"],
    optionsPlay: "ATM puts with 5-10 days to expiration on mitigation block rejection.",
    institutionalClues: ["Distribution at mitigation block", "Put flow at the level", "Failed recovery attempts at the block"],
    commonMistakes: ["Confusing mitigation block with regular support", "Trading without confirming the original order block failed", "No stop above the block", "2nd or 3rd retests are weaker"],
    proTips: ["Mitigation blocks are where institutional losses become your opportunity", "The more significant the original order block, the stronger the mitigation setup", "Combine with FVG for highest-conviction entries"],
    relatedPatterns: ["Order Block Rejection", "Failed Breakdown", "Break and Retest", "Resistance Rejection"],
    example: "AAPL had a bullish order block at 175. Price breaks below 175, rallies back to 175 — mitigation block rejection short.",
    homework: "Find 3 mitigation block setups. Identify the original order block, the break, and the retest. Track outcome.",
    quiz: { question: "What is a mitigation block?", choices: ["A new order block forming", "A failed order block where trapped institutional positions create resistance on retest", "A gap fill pattern", "A VWAP level"], answer: "A failed order block where trapped institutional positions create resistance on retest" },
    candles: [
      {o:208,c:214,h:207,l:216,bull:true},{o:214,c:210,h:215,l:209,bull:false},
      {o:210,c:204,h:211,l:203,bull:false},{o:204,c:198,h:205,l:197,bull:false},
      {o:198,c:193,h:199,l:192,bull:false},
      {o:193,c:200,h:192,l:202,bull:true},{o:200,c:206,h:199,l:207,bull:true},
      {o:206,c:200,h:208,l:199,bull:false},
      {o:200,c:193,h:201,l:192,bull:false},{o:193,c:187,h:194,l:186,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:0,offset:-18,text:'Order Block',color:GOLD},
      {type:'label',candleIdx:6,offset:-18,text:'Mitigation',color:RED},
      {type:'label',candleIdx:7,offset:-18,text:'Rejection',color:RED},
    ]
  },

  // ── ORB Patterns ──
  {
    id: 113, name: "ORB Long", level: "Intermediate",
    category: "ORB Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "Opening Range Breakout — price breaks above the high of the first 5, 15, or 30-minute candle after market open. One of the most reliable intraday setups when conditions align.",
    entry: "Close above the opening range high with volume",
    stop: "Below the opening range low",
    target: "Opening range height added to breakout point (measured move)",
    confidence: 8.0, successRate: "63-70% with volume confirmation",
    psychology: "The first few minutes of trading establish the day's initial range. Large players who couldn't trade pre-market reveal their hand at the open. A breakout above the opening range shows buyers are in control for the session.",
    marketContext: "Best on high-volume stocks or ETFs with a clear directional bias (gap up, positive sector flow, bullish market). Weak on choppy low-volume days.",
    idealLocation: "After a gap-up open, at a key technical level, or when supported by positive pre-market options flow.",
    requirements: ["Clear opening range established in first 5-30 minutes", "Breakout must occur with volume expansion", "Broader market should be supportive", "No major resistance directly above the breakout"],
    confirmation: ["Close above ORB high on 5-minute chart", "Volume 1.5x+ average on breakout candle", "Price holds above ORB high on first retest", "Market internals positive"],
    volumeProfile: "Volume MUST expand on the ORB breakout. A low-volume breakout fails 70%+ of the time. Watch for institutional size on the tape.",
    timeframe: ["1m", "5m", "15m"],
    aggressiveEntry: "Enter as the breakout candle closes above ORB high",
    conservativeEntry: "Wait for price to retest ORB high from above and hold",
    riskReward: "2:1 minimum — ORB measured move provides clean target",
    bestIndicators: ["Volume", "VWAP", "Pre-market High/Low", "Opening Range Levels"],
    optionsPlay: "Same-day or next-day ATM calls. ORB longs are intraday momentum plays — use short-dated options for maximum leverage.",
    institutionalClues: ["Bullish call flow in pre-market", "Gap up supported by positive futures", "Sector ETF also breaking out", "Dark pool accumulation pre-market"],
    commonMistakes: ["Entering on low-volume breakout", "Ignoring overall market direction", "Setting stop too tight (below ORB high instead of low)", "Trading ORB on low-volatility stocks"],
    proTips: ["The TRQX ORB Sniper Pro indicator automates ORB level tracking for you", "First ORB breakout of the day is strongest — don't wait for the 3rd attempt", "ORB + bullish flow + positive market = highest-conviction intraday setup"],
    relatedPatterns: ["ORB Short", "ORB Fakeout", "ORB Reclaim", "Bull Flag"],
    example: "SPY opens at 445, trades between 444.50 and 446 in first 15 minutes. Price breaks above 446 at 9:50am with heavy volume — ORB long.",
    homework: "Track ORB setups on SPY for one week using the first 15-minute range. Record entry, stop, target, and outcome.",
    quiz: { question: "What is the most important confirmation for an ORB long?", choices: ["Price touches the ORB high", "Close above ORB high with volume expansion", "RSI above 50", "Price gaps above ORB"], answer: "Close above ORB high with volume expansion" },
    candles: [
      {o:200,c:204,h:199,l:202,bull:true},
      {o:204,c:201,h:205,l:200,bull:false},
      {o:201,c:203,h:200,l:205,bull:true},
      {o:203,c:211,h:202,l:213,bull:true},
      {o:211,c:218,h:210,l:220,bull:true},{o:218,c:224,h:217,l:226,bull:true},
      {o:224,c:221,h:225,l:220,bull:false},{o:221,c:226,h:220,l:228,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:1,offset:-18,text:'Opening Range',color:GOLD},
      {type:'label',candleIdx:3,offset:-18,text:'ORB Breakout',color:TEAL},
      {type:'hline',candleIdx:1,label:'ORB High'},
    ]
  },
  {
    id: 114, name: "ORB Short", level: "Intermediate",
    category: "ORB Pattern", signal: "Bearish Continuation",
    signalColor: RED,
    description: "Price breaks below the low of the opening range after market open. Signals sellers are in control for the session. Mirror of the ORB Long — all the same rules apply in reverse.",
    entry: "Close below the opening range low with volume",
    stop: "Above the opening range high",
    target: "Opening range height subtracted from breakdown point",
    confidence: 8.0, successRate: "62-69% with volume confirmation",
    psychology: "A breakdown below the opening range signals sellers won the early battle. The opening range represents the market's initial price discovery. Breaking below it with volume confirms bearish control for the session.",
    marketContext: "Best on gap-down opens, negative sector flow, weak market conditions. Weak on low-volume choppy days.",
    idealLocation: "After a gap-down open, at a key technical breakdown level, or when supported by negative pre-market options flow.",
    requirements: ["Clear opening range established in first 5-30 minutes", "Breakdown with volume expansion", "Broader market should be weak", "No major support directly below"],
    confirmation: ["Close below ORB low with volume expansion", "Volume 1.5x+ average on breakdown candle", "Price fails to reclaim ORB low on retest", "Market internals negative"],
    volumeProfile: "High volume on breakdown confirms institutional selling. Low-volume breakdowns fail frequently.",
    timeframe: ["1m", "5m", "15m"],
    aggressiveEntry: "Enter as breakdown candle closes below ORB low",
    conservativeEntry: "Wait for retest of ORB low from below and failure",
    riskReward: "2:1 minimum",
    bestIndicators: ["Volume", "VWAP", "Pre-market Low", "Opening Range Levels"],
    optionsPlay: "Same-day or next-day ATM puts. Short-dated for maximum leverage on intraday momentum.",
    institutionalClues: ["Bearish put flow in pre-market", "Gap down supported by weak futures", "Sector ETF also breaking down", "Dark pool distribution pre-market"],
    commonMistakes: ["Shorting on low-volume breakdown", "Ignoring market direction", "Stop too tight", "Trading on low-volatility stocks"],
    proTips: ["ORB Short + bearish flow + negative market = highest-conviction intraday short", "The TRQX ORB Sniper Pro tracks ORB levels automatically", "Don't short a stock that gaps down if the market is ripping — fade the move instead"],
    relatedPatterns: ["ORB Long", "ORB Fakeout", "ORB Reclaim", "Bear Flag"],
    example: "QQQ opens at 375, trades between 374 and 376 in first 15 minutes. Breaks below 374 at 9:50am with heavy volume — ORB short.",
    homework: "Track ORB short setups on QQQ for one week. Record all entries, stops, targets, and outcomes.",
    quiz: { question: "What confirms an ORB Short breakdown?", choices: ["Price touches ORB low", "Close below ORB low with volume expansion", "RSI below 50", "Gap down open"], answer: "Close below ORB low with volume expansion" },
    candles: [
      {o:210,c:206,h:211,l:208,bull:false},
      {o:206,c:209,h:205,l:210,bull:true},
      {o:209,c:207,h:210,l:208,bull:false},
      {o:207,c:199,h:208,l:197,bull:false},
      {o:199,c:192,h:200,l:190,bull:false},{o:192,c:185,h:193,l:183,bull:false},
      {o:185,c:188,h:184,l:189,bull:true},{o:188,c:182,h:189,l:180,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:1,offset:-18,text:'Opening Range',color:GOLD},
      {type:'label',candleIdx:3,offset:-18,text:'ORB Breakdown',color:RED},
      {type:'hline',candleIdx:1,label:'ORB Low'},
    ]
  },
  {
    id: 115, name: "ORB Fakeout", level: "Advanced",
    category: "ORB Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price breaks above the opening range high but immediately reverses back below it — trapping ORB long traders. The failed breakout leads to a sharp move in the opposite direction.",
    entry: "When price closes back below the ORB high after the fakeout",
    stop: "Above the fakeout high",
    target: "Opening range low and below",
    confidence: 8.4, successRate: "68-75% when reversal is swift",
    psychology: "ORB fakeouts are engineered to trap the most obvious trade. Retail traders see the ORB breakout and pile in long. Institutions use that liquidity to distribute and reverse — the opposite of what everyone expects.",
    marketContext: "Common on low-volume days, gap-and-trap scenarios, and when the market overall is weak despite an individual stock ORB breakout.",
    idealLocation: "ORB high that also aligns with a major resistance level — call wall, previous day high, or major technical resistance.",
    requirements: ["Price breaks above ORB high", "Reversal must happen quickly — within 1-3 candles", "Price must close back below ORB high", "Low-volume breakout is highest-risk for fakeout"],
    confirmation: ["Close back below ORB high", "Reversal candle is strong", "Volume picks up on reversal", "Market weakness confirms"],
    volumeProfile: "Low volume on the ORB breakout is the first warning sign of a fakeout. High volume on the reversal confirms the trap.",
    timeframe: ["1m", "5m", "15m"],
    aggressiveEntry: "Short as price closes back below ORB high",
    conservativeEntry: "Wait for failed retest of ORB high from below",
    riskReward: "2:1 minimum",
    bestIndicators: ["Volume", "VWAP", "Market Internals", "Opening Range Levels"],
    optionsPlay: "ATM puts on the fakeout reversal. Short-dated for intraday momentum.",
    institutionalClues: ["Low breakout volume confirming retail-only buying", "Immediate distribution at the ORB high", "Put flow appearing on the reversal"],
    commonMistakes: ["Chasing the ORB long on low volume", "Not recognizing the fakeout signal quickly", "No stop above the fakeout high if going short", "Staying long when price breaks back below ORB"],
    proTips: ["Low-volume ORB breakouts should always be viewed with suspicion", "ORB fakeout + weak market + bearish flow = highest-conviction short", "The TRQX ORB Sniper Pro grading system helps identify high vs low quality ORB setups"],
    relatedPatterns: ["ORB Long", "ORB Short", "Failed Breakout", "Fakey Pattern"],
    example: "NVDA ORB high at 500. Price breaks to 501 on low volume, immediately reverses to 499 — ORB fakeout short.",
    homework: "Track ORB fakeouts for one week. Identify the warning signs (low volume, weak market) that preceded each fakeout.",
    quiz: { question: "What is the biggest warning sign that an ORB breakout may be a fakeout?", choices: ["Price moves too fast", "Low volume on the breakout candle", "The stock is overbought", "The breakout happens late in the day"], answer: "Low volume on the breakout candle" },
    candles: [
      {o:200,c:204,h:199,l:206,bull:true},
      {o:204,c:202,h:205,l:201,bull:false},
      {o:202,c:204,h:201,l:206,bull:true},
      {o:204,c:208,h:203,l:210,bull:true},
      {o:208,c:202,h:211,l:201,bull:false},
      {o:202,c:196,h:203,l:195,bull:false},{o:196,c:190,h:197,l:189,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'ORB Break',color:TEAL},
      {type:'label',candleIdx:4,offset:-18,text:'Fakeout',color:RED},
      {type:'hline',candleIdx:1,label:'ORB High'},
    ]
  },
  {
    id: 116, name: "ORB Reclaim", level: "Intermediate",
    category: "ORB Pattern", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "After a failed ORB breakdown (price broke below the ORB low but reversed), price reclaims the opening range. Signals buyers successfully defended and the bullish thesis is intact.",
    entry: "Close back above the ORB low after the failed breakdown",
    stop: "Below the failed breakdown low",
    target: "ORB high and above",
    confidence: 7.8, successRate: "62-68% on confirmed reclaim",
    psychology: "When a breakdown fails and price reclaims the opening range, the bears who sold the breakdown are trapped short. Their forced covering provides additional fuel for the long move.",
    marketContext: "Best when the market overall is bullish despite the individual stock's early weakness. Also powerful on strong sector days.",
    idealLocation: "At the ORB low after a brief sweep below it — similar to a failed breakdown setup.",
    requirements: ["Price must have broken below ORB low", "Reclaim must happen with volume", "Market should be supportive", "ORB low should align with key support"],
    confirmation: ["Close above ORB low", "Volume expansion on reclaim", "Hold above ORB low on first retest", "Follow-through toward ORB high"],
    volumeProfile: "Volume should expand on the reclaim candle — bears covering short positions fuels the recovery.",
    timeframe: ["1m", "5m", "15m"],
    aggressiveEntry: "Enter as reclaim candle closes above ORB low",
    conservativeEntry: "Wait for retest of ORB low from above and hold",
    riskReward: "2:1 — ORB high is the natural target",
    bestIndicators: ["Volume", "VWAP", "Opening Range Levels", "Market Internals"],
    optionsPlay: "ATM calls on the reclaim. Short-dated for intraday momentum.",
    institutionalClues: ["Bullish flow appearing on the reclaim", "Bears covering driving the move", "Market internals improving simultaneously"],
    commonMistakes: ["Entering before close above ORB low", "Ignoring overall market direction", "Stop too tight", "Not having ORB high as target"],
    proTips: ["ORB reclaim is essentially a failed breakdown setup — very reliable", "The faster the reclaim, the more trapped bears there are to fuel the move", "Combine with bullish flow for conviction"],
    relatedPatterns: ["ORB Long", "ORB Fakeout", "Failed Breakdown", "VWAP Reclaim"],
    example: "AAPL ORB low at 175. Price drops to 174.50, immediately reclaims 175 on volume — ORB reclaim long with target at ORB high 177.",
    homework: "Track ORB reclaim setups for one week. Compare success rate to standard ORB long setups.",
    quiz: { question: "What does an ORB reclaim signal for trapped short sellers?", choices: ["They were correct", "They are trapped and forced to cover, fueling the move higher", "Nothing significant", "A larger breakdown is coming"], answer: "They are trapped and forced to cover, fueling the move higher" },
    candles: [
      {o:205,c:202,h:206,l:201,bull:false},
      {o:202,c:200,h:203,l:199,bull:false},
      {o:200,c:197,h:201,l:196,bull:false},
      {o:197,c:203,h:196,l:205,bull:true},
      {o:203,c:209,h:202,l:211,bull:true},{o:209,c:215,h:208,l:217,bull:true},
      {o:215,c:212,h:216,l:211,bull:false},{o:212,c:217,h:211,l:219,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:2,offset:-22,text:'ORB Break',color:RED},
      {type:'label',candleIdx:3,offset:-18,text:'Reclaim',color:TEAL},
      {type:'hline',candleIdx:0,label:'ORB Low'},
    ]
  },
  {
    id: 117, name: "ORB Continuation", level: "Intermediate",
    category: "ORB Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "After an ORB breakout, price pulls back to the breakout level and consolidates before continuing in the breakout direction. The pullback is the optimal entry for traders who missed the initial break.",
    entry: "On the pullback to the ORB breakout level with holding confirmation",
    stop: "Below the ORB high (now support)",
    target: "Measured move from the initial breakout",
    confidence: 7.6, successRate: "60-67% on continuation entries",
    psychology: "After the initial ORB breakout, latecomers who want in pull price back to the breakout level. Early buyers hold their positions. The pullback is a gift — a second chance to enter at a better price.",
    marketContext: "Best in strong trending markets where the initial ORB breakout had good volume and momentum. Weak in choppy conditions.",
    idealLocation: "The ORB high (now acting as support on the pullback). Best when the pullback is orderly and on declining volume.",
    requirements: ["Successful initial ORB breakout occurred", "Pullback to ORB high is orderly (not aggressive)", "Volume declining on pullback", "Broader trend supports"],
    confirmation: ["Bullish candle forming at ORB high support", "Volume picking back up on continuation", "Price holds above ORB high", "Market internals supportive"],
    volumeProfile: "Low volume on the pullback is ideal — weak sellers. High volume on the continuation candle confirms strong buyers.",
    timeframe: ["5m", "15m"],
    aggressiveEntry: "Enter as price touches ORB high on pullback",
    conservativeEntry: "Wait for bullish candle confirmation at ORB high",
    riskReward: "2:1 — measured move from initial breakout is target",
    bestIndicators: ["Volume", "Opening Range Levels", "VWAP", "Momentum"],
    optionsPlay: "ATM calls — continuation is a momentum play. Same-day or next-day expiration.",
    institutionalClues: ["Light pullback volume confirming institutional holds", "Continued call flow during the consolidation", "No opposing put flow of significance"],
    commonMistakes: ["Entering on aggressive high-volume pullback (may be reversal)", "Missing the continuation by waiting too long", "No stop below ORB high", "Ignoring market conditions"],
    proTips: ["The best ORB continuation pullbacks look scary but are low-volume", "First consolidation after ORB breakout is the highest-probability entry", "Use the TRQX ORB Sniper Pro to track ORB levels throughout the day"],
    relatedPatterns: ["ORB Long", "Break and Retest", "Bull Flag", "VWAP Reclaim"],
    example: "SPY breaks ORB high at 446 at 9:45am. Pulls back to 446 at 10:15am on low volume, then continues to 449 — ORB continuation long.",
    homework: "Track ORB continuation setups for one week. Compare profitability to initial ORB long entries.",
    quiz: { question: "What is ideal volume behavior during an ORB continuation pullback?", choices: ["Volume should surge on the pullback", "Volume should decline on the pullback showing weak sellers", "Volume should be equal to the breakout", "Volume does not matter"], answer: "Volume should decline on the pullback showing weak sellers" },
    candles: [
      {o:200,c:208,h:199,l:210,bull:true},
      {o:208,c:214,h:207,l:216,bull:true},
      {o:214,c:210,h:215,l:209,bull:false},
      {o:210,c:208,h:211,l:207,bull:false},
      {o:208,c:211,h:207,l:213,bull:true},
      {o:211,c:218,h:210,l:220,bull:true},{o:218,c:224,h:217,l:226,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:1,offset:-18,text:'ORB Break',color:TEAL},
      {type:'label',candleIdx:3,offset:-22,text:'Pullback',color:GOLD},
      {type:'label',candleIdx:4,offset:-18,text:'Continue',color:TEAL},
      {type:'hline',candleIdx:0,label:'ORB High'},
    ]
  },
  {
    id: 118, name: "ORB + Flow Confirmation", level: "Advanced",
    category: "ORB Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "The highest-conviction TRQX setup: an ORB breakout confirmed by simultaneous bullish options flow (sweep or unusual activity). When chart and flow align at the opening range, the probability of success increases dramatically.",
    entry: "On ORB breakout with simultaneous bullish flow confirmation",
    stop: "Below the opening range low",
    target: "2x the ORB measured move — flow confirmation warrants larger targets",
    confidence: 9.2, successRate: "74-82% when all criteria align",
    psychology: "When institutional options flow aligns with a technical ORB breakout, it means both the chart and smart money are pointing in the same direction. This is the convergence of technical and fundamental institutional conviction.",
    marketContext: "Works in all market conditions — if flow and chart are both screaming bullish, the setup has edge regardless of macro. Best in positive market environments.",
    idealLocation: "ORB breakout level with simultaneous call sweep or unusual flow in the TRQX Flow Scanner on the same ticker.",
    requirements: ["Clean ORB breakout above the opening range high", "Simultaneous call sweep or unusual call flow in Flow Scanner", "Volume expansion on breakout", "No major resistance directly overhead"],
    confirmation: ["ORB breakout confirmed on chart", "Flow Scanner shows bullish sweep on same ticker within same candle", "Volume 2x+ average", "Market internals supportive"],
    volumeProfile: "Combined volume from both the stock breakout and the options flow creates exceptional conviction. This is rare — when it happens, it's the best setup on the platform.",
    timeframe: ["1m", "5m", "15m"],
    aggressiveEntry: "Enter immediately on convergence of ORB break + flow",
    conservativeEntry: "Enter on first pullback to ORB high after the combined signal",
    riskReward: "3:1 or better — highest conviction setup warrants larger targets",
    bestIndicators: ["TRQX Flow Scanner", "Opening Range Levels", "Volume", "VWAP"],
    optionsPlay: "ATM or slightly OTM calls — size up slightly given the higher conviction. Same-day to 2-day expiration for maximum leverage.",
    institutionalClues: ["Call sweep AND stock breakout happening simultaneously", "Dark pool prints at the ORB level", "Multiple flow signals on same ticker in same direction"],
    commonMistakes: ["Waiting so long to confirm that the entry is chasing", "Not having the Flow Scanner open at market open", "Over-sizing on this setup thinking it's guaranteed", "Ignoring the stop loss"],
    proTips: ["This is the TRQX signature setup — use the Flow Scanner and chart together every morning", "Pre-market flow on a ticker sets the stage for ORB + Flow setups at the open", "When you get this setup, it warrants slightly larger size — but never more than 5% of account"],
    relatedPatterns: ["ORB Long", "Bullish Sweep Confirmation", "Unusual Flow Expansion", "VWAP Reclaim"],
    example: "NVDA opens, ORB high at 500. At 9:47am, price breaks 500 on heavy volume SIMULTANEOUSLY with a $1.5M call sweep in the Flow Scanner — ORB + Flow confirmation long.",
    homework: "Every morning for one week, have both the TRQX Flow Scanner and charts open at 9:30am. Look for any ticker where ORB breakout and call flow align simultaneously.",
    quiz: { question: "What makes ORB + Flow Confirmation the highest-conviction TRQX setup?", choices: ["The ORB alone is enough", "Options flow alone is enough", "The convergence of technical ORB breakout and institutional options flow in the same direction simultaneously", "It works 100% of the time"], answer: "The convergence of technical ORB breakout and institutional options flow in the same direction simultaneously" },
    candles: [
      {o:198,c:202,h:197,l:204,bull:true},
      {o:202,c:200,h:203,l:199,bull:false},
      {o:200,c:202,h:199,l:204,bull:true},
      {o:202,c:212,h:201,l:214,bull:true},
      {o:212,c:222,h:211,l:224,bull:true},{o:222,c:232,h:221,l:234,bull:true},
      {o:232,c:228,h:233,l:227,bull:false},{o:228,c:236,h:227,l:238,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:1,offset:-18,text:'Opening Range',color:GOLD},
      {type:'label',candleIdx:3,offset:-18,text:'ORB + FLOW',color:TEAL},
      {type:'bracket',start:3,end:5,label:'Highest Conviction'},
    ]
  },

  // ── Advanced Institutional Patterns ──
  {
    id: 119, name: "Volatility Expansion", level: "Advanced",
    category: "Institutional", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "After a period of compressed volatility, price breaks out with dramatically increased range and volume — volatility expansion. Signals the start of a new directional move. Position in the expansion direction.",
    entry: "On the expansion candle or first retest",
    stop: "Below the compression low",
    target: "Measured move equal to the compression period height",
    confidence: 8.2, successRate: "64-71% with directional confirmation",
    psychology: "Compressed volatility is energy being stored. The longer the compression, the bigger the eventual expansion. When institutions have completed their accumulation or distribution, they release the coil — creating explosive moves.",
    marketContext: "Best after extended periods of low VIX and tight price ranges. The compression itself is the setup — the expansion is the trade.",
    idealLocation: "After a tight consolidation (NR7, inside bar series, bollinger band squeeze) at a key technical level.",
    requirements: ["Extended period of compression (5+ days of tight range)", "Expansion candle must be significantly larger than recent average", "Volume must surge on expansion", "Direction confirmed by market structure"],
    confirmation: ["Large expansion candle with high volume", "Price holds in expansion direction", "VIX reaction supports direction", "Broader market confirms"],
    volumeProfile: "Volume must surge dramatically on the expansion candle — 2-3x average minimum. Without volume, expansion is weak and likely to fail.",
    timeframe: ["1H", "4H", "Daily"],
    aggressiveEntry: "Enter on the expansion candle",
    conservativeEntry: "Wait for first retest of breakout level after expansion",
    riskReward: "3:1 or better — expansions often run further than expected",
    bestIndicators: ["Bollinger Bands", "ATR", "Volume", "VIX"],
    optionsPlay: "Buy straddles before the expansion if direction unknown. Once direction is clear, buy directional calls or puts.",
    institutionalClues: ["Volume surge on expansion", "Options flow surging simultaneously", "VIX move confirming regime change"],
    commonMistakes: ["Trading the expansion direction without volume", "Missing the setup by entering too late", "No stop at compression low", "Not preparing before the expansion occurs"],
    proTips: ["Bollinger Band squeeze + NR7 + inside bar = highest probability expansion setup", "The TRQX Flow Scanner often shows unusual flow before volatility expansion", "Weekly chart compressions lead to the biggest monthly expansions"],
    relatedPatterns: ["Volatility Compression", "Squeeze Breakout", "Short Gamma Expansion", "Range Expansion"],
    example: "SPY trades in a 2-point range for 5 days. On day 6, a 6-point bullish expansion candle forms on 3x volume — volatility expansion long.",
    homework: "Find 5 volatility expansion setups on daily charts. Mark the compression period, the expansion candle, and track the full move.",
    quiz: { question: "What is required to confirm a volatility expansion is real?", choices: ["Just a large candle", "A large candle with significantly above-average volume", "High VIX reading", "Multiple day move"], answer: "A large candle with significantly above-average volume" },
    candles: [
      {o:202,c:204,h:201,l:205,bull:true},{o:204,c:202,h:205,l:203,bull:false},
      {o:202,c:203,h:201,l:204,bull:true},{o:203,c:202,h:204,l:201,bull:false},
      {o:202,c:203,h:201,l:204,bull:true},{o:203,c:202,h:204,l:203,bull:false},
      {o:202,c:216,h:201,l:218,bull:true},
      {o:216,c:224,h:215,l:226,bull:true},{o:224,c:232,h:223,l:234,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Compression',color:GOLD},
      {type:'label',candleIdx:6,offset:-18,text:'Expansion',color:TEAL},
    ]
  },
  {
    id: 120, name: "Volatility Compression", level: "Intermediate",
    category: "Institutional", signal: "Indecision",
    signalColor: GOLD,
    description: "A period of progressively tightening price range and declining volume. The market is coiling — both buyers and sellers are waiting. This IS the setup. Position for the eventual expansion.",
    entry: "Wait for the expansion breakout — do not trade the compression itself",
    stop: "Below the compression low (if bullish) or above compression high (if bearish) after breakout",
    target: "Based on the expansion breakout direction",
    confidence: 7.5, successRate: "Setup only — trade the expansion, not the compression",
    psychology: "Compression represents a standoff between buyers and sellers. Neither has the conviction to push significantly. This equilibrium will break — and when it does, the move is powerful. Patience is the skill here.",
    marketContext: "Can occur in any market condition. The compression itself doesn't predict direction — only that a big move is coming.",
    idealLocation: "Any timeframe — but daily and weekly compressions lead to the most significant expansions.",
    requirements: ["Progressive range tightening over 5+ candles", "Declining volume during compression", "No clear directional bias yet", "Watch for the breakout candle"],
    confirmation: ["Expansion candle breaks the compression range", "Volume surges on breakout", "Direction aligned with broader trend"],
    volumeProfile: "Volume must be declining throughout the compression. Rising volume during compression often signals accumulation or distribution and can give early directional clues.",
    timeframe: ["1H", "4H", "Daily", "Weekly"],
    aggressiveEntry: "Enter on the first expansion candle",
    conservativeEntry: "Wait for first retest after expansion",
    riskReward: "3:1 or better on the resulting expansion",
    bestIndicators: ["Bollinger Bands", "ATR", "Volume", "NR7"],
    optionsPlay: "Buy straddles or strangles during the compression when IV is low. Once direction breaks, sell the losing side and ride the winner.",
    institutionalClues: ["Very low volume confirming institutional patience", "Options IV at multi-month lows", "Flow scanner quiet on the ticker"],
    commonMistakes: ["Trying to predict direction during compression", "Trading inside the compression range", "Missing the expansion entry by waiting too long", "Not having the breakout level pre-marked"],
    proTips: ["Mark the compression high and low before market open so you're ready for the expansion", "The longer and tighter the compression, the bigger the expansion", "Weekly compressions on sector ETFs often signal major sector moves"],
    relatedPatterns: ["Volatility Expansion", "Range Contraction", "Squeeze Breakout", "NR7"],
    example: "QQQ trades in a progressively tightening range for 8 days — each day's range smaller than the last. A big expansion is coming.",
    homework: "Identify 5 compression periods on daily charts before they expand. Track the eventual expansion direction and magnitude.",
    quiz: { question: "What should you do during a volatility compression period?", choices: ["Trade actively in both directions", "Wait and prepare for the eventual expansion breakout", "Buy options at peak IV", "Short the compression"], answer: "Wait and prepare for the eventual expansion breakout" },
    candles: [
      {o:205,c:210,h:204,l:212,bull:true},{o:210,c:205,h:211,l:207,bull:false},
      {o:205,c:208,h:204,l:210,bull:true},{o:208,c:205,h:209,l:206,bull:false},
      {o:205,c:207,h:204,l:208,bull:true},{o:207,c:205,h:208,l:206,bull:false},
      {o:205,c:206,h:204,l:207,bull:true},{o:206,c:205,h:207,l:204,bull:false},
      {o:205,c:206,h:204,l:207,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:1,offset:-18,text:'Compression',color:GOLD},
      {type:'label',candleIdx:5,offset:-18,text:'Tightening',color:GOLD},
      {type:'label',candleIdx:8,offset:-18,text:'Coiling',color:GOLD},
    ]
  },
  {
    id: 121, name: "Squeeze Breakout", level: "Advanced",
    category: "Institutional", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A specific compression pattern where Bollinger Bands narrow inside Keltner Channels — the momentum squeeze. When the squeeze fires (bands expand outside Keltner), it signals an explosive directional move.",
    entry: "On the first expansion candle after the squeeze fires in the breakout direction",
    stop: "Below the squeeze low (bullish) or above squeeze high (bearish)",
    target: "Measured move equal to 1.5-2x the squeeze range",
    confidence: 8.4, successRate: "66-73% when direction aligns with trend",
    psychology: "The squeeze measures the relationship between Bollinger Bands (volatility) and Keltner Channels (average true range). When BB goes inside KC, volatility is at an extreme low. The compression cannot last — the breakout is mechanical.",
    marketContext: "Works in all market conditions — the squeeze is a pure volatility setup. Direction is determined by broader context.",
    idealLocation: "Any timeframe, but daily and weekly squeezes on liquid instruments (SPY, QQQ, major stocks) produce the most reliable breakouts.",
    requirements: ["Bollinger Bands must be inside Keltner Channels", "Squeeze must be active for at least 3-5 bars", "Direction confirmed by momentum histogram", "Volume increases as squeeze fires"],
    confirmation: ["Squeeze fires (BB expands outside KC)", "Momentum histogram turns positive (bullish) or negative (bearish)", "Volume expansion on breakout candle", "Price holds in breakout direction"],
    volumeProfile: "Volume should expand significantly as the squeeze fires. The longer the squeeze lasted, the larger the volume expansion on the breakout.",
    timeframe: ["15m", "1H", "4H", "Daily"],
    aggressiveEntry: "Enter on squeeze fire candle",
    conservativeEntry: "Wait for first pullback after squeeze fire",
    riskReward: "3:1 — squeeze breakouts often run 1.5-2x the compression range",
    bestIndicators: ["TTM Squeeze (Bollinger Bands + Keltner Channels)", "Volume", "Momentum Histogram", "Trend Direction"],
    optionsPlay: "ATM calls or puts depending on direction. 2-4 weeks to expiration for room to run.",
    institutionalClues: ["Volume surge on squeeze fire", "Options flow appearing as squeeze fires", "Multiple timeframe squeezes firing simultaneously"],
    commonMistakes: ["Trading the squeeze before it fires", "Ignoring direction of momentum histogram", "No stop below the squeeze low", "Chasing after the squeeze has already run 20%"],
    proTips: ["Multiple timeframe squeezes firing at the same time = extremely high conviction", "Weekly squeeze fires lead to monthly moves", "The TRQX GEMX dashboard shows when market-wide squeezes are setting up"],
    relatedPatterns: ["Volatility Compression", "Volatility Expansion", "Range Contraction", "Short Gamma Expansion"],
    example: "TSLA daily squeeze fires to the upside after 8 bars of compression with momentum histogram turning green — squeeze breakout long.",
    homework: "Apply TTM Squeeze indicator to SPY daily chart. Identify the last 5 squeeze fires and track the subsequent moves.",
    quiz: { question: "What does a squeeze fire signal?", choices: ["The end of a trend", "Bollinger Bands expanding outside Keltner Channels indicating an explosive move is beginning", "Market reversal", "Low volatility continuing"], answer: "Bollinger Bands expanding outside Keltner Channels indicating an explosive move is beginning" },
    candles: [
      {o:203,c:205,h:202,l:206,bull:true},{o:205,c:203,h:206,l:204,bull:false},
      {o:203,c:204,h:202,l:205,bull:true},{o:204,c:203,h:205,l:202,bull:false},
      {o:203,c:204,h:202,l:205,bull:true},{o:204,c:203,h:205,l:204,bull:false},
      {o:203,c:213,h:202,l:215,bull:true},
      {o:213,c:222,h:212,l:224,bull:true},{o:222,c:231,h:221,l:233,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Squeeze Active',color:GOLD},
      {type:'label',candleIdx:6,offset:-18,text:'Squeeze Fires',color:TEAL},
    ]
  },
  {
    id: 122, name: "VIX Divergence", level: "Advanced",
    category: "Institutional", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Stock market makes a new high while VIX also rises (or fails to decline). This divergence signals fear is building beneath the surface even as prices appear strong. Often precedes a sharp pullback.",
    entry: "Short the market when VIX divergence confirms with a bearish price candle",
    stop: "Above the most recent high",
    target: "Previous support or 3-5% correction",
    confidence: 8.0, successRate: "63-70% on confirmed divergence",
    psychology: "When prices rise but VIX rises too, it means institutional players are buying insurance (puts) while retail chases the rally. This is a classic divergence — the smart money is hedging the rally, not joining it.",
    marketContext: "Best during late-stage rallies, extended uptrends, or when fundamentals don't support the move. VIX rising above 20 with new market highs is a major warning.",
    idealLocation: "When S&P 500 or QQQ makes a new high but VIX simultaneously rises or fails to make new lows.",
    requirements: ["Market must make a new high or multi-week high", "VIX must rise or fail to decline simultaneously", "Divergence must persist for at least 2-3 trading days", "Confirm with other bearish signals"],
    confirmation: ["Bearish price candle on the index after divergence identified", "VIX continues rising", "Put flow increasing", "Credit spreads widening"],
    volumeProfile: "Watch for declining volume on the new market highs (distribution). Combined with rising VIX, this is a powerful warning signal.",
    timeframe: ["Daily", "Weekly"],
    aggressiveEntry: "Short on confirmation of VIX divergence with bearish price action",
    conservativeEntry: "Wait for market to break a key support level and short the retest",
    riskReward: "2:1 minimum — corrections can be sharp",
    bestIndicators: ["VIX", "SPY/QQQ Price Action", "Put/Call Ratio", "Credit Spreads"],
    optionsPlay: "SPY or QQQ puts with 2-4 weeks to expiration. Size appropriately — macro plays require patience.",
    institutionalClues: ["Institutional put buying at market highs", "Credit default swap spreads widening", "Smart money reducing exposure at new highs"],
    commonMistakes: ["Acting on VIX divergence too early", "Shorting a strong trend without other confirmation", "Ignoring the possibility VIX normalizes (divergence resolves bullishly)", "No stop above recent high"],
    proTips: ["VIX divergence is a warning — not an immediate short signal. Wait for price confirmation.", "The TRQX AI Market Terminal monitors VIX alongside flow for combined signals", "Weekly VIX divergence is more significant than daily"],
    relatedPatterns: ["RSI Divergence Bearish", "Volume Divergence", "Distribution", "Bearish Sweep Confirmation"],
    example: "S&P 500 makes new all-time high at 4800. Simultaneously, VIX rises from 14 to 17 — VIX divergence warning, begin hedging.",
    homework: "Research the last 5 major market corrections. Check if VIX divergence appeared in the 1-2 weeks before each correction.",
    quiz: { question: "What does VIX rising while the market makes new highs signal?", choices: ["Healthy bull market", "Fear building beneath the surface — smart money hedging the rally", "Low volatility ahead", "Breakout incoming"], answer: "Fear building beneath the surface — smart money hedging the rally" },
    candles: [
      {o:200,c:205,h:199,l:207,bull:true},{o:205,c:210,h:204,l:212,bull:true},
      {o:210,c:215,h:209,l:217,bull:true},{o:215,c:220,h:214,l:222,bull:true},
      {o:220,c:225,h:219,l:227,bull:true},
      {o:225,c:218,h:227,l:217,bull:false},
      {o:218,c:210,h:219,l:209,bull:false},{o:210,c:202,h:211,l:201,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'New High',color:TEAL},
      {type:'label',candleIdx:4,offset:-30,text:'VIX Rising',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Reversal',color:RED},
    ]
  },
  {
    id: 123, name: "Breadth Divergence", level: "Advanced",
    category: "Institutional", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Market index makes a new high but market breadth (advance-decline line, number of new highs) is declining. Signals the rally is narrowing — only a few stocks carrying the index. A weak foundation.",
    entry: "Short when index breaks a key support level after breadth divergence confirmed",
    stop: "Above the most recent index high",
    target: "Prior support or 3-5% correction on the index",
    confidence: 7.8, successRate: "60-68% with price confirmation",
    psychology: "When the market rises on the back of fewer and fewer stocks, the rally is becoming fragile. Institutional investors see this deterioration in participation and begin reducing risk. The index can be propped up by mega-cap stocks even while the majority are already declining.",
    marketContext: "Best in extended bull markets when concentration in mega-cap tech is high. Watch for SPY making new highs while equal-weight SPX (RSP) is not.",
    idealLocation: "When SPY/QQQ makes new highs but the advance-decline line, new highs list, or RSP fails to confirm.",
    requirements: ["Market index must make new high", "Advance-decline line or equal-weight index must diverge", "Divergence must persist for 1-2+ weeks", "Confirm with other bearish signals"],
    confirmation: ["Index breaks below key support after divergence", "Advance-decline line turns negative", "More stocks hitting new lows than new highs", "Sector rotation to defensive names"],
    volumeProfile: "Volume on up days declining vs down days increasing — institutional distribution under the surface of a rising index.",
    timeframe: ["Daily", "Weekly"],
    aggressiveEntry: "Short on index breakdown after divergence period",
    conservativeEntry: "Wait for clear trend change and short the first lower high",
    riskReward: "2:1 minimum",
    bestIndicators: ["Advance-Decline Line", "RSP vs SPY", "New Highs vs New Lows", "Sector Rotation"],
    optionsPlay: "SPY or QQQ puts with 3-6 weeks to expiration. This is a macro setup — give it time.",
    institutionalClues: ["Mega-cap concentration rising", "Equal-weight underperformance", "Defensive sector outperformance", "Credit spreads widening"],
    commonMistakes: ["Acting too early before price confirms", "Shorting mega-caps that are driving the index", "Ignoring the possibility divergence resolves", "No stop above recent highs"],
    proTips: ["RSP (equal-weight S&P 500) is the best breadth divergence tool — when it underperforms SPY, caution is warranted", "Breadth divergence can persist for weeks before resolving — patience required", "Combine with VIX divergence for highest conviction"],
    relatedPatterns: ["VIX Divergence", "Distribution", "Volume Divergence", "Market Regime Shift"],
    example: "SPY makes new all-time high. RSP (equal weight) is 5% below its high. Advance-decline line declining for 3 weeks — breadth divergence warning.",
    homework: "Compare SPY vs RSP performance weekly for one month. Track when divergences appear and what happens next.",
    quiz: { question: "What does a breadth divergence signal about a market rally?", choices: ["Strong broad participation", "The rally is narrowing — carried by fewer stocks, creating a fragile foundation", "Healthy rotation", "Institutional accumulation"], answer: "The rally is narrowing — carried by fewer stocks, creating a fragile foundation" },
    candles: [
      {o:198,c:203,h:197,l:205,bull:true},{o:203,c:208,h:202,l:210,bull:true},
      {o:208,c:213,h:207,l:215,bull:true},{o:213,c:218,h:212,l:220,bull:true},
      {o:218,c:222,h:217,l:224,bull:true},
      {o:222,c:216,h:224,l:215,bull:false},
      {o:216,c:209,h:217,l:208,bull:false},{o:209,c:202,h:210,l:201,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:4,offset:-18,text:'Index High',color:TEAL},
      {type:'label',candleIdx:4,offset:-30,text:'Breadth Weak',color:RED},
      {type:'label',candleIdx:5,offset:-18,text:'Reversal',color:RED},
    ]
  },
  {
    id: 124, name: "Dealer Hedge Unwind", level: "Advanced",
    category: "Institutional", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "As options expire, market makers unwind their hedges — selling calls (buying stock) or buying back puts (buying stock) — which creates mechanical buying pressure. Knowing when dealers unwind helps predict direction.",
    entry: "In the direction of the unwind as expiration approaches",
    stop: "Key technical support or resistance level",
    target: "Max pain strike or next gamma level",
    confidence: 7.8, successRate: "60-68% near expiration",
    psychology: "Market makers are forced buyers and sellers based on their hedge positions. As options expire worthless, they unwind those hedges — creating predictable, mechanical price pressure that has nothing to do with fundamental value.",
    marketContext: "Most powerful in the final 2-3 days before major expiration (monthly OpEx). Less reliable on weekly expiration due to lower open interest.",
    idealLocation: "Near major strike prices with heavy open interest. Use GEMX to identify where the largest hedge unwinds will occur.",
    requirements: ["Must be within 3 days of expiration", "Identify large open interest positions expiring", "Determine unwind direction (calls expiring = dealer selling hedge)", "Check GEMX for context"],
    confirmation: ["Price moves in unwind direction as expiration approaches", "Volume patterns support the move", "VIX stable or declining", "Price gravitating toward max pain"],
    volumeProfile: "Hedge unwind often creates unusual volume patterns — price moves that seem disconnected from news. This is the mechanical nature of the unwind.",
    timeframe: ["15m", "1H", "Daily"],
    aggressiveEntry: "Trade in unwind direction starting Thursday of OpEx week",
    conservativeEntry: "Wait for price to begin moving in unwind direction organically",
    riskReward: "1.5:1 — unwinds are predictable but limited in magnitude",
    bestIndicators: ["GEMX Gamma Dashboard", "Open Interest", "Time to Expiration", "Max Pain"],
    optionsPlay: "Avoid buying options near expiration — theta decay kills the trade. Use the underlying or very short-dated spreads.",
    institutionalClues: ["Large open interest positions expiring", "Predictable directional pressure near key strikes", "Volume without fundamental catalyst"],
    commonMistakes: ["Confusing unwind with directional institutional trade", "Applying this to weekly options (lower OI = weaker effect)", "Ignoring GEMX context", "Trading too far from expiration"],
    proTips: ["Monthly OpEx dealer unwinds are the most powerful", "The TRQX GEMX dashboard makes dealer positioning visible — use it daily", "Unwinds create predictable but temporary price movements — have an exit plan"],
    relatedPatterns: ["Max Pain Magnet", "Call Wall Rejection", "Put Wall Bounce", "Gamma Flip Reclaim"],
    example: "SPY has 50,000 call contracts at 445 expiring Friday. As they expire worthless, dealers sell their stock hedge — mechanical selling creates resistance at 445.",
    homework: "Before each monthly OpEx for one month, identify the largest open interest positions using GEMX. Track how price behaves as they expire.",
    quiz: { question: "What happens to dealer stock positions when call options expire worthless?", choices: ["They buy more stock", "They sell the stock they bought as a hedge — creating selling pressure", "Nothing changes", "They buy more calls"], answer: "They sell the stock they bought as a hedge — creating selling pressure" },
    candles: [
      {o:210,c:208,h:211,l:207,bull:false},{o:208,c:210,h:207,l:211,bull:true},
      {o:210,c:208,h:211,l:207,bull:false},{o:208,c:209,h:207,l:210,bull:true},
      {o:209,c:212,h:208,l:213,bull:true},
      {o:212,c:215,h:211,l:216,bull:true},{o:215,c:218,h:214,l:219,bull:true},
      {o:218,c:214,h:219,l:213,bull:false},{o:214,c:216,h:213,l:217,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:3,offset:-18,text:'Pre-Unwind',color:GOLD},
      {type:'label',candleIdx:4,offset:-18,text:'Unwind Begins',color:TEAL},
      {type:'hline',candleIdx:6,label:'Unwind Target'},
    ]
  },
  {
    id: 125, name: "Market Regime Shift", level: "Advanced",
    category: "Institutional", signal: "Bearish Reversal",
    signalColor: RED,
    description: "A fundamental change in market character — from risk-on to risk-off (or vice versa). Identified by multiple confirming signals across market breadth, VIX, sector rotation, and flow. The most important macro signal to recognize.",
    entry: "Reduce long exposure and shift to defensive positioning when regime shift confirms",
    stop: "If regime signals reverse within 1 week",
    target: "Sustained defensive positioning until regime re-establishes",
    confidence: 8.8, successRate: "72-80% once fully confirmed",
    psychology: "Market regimes define everything — position size, strategy type, and risk tolerance. In a risk-on regime, buy dips and hold. In a risk-off regime, reduce exposure, buy hedges, and wait. Recognizing regime shifts early is the most valuable skill in trading.",
    marketContext: "A regime shift is the macro context for all other patterns. When regime shifts from risk-on to risk-off, bearish patterns become more reliable and bullish patterns less reliable.",
    idealLocation: "At major market turning points — post-earnings season tops, Fed policy pivots, macro deterioration, or technical breakdowns of major index support.",
    requirements: ["VIX trend changes from declining to rising", "Market breadth deteriorates (advance-decline line turning)", "Sector rotation to defensive sectors (utilities, staples)", "Flow data turns to net puts on index ETFs", "Key technical support breaks on major index"],
    confirmation: ["Multiple regime signals align simultaneously", "Flow Scanner showing consistent put flow on SPY/QQQ", "GEMX shows consistent negative gamma environment", "VIX remains elevated for 2+ weeks", "Lower highs and lower lows forming on index"],
    volumeProfile: "Regime shifts often feature heavy distribution volume — high volume on down days, low volume on up days. Institutions are exiting systematically.",
    timeframe: ["Daily", "Weekly"],
    aggressiveEntry: "Begin reducing risk as first regime signals appear",
    conservativeEntry: "Wait for full confirmation across all signals before major repositioning",
    riskReward: "This is a risk management tool more than a specific trade setup",
    bestIndicators: ["VIX", "GEMX Gamma Dashboard", "TRQX Flow Scanner", "Advance-Decline Line", "Sector Rotation"],
    optionsPlay: "SPY/QQQ puts as macro hedges. Consider collar strategies on long positions. Reduce overall options exposure (theta decay hurts in high-VIX environments).",
    institutionalClues: ["Net put flow on index ETFs", "Credit spreads widening", "Dollar strengthening", "Defensive sectors outperforming", "Earnings guidance disappointing broadly"],
    commonMistakes: ["Calling a regime shift too early on one day of selling", "Ignoring GEMX and flow data", "Not reducing position size in a risk-off regime", "Continuing to use risk-on strategies in a risk-off environment"],
    proTips: ["The TRQX Market Intelligence AI Brief identifies regime signals daily", "Check GEMX every morning — the gamma environment tells you the current regime", "Regime shifts are slow to develop but devastating if ignored — act early rather than late"],
    relatedPatterns: ["VIX Divergence", "Breadth Divergence", "Short Gamma Expansion", "Distribution"],
    example: "VIX spikes from 14 to 22 over 5 days. Put flow dominates the TRQX Flow Scanner. GEMX shows consistent negative gamma. Advance-decline line breaks 52-week low — confirmed risk-off regime shift.",
    homework: "Review the TRQX Market Intelligence AI Brief daily for one month. Track when the regime assessment changes and what happens next.",
    quiz: { question: "What is the most important action when a market regime shift to risk-off is confirmed?", choices: ["Buy the dip aggressively", "Reduce risk exposure, shift to defensive positioning, and wait for re-entry", "Ignore it and hold positions", "Buy VIX calls only"], answer: "Reduce risk exposure, shift to defensive positioning, and wait for re-entry" },
    candles: [
      {o:220,c:215,h:221,l:214,bull:false},{o:215,c:218,h:214,l:219,bull:true},
      {o:218,c:212,h:219,l:211,bull:false},{o:212,c:215,h:211,l:216,bull:true},
      {o:215,c:208,h:216,l:207,bull:false},
      {o:208,c:200,h:209,l:199,bull:false},{o:200,c:203,h:199,l:204,bull:true},
      {o:203,c:195,h:204,l:194,bull:false},{o:195,c:188,h:196,l:187,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:0,offset:-18,text:'Risk-On',color:TEAL},
      {type:'label',candleIdx:4,offset:-18,text:'Regime Shift',color:RED},
      {type:'label',candleIdx:7,offset:-18,text:'Risk-Off',color:RED},
      {type:'bracket',start:4,end:8,label:'Risk-Off Regime'},
    ]
  },
];

const ALL_PATTERNS = [...PATTERNS, ...BATCH2, ...BATCH3].map(enhancePattern);

const CATEGORIES = ['All', 'Single Candle', 'Multi Candle', 'Chart Pattern', 'Market Structure', 'Support & Resistance', 'Price Action', 'Gap Pattern', 'Volume Pattern', 'Momentum', 'Options Flow', 'Gamma Pattern', 'Smart Money', 'ORB Pattern', 'Institutional'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const SIGNALS = ['All', 'Bullish Reversal', 'Bearish Reversal', 'Bullish Continuation', 'Bearish Continuation', 'Indecision'];

// ─────────────────────────────────────────────
// CANDLE ANIMATION ENGINE
// ─────────────────────────────────────────────
function CandleChart({ pattern, playing, quizMode = false, onComplete, width = 680, height = 340 }) {
  const svgRef = useRef(null);
  const animRef = useRef(null);
  const stepRef = useRef(0);

  const W = width;
  const H = height;
  const candles = pattern.candles || [];
  const allPrices = candles.flatMap(c => [c.h, c.l, c.o, c.c]);
  const rawMin = Math.min(...allPrices);
  const rawMax = Math.max(...allPrices);
  const priceRange = rawMax - rawMin || 20;
  const pad = priceRange * 0.12;
  const minP = rawMin - pad;
  const maxP = rawMax + pad;

// Normalize all candle prices to fill the chart dramatically
  const normalize = (p) => rawMin + ((p - rawMin) / priceRange) * priceRange;
  const PAD_L = 46;
  const PAD_R = 36;
  const PAD_T = 36;
  const PAD_B = 42;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const spacing = chartW / Math.max(candles.length, 1);
  const candleW = Math.max(18, Math.min(48, spacing * 0.65));

  function mkEl(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) el.setAttribute(key, String(value));
    });
    return el;
  }

  function yS(price) {
    return PAD_T + ((maxP - price) / (maxP - minP)) * chartH;
  }

  function xC(i) {
    return PAD_L + i * spacing + spacing / 2;
  }

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    if (!playing) return;

    stepRef.current = 0;
    svg.innerHTML = '';
    if (animRef.current) clearTimeout(animRef.current);

    // Layer groups — order matters for z-index.
    const defs = mkEl('defs', {});
    const gridG = mkEl('g', {});
    const zoneG = mkEl('g', {});
    const candleG = mkEl('g', {});
    const lineG = mkEl('g', {});
    const labelG = mkEl('g', {});

    const bullGradient = mkEl('linearGradient', {
      id: 'bullGradient',
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '100%'
    });
    bullGradient.appendChild(mkEl('stop', { offset: '0%', stopColor: '#9fffee' }));
    bullGradient.appendChild(mkEl('stop', { offset: '45%', stopColor: TEAL }));
    bullGradient.appendChild(mkEl('stop', { offset: '100%', stopColor: '#0b5f55' }));

    const bearGradient = mkEl('linearGradient', {
      id: 'bearGradient',
      x1: '0%',
      y1: '0%',
      x2: '100%',
      y2: '100%'
    });
    bearGradient.appendChild(mkEl('stop', { offset: '0%', stopColor: '#ffb3b3' }));
    bearGradient.appendChild(mkEl('stop', { offset: '45%', stopColor: RED }));
    bearGradient.appendChild(mkEl('stop', { offset: '100%', stopColor: '#7a1010' }));

    defs.appendChild(bullGradient);
    defs.appendChild(bearGradient);
    [defs, gridG, zoneG, candleG, lineG, labelG].forEach(g => svg.appendChild(g));

    function fadeIn(el, delay = 100) {
      setTimeout(() => {
        el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        el.style.opacity = '1';
      }, delay);
    }

    function addText(text, x, y, color = GOLD, size = 11, anchor = 'middle', delay = 300) {
      const labelWidth = Math.max(34, text.length * size * 0.62 + 14);
      const labelHeight = size + 9;
      const rectX = anchor === 'middle' ? x - labelWidth / 2 : anchor === 'end' ? x - labelWidth : x;
      const bg = mkEl('rect', {
        x: Math.max(PAD_L, Math.min(W - PAD_R - labelWidth, rectX)),
        y: Math.max(6, Math.min(H - PAD_B - labelHeight, y - labelHeight + 3)),
        width: labelWidth,
        height: labelHeight,
        rx: 5,
        fill: 'rgba(4,10,18,0.92)',
        stroke: `${color}55`,
        'stroke-width': 0.75
      });
      bg.style.opacity = '0';
      labelG.appendChild(bg);
      fadeIn(bg, delay);

      const tx = mkEl('text', {
        x,
        y,
        fill: color,
        'font-size': size,
        'font-weight': 900,
        'font-family': 'Inter, Arial, sans-serif',
        'text-anchor': anchor
      });
      tx.textContent = text;
      tx.style.opacity = '0';
      labelG.appendChild(tx);
      fadeIn(tx, delay + 40);
      return tx;
    }

    function drawLine(x1, y1, x2, y2, color = GOLD, label = '', opts = {}) {
      const line = mkEl('line', {
        x1,
        y1,
        x2,
        y2,
        stroke: color,
        'stroke-width': opts.width || 1.6,
        'stroke-dasharray': opts.dash || '',
        'stroke-linecap': 'round'
      });
      line.style.opacity = '0';
      lineG.appendChild(line);
      fadeIn(line, opts.delay || 900);
      if (label) addText(label, opts.labelX || (x1 + x2) / 2, opts.labelY || y1 - 8, color, opts.fontSize || 11, opts.anchor || 'middle', (opts.delay || 900) + 120);
      return line;
    }

    function drawArrow(x1, y1, x2, y2, color = GOLD, label = '', delay = 1000) {
      const id = `arrow-${pattern.id}-${Math.random().toString(16).slice(2)}`;
      const marker = mkEl('marker', {
        id,
        markerWidth: 8,
        markerHeight: 8,
        refX: 6,
        refY: 3,
        orient: 'auto',
        markerUnits: 'strokeWidth'
      });
      marker.appendChild(mkEl('path', { d: 'M0,0 L0,6 L7,3 z', fill: color }));
      defs.appendChild(marker);
      const arrow = mkEl('line', {
        x1,
        y1,
        x2,
        y2,
        stroke: color,
        'stroke-width': 1.8,
        'stroke-linecap': 'round',
        'marker-end': `url(#${id})`
      });
      arrow.style.opacity = '0';
      lineG.appendChild(arrow);
      fadeIn(arrow, delay);
      if (label) addText(label, x1, y1 - 8, color, 11, 'middle', delay + 120);
    }

    function drawZone(x1, y1, x2, y2, fill, stroke, label, delay = 1200) {
      const top = Math.min(y1, y2);
      const height = Math.abs(y2 - y1);
      if (height < 4) return;
      const rect = mkEl('rect', {
        x: Math.min(x1, x2),
        y: top,
        width: Math.abs(x2 - x1),
        height,
        rx: 6,
        fill,
        stroke,
        'stroke-width': 0.8
      });
      rect.style.opacity = '0';
      zoneG.appendChild(rect);
      fadeIn(rect, delay);
      if (label) addText(label, Math.min(x1, x2) + 8, top + 15, stroke, 10, 'start', delay + 80);
    }

    function drawBracket(start, end, label, color = GOLD, delay = 1200) {
      const x1 = xC(start) - candleW / 2;
      const x2 = xC(end) + candleW / 2;
      const y = H - PAD_B + 15;
      drawLine(x1, y, x2, y, color, '', { delay, width: 1.5 });
      drawLine(x1, y - 7, x1, y + 5, color, '', { delay, width: 1.5 });
      drawLine(x2, y - 7, x2, y + 5, color, '', { delay, width: 1.5 });
      if (label) addText(label, (x1 + x2) / 2, y + 19, color, 11, 'middle', delay + 120);
    }

    function candleLabelText(ann, c, x, delay) {
      const labelY = Math.max(PAD_T + 16, yS(c.h) - 16 + (ann.offset || 0));
      addText(ann.text, x, labelY, ann.color || GOLD, 10, 'middle', delay);
      drawArrow(x, labelY + 8, x, yS(c.h) - 3, ann.color || GOLD, '', delay + 120);
    }

    // Grid lines + price labels.
    for (let i = 0; i <= 5; i++) {
      const price = minP + (i / 5) * (maxP - minP);
      const y = yS(price);
      gridG.appendChild(mkEl('line', {
        x1: PAD_L,
        x2: W - PAD_R,
        y1: y,
        y2: y,
        stroke: 'rgba(255,255,255,0.06)',
        'stroke-width': 0.7
      }));
      const pt = mkEl('text', {
        x: PAD_L - 8,
        y: y + 4,
        fill: 'rgba(203,213,225,0.55)',
        'font-size': 10,
        'text-anchor': 'end',
        'font-family': 'monospace'
      });
      pt.textContent = Math.round(price);
      gridG.appendChild(pt);
    }

    for (let i = 0; i <= candles.length; i += 2) {
      const x = PAD_L + i * spacing;
      gridG.appendChild(mkEl('line', {
        x1: x,
        x2: x,
        y1: PAD_T,
        y2: H - PAD_B,
        stroke: 'rgba(255,255,255,0.035)',
        'stroke-width': 0.7
      }));
    }

    function drawNextCandle() {
      const i = stepRef.current;
      if (i >= candles.length) {
        if (!quizMode) drawOverlays();
        onComplete && onComplete();
        return;
      }

      const c = candles[i];
      const color = c.bull ? TEAL : RED;
      const x = xC(i);
      const yH = yS(c.h);
      const yL = yS(c.l);
      const yO = yS(c.o);
      const yC2 = yS(c.c);
      const bTop = Math.min(yO, yC2);
      const bH = Math.max(Math.abs(yO - yC2), Math.max(6, spacing * 0.18));

      const wick = mkEl('line', {
        x1: x,
        x2: x,
        y1: yH,
        y2: yL,
        stroke: color,
        'stroke-width': 1.8,
        'stroke-linecap': 'round',
        style: `filter: drop-shadow(0 0 5px ${color});`
      });
      wick.style.opacity = '0';
      candleG.appendChild(wick);
      fadeIn(wick, 10);

      const body = mkEl('rect', {
        x: x - candleW / 2,
        y: bTop,
        width: candleW,
        height: bH,
        fill: c.bull ? 'url(#bullGradient)' : 'url(#bearGradient)',
        stroke: c.bull ? '#8fffe9' : '#ffb3b3',
        'stroke-width': 1.4,
        rx: 4,
        style: `filter: drop-shadow(0 0 7px ${color}) drop-shadow(0 0 12px rgba(212,175,55,0.18));`
      });
      body.style.opacity = '0';
      candleG.appendChild(body);
      fadeIn(body, 10);

      stepRef.current += 1;
      animRef.current = setTimeout(drawNextCandle, 65);
    }

    function drawOverlays() {
      const name = (pattern.name || '').toLowerCase();
      const signal = (pattern.signal || '').toLowerCase();
      const bullish = signal.includes('bullish');
      const bearish = signal.includes('bearish');
      const delay = 500;

      // Every pattern still uses its original labels/brackets/arrows.
      pattern.annotations?.forEach((ann, idx) => {
        const d = delay + idx * 160;
        if (ann.type === 'label' && ann.candleIdx !== undefined) {
          const c = candles[ann.candleIdx];
          if (!c) return;
          candleLabelText(ann, c, xC(ann.candleIdx), d);
        }
        if (ann.type === 'bracket' && ann.start !== undefined && ann.end !== undefined) {
          drawBracket(ann.start, ann.end, ann.label || 'Pattern', ann.color || GOLD, d);
        }
        if (ann.type === 'hline' && ann.candleIdx !== undefined) {
          const c = candles[ann.candleIdx];
          if (!c) return;
          const y = bullish ? yS(c.l) : yS(c.h);
          drawLine(PAD_L, y, W - PAD_R, y, ann.color || GOLD, ann.label || 'Key Level', { dash: '7,5', delay: d });
        }
        if (ann.type === 'arrow' && ann.candleIdx !== undefined) {
          const c = candles[ann.candleIdx];
          if (!c) return;
          const x = xC(ann.candleIdx);
          const up = ann.direction === 'up';
          drawArrow(x, up ? yS(c.l) + 30 : yS(c.h) - 30, x, up ? yS(c.l) + 3 : yS(c.h) - 3, ann.color || (up ? TEAL : RED), up ? 'Buyers step in' : 'Sellers reject', d);
        }
      });

      // Automatic child-simple teaching overlays for common pattern families.
      if (name.includes('engulfing')) {
        const idx = Math.max(1, candles.findIndex((c, i) => i > 0 && Math.abs(c.c - c.o) > Math.abs(candles[i - 1].c - candles[i - 1].o) && c.bull !== candles[i - 1].bull));
        const prev = Math.max(0, idx - 1);
        drawBracket(prev, idx, 'Pattern', GOLD, 900);
        addText(candles[idx]?.bull ? 'Big green candle swallows the red candle' : 'Big red candle swallows the green candle', xC(idx), yS(candles[idx]?.h || maxP) - 26, candles[idx]?.bull ? TEAL : RED, 11, 'middle', 950);
        drawArrow(xC(idx), yS(candles[idx]?.h || maxP) - 12, xC(idx), yS(candles[idx]?.h || maxP) + 6, candles[idx]?.bull ? TEAL : RED, '', 1050);
      }

      if (name.includes('hammer')) {
        const idx = candles.findIndex(c => Math.abs(c.l - Math.min(c.o, c.c)) > Math.abs(c.o - c.c) * 2);
        if (idx >= 0) {
          addText('Long wick = sellers got rejected', xC(idx), yS(candles[idx].l) + 28, TEAL, 11, 'middle', 900);
          drawArrow(xC(idx), yS(candles[idx].l) + 15, xC(idx), yS(candles[idx].l) + 3, TEAL, '', 1000);
        }
      }

      if (name.includes('shooting star') || name.includes('gravestone')) {
        const idx = candles.findIndex(c => Math.abs(c.h - Math.max(c.o, c.c)) > Math.abs(c.o - c.c) * 2);
        if (idx >= 0) {
          addText('Long top wick = buyers got rejected', xC(idx), yS(candles[idx].h) - 22, RED, 11, 'middle', 900);
          drawArrow(xC(idx), yS(candles[idx].h) - 8, xC(idx), yS(candles[idx].h) + 6, RED, '', 1000);
        }
      }

      if (name.includes('double top') || name.includes('triple top') || name.includes('head')) {
        const highs = candles.map(c => c.h);
        const resistance = Math.max(...highs.slice(0, Math.max(3, candles.length - 2)));
        const resistanceY = yS(resistance);
        drawLine(PAD_L, resistanceY, W - PAD_R, resistanceY, RED, 'Resistance — sellers defend here', { dash: '7,5', delay: 800, labelY: resistanceY - 10 });
        candles.forEach((c, i) => {
          if (c.h >= resistance - 3 && i < candles.length - 1) addText(name.includes('triple') ? `Top ${Math.min(i + 1, 3)}` : 'Top', xC(i), yS(c.h) - 18, RED, 10, 'middle', 1000 + i * 80);
        });
        const lows = candles.slice(2, -1).map(c => c.l);
        const neck = Math.min(...lows) + 2;
        const neckY = yS(neck);
        drawLine(PAD_L, neckY, W - PAD_R, neckY, TEAL, 'Neckline / support', { dash: '7,5', delay: 1100, labelY: neckY + 16 });
        drawArrow(W - PAD_R - 90, neckY - 28, W - PAD_R - 45, neckY + 4, RED, 'Break below support', 1300);
      }

      if (name.includes('double bottom') || name.includes('triple bottom') || name.includes('inverse head')) {
        const lows = candles.map(c => c.l);
        const support = Math.min(...lows.slice(0, Math.max(3, candles.length - 2)));
        const supportY = yS(support);
        drawLine(PAD_L, supportY, W - PAD_R, supportY, TEAL, 'Support — buyers defend here', { dash: '7,5', delay: 800, labelY: supportY + 16 });
        candles.forEach((c, i) => {
          if (c.l <= support + 3 && i < candles.length - 1) addText(name.includes('triple') ? `Bottom ${Math.min(i + 1, 3)}` : 'Bottom', xC(i), yS(c.l) + 22, TEAL, 10, 'middle', 1000 + i * 80);
        });
        const highs = candles.slice(2, -1).map(c => c.h);
        const neck = Math.max(...highs) - 2;
        const neckY = yS(neck);
        drawLine(PAD_L, neckY, W - PAD_R, neckY, GOLD, 'Neckline / breakout level', { dash: '7,5', delay: 1100, labelY: neckY - 10 });
        drawArrow(W - PAD_R - 90, neckY + 28, W - PAD_R - 45, neckY - 4, TEAL, 'Break above resistance', 1300);
      }

      if (name.includes('triangle') || name.includes('wedge') || name.includes('pennant') || name.includes('flag')) {
        const first = 0;
        const last = Math.max(1, candles.length - 3);
        const upperStart = yS(candles[first].h);
        const upperEnd = yS(candles[last].h);
        const lowerStart = yS(candles[first].l);
        const lowerEnd = yS(candles[last].l);
        drawLine(xC(first), upperStart, xC(last), upperEnd, RED, 'Resistance line', { dash: '6,4', delay: 900 });
        drawLine(xC(first), lowerStart, xC(last), lowerEnd, TEAL, 'Support line', { dash: '6,4', delay: 1050, labelY: lowerEnd + 14 });
        const lastC = candles[candles.length - 2] || candles[candles.length - 1];
        drawArrow(xC(candles.length - 3), yS(lastC.c), xC(candles.length - 1), yS(lastC.c), bullish ? TEAL : RED, bullish ? 'Breakout' : 'Breakdown', 1300);
      }

      if (name.includes('cup')) {
        addText('Rounded cup', xC(Math.floor(candles.length / 2)), H - PAD_B - 18, GOLD, 12, 'middle', 900);
        drawArrow(xC(candles.length - 4), yS(candles[candles.length - 4].h) - 20, xC(candles.length - 2), yS(candles[candles.length - 2].h) - 2, GOLD, 'Handle', 1100);
      }

      if (bearish) {
        const entryY = yS(candles[candles.length - 3]?.c || minP);
        drawZone(W - PAD_R - 145, entryY - 30, W - PAD_R - 15, entryY - 4, 'rgba(239,83,80,0.11)', 'rgba(239,83,80,0.45)', 'Stop zone', 1600);
        drawZone(W - PAD_R - 145, entryY + 5, W - PAD_R - 15, Math.min(H - PAD_B, entryY + 48), 'rgba(38,166,154,0.10)', 'rgba(38,166,154,0.35)', 'Target zone', 1750);
      }

      if (bullish) {
        const entryY = yS(candles[candles.length - 3]?.c || maxP);
        drawZone(W - PAD_R - 145, Math.max(PAD_T, entryY - 48), W - PAD_R - 15, entryY - 5, 'rgba(38,166,154,0.10)', 'rgba(38,166,154,0.35)', 'Target zone', 1600);
        drawZone(W - PAD_R - 145, entryY + 5, W - PAD_R - 15, entryY + 30, 'rgba(239,83,80,0.11)', 'rgba(239,83,80,0.45)', 'Stop zone', 1750);
      }
    }

    drawNextCandle();

    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [playing, pattern, quizMode]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        background: 'transparent'
      }}
    />
  );
}


// ─────────────────────────────────────────────
// PATTERN CARD — Full Professional Layout
// ─────────────────────────────────────────────

function PatternCard({
  pattern,
  isExpanded,
  onClick,
  singleMode = false,
  quizMode = false,
  onNext,
  onPrev,
  onToggleQuiz
}) {
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [multipleChoiceMode, setMultipleChoiceMode] = useState(false);
  
  useEffect(() => {
    if (isExpanded && !playing && !done) {
      setTimeout(() => setPlaying(true), 250);
    }
    if (!isExpanded) {
      setPlaying(false);
      setDone(false);
      setMultipleChoiceMode(false);
      
    }
  }, [isExpanded, playing, done]);

  function handleReplay(e) {
    e?.stopPropagation?.();
    setDone(false);
    setPlaying(false);
    setTimeout(() => setPlaying(true), 100);
  }

  const levelColor = pattern.level === 'Beginner' ? TEAL : pattern.level === 'Intermediate' ? GOLD : PURPLE;
  const sc = pattern.signalColor || GOLD;
  const isBull = pattern.signal?.toLowerCase().includes('bullish');
  const isBear = pattern.signal?.toLowerCase().includes('bearish');
  const directionIcon = isBull ? '↗' : isBear ? '↘' : '◇';
  const atAGlance = [
    { icon: '📊', label: 'Type', value: pattern.signal || 'Pattern' },
    { icon: '⭐', label: 'Reliability', value: pattern.confidence ? `${pattern.confidence}/10` : 'Context-based' },
    { icon: '📈', label: 'Avg. Success Rate', value: pattern.successRate || 'Requires confirmation' },
    { icon: '⏱', label: 'Best Timeframes', value: pattern.timeframe?.slice(0, 4).join(', ') || '5m, 15m, 1H, Daily' },
    { icon: '📦', label: 'Volume', value: pattern.volumeProfile || 'Look for confirmation volume' },
  ];

  const cardShell = {
    background: 'linear-gradient(145deg, rgba(7,14,25,0.98), rgba(3,7,14,0.98))',
    border: `1px solid ${isExpanded ? `${sc}66` : 'rgba(212,175,55,0.22)'}`,
    borderRadius: 18,
    overflow: 'hidden',
    cursor: isExpanded ? 'default' : 'pointer',
    boxShadow: isExpanded
      ? `0 0 0 1px ${sc}12, 0 22px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)`
      : '0 12px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
    transition: 'all 0.25s ease',
  };

  return (
    <div onClick={!isExpanded ? onClick : undefined} style={cardShell}>
      <div
        style={{
          padding: isExpanded ? '18px 20px 14px' : '16px 18px',
          borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.07)' : 'none',
          background: `radial-gradient(circle at 20% 0%, ${sc}18, transparent 28%), radial-gradient(circle at 80% 0%, ${GOLD}10, transparent 28%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', minWidth: 0 }}>
            <div
              style={{
                width: isExpanded ? 58 : 42,
                height: isExpanded ? 58 : 42,
                borderRadius: 12,
                border: `1px solid ${sc}70`,
                background: `linear-gradient(145deg, ${sc}18, rgba(0,0,0,0.25))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: sc,
                fontSize: isExpanded ? 22 : 14,
                fontWeight: 950,
                boxShadow: `0 0 24px ${sc}12`,
                flexShrink: 0,
              }}
            >
              {String(pattern.id).padStart(2, '0')}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {!quizMode && (
                  <h2 style={{ margin: 0, color: '#f8fafc', fontSize: isExpanded ? 32 : 18, lineHeight: 1.05, fontWeight: 950, letterSpacing: -0.6 }}>
                    {pattern.name}
                  </h2>
                )}
                <span style={{ color: sc, fontSize: isExpanded ? 28 : 16, fontWeight: 900 }}>{directionIcon}</span>
                {quizMode && (
                  <span style={{ color: GOLD, fontSize: isExpanded ? 24 : 16, fontWeight: 950, letterSpacing: 0.4 }}>
                    Guess the Pattern
                  </span>
                )}
              </div>
              {!quizMode && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <Pill color={levelColor}>{pattern.level}</Pill>
                  <Pill color={BLUE}>{pattern.category}</Pill>
                  <Pill color={sc}>{pattern.signal}</Pill>
                </div>
              )}
              {isExpanded && !quizMode && (
                <p style={{ color: '#e5e7eb', fontSize: 16, lineHeight: 1.6, margin: '12px 0 0', maxWidth: 1180 }}>
                  {pattern.description}
                </p>
              )}
            </div>
          </div>

          {isExpanded && (
            <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {singleMode && (
                <>
                  <button onClick={onClick} style={buttonStyle('#94a3b8')}>← Back</button>
                  <button onClick={onPrev} style={buttonStyle('#94a3b8')}>← Prev</button>
                  <button onClick={onNext} style={buttonStyle(GOLD)}>Next →</button>
                  <button onClick={onToggleQuiz} style={buttonStyle(quizMode ? RED : TEAL)}>
                    {quizMode ? 'Show Answer' : 'Quiz Mode'}
                  </button>
                </>
              )}
              
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: quizMode ? '1fr' : 'minmax(0, 2.25fr) minmax(300px, 0.9fr)', gap: 14, alignItems: 'stretch' }}>
            <Panel title="PATTERN ANIMATION" icon="▰" color={sc}>
              <div
                style={{
                  height: singleMode ? 'min(62vh, 640px)' : 390,
                  borderRadius: 14,
                  background:
                    'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px), radial-gradient(circle at 50% 15%, rgba(212,175,55,0.08), transparent 35%), #050b14',
                  backgroundSize: '48px 48px, 48px 48px, auto',
                  border: '1px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CandleChart pattern={pattern} playing={playing} quizMode={quizMode} onComplete={() => setDone(true)} width={singleMode ? 1200 : 920} height={singleMode ? 620 : 380} />
              </div>
              <div style={{ marginTop: 10, border: `1px solid ${sc}40`, background: `${sc}0f`, color: '#dbeafe', borderRadius: 10, padding: '10px 12px', fontSize: 14, lineHeight: 1.55 }}>
                {quizMode ? (
                  <strong style={{ color: GOLD }}>Study the chart only. What pattern is this?</strong>
                ) : (
                  <>
                    <strong style={{ color: sc }}>How it works:</strong> {pattern.description}
                  </>
                )}
              </div>
            </Panel>

            {!quizMode && (
            <Panel title="AT A GLANCE" icon="◉" color={TEAL}>
              <div style={{ display: 'grid', gap: 12 }}>
                {atAGlance.map(item => (
                  <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: 10, alignItems: 'start' }}>
                    <div style={{ color: item.label === 'Volume' ? RED : sc, fontSize: 20, lineHeight: 1 }}>{item.icon}</div>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.1, fontWeight: 900 }}>{item.label}</div>
                      <div style={{ color: '#f8fafc', fontSize: 15, lineHeight: 1.45, fontWeight: 700 }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            )}
          </div>

          {!quizMode && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginTop: 12 }}>
            <InfoCard title="PSYCHOLOGY" color={RED} icon="🧠">{pattern.psychology}</InfoCard>
            <InfoCard title="REQUIREMENTS" color={TEAL} icon="✅"><BulletList items={pattern.requirements} /></InfoCard>
            <InfoCard title="IDEAL LOCATION" color={GOLD} icon="🎯"><BulletList items={toList(pattern.idealLocation)} /></InfoCard>
            <InfoCard title="CONFIRMATION" color={TEAL} icon="🛡"><BulletList items={pattern.confirmation} /></InfoCard>
            <InfoCard title="VOLUME PROFILE" color={BLUE} icon="📊"><BulletList items={toList(pattern.volumeProfile)} /></InfoCard>

            <InfoCard title="ENTRY STRATEGY" color={TEAL} icon="🚀">
              <div><strong style={{ color: GOLD }}>Aggressive:</strong> {pattern.aggressiveEntry}</div>
              <div style={{ marginTop: 6 }}><strong style={{ color: TEAL }}>Conservative:</strong> {pattern.conservativeEntry}</div>
              <div style={{ marginTop: 6 }}><strong style={{ color: '#f8fafc' }}>Best Entry:</strong> {pattern.entry}</div>
            </InfoCard>
            <InfoCard title="STOP LOSS" color={RED} icon="🛑">{pattern.stop}</InfoCard>
            <InfoCard title="TARGET" color={GOLD} icon="🏆">{pattern.target}</InfoCard>
            <InfoCard title="BEST INDICATORS" color={BLUE} icon="⭐"><BulletList items={pattern.bestIndicators} /></InfoCard>
            <InfoCard title="COMMON MISTAKES" color={RED} icon="⚠️"><BulletList items={pattern.commonMistakes} /></InfoCard>

            <InfoCard title="PRO TIPS" color={BLUE} icon="💡"><BulletList items={pattern.proTips} /></InfoCard>
            <InfoCard title="RELATED PATTERNS" color={PURPLE} icon="🔗">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {pattern.relatedPatterns?.map(r => <Pill key={r} color={PURPLE}>{r}</Pill>)}
              </div>
            </InfoCard>
            <InfoCard title="OPTIONS STRATEGY" color={GOLD} icon="🎁">{pattern.optionsPlay}</InfoCard>
            <InfoCard title="INSTITUTIONAL CLUES" color={PURPLE} icon="🏦"><BulletList items={pattern.institutionalClues} /></InfoCard>
            <InfoCard title="QUIZ PREVIEW" color={TEAL} icon="❓">
              <div style={{ fontWeight: 800, color: '#f8fafc', marginBottom: 6 }}>{pattern.quiz?.question}</div>
              <div>{pattern.quiz?.choices?.map((c, i) => `${String.fromCharCode(65 + i)}) ${c}`).join('   ')}</div>
            </InfoCard>
          </div>
          )}

          {multipleChoiceMode && (
            <div style={{ marginTop: 14, border: `1px solid ${GOLD}40`, background: 'rgba(212,175,55,0.06)', borderRadius: 14, padding: 16 }}>
              <div style={{ color: GOLD, fontSize: 14, fontWeight: 950, letterSpacing: 1.4, marginBottom: 12 }}>PATTERN RECOGNITION QUIZ</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
                {quizOptions.map(opt => {
                  const isCorrect = opt.id === pattern.id;
                  const isSelected = quizAnswer === opt.id;
                  let bg = 'rgba(255,255,255,0.04)';
                  let border = 'rgba(255,255,255,0.12)';
                  let color = '#f8fafc';
                  if (isSelected && isCorrect) { bg = 'rgba(38,166,154,0.16)'; border = `${TEAL}70`; color = TEAL; }
                  if (isSelected && !isCorrect) { bg = 'rgba(239,83,80,0.16)'; border = `${RED}70`; color = RED; }
                  if (quizAnswer && isCorrect) { bg = 'rgba(38,166,154,0.16)'; border = `${TEAL}70`; color = TEAL; }
                  return (
                    <button
                      key={opt.id}
                      style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, color, fontSize: 14, fontWeight: 850, padding: '13px 14px', cursor: quizAnswer ? 'default' : 'pointer', textAlign: 'left' }}
                    >
                      {opt.name}{quizAnswer && isCorrect ? ' ✓' : ''}{isSelected && !isCorrect ? ' ✗' : ''}
                    </button>
                  );
                })}
              </div>
              {quizAnswer && (
                <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, color: quizAnswer === pattern.id ? TEAL : RED, background: quizAnswer === pattern.id ? 'rgba(38,166,154,0.10)' : 'rgba(239,83,80,0.10)', fontSize: 14, fontWeight: 800 }}>
                  {quizAnswer === pattern.id ? '✓ Correct. Pattern recognition confirmed.' : `✗ Incorrect. This pattern is ${pattern.name}. Replay the animation and focus on the defining structure.`}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function buttonStyle(color) {
  return {
    background: `${color}14`,
    border: `1px solid ${color}55`,
    color,
    borderRadius: 10,
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: `0 0 18px ${color}10`,
  };
}

function Pill({ color, children }) {
  return (
    <span style={{ background: `${color}18`, border: `1px solid ${color}45`, color, fontSize: 12, fontWeight: 900, padding: '4px 9px', borderRadius: 6, letterSpacing: 0.25, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

function Panel({ title, color, icon, children }) {
  return (
    <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.74), rgba(2,6,23,0.72))', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 14, padding: 14, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, color, fontSize: 15, fontWeight: 950, letterSpacing: 1.2, marginBottom: 12 }}>
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function InfoCard({ title, color, icon, children }) {
  return (
    <div style={{ background: `linear-gradient(180deg, ${color}0d, rgba(15,23,42,0.60))`, border: `1px solid ${color}2e`, borderRadius: 12, padding: '14px 15px', minHeight: 150, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.035)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ color, fontSize: 14, fontWeight: 950, letterSpacing: 1.05 }}>{title}</span>
      </div>
      <div style={{ color: '#e5e7eb', fontSize: 14, lineHeight: 1.55, fontWeight: 500 }}>{children}</div>
    </div>
  );
}

function toList(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).split(/\.\s+|;\s+|,\s+/).filter(Boolean).slice(0, 6);
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function PatternsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [signal, setSignal] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [pageMode, setPageMode] = useState('library'); // 'library' | 'quiz'

  // ── Quiz Session State ──
  const [quizPool, setQuizPool] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizPlaying, setQuizPlaying] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0, streak: 0, bestStreak: 0 });
  const [quizFilter, setQuizFilter] = useState({ level: 'All', category: 'All' });
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [weakAreas, setWeakAreas] = useState({});
  const [sessionComplete, setSessionComplete] = useState(false);
  const SESSION_SIZE = 10;

  function buildQuizPool() {
    let pool = [...ALL_PATTERNS];
    if (quizFilter.level !== 'All') pool = pool.filter(p => p.level === quizFilter.level);
    if (quizFilter.category !== 'All') pool = pool.filter(p => p.category === quizFilter.category);
    const weighted = [];
    pool.forEach(p => {
      const times = 1 + (weakAreas[p.id] || 0);
      for (let i = 0; i < times; i++) weighted.push(p);
    });
    const shuffled = weighted.sort(() => Math.random() - 0.5);
    const seen = new Set();
    const deduped = [];
    for (const p of shuffled) {
      if (!seen.has(p.id)) { seen.add(p.id); deduped.push(p); }
      if (deduped.length >= SESSION_SIZE) break;
    }
    return deduped;
  }

  function buildOptions(current) {
    const others = ALL_PATTERNS.filter(p => p.id !== current.id);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
    return [current, ...shuffled].sort(() => Math.random() - 0.5);
  }

  function startQuizSession() {
    const pool = buildQuizPool();
    if (pool.length < 4) return;
    setQuizPool(pool);
    setQuizIndex(0);
    setQuizOptions(buildOptions(pool[0]));
    setQuizAnswer(null);
    setQuizPlaying(false);
    setQuizDone(false);
    setShowHint(false);
    setHintUsed(false);
    setScore({ correct: 0, incorrect: 0, streak: 0, bestStreak: 0 });
    setSessionComplete(false);
    setTimeout(() => setQuizPlaying(true), 200);
  }

  function handleQuizAnswer(optId) {
    if (quizAnswer) return;
    const current = quizPool[quizIndex];
    const correct = optId === current.id;
    setQuizAnswer(optId);
    setScore(prev => {
      const newStreak = correct ? prev.streak + 1 : 0;
      return {
        correct: prev.correct + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      };
    });
    if (!correct) {
      setWeakAreas(prev => ({ ...prev, [current.id]: (prev[current.id] || 0) + 1 }));
    }
  }

  function handleNextQuestion() {
    const nextIdx = quizIndex + 1;
    if (nextIdx >= quizPool.length) {
      setSessionComplete(true);
      return;
    }
    setQuizIndex(nextIdx);
    setQuizOptions(buildOptions(quizPool[nextIdx]));
    setQuizAnswer(null);
    setQuizPlaying(false);
    setQuizDone(false);
    setShowHint(false);
    setHintUsed(false);
    setTimeout(() => setQuizPlaying(true), 200);
  }

  const filtered = ALL_PATTERNS.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'All' && p.category !== category) return false;
    if (level !== 'All' && p.level !== level) return false;
    if (signal !== 'All' && p.signal !== signal) return false;
    return true;
  });

  const stats = {
    total: ALL_PATTERNS.length,
    beginner: ALL_PATTERNS.filter(p => p.level === 'Beginner').length,
    intermediate: ALL_PATTERNS.filter(p => p.level === 'Intermediate').length,
    advanced: ALL_PATTERNS.filter(p => p.level === 'Advanced').length,
  };

  const currentIndex = filtered.findIndex(p => p.id === expanded);
  const selectedPattern = filtered.find(p => p.id === expanded);

  function openPattern(id) { setExpanded(id); }
  function closePattern() { setExpanded(null); }

  function goNext() {
    if (!filtered.length) return;
    const idx = currentIndex === -1 ? 0 : currentIndex;
    setExpanded(filtered[(idx + 1) % filtered.length].id);
  }

  function goPrev() {
    if (!filtered.length) return;
    const idx = currentIndex === -1 ? 0 : currentIndex;
    setExpanded(filtered[(idx - 1 + filtered.length) % filtered.length].id);
  }

  const currentQuizPattern = quizPool[quizIndex];

  return (
    <main className="pageStack" style={{ maxWidth: '100%', padding: '0 20px 60px' }}>

      {/* Header */}
      <section className="pageHeader">
        <div>
          <p style={{ color: GOLD, fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>TRQX ACADEMY</p>
          <h1 style={{ margin: '4px 0 8px' }}>Pattern Library</h1>
          <span style={{ color: '#9ca3af' }}>
            {ALL_PATTERNS.length} animated patterns — psychology, entry, stop, target, quiz and more for each.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 4, gap: 4 }}>
            {[{ key: 'library', label: '📚 Library' }, { key: 'quiz', label: '⚡ Quiz Mode' }].map(m => (
              <button key={m.key} onClick={() => { setPageMode(m.key); setExpanded(null); }}
                style={{ background: pageMode === m.key ? GOLD : 'transparent', border: 'none', borderRadius: 9, color: pageMode === m.key ? '#000' : '#9ca3af', fontSize: 13, fontWeight: 900, padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s' }}>
                {m.label}
              </button>
            ))}
          </div>
          <div style={{ background: 'rgba(38,166,154,0.1)', border: '1px solid rgba(38,166,154,0.3)', borderRadius: 8, padding: '4px 12px', fontSize: 11, color: TEAL, fontWeight: 700 }}>
            All 125 Patterns Live 🔥
          </div>
        </div>
      </section>

      {/* ── LIBRARY MODE ── */}
      {pageMode === 'library' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'TOTAL PATTERNS', value: stats.total, color: GOLD },
              { label: 'BEGINNER', value: stats.beginner, color: TEAL },
              { label: 'INTERMEDIATE', value: stats.intermediate, color: GOLD },
              { label: 'ADVANCED', value: stats.advanced, color: PURPLE },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 18px' }}>
                <div style={{ color: '#9ca3af', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, marginBottom: 6 }}>{s.label}</div>
                <div style={{ color: s.color, fontSize: 28, fontWeight: 900, fontFamily: 'monospace' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patterns..."
              style={{ flex: 1, minWidth: 180, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', padding: '8px 14px', fontSize: 13, outline: 'none', fontFamily: 'monospace' }} />
            {[
              { label: 'Category', value: category, set: setCategory, opts: CATEGORIES },
              { label: 'Level', value: level, set: setLevel, opts: LEVELS },
              { label: 'Signal', value: signal, set: setSignal, opts: SIGNALS },
            ].map(f => (
              <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)}
                style={{ background: '#0d1421', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#f5f1e8', padding: '8px 12px', fontSize: 12, fontFamily: 'monospace', outline: 'none', cursor: 'pointer' }}>
                {f.opts.map(o => <option key={o} value={o}>{f.label}: {o}</option>)}
              </select>
            ))}
            <div style={{ color: '#9ca3af', fontSize: 12, fontFamily: 'monospace', flexShrink: 0 }}>
              {filtered.length} pattern{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {expanded && selectedPattern ? (
            <div style={{ width: '100%', maxWidth: 1800, margin: '0 auto' }}>
              <PatternCard
                pattern={selectedPattern}
                isExpanded={true}
                singleMode={true}
                quizMode={false}
                onClick={closePattern}
                onNext={goNext}
                onPrev={goPrev}
                onToggleQuiz={() => {}}
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 12 }}>
              {filtered.map(p => (
                <PatternCard key={p.id} pattern={p} isExpanded={false} singleMode={false} onClick={() => openPattern(p.id)} />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No patterns found</div>
              <div style={{ fontSize: 13 }}>Try adjusting your filters</div>
            </div>
          )}
        </>
      )}

      {/* ── QUIZ MODE ── */}
      {pageMode === 'quiz' && (
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* Pre-session screen */}
          {quizPool.length === 0 && !sessionComplete && (
            <div style={{ background: 'linear-gradient(145deg, rgba(7,14,25,0.98), rgba(3,7,14,0.98))', border: `1px solid ${GOLD}33`, borderRadius: 20, padding: '48px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>⚡</div>
              <div style={{ color: GOLD, fontSize: 26, fontWeight: 950, marginBottom: 10 }}>Pattern Recognition Quiz</div>
              <div style={{ color: '#9ca3af', fontSize: 15, lineHeight: 1.7, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
                Watch the animated pattern with zero labels. Identify it from 4 options. Track your streak, build your edge, and eliminate weak spots.
              </div>

              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 800, letterSpacing: 1.2, marginBottom: 8 }}>DIFFICULTY</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {LEVELS.map(l => (
                      <button key={l} onClick={() => setQuizFilter(f => ({ ...f, level: l }))}
                        style={{ background: quizFilter.level === l ? `${GOLD}22` : 'rgba(255,255,255,0.04)', border: `1px solid ${quizFilter.level === l ? GOLD : 'rgba(255,255,255,0.1)'}`, borderRadius: 9, color: quizFilter.level === l ? GOLD : '#9ca3af', fontSize: 13, fontWeight: 800, padding: '9px 18px', cursor: 'pointer' }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 800, letterSpacing: 1.2, marginBottom: 8 }}>CATEGORY</div>
                  <select value={quizFilter.category} onChange={e => setQuizFilter(f => ({ ...f, category: e.target.value }))}
                    style={{ background: '#0d1421', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, color: '#f5f1e8', padding: '9px 16px', fontSize: 13, fontFamily: 'monospace', outline: 'none', cursor: 'pointer' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {Object.keys(weakAreas).length > 0 && (
                <div style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.25)', borderRadius: 12, padding: '14px 20px', marginBottom: 28, textAlign: 'left', maxWidth: 600, margin: '0 auto 28px' }}>
                  <div style={{ color: RED, fontSize: 11, fontWeight: 900, letterSpacing: 1, marginBottom: 10 }}>⚠️ WEAK AREAS — weighted higher this session</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(weakAreas).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, count]) => {
                      const p = ALL_PATTERNS.find(x => x.id === parseInt(id));
                      return p ? (
                        <span key={id} style={{ background: 'rgba(239,83,80,0.12)', border: '1px solid rgba(239,83,80,0.3)', color: RED, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6 }}>
                          {p.name} ×{count}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <button onClick={startQuizSession}
                style={{ background: GOLD, border: 'none', borderRadius: 14, color: '#000', fontSize: 17, fontWeight: 950, padding: '18px 52px', cursor: 'pointer', letterSpacing: 0.5, boxShadow: `0 0 32px ${GOLD}44` }}>
                START QUIZ — {SESSION_SIZE} PATTERNS
              </button>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 14 }}>
                One hint per question · Wrong answers appear more often in future sessions
              </div>
            </div>
          )}

          {/* Session complete */}
          {sessionComplete && (
            <div style={{ background: 'linear-gradient(145deg, rgba(7,14,25,0.98), rgba(3,7,14,0.98))', border: `1px solid ${GOLD}33`, borderRadius: 20, padding: '48px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>
                {score.correct >= SESSION_SIZE * 0.8 ? '🏆' : score.correct >= SESSION_SIZE * 0.6 ? '📈' : '📚'}
              </div>
              <div style={{ color: GOLD, fontSize: 26, fontWeight: 950, marginBottom: 28 }}>Session Complete</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
                {[
                  { label: 'CORRECT', value: score.correct, color: TEAL },
                  { label: 'INCORRECT', value: score.incorrect, color: RED },
                  { label: 'ACCURACY', value: `${Math.round((score.correct / SESSION_SIZE) * 100)}%`, color: GOLD },
                  { label: 'BEST STREAK', value: score.bestStreak, color: PURPLE },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px' }}>
                    <div style={{ color: '#9ca3af', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, marginBottom: 8 }}>{s.label}</div>
                    <div style={{ color: s.color, fontSize: 34, fontWeight: 950, fontFamily: 'monospace' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {score.correct >= SESSION_SIZE * 0.8 && (
                <div style={{ background: 'rgba(38,166,154,0.1)', border: '1px solid rgba(38,166,154,0.3)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, color: TEAL, fontWeight: 800, fontSize: 15 }}>
                  🔥 Outstanding — {score.correct}/{SESSION_SIZE} correct. Elite pattern recognition.
                </div>
              )}

              {Object.keys(weakAreas).length > 0 && score.correct < SESSION_SIZE * 0.8 && (
                <div style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.2)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, textAlign: 'left' }}>
                  <div style={{ color: RED, fontSize: 11, fontWeight: 900, letterSpacing: 1, marginBottom: 10 }}>REVIEW THESE IN THE LIBRARY</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(weakAreas).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id]) => {
                      const p = ALL_PATTERNS.find(x => x.id === parseInt(id));
                      return p ? (
                        <button key={id} onClick={() => { setPageMode('library'); openPattern(p.id); }}
                          style={{ background: 'rgba(239,83,80,0.12)', border: '1px solid rgba(239,83,80,0.3)', color: RED, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>
                          {p.name}
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={startQuizSession}
                  style={{ background: GOLD, border: 'none', borderRadius: 12, color: '#000', fontSize: 15, fontWeight: 950, padding: '14px 36px', cursor: 'pointer' }}>
                  QUIZ AGAIN
                </button>
                <button onClick={() => { setQuizPool([]); setSessionComplete(false); }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#f5f1e8', fontSize: 15, fontWeight: 800, padding: '14px 36px', cursor: 'pointer' }}>
                  Change Settings
                </button>
                <button onClick={() => setPageMode('library')}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#9ca3af', fontSize: 15, fontWeight: 700, padding: '14px 36px', cursor: 'pointer' }}>
                  Go to Library
                </button>
              </div>
            </div>
          )}

          {/* Active question */}
          {quizPool.length > 0 && !sessionComplete && currentQuizPattern && (
            <div>
              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 20px' }}>
                <div style={{ color: '#9ca3af', fontSize: 13, fontFamily: 'monospace', flexShrink: 0 }}>
                  <span style={{ color: GOLD, fontWeight: 900 }}>{quizIndex + 1}</span> / <span style={{ color: GOLD, fontWeight: 900 }}>{quizPool.length}</span>
                </div>
                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${(quizIndex / quizPool.length) * 100}%`, background: GOLD, borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                  <span style={{ color: TEAL, fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>✓ {score.correct}</span>
                  <span style={{ color: RED, fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>✗ {score.incorrect}</span>
                  {score.streak >= 2 && <span style={{ color: GOLD, fontSize: 13, fontWeight: 900, fontFamily: 'monospace' }}>🔥 {score.streak}</span>}
                </div>
              </div>

              {/* Chart */}
              <div style={{ background: 'linear-gradient(145deg, rgba(7,14,25,0.98), rgba(3,7,14,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
                  <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 800, letterSpacing: 1.8 }}>IDENTIFY THIS PATTERN</span>
                  <span style={{ color: '#6b7280', fontSize: 11, marginLeft: 'auto' }}>Category: {currentQuizPattern.category}</span>
                  {!hintUsed && !quizAnswer && (
                    <button onClick={() => { setShowHint(true); setHintUsed(true); }}
                      style={{ background: `${PURPLE}18`, border: `1px solid ${PURPLE}44`, borderRadius: 7, color: PURPLE, fontSize: 11, fontWeight: 800, padding: '5px 12px', cursor: 'pointer' }}>
                      💡 Hint
                    </button>
                  )}
                  {hintUsed && !quizAnswer && <span style={{ color: '#6b7280', fontSize: 11 }}>Hint used</span>}
                </div>

                {showHint && (
                  <div style={{ background: `${PURPLE}12`, border: `1px solid ${PURPLE}30`, borderRadius: 10, padding: '12px 16px', marginBottom: 14, color: PURPLE, fontSize: 13, fontWeight: 700 }}>
                    💡 This is a <strong>{currentQuizPattern.signal}</strong> pattern · Confidence: {currentQuizPattern.confidence}/10
                  </div>
                )}

                <div style={{ background: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px), #050b14', backgroundSize: '48px 48px, 48px 48px', borderRadius: 12, height: 360, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <CandleChart
                    pattern={{ ...currentQuizPattern, annotations: [] }}
                    playing={quizPlaying}
                    quizMode={true}
                    onComplete={() => setQuizDone(true)}
                    width={900}
                    height={344}
                  />
                </div>

                <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center' }}>
                  {[{ color: TEAL, label: 'Bullish candle' }, { color: RED, label: 'Bearish candle' }].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
                      <span style={{ color: '#9ca3af', fontSize: 11 }}>{item.label}</span>
                    </div>
                  ))}
                  {quizDone && (
                    <button onClick={() => { setQuizPlaying(false); setQuizDone(false); setTimeout(() => setQuizPlaying(true), 100); }}
                      style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#9ca3af', fontSize: 11, fontWeight: 700, padding: '5px 12px', cursor: 'pointer' }}>
                      ↺ Replay
                    </button>
                  )}
                </div>
              </div>

              {/* Answer choices */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {quizOptions.map(opt => {
                  const isCorrect = opt.id === currentQuizPattern.id;
                  const isSelected = quizAnswer === opt.id;
                  let bg = 'rgba(255,255,255,0.04)';
                  let border = 'rgba(255,255,255,0.1)';
                  let color = '#f5f1e8';
                  if (isSelected && isCorrect) { bg = 'rgba(38,166,154,0.16)'; border = `${TEAL}60`; color = TEAL; }
                  if (isSelected && !isCorrect) { bg = 'rgba(239,83,80,0.16)'; border = `${RED}60`; color = RED; }
                  if (quizAnswer && isCorrect) { bg = 'rgba(38,166,154,0.16)'; border = `${TEAL}60`; color = TEAL; }
                  return (
                    <button key={opt.id} onClick={() => handleQuizAnswer(opt.id)} disabled={!!quizAnswer}
                      style={{ background: bg, border: `2px solid ${border}`, borderRadius: 14, color, fontSize: 15, fontWeight: 800, padding: '18px 22px', cursor: quizAnswer ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{opt.name}</span>
                      {quizAnswer && isCorrect && <span style={{ fontSize: 20 }}>✓</span>}
                      {isSelected && !isCorrect && <span style={{ fontSize: 20 }}>✗</span>}
                    </button>
                  );
                })}
              </div>

              {/* Answer reveal */}
              {quizAnswer && (
                <div style={{ background: 'linear-gradient(145deg, rgba(7,14,25,0.98), rgba(3,7,14,0.98))', border: `1px solid ${quizAnswer === currentQuizPattern.id ? `${TEAL}44` : `${RED}44`}`, borderRadius: 16, padding: '22px', marginBottom: 16 }}>
                  <div style={{ color: quizAnswer === currentQuizPattern.id ? TEAL : RED, fontSize: 18, fontWeight: 950, marginBottom: 16 }}>
                    {quizAnswer === currentQuizPattern.id
                      ? `✓ Correct — ${currentQuizPattern.name}`
                      : `✗ That was ${currentQuizPattern.name}`}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                    <InfoCard title="WHAT IT IS" color={GOLD} icon="📖">{currentQuizPattern.description}</InfoCard>
                    <InfoCard title="KEY PSYCHOLOGY" color={currentQuizPattern.signalColor || GOLD} icon="🧠">{currentQuizPattern.psychology}</InfoCard>
                    <InfoCard title="HOW TO TRADE IT" color={TEAL} icon="🎯">
                      <div><strong style={{ color: TEAL }}>Entry:</strong> {currentQuizPattern.entry}</div>
                      <div style={{ marginTop: 6 }}><strong style={{ color: RED }}>Stop:</strong> {currentQuizPattern.stop}</div>
                      <div style={{ marginTop: 6 }}><strong style={{ color: GOLD }}>Target:</strong> {currentQuizPattern.target}</div>
                    </InfoCard>
                  </div>
                  {quizAnswer !== currentQuizPattern.id && (
                    <div style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: '#9ca3af', fontSize: 13 }}>
                      This pattern added to your weak areas — it will appear more often in future sessions.
                    </div>
                  )}
                  <button onClick={handleNextQuestion}
                    style={{ background: GOLD, border: 'none', borderRadius: 12, color: '#000', fontSize: 15, fontWeight: 950, padding: '14px 32px', cursor: 'pointer', width: '100%' }}>
                    {quizIndex + 1 >= quizPool.length ? 'See Results →' : 'Next Pattern →'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </main>
  );
}