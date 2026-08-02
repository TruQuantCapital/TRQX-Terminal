/**
 * ==========================================================
 * TRQX UNIVERSITY
 * Lesson: Hammer
 * ==========================================================
 */

export const hammerLesson = {
  id: "hammer",

  title: "Hammer",

  objective:
    "Understand how to identify a Hammer candlestick, explain the psychology behind it, and determine when it is a high-probability reversal signal.",

  estimatedTime: "12 Minutes",

  difficulty: "Beginner",

  content: [
    {
      type: "heading",
      text: "🔨 THE HAMMER",
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
  <title>Hammer candlestick at support</title>

  <desc>
    A bullish Hammer candlestick with a small body, long lower wick,
    support level, and labeled structure.
  </desc>

  <style>
    .hammer-title {
      fill: #f4d35e;
      font-size: 24px;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }

    .hammer-label {
      fill: #ffffff;
      font-size: 16px;
      font-family: Arial, sans-serif;
    }

    .hammer-note {
      fill: #aaaaaa;
      font-size: 14px;
      font-family: Arial, sans-serif;
    }

    .hammer-support {
      stroke: #00bfff;
      stroke-width: 3;
      stroke-dasharray: 8 6;
    }

    .hammer-body {
      fill: #22c55e;
    }

    .hammer-wick {
      stroke: #ffffff;
      stroke-width: 5;
    }

    .hammer-arrow {
      stroke: #f4d35e;
      stroke-width: 2;
      marker-end: url(#hammer-arrow-head);
      fill: none;
    }
  </style>

  <defs>
    <marker
      id="hammer-arrow-head"
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
    class="hammer-title"
  >
    Hammer Candlestick
  </text>

  <line
    x1="390"
    y1="80"
    x2="390"
    y2="315"
    class="hammer-wick"
  />

  <rect
    x="355"
    y="120"
    width="70"
    height="60"
    rx="3"
    class="hammer-body"
  />

  <line
    x1="120"
    y1="330"
    x2="660"
    y2="330"
    class="hammer-support"
  />

  <text
    x="665"
    y="335"
    class="hammer-label"
  >
    Support
  </text>

  <path
    d="M520 120 C560 90 610 90 640 115"
    class="hammer-arrow"
  />

  <text
    x="645"
    y="105"
    class="hammer-label"
  >
    Small Body
  </text>

  <path
    d="M520 250 C590 250 620 250 650 250"
    class="hammer-arrow"
  />

  <text
    x="655"
    y="255"
    class="hammer-label"
  >
    Long Lower Wick
  </text>

  <text
    x="390"
    y="382"
    text-anchor="middle"
    class="hammer-note"
  >
    Sellers pushed price sharply lower,
  </text>

  <text
    x="390"
    y="404"
    text-anchor="middle"
    class="hammer-note"
  >
    but buyers rejected those prices before the close.
  </text>
</svg>
      `,
    },

    {
      type: "callout",
      text:
        "TRQX Example: SPY falls into yesterday's support during the first hour. A Hammer forms with increasing volume, followed by a strong bullish confirmation candle. This creates a high-quality long setup because location, rejection, and confirmation all align.",
    },

    {
      type: "p",
      text:
        "A Hammer is one of the most recognized bullish reversal candlesticks. It tells the story of sellers initially winning the battle before buyers completely changed the outcome.",
    },

    {
      type: "heading",
      text: "🎯 LESSON OBJECTIVE",
    },

    {
      type: "p",
      text:
        "By the end of this lesson, you should confidently identify a Hammer, explain the buyer and seller psychology behind it, and know when it should—and should not—be traded.",
    },

    {
      type: "heading",
      text: "📐 IDENTIFICATION",
    },

    {
      type: "p",
      text:
        "A Hammer has a small candle body near the top of the entire candle with a long lower wick. The lower wick should generally be at least twice the size of the candle body.",
    },

    {
      type: "p",
      text:
        "The upper wick should be small or nonexistent. The candle can close green or red, although a close near the high strengthens the evidence that buyers regained control.",
    },

    {
      type: "callout",
      text:
        "A Hammer is defined by both its shape and its location. Shape alone is never enough.",
    },

    {
      type: "heading",
      text: "🧠 BUYER VS SELLER PSYCHOLOGY",
    },

    {
      type: "callout",
      text:
        "Think of the Hammer as a failed attack by sellers. They drove price lower, but buyers overwhelmed them and finished the session near the highs. That shift in control is what makes the pattern valuable.",
    },

    {
      type: "p",
      text:
        "Early in the candle, sellers appear to be completely in control and push price sharply lower.",
    },

    {
      type: "p",
      text:
        "Later in the session, buyers aggressively step in, absorb the selling pressure, and drive price back toward the opening price before the candle closes.",
    },

    {
      type: "p",
      text:
        "Although sellers controlled the beginning of the candle, buyers controlled the ending.",
    },

    {
      type: "heading",
      text: "📍 LOCATION MATTERS",
    },

    {
      type: "p",
      text:
        "The highest-probability Hammer forms after a decline and directly into a significant support area.",
    },

    {
      type: "p",
      text:
        "Useful locations include prior support, a demand zone, a major moving average, a previous breakout level, or a higher-timeframe structure level.",
    },

    {
      type: "p",
      text:
        "A Hammer appearing in the middle of random sideways price action carries much less meaning.",
    },

    {
      type: "heading",
      text: "📈 CONFIRMATION",
    },

    {
      type: "p",
      text:
        "Never buy simply because a Hammer exists.",
    },

    {
      type: "p",
      text:
        "Professional traders wait for confirmation from the following candle, increased volume, and alignment with the overall trend.",
    },

    {
      type: "p",
      text:
        "Confirmation may include the next candle closing above the Hammer's body or High, a volume increase, a reclaim of support, or continued higher lows.",
    },

    {
      type: "callout",
      text:
        "✅ Professional Tip: A Hammer becomes significantly more reliable when it appears at higher-timeframe support and is confirmed by above-average volume.",
    },

    {
      type: "heading",
      text: "🚫 COMMON MISTAKES",
    },

    {
      type: "p",
      text:
        "❌ Buying every Hammer regardless of location.",
    },

    {
      type: "p",
      text:
        "❌ Calling any candle with a lower wick a Hammer.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring the higher-timeframe trend.",
    },

    {
      type: "p",
      text:
        "❌ Ignoring volume.",
    },

    {
      type: "p",
      text:
        "❌ Entering before confirmation.",
    },

    {
      type: "p",
      text:
        "❌ Placing a stop inside the Hammer's rejection wick without considering normal volatility.",
    },

    {
      type: "heading",
      text: "✅ PROFESSIONAL CHECKLIST",
    },

    {
      type: "p",
      text:
        "✔ A decline or bearish move occurred before the candle.",
    },

    {
      type: "p",
      text:
        "✔ The Hammer formed at a meaningful support level.",
    },

    {
      type: "p",
      text:
        "✔ The lower wick is approximately twice the body size or longer.",
    },

    {
      type: "p",
      text:
        "✔ The body is positioned near the top of the candle.",
    },

    {
      type: "p",
      text:
        "✔ The candle closed strongly relative to its full range.",
    },

    {
      type: "p",
      text:
        "✔ Volume supports the rejection.",
    },

    {
      type: "p",
      text:
        "✔ The next candle confirms buyer control.",
    },

    {
      type: "heading",
      text: "🧠 MEMORY RULE",
    },

    {
      type: "callout",
      text:
        "Remember: Shape + Location + Confirmation = High Probability. A Hammer without those three ingredients is simply a candle—not a trade.",
    },

    {
      type: "heading",
      text: "✍ STUDENT ASSIGNMENT",
    },

    {
      type: "p",
      text:
        "Open TradingView and locate three Hammer candles. For each one, determine whether you would trade it and explain why using the professional checklist.",
    },

    {
      type: "p",
      text:
        "Record the ticker, timeframe, trend, support level, wick-to-body relationship, volume condition, confirmation candle, entry idea, invalidation level, and final decision.",
    },

    {
      type: "heading",
      text: "🧭 LESSON SUMMARY",
    },

    {
      type: "p",
      text:
        "A Hammer is a potential bullish reversal candle that forms after a decline. Its long lower wick shows that sellers pushed price lower, but buyers rejected those prices before the close.",
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
        "The student can identify a valid Hammer, explain the buyer and seller psychology, distinguish a high-quality setup from a random candle, and describe the confirmation required before entry.",
    },
  ],

  flashcards: [
    {
      id: "hammer-card-01",
      category: "Recognition",
      front: "What is a Hammer?",
      back:
        "A potential bullish reversal candlestick with a small body near the top and a long lower wick.",
    },

    {
      id: "hammer-card-02",
      category: "Location",
      front: "Where should a high-quality Hammer form?",
      back:
        "After a decline near a meaningful support or demand level.",
    },

    {
      id: "hammer-card-03",
      category: "Psychology",
      front: "What does the lower wick represent?",
      back:
        "Sellers pushed price lower before buyers absorbed the selling and rejected those lower prices.",
    },

    {
      id: "hammer-card-04",
      category: "Structure",
      front: "How long should the Hammer's lower wick generally be?",
      back:
        "Approximately twice the length of the body or longer.",
    },

    {
      id: "hammer-card-05",
      category: "Confirmation",
      front: "Should every Hammer be traded?",
      back:
        "No. Trend, location, volume, and confirmation must support the setup.",
    },

    {
      id: "hammer-card-06",
      category: "Professional Rules",
      front: "What is the TRQX Hammer memory rule?",
      back:
        "Shape + Location + Confirmation = High Probability.",
    },
  ],

  quiz: [
    {
      id: "hammer-quiz-01",
      question:
        "Where does the highest-probability Hammer form?",
      answers: [
        "In the middle of consolidation",
        "At support after a decline",
        "At resistance after a rally",
        "Anywhere on the chart",
      ],
      correctAnswer: 1,
      explanation:
        "A Hammer gains meaning when it forms after a decline at a significant support or demand level.",
    },

    {
      id: "hammer-quiz-02",
      question:
        "What does the long lower wick represent?",
      answers: [
        "Buyers rejected lower prices",
        "A guaranteed reversal",
        "No sellers existed",
        "Low volatility",
      ],
      correctAnswer: 0,
      explanation:
        "The wick shows that sellers pushed price lower before buyers absorbed the selling pressure and forced price back up.",
    },

    {
      id: "hammer-quiz-03",
      question:
        "How long should the Hammer's lower wick generally be?",
      answers: [
        "Shorter than the body",
        "Approximately twice the body size or longer",
        "Exactly equal to the body",
        "The wick length does not matter",
      ],
      correctAnswer: 1,
      explanation:
        "A valid Hammer generally has a lower wick that is at least twice the size of its body.",
    },

    {
      id: "hammer-quiz-04",
      question:
        "What should occur before entering a Hammer trade?",
      answers: [
        "An immediate market order",
        "Confirmation",
        "A wider spread",
        "A random green candle elsewhere",
      ],
      correctAnswer: 1,
      explanation:
        "Professional traders wait for confirmation that buyers are continuing to take control.",
    },

    {
      id: "hammer-quiz-05",
      question:
        "Which factor gives a Hammer the most meaning?",
      answers: [
        "Its green color alone",
        "Its location within market context",
        "The ticker symbol",
        "The chart background color",
      ],
      correctAnswer: 1,
      explanation:
        "The same candle shape has different value depending on trend, support, structure, and volume.",
    },

    {
      id: "hammer-quiz-06",
      question:
        "Which statement best describes the Hammer's psychology?",
      answers: [
        "Buyers controlled the entire candle",
        "Sellers pushed lower, but buyers rejected the move and controlled the finish",
        "Neither side participated",
        "Sellers remained fully in control at the close",
      ],
      correctAnswer: 1,
      explanation:
        "The Hammer shows a failed seller attack followed by a strong buyer response.",
    },
  ],

  drills: {
    clickIdentify: [],

    dragLabel: null,

    dragTimeline: null,

    writtenReview: [
      {
        id: "hammer-drill-01",
        title: "Hammer Recognition",
        prompt:
          "Locate three Hammer candidates and identify the trend, support level, wick-to-body relationship, volume condition, and confirmation candle.",
        passingCriteria:
          "Each example must be evaluated using shape, location, and confirmation.",
      },

      {
        id: "hammer-drill-02",
        title: "Trade or Pass",
        prompt:
          "For each Hammer candidate, decide whether to trade or pass and explain the decision using market evidence.",
        passingCriteria:
          "The decision must reference trend, location, volume, confirmation, and invalidation.",
      },
    ],
  },

  mastery: {
    requiredScore: 80,

    unlocks: "shooting-star",

    requirements: [
      "Identify a valid Hammer correctly.",
      "Explain buyer-versus-seller psychology.",
      "Recognize proper location.",
      "Explain the required confirmation.",
      "Pass the quiz with at least 80%.",
    ],

    professionalStandards: [
      "Do not trade shape without context.",
      "Require meaningful support.",
      "Evaluate wick-to-body proportion.",
      "Use volume to assess conviction.",
      "Wait for confirmation before execution.",
    ],

    completionMessage:
      "You can now identify and evaluate a Hammer using professional context rather than candle shape alone.",
  },

  assignment: {
    title: "Hammer Recognition",

    instructions: [
      "Locate three Hammer candles.",
      "Record the ticker and timeframe.",
      "Mark the trend and support level.",
      "Describe the wick-to-body relationship.",
      "Evaluate volume.",
      "Identify the confirmation candle.",
      "State whether you would enter or pass.",
      "Define the invalidation level.",
    ],

    passingCriteria:
      "Each Hammer must be evaluated with shape, location, volume, confirmation, and risk.",
  },

  aiCoach: {
    summary:
      "A Hammer is evidence that buyers rejected lower prices, but only context determines whether it becomes a valid trade.",

    commonMistakes: [
      "Ignoring trend.",
      "Ignoring location.",
      "Calling every lower-wick candle a Hammer.",
      "Ignoring confirmation.",
      "Ignoring volume.",
    ],

    professionalTips: [
      "Read the seller attack and buyer response.",
      "Trade context, not shapes.",
      "Favor Hammers at higher-timeframe support.",
      "Wait for confirmation.",
      "Define invalidation before entering.",
    ],
  },

  references: [],
};

export default hammerLesson;