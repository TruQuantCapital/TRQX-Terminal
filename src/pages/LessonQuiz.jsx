import React, { useState } from "react";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useQuizAttempt } from "../hooks/useQuizAttempt";

export default function LessonQuiz({ levelKey, lessonIndex, quizQuestions, onPassed }) {
  const { submitQuiz, submitting, PASS_THRESHOLD } = useQuizAttempt();
  const [selected, setSelected] = useState(Array(quizQuestions.length).fill(null));
  const [result, setResult] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);

  const allAnswered = selected.every((s) => s !== null);

  function selectAnswer(qIndex, optionIndex) {
    if (result) return;
    const next = [...selected];
    next[qIndex] = optionIndex;
    setSelected(next);
  }

  async function handleSubmit() {
    const res = await submitQuiz(levelKey, lessonIndex, quizQuestions, selected);
    setResult(res);
    if (res.passed && onPassed) onPassed(res);
  }

  function handleRetry() {
    setSelected(Array(quizQuestions.length).fill(null));
    setResult(null);
    setReviewMode(false);
  }

  if (result) {
    return (
      <div className="quizContainer">
        <div className={`quizResultBanner ${result.passed ? "passed" : "failed"}`}>
          {result.passed ? <CheckCircle size={22} /> : <XCircle size={22} />}
          <div>
            <b>{result.passed ? "Quiz passed!" : "Not quite - try again"}</b>
            <span>
              {result.score} / {result.total} correct
              {" "}({Math.round((result.score / result.total) * 100)}%) -
              {" "}{Math.round(PASS_THRESHOLD * 100)}% needed to pass
            </span>
          </div>
        </div>

        {!result.passed && (
          <button className="quizRetryBtn" onClick={handleRetry}>
            <RotateCcw size={16} /> Retry quiz
          </button>
        )}

        {result.passed && (
          <button className="outlineBtn" onClick={() => setReviewMode((v) => !v)}>
            {reviewMode ? "Hide review" : "Review answers"}
          </button>
        )}

        {reviewMode && (
          <div className="quizReviewList">
            {quizQuestions.map((q, i) => (
              <QuizReviewRow key={i} question={q} selectedIndex={selected[i]} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="quizContainer">
      <div className="quizIntro">
        <b>Knowledge Check</b>
        <span>{quizQuestions.length} questions - {Math.round(PASS_THRESHOLD * 100)}% needed to pass</span>
      </div>

      {quizQuestions.map((q, qIndex) => (
        <div key={qIndex} className="quizQuestionBlock">
          <p className="quizQuestionText">
            {qIndex + 1}. {q.question}
          </p>
          <div className="quizOptionList">
            {q.options.map((opt, optIndex) => (
              <button
                key={optIndex}
                className={`quizOption ${selected[qIndex] === optIndex ? "selected" : ""}`}
                onClick={() => selectAnswer(qIndex, optIndex)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        className="goldBtn quizSubmitBtn"
        disabled={!allAnswered || submitting}
        onClick={handleSubmit}
      >
        {submitting ? "Submitting..." : "Submit Quiz"}
      </button>
    </div>
  );
}

function QuizReviewRow({ question, selectedIndex }) {
  const isCorrect = selectedIndex === question.correctIndex;
  return (
    <div className="quizReviewRow">
      <p className="quizQuestionText">{question.question}</p>
      <div className={`quizReviewAnswer ${isCorrect ? "correct" : "incorrect"}`}>
        {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
        Your answer: {question.options[selectedIndex]}
      </div>
      {!isCorrect && (
        <div className="quizReviewAnswer correct">
          <CheckCircle size={14} />
          Correct answer: {question.options[question.correctIndex]}
        </div>
      )}
    </div>
  );
}
