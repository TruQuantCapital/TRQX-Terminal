/**
 * ==========================================================
 * TRQX UNIVERSITY
 * Lesson: Morning Star
 * ==========================================================
 */

export const morningStarLesson = {
  id: "morning-star",

  title: "Morning Star",

  objective:
    "Learn how to identify the Morning Star reversal pattern, understand the transition from seller control to buyer control, and recognize the conditions that create a high-probability bullish reversal.",

  estimatedTime: "16 Minutes",

  difficulty: "Beginner",

  content: [
    {
      type: "heading",
      text: "🌅 MORNING STAR",
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
  <title>Morning Star bullish reversal pattern</title>

  <desc>
    A large bearish candle, a small star candle that gaps lower,
    and a strong bullish candle that closes above the midpoint
    of the first candle.
  </desc>

  <style>
    .morning-title {
      fill: #f4d35e;
      font-size: 28px;
      font-family: Arial, sans-serif;
      font-weight: 700;
    }

    .morning-label {
      fill: #ffffff;
      font-size: 15px;
      font-family: Arial, sans-serif;
      font-weight: 700;
    }

    .morning-note {
      fill: #b8bcc5;
      font-size: 13px;
      font-family: Arial, sans-serif;
    }

    .morning-green {
      fill: #22c55e;
    }

    .morning-red {
      fill: #ef4444;
    }

    .morning-star-body {
      fill: #9ca3af;
    }

    .morning-wick {
      stroke: #ffffff;
      stroke-width: 4;
    }

    .morning-support {
      stroke: #38bdf8;
      stroke-width: 3;
      stroke-dasharray: 9 7;
    }

    .morning-midpoint {
      stroke: #f4d35e;
      stroke-width: 2;
      stroke-dasharray: 6 5;
    }

    .morning-guide {
      stroke: #f4d35e;
      stroke-width: 2;
      fill: none;
      marker-end: url(#morning-arrow);
    }

    .morning-panel {
      fill: rgba(255,255,255,0.02);
      stroke: rgba(244,211,94,0.28);
      stroke-width: 1;
    }
  </style>

  <defs>
    <marker
      id="morning-arrow"
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
    class="morning-title"
  >
    Morning Star Pattern
  </text>

  <rect
    x="55"
    y="70"
    width="810"
    height="390"
    rx="16"
    class="morning-panel"
  />

  <line
    x1="110"
    y1="405"
    x2="810"
    y2="405"
    class="morning-support"
  />

  <text
    x="815"
    y="410"
    class="morning-label"
  >
    Support
  </text>

  <!-- Candle 1: strong bearish candle -->

  <line
    x1="250"
    y1="145"
    x2="250"
    y2="365"
    class="morning-wick"
  />

  <rect
    x="210"
    y="185"
    width="80"
    height="135"
    rx="4"
    class="morning-red"
  />

  <!-- Candle 1 midpoint -->

  <line
    x1="190"
    y1="252"
    x2="750"
    y2="252"
    class="morning-midpoint"
  />

  <text
    x="755"
    y="257"
    class="morning-note"
  >
    50% of Candle 1
  </text>

  <!-- Candle 2: small star that gaps lower -->

  <line
    x1="455"
    y1="300"
    x2="455"
    y2="390"
    class="morning-wick"
  />

  <rect
    x="430"
    y="330"
    width="50"
    height="28"
    rx="4"
    class="morning-star-body"
  />

  <!-- Candle 3: bullish confirmation -->

  <line
    x1="655"
    y1="135"
    x2="655"
    y2="375"
    class="morning-wick"
  />

  <rect
    x="610"
    y="175"
    width="90"
    height="170"
    rx="4"
    class="morning-green"
  />

  <!-- Gap labels -->

  <path
    d="M305 320 C350 350 385 355 420 345"
    class="morning-guide"
  />

  <text
    x="335"
    y="380"
    class="morning-label"
  >
    Gap Down
  </text>

  <path
    d="M490 335 C535 315 565 295 600 275"
    class="morning-guide"
  />

  <text
    x="520"
    y="335"
    class="morning-label"
  >
    Gap Up
  </text>

  <!-- Candle labels -->

  <text
    x="250"
    y="430"
    text-anchor="middle"
    class="morning-label"
  >
    Candle 1
  </text>

  <text
    x="250"
    y="451"
    text-anchor="middle"
    class="morning-note"
  >
    Sellers control
  </text>

  <text
    x="455"
    y="275"
    text-anchor="middle"
    class="morning-label"
  >
    Candle 2
  </text>

  <text
    x="455"
    y="295"
    text-anchor="middle"
    class="morning-note"
  >
    Indecision
  </text>

  <text
    x="655"
    y="430"
    text-anchor="middle"
    class="morning-label"
  >
    Candle 3
  </text>

  <text
    x="655"
    y="451"
    text-anchor="middle"
    class="morning-note"
  >
    Buyers take control
  </text>

  <text
    x="460"
    y="505"
    text-anchor="middle"
    class="morning-note"
  >
    Strong selling → Star and hesitation → Bullish candle closes above Candle 1 midpoint
  </text>
</svg>
  `,
},

    {
      type: "callout",
      text:
        "TRQX Example: SPY falls into weekly support. Sellers dominate the first candle. The second candle forms a small-bodied Doji showing the selling pressure is fading. The third candle explodes higher with heavy volume, confirming buyers have taken control.",
    },

    {
      type: "heading",
      text: "📖 WHAT IS A MORNING STAR?",
    },

    {
      type: "p",
      text:
        "The Morning Star is a three-candle bullish reversal pattern that signals a transition from seller control to buyer control.",
    },

    {
      type: "p",
      text:
        "Unlike the Hammer or Bullish Engulfing, the Morning Star tells a complete story across three separate candles.",
    },

    {
      type: "heading",
      text: "🧠 THE STORY",
    },

    {
      type: "p",
      text:
        "Candle One shows aggressive selling pressure.",
    },

    {
      type: "p",
      text:
        "Candle Two shows that selling is slowing. Neither buyers nor sellers are in complete control.",
    },

    {
      type: "p",
      text:
        "Candle Three shows buyers overwhelming sellers and reclaiming control of the market.",
    },

    {
      type: "callout",
      text:
        "Professional traders don't memorize the pattern—they read the transition in market psychology.",
    },

    {
      type: "heading",
      text: "📍 LOCATION",
    },

    {
      type: "p",
      text:
        "Morning Stars are strongest after extended declines and near higher-timeframe support.",
    },

    {
      type: "p",
      text:
        "The pattern becomes significantly stronger when accompanied by above-average volume and a reclaim of an important technical level.",
    },

    {
      type: "heading",
      text: "📈 CONFIRMATION",
    },

    {
      type: "p",
      text:
        "Professional traders typically wait for the third candle to close before considering a long entry.",
    },

    {
      type: "p",
      text:
        "Additional confirmation can come from volume, market structure, trend alignment, and momentum.",
    },

    {
      type: "heading",
      text: "🚫 COMMON MISTAKES",
    },

    {
      type: "p",
      text:
        "❌ Trading the second candle before confirmation.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring the larger trend.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring nearby resistance.",
    },

    {
      type: "p",
      text:
        "❌ Assuming every Doji creates a Morning Star.",
    },

    {
      type: "heading",
      text: "✅ TRQX CHECKLIST",
    },

    {
      type: "p",
      text:
        "✔ Prior downtrend",
    },

    {
      type: "p",
      text:
        "✔ Large bearish candle",
    },

    {
      type: "p",
      text:
        "✔ Small indecision candle",
    },

    {
      type: "p",
      text:
        "✔ Strong bullish confirmation candle",
    },

    {
      type: "p",
      text:
        "✔ Support nearby",
    },

    {
      type: "p",
      text:
        "✔ Volume confirms",
    },

    {
      type: "p",
      text:
        "✔ Risk-to-reward remains favorable",
    },

    {
      type: "heading",
      text: "✍ STUDENT ASSIGNMENT",
    },

    {
      type: "p",
      text:
        "Locate three Morning Star patterns on TradingView. Explain the psychology of each candle and determine whether you would trade the setup using the TRQX checklist.",
    },
  ],

  flashcards: [
    {
      front: "How many candles form a Morning Star?",
      back: "Three candles."
    },
    {
      front: "What does Candle 1 represent?",
      back: "Strong seller control."
    },
    {
      front: "What does Candle 2 represent?",
      back: "Indecision and slowing selling pressure."
    },
    {
      front: "What does Candle 3 represent?",
      back: "Buyers taking complete control."
    },
    {
      front: "Where should Morning Stars appear?",
      back: "After a decline near significant support."
    },
    {
      front: "What confirms the pattern?",
      back: "A strong third bullish candle with volume."
    }
  ],

  quiz: [
    {
      question: "How many candles make up a Morning Star?",
      answers: ["2", "3", "4", "5"],
      correctAnswer: 1,
      explanation: "The Morning Star is a three-candle reversal pattern."
    },
    {
      question: "What does the second candle represent?",
      answers: [
        "Strong buying",
        "Strong selling",
        "Indecision",
        "Breakout"
      ],
      correctAnswer: 2,
      explanation: "The middle candle represents indecision."
    },
    {
      question: "What confirms a Morning Star?",
      answers: [
        "Gap up",
        "Large bullish third candle",
        "Large bearish candle",
        "Inside bar"
      ],
      correctAnswer: 1,
      explanation: "The third bullish candle confirms buyers have taken control."
    },
    {
      question: "Where is the highest probability Morning Star found?",
      answers: [
        "Resistance",
        "Random consolidation",
        "Support after a decline",
        "At market open only"
      ],
      correctAnswer: 2,
      explanation: "Context matters more than pattern shape."
    },
    {
      question: "Why is the second candle important?",
      answers: [
        "It shows indecision",
        "It confirms breakout",
        "It creates support",
        "It is always bullish"
      ],
      correctAnswer: 0,
      explanation: "The second candle signals the loss of seller momentum."
    },
    {
      question: "What increases confidence?",
      answers: [
        "Volume",
        "Support",
        "Confirmation",
        "All of the above"
      ],
      correctAnswer: 3,
      explanation: "Professional traders use all available evidence."
    },
    {
      question: "Should traders enter before Candle 3 closes?",
      answers: [
        "Always",
        "Never",
        "Only with confirmation",
        "Only on Fridays"
      ],
      correctAnswer: 2,
      explanation: "Confirmation is critical."
    },
    {
      question: "The Morning Star primarily represents:",
      answers: [
        "Continuation",
        "Bullish reversal",
        "Bearish continuation",
        "Neutral trend"
      ],
      correctAnswer: 1,
      explanation: "It is a bullish reversal pattern."
    }
  ],

  drills: {
    clickIdentify: [],
    dragLabel: null,
    dragTimeline: null,
  },

  mastery: {
    requiredScore: 80,
    unlocks: "evening-star",
    requirements: [
      "Identify the three candles.",
      "Explain the psychology.",
      "Recognize proper location.",
      "Pass the quiz."
    ]
  },

  assignment: {
    title: "Morning Star Analysis",
    instructions: [
      "Find three Morning Stars.",
      "Explain each candle.",
      "Mark support.",
      "Determine if confirmation exists."
    ]
  },

  aiCoach: {
    summary:
      "The Morning Star teaches the transition from seller dominance to buyer dominance over three candles.",
    commonMistakes: [
      "Trading too early.",
      "Ignoring support.",
      "Ignoring volume.",
      "Ignoring confirmation."
    ],
    professionalTips: [
      "Read the story, not just the shape.",
      "Confirmation matters.",
      "Trade context."
    ]
  },

  references: []
};

export default morningStarLesson;