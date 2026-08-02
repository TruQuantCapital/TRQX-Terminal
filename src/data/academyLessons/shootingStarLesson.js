/**
 * ==========================================================
 * TRQX UNIVERSITY
 * Lesson: Shooting Star
 * ==========================================================
 */

export const shootingStarLesson = {
  id: "shooting-star",

  title: "Shooting Star",

  objective:
    "Understand how to identify a Shooting Star candlestick, explain the psychology behind it, and determine when it is a high-quality bearish reversal signal.",

  estimatedTime: "12 Minutes",

  difficulty: "Beginner",

  content: [
    {
      type: "heading",
      text: "⭐ THE SHOOTING STAR",
    },

    {
      type: "svg",
      svg: `
<svg
  width="100%"
  viewBox="0 0 780 430"
  role="img"
  xmlns="http://www.w3.org/2000/svg"
>
  <title>Shooting Star candlestick at resistance</title>

  <desc>
    A bearish Shooting Star candlestick with a small body, long upper
    wick, resistance level, and labeled structure.
  </desc>

  <style>
    .star-title {
      fill: #f4d35e;
      font-size: 24px;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }

    .star-label {
      fill: #ffffff;
      font-size: 16px;
      font-family: Arial, sans-serif;
    }

    .star-note {
      fill: #aaaaaa;
      font-size: 14px;
      font-family: Arial, sans-serif;
    }

    .star-resistance {
      stroke: #ef4444;
      stroke-width: 3;
      stroke-dasharray: 8 6;
    }

    .star-body {
      fill: #ef4444;
    }

    .star-wick {
      stroke: #ffffff;
      stroke-width: 5;
    }

    .star-arrow {
      stroke: #f4d35e;
      stroke-width: 2;
      marker-end: url(#star-arrow-head);
      fill: none;
    }
  </style>

  <defs>
    <marker
      id="star-arrow-head"
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
    x="390"
    y="40"
    text-anchor="middle"
    class="star-title"
  >
    Shooting Star Candlestick
  </text>

  <line
    x1="390"
    y1="95"
    x2="390"
    y2="330"
    class="star-wick"
  />

  <rect
    x="355"
    y="250"
    width="70"
    height="60"
    rx="3"
    class="star-body"
  />

  <line
    x1="120"
    y1="80"
    x2="660"
    y2="80"
    class="star-resistance"
  />

  <text
    x="665"
    y="85"
    class="star-label"
  >
    Resistance
  </text>

  <path
    d="M515 280 C565 300 610 300 645 285"
    class="star-arrow"
  />

  <text
    x="650"
    y="290"
    class="star-label"
  >
    Small Body
  </text>

  <path
    d="M515 165 C575 165 615 165 650 165"
    class="star-arrow"
  />

  <text
    x="655"
    y="170"
    class="star-label"
  >
    Long Upper Wick
  </text>

  <text
    x="390"
    y="382"
    text-anchor="middle"
    class="star-note"
  >
    Buyers pushed price sharply higher,
  </text>

  <text
    x="390"
    y="404"
    text-anchor="middle"
    class="star-note"
  >
    but sellers rejected those prices before the close.
  </text>
</svg>
      `,
    },

    {
      type: "callout",
      text:
        "TRQX Example: QQQ rallies into a prior resistance zone during the afternoon. A Shooting Star forms with increased volume, followed by a bearish confirmation candle. This creates a stronger short setup because location, rejection, and confirmation align.",
    },

    {
      type: "p",
      text:
        "A Shooting Star is a potential bearish reversal candlestick. It shows that buyers pushed price higher, but sellers rejected those higher prices and regained control before the candle closed.",
    },

    {
      type: "heading",
      text: "🎯 LESSON OBJECTIVE",
    },

    {
      type: "p",
      text:
        "By the end of this lesson, you should confidently identify a Shooting Star, explain the buyer and seller psychology behind it, and know when it should—and should not—be traded.",
    },

    {
      type: "heading",
      text: "📐 IDENTIFICATION",
    },

    {
      type: "p",
      text:
        "A Shooting Star has a small candle body near the bottom of the entire candle with a long upper wick.",
    },

    {
      type: "p",
      text:
        "The upper wick should generally be at least twice the size of the candle body. The lower wick should be small or nonexistent.",
    },

    {
      type: "p",
      text:
        "The candle may close green or red, although a bearish close near the low strengthens the evidence that sellers regained control.",
    },

    {
      type: "callout",
      text:
        "A Shooting Star is defined by both its shape and its location. The same shape in the wrong location is not a valid bearish reversal setup.",
    },

    {
      type: "heading",
      text: "🧠 BUYER VS SELLER PSYCHOLOGY",
    },

    {
      type: "callout",
      text:
        "Think of the Shooting Star as a failed attack by buyers. They drove price higher, but sellers overwhelmed them and forced price back down before the close.",
    },

    {
      type: "p",
      text:
        "Early in the candle, buyers appear to be in control and push price sharply higher.",
    },

    {
      type: "p",
      text:
        "Later in the session, sellers enter aggressively, absorb the buying pressure, and push price back toward the opening price.",
    },

    {
      type: "p",
      text:
        "Although buyers controlled the beginning of the candle, sellers controlled the ending.",
    },

    {
      type: "heading",
      text: "📍 LOCATION MATTERS",
    },

    {
      type: "p",
      text:
        "The highest-probability Shooting Star forms after a rally and directly into a meaningful resistance area.",
    },

    {
      type: "p",
      text:
        "Useful locations include prior resistance, a supply zone, a previous breakdown level, a major moving average, or higher-timeframe resistance.",
    },

    {
      type: "p",
      text:
        "A Shooting Star appearing in the middle of random sideways price action carries much less meaning.",
    },

    {
      type: "heading",
      text: "📉 CONFIRMATION",
    },

    {
      type: "p",
      text:
        "Never enter a short position simply because a Shooting Star exists.",
    },

    {
      type: "p",
      text:
        "Professional traders wait for confirmation from the following candle, increased selling volume, rejection of resistance, and alignment with the larger trend.",
    },

    {
      type: "p",
      text:
        "Confirmation may include the next candle closing below the Shooting Star's body or Low, a volume increase, a failed resistance breakout, or the formation of a lower high.",
    },

    {
      type: "callout",
      text:
        "✅ Professional Tip: A Shooting Star becomes significantly more reliable when it forms at higher-timeframe resistance and is followed by strong bearish confirmation.",
    },

    {
      type: "heading",
      text: "🔨 HAMMER VS SHOOTING STAR",
    },

    {
      type: "p",
      text:
        "The Hammer and Shooting Star use similar rejection psychology but appear in opposite locations.",
    },

    {
      type: "p",
      text:
        "A Hammer has a long lower wick and forms after a decline near support. A Shooting Star has a long upper wick and forms after a rally near resistance.",
    },

    {
      type: "callout",
      text:
        "The candle shape alone does not determine the pattern. Location determines whether the rejection is bullish or bearish.",
    },

    {
      type: "heading",
      text: "🚫 COMMON MISTAKES",
    },

    {
      type: "p",
      text:
        "❌ Shorting every candle with a long upper wick.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring whether an uptrend or rally occurred first.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring resistance and higher-timeframe structure.",
    },

    {
      type: "p",
      text:
        "❌ Entering before bearish confirmation.",
    },

    {
      type: "p",
      text:
        "❌ Confusing a Shooting Star with an Inverted Hammer.",
    },

    {
      type: "p",
      text:
        "❌ Assuming the pattern guarantees a reversal.",
    },

    {
      type: "heading",
      text: "✅ PROFESSIONAL CHECKLIST",
    },

    {
      type: "p",
      text:
        "✔ A rally or bullish move occurred before the candle.",
    },

    {
      type: "p",
      text:
        "✔ The Shooting Star formed at meaningful resistance.",
    },

    {
      type: "p",
      text:
        "✔ The upper wick is approximately twice the body size or longer.",
    },

    {
      type: "p",
      text:
        "✔ The body is positioned near the bottom of the candle.",
    },

    {
      type: "p",
      text:
        "✔ The candle closed weakly relative to its full range.",
    },

    {
      type: "p",
      text:
        "✔ Volume supports the rejection.",
    },

    {
      type: "p",
      text:
        "✔ The next candle confirms seller control.",
    },

    {
      type: "heading",
      text: "🧠 MEMORY RULE",
    },

    {
      type: "callout",
      text:
        "Remember: Rally + Resistance + Rejection + Confirmation = High-Quality Shooting Star.",
    },

    {
      type: "heading",
      text: "✍ STUDENT ASSIGNMENT",
    },

    {
      type: "p",
      text:
        "Open TradingView and locate three Shooting Star candidates. For each one, determine whether you would trade it and explain why using the professional checklist.",
    },

    {
      type: "p",
      text:
        "Record the ticker, timeframe, prior trend, resistance level, wick-to-body relationship, volume condition, confirmation candle, entry idea, invalidation level, and final decision.",
    },

    {
      type: "heading",
      text: "🧭 LESSON SUMMARY",
    },

    {
      type: "p",
      text:
        "A Shooting Star is a potential bearish reversal candle that forms after a rally. Its long upper wick shows that buyers pushed price higher, but sellers rejected those prices before the close.",
    },

    {
      type: "p",
      text:
        "The pattern becomes meaningful only when shape, location, volume, and confirmation align.",
    },

    {
      type: "heading",
      text: "✅ LESSON COMPLETE WHEN",
    },

    {
      type: "p",
      text:
        "The student can identify a valid Shooting Star, explain its psychology, distinguish it from an Inverted Hammer, and describe the confirmation required before entering a bearish trade.",
    },
  ],

  flashcards: [
    {
      id: "shooting-star-card-01",
      category: "Recognition",
      front: "What is a Shooting Star?",
      back:
        "A potential bearish reversal candle with a small body near the bottom and a long upper wick.",
    },

    {
      id: "shooting-star-card-02",
      category: "Location",
      front:
        "Where should a high-quality Shooting Star form?",
      back:
        "After a rally near a meaningful resistance or supply level.",
    },

    {
      id: "shooting-star-card-03",
      category: "Psychology",
      front:
        "What does the long upper wick represent?",
      back:
        "Buyers pushed price higher before sellers rejected those higher prices.",
    },

    {
      id: "shooting-star-card-04",
      category: "Structure",
      front:
        "How long should the upper wick generally be?",
      back:
        "Approximately twice the length of the body or longer.",
    },

    {
      id: "shooting-star-card-05",
      category: "Comparison",
      front:
        "What is the difference between a Shooting Star and an Inverted Hammer?",
      back:
        "A Shooting Star forms after a rally and is potentially bearish. An Inverted Hammer forms after a decline and is potentially bullish.",
    },

    {
      id: "shooting-star-card-06",
      category: "Professional Rules",
      front:
        "What is the TRQX Shooting Star memory rule?",
      back:
        "Rally + Resistance + Rejection + Confirmation.",
    },
  ],

  quiz: [
    {
      id: "shooting-star-quiz-01",
      question:
        "Where does the highest-probability Shooting Star form?",
      answers: [
        "At support after a decline",
        "At resistance after a rally",
        "In the middle of consolidation",
        "Anywhere on the chart",
      ],
      correctAnswer: 1,
      explanation:
        "A Shooting Star gains meaning when it forms after a rally at resistance or supply.",
    },

    {
      id: "shooting-star-quiz-02",
      question:
        "What does the long upper wick represent?",
      answers: [
        "Sellers rejected higher prices",
        "A guaranteed continuation",
        "No buyers were present",
        "Low volatility",
      ],
      correctAnswer: 0,
      explanation:
        "The wick shows buyers pushed price higher before sellers forced it back down.",
    },

    {
      id: "shooting-star-quiz-03",
      question:
        "How long should the upper wick generally be?",
      answers: [
        "Shorter than the body",
        "Approximately twice the body size or longer",
        "Exactly equal to the body",
        "Wick length does not matter",
      ],
      correctAnswer: 1,
      explanation:
        "A valid Shooting Star generally has an upper wick at least twice the size of its body.",
    },

    {
      id: "shooting-star-quiz-04",
      question:
        "What should occur before entering a Shooting Star trade?",
      answers: [
        "An immediate short order",
        "Bearish confirmation",
        "A random bullish candle",
        "A wider bid-ask spread",
      ],
      correctAnswer: 1,
      explanation:
        "Professional traders wait for evidence that sellers are continuing to take control.",
    },

    {
      id: "shooting-star-quiz-05",
      question:
        "What separates a Shooting Star from an Inverted Hammer?",
      answers: [
        "The candle color",
        "The location and prior trend",
        "The ticker symbol",
        "The chart timeframe only",
      ],
      correctAnswer: 1,
      explanation:
        "The same general shape has different meaning based on whether it forms after a rally or decline.",
    },

    {
      id: "shooting-star-quiz-06",
      question:
        "Which statement best describes Shooting Star psychology?",
      answers: [
        "Sellers controlled the entire candle",
        "Buyers pushed higher, but sellers rejected the move and controlled the finish",
        "Neither side participated",
        "Buyers remained fully in control",
      ],
      correctAnswer: 1,
      explanation:
        "The pattern shows a failed buyer attack followed by a strong seller response.",
    },
  ],

  drills: {
    clickIdentify: [],

    dragLabel: null,

    dragTimeline: null,

    writtenReview: [
      {
        id: "shooting-star-drill-01",
        title: "Shooting Star Recognition",
        prompt:
          "Locate three Shooting Star candidates and identify the prior trend, resistance level, wick-to-body relationship, volume condition, and confirmation candle.",
        passingCriteria:
          "Each example must be evaluated using shape, location, rejection, and confirmation.",
      },

      {
        id: "shooting-star-drill-02",
        title: "Trade or Pass",
        prompt:
          "For each Shooting Star candidate, decide whether to trade or pass and explain the decision using market evidence.",
        passingCriteria:
          "The decision must reference trend, resistance, volume, confirmation, and invalidation.",
      },
    ],
  },

  mastery: {
    requiredScore: 80,

    unlocks: "doji",

    requirements: [
      "Identify a valid Shooting Star correctly.",
      "Explain buyer-versus-seller psychology.",
      "Recognize proper resistance location.",
      "Distinguish it from an Inverted Hammer.",
      "Pass the quiz with at least 80%.",
    ],

    professionalStandards: [
      "Do not trade shape without context.",
      "Require a prior rally or uptrend.",
      "Require meaningful resistance.",
      "Use volume to evaluate rejection.",
      "Wait for bearish confirmation.",
    ],

    completionMessage:
      "You can now identify and evaluate a Shooting Star using professional market context.",
  },

  assignment: {
    title: "Shooting Star Recognition",

    instructions: [
      "Locate three Shooting Star candles.",
      "Record the ticker and timeframe.",
      "Mark the prior rally and resistance level.",
      "Describe the wick-to-body relationship.",
      "Evaluate volume.",
      "Identify the confirmation candle.",
      "State whether you would enter or pass.",
      "Define the invalidation level.",
    ],

    passingCriteria:
      "Each example must be evaluated with shape, location, volume, confirmation, and risk.",
  },

  aiCoach: {
    summary:
      "A Shooting Star shows that buyers pushed price higher but sellers rejected those prices. The pattern becomes useful only when it forms after a rally at resistance and receives confirmation.",

    commonMistakes: [
      "Ignoring the prior trend.",
      "Ignoring resistance.",
      "Shorting every long upper wick.",
      "Confusing it with an Inverted Hammer.",
      "Entering before confirmation.",
    ],

    professionalTips: [
      "Read the failed buyer attack.",
      "Favor patterns at higher-timeframe resistance.",
      "Evaluate the candle close.",
      "Use volume to confirm rejection.",
      "Define invalidation before entry.",
    ],
  },

  references: [],
};

export default shootingStarLesson;