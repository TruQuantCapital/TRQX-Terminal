import React, { useMemo, useState } from "react";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useQuizAttempt } from "../hooks/useQuizAttempt";

function normalizeQuestion(question, index) {
  const options = Array.isArray(question?.options)
    ? question.options
    : Array.isArray(question?.answers)
      ? question.answers
      : [];

  const correctIndex = Number.isInteger(question?.correctIndex)
    ? question.correctIndex
    : Number.isInteger(question?.correctAnswer)
      ? question.correctAnswer
      : -1;

  return {
    ...question,
    id: question?.id || `quiz-question-${index + 1}`,
    question:
      question?.question ||
      `Question ${index + 1}`,
    options,
    correctIndex,
    explanation: question?.explanation || "",
  };
}

export default function LessonQuiz({
  levelKey,
  lessonIndex,
  quizQuestions,
  onPassed,
}) {
  const {
    submitQuiz,
    submitting,
    PASS_THRESHOLD,
  } = useQuizAttempt();

  const normalizedQuestions = useMemo(
    () =>
      Array.isArray(quizQuestions)
        ? quizQuestions.map(normalizeQuestion)
        : [],
    [quizQuestions]
  );

  const [selected, setSelected] = useState(() =>
    Array(normalizedQuestions.length).fill(null)
  );

  const [result, setResult] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);

  const allAnswered =
    normalizedQuestions.length > 0 &&
    selected.length === normalizedQuestions.length &&
    selected.every((selection) => selection !== null);

  function selectAnswer(questionIndex, optionIndex) {
    if (result) {
      return;
    }

    const next = [...selected];
    next[questionIndex] = optionIndex;
    setSelected(next);
  }

  async function handleSubmit() {
    const response = await submitQuiz(
      levelKey,
      lessonIndex,
      normalizedQuestions,
      selected
    );

    setResult(response);

    if (response.passed && onPassed) {
      onPassed(response);
    }
  }

  function handleRetry() {
    setSelected(
      Array(normalizedQuestions.length).fill(null)
    );
    setResult(null);
    setReviewMode(false);
  }

  if (!normalizedQuestions.length) {
    return (
      <div className="quizContainer">
        <div className="quizIntro">
          <b>Knowledge Check</b>
          <span>No quiz questions are available.</span>
        </div>
      </div>
    );
  }

  if (result) {
    const percentage = result.total
      ? Math.round(
          (result.score / result.total) * 100
        )
      : 0;

    return (
      <div className="quizContainer">
        <div
          className={`quizResultBanner ${
            result.passed ? "passed" : "failed"
          }`}
        >
          {result.passed ? (
            <CheckCircle size={22} />
          ) : (
            <XCircle size={22} />
          )}

          <div>
            <b>
              {result.passed
                ? "Quiz passed!"
                : "Not quite - try again"}
            </b>

            <span>
              {result.score} / {result.total} correct{" "}
              ({percentage}%) -{" "}
              {Math.round(PASS_THRESHOLD * 100)}%
              needed to pass
            </span>
          </div>
        </div>

        {!result.passed ? (
          <button
            type="button"
            className="quizRetryBtn"
            onClick={handleRetry}
          >
            <RotateCcw size={16} />
            Retry quiz
          </button>
        ) : (
          <button
            type="button"
            className="outlineBtn"
            onClick={() =>
              setReviewMode((current) => !current)
            }
          >
            {reviewMode
              ? "Hide review"
              : "Review answers"}
          </button>
        )}

        {reviewMode ? (
          <div className="quizReviewList">
            {normalizedQuestions.map(
              (question, index) => (
                <QuizReviewRow
                  key={question.id || index}
                  question={question}
                  selectedIndex={selected[index]}
                />
              )
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="quizContainer">
      <div className="quizIntro">
        <b>Knowledge Check</b>

        <span>
          {normalizedQuestions.length} questions -{" "}
          {Math.round(PASS_THRESHOLD * 100)}%
          needed to pass
        </span>
      </div>

      {normalizedQuestions.map(
        (question, questionIndex) => (
          <div
            key={question.id || questionIndex}
            className="quizQuestionBlock"
          >
            <p className="quizQuestionText">
              {questionIndex + 1}.{" "}
              {question.question}
            </p>

            <div className="quizOptionList">
              {question.options.map(
                (option, optionIndex) => (
                  <button
                    key={`${question.id}-${optionIndex}`}
                    type="button"
                    className={`quizOption ${
                      selected[questionIndex] ===
                      optionIndex
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      selectAnswer(
                        questionIndex,
                        optionIndex
                      )
                    }
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          </div>
        )
      )}

      <button
        type="button"
        className="goldBtn quizSubmitBtn"
        disabled={!allAnswered || submitting}
        onClick={handleSubmit}
      >
        {submitting
          ? "Submitting..."
          : "Submit Quiz"}
      </button>
    </div>
  );
}

function QuizReviewRow({
  question,
  selectedIndex,
}) {
  const isCorrect =
    selectedIndex === question.correctIndex;

  const selectedAnswer =
    question.options[selectedIndex] ||
    "No answer selected";

  const correctAnswer =
    question.options[question.correctIndex] ||
    "Correct answer unavailable";

  return (
    <div className="quizReviewRow">
      <p className="quizQuestionText">
        {question.question}
      </p>

      <div
        className={`quizReviewAnswer ${
          isCorrect ? "correct" : "incorrect"
        }`}
      >
        {isCorrect ? (
          <CheckCircle size={14} />
        ) : (
          <XCircle size={14} />
        )}

        Your answer: {selectedAnswer}
      </div>

      {!isCorrect ? (
        <div className="quizReviewAnswer correct">
          <CheckCircle size={14} />
          Correct answer: {correctAnswer}
        </div>
      ) : null}

      {question.explanation ? (
        <div className="quizReviewExplanation">
          {question.explanation}
        </div>
      ) : null}
    </div>
  );
}