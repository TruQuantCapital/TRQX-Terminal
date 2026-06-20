import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

const PASS_THRESHOLD = 0.8;

export function useQuizAttempt() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const submitQuiz = useCallback(
    async (levelKey, lessonIndex, quizQuestions, selectedAnswers) => {
      let score = 0;
      quizQuestions.forEach((q, i) => {
        if (selectedAnswers[i] === q.correctIndex) score++;
      });

      const total = quizQuestions.length;
      const passed = score / total >= PASS_THRESHOLD;

      if (!user) {
        return { score, total, passed, saved: false };
      }

      setSubmitting(true);
      const { error } = await supabase.from("academy_quiz_attempts").insert({
        user_id: user.id,
        level_key: levelKey,
        lesson_index: lessonIndex,
        score,
        total,
        passed,
        answers: selectedAnswers,
      });
      setSubmitting(false);

      if (error) {
        console.error("Failed to save quiz attempt:", error.message);
        return { score, total, passed, saved: false };
      }

      return { score, total, passed, saved: true };
    },
    [user]
  );

  const getBestAttempt = useCallback(
    async (levelKey, lessonIndex) => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("academy_quiz_attempts")
        .select("score, total, passed, attempted_at")
        .eq("user_id", user.id)
        .eq("level_key", levelKey)
        .eq("lesson_index", lessonIndex)
        .order("passed", { ascending: false })
        .order("score", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch quiz attempt:", error.message);
        return null;
      }
      return data;
    },
    [user]
  );

  return { submitQuiz, getBestAttempt, submitting, PASS_THRESHOLD };
}
