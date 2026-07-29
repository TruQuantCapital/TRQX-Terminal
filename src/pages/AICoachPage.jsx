import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAcademyProgress } from "../hooks/useAcademyProgress";
import { courseLevels } from "../data/courseLevels";
import "../styles/ai-coach.css";

const QUICK_PROMPTS = [
  "Explain liquidity at my level",
  "What should I study next?",
  "Quiz me on my current lesson",
  "Review the TRQX ORB confirmation rules",
];

function flattenLessons() {
  return courseLevels.flatMap((level) =>
    level.lessons.map((lesson, lessonIndex) => ({
      levelKey: level.key,
      levelTitle: level.title,
      lessonIndex,
      title: lesson.title,
      objective: lesson.objective,
      content: lesson.content || [],
    }))
  );
}

function normalizeCompleted(completed) {
  if (completed instanceof Set) return completed;
  if (Array.isArray(completed)) return new Set(completed);
  return new Set();
}

function lessonKey(levelKey, lessonIndex) {
  return `${levelKey}:${lessonIndex}`;
}

function buildStudentContext({ user, tier, completed, allLessons }) {
  const completedSet = normalizeCompleted(completed);
  const completedLessons = allLessons.filter((lesson) =>
    completedSet.has(lessonKey(lesson.levelKey, lesson.lessonIndex))
  );
  const nextLesson = allLessons.find(
    (lesson) => !completedSet.has(lessonKey(lesson.levelKey, lesson.lessonIndex))
  );

  const total = allLessons.length;
  const count = completedLessons.length;
  const progress = total ? Math.round((count / total) * 100) : 0;

  let level = "Beginner";
  if (progress >= 70) level = "Advanced";
  else if (progress >= 30) level = "Intermediate";

  return {
    email: user?.email || "",
    tier: tier || "free",
    completedCount: count,
    totalLessons: total,
    progress,
    learningLevel: level,
    nextLesson,
    completedLessons,
  };
}

function findRelevantLesson(question, allLessons) {
  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3);

  let best = null;
  let bestScore = 0;

  for (const lesson of allLessons) {
    const haystack = `${lesson.title} ${lesson.objective} ${lesson.content
      .map((item) => item.text || "")
      .join(" ")}`.toLowerCase();

    const score = words.reduce(
      (sum, word) => sum + (haystack.includes(word) ? 1 : 0),
      0
    );

    if (score > bestScore) {
      best = lesson;
      bestScore = score;
    }
  }

  return bestScore > 0 ? best : null;
}

function getLessonExcerpt(lesson) {
  if (!lesson) return "";
  const paragraphs = lesson.content
    .filter((item) => item.type === "p" || item.type === "callout")
    .map((item) => item.text)
    .filter(Boolean)
    .slice(0, 3);

  return paragraphs.join(" ");
}

function makeCoachResponse(question, context, allLessons) {
  const normalized = question.toLowerCase();
  const relevant = findRelevantLesson(question, allLessons);
  const nextLesson = context.nextLesson;

  if (
    normalized.includes("what should i study") ||
    normalized.includes("study next") ||
    normalized.includes("next lesson")
  ) {
    if (!nextLesson) {
      return {
        title: "Academy path complete",
        body:
          "You have completed the current Academy path. Your next focus should be deliberate review: revisit your weakest topic, complete chart drills, and document one rule you will apply before your next trade.",
        action: "Open Academy review",
        source: "Student progress",
      };
    }

    return {
      title: `Study next: ${nextLesson.title}`,
      body: `You are ${context.progress}% through the Academy. Your next incomplete lesson is “${nextLesson.title}.” Focus on this objective: ${nextLesson.objective}`,
      action: "Open next lesson",
      source: `${nextLesson.levelTitle} curriculum`,
    };
  }

  if (normalized.includes("quiz")) {
    const lesson = relevant || nextLesson || allLessons[0];
    return {
      title: `Knowledge check: ${lesson.title}`,
      body: `Answer this without looking at the lesson: ${lesson.objective} Explain the concept in your own words, then give one trading example and one risk-management mistake a beginner could make.`,
      action: "Show answer framework",
      source: `${lesson.levelTitle} curriculum`,
    };
  }

  if (
    normalized.includes("buy") ||
    normalized.includes("sell") ||
    normalized.includes("enter") ||
    normalized.includes("long") ||
    normalized.includes("short")
  ) {
    return {
      title: "Process before prediction",
      body:
        "The TRQX Coach does not issue buy or sell instructions. Use the decision framework instead: identify trend, mark support and resistance, confirm volume, wait for the strategy trigger, define invalidation, and calculate risk before entry. If the setup is inside consolidation or lacks confirmation, the educational answer is to wait.",
      action: "Open trade checklist",
      source: "TRQX education policy",
    };
  }

  if (normalized.includes("orb")) {
    return {
      title: "TRQX ORB confirmation",
      body:
        "Treat the opening range as a decision zone, not an automatic entry. Wait for price to break the range with confirmation, avoid chasing an extended candle, and prefer a controlled pullback or retest when available. Do not trade inside the ORB box. Define the invalidation level before entering.",
      action: "Review ORB rules",
      source: "TRQX ORB methodology",
    };
  }

  if (relevant) {
    const excerpt = getLessonExcerpt(relevant);
    const levelPrefix =
      context.learningLevel === "Beginner"
        ? "Start with the foundation: "
        : context.learningLevel === "Intermediate"
        ? "Connect this to market structure: "
        : "Apply this within a full trade framework: ";

    return {
      title: relevant.title,
      body: `${levelPrefix}${excerpt || relevant.objective}`,
      action: `Open ${relevant.title}`,
      source: `${relevant.levelTitle} curriculum`,
    };
  }

  return {
    title: "Use the TRQX decision framework",
    body:
      "Break the question into five parts: market condition, trend, key level, confirmation, and risk. State what would prove the idea correct, what would invalidate it, and whether the setup matches a rule you have already completed in the Academy.",
    action: "Open decision framework",
    source: "TRQX Coach",
  };
}

function CoachMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <article className={`coach-message ${isUser ? "coach-message-user" : ""}`}>
      {!isUser && (
        <div className="coach-avatar">
          <Brain size={18} />
        </div>
      )}
      <div className="coach-message-card">
        <span className="coach-message-label">
          {isUser ? "YOU" : "TRQX COACH"}
        </span>
        {message.title && <h3>{message.title}</h3>}
        <p>{message.body}</p>
        {!isUser && (
          <footer>
            <span>{message.source}</span>
            <button type="button">
              {message.action} <ChevronRight size={14} />
            </button>
          </footer>
        )}
      </div>
    </article>
  );
}

export default function AICoachPage() {
  const { user, tier } = useAuth();
  const { completed, loading } = useAcademyProgress();
  const allLessons = useMemo(() => flattenLessons(), []);
  const context = useMemo(
    () => buildStudentContext({ user, tier, completed, allLessons }),
    [user, tier, completed, allLessons]
  );

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (loading) return;

    const firstName =
      user?.user_metadata?.full_name?.split(" ")?.[0] ||
      user?.email?.split("@")?.[0] ||
      "Trader";

    setMessages([
      {
        role: "assistant",
        title: `Good evening, ${firstName}`,
        body: `You are currently at ${context.progress}% completion with ${context.completedCount} of ${context.totalLessons} lessons finished. ${
          context.nextLesson
            ? `Your next lesson is “${context.nextLesson.title}.”`
            : "You have completed the current Academy path."
        } Ask me to explain a concept, quiz you, review a TRQX rule, or identify what to study next.`,
        action: context.nextLesson ? "Continue learning" : "Review Academy",
        source: "Personal Academy context",
      },
    ]);
  }, [loading, user, context.progress, context.completedCount, context.totalLessons, context.nextLesson]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function submitQuestion(rawQuestion) {
    const question = rawQuestion.trim();
    if (!question) return;

    const userMessage = { role: "user", body: question };
    const response = makeCoachResponse(question, context, allLessons);

    setMessages((current) => [
      ...current,
      userMessage,
      { role: "assistant", ...response },
    ]);
    setInput("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitQuestion(input);
  }

  return (
    <main className="coach-page">
      <header className="coach-hero">
        <div>
          <p><Sparkles size={14} /> PERSONALIZED LEARNING</p>
          <h1>TRQX AI Coach</h1>
          <span>
            Educational guidance based on your Academy progress and the TRQX methodology.
          </span>
        </div>
        <div className="coach-policy">
          <ShieldCheck size={18} />
          <span>Education only. No buy or sell instructions.</span>
        </div>
      </header>

      <section className="coach-context-grid">
        <article>
          <GraduationCap size={20} />
          <div>
            <span>Learning level</span>
            <strong>{context.learningLevel}</strong>
          </div>
        </article>
        <article>
          <BookOpen size={20} />
          <div>
            <span>Academy progress</span>
            <strong>{context.progress}%</strong>
          </div>
        </article>
        <article>
          <Target size={20} />
          <div>
            <span>Next focus</span>
            <strong>{context.nextLesson?.title || "Course review"}</strong>
          </div>
        </article>
        <article>
          <TrendingUp size={20} />
          <div>
            <span>Membership</span>
            <strong>{String(context.tier).toUpperCase()}</strong>
          </div>
        </article>
      </section>

      <section className="coach-layout">
        <section className="coach-chat-panel">
          <div className="coach-chat-heading">
            <div>
              <MessageSquareText size={18} />
              <div>
                <h2>Coach Session</h2>
                <span>Responses adapt to your current learning stage.</span>
              </div>
            </div>
            <span className="coach-status"><i /> Context loaded</span>
          </div>

          <div className="coach-messages" ref={scrollRef}>
            {messages.map((message, index) => (
              <CoachMessage key={`${message.role}-${index}`} message={message} />
            ))}
          </div>

          <div className="coach-quick-prompts">
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt} type="button" onClick={() => submitQuestion(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="coach-input" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask the TRQX Coach about a lesson, rule, or trading concept..."
            />
            <button type="submit" aria-label="Send question">
              <Send size={18} />
            </button>
          </form>
        </section>

        <aside className="coach-sidebar">
          <section>
            <h3>Your Learning Path</h3>
            <div className="coach-progress-track">
              <i style={{ width: `${context.progress}%` }} />
            </div>
            <strong>{context.completedCount} of {context.totalLessons} lessons</strong>
            <span>{context.progress}% complete</span>
          </section>

          <section>
            <h3>Coach Capabilities</h3>
            <ul>
              <li><CheckCircle2 size={15} /> Explain concepts at your level</li>
              <li><CheckCircle2 size={15} /> Recommend the next lesson</li>
              <li><CheckCircle2 size={15} /> Quiz Academy knowledge</li>
              <li><CheckCircle2 size={15} /> Reinforce TRQX rules</li>
              <li><CheckCircle2 size={15} /> Redirect trade calls into process</li>
            </ul>
          </section>

          <section className="coach-next-card">
            <span>NEXT LESSON</span>
            <h3>{context.nextLesson?.title || "Academy Review"}</h3>
            <p>{context.nextLesson?.objective || "Review completed lessons and reinforce weak areas."}</p>
            <button type="button">
              Continue Learning <ChevronRight size={14} />
            </button>
          </section>
        </aside>
      </section>
    </main>
  );
}
