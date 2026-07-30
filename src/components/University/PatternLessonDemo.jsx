import React from "react";
import PatternLessonCard from "./PatternLessonCard";
import { getPatternById } from "../../data/university/patternLibrary";

export default function PatternLessonDemo() {
  const pattern = getPatternById("tweezer-top");

  return (
    <PatternLessonCard
      pattern={pattern}
      onComplete={(patternId) => {
        console.log(`[university] completed pattern lesson: ${patternId}`);
      }}
    />
  );
}
