/**
 * ==========================================================
 * TRQX UNIVERSITY
 * Lesson: Evening Star
 * ==========================================================
 */

export const eveningStarLesson = {
  id: "evening-star",

  title: "Evening Star",

  objective:
    "Learn how to identify the Evening Star reversal pattern, understand the transition from buyer control to seller control, and recognize the conditions that create a high-probability bearish reversal.",

  estimatedTime: "16 Minutes",

  difficulty: "Beginner",

  content: [
    {
      type: "heading",
      text: "🌇 EVENING STAR",
    },

          {
  type: "svg",
  svg: `
<svg
  width="100%"
  viewBox="0 0 920 540"
  role="img"
  xmlns="http://www.w3.org/2000/svg"
>
  <title>Evening Star bearish reversal pattern</title>

  <desc>
    A large bullish candle, a small star candle that gaps higher,
    and a strong bearish candle that closes below the midpoint
    of the first candle.
  </desc>

  <style>
    .evening-title {
      fill: #f4d35e;
      font-size: 28px;
      font-family: Arial, sans-serif;
      font-weight: 700;
    }

    .evening-label {
      fill: #ffffff;
      font-size: 15px;
      font-family: Arial, sans-serif;
      font-weight: 700;
    }

    .evening-note {
      fill: #b8bcc5;
      font-size: 13px;
      font-family: Arial, sans-serif;
    }

    .evening-green {
      fill: #22c55e;
    }

    .evening-red {
      fill: #ef4444;
    }

    .evening-star-body {
      fill: #9ca3af;
    }

    .evening-wick {
      stroke: #ffffff;
      stroke-width: 4;
    }

    .evening-resistance {
      stroke: #ef4444;
      stroke-width: 3;
      stroke-dasharray: 9 7;
    }

    .evening-midpoint {
      stroke: #f4d35e;
      stroke-width: 2;
      stroke-dasharray: 6 5;
    }

    .evening-guide {
      stroke: #f4d35e;
      stroke-width: 2;
      fill: none;
      marker-end: url(#evening-arrow);
    }

    .evening-panel {
      fill: rgba(255,255,255,0.02);
      stroke: rgba(244,211,94,0.28);
      stroke-width: 1;
    }
  </style>

  <defs>
    <marker
      id="evening-arrow"
      markerWidth="10"
      markerHeight="10"
      refX="7"
      refY="3"
      orient="auto"
    >
      <path
        d="M0,0 L0,6 L8,3 Z"
        fill="#f4d35e"
      />
    </marker>
  </defs>

  <text
    x="460"
    y="42"
    text-anchor="middle"
    class="evening-title"
  >
    Evening Star Pattern
  </text>

  <rect
    x="55"
    y="70"
    width="810"
    height="390"
    rx="16"
    class="evening-panel"
  />

  <line
    x1="110"
    y1="115"
    x2="810"
    y2="115"
    class="evening-resistance"
  />

  <text
    x="815"
    y="120"
    class="evening-label"
  >
    Resistance
  </text>

  <!-- Candle 1: strong bullish candle -->

  <line
    x1="250"
    y1="175"
    x2="250"
    y2="390"
    class="evening-wick"
  />

  <rect
    x="210"
    y="220"
    width="80"
    height="130"
    rx="4"
    class="evening-green"
  />

  <!-- Candle 1 midpoint -->

  <line
    x1="190"
    y1="285"
    x2="750"
    y2="285"
    class="evening-midpoint"
  />

  <text
    x="755"
    y="290"
    class="evening-note"
  >
    50% of Candle 1
  </text>

  <!-- Candle 2: small star that gaps higher -->

  <line
    x1="455"
    y1="130"
    x2="455"
    y2="215"
    class="evening-wick"
  />

  <rect
    x="430"
    y="155"
    width="50"
    height="28"
    rx="4"
    class="evening-star-body"
  />

  <!-- Candle 3: bearish confirmation -->

  <line
    x1="655"
    y1="175"
    x2="655"
    y2="410"
    class="evening-wick"
  />

  <rect
    x="610"
    y="205"
    width="90"
    height="165"
    rx="4"
    class="evening-red"
  />

  <!-- Gap labels -->

  <path
    d="M305 205 C345 165 385 150 420 165"
    class="evening-guide"
  />

  <text
    x="335"
    y="145"
    class="evening-label"
  >
    Gap Up
  </text>

  <path
    d="M490 185 C535 205 565 215 600 220"
    class="evening-guide"
  />

  <text
    x="520"
    y="185"
    class="evening-label"
  >
    Gap Down
  </text>

  <!-- Candle labels -->

  <text
    x="250"
    y="430"
    text-anchor="middle"
    class="evening-label"
  >
    Candle 1
  </text>

  <text
    x="250"
    y="451"
    text-anchor="middle"
    class="evening-note"
  >
    Buyers control
  </text>

  <text
    x="455"
    y="245"
    text-anchor="middle"
    class="evening-label"
  >
    Candle 2
  </text>

  <text
    x="455"
    y="265"
    text-anchor="middle"
    class="evening-note"
  >
    Indecision
  </text>

  <text
    x="655"
    y="430"
    text-anchor="middle"
    class="evening-label"
  >
    Candle 3
  </text>

  <text
    x="655"
    y="451"
    text-anchor="middle"
    class="evening-note"
  >
    Sellers take control
  </text>

  <text
    x="460"
    y="505"
    text-anchor="middle"
    class="evening-note"
  >
    Strong buying → Star and hesitation → Bearish candle closes below Candle 1 midpoint
  </text>
</svg>
  `,
},

    {
      type: "callout",
      text:
        "TRQX Example: QQQ rallies into a weekly resistance level. Buyers dominate the first candle. The second candle forms a small-bodied Doji showing momentum is fading. The third candle sells aggressively with above-average volume, confirming sellers have taken control.",
    },

    {
      type: "heading",
      text: "📖 WHAT IS AN EVENING STAR?",
    },

    {
      type: "p",
      text:
        "The Evening Star is a three-candle bearish reversal pattern that signals a transition from buyer control to seller control.",
    },

    {
      type: "heading",
      text: "🧠 THE STORY",
    },

    {
      type: "p",
      text: "Candle One shows aggressive buying pressure.",
    },

    {
      type: "p",
      text: "Candle Two shows that buying is slowing and the market becomes indecisive.",
    },

    {
      type: "p",
      text: "Candle Three shows sellers taking complete control and reversing the prior move.",
    },

    {
      type: "callout",
      text:
        "Professional traders don't memorize this pattern—they recognize the transfer of control from buyers to sellers.",
    },

    {
      type: "heading",
      text: "📍 LOCATION",
    },

    {
      type: "p",
      text:
        "The highest-probability Evening Star forms after an extended rally near higher-timeframe resistance or supply.",
    },

    {
      type: "heading",
      text: "📈 CONFIRMATION",
    },

    {
      type: "p",
      text:
        "Professional traders wait for the third candle to close before considering a short position.",
    },

    {
      type: "p",
      text:
        "Volume, resistance, momentum, and trend alignment increase the probability of success.",
    },

    {
      type: "heading",
      text: "🚫 COMMON MISTAKES",
    },

    { type: "p", text: "❌ Shorting before Candle Three confirms." },
    { type: "p", text: "❌ Ignoring higher-timeframe resistance." },
    { type: "p", text: "❌ Ignoring volume." },
    { type: "p", text: "❌ Assuming every Doji becomes an Evening Star." },

    {
      type: "heading",
      text: "✅ TRQX CHECKLIST",
    },

    { type: "p", text: "✔ Prior uptrend" },
    { type: "p", text: "✔ Strong bullish Candle One" },
    { type: "p", text: "✔ Small indecision Candle Two" },
    { type: "p", text: "✔ Strong bearish Candle Three" },
    { type: "p", text: "✔ Resistance nearby" },
    { type: "p", text: "✔ Volume confirms" },
    { type: "p", text: "✔ Confirmation before entry" },

    {
      type: "heading",
      text: "🧠 MEMORY RULE",
    },

    {
      type: "callout",
      text:
        "Buyers Control → Momentum Slows → Sellers Attack → Bearish Confirmation",
    },

    {
      type: "heading",
      text: "✍ STUDENT ASSIGNMENT",
    },

    {
      type: "p",
      text:
        "Locate three Evening Star patterns on TradingView. Explain the psychology behind each candle, identify resistance, evaluate volume, and determine whether the setup meets the TRQX checklist.",
    }
  ],

  flashcards: [
    {
      front: "How many candles form an Evening Star?",
      back: "Three candles."
    },
    {
      front: "What does Candle One represent?",
      back: "Strong buyer control."
    },
    {
      front: "What does Candle Two represent?",
      back: "Indecision and slowing buying pressure."
    },
    {
      front: "What does Candle Three represent?",
      back: "Sellers taking complete control."
    },
    {
      front: "Where should an Evening Star appear?",
      back: "After an uptrend near major resistance."
    },
    {
      front: "What confirms the pattern?",
      back: "A strong bearish third candle with confirmation and volume."
    }
  ],

  quiz: [
    {
      question: "How many candles make up an Evening Star?",
      answers: ["2","3","4","5"],
      correctAnswer: 1,
      explanation: "The Evening Star consists of three candles."
    },
    {
      question: "What does the second candle represent?",
      answers: [
        "Breakout",
        "Indecision",
        "Strong buying",
        "Strong selling"
      ],
      correctAnswer: 1,
      explanation: "The middle candle represents hesitation and loss of momentum."
    },
    {
      question: "What confirms an Evening Star?",
      answers: [
        "Large bearish third candle",
        "Gap higher",
        "Inside bar",
        "Bullish engulfing"
      ],
      correctAnswer: 0,
      explanation: "The third bearish candle confirms the reversal."
    },
    {
      question: "Where is the highest probability Evening Star found?",
      answers: [
        "Support",
        "Middle of consolidation",
        "Resistance after an uptrend",
        "Premarket only"
      ],
      correctAnswer: 2,
      explanation: "Location gives the pattern its significance."
    },
    {
      question: "What does Candle One represent?",
      answers: [
        "Buyer control",
        "Seller control",
        "No participation",
        "Neutral trend"
      ],
      correctAnswer: 0,
      explanation: "The first candle shows buyers firmly in control."
    },
    {
      question: "What improves confidence?",
      answers: [
        "Resistance",
        "Volume",
        "Confirmation",
        "All of the above"
      ],
      correctAnswer: 3,
      explanation: "Professional traders combine all confirming factors."
    },
    {
      question: "Should you enter before the third candle closes?",
      answers: [
        "Always",
        "Never",
        "Only with confirmation",
        "Only after hours"
      ],
      correctAnswer: 2,
      explanation: "Confirmation is essential before taking a trade."
    },
    {
      question: "The Evening Star primarily represents:",
      answers: [
        "Bullish continuation",
        "Bearish reversal",
        "Neutral market",
        "Bullish reversal"
      ],
      correctAnswer: 1,
      explanation: "It is a bearish reversal pattern."
    }
  ],

  drills: {
    clickIdentify: [],
    dragLabel: null,
    dragTimeline: null,
  },

  mastery: {
    requiredScore: 80,
    unlocks: "candlestick-final",
    requirements: [
      "Identify the three candles.",
      "Explain buyer vs seller psychology.",
      "Recognize proper resistance.",
      "Pass the quiz."
    ]
  },

  assignment: {
    title: "Evening Star Analysis",
    instructions: [
      "Find three Evening Stars.",
      "Explain each candle.",
      "Mark resistance.",
      "Determine whether confirmation exists."
    ]
  },

  aiCoach: {
    summary:
      "The Evening Star teaches the transition from buyer dominance to seller dominance across three candles.",
    commonMistakes: [
      "Entering too early.",
      "Ignoring resistance.",
      "Ignoring volume.",
      "Ignoring confirmation."
    ],
    professionalTips: [
      "Read the psychology.",
      "Wait for confirmation.",
      "Trade context, not patterns."
    ]
  },

  references: []
};

export default eveningStarLesson;