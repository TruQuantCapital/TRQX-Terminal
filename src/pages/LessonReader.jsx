import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import LessonQuiz from "./LessonQuiz";
import { useQuizAttempt } from "../hooks/useQuizAttempt";
import AcademyChatWidget from "./AcademyChatWidget";
import ClickIdentifyChart from "./ClickIdentifyChart";
import DragLabelDrill from "./DragLabelDrill";
import DragTimelineDrill from "./DragTimelineDrill";
import "./quiz.css";
import "./chatWidget.css";
import "./drills.css";
import "./timelineDrill.css";
import "./footerButtons.css";
import FlashCards from "../components/FlashCards";
import AssignmentGrader from "../components/AssignmentGrader";

export default function LessonReader({
  level,
  lessonIndex,
  isCompleted,
  onClose,
  onComplete,
  onNavigate,
}) {
  const lesson = level.lessons[lessonIndex];
  const hasPrev = lessonIndex > 0;
  const hasNext = lessonIndex < level.lessons.length - 1;
  const hasQuiz = Array.isArray(lesson.quiz) && lesson.quiz.length > 0;
  const hasDrills = !!lesson.drills;

  const { getBestAttempt } = useQuizAttempt();
  const [quizPassed, setQuizPassed] = useState(!hasQuiz);
  const [checkingPriorAttempt, setCheckingPriorAttempt] = useState(hasQuiz);

  useEffect(() => {
    let cancelled = false;
    setQuizPassed(!hasQuiz);
    setCheckingPriorAttempt(hasQuiz);

    if (hasQuiz) {
      getBestAttempt(level.key, lessonIndex).then((attempt) => {
        if (cancelled) return;
        if (attempt && attempt.passed) setQuizPassed(true);
        setCheckingPriorAttempt(false);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [level.key, lessonIndex, hasQuiz, getBestAttempt]);

  return (
    <div className="lessonReaderOverlay" onClick={onClose}>
      <div className="lessonReaderCard" onClick={(e) => e.stopPropagation()}>
        <div className="lessonReaderHeader">
          <div>
            <small>{level.title.toUpperCase()} - LESSON {lessonIndex + 1} OF {level.lessons.length}</small>
            <h2>{lesson.title}</h2>
            {lesson.objective && <p className="lessonReaderObjective">{lesson.objective}</p>}
          </div>
          <button className="lessonReaderClose" onClick={onClose} aria-label="Close lesson">
            <X size={20} />
          </button>
        </div>

        <div className="lessonReaderBody">
          {lesson.content.map((block, i) => {
            if (block.type === "heading") {
              if (block.text.includes("STUDENT ASSIGNMENT")) {
                return (
                  <div key={i}>
                    <h3>{block.text}</h3>
                    <AssignmentGrader lesson={lesson} />
                  </div>
                );
              }
              return <h3 key={i}>{block.text}</h3>;
            }
            if (block.type === "callout") {
              return (
                <div key={i} className="lessonReaderCallout">
                  {block.text}
                </div>
              );
            }
            if (block.type === "svg") {
              return (
                <div
                  key={i}
                  className="lessonReaderDiagram"
                  dangerouslySetInnerHTML={{ __html: block.svg }}
                />
              );
            }
            return <p key={i}>{block.text}</p>;
          })}
                    <FlashCards lesson={lesson} />
                    

          {hasDrills && lesson.drills.clickIdentify && (
            <>
              <h3>Practice: Identify the Pattern</h3>
              {lesson.drills.clickIdentify.map((drill) => (
                <ClickIdentifyChart
                  key={drill.id}
                  prices={drill.prices}
                  correctIndex={drill.correctIndex}
                  prompt={drill.prompt}
                  explanation={drill.explanation}
                />
              ))}
            </>
          )}

          {hasDrills && lesson.drills.dragLabel && (
            <>
              <h3>Practice: Label the Charts</h3>
              <DragLabelDrill
                prompt={lesson.drills.dragLabel.prompt}
                labels={lesson.drills.dragLabel.labels}
                charts={lesson.drills.dragLabel.charts}
              />
            </>
          )}

          {hasDrills && lesson.drills.dragTimeline && (
            <>
              <h3>Practice: Build the Sequence</h3>
              <DragTimelineDrill
                prompt={lesson.drills.dragTimeline.prompt}
                chips={lesson.drills.dragTimeline.chips}
                slots={lesson.drills.dragTimeline.slots}
              />
            </>
          )}

          {hasQuiz && !checkingPriorAttempt && (
            <LessonQuiz
              levelKey={level.key}
              lessonIndex={lessonIndex}
              quizQuestions={lesson.quiz}
              onPassed={() => setQuizPassed(true)}
            />
          )}
        </div>

        <div className="lessonReaderFooter">
          <button
            className="outlineBtn"
            disabled={!hasPrev}
            onClick={() => onNavigate(lessonIndex - 1)}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <button
            className={isCompleted ? "lessonCompleteBtn done" : "lessonCompleteBtn"}
            disabled={!quizPassed}
            title={!quizPassed ? "Pass the quiz above to mark this lesson complete" : undefined}
            onClick={() => onComplete(lessonIndex)}
          >
            <CheckCircle size={16} />
            {isCompleted ? "Completed" : quizPassed ? "Mark Complete" : "Pass quiz to complete"}
          </button>

          <button
            className="goldBtn"
            disabled={!hasNext}
            onClick={() => onNavigate(lessonIndex + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

        <AcademyChatWidget lesson={lesson} />
      </div>
    </div>
  );
}
