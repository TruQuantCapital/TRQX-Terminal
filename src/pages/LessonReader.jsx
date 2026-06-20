import React from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export default function LessonReader({
  level,
  lessonIndex,
  isCompleted,
  onClose,
  onComplete,
  onNavigate, // (newIndex) => void
}) {
  const lesson = level.lessons[lessonIndex];
  const hasPrev = lessonIndex > 0;
  const hasNext = lessonIndex < level.lessons.length - 1;

  return (
    <div className="lessonReaderOverlay" onClick={onClose}>
      <div className="lessonReaderCard" onClick={(e) => e.stopPropagation()}>
        <div className="lessonReaderHeader">
          <div>
            <small>{level.title.toUpperCase()} · LESSON {lessonIndex + 1} OF {level.lessons.length}</small>
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
              return <h3 key={i}>{block.text}</h3>;
            }
            if (block.type === "callout") {
              return (
                <div key={i} className="lessonReaderCallout">
                  {block.text}
                </div>
              );
            }
            return <p key={i}>{block.text}</p>;
          })}
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
            onClick={() => onComplete(lessonIndex)}
          >
            <CheckCircle size={16} />
            {isCompleted ? "Completed" : "Mark Complete"}
          </button>

          <button
            className="goldBtn"
            disabled={!hasNext}
            onClick={() => onNavigate(lessonIndex + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
