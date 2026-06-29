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

const ALL_PATTERNS = [...PATTERNS, ...BATCH2, ...BATCH3].map(enhancePattern);
const CATEGORIES = ['All', 'Single Candle', 'Multi Candle', 'Chart Pattern', 'Market Structure', 'Support & Resistance', 'Price Action', 'Gap Pattern', 'Volume Pattern', 'Momentum', 'Options Flow', 'Gamma Pattern', 'Smart Money', 'ORB Pattern', 'Institutional'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const SIGNALS = ['All', 'Bullish Reversal', 'Bearish Reversal', 'Bullish Continuation', 'Bearish Continuation', 'Indecision'];

// ─────────────────────────────────────────────
// CANDLE ANIMATION ENGINE
// ─────────────────────────────────────────────
function CandleChart({ pattern, playing, onComplete, width = 680, height = 340 }) {
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
        drawOverlays();
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
  }, [playing, pattern]);

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
                <CandleChart pattern={pattern} playing={playing} onComplete={() => setDone(true)} width={singleMode ? 1200 : 920} height={singleMode ? 620 : 380} />
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