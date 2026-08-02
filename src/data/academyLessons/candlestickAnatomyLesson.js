/**
 * ==========================================================
 * TRQX UNIVERSITY
 * Candlestick Foundations
 * Lesson: Candlestick Anatomy
 * ==========================================================
 */

export const candlestickAnatomyLesson = {
  id: "candlestick-anatomy",

  title: "Candlestick Anatomy",

  objective:
    "Understand every component of a candlestick and explain what it reveals about buyers, sellers, conviction, and rejection.",

  estimatedTime: "15 minutes",

  difficulty: "Beginner",

  content: [
    {
      type: "heading",
      text: "📘 CANDLESTICK ANATOMY",
    },
    {
    type: "svg",
    svg: `
<svg width="760" height="420" viewBox="0 0 760 420"
     xmlns="http://www.w3.org/2000/svg">

<style>
.title{
fill:#f4d35e;
font-size:24px;
font-family:Arial;
font-weight:bold;
}

.label{
fill:white;
font-size:16px;
font-family:Arial;
}

.note{
fill:#aaaaaa;
font-size:14px;
font-family:Arial;
}

.line{
stroke:#666;
stroke-width:2;
}

.green{
fill:#22c55e;
}

.white{
fill:white;
}

</style>

<text x="380"
      y="45"
      class="title"
      text-anchor="middle">

Candlestick Anatomy

</text>

<line
x1="380"
y1="75"
x2="380"
y2="330"
stroke="#ffffff"
stroke-width="4"
/>

<rect
x="345"
y="135"
width="70"
height="110"
class="green"
/>

<line
x1="415"
y1="95"
x2="520"
y2="95"
class="line"/>

<text
x="535"
y="100"
class="label">

High

</text>

<line
x1="415"
y1="135"
x2="520"
y2="135"
class="line"/>

<text
x="535"
y="140"
class="label">

Open

</text>

<line
x1="415"
y1="245"
x2="520"
y2="245"
class="line"/>

<text
x="535"
y="250"
class="label">

Close

</text>

<line
x1="415"
y1="330"
x2="520"
y2="330"
class="line"/>

<text
x="535"
y="335"
class="label">

Low

</text>

<line
x1="345"
y1="190"
x2="225"
y2="190"
class="line"/>

<text
x="70"
y="195"
class="label">

Real Body

</text>

<line
x1="345"
y1="105"
x2="215"
y2="105"
class="line"/>

<text
x="70"
y="110"
class="label">

Upper Wick

</text>

<line
x1="345"
y1="305"
x2="215"
y2="305"
class="line"/>

<text
x="70"
y="310"
class="label">

Lower Wick

</text>

<text
x="380"
y="390"
class="note"
text-anchor="middle">

Every candlestick contains four prices:
Open • High • Low • Close

</text>

</svg>
`
},
    {
      type: "p",
      text:
        "A candlestick is a visual representation of price movement during a specific period of time.",
    },
    {
      type: "p",
      text:
        "Every candle records four essential prices: the Open, High, Low, and Close. Together, these values show how buyers and sellers competed during that period.",
    },
    {
      type: "callout",
      text:
        "Professional traders do not see only a red or green candle. They see control, conviction, rejection, hesitation, and market context.",
    },

    {
      type: "heading",
      text: "🎯 LESSON OBJECTIVE",
    },
    {
      type: "p",
      text: "By the end of this lesson, the student should be able to:",
    },
    {
      type: "p",
      text: "✔ Identify the Open, High, Low, and Close.",
    },
    {
      type: "p",
      text: "✔ Identify the candle body, upper wick, and lower wick.",
    },
    {
      type: "p",
      text: "✔ Explain what a large or small candle body represents.",
    },
    {
      type: "p",
      text: "✔ Explain how wicks reveal rejection.",
    },
    {
      type: "p",
      text: "✔ Understand why market context is more important than one candle.",
    },

    {
      type: "heading",
      text: "🟢 THE OPEN",
    },
    {
      type: "p",
      text:
        "The Open is the first traded price during the candle's time period.",
    },
    {
      type: "p",
      text:
        "It establishes where the battle between buyers and sellers began.",
    },

    {
      type: "heading",
      text: "🔺 THE HIGH",
    },
    {
      type: "p",
      text:
        "The High is the highest traded price reached during the candle.",
    },
    {
      type: "p",
      text:
        "If price reached a high level but could not remain there, the candle may leave an upper wick. This shows that higher prices encountered selling pressure.",
    },

    {
      type: "heading",
      text: "🔻 THE LOW",
    },
    {
      type: "p",
      text:
        "The Low is the lowest traded price reached during the candle.",
    },
    {
      type: "p",
      text:
        "If price reached a lower level but recovered before the candle closed, the candle may leave a lower wick. This shows that lower prices attracted buyers.",
    },

    {
      type: "heading",
      text: "🏁 THE CLOSE",
    },
    {
      type: "p",
      text:
        "The Close is the final traded price when the candle period ends.",
    },
    {
      type: "callout",
      text:
        "The Close is especially important because it shows where buyers and sellers finished the battle before the next candle began.",
    },

    {
      type: "heading",
      text: "🧱 THE CANDLE BODY",
    },
    {
      type: "p",
      text:
        "The candle body represents the distance between the Open and the Close.",
    },
    {
      type: "p",
      text:
        "A large body usually indicates stronger directional conviction. A small body usually indicates hesitation, balance, or indecision.",
    },
    {
      type: "p",
      text:
        "A large bullish body shows buyers controlled most of the period. A large bearish body shows sellers controlled most of the period.",
    },

    {
      type: "heading",
      text: "⬆ THE UPPER WICK",
    },
    {
      type: "p",
      text:
        "The upper wick represents the distance between the top of the candle body and the candle's High.",
    },
    {
      type: "p",
      text:
        "It shows that price traded higher but moved away from that level before the candle closed.",
    },
    {
      type: "callout",
      text:
        "An upper wick is evidence of rejection from higher prices. It is not automatically a bearish trade signal.",
    },

    {
      type: "heading",
      text: "⬇ THE LOWER WICK",
    },
    {
      type: "p",
      text:
        "The lower wick represents the distance between the bottom of the candle body and the candle's Low.",
    },
    {
      type: "p",
      text:
        "It shows that price traded lower but recovered before the candle closed.",
    },
    {
      type: "callout",
      text:
        "A lower wick is evidence that buyers responded to lower prices. It is not automatically a bullish trade signal.",
    },

    {
      type: "heading",
      text: "🧠 READING THE STORY",
    },
    {
      type: "p",
      text:
        "A candlestick should be interpreted as a sequence of events rather than a fixed shape.",
    },
    {
      type: "p",
      text:
        "Ask: Where did price open? Which side pushed price farther? Where was price rejected? Where did the candle close? Who appeared to control the final outcome?",
    },
    {
      type: "p",
      text:
        "The relationship between the body and the wicks helps explain whether the candle showed conviction, rejection, or indecision.",
    },

    {
      type: "heading",
      text: "📍 CONTEXT COMES FIRST",
    },
    {
      type: "p",
      text:
        "The same candle can have different meanings depending on where it forms.",
    },
    {
      type: "p",
      text:
        "A long lower wick at support after a decline may be meaningful. The same wick in the middle of random sideways movement may have little value.",
    },
    {
      type: "p",
      text:
        "Always evaluate the candle with trend, support and resistance, market structure, volume, and confirmation.",
    },

    {
      type: "heading",
      text: "🚨 COMMON BEGINNER MISTAKES",
    },
    {
      type: "p",
      text: "❌ Trading one candle without considering market context.",
    },
    {
      type: "p",
      text: "❌ Assuming every long wick guarantees a reversal.",
    },
    {
      type: "p",
      text: "❌ Ignoring the location of the candle.",
    },
    {
      type: "p",
      text: "❌ Ignoring volume and the surrounding candles.",
    },
    {
      type: "p",
      text: "❌ Focusing on candle color while ignoring the Close.",
    },

    {
      type: "heading",
      text: "✅ PROFESSIONAL RULES",
    },
    {
      type: "p",
      text: "✔ The candle body measures conviction.",
    },
    {
      type: "p",
      text: "✔ Wicks provide evidence of rejection.",
    },
    {
      type: "p",
      text: "✔ The Close helps identify who controlled the finish.",
    },
    {
      type: "p",
      text: "✔ Volume helps confirm participation and conviction.",
    },
    {
      type: "p",
      text: "✔ Context is always more important than the candle itself.",
    },

    {
      type: "heading",
      text: "✍ STUDENT ASSIGNMENT",
    },
    {
      type: "p",
      text:
        "Select one bullish candle and one bearish candle from a chart.",
    },
    {
      type: "p",
      text:
        "For each candle, identify the Open, High, Low, Close, body, upper wick, and lower wick.",
    },
    {
      type: "p",
      text:
        "Explain which side controlled the candle and what evidence supports your conclusion.",
    },
    {
      type: "p",
      text:
        "Finally, explain whether the candle provides enough information to enter a trade by itself.",
    },

    {
      type: "heading",
      text: "🧭 LESSON SUMMARY",
    },
    {
      type: "p",
      text:
        "Every candlestick contains an Open, High, Low, and Close.",
    },
    {
      type: "p",
      text:
        "The body measures the distance between the Open and Close and helps show conviction.",
    },
    {
      type: "p",
      text:
        "The upper and lower wicks show price exploration and rejection.",
    },
    {
      type: "p",
      text:
        "A candlestick becomes useful only when it is evaluated within the larger market context.",
    },

    {
      type: "heading",
      text: "✅ LESSON COMPLETE WHEN",
    },
    {
      type: "p",
      text:
        "The student can identify every candle component, explain buyer and seller behavior, interpret conviction and rejection, and explain why one candle should never be traded without context.",
    },
  ],

  flashcards: [
    {
      id: "anatomy-card-01",
      category: "Anatomy",
      front: "What is a candlestick?",
      back:
        "A visual representation of price movement during a specific period using the Open, High, Low, and Close.",
    },
    {
      id: "anatomy-card-02",
      category: "Anatomy",
      front: "What is the Open?",
      back: "The first traded price during the candle period.",
    },
    {
      id: "anatomy-card-03",
      category: "Anatomy",
      front: "What is the High?",
      back: "The highest traded price reached during the candle period.",
    },
    {
      id: "anatomy-card-04",
      category: "Anatomy",
      front: "What is the Low?",
      back: "The lowest traded price reached during the candle period.",
    },
    {
      id: "anatomy-card-05",
      category: "Anatomy",
      front: "What is the Close?",
      back: "The final traded price when the candle period ends.",
    },
    {
      id: "anatomy-card-06",
      category: "Interpretation",
      front: "What does the candle body represent?",
      back: "The distance between the Open and the Close.",
    },
    {
      id: "anatomy-card-07",
      category: "Interpretation",
      front: "What does a large candle body usually indicate?",
      back: "Stronger buying or selling conviction.",
    },
    {
      id: "anatomy-card-08",
      category: "Interpretation",
      front: "What does a small candle body usually indicate?",
      back: "Hesitation, balance, or indecision.",
    },
    {
      id: "anatomy-card-09",
      category: "Wicks",
      front: "What does an upper wick show?",
      back:
        "Price traded higher but was pushed away from the High before the candle closed.",
    },
    {
      id: "anatomy-card-10",
      category: "Wicks",
      front: "What does a lower wick show?",
      back:
        "Price traded lower but recovered from the Low before the candle closed.",
    },
    {
      id: "anatomy-card-11",
      category: "Professional Rules",
      front: "Does a long wick guarantee a reversal?",
      back:
        "No. It provides evidence of rejection, but trend, location, volume, and confirmation still matter.",
    },
    {
      id: "anatomy-card-12",
      category: "Professional Rules",
      front: "What is more important than the candle itself?",
      back: "The market context in which the candle forms.",
    },
  ],

  quiz: [
    {
      id: "anatomy-quiz-01",
      question: "Which four prices form a candlestick?",
      answers: [
        "Bid, Ask, Volume, Spread",
        "Open, High, Low, Close",
        "Entry, Stop, Target, Exit",
        "Support, Resistance, Trend, Volume",
      ],
      correctAnswer: 1,
      explanation:
        "Every candle is built from the Open, High, Low, and Close.",
    },
    {
      id: "anatomy-quiz-02",
      question: "What does the candle body represent?",
      answers: [
        "The distance between the High and Low",
        "The distance between the Open and Close",
        "The amount of market volume",
        "The time remaining in the candle",
      ],
      correctAnswer: 1,
      explanation:
        "The body represents the distance between the Open and Close.",
    },
    {
      id: "anatomy-quiz-03",
      question: "A large candle body usually indicates:",
      answers: [
        "Strong directional conviction",
        "No market participation",
        "A guaranteed reversal",
        "The market is closed",
      ],
      correctAnswer: 0,
      explanation:
        "Large bodies generally show stronger buying or selling conviction.",
    },
    {
      id: "anatomy-quiz-04",
      question: "What does a long upper wick provide evidence of?",
      answers: [
        "Rejection from higher prices",
        "Guaranteed continuation",
        "No sellers were present",
        "The candle had no volatility",
      ],
      correctAnswer: 0,
      explanation:
        "An upper wick shows price traded higher before sellers pushed it away from the High.",
    },
    {
      id: "anatomy-quiz-05",
      question: "What does a long lower wick provide evidence of?",
      answers: [
        "Buyers responded to lower prices",
        "Price must continue lower",
        "There was no buying interest",
        "The candle automatically becomes a hammer",
      ],
      correctAnswer: 0,
      explanation:
        "A lower wick shows price traded lower before buyers pushed it away from the Low.",
    },
    {
      id: "anatomy-quiz-06",
      question: "Why is the Close important?",
      answers: [
        "It shows where the candle finished",
        "It determines the ticker symbol",
        "It always predicts the next candle",
        "It replaces the need for volume",
      ],
      correctAnswer: 0,
      explanation:
        "The Close shows where buyers and sellers finished the battle during that candle period.",
    },
    {
      id: "anatomy-quiz-07",
      question: "Can a candlestick be traded reliably without context?",
      answers: [
        "Yes, every candle is a complete signal",
        "Only if the candle is green",
        "No, trend, location, structure, volume, and confirmation matter",
        "Only during premarket",
      ],
      correctAnswer: 2,
      explanation:
        "A candle must be evaluated within the larger market environment.",
    },
    {
      id: "anatomy-quiz-08",
      question:
        "Which statement best represents professional candlestick analysis?",
      answers: [
        "Memorize the shape and enter immediately",
        "Trade every candle with a long wick",
        "Interpret the candle's story within market context",
        "Ignore the Close and focus only on color",
      ],
      correctAnswer: 2,
      explanation:
        "Professional analysis interprets buyer and seller behavior while considering context.",
    },
  ],

  drills: {
    clickIdentify: [],

    dragLabel: null,

    dragTimeline: null,

    writtenReview: [
      {
        id: "anatomy-drill-01",
        title: "Identify Every Component",
        prompt:
          "Select a candle and identify its Open, High, Low, Close, body, upper wick, and lower wick.",
        passingCriteria:
          "All seven candle components are identified correctly.",
      },
      {
        id: "anatomy-drill-02",
        title: "Read the Candle Story",
        prompt:
          "Explain which side controlled the candle, where rejection occurred, and whether the candle showed conviction or indecision.",
        passingCriteria:
          "The explanation accurately describes buyer and seller behavior.",
      },
      {
        id: "anatomy-drill-03",
        title: "Apply Market Context",
        prompt:
          "Identify the surrounding trend, support, resistance, volume, and confirmation before deciding whether the candle is actionable.",
        passingCriteria:
          "The trade decision is supported by context rather than candle shape alone.",
      },
    ],
  },

  mastery: {
    requiredScore: 80,

    unlocks: "doji",

    requirements: [
      "Pass the lesson quiz with at least 80%.",
      "Identify every component of a candlestick.",
      "Explain conviction and rejection.",
      "Explain why market context matters.",
      "Complete the written practice review.",
    ],

    professionalStandards: [
      "Never trade one candle in isolation.",
      "Always determine trend and structure.",
      "Always identify support and resistance.",
      "Use volume to evaluate conviction.",
      "Wait for confirmation before execution.",
    ],

    completionMessage:
      "You have demonstrated a solid understanding of candlestick anatomy and are ready to begin studying individual candlestick formations.",
  },

  aiCoach: {
    summary:
      "Candlestick anatomy explains how the Open, High, Low, Close, body, and wicks reveal buyer and seller behavior.",

    commonMistakes: [
      "Treating every wick as a reversal signal.",
      "Ignoring market context.",
      "Focusing only on candle color.",
      "Ignoring the candle Close.",
      "Entering before confirmation.",
    ],

    professionalTips: [
      "Read candles as a sequence of events.",
      "Compare the body size with the wick size.",
      "Evaluate where the candle formed.",
      "Use volume to confirm conviction.",
      "Trade evidence rather than memorized shapes.",
    ],
  },

  references: [],
};

export default candlestickAnatomyLesson;