/**
 * ==========================================================
 * TRQX UNIVERSITY
 * Lesson: Bullish Engulfing
 * ==========================================================
 */

export const bullishEngulfingLesson = {
  id: "bullish-engulfing",

  title: "Bullish Engulfing",

  objective:
    "Understand how to identify a Bullish Engulfing pattern, explain the shift from seller control to buyer control, and determine when the pattern supports a high-quality bullish reversal setup.",

  estimatedTime: "14 Minutes",

  difficulty: "Beginner",

  content: [
    {
      type: "heading",
      text: "🟢 BULLISH ENGULFING",
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
  <title>Bullish Engulfing candlestick pattern</title>

  <desc>
    A small bearish candle followed by a larger bullish candle whose
    real body completely engulfs the prior bearish body at support.
  </desc>

  <style>
    .bull-engulf-title {
      fill: #f4d35e;
      font-size: 24px;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }

    .bull-engulf-label {
      fill: #ffffff;
      font-size: 15px;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }

    .bull-engulf-note {
      fill: #aeb3bc;
      font-size: 13px;
      font-family: Arial, sans-serif;
    }

    .bull-engulf-support {
      stroke: #00bfff;
      stroke-width: 3;
      stroke-dasharray: 8 6;
    }

    .bull-engulf-bear {
      fill: #ef4444;
    }

    .bull-engulf-bull {
      fill: #22c55e;
    }

    .bull-engulf-wick {
      stroke: #ffffff;
      stroke-width: 4;
    }

    .bull-engulf-arrow {
      stroke: #f4d35e;
      stroke-width: 2;
      fill: none;
      marker-end: url(#bull-engulf-arrow-head);
    }

    .bull-engulf-panel {
      fill: rgba(255,255,255,0.02);
      stroke: rgba(244,211,94,0.25);
      stroke-width: 1;
    }
  </style>

  <defs>
    <marker
      id="bull-engulf-arrow-head"
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
    class="bull-engulf-title"
  >
    Bullish Engulfing Pattern
  </text>

  <rect
    x="70"
    y="65"
    width="720"
    height="320"
    rx="14"
    class="bull-engulf-panel"
  />

  <line
    x1="120"
    y1="335"
    x2="740"
    y2="335"
    class="bull-engulf-support"
  />

  <text
    x="748"
    y="340"
    class="bull-engulf-label"
  >
    Support
  </text>

  <line
    x1="320"
    y1="135"
    x2="320"
    y2="300"
    class="bull-engulf-wick"
  />

  <rect
    x="290"
    y="180"
    width="60"
    height="70"
    rx="3"
    class="bull-engulf-bear"
  />

  <text
    x="320"
    y="375"
    text-anchor="middle"
    class="bull-engulf-label"
  >
    Candle 1
  </text>

  <text
    x="320"
    y="397"
    text-anchor="middle"
    class="bull-engulf-note"
  >
    Sellers remain in control
  </text>

  <line
    x1="500"
    y1="100"
    x2="500"
    y2="320"
    class="bull-engulf-wick"
  />

  <rect
    x="455"
    y="135"
    width="90"
    height="145"
    rx="3"
    class="bull-engulf-bull"
  />

  <text
    x="500"
    y="375"
    text-anchor="middle"
    class="bull-engulf-label"
  >
    Candle 2
  </text>

  <text
    x="500"
    y="397"
    text-anchor="middle"
    class="bull-engulf-note"
  >
    Buyers overwhelm sellers
  </text>

  <path
    d="M590 150 C650 130 690 130 720 155"
    class="bull-engulf-arrow"
  />

  <text
    x="635"
    y="115"
    class="bull-engulf-label"
  >
    Body closes above
  </text>

  <text
    x="635"
    y="136"
    class="bull-engulf-label"
  >
    Candle 1 open
  </text>

  <path
    d="M590 275 C650 290 690 290 720 270"
    class="bull-engulf-arrow"
  />

  <text
    x="620"
    y="312"
    class="bull-engulf-label"
  >
    Body opens below
  </text>

  <text
    x="620"
    y="332"
    class="bull-engulf-label"
  >
    Candle 1 close
  </text>

  <text
    x="430"
    y="442"
    text-anchor="middle"
    class="bull-engulf-note"
  >
    The second candle's body completely covers the first candle's body.
  </text>
</svg>
      `,
    },

    {
      type: "callout",
      text:
        "TRQX Example: SPY declines into a prior daily support zone. A small bearish candle forms first. The next candle opens lower, reverses sharply, and closes above the entire body of the prior candle on elevated volume. Sellers began in control, but buyers decisively took over.",
    },

    {
      type: "p",
      text:
        "A Bullish Engulfing pattern is a two-candle bullish reversal formation.",
    },

    {
      type: "p",
      text:
        "The first candle is bearish. The second candle is bullish, and its real body completely covers—or engulfs—the real body of the first candle.",
    },

    {
      type: "heading",
      text: "🎯 LESSON OBJECTIVE",
    },

    {
      type: "p",
      text:
        "By the end of this lesson, you should be able to identify a valid Bullish Engulfing pattern, explain the shift in control, evaluate its location, and wait for confirmation before entering a bullish trade.",
    },

    {
      type: "heading",
      text: "📐 IDENTIFICATION",
    },

    {
      type: "p",
      text:
        "Candle 1 is bearish and reflects seller control.",
    },

    {
      type: "p",
      text:
        "Candle 2 is bullish and has a real body larger than Candle 1's body.",
    },

    {
      type: "p",
      text:
        "The second candle generally opens at or below the first candle's Close and closes above the first candle's Open.",
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
        "The first candle shows sellers maintaining control and closing price lower.",
    },

    {
      type: "p",
      text:
        "The second candle may initially open weak, suggesting sellers are still active.",
    },

    {
      type: "p",
      text:
        "Buyers then enter aggressively, absorb the selling pressure, recover the entire prior candle body, and close above it.",
    },

    {
      type: "callout",
      text:
        "The pattern matters because buyers did not merely stop the decline—they erased the prior selling move and finished in control.",
    },

    {
      type: "heading",
      text: "📍 LOCATION MATTERS",
    },

    {
      type: "p",
      text:
        "The highest-quality Bullish Engulfing pattern forms after a decline at meaningful support.",
    },

    {
      type: "p",
      text:
        "Useful locations include prior support, a demand zone, a major moving average, a previous breakout level, or higher-timeframe structure.",
    },

    {
      type: "p",
      text:
        "A Bullish Engulfing pattern in the middle of random consolidation carries less value because there is no clear seller move to reverse.",
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
        "The bullish candle should engulf the prior bearish body. It is not required to engulf the entire wick-to-wick range.",
    },

    {
      type: "p",
      text:
        "A large bullish body that closes near its High shows stronger buyer conviction than a candle with a weak Close and large upper wick.",
    },

    {
      type: "heading",
      text: "✅ CONFIRMATION",
    },

    {
      type: "p",
      text:
        "A Bullish Engulfing pattern is evidence of a possible reversal, not a guaranteed entry.",
    },

    {
      type: "p",
      text:
        "Confirmation may include the next candle holding above the engulfing candle's midpoint, closing above its High, reclaiming support, or producing continued higher lows.",
    },

    {
      type: "p",
      text:
        "Above-average volume on the engulfing candle strengthens the evidence that buyers participated with conviction.",
    },

    {
      type: "callout",
      text:
        "✅ Professional Tip: The stronger the engulfing candle closes relative to its range, the stronger the evidence that buyers controlled the finish.",
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
        "❌ Ignoring whether a decline occurred before the pattern.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring support or higher-timeframe structure.",
    },

    {
      type: "p",
      text:
        "❌ Entering after an oversized candle without considering risk-to-reward.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring a large upper wick on the bullish candle.",
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
        "✔ A decline or bearish move occurred before the pattern.",
    },

    {
      type: "p",
      text:
        "✔ Candle 1 is bearish.",
    },

    {
      type: "p",
      text:
        "✔ Candle 2 is bullish.",
    },

    {
      type: "p",
      text:
        "✔ Candle 2's real body completely engulfs Candle 1's real body.",
    },

    {
      type: "p",
      text:
        "✔ The pattern forms at meaningful support or demand.",
    },

    {
      type: "p",
      text:
        "✔ Volume supports the reversal.",
    },

    {
      type: "p",
      text:
        "✔ The bullish candle closes strongly.",
    },

    {
      type: "p",
      text:
        "✔ Follow-through confirms buyer control.",
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
        "Remember: Sellers Control → Buyers Absorb → Buyers Engulf → Buyers Confirm.",
    },

    {
      type: "heading",
      text: "✍ STUDENT ASSIGNMENT",
    },

    {
      type: "p",
      text:
        "Open TradingView and locate three Bullish Engulfing patterns.",
    },

    {
      type: "p",
      text:
        "For each example, document the prior trend, support level, body relationship, volume, confirmation candle, entry idea, invalidation level, and whether the setup should be traded or passed.",
    },

    {
      type: "heading",
      text: "🧭 LESSON SUMMARY",
    },

    {
      type: "p",
      text:
        "A Bullish Engulfing pattern is a two-candle reversal formation in which a strong bullish body completely covers the prior bearish body.",
    },

    {
      type: "p",
      text:
        "It shows a decisive shift from seller control to buyer control, but it becomes valuable only when location, volume, confirmation, and risk align.",
    },

    {
      type: "heading",
      text: "✅ LESSON COMPLETE WHEN",
    },

    {
      type: "p",
      text:
        "The student can identify a valid Bullish Engulfing pattern, distinguish body engulfing from wick overlap, explain the psychology, and evaluate confirmation and risk before entry.",
    },
  ],

  flashcards: [
    {
      id: "bullish-engulfing-card-01",
      category: "Recognition",
      front: "What is a Bullish Engulfing pattern?",
      back:
        "A two-candle bullish reversal pattern in which the second bullish candle's body completely covers the first bearish candle's body.",
    },

    {
      id: "bullish-engulfing-card-02",
      category: "Structure",
      front: "Do the wicks need to be engulfed?",
      back:
        "No. The pattern is defined by the second candle engulfing the first candle's real body.",
    },

    {
      id: "bullish-engulfing-card-03",
      category: "Location",
      front:
        "Where should a high-quality Bullish Engulfing pattern form?",
      back:
        "After a decline at meaningful support or demand.",
    },

    {
      id: "bullish-engulfing-card-04",
      category: "Psychology",
      front:
        "What does a Bullish Engulfing pattern reveal?",
      back:
        "Buyers absorbed the selling pressure, erased the prior bearish body, and closed in control.",
    },

    {
      id: "bullish-engulfing-card-05",
      category: "Confirmation",
      front:
        "What strengthens a Bullish Engulfing setup?",
      back:
        "Strong volume, a close near the High, support, and bullish follow-through.",
    },

    {
      id: "bullish-engulfing-card-06",
      category: "Professional Rules",
      front:
        "What is the TRQX Bullish Engulfing memory rule?",
      back:
        "Sellers Control → Buyers Absorb → Buyers Engulf → Buyers Confirm.",
    },
  ],

  quiz: [
    {
      id: "bullish-engulfing-quiz-01",
      question:
        "What defines a Bullish Engulfing pattern?",
      answers: [
        "A bullish wick covers a bearish wick",
        "A bullish body completely covers the prior bearish body",
        "Two bullish candles form together",
        "A Doji forms after support",
      ],
      correctAnswer: 1,
      explanation:
        "The second bullish candle's real body must completely engulf the prior bearish candle's real body.",
    },

    {
      id: "bullish-engulfing-quiz-02",
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
      id: "bullish-engulfing-quiz-03",
      question:
        "Where does the highest-quality Bullish Engulfing pattern usually form?",
      answers: [
        "After a decline at support",
        "After a rally at resistance",
        "In random consolidation",
        "Only during premarket",
      ],
      correctAnswer: 0,
      explanation:
        "The pattern is most meaningful when buyers reverse a bearish move at support or demand.",
    },

    {
      id: "bullish-engulfing-quiz-04",
      question:
        "What does the pattern's psychology show?",
      answers: [
        "Sellers remained in control",
        "Buyers erased the prior selling move and closed in control",
        "Neither side participated",
        "Volume disappeared",
      ],
      correctAnswer: 1,
      explanation:
        "The bullish candle demonstrates that buyers absorbed the selling pressure and overwhelmed sellers.",
    },

    {
      id: "bullish-engulfing-quiz-05",
      question:
        "Which feature strengthens the pattern?",
      answers: [
        "A weak Close with a large upper wick",
        "Above-average volume and strong bullish follow-through",
        "Formation in random sideways price action",
        "Entering without confirmation",
      ],
      correctAnswer: 1,
      explanation:
        "Volume and follow-through provide evidence that buyers maintained control.",
    },

    {
      id: "bullish-engulfing-quiz-06",
      question:
        "Why might a valid Bullish Engulfing pattern still be a poor trade?",
      answers: [
        "The candle is green",
        "The entry offers poor risk-to-reward after an oversized move",
        "It formed at support",
        "Volume increased",
      ],
      correctAnswer: 1,
      explanation:
        "A valid pattern does not automatically create a good trade if the stop is too wide or the entry is extended.",
    },

    {
      id: "bullish-engulfing-quiz-07",
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
      id: "bullish-engulfing-quiz-08",
      question:
        "Which sequence best describes the pattern?",
      answers: [
        "Buyers control, sellers absorb, sellers engulf",
        "Sellers control, buyers absorb, buyers engulf",
        "Neither side moves price",
        "Buyers and sellers remain balanced",
      ],
      correctAnswer: 1,
      explanation:
        "The pattern begins with seller control and ends with buyers decisively taking over.",
    },
  ],

  drills: {
    clickIdentify: [],

    dragLabel: null,

    dragTimeline: null,

    writtenReview: [
      {
        id: "bullish-engulfing-drill-01",
        title: "Pattern Recognition",
        prompt:
          "Locate three Bullish Engulfing candidates and verify that Candle 2's body fully engulfs Candle 1's body.",
        passingCriteria:
          "Each pattern must satisfy the real-body engulfing requirement.",
      },

      {
        id: "bullish-engulfing-drill-02",
        title: "Trade or Pass",
        prompt:
          "Evaluate each pattern using trend, support, volume, confirmation, risk-to-reward, and invalidation.",
        passingCriteria:
          "Each decision must be supported by market evidence rather than pattern shape alone.",
      },
    ],
  },

  mastery: {
    requiredScore: 80,

    unlocks: "bearish-engulfing",

    requirements: [
      "Identify a valid Bullish Engulfing pattern.",
      "Explain the body-engulfing requirement.",
      "Explain the buyer-versus-seller psychology.",
      "Recognize proper support location.",
      "Evaluate confirmation and risk.",
      "Pass the quiz with at least 80%.",
    ],

    professionalStandards: [
      "Require a prior decline.",
      "Require true body engulfing.",
      "Favor patterns at meaningful support.",
      "Evaluate volume and candle quality.",
      "Wait for follow-through.",
      "Reject setups with poor risk-to-reward.",
    ],

    completionMessage:
      "You can now identify and evaluate Bullish Engulfing patterns using professional context, confirmation, and risk.",
  },

  assignment: {
    title: "Bullish Engulfing Recognition",

    instructions: [
      "Locate three Bullish Engulfing patterns.",
      "Record the ticker and timeframe.",
      "Identify the prior decline.",
      "Mark the support or demand level.",
      "Verify the body-engulfing relationship.",
      "Evaluate volume.",
      "Identify bullish confirmation.",
      "Define the entry and invalidation.",
      "Calculate whether the setup offers acceptable risk-to-reward.",
      "State whether you would trade or pass.",
    ],

    passingCriteria:
      "Each example must be evaluated using structure, location, volume, confirmation, and risk.",
  },

  aiCoach: {
    summary:
      "A Bullish Engulfing pattern shows buyers absorbing and reversing the prior selling pressure. The second bullish body completely engulfs the prior bearish body.",

    commonMistakes: [
      "Confusing wick overlap with body engulfing.",
      "Ignoring the prior decline.",
      "Ignoring support.",
      "Entering after an oversized candle without evaluating risk.",
      "Ignoring weak follow-through.",
    ],

    professionalTips: [
      "Verify the real-body relationship.",
      "Favor patterns at higher-timeframe support.",
      "Evaluate where the bullish candle closes.",
      "Use volume to confirm buyer participation.",
      "Demand acceptable risk-to-reward.",
    ],
  },

  references: [],
};

export default bullishEngulfingLesson;