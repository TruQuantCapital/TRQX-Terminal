import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  GraduationCap,
  Lightbulb,
  MessageSquareText,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAcademyProgress } from "../hooks/useAcademyProgress";
import { courseLevels } from "../data/courseLevels";
import "../styles/ai-coach.css";

const MISSION_STORAGE_KEY = "trqx_daily_learning_mission";

const QUICK_PROMPTS = [
  "What should I study next?",
  "Give me a 3-minute review",
  "Quiz me on my current lesson",
  "Explain liquidity at my level",
];

function flattenLessons() {
  return courseLevels.flatMap((level, levelIndex) =>
    level.lessons.map((lesson, lessonIndex) => ({
      levelKey: level.key,
      levelTitle: level.title,
      levelIndex,
      lessonIndex,
      title: lesson.title,
      objective: lesson.objective,
      content: lesson.content || [],
    }))
  );
}

function isCompleted(completed, levelKey, lessonIndex) {
  return completed?.[levelKey] instanceof Set
    ? completed[levelKey].has(lessonIndex)
    : false;
}

function getLesson(allLessons, levelKey, lessonIndex) {
  return allLessons.find(
    (lesson) =>
      lesson.levelKey === levelKey && lesson.lessonIndex === lessonIndex
  );
}

function getNextLesson(allLessons, completed) {
  return allLessons.find(
    (lesson) => !isCompleted(completed, lesson.levelKey, lesson.lessonIndex)
  );
}

function getPreviousLesson(allLessons, currentLesson) {
  if (!currentLesson) return null;
  const index = allLessons.findIndex(
    (lesson) =>
      lesson.levelKey === currentLesson.levelKey &&
      lesson.lessonIndex === currentLesson.lessonIndex
  );
  return index > 0 ? allLessons[index - 1] : null;
}

function lessonText(lesson) {
  if (!lesson) return "";
  return lesson.content
    .filter((item) => item.type === "p" || item.type === "callout")
    .map((item) => item.text)
    .filter(Boolean)
    .slice(0, 4)
    .join(" ");
}

function formatRelative(value) {
  if (!value) return "No recent study session";
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "Unknown";

  const diff = Date.now() - time;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function getLearningLevel(progress) {
  if (progress >= 70) return "Advanced";
  if (progress >= 30) return "Intermediate";
  return "Beginner";
}

function buildRecallPrompt(previousLesson, currentLesson) {
  if (previousLesson) {
    return {
      title: `Recall: ${previousLesson.title}`,
      question: `Without looking at the lesson, explain the main idea of “${previousLesson.title}” and give one trading example.`,
      source: previousLesson,
    };
  }

  return {
    title: "Foundation recall",
    question:
      "Before continuing, explain why risk management must be defined before entering a trade.",
    source: currentLesson,
  };
}

function readMission(userId) {
  try {
    const raw = JSON.parse(localStorage.getItem(MISSION_STORAGE_KEY) || "{}");
    const today = new Date().toISOString().slice(0, 10);
    return raw[userId]?.date === today ? raw[userId] : null;
  } catch {
    return null;
  }
}

function writeMission(userId, mission) {
  try {
    const raw = JSON.parse(localStorage.getItem(MISSION_STORAGE_KEY) || "{}");
    raw[userId] = mission;
    localStorage.setItem(MISSION_STORAGE_KEY, JSON.stringify(raw));
  } catch {}
}

function makeCoachResponse(question, context) {
  const normalized = question.toLowerCase();
  const current = context.currentLesson;
  const previous = context.previousLesson;

  if (normalized.includes("study next") || normalized.includes("what should i study")) {
    return {
      title: `Next focus: ${current?.title || "Academy review"}`,
      body: current
        ? `You are ${context.progress}% through the Academy. Complete “${current.title}” next. Its objective is: ${current.objective}`
        : "You have completed the current Academy path. Review a weaker topic and apply it to one chart.",
      source: "Personal learning path",
    };
  }

  if (normalized.includes("3-minute") || normalized.includes("review")) {
    const reviewLesson = previous || current;
    return {
      title: `3-minute review: ${reviewLesson?.title || "Risk management"}`,
      body: reviewLesson
        ? `${lessonText(reviewLesson)} Then close the lesson and explain the concept from memory in one sentence.`
        : "Review your entry rule, invalidation level, and maximum risk before your next trade.",
      source: "Spaced-repetition review",
    };
  }

  if (normalized.includes("quiz")) {
    const source = previous || current;
    return {
      title: `Active recall: ${source?.title || "Trading process"}`,
      body: source
        ? `Answer without notes: ${source.objective} Then give one correct example and one common beginner mistake.`
        : "Explain the five-step TRQX decision framework: condition, trend, level, confirmation, and risk.",
      source: "Active recall",
    };
  }

  if (
    normalized.includes("buy") ||
    normalized.includes("sell") ||
    normalized.includes("long") ||
    normalized.includes("short") ||
    normalized.includes("enter")
  ) {
    return {
      title: "Use process, not prediction",
      body:
        "The TRQX Coach does not issue buy or sell instructions. Evaluate the market condition, trend, key level, confirmation, and invalidation. If confirmation is missing or price is inside consolidation, the educational decision is to wait.",
      source: "TRQX education policy",
    };
  }

  const terms = normalized.split(/\s+/).filter((word) => word.length > 3);
  let bestLesson = null;
  let bestScore = 0;

  for (const lesson of context.allLessons) {
    const text = `${lesson.title} ${lesson.objective} ${lessonText(lesson)}`.toLowerCase();
    const score = terms.reduce(
      (total, term) => total + (text.includes(term) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestLesson = lesson;
      bestScore = score;
    }
  }

  if (bestLesson) {
    const prefix =
      context.learningLevel === "Beginner"
        ? "Start with the foundation: "
        : context.learningLevel === "Intermediate"
        ? "Connect this concept to market structure: "
        : "Apply this concept within a complete trade framework: ";

    return {
      title: bestLesson.title,
      body: `${prefix}${lessonText(bestLesson) || bestLesson.objective}`,
      source: `${bestLesson.levelTitle} curriculum`,
    };
  }

  return {
    title: "TRQX decision framework",
    body:
      "Break the question into five parts: market condition, trend, key level, confirmation, and risk. State what proves the idea correct and what invalidates it.",
    source: "TRQX methodology",
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
        {!isUser && <footer><span>{message.source}</span></footer>}
      </div>
    </article>
  );
}

export default function AICoachPage() {
  const navigate = useNavigate();
  const { user, tier } = useAuth();
  const {
    completed,
    stats,
    loading,
    recordLessonView,
  } = useAcademyProgress();

  const allLessons = useMemo(() => flattenLessons(), []);

  const completedCount = useMemo(
    () =>
      allLessons.filter((lesson) =>
        isCompleted(completed, lesson.levelKey, lesson.lessonIndex)
      ).length,
    [allLessons, completed]
  );

  const progress = allLessons.length
    ? Math.round((completedCount / allLessons.length) * 100)
    : 0;

  const nextIncomplete = useMemo(
    () => getNextLesson(allLessons, completed),
    [allLessons, completed]
  );

  const resumedLesson = useMemo(
    () =>
      getLesson(
        allLessons,
        stats?.currentLevelKey,
        stats?.currentLessonIndex
      ),
    [allLessons, stats]
  );

  const currentLesson =
    resumedLesson &&
    !isCompleted(completed, resumedLesson.levelKey, resumedLesson.lessonIndex)
      ? resumedLesson
      : nextIncomplete;

  const previousLesson = useMemo(
    () => getPreviousLesson(allLessons, currentLesson),
    [allLessons, currentLesson]
  );

  const learningLevel = getLearningLevel(progress);
  const recall = useMemo(
    () => buildRecallPrompt(previousLesson, currentLesson),
    [previousLesson, currentLesson]
  );

  const [recallAnswer, setRecallAnswer] = useState("");
  const [recallSubmitted, setRecallSubmitted] = useState(false);
  const [mission, setMission] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messageRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const existing = readMission(user.id);
    const nextMission =
      existing || {
        date: new Date().toISOString().slice(0, 10),
        recallComplete: false,
        lessonComplete: false,
        reflectionComplete: false,
      };

    setMission(nextMission);
    if (!existing) writeMission(user.id, nextMission);
  }, [user]);

  useEffect(() => {
    if (loading) return;

    const firstName =
      user?.user_metadata?.full_name?.split(" ")?.[0] ||
      user?.email?.split("@")?.[0] ||
      "Trader";

    setMessages([
      {
        role: "assistant",
        title: `Welcome back, ${firstName}`,
        body: `You have completed ${completedCount} of ${allLessons.length} lessons. Your study streak is ${stats?.studyStreak || 0} day${stats?.studyStreak === 1 ? "" : "s"}, and your last activity was ${formatRelative(stats?.lastActivity)}. ${
          currentLesson
            ? `Today's priority is “${currentLesson.title}.”`
            : "Your current Academy path is complete."
        }`,
        source: "Personal learning profile",
      },
    ]);
  }, [
    loading,
    user,
    completedCount,
    allLessons.length,
    stats?.studyStreak,
    stats?.lastActivity,
    currentLesson,
  ]);

  useEffect(() => {
    messageRef.current?.scrollTo({
      top: messageRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function updateMission(patch) {
    if (!user) return;
    const next = { ...mission, ...patch };
    setMission(next);
    writeMission(user.id, next);
  }

  function submitRecall() {
    if (!recallAnswer.trim()) return;
    setRecallSubmitted(true);
    updateMission({ recallComplete: true });
  }

  function continueLesson() {
    if (currentLesson) {
      recordLessonView(currentLesson.levelKey, currentLesson.lessonIndex);
    }
    navigate("/academy");
  }

  function submitQuestion(raw) {
    const question = raw.trim();
    if (!question) return;

    const context = {
      allLessons,
      currentLesson,
      previousLesson,
      progress,
      learningLevel,
    };

    setMessages((items) => [
      ...items,
      { role: "user", body: question },
      { role: "assistant", ...makeCoachResponse(question, context) },
    ]);
    setInput("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitQuestion(input);
  }

  const missionScore = mission
    ? [mission.recallComplete, mission.lessonComplete, mission.reflectionComplete].filter(Boolean).length
    : 0;

  return (
    <main className="coach-page">
      <header className="coach-hero">
        <div>
          <p><Sparkles size={14} /> TRQX LEARNING ENGINE</p>
          <h1>Personal Trading Mentor</h1>
          <span>
            Active recall, daily missions, and personalized Academy reinforcement.
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
          <div><span>Learning level</span><strong>{learningLevel}</strong></div>
        </article>
        <article>
          <BookOpen size={20} />
          <div><span>Academy progress</span><strong>{progress}%</strong></div>
        </article>
        <article>
          <Flame size={20} />
          <div><span>Study streak</span><strong>{stats?.studyStreak || 0} days</strong></div>
        </article>
        <article>
          <Target size={20} />
          <div><span>Current focus</span><strong>{currentLesson?.title || "Course review"}</strong></div>
        </article>
      </section>

      <section className="coach-learning-grid">
        <section className="coach-mission-panel">
          <header>
            <div>
              <CalendarCheck2 size={19} />
              <div><h2>Today's Mission</h2><span>{missionScore} of 3 complete</span></div>
            </div>
            <strong>+75 XP</strong>
          </header>

          <div className="coach-mission-progress">
            <i style={{ width: `${(missionScore / 3) * 100}%` }} />
          </div>

          <button
            className={mission?.recallComplete ? "is-complete" : ""}
            onClick={() => document.getElementById("recall-card")?.scrollIntoView({ behavior: "smooth" })}
          >
            <span><Brain size={17} /> Complete active recall</span>
            {mission?.recallComplete ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
          </button>

          <button
            className={mission?.lessonComplete ? "is-complete" : ""}
            onClick={continueLesson}
          >
            <span><BookOpen size={17} /> Study {currentLesson?.title || "Academy review"}</span>
            {mission?.lessonComplete ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
          </button>

          <button
            className={mission?.reflectionComplete ? "is-complete" : ""}
            onClick={() => updateMission({ reflectionComplete: !mission?.reflectionComplete })}
          >
            <span><Lightbulb size={17} /> Record one takeaway</span>
            {mission?.reflectionComplete ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
          </button>
        </section>

        <section className="coach-recall-card" id="recall-card">
          <header>
            <div><RotateCcw size={19} /><span>ACTIVE RECALL</span></div>
            <small>Do not open your notes yet.</small>
          </header>

          <h2>{recall.title}</h2>
          <p>{recall.question}</p>

          {!recallSubmitted ? (
            <>
              <textarea
                value={recallAnswer}
                onChange={(event) => setRecallAnswer(event.target.value)}
                placeholder="Explain it in your own words..."
              />
              <button onClick={submitRecall}>
                Submit Recall <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <div className="coach-recall-feedback">
              <CheckCircle2 size={20} />
              <div>
                <strong>Recall recorded</strong>
                <span>
                  Compare your answer with the lesson objective, then correct anything you missed.
                </span>
              </div>
            </div>
          )}
        </section>

        <aside className="coach-profile-card">
          <h2>Learning Profile</h2>
          <div><span>Completed</span><strong>{completedCount} / {allLessons.length}</strong></div>
          <div><span>Last session</span><strong>{formatRelative(stats?.lastActivity)}</strong></div>
          <div><span>Membership</span><strong>{String(tier || "free").toUpperCase()}</strong></div>
          <div><span>Next lesson</span><strong>{currentLesson?.title || "Review"}</strong></div>

          <div className="coach-progress-track">
            <i style={{ width: `${progress}%` }} />
          </div>

          <button onClick={continueLesson}>
            Continue Learning <ChevronRight size={15} />
          </button>
        </aside>
      </section>

      <section className="coach-chat-panel">
        <div className="coach-chat-heading">
          <div>
            <MessageSquareText size={18} />
            <div><h2>Ask Your Coach</h2><span>Responses use your current learning stage.</span></div>
          </div>
          <span className="coach-status"><i /> Profile loaded</span>
        </div>

        <div className="coach-messages" ref={messageRef}>
          {messages.map((message, index) => (
            <CoachMessage key={`${message.role}-${index}`} message={message} />
          ))}
        </div>

        <div className="coach-quick-prompts">
          {QUICK_PROMPTS.map((prompt) => (
            <button key={prompt} onClick={() => submitQuestion(prompt)}>
              {prompt}
            </button>
          ))}
        </div>

        <form className="coach-input" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about a lesson, rule, or trading concept..."
          />
          <button type="submit" aria-label="Send">
            <Send size={18} />
          </button>
        </form>
      </section>

      <section className="coach-reward-strip">
        <Trophy size={18} />
        <div>
          <strong>Learning reinforcement is active</strong>
          <span>
            Daily missions and recall prompts are stored per user in the browser for this prototype.
          </span>
        </div>
        <Clock3 size={17} />
      </section>
    </main>
  );
}
