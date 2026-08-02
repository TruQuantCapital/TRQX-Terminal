/**
 * ==========================================================
 * TRQX UNIVERSITY
 * Lesson: Doji
 * ==========================================================
 */

export const dojiLesson = {
  id: "doji",

  title: "Doji",

  objective:
    "Understand how to identify a Doji candlestick, explain the indecision behind it, recognize the major Doji variations, and determine when the pattern has meaningful trading context.",

  estimatedTime: "14 Minutes",

  difficulty: "Beginner",

  content: [
    {
      type: "heading",
      text: "⚖️ THE DOJI",
    },

    {
      type: "svg",
      svg: `
<svg
  width="100%"
  viewBox="0 0 820 470"
  role="img"
  xmlns="http://www.w3.org/2000/svg"
>
  <title>Major Doji candlestick variations</title>

  <desc>
    Standard Doji, Long-Legged Doji, Dragonfly Doji, and Gravestone Doji
    shown with labels and market psychology.
  </desc>

  <style>
    .doji-title {
      fill: #f4d35e;
      font-size: 24px;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }

    .doji-label {
      fill: #ffffff;
      font-size: 15px;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }

    .doji-note {
      fill: #aeb3bc;
      font-size: 12px;
      font-family: Arial, sans-serif;
    }

    .doji-wick {
      stroke: #ffffff;
      stroke-width: 4;
    }

    .doji-body {
      fill: #f4d35e;
    }

    .doji-panel {
      fill: rgba(255,255,255,0.02);
      stroke: rgba(244,211,94,0.25);
      stroke-width: 1;
    }
  </style>

  <text
    x="410"
    y="38"
    text-anchor="middle"
    class="doji-title"
  >
    Major Doji Variations
  </text>

  <rect
    x="35"
    y="70"
    width="170"
    height="310"
    rx="12"
    class="doji-panel"
  />

  <line
    x1="120"
    y1="125"
    x2="120"
    y2="285"
    class="doji-wick"
  />

  <rect
    x="102"
    y="200"
    width="36"
    height="5"
    rx="2"
    class="doji-body"
  />

  <text
    x="120"
    y="325"
    text-anchor="middle"
    class="doji-label"
  >
    Standard Doji
  </text>

  <text
    x="120"
    y="348"
    text-anchor="middle"
    class="doji-note"
  >
    Open and close are
  </text>

  <text
    x="120"
    y="366"
    text-anchor="middle"
    class="doji-note"
  >
    nearly equal
  </text>

  <rect
    x="225"
    y="70"
    width="170"
    height="310"
    rx="12"
    class="doji-panel"
  />

  <line
    x1="310"
    y1="100"
    x2="310"
    y2="315"
    class="doji-wick"
  />

  <rect
    x="292"
    y="200"
    width="36"
    height="5"
    rx="2"
    class="doji-body"
  />

  <text
    x="310"
    y="325"
    text-anchor="middle"
    class="doji-label"
  >
    Long-Legged Doji
  </text>

  <text
    x="310"
    y="348"
    text-anchor="middle"
    class="doji-note"
  >
    Strong movement
  </text>

  <text
    x="310"
    y="366"
    text-anchor="middle"
    class="doji-note"
  >
    in both directions
  </text>

  <rect
    x="415"
    y="70"
    width="170"
    height="310"
    rx="12"
    class="doji-panel"
  />

  <line
    x1="500"
    y1="170"
    x2="500"
    y2="315"
    class="doji-wick"
  />

  <rect
    x="482"
    y="168"
    width="36"
    height="5"
    rx="2"
    class="doji-body"
  />

  <text
    x="500"
    y="325"
    text-anchor="middle"
    class="doji-label"
  >
    Dragonfly Doji
  </text>

  <text
    x="500"
    y="348"
    text-anchor="middle"
    class="doji-note"
  >
    Lower prices were
  </text>

  <text
    x="500"
    y="366"
    text-anchor="middle"
    class="doji-note"
  >
    strongly rejected
  </text>

  <rect
    x="605"
    y="70"
    width="170"
    height="310"
    rx="12"
    class="doji-panel"
  />

  <line
    x1="690"
    y1="100"
    x2="690"
    y2="245"
    class="doji-wick"
  />

  <rect
    x="672"
    y="242"
    width="36"
    height="5"
    rx="2"
    class="doji-body"
  />

  <text
    x="690"
    y="325"
    text-anchor="middle"
    class="doji-label"
  >
    Gravestone Doji
  </text>

  <text
    x="690"
    y="348"
    text-anchor="middle"
    class="doji-note"
  >
    Higher prices were
  </text>

  <text
    x="690"
    y="366"
    text-anchor="middle"
    class="doji-note"
  >
    strongly rejected
  </text>

  <text
    x="410"
    y="425"
    text-anchor="middle"
    class="doji-note"
  >
    A Doji signals indecision. Context and the next candle determine its value.
  </text>
</svg>
      `,
    },

    {
      type: "callout",
      text:
        "TRQX Example: NVDA rallies into a major resistance level and forms a Long-Legged Doji on elevated volume. The following candle closes below the Doji Low. The Doji showed indecision; the next candle provided bearish confirmation.",
    },

    {
      type: "p",
      text:
        "A Doji forms when the Open and Close are identical or nearly identical. The candle body is extremely small, while the upper and lower wicks may vary in length.",
    },

    {
      type: "p",
      text:
        "The Doji represents balance, hesitation, or indecision between buyers and sellers.",
    },

    {
      type: "heading",
      text: "🎯 LESSON OBJECTIVE",
    },

    {
      type: "p",
      text:
        "By the end of this lesson, you should be able to identify the major Doji variations, explain their psychology, evaluate their location, and wait for confirmation before making a trading decision.",
    },

    {
      type: "heading",
      text: "📐 IDENTIFICATION",
    },

    {
      type: "p",
      text:
        "A Doji has little or no real body because the Open and Close are nearly equal.",
    },

    {
      type: "p",
      text:
        "The candle may have short wicks, long wicks, only a lower wick, or only an upper wick.",
    },

    {
      type: "callout",
      text:
        "A Doji does not mean buyers or sellers won. It means neither side established clear control by the Close.",
    },

    {
      type: "heading",
      text: "🧠 BUYER VS SELLER PSYCHOLOGY",
    },

    {
      type: "p",
      text:
        "During the candle, buyers and sellers may both move price aggressively.",
    },

    {
      type: "p",
      text:
        "Despite that movement, price finishes near where it opened. The market ends the period in a temporary stalemate.",
    },

    {
      type: "callout",
      text:
        "The Doji is not the reversal. It is the warning that the side previously in control may be losing conviction.",
    },

    {
      type: "heading",
      text: "📍 LOCATION MATTERS",
    },

    {
      type: "p",
      text:
        "A Doji after a strong uptrend may indicate that buyers are losing momentum.",
    },

    {
      type: "p",
      text:
        "A Doji after a strong downtrend may indicate that sellers are losing momentum.",
    },

    {
      type: "p",
      text:
        "A Doji in the middle of a sideways market usually carries limited value because the market was already indecisive.",
    },

    {
      type: "heading",
      text: "⚖️ STANDARD DOJI",
    },

    {
      type: "p",
      text:
        "The Standard Doji has a very small body with visible upper and lower wicks.",
    },

    {
      type: "p",
      text:
        "It shows a balanced battle in which neither buyers nor sellers maintained control.",
    },

    {
      type: "heading",
      text: "↕️ LONG-LEGGED DOJI",
    },

    {
      type: "p",
      text:
        "The Long-Legged Doji has long upper and lower wicks.",
    },

    {
      type: "p",
      text:
        "It shows strong movement in both directions followed by a return near the opening price.",
    },

    {
      type: "p",
      text:
        "This version represents intense uncertainty and can become important after an extended directional move.",
    },

    {
      type: "heading",
      text: "🐉 DRAGONFLY DOJI",
    },

    {
      type: "p",
      text:
        "The Dragonfly Doji has little or no upper wick and a long lower wick.",
    },

    {
      type: "p",
      text:
        "Sellers pushed price significantly lower, but buyers recovered the entire move before the Close.",
    },

    {
      type: "p",
      text:
        "After a decline at support, this may become bullish if the next candle confirms buyer control.",
    },

    {
      type: "heading",
      text: "🪦 GRAVESTONE DOJI",
    },

    {
      type: "p",
      text:
        "The Gravestone Doji has little or no lower wick and a long upper wick.",
    },

    {
      type: "p",
      text:
        "Buyers pushed price significantly higher, but sellers rejected the entire move before the Close.",
    },

    {
      type: "p",
      text:
        "After a rally at resistance, this may become bearish if the next candle confirms seller control.",
    },

    {
      type: "heading",
      text: "✅ CONFIRMATION",
    },

    {
      type: "p",
      text:
        "A Doji should not be traded without confirmation.",
    },

    {
      type: "p",
      text:
        "Bullish confirmation may include the next candle closing above the Doji High, reclaiming support, or producing strong buying volume.",
    },

    {
      type: "p",
      text:
        "Bearish confirmation may include the next candle closing below the Doji Low, rejecting resistance, or producing strong selling volume.",
    },

    {
      type: "callout",
      text:
        "✅ Professional Tip: Treat the Doji as an alert. Let the next candle reveal whether indecision becomes reversal or continuation.",
    },

    {
      type: "heading",
      text: "🚫 COMMON MISTAKES",
    },

    {
      type: "p",
      text:
        "❌ Treating every Doji as an automatic reversal.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring the prior trend.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring support and resistance.",
    },

    {
      type: "p",
      text:
        "❌ Entering before the next candle confirms direction.",
    },

    {
      type: "p",
      text:
        "❌ Giving excessive weight to a Doji inside random consolidation.",
    },

    {
      type: "p",
      text:
        "❌ Confusing a very small-bodied spinning top with a true Doji.",
    },

    {
      type: "heading",
      text: "✅ PROFESSIONAL CHECKLIST",
    },

    {
      type: "p",
      text:
        "✔ The Open and Close are nearly equal.",
    },

    {
      type: "p",
      text:
        "✔ A meaningful directional move occurred before the Doji.",
    },

    {
      type: "p",
      text:
        "✔ The candle formed at support, resistance, or another important level.",
    },

    {
      type: "p",
      text:
        "✔ Volume and volatility are evaluated.",
    },

    {
      type: "p",
      text:
        "✔ The next candle confirms direction.",
    },

    {
      type: "p",
      text:
        "✔ Risk and invalidation are defined before entry.",
    },

    {
      type: "heading",
      text: "🧠 MEMORY RULE",
    },

    {
      type: "callout",
      text:
        "Remember: Doji = Indecision, Not Direction. The next candle determines whether control shifts or the trend continues.",
    },

    {
      type: "heading",
      text: "✍ STUDENT ASSIGNMENT",
    },

    {
      type: "p",
      text:
        "Open TradingView and locate four Doji candles: one Standard Doji, one Long-Legged Doji, one Dragonfly Doji, and one Gravestone Doji.",
    },

    {
      type: "p",
      text:
        "For each example, document the prior trend, location, volume, next-candle confirmation, and whether the setup should be traded or ignored.",
    },

    {
      type: "heading",
      text: "🧭 LESSON SUMMARY",
    },

    {
      type: "p",
      text:
        "A Doji forms when the Open and Close are nearly equal. It represents indecision rather than an automatic reversal.",
    },

    {
      type: "p",
      text:
        "Its value depends on the prior trend, market location, volume, variation, and the direction of the next candle.",
    },

    {
      type: "heading",
      text: "✅ LESSON COMPLETE WHEN",
    },

    {
      type: "p",
      text:
        "The student can identify the major Doji variations, explain their psychology, determine when the pattern has meaningful context, and wait for confirmation before entering a trade.",
    },
  ],

  flashcards: [
    {
      id: "doji-card-01",
      category: "Recognition",
      front: "What is a Doji?",
      back:
        "A candlestick with an Open and Close that are identical or nearly identical.",
    },

    {
      id: "doji-card-02",
      category: "Psychology",
      front: "What does a Doji represent?",
      back:
        "Indecision or temporary balance between buyers and sellers.",
    },

    {
      id: "doji-card-03",
      category: "Professional Rules",
      front: "Is a Doji automatically a reversal?",
      back:
        "No. The next candle must confirm whether the market reverses or continues.",
    },

    {
      id: "doji-card-04",
      category: "Variations",
      front: "What is a Long-Legged Doji?",
      back:
        "A Doji with long upper and lower wicks, showing strong movement and uncertainty in both directions.",
    },

    {
      id: "doji-card-05",
      category: "Variations",
      front: "What is a Dragonfly Doji?",
      back:
        "A Doji with a long lower wick and little or no upper wick, showing rejection of lower prices.",
    },

    {
      id: "doji-card-06",
      category: "Variations",
      front: "What is a Gravestone Doji?",
      back:
        "A Doji with a long upper wick and little or no lower wick, showing rejection of higher prices.",
    },

    {
      id: "doji-card-07",
      category: "Context",
      front: "When does a Doji carry limited value?",
      back:
        "When it forms in the middle of a sideways market that is already indecisive.",
    },

    {
      id: "doji-card-08",
      category: "Professional Rules",
      front: "What is the TRQX Doji memory rule?",
      back:
        "Doji = Indecision, Not Direction.",
    },
  ],

  quiz: [
    {
      id: "doji-quiz-01",
      question:
        "What defines a Doji candlestick?",
      answers: [
        "A large bullish body",
        "An Open and Close that are nearly equal",
        "A long lower wick only",
        "A guaranteed reversal",
      ],
      correctAnswer: 1,
      explanation:
        "A Doji forms when the Open and Close are identical or nearly identical.",
    },

    {
      id: "doji-quiz-02",
      question:
        "What does a Doji primarily represent?",
      answers: [
        "Guaranteed bullish momentum",
        "Guaranteed bearish momentum",
        "Indecision between buyers and sellers",
        "No market activity",
      ],
      correctAnswer: 2,
      explanation:
        "The Doji shows that neither buyers nor sellers established clear control by the Close.",
    },

    {
      id: "doji-quiz-03",
      question:
        "Why is a Doji not automatically a reversal signal?",
      answers: [
        "It has no wick",
        "It shows indecision but not the next direction",
        "It only appears in premarket",
        "It always confirms continuation",
      ],
      correctAnswer: 1,
      explanation:
        "The Doji identifies uncertainty. The following candle is needed to confirm reversal or continuation.",
    },

    {
      id: "doji-quiz-04",
      question:
        "Which Doji has a long lower wick and little or no upper wick?",
      answers: [
        "Gravestone Doji",
        "Dragonfly Doji",
        "Standard Doji",
        "Marubozu",
      ],
      correctAnswer: 1,
      explanation:
        "The Dragonfly Doji shows strong rejection of lower prices.",
    },

    {
      id: "doji-quiz-05",
      question:
        "Which Doji has a long upper wick and little or no lower wick?",
      answers: [
        "Dragonfly Doji",
        "Long-Legged Doji",
        "Gravestone Doji",
        "Hammer",
      ],
      correctAnswer: 2,
      explanation:
        "The Gravestone Doji shows strong rejection of higher prices.",
    },

    {
      id: "doji-quiz-06",
      question:
        "When does a Doji generally carry the least meaning?",
      answers: [
        "After an extended trend at support or resistance",
        "In the middle of an already sideways market",
        "When volume increases at resistance",
        "When the next candle confirms direction",
      ],
      correctAnswer: 1,
      explanation:
        "Indecision inside an already indecisive market provides little new information.",
    },

    {
      id: "doji-quiz-07",
      question:
        "What is the best action after identifying a Doji?",
      answers: [
        "Enter immediately",
        "Wait for confirmation",
        "Ignore market structure",
        "Assume a reversal",
      ],
      correctAnswer: 1,
      explanation:
        "The next candle should confirm whether buyers or sellers gain control.",
    },

    {
      id: "doji-quiz-08",
      question:
        "Which statement best describes a Long-Legged Doji?",
      answers: [
        "Strong movement in both directions followed by a close near the Open",
        "No volatility during the candle",
        "A guaranteed bullish reversal",
        "A candle with no wicks",
      ],
      correctAnswer: 0,
      explanation:
        "The long wicks show that buyers and sellers both moved price aggressively but neither side controlled the finish.",
    },
  ],

  drills: {
    clickIdentify: [],

    dragLabel: null,

    dragTimeline: null,

    writtenReview: [
      {
        id: "doji-drill-01",
        title: "Doji Classification",
        prompt:
          "Locate and classify a Standard Doji, Long-Legged Doji, Dragonfly Doji, and Gravestone Doji.",
        passingCriteria:
          "Each candle must be classified using its body and wick structure.",
      },

      {
        id: "doji-drill-02",
        title: "Context and Confirmation",
        prompt:
          "For each Doji, identify the prior trend, important level, volume condition, next candle, and whether the setup should be traded or ignored.",
        passingCriteria:
          "Each decision must reference trend, location, volume, confirmation, and invalidation.",
      },
    ],
  },

  mastery: {
    requiredScore: 80,

    unlocks: "bullish-engulfing",

    requirements: [
      "Identify a Standard Doji.",
      "Identify a Long-Legged Doji.",
      "Identify a Dragonfly Doji.",
      "Identify a Gravestone Doji.",
      "Explain why a Doji is not automatically a reversal.",
      "Pass the quiz with at least 80%.",
    ],

    professionalStandards: [
      "Treat the Doji as an alert rather than an entry signal.",
      "Evaluate the prior trend.",
      "Require meaningful market location.",
      "Evaluate volume and volatility.",
      "Wait for next-candle confirmation.",
    ],

    completionMessage:
      "You can now identify the major Doji variations and evaluate them using context and confirmation.",
  },

  assignment: {
    title: "Doji Recognition and Context",

    instructions: [
      "Locate four different Doji examples.",
      "Record the ticker and timeframe.",
      "Classify each Doji variation.",
      "Identify the prior trend.",
      "Mark support or resistance.",
      "Evaluate volume.",
      "Describe the next candle.",
      "State whether you would trade or ignore the pattern.",
      "Define the invalidation level.",
    ],

    passingCriteria:
      "Each example must be classified correctly and evaluated using trend, location, volume, confirmation, and risk.",
  },

  aiCoach: {
    summary:
      "A Doji represents indecision because the Open and Close are nearly equal. The pattern does not predict direction by itself; context and confirmation determine its value.",

    commonMistakes: [
      "Treating every Doji as a reversal.",
      "Ignoring the prior trend.",
      "Ignoring support and resistance.",
      "Entering before confirmation.",
      "Giving too much weight to Doji candles inside consolidation.",
    ],

    professionalTips: [
      "Treat the Doji as a warning that control may be changing.",
      "Identify the specific Doji variation.",
      "Evaluate where the candle formed.",
      "Use volume to measure participation.",
      "Let the next candle confirm direction.",
    ],
  },

  references: [],
};

export default dojiLesson;