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

const CATEGORIES = ['All', 'Single Candle', 'Multi Candle'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const SIGNALS = ['All', 'Bullish Reversal', 'Bearish Reversal', 'Bullish Continuation', 'Bearish Continuation', 'Indecision'];

// ─────────────────────────────────────────────
// CANDLE ANIMATION ENGINE
// ─────────────────────────────────────────────
function CandleChart({ pattern, playing, onComplete }) {
  const svgRef = useRef(null);
  const animRef = useRef(null);
  const stepRef = useRef(0);

  const W = 320, H = 180;
  const candles = pattern.candles;
  const allPrices = candles.flatMap(c => [c.h, c.l]);
  const minP = Math.min(...allPrices) - 5;
  const maxP = Math.max(...allPrices) + 5;
  const candleW = Math.min(14, (W - 40) / candles.length - 2);
  const spacing = (W - 40) / candles.length;

  function yS(price) {
    return 20 + ((maxP - price) / (maxP - minP)) * (H - 35);
  }

  function xC(i) {
    return 25 + i * spacing + spacing / 2;
  }

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;

    if (playing) {
      stepRef.current = 0;
      svg.innerHTML = '';

      // Grid
      for (let i = 0; i <= 3; i++) {
        const y = 20 + (i / 3) * (H - 35);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 20); line.setAttribute('x2', W - 10);
        line.setAttribute('y1', y); line.setAttribute('y2', y);
        line.setAttribute('stroke', 'rgba(255,255,255,0.05)');
        line.setAttribute('stroke-width', '0.5');
        svg.appendChild(line);
      }

      function drawNextCandle() {
        const i = stepRef.current;
        if (i >= candles.length) {
          drawAnnotations();
          onComplete && onComplete();
          return;
        }

        const c = candles[i];
        const color = c.bull ? TEAL : RED;
        const x = xC(i);
        const yH = yS(c.h);
        const yL = yS(c.l);
        const yO = yS(c.o);
        const yC = yS(c.c);

        const wick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        wick.setAttribute('x1', x); wick.setAttribute('x2', x);
        wick.setAttribute('y1', yH); wick.setAttribute('y2', yL);
        wick.setAttribute('stroke', color); wick.setAttribute('stroke-width', '1.5');
        svg.appendChild(wick);

        const bodyTop = Math.min(yO, yC);
        const bodyH = Math.max(Math.abs(yO - yC), 2);
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        body.setAttribute('x', x - candleW / 2);
        body.setAttribute('y', bodyTop);
        body.setAttribute('width', candleW);
        body.setAttribute('height', bodyH);
        body.setAttribute('fill', color);
        body.setAttribute('rx', '1');
        svg.appendChild(body);

        stepRef.current++;
        animRef.current = setTimeout(drawNextCandle, 80);
      }

      function drawAnnotations() {
        setTimeout(() => {
          pattern.annotations?.forEach(ann => {
            if (ann.type === 'label' && ann.candleIdx !== undefined) {
              const x = xC(ann.candleIdx);
              const c = candles[ann.candleIdx];
              const yBase = yS(c.l) + (ann.offset || -20);

              const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              txt.setAttribute('x', x);
              txt.setAttribute('y', yBase);
              txt.setAttribute('fill', ann.color || GOLD);
              txt.setAttribute('font-size', '9');
              txt.setAttribute('font-weight', '700');
              txt.setAttribute('font-family', 'monospace');
              txt.setAttribute('text-anchor', 'middle');
              svg.appendChild(txt);

              // Fade in
              txt.style.opacity = '0';
              txt.textContent = ann.text;
              setTimeout(() => { txt.style.transition = 'opacity 0.4s'; txt.style.opacity = '1'; }, 100);
            }

            if (ann.type === 'hline' && ann.candleIdx !== undefined) {
              const c = candles[ann.candleIdx];
              const y = yS(Math.max(c.h, candles[ann.candleIdx + 1]?.h || c.h));

              const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              line.setAttribute('x1', 20); line.setAttribute('x2', W - 10);
              line.setAttribute('y1', y); line.setAttribute('y2', y);
              line.setAttribute('stroke', 'rgba(212,175,55,0.6)');
              line.setAttribute('stroke-width', '1');
              line.setAttribute('stroke-dasharray', '5,3');
              line.style.opacity = '0';
              svg.appendChild(line);
              setTimeout(() => { line.style.transition = 'opacity 0.4s'; line.style.opacity = '1'; }, 100);

              if (ann.label) {
                const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                txt.setAttribute('x', W - 12);
                txt.setAttribute('y', y - 4);
                txt.setAttribute('fill', GOLD);
                txt.setAttribute('font-size', '8');
                txt.setAttribute('font-family', 'monospace');
                txt.setAttribute('text-anchor', 'end');
                txt.textContent = ann.label;
                txt.style.opacity = '0';
                svg.appendChild(txt);
                setTimeout(() => { txt.style.transition = 'opacity 0.4s'; txt.style.opacity = '1'; }, 200);
              }
            }

            if (ann.type === 'bracket' && ann.start !== undefined) {
              const x1 = xC(ann.start) - candleW;
              const x2 = xC(ann.end) + candleW;
              const y = H - 8;

              const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              line.setAttribute('x1', x1); line.setAttribute('x2', x2);
              line.setAttribute('y1', y); line.setAttribute('y2', y);
              line.setAttribute('stroke', GOLD);
              line.setAttribute('stroke-width', '1');
              line.style.opacity = '0';
              svg.appendChild(line);

              const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              txt.setAttribute('x', (x1 + x2) / 2);
              txt.setAttribute('y', y + 10);
              txt.setAttribute('fill', GOLD);
              txt.setAttribute('font-size', '8');
              txt.setAttribute('font-weight', '700');
              txt.setAttribute('font-family', 'monospace');
              txt.setAttribute('text-anchor', 'middle');
              txt.textContent = ann.label;
              txt.style.opacity = '0';
              svg.appendChild(txt);

              setTimeout(() => {
                line.style.transition = 'opacity 0.4s'; line.style.opacity = '1';
                txt.style.transition = 'opacity 0.4s'; txt.style.opacity = '1';
              }, 200);
            }
          });
        }, 300);
      }

      drawNextCandle();
    }

    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [playing, pattern]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// ─────────────────────────────────────────────
// PATTERN CARD
// ─────────────────────────────────────────────
function PatternCard({ pattern, isExpanded, onClick }) {
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);

  useEffect(() => {
    if (isExpanded && !playing && !done) {
      setTimeout(() => setPlaying(true), 300);
    }
    if (!isExpanded) {
      setPlaying(false);
      setDone(false);
      setQuizMode(false);
      setQuizAnswer(null);
    }
  }, [isExpanded]);

  function handleReplay() {
    setDone(false);
    setPlaying(false);
    setTimeout(() => setPlaying(true), 100);
  }

  function startQuiz() {
    const others = PATTERNS.filter(p => p.id !== pattern.id && p.category === pattern.category);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [pattern, ...shuffled].sort(() => Math.random() - 0.5);
    setQuizOptions(opts);
    setQuizAnswer(null);
    setQuizMode(true);
  }

  const levelColor = pattern.level === 'Beginner' ? TEAL : pattern.level === 'Intermediate' ? GOLD : PURPLE;

  return (
    <div
      onClick={!isExpanded ? onClick : undefined}
      style={{
        background: isExpanded ? '#0d1421' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isExpanded ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 14,
        overflow: 'hidden',
        cursor: isExpanded ? 'default' : 'pointer',
        transition: 'all 0.2s',
        gridColumn: isExpanded ? '1 / -1' : 'auto',
      }}
    >
      {/* Card Header */}
      <div
        style={{ padding: isExpanded ? '16px 20px' : '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={onClick}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${pattern.signalColor}18`,
            border: `1px solid ${pattern.signalColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 900, color: pattern.signalColor, fontFamily: 'monospace',
          }}>
            {pattern.id}
          </div>
          <div>
            <div style={{ color: '#f5f1e8', fontSize: 14, fontWeight: 700 }}>{pattern.name}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
              <span style={{ background: `${levelColor}18`, border: `1px solid ${levelColor}40`, color: levelColor, fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4, letterSpacing: 0.5 }}>{pattern.level}</span>
              <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>{pattern.category}</span>
              <span style={{ background: `${pattern.signalColor}18`, border: `1px solid ${pattern.signalColor}40`, color: pattern.signalColor, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>{pattern.signal}</span>
            </div>
          </div>
        </div>
        <div style={{ color: '#9ca3af', fontSize: 18, fontWeight: 300 }}>{isExpanded ? '−' : '+'}</div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

            {/* Left: Chart */}
            <div style={{ padding: '20px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>PATTERN ANIMATION</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {done && (
                    <button onClick={handleReplay} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#9ca3af', fontSize: 11, fontWeight: 700, padding: '5px 12px', cursor: 'pointer' }}>
                      ↺ Replay
                    </button>
                  )}
                  {done && !quizMode && (
                    <button onClick={startQuiz} style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}40`, borderRadius: 7, color: GOLD, fontSize: 11, fontWeight: 700, padding: '5px 12px', cursor: 'pointer' }}>
                      Quiz Me
                    </button>
                  )}
                </div>
              </div>

              <div style={{ background: '#060b14', borderRadius: 10, padding: '10px', height: 200, position: 'relative', overflow: 'hidden' }}>
                {!playing && !done && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Loading animation...</div>
                  </div>
                )}
                <CandleChart pattern={pattern} playing={playing} onComplete={() => setDone(true)} />
              </div>

              {/* Quiz */}
              {quizMode && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ color: GOLD, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>IDENTIFY THIS PATTERN</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {quizOptions.map(opt => {
                      const isCorrect = opt.id === pattern.id;
                      const isSelected = quizAnswer === opt.id;
                      let bg = 'rgba(255,255,255,0.04)';
                      let border = 'rgba(255,255,255,0.1)';
                      let color = '#f5f1e8';
                      if (isSelected && isCorrect) { bg = 'rgba(38,166,154,0.15)'; border = 'rgba(38,166,154,0.5)'; color = TEAL; }
                      if (isSelected && !isCorrect) { bg = 'rgba(239,83,80,0.15)'; border = 'rgba(239,83,80,0.5)'; color = RED; }
                      if (quizAnswer && isCorrect) { bg = 'rgba(38,166,154,0.15)'; border = 'rgba(38,166,154,0.5)'; color = TEAL; }
                      return (
                        <button key={opt.id} onClick={() => setQuizAnswer(opt.id)} disabled={!!quizAnswer}
                          style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 12, fontWeight: 700, padding: '10px 12px', cursor: quizAnswer ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                          {opt.name}
                          {quizAnswer && isCorrect && ' ✓'}
                          {isSelected && !isCorrect && ' ✗'}
                        </button>
                      );
                    })}
                  </div>
                  {quizAnswer && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: quizAnswer === pattern.id ? 'rgba(38,166,154,0.1)' : 'rgba(239,83,80,0.1)', borderRadius: 8, color: quizAnswer === pattern.id ? TEAL : RED, fontSize: 12, fontWeight: 700 }}>
                      {quizAnswer === pattern.id ? '✓ Correct! Well done.' : `✗ That was ${pattern.name}. Study the animation and try again.`}
                    </div>
                  )}
                  <button onClick={() => { setQuizMode(false); setQuizAnswer(null); }} style={{ marginTop: 8, background: 'none', border: 'none', color: '#9ca3af', fontSize: 11, cursor: 'pointer' }}>
                    Close quiz
                  </button>
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div style={{ padding: '20px' }}>
              <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.7, margin: '0 0 20px' }}>{pattern.description}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'ENTRY', value: pattern.entry, color: TEAL, icon: '→' },
                  { label: 'STOP LOSS', value: pattern.stop, color: RED, icon: '✕' },
                  { label: 'TARGET', value: pattern.target, color: GOLD, icon: '★' },
                ].map(item => (
                  <div key={item.label} style={{ background: `${item.color}08`, border: `1px solid ${item.color}20`, borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ color: item.color, fontSize: 11 }}>{item.icon}</span>
                      <span style={{ color: item.color, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>{item.label}</span>
                    </div>
                    <div style={{ color: '#f5f1e8', fontSize: 12, lineHeight: 1.5 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
  const [viewMode, setViewMode] = useState('library');

  const filtered = PATTERNS.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'All' && p.category !== category) return false;
    if (level !== 'All' && p.level !== level) return false;
    if (signal !== 'All' && p.signal !== signal) return false;
    return true;
  });

  const stats = {
    total: PATTERNS.length,
    beginner: PATTERNS.filter(p => p.level === 'Beginner').length,
    intermediate: PATTERNS.filter(p => p.level === 'Intermediate').length,
    advanced: PATTERNS.filter(p => p.level === 'Advanced').length,
  };

  return (
    <main className="pageStack" style={{ maxWidth: '100%', padding: '0 20px 60px' }}>

      {/* Header */}
      <section className="pageHeader">
        <div>
          <p style={{ color: GOLD, fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>TRQX ACADEMY</p>
          <h1 style={{ margin: '4px 0 8px' }}>Pattern Library</h1>
          <span style={{ color: '#9ca3af' }}>
            {PATTERNS.length} animated patterns across 15 categories — with quiz mode and trade setups for each.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: 'rgba(38,166,154,0.1)', border: '1px solid rgba(38,166,154,0.3)', borderRadius: 8, padding: '4px 12px', fontSize: 11, color: TEAL, fontWeight: 700 }}>
            Batch 1 of 3 Live
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

      {/* Batch 2 Coming Soon */}
      <div style={{ marginTop: 40, background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03))', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 14, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: GOLD, fontSize: 11, fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>COMING NEXT</div>
          <div style={{ color: '#f5f1e8', fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Batch 2 — 57 More Patterns</div>
          <div style={{ color: '#9ca3af', fontSize: 13 }}>
            Bull Flag, Bear Flag, Ascending Triangle, Cup & Handle, Double Bottom, Triple Top, Head & Shoulders, and 50 more chart patterns.
          </div>
        </div>
        <div style={{ color: GOLD, fontSize: 32, flexShrink: 0 }}>⏳</div>
      </div>
    </main>
  );
}