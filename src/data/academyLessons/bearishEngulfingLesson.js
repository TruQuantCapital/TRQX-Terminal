/**
 * ==========================================================
 * TRQX UNIVERSITY
 * Lesson: Bearish Engulfing
 * ==========================================================
 */

export const bearishEngulfingLesson = {
  id: "bearish-engulfing",

  title: "Bearish Engulfing",

  objective:
    "Understand how to identify a Bearish Engulfing pattern, explain the shift from buyer control to seller control, and determine when the pattern supports a high-quality bearish reversal setup.",

  estimatedTime: "14 Minutes",

  difficulty: "Beginner",

  content: [
    {
      type: "heading",
      text: "🔴 BEARISH ENGULFING",
    },

    {
      type: "svg",
      svg: `
<svg
  width="100%"
  viewBox="0 0 860 470"
  role="img"
  xmlns="http://www.w3.org/2000/svg"
>
  <title>Bearish Engulfing candlestick pattern</title>

  <desc>
    A small bullish candle followed by a larger bearish candle whose
    real body completely engulfs the prior bullish body at resistance.
  </desc>

  <style>
    .bear-engulf-title {
      fill: #f4d35e;
      font-size: 24px;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }

    .bear-engulf-label {
      fill: #ffffff;
      font-size: 15px;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }

    .bear-engulf-note {
      fill: #aeb3bc;
      font-size: 13px;
      font-family: Arial, sans-serif;
    }

    .bear-engulf-resistance {
      stroke: #ef4444;
      stroke-width: 3;
      stroke-dasharray: 8 6;
    }

    .bear-engulf-bull {
      fill: #22c55e;
    }

    .bear-engulf-bear {
      fill: #ef4444;
    }

    .bear-engulf-wick {
      stroke: #ffffff;
      stroke-width: 4;
    }

    .bear-engulf-arrow {
      stroke: #f4d35e;
      stroke-width: 2;
      fill: none;
      marker-end: url(#bear-engulf-arrow-head);
    }

    .bear-engulf-panel {
      fill: rgba(255,255,255,0.02);
      stroke: rgba(244,211,94,0.25);
      stroke-width: 1;
    }
  </style>

  <defs>
    <marker
      id="bear-engulf-arrow-head"
      markerWidth="10"
      markerHeight="10"
      refX="6"
      refY="3"
      orient="auto"
    >
      <path
        d="M0,0 L0,6 L7,3 Z"
        fill="#f4d35e"
      />
    </marker>
  </defs>

  <text
    x="430"
    y="38"
    text-anchor="middle"
    class="bear-engulf-title"
  >
    Bearish Engulfing Pattern
  </text>

  <rect
    x="70"
    y="65"
    width="720"
    height="320"
    rx="14"
    class="bear-engulf-panel"
  />

  <line
    x1="120"
    y1="105"
    x2="740"
    y2="105"
    class="bear-engulf-resistance"
  />

  <text
    x="748"
    y="110"
    class="bear-engulf-label"
  >
    Resistance
  </text>

  <line
    x1="320"
    y1="135"
    x2="320"
    y2="300"
    class="bear-engulf-wick"
  />

  <rect
    x="290"
    y="180"
    width="60"
    height="70"
    rx="3"
    class="bear-engulf-bull"
  />

  <text
    x="320"
    y="375"
    text-anchor="middle"
    class="bear-engulf-label"
  >
    Candle 1
  </text>

  <text
    x="320"
    y="397"
    text-anchor="middle"
    class="bear-engulf-note"
  >
    Buyers remain in control
  </text>

  <line
    x1="500"
    y1="100"
    x2="500"
    y2="320"
    class="bear-engulf-wick"
  />

  <rect
    x="455"
    y="135"
    width="90"
    height="145"
    rx="3"
    class="bear-engulf-bear"
  />

  <text
    x="500"
    y="375"
    text-anchor="middle"
    class="bear-engulf-label"
  >
    Candle 2
  </text>

  <text
    x="500"
    y="397"
    text-anchor="middle"
    class="bear-engulf-note"
  >
    Sellers overwhelm buyers
  </text>

  <path
    d="M590 145 C650 130 690 130 720 155"
    class="bear-engulf-arrow"
  />

  <text
    x="625"
    y="116"
    class="bear-engulf-label"
  >
    Body opens above
  </text>

  <text
    x="625"
    y="137"
    class="bear-engulf-label"
  >
    Candle 1 close
  </text>

  <path
    d="M590 275 C650 290 690 290 720 270"
    class="bear-engulf-arrow"
  />

  <text
    x="610"
    y="312"
    class="bear-engulf-label"
  >
    Body closes below
  </text>

  <text
    x="610"
    y="332"
    class="bear-engulf-label"
  >
    Candle 1 open
  </text>

  <text
    x="430"
    y="442"
    text-anchor="middle"
    class="bear-engulf-note"
  >
    The second candle's body completely covers the first candle's body.
  </text>
</svg>
      `,
    },

    {
      type: "callout",
      text:
        "TRQX Example: QQQ rallies into a prior daily resistance zone. A small bullish candle forms first. The next candle opens higher, reverses sharply, and closes below the entire body of the prior candle on elevated volume. Buyers began in control, but sellers decisively took over.",
    },

    {
      type: "p",
      text:
        "A Bearish Engulfing pattern is a two-candle bearish reversal formation.",
    },

    {
      type: "p",
      text:
        "The first candle is bullish. The second candle is bearish, and its real body completely covers—or engulfs—the real body of the first candle.",
    },

    {
      type: "heading",
      text: "🎯 LESSON OBJECTIVE",
    },

    {
      type: "p",
      text:
        "By the end of this lesson, you should be able to identify a valid Bearish Engulfing pattern, explain the shift in control, evaluate its location, and wait for confirmation before entering a bearish trade.",
    },

    {
      type: "heading",
      text: "📐 IDENTIFICATION",
    },

    {
      type: "p",
      text:
        "Candle 1 is bullish and reflects buyer control.",
    },

    {
      type: "p",
      text:
        "Candle 2 is bearish and has a real body larger than Candle 1's body.",
    },

    {
      type: "p",
      text:
        "The second candle generally opens at or above the first candle's Close and closes below the first candle's Open.",
    },

    {
      type: "callout",
      text:
        "The real bodies must be engulfed. The second candle does not need to cover both wicks.",
    },

    {
      type: "heading",
      text: "🧠 BUYER VS SELLER PSYCHOLOGY",
    },

    {
      type: "p",
      text:
        "The first candle shows buyers maintaining control and closing price higher.",
    },

    {
      type: "p",
      text:
        "The second candle may initially open strong, suggesting buyers are still active.",
    },

    {
      type: "p",
      text:
        "Sellers then enter aggressively, absorb the buying pressure, erase the entire prior bullish body, and close below it.",
    },

    {
      type: "callout",
      text:
        "The pattern matters because sellers did not merely slow the rally—they erased the prior buying move and finished in control.",
    },

    {
      type: "heading",
      text: "📍 LOCATION MATTERS",
    },

    {
      type: "p",
      text:
        "The highest-quality Bearish Engulfing pattern forms after a rally at meaningful resistance.",
    },

    {
      type: "p",
      text:
        "Useful locations include prior resistance, a supply zone, a major moving average, a previous breakdown level, or higher-timeframe structure.",
    },

    {
      type: "p",
      text:
        "A Bearish Engulfing pattern in the middle of random consolidation carries less value because there is no clear buyer move to reverse.",
    },

    {
      type: "heading",
      text: "📊 BODY VS WICKS",
    },

    {
      type: "p",
      text:
        "The pattern is based primarily on the real bodies of the two candles.",
    },

    {
      type: "p",
      text:
        "The bearish candle should engulf the prior bullish body. It is not required to engulf the entire wick-to-wick range.",
    },

    {
      type: "p",
      text:
        "A large bearish body that closes near its Low shows stronger seller conviction than a candle with a weak Close and large lower wick.",
    },

    {
      type: "heading",
      text: "✅ CONFIRMATION",
    },

    {
      type: "p",
      text:
        "A Bearish Engulfing pattern is evidence of a possible reversal, not a guaranteed entry.",
    },

    {
      type: "p",
      text:
        "Confirmation may include the next candle holding below the engulfing candle's midpoint, closing below its Low, rejecting resistance, or producing continued lower highs.",
    },

    {
      type: "p",
      text:
        "Above-average volume on the engulfing candle strengthens the evidence that sellers participated with conviction.",
    },

    {
      type: "callout",
      text:
        "✅ Professional Tip: The stronger the engulfing candle closes relative to its range, the stronger the evidence that sellers controlled the finish.",
    },

    {
      type: "heading",
      text: "🚫 COMMON MISTAKES",
    },

    {
      type: "p",
      text:
        "❌ Calling the pattern engulfing when only the wick overlaps.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring whether a rally occurred before the pattern.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring resistance or higher-timeframe structure.",
    },

    {
      type: "p",
      text:
        "❌ Entering after an oversized candle without considering risk-to-reward.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring a large lower wick on the bearish candle.",
    },

    {
      type: "p",
      text:
        "❌ Assuming the pattern guarantees a full trend reversal.",
    },

    {
      type: "heading",
      text: "✅ PROFESSIONAL CHECKLIST",
    },

    {
      type: "p",
      text:
        "✔ A rally or bullish move occurred before the pattern.",
    },

    {
      type: "p",
      text:
        "✔ Candle 1 is bullish.",
    },

    {
      type: "p",
      text:
        "✔ Candle 2 is bearish.",
    },

    {
      type: "p",
      text:
        "✔ Candle 2's real body completely engulfs Candle 1's real body.",
    },

    {
      type: "p",
      text:
        "✔ The pattern forms at meaningful resistance or supply.",
    },

    {
      type: "p",
      text:
        "✔ Volume supports the reversal.",
    },

    {
      type: "p",
      text:
        "✔ The bearish candle closes strongly.",
    },

    {
      type: "p",
      text:
        "✔ Follow-through confirms seller control.",
    },

    {
      type: "p",
      text:
        "✔ The entry still offers acceptable risk-to-reward.",
    },

    {
      type: "heading",
      text: "🧠 MEMORY RULE",
    },

    {
      type: "callout",
      text:
        "Remember: Buyers Control → Sellers Absorb → Sellers Engulf → Sellers Confirm.",
    },

    {
      type: "heading",
      text: "✍ STUDENT ASSIGNMENT",
    },

    {
      type: "p",
      text:
        "Open TradingView and locate three Bearish Engulfing patterns.",
    },

    {
      type: "p",
      text:
        "For each example, document the prior trend, resistance level, body relationship, volume, confirmation candle, entry idea, invalidation level, and whether the setup should be traded or passed.",
    },

    {
      type: "heading",
      text: "🧭 LESSON SUMMARY",
    },

    {
      type: "p",
      text:
        "A Bearish Engulfing pattern is a two-candle reversal formation in which a strong bearish body completely covers the prior bullish body.",
    },

    {
      type: "p",
      text:
        "It shows a decisive shift from buyer control to seller control, but it becomes valuable only when location, volume, confirmation, and risk align.",
    },

    {
      type: "heading",
      text: "✅ LESSON COMPLETE WHEN",
    },

    {
      type: "p",
      text:
        "The student can identify a valid Bearish Engulfing pattern, distinguish body engulfing from wick overlap, explain the psychology, and evaluate confirmation and risk before entry.",
    },
  ],

  flashcards: [
    {
      id: "bearish-engulfing-card-01",
      category: "Recognition",
      front: "What is a Bearish Engulfing pattern?",
      back:
        "A two-candle bearish reversal pattern in which the second bearish candle's body completely covers the first bullish candle's body.",
    },

    {
      id: "bearish-engulfing-card-02",
      category: "Structure",
      front: "Do the wicks need to be engulfed?",
      back:
        "No. The pattern is defined by the second candle engulfing the first candle's real body.",
    },

    {
      id: "bearish-engulfing-card-03",
      category: "Location",
      front:
        "Where should a high-quality Bearish Engulfing pattern form?",
      back:
        "After a rally at meaningful resistance or supply.",
    },

    {
      id: "bearish-engulfing-card-04",
      category: "Psychology",
      front:
        "What does a Bearish Engulfing pattern reveal?",
      back:
        "Sellers absorbed the buying pressure, erased the prior bullish body, and closed in control.",
    },

    {
      id: "bearish-engulfing-card-05",
      category: "Confirmation",
      front:
        "What strengthens a Bearish Engulfing setup?",
      back:
        "Strong volume, a close near the Low, resistance, and bearish follow-through.",
    },

    {
      id: "bearish-engulfing-card-06",
      category: "Professional Rules",
      front:
        "What is the TRQX Bearish Engulfing memory rule?",
      back:
        "Buyers Control → Sellers Absorb → Sellers Engulf → Sellers Confirm.",
    },
  ],

  quiz: [
    {
      id: "bearish-engulfing-quiz-01",
      question:
        "What defines a Bearish Engulfing pattern?",
      answers: [
        "A bearish wick covers a bullish wick",
        "A bearish body completely covers the prior bullish body",
        "Two bearish candles form together",
        "A Doji forms at resistance",
      ],
      correctAnswer: 1,
      explanation:
        "The second bearish candle's real body must completely engulf the prior bullish candle's real body.",
    },

    {
      id: "bearish-engulfing-quiz-02",
      question:
        "Do both wicks need to be engulfed?",
      answers: [
        "Yes, always",
        "No, the real bodies define the pattern",
        "Only the upper wick",
        "Only the lower wick",
      ],
      correctAnswer: 1,
      explanation:
        "Engulfing refers primarily to the relationship between the real bodies.",
    },

    {
      id: "bearish-engulfing-quiz-03",
      question:
        "Where does the highest-quality Bearish Engulfing pattern usually form?",
      answers: [
        "After a decline at support",
        "After a rally at resistance",
        "In random consolidation",
        "Only during premarket",
      ],
      correctAnswer: 1,
      explanation:
        "The pattern is most meaningful when sellers reverse a bullish move at resistance or supply.",
    },

    {
      id: "bearish-engulfing-quiz-04",
      question:
        "What does the pattern's psychology show?",
      answers: [
        "Buyers remained in control",
        "Sellers erased the prior buying move and closed in control",
        "Neither side participated",
        "Volume disappeared",
      ],
      correctAnswer: 1,
      explanation:
        "The bearish candle demonstrates that sellers absorbed the buying pressure and overwhelmed buyers.",
    },

    {
      id: "bearish-engulfing-quiz-05",
      question:
        "Which feature strengthens the pattern?",
      answers: [
        "A weak Close with a large lower wick",
        "Above-average volume and strong bearish follow-through",
        "Formation in random sideways price action",
        "Entering without confirmation",
      ],
      correctAnswer: 1,
      explanation:
        "Volume and follow-through provide evidence that sellers maintained control.",
    },

    {
      id: "bearish-engulfing-quiz-06",
      question:
        "Why might a valid Bearish Engulfing pattern still be a poor trade?",
      answers: [
        "The candle is red",
        "The entry offers poor risk-to-reward after an oversized move",
        "It formed at resistance",
        "Volume increased",
      ],
      correctAnswer: 1,
      explanation:
        "A valid pattern does not automatically create a good trade if the stop is too wide or the entry is extended.",
    },

    {
      id: "bearish-engulfing-quiz-07",
      question:
        "What should a trader evaluate after the pattern forms?",
      answers: [
        "Only candle color",
        "Confirmation, volume, location, and risk",
        "Only the ticker symbol",
        "Nothing else",
      ],
      correctAnswer: 1,
      explanation:
        "Professional execution requires context, confirmation, and acceptable risk.",
    },

    {
      id: "bearish-engulfing-quiz-08",
      question:
        "Which sequence best describes the pattern?",
      answers: [
        "Sellers control, buyers absorb, buyers engulf",
        "Buyers control, sellers absorb, sellers engulf",
        "Neither side moves price",
        "Buyers and sellers remain balanced",
      ],
      correctAnswer: 1,
      explanation:
        "The pattern begins with buyer control and ends with sellers decisively taking over.",
    },
  ],

  drills: {
    clickIdentify: [],

    dragLabel: null,

    dragTimeline: null,

    writtenReview: [
      {
        id: "bearish-engulfing-drill-01",
        title: "Pattern Recognition",
        prompt:
          "Locate three Bearish Engulfing candidates and verify that Candle 2's body fully engulfs Candle 1's body.",
        passingCriteria:
          "Each pattern must satisfy the real-body engulfing requirement.",
      },

      {
        id: "bearish-engulfing-drill-02",
        title: "Trade or Pass",
        prompt:
          "Evaluate each pattern using trend, resistance, volume, confirmation, risk-to-reward, and invalidation.",
        passingCriteria:
          "Each decision must be supported by market evidence rather than pattern shape alone.",
      },
    ],
  },

  mastery: {
    requiredScore: 80,

    unlocks: "morning-star",

    requirements: [
      "Identify a valid Bearish Engulfing pattern.",
      "Explain the body-engulfing requirement.",
      "Explain the buyer-versus-seller psychology.",
      "Recognize proper resistance location.",
      "Evaluate confirmation and risk.",
      "Pass the quiz with at least 80%.",
    ],

    professionalStandards: [
      "Require a prior rally.",
      "Require true body engulfing.",
      "Favor patterns at meaningful resistance.",
      "Evaluate volume and candle quality.",
      "Wait for follow-through.",
      "Reject setups with poor risk-to-reward.",
    ],

    completionMessage:
      "You can now identify and evaluate Bearish Engulfing patterns using professional context, confirmation, and risk.",
  },

  assignment: {
    title: "Bearish Engulfing Recognition",

    instructions: [
      "Locate three Bearish Engulfing patterns.",
      "Record the ticker and timeframe.",
      "Identify the prior rally.",
      "Mark the resistance or supply level.",
      "Verify the body-engulfing relationship.",
      "Evaluate volume.",
      "Identify bearish confirmation.",
      "Define the entry and invalidation.",
      "Calculate whether the setup offers acceptable risk-to-reward.",
      "State whether you would trade or pass.",
    ],

    passingCriteria:
      "Each example must be evaluated using structure, location, volume, confirmation, and risk.",
  },

  aiCoach: {
    summary:
      "A Bearish Engulfing pattern shows sellers absorbing and reversing the prior buying pressure. The second bearish body completely engulfs the prior bullish body.",

    commonMistakes: [
      "Confusing wick overlap with body engulfing.",
      "Ignoring the prior rally.",
      "Ignoring resistance.",
      "Entering after an oversized candle without evaluating risk.",
      "Ignoring weak follow-through.",
    ],

    professionalTips: [
      "Verify the real-body relationship.",
      "Favor patterns at higher-timeframe resistance.",
      "Evaluate where the bearish candle closes.",
      "Use volume to confirm seller participation.",
      "Demand acceptable risk-to-reward.",
    ],
  },

  references: [],
};

export default bearishEngulfingLesson;