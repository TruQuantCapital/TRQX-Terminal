import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

/**
 * Tracks per-user lesson completion in Supabase.
 *
 * Returns:
 *   completed: { [levelKey]: Set<lessonIndex> }
 *   loading: boolean
 *   markComplete(levelKey, lessonIndex)
 *   isLevelUnlocked(levelKey, levelIndex, allLevels): boolean
 *   levelProgress(levelKey, totalLessons): 0-100
 */
export function useAcademyProgress() {
  const { user, tier } = useAuth();
  const [completed, setCompleted] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setCompleted({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("academy_progress")
      .select("level_key, lesson_index")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to load academy progress:", error.message);
      setLoading(false);
      return;
    }

    const next = {};
    for (const row of data) {
      if (!next[row.level_key]) next[row.level_key] = new Set();
      next[row.level_key].add(row.lesson_index);
    }
    setCompleted(next);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const markComplete = useCallback(
    async (levelKey, lessonIndex) => {
      if (!user) return;

      // Optimistic update
      setCompleted((prev) => {
        const next = { ...prev };
        const set = new Set(next[levelKey] || []);
        set.add(lessonIndex);
        next[levelKey] = set;
        return next;
      });

      const { error } = await supabase.from("academy_progress").upsert(
        {
          user_id: user.id,
          level_key: levelKey,
          lesson_index: lessonIndex,
        },
        { onConflict: "user_id,level_key,lesson_index" }
      );

      if (error) {
        console.error("Failed to save progress:", error.message);
        // Roll back optimistic update on failure
        fetchProgress();
      }
    },
    [user, fetchProgress]
  );

  const levelProgress = useCallback(
    (levelKey, totalLessons) => {
      const set = completed[levelKey];
      if (!set || totalLessons === 0) return 0;
      return Math.round((set.size / totalLessons) * 100);
    },
    [completed]
  );

    const isLevelUnlocked = useCallback(
    (levelIndex, allLevels) => {
      const level = allLevels[levelIndex];

      const tierAccess = {
        beginner: ["free", "starter", "pro", "elite"],
        intermediate: ["pro", "elite"],
        advanced: ["elite"],
      };

      const tierAllowed = tierAccess[level.key]?.includes(tier) ?? false;
      if (!tierAllowed) return false;

      if (levelIndex === 0) return true;

      const prevLevel = allLevels[levelIndex - 1];
      const prevSet = completed[prevLevel.key];

      return !!prevSet && prevSet.size >= prevLevel.lessons.length;
    },
    [completed, tier]
  );

  return { completed, loading, markComplete, levelProgress, isLevelUnlocked };
}
