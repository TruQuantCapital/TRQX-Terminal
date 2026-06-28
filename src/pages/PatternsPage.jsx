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
  // ── LEVEL I: Single Candle Bullish ──
  {
    id: 1, name: "Bullish Engulfing", level: "Beginner",
    category: "Single Candle", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "A large bullish candle completely engulfs the previous bearish candle. Signals that buyers have overwhelmed sellers and a reversal is likely.",
    entry: "Open of next candle after the engulfing pattern forms",
    stop: "Below the low of the engulfing candle",
    target: "1.5-2x the height of the pattern",
    candles: [
      {o:210,c:205,h:212,l:203,bull:false},
      {o:208,c:215,h:207,l:217,bull:true},
      {o:203,c:200,h:204,l:198,bull:false},
      {o:201,c:198,h:202,l:196,bull:false},
      {o:199,c:195,h:200,l:193,bull:false},
      {o:196,c:192,h:197,l:190,bull:false},
      {o:193,c:189,h:194,l:187,bull:false},
      // Engulfing pattern
      {o:190,c:185,h:191,l:183,bull:false},
      {o:183,c:193,h:182,l:195,bull:true},
      // Continuation
      {o:193,c:198,h:192,l:200,bull:true},
      {o:198,c:204,h:197,l:206,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:7, offset:-18, text:'Bearish', color:'#ef5350'},
      {type:'label', candleIdx:8, offset:-18, text:'Engulfing', color:TEAL},
      {type:'bracket', start:7, end:8, label:'Pattern'},
    ]
  },
  {
    id: 2, name: "Hammer", level: "Beginner",
    category: "Single Candle", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "A candle with a small body at the top and a long lower wick (2x+ the body). Signals buyers rejected lower prices and a reversal may follow.",
    entry: "Above the high of the hammer candle",
    stop: "Below the low of the hammer wick",
    target: "Previous swing high",
    candles: [
      {o:215,c:210,h:216,l:208,bull:false},
      {o:210,c:205,h:211,l:203,bull:false},
      {o:205,c:200,h:206,l:198,bull:false},
      {o:200,c:196,h:201,l:194,bull:false},
      {o:196,c:193,h:197,l:191,bull:false},
      // Hammer
      {o:193,c:195,h:196,l:183,bull:true},
      // Continuation
      {o:195,c:200,h:194,l:202,bull:true},
      {o:200,c:206,h:199,l:208,bull:true},
      {o:206,c:210,h:205,l:212,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:5, offset:-25, text:'Hammer', color:TEAL},
      {type:'arrow', candleIdx:5, direction:'up'},
    ]
  },
  {
    id: 3, name: "Inverted Hammer", level: "Beginner",
    category: "Single Candle", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Small body at the bottom with a long upper wick. Appears at the bottom of a downtrend. Signals buyers tried to push higher — confirmation needed.",
    entry: "Above the high of the next bullish candle",
    stop: "Below the low of the inverted hammer",
    target: "Previous swing high",
    candles: [
      {o:215,c:210,h:216,l:208,bull:false},
      {o:210,c:205,h:211,l:203,bull:false},
      {o:205,c:200,h:206,l:198,bull:false},
      {o:200,c:195,h:201,l:193,bull:false},
      // Inverted hammer
      {o:195,c:193,h:205,l:192,bull:false},
      // Confirmation
      {o:193,c:199,h:192,l:201,bull:true},
      {o:199,c:205,h:198,l:207,bull:true},
      {o:205,c:210,h:204,l:212,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-25, text:'Inv. Hammer', color:TEAL},
      {type:'label', candleIdx:5, offset:-18, text:'Confirm', color:GOLD},
    ]
  },
  {
    id: 4, name: "Dragonfly Doji", level: "Beginner",
    category: "Single Candle", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Open and close are at the high of the candle with a very long lower wick. Strong rejection of lower prices. One of the most powerful single-candle reversals.",
    entry: "Above the high of the dragonfly doji",
    stop: "Below the low of the long wick",
    target: "1.5-2x the wick length above entry",
    candles: [
      {o:215,c:210,h:216,l:208,bull:false},
      {o:210,c:204,h:211,l:202,bull:false},
      {o:204,c:198,h:205,l:196,bull:false},
      {o:198,c:193,h:199,l:191,bull:false},
      // Dragonfly doji
      {o:193,c:193,h:194,l:180,bull:true},
      {o:193,c:199,h:192,l:201,bull:true},
      {o:199,c:206,h:198,l:208,bull:true},
      {o:206,c:212,h:205,l:214,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-28, text:'Dragonfly', color:TEAL},
      {type:'arrow', candleIdx:4, direction:'up'},
    ]
  },
  {
    id: 5, name: "Bullish Marubozu", level: "Beginner",
    category: "Single Candle", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A full bullish candle with no wicks. Opens at the low and closes at the high. Shows total buyer dominance — no hesitation. Strong momentum signal.",
    entry: "Open of next candle",
    stop: "Below the open of the marubozu",
    target: "Measured move equal to marubozu length",
    candles: [
      {o:195,c:198,h:196,l:199,bull:true},
      {o:198,c:202,h:199,l:203,bull:true},
      {o:202,c:200,h:203,l:201,bull:false},
      {o:200,c:204,h:201,l:205,bull:true},
      // Marubozu
      {o:200,c:212,h:200,l:212,bull:true},
      {o:212,c:218,h:211,l:220,bull:true},
      {o:218,c:222,h:217,l:224,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Marubozu', color:TEAL},
    ]
  },
  {
    id: 6, name: "Piercing Pattern", level: "Beginner",
    category: "Single Candle", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "After a bearish candle, the next candle opens below the low and closes above the midpoint of the previous candle. Signals buyers are stepping in strongly.",
    entry: "Above the high of the piercing candle",
    stop: "Below the low of the piercing candle",
    target: "Previous swing high",
    candles: [
      {o:215,c:210,h:216,l:208,bull:false},
      {o:210,c:205,h:211,l:203,bull:false},
      {o:205,c:200,h:206,l:198,bull:false},
      {o:200,c:194,h:201,l:192,bull:false},
      // Piercing pattern
      {o:194,c:188,h:195,l:186,bull:false},
      {o:185,c:192,h:184,l:194,bull:true},
      {o:192,c:198,h:191,l:200,bull:true},
      {o:198,c:204,h:197,l:206,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Bearish', color:RED},
      {type:'label', candleIdx:5, offset:-18, text:'Piercing', color:TEAL},
    ]
  },

  // ── LEVEL I: Single Candle Bearish ──
  {
    id: 7, name: "Bearish Engulfing", level: "Beginner",
    category: "Single Candle", signal: "Bearish Reversal",
    signalColor: RED,
    description: "A large bearish candle completely engulfs the previous bullish candle. Signals sellers have overwhelmed buyers and a reversal lower is likely.",
    entry: "Open of next candle after engulfing forms",
    stop: "Above the high of the engulfing candle",
    target: "1.5-2x the height of the pattern below entry",
    candles: [
      {o:190,c:195,h:189,l:197,bull:true},
      {o:195,c:200,h:194,l:202,bull:true},
      {o:200,c:205,h:199,l:207,bull:true},
      {o:205,c:210,h:204,l:212,bull:true},
      {o:210,c:215,h:209,l:217,bull:true},
      // Engulfing
      {o:215,c:218,h:214,l:220,bull:true},
      {o:220,c:210,h:221,l:208,bull:false},
      // Continuation
      {o:210,c:204,h:211,l:202,bull:false},
      {o:204,c:198,h:205,l:196,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:5, offset:-18, text:'Bullish', color:TEAL},
      {type:'label', candleIdx:6, offset:-18, text:'Engulfing', color:RED},
      {type:'bracket', start:5, end:6, label:'Pattern'},
    ]
  },
  {
    id: 8, name: "Shooting Star", level: "Beginner",
    category: "Single Candle", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Small body at the bottom with a long upper wick at the TOP of an uptrend. Signals buyers were rejected at higher prices. Strong reversal signal.",
    entry: "Below the low of the shooting star",
    stop: "Above the high of the upper wick",
    target: "Previous swing low",
    candles: [
      {o:190,c:195,h:189,l:197,bull:true},
      {o:195,c:200,h:194,l:202,bull:true},
      {o:200,c:206,h:199,l:208,bull:true},
      {o:206,c:212,h:205,l:214,bull:true},
      // Shooting star
      {o:212,c:210,h:209,l:222,bull:false},
      // Continuation
      {o:210,c:204,h:211,l:202,bull:false},
      {o:204,c:198,h:205,l:196,bull:false},
      {o:198,c:192,h:199,l:190,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-25, text:'Shooting Star', color:RED},
      {type:'arrow', candleIdx:4, direction:'down'},
    ]
  },
  {
    id: 9, name: "Hanging Man", level: "Beginner",
    category: "Single Candle", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Same shape as hammer but appears at the TOP of an uptrend. Small body, long lower wick. Sellers tested lower prices — warning sign that trend may reverse.",
    entry: "Below the low of the next bearish confirmation candle",
    stop: "Above the high of the hanging man",
    target: "Previous swing low",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      {o:208,c:214,h:207,l:216,bull:true},
      // Hanging man
      {o:214,c:216,h:213,l:206,bull:true},
      // Confirmation & continuation
      {o:216,c:210,h:217,l:208,bull:false},
      {o:210,c:204,h:211,l:202,bull:false},
      {o:204,c:198,h:205,l:196,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-25, text:'Hanging Man', color:RED},
      {type:'label', candleIdx:5, offset:-18, text:'Confirm', color:GOLD},
    ]
  },
  {
    id: 10, name: "Gravestone Doji", level: "Beginner",
    category: "Single Candle", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Open and close at the LOW with a long upper wick. Strong rejection of higher prices at the top of a trend. Mirror opposite of dragonfly doji.",
    entry: "Below the low of the gravestone doji",
    stop: "Above the high of the upper wick",
    target: "1.5-2x the wick length below entry",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      {o:208,c:214,h:207,l:216,bull:true},
      // Gravestone doji
      {o:214,c:214,h:213,l:226,bull:false},
      {o:214,c:208,h:215,l:206,bull:false},
      {o:208,c:202,h:209,l:200,bull:false},
      {o:202,c:196,h:203,l:194,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-25, text:'Gravestone', color:RED},
      {type:'arrow', candleIdx:4, direction:'down'},
    ]
  },
  {
    id: 11, name: "Bearish Marubozu", level: "Beginner",
    category: "Single Candle", signal: "Bearish Continuation",
    signalColor: RED,
    description: "Full bearish candle with no wicks. Opens at the high and closes at the low. Complete seller dominance. Strong momentum continuation signal.",
    entry: "Open of next candle",
    stop: "Above the open of the marubozu",
    target: "Measured move equal to marubozu length below",
    candles: [
      {o:215,c:212,h:216,l:211,bull:false},
      {o:212,c:208,h:213,l:207,bull:false},
      {o:208,c:210,h:207,l:211,bull:true},
      {o:210,c:206,h:211,l:205,bull:false},
      // Marubozu
      {o:214,c:202,h:214,l:202,bull:false},
      {o:202,c:196,h:203,l:194,bull:false},
      {o:196,c:190,h:197,l:188,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Marubozu', color:RED},
    ]
  },
  {
    id: 12, name: "Dark Cloud Cover", level: "Beginner",
    category: "Single Candle", signal: "Bearish Reversal",
    signalColor: RED,
    description: "After a bullish candle, the next opens above the high and closes below the midpoint of the previous candle. Sellers are gaining control.",
    entry: "Below the low of the dark cloud candle",
    stop: "Above the high of the dark cloud candle",
    target: "Previous swing low",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      // Dark cloud
      {o:208,c:214,h:207,l:216,bull:true},
      {o:217,c:209,h:218,l:207,bull:false},
      {o:209,c:203,h:210,l:201,bull:false},
      {o:203,c:197,h:204,l:195,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Bullish', color:TEAL},
      {type:'label', candleIdx:4, offset:-18, text:'Dark Cloud', color:RED},
    ]
  },

  // ── LEVEL I: Neutral ──
  {
    id: 13, name: "Doji", level: "Beginner",
    category: "Single Candle", signal: "Indecision",
    signalColor: GOLD,
    description: "Open and close are at virtually the same price. Buyers and sellers are in perfect equilibrium. Signals indecision — context determines direction.",
    entry: "Wait for confirmation candle",
    stop: "Below the low (bullish setup) or above the high (bearish)",
    target: "Based on confirmation candle direction",
    candles: [
      {o:202,c:206,h:201,l:208,bull:true},
      {o:206,c:210,h:205,l:212,bull:true},
      {o:210,c:208,h:211,l:209,bull:false},
      // Doji
      {o:208,c:208,h:206,l:214,bull:true},
      {o:208,c:214,h:207,l:216,bull:true},
      {o:214,c:218,h:213,l:220,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-25, text:'Doji', color:GOLD},
    ]
  },
  {
    id: 14, name: "Long-Legged Doji", level: "Beginner",
    category: "Single Candle", signal: "Indecision",
    signalColor: GOLD,
    description: "A doji with very long upper and lower wicks. Extreme indecision — both bulls and bears fought hard but neither won. Major volatility signal.",
    entry: "Wait for strong confirmation candle",
    stop: "Outside the entire wick range",
    target: "Based on breakout direction",
    candles: [
      {o:202,c:206,h:201,l:208,bull:true},
      {o:206,c:210,h:205,l:212,bull:true},
      {o:210,c:208,h:211,l:209,bull:false},
      // Long-legged doji
      {o:208,c:208,h:200,l:218,bull:true},
      {o:208,c:214,h:207,l:216,bull:true},
      {o:214,c:218,h:213,l:220,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-30, text:'Long-Legged Doji', color:GOLD},
    ]
  },
  {
    id: 15, name: "Spinning Top", level: "Beginner",
    category: "Single Candle", signal: "Indecision",
    signalColor: GOLD,
    description: "Small body with upper and lower wicks of roughly equal length. Shows balance between buyers and sellers. Often signals a pause before continuation or reversal.",
    entry: "Wait for next candle direction",
    stop: "Outside the wick range",
    target: "Based on next candle",
    candles: [
      {o:200,c:205,h:199,l:207,bull:true},
      {o:205,c:210,h:204,l:212,bull:true},
      {o:210,c:208,h:211,l:209,bull:false},
      // Spinning top
      {o:208,c:210,h:204,l:214,bull:true},
      {o:210,c:216,h:209,l:218,bull:true},
      {o:216,c:220,h:215,l:222,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-25, text:'Spinning Top', color:GOLD},
    ]
  },
  {
    id: 16, name: "High Wave Candle", level: "Beginner",
    category: "Single Candle", signal: "Indecision",
    signalColor: GOLD,
    description: "Extreme version of the spinning top with very long wicks on both sides and a tiny body. Shows massive uncertainty and volatility. Often precedes a major move.",
    entry: "Wait for breakout from the wick range",
    stop: "Opposite end of the wick",
    target: "Equal to the wick length in breakout direction",
    candles: [
      {o:205,c:210,h:204,l:212,bull:true},
      {o:210,c:208,h:211,l:209,bull:false},
      {o:208,c:212,h:207,l:214,bull:true},
      // High wave
      {o:210,c:211,h:200,l:222,bull:true},
      {o:211,c:217,h:210,l:219,bull:true},
      {o:217,c:222,h:216,l:224,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-32, text:'High Wave', color:GOLD},
    ]
  },

  // ── LEVEL II: Multi-Candle Bullish Reversal ──
  {
    id: 17, name: "Morning Star", level: "Beginner",
    category: "Multi Candle", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Three-candle pattern: large bearish candle, small indecision candle (gaps down), large bullish candle closing above the midpoint of candle 1. Strong bottom signal.",
    entry: "Above the close of the third candle",
    stop: "Below the low of the small middle candle",
    target: "Previous swing high",
    candles: [
      {o:215,c:210,h:216,l:208,bull:false},
      {o:210,c:204,h:211,l:202,bull:false},
      {o:204,c:198,h:205,l:196,bull:false},
      {o:198,c:193,h:199,l:191,bull:false},
      // Morning star 3 candles
      {o:193,c:187,h:194,l:185,bull:false},
      {o:185,c:186,h:183,l:188,bull:true},
      {o:184,c:193,h:183,l:195,bull:true},
      // Continuation
      {o:193,c:199,h:192,l:201,bull:true},
      {o:199,c:205,h:198,l:207,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Bearish', color:RED},
      {type:'label', candleIdx:5, offset:-20, text:'Star', color:GOLD},
      {type:'label', candleIdx:6, offset:-18, text:'Bullish', color:TEAL},
      {type:'bracket', start:4, end:6, label:'Morning Star'},
    ]
  },
  {
    id: 18, name: "Morning Doji Star", level: "Intermediate",
    category: "Multi Candle", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Like the morning star but the middle candle is a doji. Even stronger signal because the doji shows a complete standoff between buyers and sellers at the bottom.",
    entry: "Above the close of the third candle",
    stop: "Below the low of the doji",
    target: "Previous swing high",
    candles: [
      {o:215,c:210,h:216,l:208,bull:false},
      {o:210,c:204,h:211,l:202,bull:false},
      {o:204,c:198,h:205,l:196,bull:false},
      {o:198,c:192,h:199,l:190,bull:false},
      // Morning doji star
      {o:192,c:186,h:193,l:184,bull:false},
      {o:184,c:184,h:182,l:187,bull:true},
      {o:183,c:192,h:182,l:194,bull:true},
      {o:192,c:198,h:191,l:200,bull:true},
      {o:198,c:204,h:197,l:206,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Bearish', color:RED},
      {type:'label', candleIdx:5, offset:-22, text:'Doji', color:GOLD},
      {type:'label', candleIdx:6, offset:-18, text:'Bullish', color:TEAL},
      {type:'bracket', start:4, end:6, label:'Morning Doji Star'},
    ]
  },
  {
    id: 19, name: "Three White Soldiers", level: "Beginner",
    category: "Multi Candle", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Three consecutive large bullish candles, each opening within the previous body and closing higher. Signals a powerful shift from sellers to buyers.",
    entry: "Open of candle after the third soldier",
    stop: "Below the low of the first soldier",
    target: "Measured move equal to the three-candle range",
    candles: [
      {o:215,c:210,h:216,l:208,bull:false},
      {o:210,c:205,h:211,l:203,bull:false},
      {o:205,c:200,h:206,l:198,bull:false},
      {o:200,c:194,h:201,l:192,bull:false},
      // Three white soldiers
      {o:194,c:200,h:193,l:202,bull:true},
      {o:199,c:206,h:198,l:208,bull:true},
      {o:205,c:213,h:204,l:215,bull:true},
      {o:213,c:218,h:212,l:220,bull:true},
      {o:218,c:222,h:217,l:224,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Soldier 1', color:TEAL},
      {type:'label', candleIdx:5, offset:-18, text:'Soldier 2', color:TEAL},
      {type:'label', candleIdx:6, offset:-18, text:'Soldier 3', color:TEAL},
    ]
  },
  {
    id: 20, name: "Bullish Harami", level: "Beginner",
    category: "Multi Candle", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "A small bullish candle completely contained within the body of the previous large bearish candle. Signals momentum is slowing — watch for confirmation.",
    entry: "Above the high of the small bullish candle",
    stop: "Below the low of the large bearish candle",
    target: "Previous swing high",
    candles: [
      {o:215,c:210,h:216,l:208,bull:false},
      {o:210,c:204,h:211,l:202,bull:false},
      {o:204,c:198,h:205,l:196,bull:false},
      // Harami
      {o:198,c:190,h:199,l:188,bull:false},
      {o:191,c:194,h:190,l:196,bull:true},
      // Confirmation
      {o:194,c:200,h:193,l:202,bull:true},
      {o:200,c:206,h:199,l:208,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Large Bearish', color:RED},
      {type:'label', candleIdx:4, offset:-18, text:'Small Inside', color:TEAL},
      {type:'bracket', start:3, end:4, label:'Harami'},
    ]
  },
  {
    id: 21, name: "Tweezer Bottom", level: "Intermediate",
    category: "Multi Candle", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Two candles with identical or very similar lows — one bearish, one bullish. Shows price tested a level twice and buyers defended it both times.",
    entry: "Above the high of the second candle",
    stop: "Below the shared low",
    target: "Previous swing high",
    candles: [
      {o:215,c:210,h:216,l:208,bull:false},
      {o:210,c:204,h:211,l:202,bull:false},
      {o:204,c:198,h:205,l:196,bull:false},
      // Tweezer bottom
      {o:198,c:193,h:199,l:189,bull:false},
      {o:190,c:196,h:189,l:189,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-22, text:'Same Low', color:GOLD},
      {type:'label', candleIdx:4, offset:-22, text:'Same Low', color:GOLD},
      {type:'hline', candleIdx:3, label:'Support'},
    ]
  },
  {
    id: 22, name: "Abandoned Baby Bottom", level: "Advanced",
    category: "Multi Candle", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Rare three-candle pattern: bearish candle, then a doji that gaps below it, then a bullish candle that gaps above the doji. Very high accuracy reversal signal.",
    entry: "Above the close of the third candle",
    stop: "Below the low of the doji",
    target: "Previous swing high — full reversal expected",
    candles: [
      {o:215,c:210,h:216,l:208,bull:false},
      {o:210,c:204,h:211,l:202,bull:false},
      {o:204,c:198,h:205,l:196,bull:false},
      // Abandoned baby
      {o:198,c:192,h:199,l:190,bull:false},
      {o:189,c:189,h:188,l:191,bull:true},
      {o:192,c:200,h:191,l:202,bull:true},
      {o:200,c:207,h:199,l:209,bull:true},
      {o:207,c:213,h:206,l:215,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Bearish', color:RED},
      {type:'label', candleIdx:4, offset:-22, text:'Gap Doji', color:GOLD},
      {type:'label', candleIdx:5, offset:-18, text:'Gap Up', color:TEAL},
    ]
  },

  // ── LEVEL II: Multi-Candle Bearish Reversal ──
  {
    id: 23, name: "Evening Star", level: "Beginner",
    category: "Multi Candle", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Three-candle pattern: large bullish candle, small indecision candle (gaps up), large bearish candle closing below the midpoint of candle 1. Strong top signal.",
    entry: "Below the close of the third candle",
    stop: "Above the high of the small middle candle",
    target: "Previous swing low",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      // Evening star
      {o:208,c:215,h:207,l:217,bull:true},
      {o:217,c:218,h:216,l:220,bull:true},
      {o:220,c:211,h:221,l:209,bull:false},
      {o:211,c:204,h:212,l:202,bull:false},
      {o:204,c:198,h:205,l:196,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Bullish', color:TEAL},
      {type:'label', candleIdx:4, offset:-20, text:'Star', color:GOLD},
      {type:'label', candleIdx:5, offset:-18, text:'Bearish', color:RED},
      {type:'bracket', start:3, end:5, label:'Evening Star'},
    ]
  },
  {
    id: 24, name: "Evening Doji Star", level: "Intermediate",
    category: "Multi Candle", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Like the evening star but the middle candle is a doji. Stronger signal — perfect indecision at the top before sellers take control.",
    entry: "Below the close of the third candle",
    stop: "Above the high of the doji",
    target: "Previous swing low",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      // Evening doji star
      {o:208,c:214,h:207,l:216,bull:true},
      {o:216,c:216,h:215,l:219,bull:true},
      {o:218,c:209,h:219,l:207,bull:false},
      {o:209,c:203,h:210,l:201,bull:false},
      {o:203,c:197,h:204,l:195,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Bullish', color:TEAL},
      {type:'label', candleIdx:4, offset:-22, text:'Doji', color:GOLD},
      {type:'label', candleIdx:5, offset:-18, text:'Bearish', color:RED},
      {type:'bracket', start:3, end:5, label:'Evening Doji Star'},
    ]
  },
  {
    id: 25, name: "Three Black Crows", level: "Beginner",
    category: "Multi Candle", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Three consecutive large bearish candles, each opening within the previous body and closing lower. Mirror of Three White Soldiers. Strong bearish reversal.",
    entry: "Open of candle after the third crow",
    stop: "Above the high of the first crow",
    target: "Measured move equal to the three-candle range below",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      {o:208,c:214,h:207,l:216,bull:true},
      // Three black crows
      {o:214,c:208,h:215,l:206,bull:false},
      {o:209,c:202,h:210,l:200,bull:false},
      {o:203,c:195,h:204,l:193,bull:false},
      {o:195,c:190,h:196,l:188,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Crow 1', color:RED},
      {type:'label', candleIdx:5, offset:-18, text:'Crow 2', color:RED},
      {type:'label', candleIdx:6, offset:-18, text:'Crow 3', color:RED},
    ]
  },
  {
    id: 26, name: "Bearish Harami", level: "Beginner",
    category: "Multi Candle", signal: "Bearish Reversal",
    signalColor: RED,
    description: "A small bearish candle completely contained within the body of the previous large bullish candle. Signals upward momentum is slowing. Watch for confirmation.",
    entry: "Below the low of the small bearish candle",
    stop: "Above the high of the large bullish candle",
    target: "Previous swing low",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      // Harami
      {o:208,c:216,h:207,l:218,bull:true},
      {o:215,c:212,h:216,l:211,bull:false},
      // Continuation
      {o:212,c:206,h:213,l:204,bull:false},
      {o:206,c:200,h:207,l:198,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Large Bullish', color:TEAL},
      {type:'label', candleIdx:4, offset:-18, text:'Small Inside', color:RED},
      {type:'bracket', start:3, end:4, label:'Harami'},
    ]
  },
  {
    id: 27, name: "Tweezer Top", level: "Intermediate",
    category: "Multi Candle", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Two candles with identical or very similar highs — one bullish, one bearish. Price tested a resistance level twice and sellers defended it both times.",
    entry: "Below the low of the second candle",
    stop: "Above the shared high",
    target: "Previous swing low",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      // Tweezer top
      {o:208,c:214,h:207,l:218,bull:true},
      {o:217,c:211,h:218,l:209,bull:false},
      {o:211,c:205,h:212,l:203,bull:false},
      {o:205,c:199,h:206,l:197,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-22, text:'Same High', color:GOLD},
      {type:'label', candleIdx:4, offset:-22, text:'Same High', color:GOLD},
      {type:'hline', candleIdx:3, label:'Resistance'},
    ]
  },
  {
    id: 28, name: "Abandoned Baby Top", level: "Advanced",
    category: "Multi Candle", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Rare three-candle pattern: bullish candle, then a doji that gaps above it, then a bearish candle that gaps below the doji. Very high accuracy top reversal.",
    entry: "Below the close of the third candle",
    stop: "Above the high of the doji",
    target: "Previous swing low — full reversal expected",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      // Abandoned baby top
      {o:208,c:215,h:207,l:217,bull:true},
      {o:218,c:218,h:217,l:220,bull:true},
      {o:216,c:208,h:217,l:206,bull:false},
      {o:208,c:201,h:209,l:199,bull:false},
      {o:201,c:195,h:202,l:193,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Bullish', color:TEAL},
      {type:'label', candleIdx:4, offset:-22, text:'Gap Doji', color:GOLD},
      {type:'label', candleIdx:5, offset:-18, text:'Gap Down', color:RED},
    ]
  },
];

// ─────────────────────────────────────────────
// BATCH 2 — Patterns 29-84
// ─────────────────────────────────────────────
const BATCH2 = [
  // ── LEVEL III: Bullish Continuation ──
  {
    id: 29, name: "Bull Flag", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A strong bullish impulse (the flagpole) followed by a tight downward consolidation (the flag). Signals the trend is pausing before continuing higher.",
    entry: "Break above the upper flag trendline",
    stop: "Below the lower flag trendline",
    target: "Flagpole length added to breakout point",
    candles: [
      {o:185,c:188,h:184,l:190,bull:true},
      {o:188,c:192,h:187,l:194,bull:true},
      // Flagpole
      {o:192,c:200,h:191,l:202,bull:true},
      {o:200,c:210,h:199,l:212,bull:true},
      {o:210,c:220,h:209,l:222,bull:true},
      // Flag consolidation
      {o:220,c:217,h:221,l:216,bull:false},
      {o:217,c:214,h:218,l:213,bull:false},
      {o:214,c:216,h:213,l:217,bull:true},
      {o:216,c:213,h:217,l:212,bull:false},
      {o:213,c:215,h:212,l:216,bull:true},
      // Breakout
      {o:215,c:222,h:214,l:224,bull:true},
      {o:222,c:230,h:221,l:232,bull:true},
      {o:230,c:236,h:229,l:238,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Flagpole', color:TEAL},
      {type:'label', candleIdx:7, offset:-18, text:'Flag', color:GOLD},
      {type:'label', candleIdx:11, offset:-18, text:'Breakout', color:TEAL},
    ]
  },
  {
    id: 30, name: "Bull Pennant", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "Like a bull flag but the consolidation forms a symmetrical triangle (pennant) instead of a channel. Signals a brief pause before the trend resumes higher.",
    entry: "Break above the upper pennant trendline",
    stop: "Below the lower pennant trendline",
    target: "Flagpole length added to breakout point",
    candles: [
      {o:185,c:190,h:184,l:192,bull:true},
      {o:190,c:198,h:189,l:200,bull:true},
      // Flagpole
      {o:198,c:208,h:197,l:210,bull:true},
      {o:208,c:218,h:207,l:220,bull:true},
      // Pennant
      {o:218,c:214,h:219,l:213,bull:false},
      {o:214,c:217,h:213,l:218,bull:true},
      {o:217,c:214,h:217,l:215,bull:false},
      {o:214,c:216,h:214,l:217,bull:true},
      {o:216,c:215,h:216,l:216,bull:false},
      // Breakout
      {o:215,c:224,h:214,l:226,bull:true},
      {o:224,c:232,h:223,l:234,bull:true},
      {o:232,c:238,h:231,l:240,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Flagpole', color:TEAL},
      {type:'label', candleIdx:6, offset:-18, text:'Pennant', color:GOLD},
      {type:'label', candleIdx:10, offset:-18, text:'Breakout', color:TEAL},
    ]
  },
  {
    id: 31, name: "Ascending Triangle", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "Flat resistance at the top with rising lows forming an ascending trendline below. Buyers are getting more aggressive each swing. Breakout above resistance expected.",
    entry: "Break above the flat resistance level",
    stop: "Below the most recent higher low",
    target: "Height of the triangle added to breakout",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:206,h:201,l:207,bull:true},
      // Resistance test 1
      {o:206,c:210,h:205,l:210,bull:true},
      {o:210,c:205,h:210,l:204,bull:false},
      {o:205,c:200,h:206,l:199,bull:false},
      // Higher low
      {o:200,c:205,h:199,l:206,bull:true},
      // Resistance test 2
      {o:205,c:210,h:204,l:210,bull:true},
      {o:210,c:206,h:210,l:205,bull:false},
      // Higher low 2
      {o:206,c:209,h:205,l:210,bull:true},
      // Breakout
      {o:209,c:216,h:208,l:218,bull:true},
      {o:216,c:222,h:215,l:224,bull:true},
      {o:222,c:228,h:221,l:230,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Resistance', color:RED},
      {type:'label', candleIdx:7, offset:-18, text:'Resistance', color:RED},
      {type:'label', candleIdx:10, offset:-18, text:'Breakout', color:TEAL},
      {type:'hline', candleIdx:3, label:'Flat Top'},
    ]
  },
  {
    id: 32, name: "Cup and Handle", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A rounded bottom (cup) followed by a small downward consolidation (handle). One of the most reliable bullish continuation patterns for swing trades.",
    entry: "Break above the handle's upper trendline",
    stop: "Below the handle's low",
    target: "Cup depth added to breakout point",
    candles: [
      {o:215,c:212,h:216,l:211,bull:false},
      {o:212,c:207,h:213,l:206,bull:false},
      // Cup bottom
      {o:207,c:203,h:208,l:202,bull:false},
      {o:203,c:200,h:204,l:199,bull:false},
      {o:200,c:202,h:199,l:203,bull:true},
      {o:202,c:205,h:201,l:206,bull:true},
      {o:205,c:208,h:204,l:209,bull:true},
      {o:208,c:212,h:207,l:213,bull:true},
      {o:212,c:215,h:211,l:216,bull:true},
      // Handle
      {o:215,c:212,h:216,l:211,bull:false},
      {o:212,c:210,h:213,l:209,bull:false},
      {o:210,c:212,h:209,l:213,bull:true},
      // Breakout
      {o:212,c:219,h:211,l:221,bull:true},
      {o:219,c:225,h:218,l:227,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-20, text:'Cup', color:GOLD},
      {type:'label', candleIdx:10, offset:-18, text:'Handle', color:GOLD},
      {type:'label', candleIdx:12, offset:-18, text:'Breakout', color:TEAL},
    ]
  },
  {
    id: 33, name: "Rectangle Breakout", level: "Beginner",
    category: "Chart Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "Price consolidates between two horizontal levels (support and resistance) forming a rectangle. A breakout above resistance signals continuation of the prior uptrend.",
    entry: "Close above the rectangle's upper resistance",
    stop: "Below the rectangle's lower support",
    target: "Rectangle height added to breakout point",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      // Rectangle top
      {o:202,c:208,h:201,l:209,bull:true},
      {o:208,c:204,h:209,l:203,bull:false},
      {o:204,c:198,h:205,l:197,bull:false},
      // Rectangle bottom
      {o:198,c:202,h:197,l:203,bull:true},
      {o:202,c:208,h:201,l:209,bull:true},
      {o:208,c:203,h:209,l:202,bull:false},
      {o:203,c:198,h:204,l:197,bull:false},
      {o:198,c:203,h:197,l:204,bull:true},
      // Breakout
      {o:203,c:212,h:202,l:214,bull:true},
      {o:212,c:220,h:211,l:222,bull:true},
      {o:220,c:226,h:219,l:228,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-18, text:'Resistance', color:RED},
      {type:'label', candleIdx:4, offset:-18, text:'Support', color:TEAL},
      {type:'label', candleIdx:10, offset:-18, text:'Breakout', color:TEAL},
    ]
  },
  {
    id: 34, name: "Rising Channel", level: "Beginner",
    category: "Chart Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "Price moves higher within two parallel upward-sloping trendlines. Buy near the lower channel line, take profits near the upper channel line.",
    entry: "Bounce off the lower channel trendline",
    stop: "Below the lower channel line",
    target: "Upper channel trendline",
    candles: [
      {o:190,c:194,h:189,l:196,bull:true},
      {o:194,c:198,h:193,l:200,bull:true},
      {o:198,c:202,h:197,l:204,bull:true},
      {o:202,c:206,h:201,l:208,bull:true},
      {o:206,c:203,h:207,l:202,bull:false},
      {o:203,c:207,h:202,l:209,bull:true},
      {o:207,c:211,h:206,l:213,bull:true},
      {o:211,c:215,h:210,l:217,bull:true},
      {o:215,c:212,h:216,l:211,bull:false},
      {o:212,c:216,h:211,l:218,bull:true},
      {o:216,c:220,h:215,l:222,bull:true},
      {o:220,c:224,h:219,l:226,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Buy zone', color:TEAL},
      {type:'label', candleIdx:7, offset:-18, text:'Target', color:GOLD},
    ]
  },

  // ── LEVEL III: Bearish Continuation ──
  {
    id: 35, name: "Bear Flag", level: "Intermediate",
    category: "Chart Pattern", signal: "Bearish Continuation",
    signalColor: RED,
    description: "A strong bearish impulse (flagpole) followed by a tight upward consolidation (flag). Signals the downtrend is pausing before continuing lower.",
    entry: "Break below the lower flag trendline",
    stop: "Above the upper flag trendline",
    target: "Flagpole length subtracted from breakdown point",
    candles: [
      {o:220,c:216,h:221,l:215,bull:false},
      {o:216,c:210,h:217,l:209,bull:false},
      // Flagpole
      {o:210,c:200,h:211,l:199,bull:false},
      {o:200,c:190,h:201,l:189,bull:false},
      // Flag consolidation
      {o:190,c:193,h:189,l:194,bull:true},
      {o:193,c:196,h:192,l:197,bull:true},
      {o:196,c:193,h:197,l:192,bull:false},
      {o:193,c:195,h:192,l:196,bull:true},
      {o:195,c:193,h:196,l:192,bull:false},
      // Breakdown
      {o:193,c:185,h:194,l:184,bull:false},
      {o:185,c:177,h:186,l:176,bull:false},
      {o:177,c:171,h:178,l:170,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Flagpole', color:RED},
      {type:'label', candleIdx:6, offset:-18, text:'Flag', color:GOLD},
      {type:'label', candleIdx:10, offset:-18, text:'Breakdown', color:RED},
    ]
  },
  {
    id: 36, name: "Bear Pennant", level: "Intermediate",
    category: "Chart Pattern", signal: "Bearish Continuation",
    signalColor: RED,
    description: "Like a bear flag but the consolidation forms a converging triangle. Signals a brief pause in a downtrend before continuation lower.",
    entry: "Break below the lower pennant trendline",
    stop: "Above the upper pennant trendline",
    target: "Flagpole length subtracted from breakdown point",
    candles: [
      {o:220,c:215,h:221,l:214,bull:false},
      {o:215,c:208,h:216,l:207,bull:false},
      // Flagpole
      {o:208,c:198,h:209,l:197,bull:false},
      // Pennant
      {o:198,c:202,h:197,l:203,bull:true},
      {o:202,c:199,h:203,l:198,bull:false},
      {o:199,c:201,h:198,l:202,bull:true},
      {o:201,c:199,h:201,l:200,bull:false},
      {o:199,c:200,h:199,l:201,bull:true},
      // Breakdown
      {o:200,c:192,h:201,l:191,bull:false},
      {o:192,c:184,h:193,l:183,bull:false},
      {o:184,c:178,h:185,l:177,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-18, text:'Flagpole', color:RED},
      {type:'label', candleIdx:5, offset:-18, text:'Pennant', color:GOLD},
      {type:'label', candleIdx:9, offset:-18, text:'Breakdown', color:RED},
    ]
  },
  {
    id: 37, name: "Descending Triangle", level: "Intermediate",
    category: "Chart Pattern", signal: "Bearish Continuation",
    signalColor: RED,
    description: "Flat support at the bottom with lower highs forming a descending trendline. Sellers are getting more aggressive. Breakdown below support expected.",
    entry: "Break below the flat support level",
    stop: "Above the most recent lower high",
    target: "Triangle height subtracted from breakdown",
    candles: [
      {o:215,c:210,h:216,l:209,bull:false},
      {o:210,c:205,h:211,l:204,bull:false},
      // Support test 1
      {o:205,c:200,h:206,l:200,bull:false},
      {o:200,c:205,h:199,l:206,bull:true},
      // Lower high
      {o:205,c:208,h:204,l:209,bull:true},
      {o:208,c:204,h:209,l:203,bull:false},
      // Support test 2
      {o:204,c:200,h:205,l:200,bull:false},
      {o:200,c:204,h:199,l:205,bull:true},
      // Lower high 2
      {o:204,c:206,h:203,l:207,bull:true},
      {o:206,c:200,h:207,l:200,bull:false},
      // Breakdown
      {o:200,c:193,h:201,l:192,bull:false},
      {o:193,c:186,h:194,l:185,bull:false},
      {o:186,c:180,h:187,l:179,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-18, text:'Support', color:TEAL},
      {type:'label', candleIdx:6, offset:-18, text:'Support', color:TEAL},
      {type:'label', candleIdx:10, offset:-18, text:'Breakdown', color:RED},
    ]
  },
  {
    id: 38, name: "Rectangle Breakdown", level: "Beginner",
    category: "Chart Pattern", signal: "Bearish Continuation",
    signalColor: RED,
    description: "Price consolidates in a rectangle after a downtrend. A break below support signals the downtrend is resuming. Mirror of the rectangle breakout.",
    entry: "Close below the rectangle's lower support",
    stop: "Above the rectangle's upper resistance",
    target: "Rectangle height subtracted from breakdown",
    candles: [
      {o:220,c:214,h:221,l:213,bull:false},
      {o:214,c:208,h:215,l:207,bull:false},
      // Rectangle
      {o:208,c:202,h:209,l:201,bull:false},
      {o:202,c:208,h:201,l:209,bull:true},
      {o:208,c:202,h:209,l:201,bull:false},
      {o:202,c:207,h:201,l:208,bull:true},
      {o:207,c:202,h:208,l:201,bull:false},
      {o:202,c:207,h:201,l:208,bull:true},
      {o:207,c:201,h:208,l:200,bull:false},
      // Breakdown
      {o:201,c:193,h:202,l:192,bull:false},
      {o:193,c:185,h:194,l:184,bull:false},
      {o:185,c:179,h:186,l:178,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-18, text:'Resistance', color:RED},
      {type:'label', candleIdx:3, offset:-18, text:'Support', color:TEAL},
      {type:'label', candleIdx:9, offset:-18, text:'Breakdown', color:RED},
    ]
  },
  {
    id: 39, name: "Falling Channel", level: "Beginner",
    category: "Chart Pattern", signal: "Bearish Continuation",
    signalColor: RED,
    description: "Price moves lower within two parallel downward-sloping trendlines. Sell near the upper channel line, take profits near the lower channel line.",
    entry: "Rejection from the upper channel trendline",
    stop: "Above the upper channel line",
    target: "Lower channel trendline",
    candles: [
      {o:220,c:216,h:221,l:215,bull:false},
      {o:216,c:212,h:217,l:211,bull:false},
      {o:212,c:208,h:213,l:207,bull:false},
      {o:208,c:211,h:207,l:212,bull:true},
      {o:211,c:207,h:212,l:206,bull:false},
      {o:207,c:203,h:208,l:202,bull:false},
      {o:203,c:206,h:202,l:207,bull:true},
      {o:206,c:202,h:207,l:201,bull:false},
      {o:202,c:198,h:203,l:197,bull:false},
      {o:198,c:201,h:197,l:202,bull:true},
      {o:201,c:197,h:202,l:196,bull:false},
      {o:197,c:193,h:198,l:192,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Sell zone', color:RED},
      {type:'label', candleIdx:8, offset:-18, text:'Target', color:GOLD},
    ]
  },

  // ── Reversal Chart Patterns: Bullish ──
  {
    id: 40, name: "Double Bottom", level: "Beginner",
    category: "Chart Pattern", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Two lows at approximately the same price level separated by a rally. Classic W-shape. Break above the middle peak (neckline) confirms the reversal.",
    entry: "Break above the neckline (middle peak)",
    stop: "Below the second bottom",
    target: "Distance from bottom to neckline, added to breakout",
    candles: [
      {o:215,c:210,h:216,l:209,bull:false},
      {o:210,c:204,h:211,l:203,bull:false},
      // First bottom
      {o:204,c:198,h:205,l:197,bull:false},
      {o:198,c:194,h:199,l:193,bull:false},
      {o:194,c:199,h:193,l:200,bull:true},
      // Rally to neckline
      {o:199,c:206,h:198,l:207,bull:true},
      {o:206,c:210,h:205,l:211,bull:true},
      // Second bottom
      {o:210,c:204,h:211,l:203,bull:false},
      {o:204,c:198,h:205,l:197,bull:false},
      {o:198,c:195,h:199,l:194,bull:false},
      {o:195,c:200,h:194,l:201,bull:true},
      // Breakout
      {o:200,c:208,h:199,l:210,bull:true},
      {o:208,c:216,h:207,l:218,bull:true},
      {o:216,c:222,h:215,l:224,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-22, text:'Bottom 1', color:TEAL},
      {type:'label', candleIdx:9, offset:-22, text:'Bottom 2', color:TEAL},
      {type:'label', candleIdx:6, offset:-18, text:'Neckline', color:GOLD},
      {type:'label', candleIdx:12, offset:-18, text:'Breakout', color:TEAL},
    ]
  },
  {
    id: 41, name: "Triple Bottom", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Three lows at approximately the same level. Even stronger than a double bottom — price tested support three times and buyers defended it each time.",
    entry: "Break above the resistance connecting the two peaks",
    stop: "Below the third bottom",
    target: "Distance from bottom to resistance, added to breakout",
    candles: [
      {o:214,c:208,h:215,l:207,bull:false},
      // Bottom 1
      {o:208,c:202,h:209,l:201,bull:false},
      {o:202,c:198,h:203,l:197,bull:false},
      {o:198,c:203,h:197,l:204,bull:true},
      {o:203,c:208,h:202,l:209,bull:true},
      // Bottom 2
      {o:208,c:202,h:209,l:201,bull:false},
      {o:202,c:198,h:203,l:197,bull:false},
      {o:198,c:204,h:197,l:205,bull:true},
      {o:204,c:209,h:203,l:210,bull:true},
      // Bottom 3
      {o:209,c:202,h:210,l:201,bull:false},
      {o:202,c:198,h:203,l:197,bull:false},
      {o:198,c:205,h:197,l:206,bull:true},
      // Breakout
      {o:205,c:213,h:204,l:215,bull:true},
      {o:213,c:220,h:212,l:222,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-22, text:'Bot 1', color:TEAL},
      {type:'label', candleIdx:6, offset:-22, text:'Bot 2', color:TEAL},
      {type:'label', candleIdx:10, offset:-22, text:'Bot 3', color:TEAL},
      {type:'label', candleIdx:12, offset:-18, text:'Breakout', color:TEAL},
    ]
  },
  {
    id: 42, name: "Inverse Head & Shoulders", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "An upside-down head and shoulders: left shoulder, deeper head, right shoulder at same level as left. Neckline break signals a major bullish reversal.",
    entry: "Break above the neckline",
    stop: "Below the right shoulder low",
    target: "Distance from head to neckline, added to breakout",
    candles: [
      {o:215,c:210,h:216,l:209,bull:false},
      {o:210,c:205,h:211,l:204,bull:false},
      // Left shoulder bottom
      {o:205,c:200,h:206,l:199,bull:false},
      {o:200,c:204,h:199,l:205,bull:true},
      {o:204,c:208,h:203,l:209,bull:true},
      // Head bottom (deeper)
      {o:208,c:202,h:209,l:201,bull:false},
      {o:202,c:195,h:203,l:194,bull:false},
      {o:195,c:200,h:194,l:201,bull:true},
      {o:200,c:207,h:199,l:208,bull:true},
      // Right shoulder bottom
      {o:207,c:202,h:208,l:201,bull:false},
      {o:202,c:198,h:203,l:197,bull:false},
      {o:198,c:204,h:197,l:205,bull:true},
      // Neckline breakout
      {o:204,c:212,h:203,l:214,bull:true},
      {o:212,c:220,h:211,l:222,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-22, text:'L Shoulder', color:GOLD},
      {type:'label', candleIdx:6, offset:-25, text:'Head', color:GOLD},
      {type:'label', candleIdx:10, offset:-22, text:'R Shoulder', color:GOLD},
      {type:'label', candleIdx:12, offset:-18, text:'Breakout', color:TEAL},
    ]
  },
  {
    id: 43, name: "Rounded Bottom", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "A gradual, curved bottoming pattern. Selling pressure slowly exhausts and buying gradually takes over. Signals a major long-term reversal is underway.",
    entry: "Break above the resistance at the start of the curve",
    stop: "Below the lowest point of the rounded bottom",
    target: "Depth of the bowl added to breakout point",
    candles: [
      {o:215,c:211,h:216,l:210,bull:false},
      {o:211,c:207,h:212,l:206,bull:false},
      {o:207,c:204,h:208,l:203,bull:false},
      {o:204,c:202,h:205,l:201,bull:false},
      {o:202,c:200,h:203,l:199,bull:false},
      {o:200,c:201,h:199,l:202,bull:true},
      {o:201,c:203,h:200,l:204,bull:true},
      {o:203,c:206,h:202,l:207,bull:true},
      {o:206,c:209,h:205,l:210,bull:true},
      {o:209,c:213,h:208,l:214,bull:true},
      {o:213,c:216,h:212,l:217,bull:true},
      // Breakout
      {o:216,c:222,h:215,l:224,bull:true},
      {o:222,c:228,h:221,l:230,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-22, text:'Bowl', color:GOLD},
      {type:'label', candleIdx:11, offset:-18, text:'Breakout', color:TEAL},
    ]
  },
  {
    id: 44, name: "Falling Wedge", level: "Intermediate",
    category: "Chart Pattern", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Two downward-sloping converging trendlines with lower highs and lower lows. Despite the downtrend appearance, a break above the upper trendline signals a bullish reversal.",
    entry: "Break above the upper falling trendline",
    stop: "Below the most recent low within the wedge",
    target: "Height of the wedge added to breakout point",
    candles: [
      {o:220,c:215,h:221,l:214,bull:false},
      {o:215,c:210,h:216,l:209,bull:false},
      {o:210,c:212,h:209,l:213,bull:true},
      {o:212,c:207,h:213,l:206,bull:false},
      {o:207,c:203,h:208,l:202,bull:false},
      {o:203,c:205,h:202,l:206,bull:true},
      {o:205,c:201,h:206,l:200,bull:false},
      {o:201,c:199,h:202,l:198,bull:false},
      {o:199,c:201,h:198,l:202,bull:true},
      {o:201,c:199,h:202,l:198,bull:false},
      // Breakout
      {o:199,c:207,h:198,l:209,bull:true},
      {o:207,c:215,h:206,l:217,bull:true},
      {o:215,c:221,h:214,l:223,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Falling Wedge', color:GOLD},
      {type:'label', candleIdx:10, offset:-18, text:'Breakout', color:TEAL},
    ]
  },
  {
    id: 45, name: "Adam & Eve Bottom", level: "Advanced",
    category: "Chart Pattern", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "A sharp V-shaped bottom (Adam) followed by a wider, rounded bottom (Eve) at a similar level. The combination signals strong institutional buying interest.",
    entry: "Break above the neckline connecting the peaks between Adam and Eve",
    stop: "Below the lower of the two bottoms",
    target: "Depth of the pattern added to breakout",
    candles: [
      {o:214,c:208,h:215,l:207,bull:false},
      {o:208,c:201,h:209,l:200,bull:false},
      // Adam - sharp V
      {o:201,c:195,h:202,l:194,bull:false},
      {o:195,c:201,h:194,l:202,bull:true},
      {o:201,c:208,h:200,l:209,bull:true},
      // Rally between
      {o:208,c:212,h:207,l:213,bull:true},
      // Eve - rounded
      {o:212,c:207,h:213,l:206,bull:false},
      {o:207,c:203,h:208,l:202,bull:false},
      {o:203,c:201,h:204,l:200,bull:false},
      {o:201,c:204,h:200,l:205,bull:true},
      {o:204,c:208,h:203,l:209,bull:true},
      // Breakout
      {o:208,c:216,h:207,l:218,bull:true},
      {o:216,c:223,h:215,l:225,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-22, text:'Adam', color:GOLD},
      {type:'label', candleIdx:8, offset:-22, text:'Eve', color:GOLD},
      {type:'label', candleIdx:11, offset:-18, text:'Breakout', color:TEAL},
    ]
  },

  // ── Reversal Chart Patterns: Bearish ──
  {
    id: 46, name: "Double Top", level: "Beginner",
    category: "Chart Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Two highs at approximately the same price level separated by a pullback. Classic M-shape. Break below the middle low (neckline) confirms the reversal.",
    entry: "Break below the neckline (middle low)",
    stop: "Above the second top",
    target: "Distance from top to neckline, subtracted from breakdown",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      // First top
      {o:202,c:208,h:201,l:210,bull:true},
      {o:208,c:212,h:207,l:213,bull:true},
      {o:212,c:207,h:213,l:206,bull:false},
      // Pullback to neckline
      {o:207,c:202,h:208,l:201,bull:false},
      {o:202,c:206,h:201,l:207,bull:true},
      // Second top
      {o:206,c:212,h:205,l:213,bull:true},
      {o:212,c:207,h:213,l:206,bull:false},
      {o:207,c:202,h:208,l:201,bull:false},
      // Breakdown
      {o:202,c:194,h:203,l:193,bull:false},
      {o:194,c:186,h:195,l:185,bull:false},
      {o:186,c:180,h:187,l:179,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Top 1', color:RED},
      {type:'label', candleIdx:7, offset:-18, text:'Top 2', color:RED},
      {type:'label', candleIdx:5, offset:-18, text:'Neckline', color:GOLD},
      {type:'label', candleIdx:10, offset:-18, text:'Breakdown', color:RED},
    ]
  },
  {
    id: 47, name: "Triple Top", level: "Intermediate",
    category: "Chart Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Three highs at approximately the same level. Even stronger than a double top — price tested resistance three times and sellers defended it each time.",
    entry: "Break below the support connecting the two lows",
    stop: "Above the third top",
    target: "Distance from top to support, subtracted from breakdown",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      // Top 1
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:208,bull:true},
      {o:208,c:202,h:208,l:201,bull:false},
      {o:202,c:198,h:203,l:197,bull:false},
      // Top 2
      {o:198,c:204,h:197,l:205,bull:true},
      {o:204,c:208,h:203,l:208,bull:true},
      {o:208,c:202,h:208,l:201,bull:false},
      {o:202,c:197,h:203,l:196,bull:false},
      // Top 3
      {o:197,c:203,h:196,l:204,bull:true},
      {o:203,c:208,h:202,l:208,bull:true},
      {o:208,c:201,h:208,l:200,bull:false},
      // Breakdown
      {o:201,c:193,h:202,l:192,bull:false},
      {o:193,c:186,h:194,l:185,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-18, text:'Top 1', color:RED},
      {type:'label', candleIdx:6, offset:-18, text:'Top 2', color:RED},
      {type:'label', candleIdx:10, offset:-18, text:'Top 3', color:RED},
      {type:'label', candleIdx:12, offset:-18, text:'Breakdown', color:RED},
    ]
  },
  {
    id: 48, name: "Head & Shoulders", level: "Beginner",
    category: "Chart Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Left shoulder, higher head, right shoulder at same level as left — all above the neckline. Break below neckline signals a major bearish reversal.",
    entry: "Break below the neckline",
    stop: "Above the right shoulder high",
    target: "Distance from head to neckline, subtracted from breakdown",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      // Left shoulder
      {o:202,c:208,h:201,l:210,bull:true},
      {o:208,c:204,h:209,l:203,bull:false},
      {o:204,c:207,h:203,l:208,bull:true},
      // Head
      {o:207,c:214,h:206,l:216,bull:true},
      {o:214,c:208,h:215,l:207,bull:false},
      {o:208,c:206,h:209,l:205,bull:false},
      // Right shoulder
      {o:206,c:210,h:205,l:211,bull:true},
      {o:210,c:206,h:211,l:205,bull:false},
      {o:206,c:202,h:207,l:201,bull:false},
      // Breakdown
      {o:202,c:194,h:203,l:193,bull:false},
      {o:194,c:186,h:195,l:185,bull:false},
      {o:186,c:180,h:187,l:179,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-18, text:'L Shoulder', color:GOLD},
      {type:'label', candleIdx:5, offset:-18, text:'Head', color:GOLD},
      {type:'label', candleIdx:8, offset:-18, text:'R Shoulder', color:GOLD},
      {type:'label', candleIdx:11, offset:-18, text:'Breakdown', color:RED},
    ]
  },
  {
    id: 49, name: "Rounded Top", level: "Intermediate",
    category: "Chart Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "A gradual, curved topping pattern. Buying pressure slowly exhausts and selling gradually takes over. Signals a major long-term bearish reversal.",
    entry: "Break below the support at the start of the curve",
    stop: "Above the highest point of the rounded top",
    target: "Height of the dome subtracted from breakdown",
    candles: [
      {o:195,c:199,h:194,l:200,bull:true},
      {o:199,c:203,h:198,l:204,bull:true},
      {o:203,c:206,h:202,l:207,bull:true},
      {o:206,c:208,h:205,l:209,bull:true},
      {o:208,c:210,h:207,l:211,bull:true},
      {o:210,c:209,h:211,l:210,bull:false},
      {o:209,c:207,h:210,l:208,bull:false},
      {o:207,c:204,h:208,l:205,bull:false},
      {o:204,c:201,h:205,l:202,bull:false},
      {o:201,c:198,h:202,l:199,bull:false},
      {o:198,c:195,h:199,l:196,bull:false},
      // Breakdown
      {o:195,c:188,h:196,l:187,bull:false},
      {o:188,c:182,h:189,l:181,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Dome Top', color:GOLD},
      {type:'label', candleIdx:11, offset:-18, text:'Breakdown', color:RED},
    ]
  },
  {
    id: 50, name: "Rising Wedge", level: "Intermediate",
    category: "Chart Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Two upward-sloping converging trendlines with higher highs and higher lows. Despite the uptrend appearance, a break below the lower trendline signals a bearish reversal.",
    entry: "Break below the lower rising trendline",
    stop: "Above the most recent high within the wedge",
    target: "Height of the wedge subtracted from breakdown",
    candles: [
      {o:190,c:194,h:189,l:195,bull:true},
      {o:194,c:198,h:193,l:199,bull:true},
      {o:198,c:196,h:199,l:197,bull:false},
      {o:196,c:200,h:195,l:201,bull:true},
      {o:200,c:204,h:199,l:205,bull:true},
      {o:204,c:202,h:205,l:203,bull:false},
      {o:202,c:205,h:201,l:206,bull:true},
      {o:205,c:207,h:204,l:208,bull:true},
      {o:207,c:205,h:208,l:206,bull:false},
      {o:205,c:206,h:204,l:207,bull:true},
      // Breakdown
      {o:206,c:198,h:207,l:197,bull:false},
      {o:198,c:190,h:199,l:189,bull:false},
      {o:190,c:184,h:191,l:183,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:5, offset:-18, text:'Rising Wedge', color:GOLD},
      {type:'label', candleIdx:10, offset:-18, text:'Breakdown', color:RED},
    ]
  },
  {
    id: 51, name: "Adam & Eve Top", level: "Advanced",
    category: "Chart Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "A sharp spike top (Adam) followed by a wider, rounded top (Eve) at a similar level. The combination signals strong institutional selling and a major top.",
    entry: "Break below the neckline connecting the lows between Adam and Eve",
    stop: "Above the higher of the two tops",
    target: "Depth of the pattern subtracted from breakdown",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      // Adam - sharp spike
      {o:202,c:208,h:201,l:210,bull:true},
      {o:208,c:214,h:207,l:215,bull:true},
      {o:214,c:208,h:215,l:207,bull:false},
      {o:208,c:202,h:209,l:201,bull:false},
      // Between
      {o:202,c:205,h:201,l:206,bull:true},
      // Eve - rounded top
      {o:205,c:209,h:204,l:210,bull:true},
      {o:209,c:212,h:208,l:213,bull:true},
      {o:212,c:210,h:213,l:211,bull:false},
      {o:210,c:207,h:211,l:208,bull:false},
      {o:207,c:203,h:208,l:204,bull:false},
      // Breakdown
      {o:203,c:195,h:204,l:194,bull:false},
      {o:195,c:188,h:196,l:187,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Adam', color:GOLD},
      {type:'label', candleIdx:8, offset:-18, text:'Eve', color:GOLD},
      {type:'label', candleIdx:12, offset:-18, text:'Breakdown', color:RED},
    ]
  },

  // ── Market Structure ──
  {
    id: 52, name: "Higher High", level: "Beginner",
    category: "Market Structure", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "Each successive peak is higher than the previous peak. The fundamental definition of an uptrend. As long as higher highs are forming, the trend is intact.",
    entry: "On pullbacks to higher lows within the structure",
    stop: "Below the most recent higher low",
    target: "Next measured move based on swing size",
    candles: [
      {o:190,c:194,h:189,l:196,bull:true},
      {o:194,c:198,h:193,l:200,bull:true},
      {o:198,c:195,h:199,l:194,bull:false},
      {o:195,c:200,h:194,l:202,bull:true},
      // HH 1
      {o:200,c:206,h:199,l:208,bull:true},
      {o:206,c:202,h:207,l:201,bull:false},
      {o:202,c:198,h:203,l:197,bull:false},
      {o:198,c:204,h:197,l:206,bull:true},
      // HH 2 (higher)
      {o:204,c:212,h:203,l:214,bull:true},
      {o:212,c:208,h:213,l:207,bull:false},
      {o:208,c:204,h:209,l:203,bull:false},
      {o:204,c:211,h:203,l:213,bull:true},
      // HH 3 (higher still)
      {o:211,c:219,h:210,l:221,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'HH 1', color:TEAL},
      {type:'label', candleIdx:8, offset:-18, text:'HH 2', color:TEAL},
      {type:'label', candleIdx:12, offset:-18, text:'HH 3', color:TEAL},
    ]
  },
  {
    id: 53, name: "Higher Low", level: "Beginner",
    category: "Market Structure", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "Each successive pullback low is higher than the previous low. Along with higher highs, this defines an uptrend. The entry point for trend traders.",
    entry: "At or near the higher low formation",
    stop: "Below the higher low",
    target: "Previous higher high and beyond",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:198,h:203,l:197,bull:false},
      // HL 1
      {o:198,c:197,h:199,l:196,bull:false},
      {o:197,c:203,h:196,l:205,bull:true},
      {o:203,c:209,h:202,l:211,bull:true},
      {o:209,c:204,h:210,l:203,bull:false},
      // HL 2 (higher)
      {o:204,c:203,h:205,l:202,bull:false},
      {o:203,c:210,h:202,l:212,bull:true},
      {o:210,c:216,h:209,l:218,bull:true},
      {o:216,c:211,h:217,l:210,bull:false},
      // HL 3 (higher still)
      {o:211,c:210,h:212,l:209,bull:false},
      {o:210,c:218,h:209,l:220,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-22, text:'HL 1', color:TEAL},
      {type:'label', candleIdx:7, offset:-22, text:'HL 2', color:TEAL},
      {type:'label', candleIdx:11, offset:-22, text:'HL 3', color:TEAL},
    ]
  },
  {
    id: 54, name: "Lower High", level: "Beginner",
    category: "Market Structure", signal: "Bearish Continuation",
    signalColor: RED,
    description: "Each successive peak is lower than the previous peak. Along with lower lows, this defines a downtrend. Never buy into a lower high pattern — the trend is down.",
    entry: "On bounces to lower highs — short entry",
    stop: "Above the lower high",
    target: "Previous lower low and beyond",
    candles: [
      {o:220,c:214,h:221,l:213,bull:false},
      {o:214,c:208,h:215,l:207,bull:false},
      {o:208,c:213,h:207,l:214,bull:true},
      // LH 1
      {o:213,c:218,h:212,l:219,bull:true},
      {o:218,c:212,h:219,l:211,bull:false},
      {o:212,c:206,h:213,l:205,bull:false},
      {o:206,c:210,h:205,l:211,bull:true},
      // LH 2 (lower)
      {o:210,c:214,h:209,l:215,bull:true},
      {o:214,c:208,h:215,l:207,bull:false},
      {o:208,c:202,h:209,l:201,bull:false},
      {o:202,c:206,h:201,l:207,bull:true},
      // LH 3 (lower still)
      {o:206,c:209,h:205,l:210,bull:true},
      {o:209,c:202,h:210,l:201,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'LH 1', color:RED},
      {type:'label', candleIdx:7, offset:-18, text:'LH 2', color:RED},
      {type:'label', candleIdx:11, offset:-18, text:'LH 3', color:RED},
    ]
  },
  {
    id: 55, name: "Lower Low", level: "Beginner",
    category: "Market Structure", signal: "Bearish Continuation",
    signalColor: RED,
    description: "Each successive trough is lower than the previous trough. The fundamental definition of a downtrend. As long as lower lows are forming, the trend is intact.",
    entry: "On bounces to lower highs — short entry",
    stop: "Above the lower high preceding the lower low",
    target: "Next measured move lower based on swing size",
    candles: [
      {o:220,c:215,h:221,l:214,bull:false},
      {o:215,c:210,h:216,l:209,bull:false},
      {o:210,c:214,h:209,l:215,bull:true},
      {o:214,c:208,h:215,l:207,bull:false},
      // LL 1
      {o:208,c:202,h:209,l:201,bull:false},
      {o:202,c:207,h:201,l:208,bull:true},
      {o:207,c:202,h:208,l:201,bull:false},
      // LL 2 (lower)
      {o:202,c:196,h:203,l:195,bull:false},
      {o:196,c:201,h:195,l:202,bull:true},
      {o:201,c:195,h:202,l:194,bull:false},
      // LL 3 (lower still)
      {o:195,c:189,h:196,l:188,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-22, text:'LL 1', color:RED},
      {type:'label', candleIdx:7, offset:-22, text:'LL 2', color:RED},
      {type:'label', candleIdx:10, offset:-22, text:'LL 3', color:RED},
    ]
  },
  {
    id: 56, name: "Break of Structure", level: "Intermediate",
    category: "Market Structure", signal: "Bearish Reversal",
    signalColor: RED,
    description: "In an uptrend, price breaks below a previous higher low (BOS). This is the first warning sign that the uptrend may be ending. Used by Smart Money traders to anticipate reversals.",
    entry: "After confirmed close below the broken structure level",
    stop: "Above the most recent high before the break",
    target: "Previous swing low",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      {o:208,c:204,h:209,l:203,bull:false},
      // Higher low
      {o:204,c:202,h:205,l:201,bull:false},
      {o:202,c:208,h:201,l:210,bull:true},
      {o:208,c:213,h:207,l:215,bull:true},
      {o:213,c:208,h:214,l:207,bull:false},
      {o:208,c:204,h:209,l:203,bull:false},
      // BOS — breaks below prev HL
      {o:204,c:199,h:205,l:198,bull:false},
      {o:199,c:193,h:200,l:192,bull:false},
      {o:193,c:188,h:194,l:187,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-22, text:'Higher Low', color:TEAL},
      {type:'label', candleIdx:9, offset:-18, text:'BOS', color:RED},
      {type:'bracket', start:9, end:11, label:'Break of Structure'},
    ]
  },
  {
    id: 57, name: "Change of Character", level: "Advanced",
    category: "Market Structure", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "In a downtrend, price breaks above a previous lower high (CHoCH). This is the first sign that the downtrend may be reversing. A key Smart Money concept.",
    entry: "After confirmed close above the broken lower high level",
    stop: "Below the most recent low before the break",
    target: "Previous swing high",
    candles: [
      {o:220,c:214,h:221,l:213,bull:false},
      {o:214,c:208,h:215,l:207,bull:false},
      {o:208,c:212,h:207,l:213,bull:true},
      // Lower high
      {o:212,c:216,h:211,l:217,bull:true},
      {o:216,c:210,h:217,l:209,bull:false},
      {o:210,c:204,h:211,l:203,bull:false},
      {o:204,c:208,h:203,l:209,bull:true},
      // CHoCH — breaks above prev LH
      {o:208,c:214,h:207,l:216,bull:true},
      {o:214,c:220,h:213,l:222,bull:true},
      {o:220,c:226,h:219,l:228,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Lower High', color:RED},
      {type:'label', candleIdx:7, offset:-18, text:'CHoCH', color:TEAL},
      {type:'bracket', start:7, end:9, label:'Change of Character'},
    ]
  },
  {
    id: 58, name: "Market Structure Shift", level: "Advanced",
    category: "Market Structure", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "A more decisive CHoCH — price not only breaks a lower high but does so with strong momentum, signaling a confirmed shift from bearish to bullish market structure.",
    entry: "On the first pullback after the MSS confirmation",
    stop: "Below the MSS breakout candle low",
    target: "Previous major swing high",
    candles: [
      {o:220,c:213,h:221,l:212,bull:false},
      {o:213,c:206,h:214,l:205,bull:false},
      {o:206,c:210,h:205,l:211,bull:true},
      {o:210,c:204,h:211,l:203,bull:false},
      {o:204,c:198,h:205,l:197,bull:false},
      {o:198,c:203,h:197,l:204,bull:true},
      {o:203,c:198,h:204,l:197,bull:false},
      // MSS — strong break with momentum
      {o:198,c:208,h:197,l:210,bull:true},
      {o:208,c:218,h:207,l:220,bull:true},
      {o:218,c:215,h:219,l:214,bull:false},
      {o:215,c:222,h:214,l:224,bull:true},
      {o:222,c:229,h:221,l:231,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:1, offset:-18, text:'Downtrend', color:RED},
      {type:'label', candleIdx:7, offset:-18, text:'MSS', color:TEAL},
      {type:'bracket', start:7, end:8, label:'Structure Shift'},
    ]
  },

  // ── Support & Resistance ──
  {
    id: 59, name: "Support Bounce", level: "Beginner",
    category: "Support & Resistance", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Price returns to a previously established support level and bounces higher. One of the most reliable and frequently traded setups in technical analysis.",
    entry: "First bullish candle off the support level",
    stop: "Below the support level (give it some room)",
    target: "Previous resistance or 2:1 reward-to-risk minimum",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:210,h:201,l:212,bull:true},
      {o:210,c:204,h:211,l:203,bull:false},
      {o:204,c:198,h:205,l:197,bull:false},
      // Support zone
      {o:198,c:195,h:199,l:194,bull:false},
      {o:195,c:199,h:194,l:200,bull:true},
      {o:199,c:205,h:198,l:207,bull:true},
      {o:205,c:212,h:204,l:214,bull:true},
      {o:212,c:218,h:211,l:220,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:5, offset:-22, text:'Support', color:TEAL},
      {type:'label', candleIdx:6, offset:-18, text:'Bounce', color:TEAL},
      {type:'hline', candleIdx:5, label:'Support Level'},
    ]
  },
  {
    id: 60, name: "Resistance Rejection", level: "Beginner",
    category: "Support & Resistance", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price returns to a previously established resistance level and gets rejected lower. Sellers defend the level. Mirror of the support bounce.",
    entry: "First bearish candle after rejection from resistance",
    stop: "Above the resistance level",
    target: "Previous support or 2:1 reward-to-risk minimum",
    candles: [
      {o:220,c:214,h:221,l:213,bull:false},
      {o:214,c:208,h:215,l:207,bull:false},
      {o:208,c:200,h:209,l:199,bull:false},
      {o:200,c:206,h:199,l:208,bull:true},
      {o:206,c:212,h:205,l:214,bull:true},
      // Resistance zone
      {o:212,c:215,h:211,l:216,bull:true},
      {o:215,c:211,h:216,l:210,bull:false},
      {o:211,c:205,h:212,l:204,bull:false},
      {o:205,c:199,h:206,l:198,bull:false},
      {o:199,c:193,h:200,l:192,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:5, offset:-18, text:'Resistance', color:RED},
      {type:'label', candleIdx:6, offset:-18, text:'Rejection', color:RED},
      {type:'hline', candleIdx:5, label:'Resistance Level'},
    ]
  },
  {
    id: 61, name: "Break and Retest", level: "Intermediate",
    category: "Support & Resistance", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "Price breaks above resistance, pulls back to retest the broken level (now acting as support), then continues higher. The retest is the optimal entry point.",
    entry: "On the retest of the broken resistance (now support)",
    stop: "Below the retested support level",
    target: "Measured move equal to the previous range",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:198,h:203,l:197,bull:false},
      {o:198,c:204,h:197,l:205,bull:true},
      // Breakout
      {o:204,c:212,h:203,l:214,bull:true},
      {o:212,c:218,h:211,l:220,bull:true},
      // Retest
      {o:218,c:212,h:219,l:211,bull:false},
      {o:212,c:208,h:213,l:207,bull:false},
      {o:208,c:212,h:207,l:213,bull:true},
      // Continuation
      {o:212,c:220,h:211,l:222,bull:true},
      {o:220,c:228,h:219,l:230,bull:true},
      {o:228,c:234,h:227,l:236,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Breakout', color:TEAL},
      {type:'label', candleIdx:7, offset:-22, text:'Retest', color:GOLD},
      {type:'label', candleIdx:9, offset:-18, text:'Continue', color:TEAL},
    ]
  },
  {
    id: 62, name: "Failed Breakout", level: "Intermediate",
    category: "Support & Resistance", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price breaks above resistance but immediately reverses and closes back below it. The failed breakout traps bulls and often leads to a sharp move lower.",
    entry: "When price closes back below the breakout level",
    stop: "Above the failed breakout high",
    target: "Previous support level",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:198,h:203,l:197,bull:false},
      {o:198,c:204,h:197,l:205,bull:true},
      // False breakout
      {o:204,c:210,h:203,l:212,bull:true},
      {o:210,c:206,h:213,l:205,bull:false},
      // Failure and reversal
      {o:206,c:200,h:207,l:199,bull:false},
      {o:200,c:194,h:201,l:193,bull:false},
      {o:194,c:188,h:195,l:187,bull:false},
      {o:188,c:182,h:189,l:181,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'False Break', color:RED},
      {type:'label', candleIdx:5, offset:-18, text:'Reversal', color:RED},
      {type:'bracket', start:4, end:5, label:'Trap'},
    ]
  },
  {
    id: 63, name: "Failed Breakdown", level: "Intermediate",
    category: "Support & Resistance", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "Price breaks below support but immediately reverses and closes back above it. The failed breakdown traps bears and often leads to a sharp rally higher.",
    entry: "When price closes back above the breakdown level",
    stop: "Below the failed breakdown low",
    target: "Previous resistance level",
    candles: [
      {o:215,c:210,h:216,l:209,bull:false},
      {o:210,c:204,h:211,l:203,bull:false},
      {o:204,c:208,h:203,l:209,bull:true},
      {o:208,c:203,h:209,l:202,bull:false},
      // False breakdown
      {o:203,c:197,h:204,l:196,bull:false},
      {o:197,c:203,h:196,l:204,bull:true},
      // Recovery and rally
      {o:203,c:209,h:202,l:211,bull:true},
      {o:209,c:215,h:208,l:217,bull:true},
      {o:215,c:221,h:214,l:223,bull:true},
      {o:221,c:227,h:220,l:229,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-22, text:'False Break', color:TEAL},
      {type:'label', candleIdx:5, offset:-18, text:'Recovery', color:TEAL},
      {type:'bracket', start:4, end:5, label:'Bear Trap'},
    ]
  },
  {
    id: 64, name: "Range Expansion", level: "Intermediate",
    category: "Support & Resistance", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "After a period of tight consolidation (low volatility), price breaks out with a large candle, significantly expanding the trading range. Signals a new trend is beginning.",
    entry: "On the expansion candle or first retest",
    stop: "Below the consolidation low",
    target: "Measured move equal to the consolidation height",
    candles: [
      {o:202,c:204,h:201,l:205,bull:true},
      {o:204,c:202,h:205,l:203,bull:false},
      {o:202,c:204,h:201,l:205,bull:true},
      {o:204,c:203,h:205,l:204,bull:false},
      {o:203,c:204,h:202,l:205,bull:true},
      {o:204,c:203,h:205,l:202,bull:false},
      {o:203,c:204,h:202,l:205,bull:true},
      // Expansion
      {o:204,c:216,h:203,l:218,bull:true},
      {o:216,c:224,h:215,l:226,bull:true},
      {o:224,c:230,h:223,l:232,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Tight Range', color:GOLD},
      {type:'label', candleIdx:7, offset:-18, text:'Expansion', color:TEAL},
    ]
  },
  {
    id: 65, name: "Range Contraction", level: "Intermediate",
    category: "Support & Resistance", signal: "Indecision",
    signalColor: GOLD,
    description: "Candles get progressively smaller as the market consolidates. Volatility is compressing. A breakout in either direction is imminent — watch for the trigger.",
    entry: "On breakout above or below the contracting range",
    stop: "Opposite end of the contraction",
    target: "Equal to the contraction length in breakout direction",
    candles: [
      {o:200,c:206,h:199,l:208,bull:true},
      {o:206,c:200,h:207,l:199,bull:false},
      {o:200,c:204,h:199,l:206,bull:true},
      {o:204,c:201,h:205,l:202,bull:false},
      {o:201,c:203,h:200,l:204,bull:true},
      {o:203,c:202,h:204,l:203,bull:false},
      {o:202,c:203,h:201,l:204,bull:true},
      // Breakout
      {o:203,c:211,h:202,l:213,bull:true},
      {o:211,c:218,h:210,l:220,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-18, text:'Contracting', color:GOLD},
      {type:'label', candleIdx:7, offset:-18, text:'Breakout', color:TEAL},
    ]
  },

  // ── Price Action ──
  {
    id: 66, name: "Inside Bar", level: "Beginner",
    category: "Price Action", signal: "Indecision",
    signalColor: GOLD,
    description: "A candle whose high and low are completely within the range of the previous candle. Signals a pause — the market is deciding its next move. Trade the breakout.",
    entry: "Break above the mother bar high (bullish) or below the low (bearish)",
    stop: "Opposite end of the inside bar range",
    target: "Measured move equal to the mother bar range",
    candles: [
      {o:200,c:206,h:199,l:208,bull:true},
      {o:206,c:210,h:205,l:212,bull:true},
      {o:210,c:215,h:209,l:217,bull:true},
      // Mother bar
      {o:215,c:208,h:214,l:220,bull:false},
      // Inside bar
      {o:212,c:214,h:211,l:216,bull:true},
      // Breakout
      {o:214,c:222,h:213,l:224,bull:true},
      {o:222,c:228,h:221,l:230,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Mother Bar', color:GOLD},
      {type:'label', candleIdx:4, offset:-18, text:'Inside Bar', color:GOLD},
      {type:'label', candleIdx:5, offset:-18, text:'Breakout', color:TEAL},
    ]
  },
  {
    id: 67, name: "Outside Bar", level: "Beginner",
    category: "Price Action", signal: "Indecision",
    signalColor: GOLD,
    description: "A candle whose high is higher AND low is lower than the previous candle — engulfing the entire range. Shows expansion of volatility. Direction of close determines bias.",
    entry: "In the direction of the outside bar close",
    stop: "Beyond the outside bar extreme opposite the close",
    target: "Previous swing high (if bullish close) or low (if bearish)",
    candles: [
      {o:202,c:206,h:201,l:208,bull:true},
      {o:206,c:210,h:205,l:212,bull:true},
      {o:210,c:207,h:211,l:208,bull:false},
      // Outside bar (bullish close)
      {o:208,c:214,h:205,l:216,bull:true},
      {o:214,c:219,h:213,l:221,bull:true},
      {o:219,c:224,h:218,l:226,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-18, text:'Prev Bar', color:GOLD},
      {type:'label', candleIdx:3, offset:-22, text:'Outside Bar', color:TEAL},
    ]
  },
  {
    id: 68, name: "NR7", level: "Advanced",
    category: "Price Action", signal: "Indecision",
    signalColor: GOLD,
    description: "The Narrowest Range candle of the last 7 candles. Extreme compression of volatility. Statistically, NR7 candles are often followed by significant directional moves.",
    entry: "Break above the NR7 high or below the NR7 low",
    stop: "Opposite end of the NR7 candle",
    target: "Average of the 7 previous candle ranges from breakout",
    candles: [
      {o:200,c:208,h:198,l:210,bull:true},
      {o:208,c:202,h:210,l:200,bull:false},
      {o:202,c:210,h:200,l:212,bull:true},
      {o:210,c:204,h:212,l:202,bull:false},
      {o:204,c:208,h:202,l:210,bull:true},
      {o:208,c:204,h:210,l:202,bull:false},
      // NR7 — narrowest
      {o:205,c:206,h:204,l:207,bull:true},
      // Breakout
      {o:206,c:214,h:205,l:216,bull:true},
      {o:214,c:221,h:213,l:223,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:6, offset:-20, text:'NR7', color:GOLD},
      {type:'label', candleIdx:7, offset:-18, text:'Breakout', color:TEAL},
    ]
  },
  {
    id: 69, name: "Fakey Pattern", level: "Advanced",
    category: "Price Action", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "A false breakout from an inside bar setup that immediately reverses. The market fakes out one side then aggressively moves the other direction. High accuracy when identified.",
    entry: "When price reverses back through the inside bar range",
    stop: "Beyond the fakeout extreme",
    target: "Measured move in the true direction",
    candles: [
      {o:200,c:206,h:199,l:208,bull:true},
      {o:206,c:210,h:205,l:212,bull:true},
      // Mother bar and inside bar
      {o:210,c:206,h:211,l:215,bull:false},
      {o:208,c:210,h:207,l:212,bull:true},
      // False breakdown (fakeout)
      {o:210,c:204,h:211,l:203,bull:false},
      // Reversal
      {o:204,c:212,h:203,l:214,bull:true},
      {o:212,c:220,h:211,l:222,bull:true},
      {o:220,c:226,h:219,l:228,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-22, text:'Fakeout', color:RED},
      {type:'label', candleIdx:5, offset:-18, text:'Reversal', color:TEAL},
      {type:'bracket', start:4, end:5, label:'Fakey'},
    ]
  },
  {
    id: 70, name: "Pin Bar Reversal", level: "Beginner",
    category: "Price Action", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "A candle with a small body and a very long wick (2-3x the body) pointing into a key level. The wick represents price rejection. One of the cleanest Price Action signals.",
    entry: "Above the high of the pin bar (bullish) or below the low (bearish)",
    stop: "Beyond the tip of the pin bar wick",
    target: "Previous swing high or 2:1 minimum",
    candles: [
      {o:215,c:210,h:216,l:209,bull:false},
      {o:210,c:205,h:211,l:204,bull:false},
      {o:205,c:200,h:206,l:199,bull:false},
      {o:200,c:196,h:201,l:195,bull:false},
      // Bullish pin bar
      {o:196,c:198,h:197,l:184,bull:true},
      {o:198,c:204,h:197,l:206,bull:true},
      {o:204,c:210,h:203,l:212,bull:true},
      {o:210,c:216,h:209,l:218,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-28, text:'Pin Bar', color:TEAL},
      {type:'arrow', candleIdx:4, direction:'up'},
    ]
  },
  {
    id: 71, name: "Expansion Candle", level: "Intermediate",
    category: "Price Action", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A significantly larger than average candle that shows a sudden surge in momentum. Signals strong institutional participation and often leads to trend continuation.",
    entry: "Open of the next candle after the expansion",
    stop: "Below the midpoint of the expansion candle",
    target: "Measured move equal to the expansion candle length",
    candles: [
      {o:195,c:198,h:194,l:200,bull:true},
      {o:198,c:200,h:197,l:202,bull:true},
      {o:200,c:198,h:201,l:199,bull:false},
      {o:198,c:201,h:197,l:202,bull:true},
      // Expansion candle
      {o:201,c:216,h:200,l:218,bull:true},
      {o:216,c:220,h:215,l:222,bull:true},
      {o:220,c:224,h:219,l:226,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Expansion', color:TEAL},
    ]
  },
  {
    id: 72, name: "Exhaustion Candle", level: "Intermediate",
    category: "Price Action", signal: "Bearish Reversal",
    signalColor: RED,
    description: "A very large candle in the direction of the trend that closes near its open after a long wick. Signals buyers or sellers are exhausted. Often marks the end of a move.",
    entry: "Wait for reversal confirmation on the next candle",
    stop: "Beyond the exhaustion candle extreme",
    target: "Retracement of 50-61.8% of the exhaustion candle",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      {o:208,c:214,h:207,l:216,bull:true},
      // Exhaustion candle
      {o:214,c:215,h:213,l:228,bull:true},
      {o:215,c:209,h:216,l:208,bull:false},
      {o:209,c:203,h:210,l:202,bull:false},
      {o:203,c:197,h:204,l:196,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Exhaustion', color:RED},
      {type:'label', candleIdx:5, offset:-18, text:'Reversal', color:RED},
    ]
  },

  // ── Gap Patterns ──
  {
    id: 73, name: "Gap Up Continuation", level: "Intermediate",
    category: "Gap Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "Price gaps up significantly at the open and continues higher without filling the gap. Strong institutional buying. The unfilled gap acts as support on pullbacks.",
    entry: "Open of the gap-up session or on first pullback to gap",
    stop: "Below the bottom of the gap",
    target: "Measured move equal to prior trend leg",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:206,h:201,l:208,bull:true},
      {o:206,c:203,h:207,l:202,bull:false},
      // Gap up
      {o:210,c:216,h:209,l:218,bull:true},
      {o:216,c:222,h:215,l:224,bull:true},
      {o:222,c:228,h:221,l:230,bull:true},
      {o:228,c:224,h:229,l:223,bull:false},
      {o:224,c:229,h:223,l:231,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Pre-Gap', color:GOLD},
      {type:'label', candleIdx:4, offset:-18, text:'Gap Up', color:TEAL},
      {type:'bracket', start:3, end:4, label:'Gap Zone'},
    ]
  },
  {
    id: 74, name: "Gap Up Reversal", level: "Intermediate",
    category: "Gap Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price gaps up but immediately sells off, closing the gap and reversing below the prior close. Known as an island reversal or exhaustion gap. Very bearish signal.",
    entry: "When price closes below the bottom of the gap",
    stop: "Above the gap-up open",
    target: "Prior swing low",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      {o:208,c:212,h:207,l:214,bull:true},
      // Gap up then reversal
      {o:218,c:214,h:220,l:212,bull:false},
      {o:214,c:208,h:215,l:207,bull:false},
      {o:208,c:202,h:209,l:201,bull:false},
      {o:202,c:196,h:203,l:195,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Pre-Gap', color:GOLD},
      {type:'label', candleIdx:4, offset:-18, text:'Gap & Fail', color:RED},
    ]
  },
  {
    id: 75, name: "Gap Fill", level: "Beginner",
    category: "Gap Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "After a gap up, price retraces to fill the gap (return to pre-gap prices). Markets fill gaps ~70% of the time. The gap acts as a magnet pulling price back.",
    entry: "Short entry when gap fill begins or near gap fill completion",
    stop: "Above the high of the gap-up candle",
    target: "Top of the gap (partial fill) or bottom of the gap (full fill)",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:204,h:201,l:206,bull:true},
      // Gap up
      {o:210,c:216,h:209,l:218,bull:true},
      {o:216,c:212,h:217,l:211,bull:false},
      {o:212,c:208,h:213,l:207,bull:false},
      // Gap fill
      {o:208,c:204,h:209,l:203,bull:false},
      {o:204,c:202,h:205,l:201,bull:false},
      {o:202,c:205,h:201,l:206,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-18, text:'Pre-Gap', color:GOLD},
      {type:'label', candleIdx:3, offset:-18, text:'Gap Up', color:TEAL},
      {type:'label', candleIdx:7, offset:-22, text:'Gap Filled', color:RED},
    ]
  },
  {
    id: 76, name: "Breakaway Gap", level: "Advanced",
    category: "Gap Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A gap that occurs at the breakout from a consolidation pattern (triangle, rectangle, flag). Signals the start of a new major move. These gaps rarely fill quickly.",
    entry: "Open of the breakaway gap session",
    stop: "Below the bottom of the gap",
    target: "Measured move from the pattern height",
    candles: [
      {o:200,c:204,h:199,l:206,bull:true},
      {o:204,c:200,h:205,l:199,bull:false},
      {o:200,c:204,h:199,l:205,bull:true},
      {o:204,c:201,h:205,l:200,bull:false},
      {o:201,c:203,h:200,l:204,bull:true},
      // Breakaway gap
      {o:209,c:216,h:208,l:218,bull:true},
      {o:216,c:222,h:215,l:224,bull:true},
      {o:222,c:228,h:221,l:230,bull:true},
      {o:228,c:234,h:227,l:236,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:2, offset:-18, text:'Consolidation', color:GOLD},
      {type:'label', candleIdx:5, offset:-18, text:'Breakaway', color:TEAL},
      {type:'bracket', start:4, end:5, label:'Gap'},
    ]
  },
  {
    id: 77, name: "Exhaustion Gap", level: "Advanced",
    category: "Gap Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "A gap that occurs at the end of a strong trend, often on climactic volume. Signals the last buyers/sellers are entering before the trend reverses. Look to fade these.",
    entry: "After reversal confirmation on high volume",
    stop: "Beyond the exhaustion gap extreme",
    target: "Retracement of 50-61.8% of the entire prior trend",
    candles: [
      {o:190,c:198,h:189,l:200,bull:true},
      {o:198,c:206,h:197,l:208,bull:true},
      {o:206,c:214,h:205,l:216,bull:true},
      {o:214,c:220,h:213,l:222,bull:true},
      // Exhaustion gap then reversal
      {o:228,c:224,h:232,l:222,bull:false},
      {o:224,c:216,h:225,l:215,bull:false},
      {o:216,c:208,h:217,l:207,bull:false},
      {o:208,c:200,h:209,l:199,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Trend End', color:GOLD},
      {type:'label', candleIdx:4, offset:-18, text:'Exhaust Gap', color:RED},
    ]
  },
  {
    id: 78, name: "Runaway Gap", level: "Advanced",
    category: "Gap Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A gap that occurs in the middle of a strong trend, not at the beginning or end. Also called a continuation or measuring gap. Signals the trend has significant momentum remaining.",
    entry: "Open of the runaway gap session",
    stop: "Below the bottom of the gap",
    target: "Distance from trend start to gap, added to gap level",
    candles: [
      {o:188,c:194,h:187,l:196,bull:true},
      {o:194,c:200,h:193,l:202,bull:true},
      {o:200,c:204,h:199,l:206,bull:true},
      {o:204,c:208,h:203,l:210,bull:true},
      // Runaway gap in the middle
      {o:214,c:220,h:213,l:222,bull:true},
      {o:220,c:226,h:219,l:228,bull:true},
      {o:226,c:232,h:225,l:234,bull:true},
      {o:232,c:236,h:231,l:238,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Trend', color:TEAL},
      {type:'label', candleIdx:4, offset:-18, text:'Runaway Gap', color:TEAL},
      {type:'bracket', start:3, end:4, label:'Gap'},
    ]
  },

  // ── Volume Patterns ──
  {
    id: 79, name: "Volume Spike Breakout", level: "Intermediate",
    category: "Volume Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "A breakout from a key level accompanied by a significant volume spike (2-3x average). Volume confirms institutional participation and validates the move.",
    entry: "On the high-volume breakout candle",
    stop: "Below the breakout level",
    target: "Measured move from the consolidation height",
    candles: [
      {o:200,c:204,h:199,l:206,bull:true},
      {o:204,c:200,h:205,l:199,bull:false},
      {o:200,c:203,h:199,l:205,bull:true},
      {o:203,c:200,h:204,l:199,bull:false},
      {o:200,c:202,h:199,l:204,bull:true},
      // Volume spike breakout
      {o:202,c:212,h:201,l:214,bull:true},
      {o:212,c:220,h:211,l:222,bull:true},
      {o:220,c:226,h:219,l:228,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Consolidation', color:GOLD},
      {type:'label', candleIdx:5, offset:-18, text:'Vol Spike', color:TEAL},
    ]
  },
  {
    id: 80, name: "Volume Climax", level: "Advanced",
    category: "Volume Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Extremely high volume on a strong move that quickly reverses. Indicates all available buyers/sellers have been exhausted in one massive burst. Classic reversal signal.",
    entry: "After price reverses from the climax candle",
    stop: "Beyond the climax candle extreme",
    target: "Retracement of 50-61.8% of the prior move",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:208,h:201,l:210,bull:true},
      {o:208,c:214,h:207,l:216,bull:true},
      // Climax — huge volume, reverses
      {o:214,c:210,h:213,l:224,bull:false},
      {o:210,c:204,h:211,l:203,bull:false},
      {o:204,c:198,h:205,l:197,bull:false},
      {o:198,c:192,h:199,l:191,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Volume Climax', color:RED},
      {type:'label', candleIdx:5, offset:-18, text:'Reversal', color:RED},
    ]
  },
  {
    id: 81, name: "Volume Divergence", level: "Advanced",
    category: "Volume Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "Price makes higher highs while volume makes lower highs (or vice versa). This divergence signals weakening momentum and a likely reversal. Volume leads price.",
    entry: "After price confirms the divergence with a reversal candle",
    stop: "Above the most recent high",
    target: "Previous swing low",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      {o:202,c:200,h:203,l:199,bull:false},
      {o:200,c:206,h:199,l:208,bull:true},
      {o:206,c:203,h:207,l:202,bull:false},
      // Higher price, lower volume implied
      {o:203,c:208,h:202,l:210,bull:true},
      {o:208,c:204,h:209,l:203,bull:false},
      {o:204,c:198,h:205,l:197,bull:false},
      {o:198,c:192,h:199,l:191,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:3, offset:-18, text:'Higher High', color:GOLD},
      {type:'label', candleIdx:5, offset:-18, text:'HH + Low Vol', color:RED},
      {type:'label', candleIdx:7, offset:-18, text:'Reversal', color:RED},
    ]
  },
  {
    id: 82, name: "Accumulation", level: "Advanced",
    category: "Volume Pattern", signal: "Bullish Reversal",
    signalColor: TEAL,
    description: "A period of sideways price action with gradually declining volume followed by rising volume on up days. Institutional buyers are quietly building positions before a move higher.",
    entry: "On breakout above the accumulation range with volume",
    stop: "Below the low of the accumulation zone",
    target: "Measured move equal to the accumulation range height",
    candles: [
      {o:215,c:210,h:216,l:209,bull:false},
      {o:210,c:205,h:211,l:204,bull:false},
      // Accumulation zone — quiet sideways
      {o:205,c:207,h:204,l:208,bull:true},
      {o:207,c:204,h:208,l:203,bull:false},
      {o:204,c:207,h:203,l:208,bull:true},
      {o:207,c:205,h:208,l:204,bull:false},
      {o:205,c:208,h:204,l:209,bull:true},
      // Breakout with volume
      {o:208,c:216,h:207,l:218,bull:true},
      {o:216,c:224,h:215,l:226,bull:true},
      {o:224,c:230,h:223,l:232,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Accumulation', color:GOLD},
      {type:'label', candleIdx:7, offset:-18, text:'Breakout', color:TEAL},
    ]
  },
  {
    id: 83, name: "Distribution", level: "Advanced",
    category: "Volume Pattern", signal: "Bearish Reversal",
    signalColor: RED,
    description: "A period of sideways price action at a top with declining volume followed by rising volume on down days. Institutions are quietly selling their positions before a breakdown.",
    entry: "On breakdown below the distribution range with volume",
    stop: "Above the high of the distribution zone",
    target: "Measured move equal to the distribution range height",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:202,h:195,l:204,bull:true},
      // Distribution zone — quiet sideways at top
      {o:202,c:204,h:201,l:206,bull:true},
      {o:204,c:201,h:205,l:200,bull:false},
      {o:201,c:204,h:200,l:205,bull:true},
      {o:204,c:201,h:205,l:200,bull:false},
      {o:201,c:203,h:200,l:205,bull:true},
      // Breakdown with volume
      {o:203,c:195,h:204,l:194,bull:false},
      {o:195,c:187,h:196,l:186,bull:false},
      {o:187,c:181,h:188,l:180,bull:false},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Distribution', color:GOLD},
      {type:'label', candleIdx:7, offset:-18, text:'Breakdown', color:RED},
    ]
  },
  {
    id: 84, name: "Dry-Up Volume", level: "Intermediate",
    category: "Volume Pattern", signal: "Bullish Continuation",
    signalColor: TEAL,
    description: "Volume dries up to very low levels during a pullback in an uptrend. Low volume on pullbacks means sellers are not motivated — the path of least resistance remains higher.",
    entry: "When volume begins to pick back up in the trend direction",
    stop: "Below the low of the dry-up pullback",
    target: "Previous high and continuation of the trend",
    candles: [
      {o:190,c:196,h:189,l:198,bull:true},
      {o:196,c:204,h:195,l:206,bull:true},
      {o:204,c:210,h:203,l:212,bull:true},
      // Dry-up pullback — small candles, low volume
      {o:210,c:208,h:211,l:207,bull:false},
      {o:208,c:207,h:209,l:206,bull:false},
      {o:207,c:208,h:206,l:209,bull:true},
      // Volume returns, trend resumes
      {o:208,c:216,h:207,l:218,bull:true},
      {o:216,c:224,h:215,l:226,bull:true},
      {o:224,c:230,h:223,l:232,bull:true},
    ],
    annotations: [
      {type:'label', candleIdx:4, offset:-18, text:'Dry-Up Vol', color:GOLD},
      {type:'label', candleIdx:6, offset:-18, text:'Vol Returns', color:TEAL},
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
      {o:205,c:208,h:204,l:210,bull:true},{o:208,c:212,h:207,l:214,bull:true},
      {o:212,c:210,h:213,l:209,bull:false},{o:210,c:206,h:211,l:205,bull:false},
      {o:206,c:203,h:207,l:202,bull:false},
      {o:203,c:201,h:204,l:200,bull:false},
      {o:201,c:207,h:200,l:209,bull:true},
      {o:207,c:213,h:206,l:215,bull:true},{o:213,c:218,h:212,l:220,bull:true},
    ],
    annotations: [
      {type:'label',candleIdx:5,offset:-22,text:'Below VWAP',color:RED},
      {type:'label',candleIdx:6,offset:-18,text:'Reclaim',color:TEAL},
      {type:'hline',candleIdx:5,label:'VWAP'},
    ]
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
      {o:205,c:202,h:206,l:201,bull:false},{o:202,c:198,h:203,l:197,bull:false},
      {o:198,c:195,h:199,l:194,bull:false},
      {o:195,c:199,h:194,l:200,bull:true},{o:199,c:204,h:198,l:205,bull:true},
      {o:204,c:207,h:203,l:208,bull:true},
      {o:207,c:202,h:209,l:201,bull:false},
      {o:202,c:196,h:203,l:195,bull:false},{o:196,c:190,h:197,l:189,bull:false},
    ],
    annotations: [
      {type:'label',candleIdx:5,offset:-18,text:'VWAP Test',color:GOLD},
      {type:'label',candleIdx:6,offset:-18,text:'Reject',color:RED},
      {type:'hline',candleIdx:5,label:'VWAP'},
    ]
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
// ─────────────────────────────────────────────
// CANDLE ANIMATION ENGINE — Full Rebuild
// ─────────────────────────────────────────────
function CandleChart({ pattern, playing, onComplete, width = 680, height = 340 }) {
  const svgRef = useRef(null);
  const defs = mkEl('defs', {});

const bullGradient = mkEl('linearGradient', {
  id: 'bullGradient',
  x1: '0%',
  y1: '0%',
  x2: '100%',
  y2: '100%'
});

bullGradient.appendChild(mkEl('stop', {
  offset: '0%',
  stopColor: '#9fffee'
}));

bullGradient.appendChild(mkEl('stop', {
  offset: '45%',
  stopColor: TEAL
}));

bullGradient.appendChild(mkEl('stop', {
  offset: '100%',
  stopColor: '#0b5f55'
}));

const bearGradient = mkEl('linearGradient', {
  id: 'bearGradient',
  x1: '0%',
  y1: '0%',
  x2: '100%',
  y2: '100%'
});

bearGradient.appendChild(mkEl('stop', {
  offset: '0%',
  stopColor: '#ffb3b3'
}));

bearGradient.appendChild(mkEl('stop', {
  offset: '45%',
  stopColor: RED
}));

bearGradient.appendChild(mkEl('stop', {
  offset: '100%',
  stopColor: '#7a1010'
}));

defs.appendChild(bullGradient);
defs.appendChild(bearGradient);
svg.appendChild(defs);
  const animRef = useRef(null);
  const stepRef = useRef(0);

  const W = width, H = height;
  const candles = pattern.candles;
  const allPrices = candles.flatMap(c => [c.h, c.l]);
  const minP = Math.min(...allPrices) - 8;
  const maxP = Math.max(...allPrices) + 8;
  const PAD_L = 36, PAD_R = 16, PAD_T = 32, PAD_B = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const candleW = Math.min(18, chartW / candles.length - 3);
  const spacing = chartW / candles.length;

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

    // 3D candle gradients
    const defs = mkEl('defs', {});

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
    svg.appendChild(defs);

        // Layer groups — order matters for z-index
    const gridG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const zoneG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const candleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const lineG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    [gridG, zoneG, candleG, lineG, labelG].forEach(g => svg.appendChild(g));

    // Grid lines + price labels
    for (let i = 0; i <= 5; i++) {
      const price = minP + (i / 5) * (maxP - minP);
      const y = yS(price);
      const gl = mkEl('line', { x1: PAD_L, x2: W - PAD_R, y1: y, y2: y,
        stroke: 'rgba(255,255,255,0.06)', 'stroke-width': '0.5' });
      gridG.appendChild(gl);
      const pt = mkEl('text', { x: PAD_L - 4, y: y + 4, fill: 'rgba(156,163,175,0.5)',
        'font-size': '9', 'text-anchor': 'end', 'font-family': 'monospace' });
      pt.textContent = Math.round(price);
      gridG.appendChild(pt);
    }

    // Draw candles one by one
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
      const yH = yS(c.h), yL = yS(c.l);
      const yO = yS(c.o), yC2 = yS(c.c);

      const wick = mkEl('line', { x1: x, x2: x, y1: yH, y2: yL,
        stroke: color, 'stroke-width': '1.5' });
      candleG.appendChild(wick);

      const bTop = Math.min(yO, yC2);
      const bH = Math.max(Math.abs(yO - yC2), 2);
      const body = mkEl('rect', {
  x: x - candleW / 2,
  y: bTop,
  width: candleW,
  height: bH,
  fill: c.bull ? 'url(#bullGradient)' : 'url(#bearGradient)',
  stroke: c.bull ? '#8fffe9' : '#ffb3b3',
  'stroke-width': 1.4,
  rx: '3',
  style: `
    filter:
      drop-shadow(0 0 7px ${c.bull ? TEAL : RED})
      drop-shadow(0 0 12px rgba(212,175,55,0.25));
  `
});
candleG.appendChild(body);

      stepRef.current++;
      animRef.current = setTimeout(drawNextCandle, 65);
    }

    // Auto-detect and draw trendlines/necklines based on pattern type
    function drawAutoOverlays() {
      const name = (pattern.name || '').toLowerCase();
      const signal = (pattern.signal || '').toLowerCase();

      // ── Neckline for H&S, Double Top, Double Bottom, Triple Top, Triple Bottom ──
      if (name.includes('head & shoulders') || name.includes('head and shoulders')) {
        // Find the two neckline lows (troughs between shoulders and head)
        const neckPrices = [candles[3], candles[7]].filter(Boolean);
        if (neckPrices.length === 2) {
          const y1 = yS(neckPrices[0].l);
          const y2 = yS(neckPrices[1].l);
          drawDashedLine(PAD_L, y1, W - PAD_R, y2, GOLD, '6,3', 'Neckline', 1500);
        }
      }

      if (name.includes('inverse head')) {
        const neckPrices = [candles[4], candles[8]].filter(Boolean);
        if (neckPrices.length === 2) {
          const y1 = yS(neckPrices[0].h);
          const y2 = yS(neckPrices[1].h);
          drawDashedLine(PAD_L, y1, W - PAD_R, y2, GOLD, '6,3', 'Neckline', 1500);
        }
      }

      if (name.includes('double top')) {
        const neckY = yS(candles[5]?.l || candles[5]?.c || 200);
        drawDashedLine(PAD_L, neckY, W - PAD_R, neckY, GOLD, '6,3', 'Neckline', 1500);
      }

      if (name.includes('double bottom')) {
        const neckY = yS(candles[6]?.h || candles[6]?.c || 210);
        drawDashedLine(PAD_L, neckY, W - PAD_R, neckY, TEAL, '6,3', 'Neckline', 1500);
      }

      if (name.includes('triple top')) {
        const neckY = yS(candles[4]?.l || 197);
        drawDashedLine(PAD_L, neckY, W - PAD_R, neckY, GOLD, '6,3', 'Neckline', 1500);
      }

      if (name.includes('triple bottom')) {
        const neckY = yS(candles[4]?.h || 209);
        drawDashedLine(PAD_L, neckY, W - PAD_R, neckY, GOLD, '6,3', 'Neckline', 1500);
      }

      // ── Trendlines for wedges ──
      if (name.includes('rising wedge')) {
        const x1 = xC(0), x2 = xC(candles.length - 4);
        const upperY1 = yS(candles[0].h), upperY2 = yS(candles[7].h);
        const lowerY1 = yS(candles[0].l), lowerY2 = yS(candles[6].l);
        drawTrendLine(x1, upperY1, x2, upperY2, RED, '5,3', 'Resistance', 1200);
        drawTrendLine(x1, lowerY1, x2, lowerY2, GOLD, '5,3', 'Support', 1400);
      }

      if (name.includes('falling wedge')) {
        const x1 = xC(0), x2 = xC(candles.length - 4);
        const upperY1 = yS(candles[0].h), upperY2 = yS(candles[6].h);
        const lowerY1 = yS(candles[0].l), lowerY2 = yS(candles[8].l);
        drawTrendLine(x1, upperY1, x2, upperY2, RED, '5,3', 'Resistance', 1200);
        drawTrendLine(x1, lowerY1, x2, lowerY2, TEAL, '5,3', 'Support', 1400);
      }

      // ── Channel lines ──
      if (name.includes('rising channel')) {
        const x1 = xC(0), x2 = xC(candles.length - 1);
        drawTrendLine(x1, yS(candles[0].l), x2, yS(candles[candles.length - 1].l), TEAL, '5,3', 'Support', 1200);
        drawTrendLine(x1, yS(candles[0].h), x2, yS(candles[candles.length - 3].h), RED, '5,3', 'Resistance', 1400);
      }

      if (name.includes('falling channel')) {
        const x1 = xC(0), x2 = xC(candles.length - 1);
        drawTrendLine(x1, yS(candles[0].h), x2, yS(candles[candles.length - 1].h), RED, '5,3', 'Resistance', 1200);
        drawTrendLine(x1, yS(candles[0].l), x2, yS(candles[candles.length - 3].l), TEAL, '5,3', 'Support', 1400);
      }

      // ── Flag trendlines ──
      if (name.includes('bull flag')) {
        const flagStart = 5, flagEnd = 9;
        drawTrendLine(xC(flagStart), yS(candles[flagStart].h), xC(flagEnd), yS(candles[flagEnd].h), RED, '4,3', 'Flag Top', 1200);
        drawTrendLine(xC(flagStart), yS(candles[flagStart].l), xC(flagEnd), yS(candles[flagEnd].l), TEAL, '4,3', 'Flag Bottom', 1400);
      }

      if (name.includes('bear flag')) {
        const flagStart = 4, flagEnd = 8;
        drawTrendLine(xC(flagStart), yS(candles[flagStart].h), xC(flagEnd), yS(candles[flagEnd].h), RED, '4,3', 'Flag Top', 1200);
        drawTrendLine(xC(flagStart), yS(candles[flagStart].l), xC(flagEnd), yS(candles[flagEnd].l), TEAL, '4,3', 'Flag Bottom', 1400);
      }

      // ── Triangle resistance/support lines ──
      if (name.includes('ascending triangle')) {
        const flatY = yS(candles[3].h);
        drawDashedLine(xC(3), flatY, xC(10), flatY, RED, '5,3', 'Resistance', 1200);
        drawTrendLine(xC(3), yS(candles[4].l), xC(9), yS(candles[8].l), TEAL, '5,3', 'Support', 1400);
      }

      if (name.includes('descending triangle')) {
        const flatY = yS(candles[2].l);
        drawDashedLine(xC(2), flatY, xC(10), flatY, TEAL, '5,3', 'Support', 1200);
        drawTrendLine(xC(2), yS(candles[1].h), xC(9), yS(candles[8].h), RED, '5,3', 'Resistance', 1400);
      }

      // ── Rectangle zones ──
      if (name.includes('rectangle')) {
        const topY = yS(Math.max(...candles.slice(2, 9).map(c => c.h)));
        const botY = yS(Math.min(...candles.slice(2, 9).map(c => c.l)));
        const zone = mkEl('rect', {
          x: xC(2), y: topY,
          width: xC(8) - xC(2), height: botY - topY,
          fill: 'rgba(212,175,55,0.06)',
          stroke: 'rgba(212,175,55,0.25)',
          'stroke-width': '1',
          'stroke-dasharray': '4,3',
          rx: '3'
        });
        zone.style.opacity = '0';
        zoneG.appendChild(zone);
        fadeIn(zone, 1200);
      }

      // ── Support/Resistance hlines ──
      if (name.includes('support bounce')) {
        const supY = yS(Math.min(...candles.slice(4, 7).map(c => c.l)));
        drawDashedLine(PAD_L, supY, W - PAD_R, supY, TEAL, '6,3', 'Support', 1200);
      }

      if (name.includes('resistance rejection')) {
        const resY = yS(Math.max(...candles.slice(4, 7).map(c => c.h)));
        drawDashedLine(PAD_L, resY, W - PAD_R, resY, RED, '6,3', 'Resistance', 1200);
      }

      // ── Stop/Target zones for any pattern ──
      const lastCandle = candles[candles.length - 1];
      const isBull = signal.includes('bullish');
      const isBear = signal.includes('bearish');

      if (isBull && lastCandle) {
        const entryY = yS(lastCandle.c);
        const stopY = yS(Math.min(...candles.map(c => c.l)) + 1);
        const targetY = yS(Math.max(...candles.map(c => c.h)) + 8);

        // Stop zone
        drawZone(xC(candles.length - 3), stopY, xC(candles.length - 1) + candleW, entryY,
          'rgba(239,83,80,0.12)', 'rgba(239,83,80,0.3)', 'Stop', 1800);
        // Target zone
        drawZone(xC(candles.length - 3), targetY, xC(candles.length - 1) + candleW, entryY - 10,
          'rgba(38,166,154,0.12)', 'rgba(38,166,154,0.3)', 'Target', 2000);
      }

      if (isBear && lastCandle) {
        const entryY = yS(lastCandle.c);
        const stopY = yS(Math.max(...candles.map(c => c.h)) - 1);
        const targetY = yS(Math.min(...candles.map(c => c.l)) - 8);

        drawZone(xC(candles.length - 3), entryY, xC(candles.length - 1) + candleW, stopY,
          'rgba(239,83,80,0.12)', 'rgba(239,83,80,0.3)', 'Stop', 1800);
        drawZone(xC(candles.length - 3), entryY + 10, xC(candles.length - 1) + candleW, targetY,
          'rgba(38,166,154,0.12)', 'rgba(38,166,154,0.3)', 'Target', 2000);
      }
    }

    // Draw annotations from pattern data
    function drawAnnotations() {
      pattern.annotations?.forEach((ann, idx) => {
        const delay = 800 + idx * 120;

        if (ann.type === 'label' && ann.candleIdx !== undefined) {
          const c = candles[ann.candleIdx];
          if (!c) return;
          const x = xC(ann.candleIdx);
          const isBullSig = pattern.signal?.toLowerCase().includes('bullish');
          const candleTopY = yS(c.h);
          const candleBotY = yS(c.l);

          // Place above for bullish labels at tops, below for bottoms
          const placeAbove = candleTopY > PAD_T + 20;
          const labelY = placeAbove ? candleTopY - 18 : candleBotY + 18;
          const clampedY = Math.max(PAD_T + 12, Math.min(H - PAD_B - 8, labelY));

          const tw = (ann.text?.length || 0) * 6 + 14;
          const bg = mkEl('rect', {
            x: x - tw / 2, y: clampedY - 10,
            width: tw, height: 14,
            fill: 'rgba(6,11,20,0.95)', rx: '3',
            stroke: `${ann.color || GOLD}40`, 'stroke-width': '0.5'
          });
          bg.style.opacity = '0';
          labelG.appendChild(bg);
          fadeIn(bg, delay);

          const txt = mkEl('text', {
            x, y: clampedY,
            fill: ann.color || GOLD,
            'font-size': '10', 'font-weight': '700',
            'font-family': 'monospace', 'text-anchor': 'middle'
          });
          txt.textContent = ann.text;
          txt.style.opacity = '0';
          labelG.appendChild(txt);
          fadeIn(txt, delay);

          // Tick line
          const tickEnd = placeAbove ? candleTopY - 3 : candleBotY + 3;
          const tickStart = placeAbove ? clampedY + 5 : clampedY - 13;
          if (Math.abs(tickEnd - tickStart) > 5) {
            const tick = mkEl('line', {
              x1: x, x2: x, y1: tickStart, y2: tickEnd,
              stroke: ann.color || GOLD,
              'stroke-width': '0.5', 'stroke-dasharray': '2,2'
            });
            tick.style.opacity = '0';
            lineG.appendChild(tick);
            fadeIn(tick, delay);
          }
        }

        if (ann.type === 'hline' && ann.candleIdx !== undefined) {
          const c = candles[ann.candleIdx];
          const next = candles[ann.candleIdx + 1];
          const y = yS(Math.max(c.h, next?.h || c.h));
          drawDashedLine(PAD_L, y, W - PAD_R, y, ann.color || GOLD, '5,3', ann.label, delay);
        }

        if (ann.type === 'bracket' && ann.start !== undefined) {
          const x1 = xC(ann.start) - candleW / 2;
          const x2 = xC(ann.end) + candleW / 2;
          const y = H - PAD_B + 8;
          const midX = (x1 + x2) / 2;

          const bline = mkEl('line', { x1, x2, y1: y, y2: y,
            stroke: ann.color || GOLD, 'stroke-width': '1' });
          bline.style.opacity = '0';
          lineG.appendChild(bline);
          fadeIn(bline, delay);

          [x1, x2].forEach(tx => {
            const tick = mkEl('line', { x1: tx, x2: tx, y1: y - 4, y2: y + 4,
              stroke: ann.color || GOLD, 'stroke-width': '1' });
            tick.style.opacity = '0';
            lineG.appendChild(tick);
            fadeIn(tick, delay);
          });

          const lw = (ann.label?.length || 0) * 5.5 + 10;
          const lbg = mkEl('rect', { x: midX - lw / 2, y: y + 4, width: lw, height: 13,
            fill: 'rgba(6,11,20,0.95)', rx: '2' });
          lbg.style.opacity = '0';
          labelG.appendChild(lbg);
          fadeIn(lbg, delay + 80);

          const ltxt = mkEl('text', { x: midX, y: y + 13,
            fill: ann.color || GOLD, 'font-size': '9', 'font-weight': '700',
            'font-family': 'monospace', 'text-anchor': 'middle' });
          ltxt.textContent = ann.label || '';
          ltxt.style.opacity = '0';
          labelG.appendChild(ltxt);
          fadeIn(ltxt, delay + 80);
        }
      });
    }

    // ── Helpers ──
    function mkEl(tag, attrs = {}) {
      const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    }

    function fadeIn(el, delay) {
      setTimeout(() => {
        el.style.transition = 'opacity 0.4s';
        el.style.opacity = '1';
      }, delay || 100);
    }

    function drawDashedLine(x1, y1, x2, y2, color, dash, label, delay) {
      const line = mkEl('line', { x1, x2, y1, y2,
        stroke: color || GOLD, 'stroke-width': '1.2',
        'stroke-dasharray': dash || '5,3' });
      line.style.opacity = '0';
      lineG.appendChild(line);
      fadeIn(line, delay);

      if (label) {
        const lw = label.length * 5.5 + 12;
        const lbg = mkEl('rect', { x: W - PAD_R - lw, y: y1 - 10, width: lw, height: 13,
          fill: 'rgba(6,11,20,0.92)', rx: '2' });
        lbg.style.opacity = '0';
        lineG.appendChild(lbg);
        fadeIn(lbg, delay + 100);

        const ltxt = mkEl('text', { x: W - PAD_R - 4, y: y1,
          fill: color || GOLD, 'font-size': '9', 'font-weight': '700',
          'font-family': 'monospace', 'text-anchor': 'end' });
        ltxt.textContent = label;
        ltxt.style.opacity = '0';
        lineG.appendChild(ltxt);
        fadeIn(ltxt, delay + 100);
      }
    }

    function drawTrendLine(x1, y1, x2, y2, color, dash, label, delay) {
      // Extend slightly beyond the candles
      const slope = (y2 - y1) / (x2 - x1);
      const ex1 = x1 - 10;
      const ey1 = y1 - slope * 10;
      const ex2 = x2 + 30;
      const ey2 = y2 + slope * 30;

      const line = mkEl('line', { x1: ex1, x2: ex2, y1: ey1, y2: ey2,
        stroke: color || GOLD, 'stroke-width': '1.2',
        'stroke-dasharray': dash || '5,3' });
      line.style.opacity = '0';
      lineG.appendChild(line);
      fadeIn(line, delay);

      if (label) {
        const lbg = mkEl('rect', { x: ex2 - 2, y: ey2 - 11,
          width: label.length * 5.5 + 10, height: 13,
          fill: 'rgba(6,11,20,0.92)', rx: '2' });
        lbg.style.opacity = '0';
        lineG.appendChild(lbg);
        fadeIn(lbg, delay + 100);

        const ltxt = mkEl('text', { x: ex2 + 2, y: ey2 - 1,
          fill: color || GOLD, 'font-size': '9', 'font-weight': '700',
          'font-family': 'monospace', 'text-anchor': 'start' });
        ltxt.textContent = label;
        ltxt.style.opacity = '0';
        lineG.appendChild(ltxt);
        fadeIn(ltxt, delay + 100);
      }
    }

    function drawZone(x1, y1, x2, y2, fill, stroke, label, delay) {
      if (y1 > y2) [y1, y2] = [y2, y1];
      if (y2 - y1 < 4) return;
      const rect = mkEl('rect', { x: x1, y: y1, width: x2 - x1, height: y2 - y1,
        fill, stroke, 'stroke-width': '0.5', rx: '3' });
      rect.style.opacity = '0';
      zoneG.appendChild(rect);
      fadeIn(rect, delay);

      if (label) {
        const ltxt = mkEl('text', { x: x1 + 6, y: y1 + 10,
          fill: '#fff', 'font-size': '8', 'font-weight': '700',
          'font-family': 'monospace' });
        ltxt.textContent = label;
        ltxt.style.opacity = '0';
        labelG.appendChild(ltxt);
        fadeIn(ltxt, delay + 100);
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

function PatternCard({ pattern, isExpanded, onClick }) {
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);

  useEffect(() => {
    if (isExpanded && !playing && !done) {
      setTimeout(() => setPlaying(true), 250);
    }
    if (!isExpanded) {
      setPlaying(false);
      setDone(false);
      setQuizMode(false);
      setQuizAnswer(null);
    }
  }, [isExpanded, playing, done]);

  function handleReplay(e) {
    e?.stopPropagation?.();
    setDone(false);
    setPlaying(false);
    setTimeout(() => setPlaying(true), 100);
  }

  function startQuiz(e) {
    e?.stopPropagation?.();
    const others = ALL_PATTERNS.filter(p => p.id !== pattern.id && p.category === pattern.category);
    const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [pattern, ...shuffled].sort(() => Math.random() - 0.5);
    setQuizOptions(opts);
    setQuizAnswer(null);
    setQuizMode(true);
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
                <h2 style={{ margin: 0, color: '#f8fafc', fontSize: isExpanded ? 32 : 18, lineHeight: 1.05, fontWeight: 950, letterSpacing: -0.6 }}>
                  {pattern.name}
                </h2>
                <span style={{ color: sc, fontSize: isExpanded ? 28 : 16, fontWeight: 900 }}>{directionIcon}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <Pill color={levelColor}>{pattern.level}</Pill>
                <Pill color={BLUE}>{pattern.category}</Pill>
                <Pill color={sc}>{pattern.signal}</Pill>
              </div>
              {isExpanded && (
                <p style={{ color: '#e5e7eb', fontSize: 16, lineHeight: 1.6, margin: '12px 0 0', maxWidth: 1180 }}>
                  {pattern.description}
                </p>
              )}
            </div>
          </div>

          {isExpanded && (
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button onClick={handleReplay} style={buttonStyle('#94a3b8')}>↻ Replay</button>
              <button onClick={startQuiz} style={buttonStyle(GOLD)}>❔ Quiz Me</button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.25fr) minmax(300px, 0.9fr)', gap: 14, alignItems: 'stretch' }}>
            <Panel title="PATTERN ANIMATION" icon="▰" color={sc}>
              <div
                style={{
                  height: 390,
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
                <CandleChart pattern={pattern} playing={playing} onComplete={() => setDone(true)} width={920} height={380} />
              </div>
              <div style={{ marginTop: 10, border: `1px solid ${sc}40`, background: `${sc}0f`, color: '#dbeafe', borderRadius: 10, padding: '10px 12px', fontSize: 14, lineHeight: 1.55 }}>
                <strong style={{ color: sc }}>How it works:</strong> {pattern.description}
              </div>
            </Panel>

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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
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

          {quizMode && (
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
                      onClick={() => setQuizAnswer(opt.id)}
                      disabled={!!quizAnswer}
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
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: 'rgba(38,166,154,0.1)', border: '1px solid rgba(38,166,154,0.3)', borderRadius: 8, padding: '4px 12px', fontSize: 11, color: TEAL, fontWeight: 700 }}>
            <div style={{ background: 'rgba(38,166,154,0.1)', border: '1px solid rgba(38,166,154,0.3)', borderRadius: 8, padding: '4px 12px', fontSize: 11, color: TEAL, fontWeight: 700 }}>
  All 125 Patterns Live 🔥
</div>
          </div>
          <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8, padding: '4px 12px', fontSize: 11, color: GOLD, fontWeight: 700 }}>
            125 Patterns Total
          </div>
        </div>
      </section>

      {/* Stats */}
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

      {/* Filters */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patterns..."
          style={{ flex: 1, minWidth: 180, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', padding: '8px 14px', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
        />
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

      {/* Pattern Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {filtered.map(p => (
          <PatternCard
            key={p.id}
            pattern={p}
isExpanded={expanded === p.id}
            onClick={() => setExpanded(expanded === p.id ? null : p.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No patterns found</div>
          <div style={{ fontSize: 13 }}>Try adjusting your filters</div>
        </div>
      )}

    </main>
  );
}