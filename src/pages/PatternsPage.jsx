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

// Merge all patterns
const ALL_PATTERNS = [...PATTERNS, ...BATCH2];


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
    const others = ALL_PATTERNS.filter(p => p.id !== pattern.id && p.category === pattern.category);
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
            {PATTERNS.length} animated patterns across 15 categories — with quiz mode and trade setups for each.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ background: 'rgba(38,166,154,0.1)', border: '1px solid rgba(38,166,154,0.3)', borderRadius: 8, padding: '4px 12px', fontSize: 11, color: TEAL, fontWeight: 700 }}>
            Batch 2 of 3 Live
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

      {/* <div style={{ marginTop: 40, background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03))', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 14, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <div>
    <div style={{ color: GOLD, fontSize: 11, fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>COMING NEXT</div>
    <div style={{ color: '#f5f1e8', fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Batch 3 — 41 More Patterns</div>
    <div style={{ color: '#9ca3af', fontSize: 13 }}>
      Momentum patterns, Options Flow setups, Gamma positioning patterns, Smart Money concepts, ORB setups, and Advanced Institutional patterns.
    </div>
  </div>
  <div style={{ color: GOLD, fontSize: 32, flexShrink: 0 }}>⏳</div>
</div> */}
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