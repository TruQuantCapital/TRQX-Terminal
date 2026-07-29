import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

const LOCAL_STATS_KEY = "trqx_academy_user_stats";

function emptyStats() {
  return {
    currentLevelKey: null,
    currentLessonIndex: null,
    lastActivity: null,
    studyStreak: 0,
  };
}

function readLocalStats(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_STATS_KEY) || "{}");
    return { ...emptyStats(), ...(all[userId] || {}) };
  } catch {
    return emptyStats();
  }
}

function writeLocalStats(userId, stats) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_STATS_KEY) || "{}");
    all[userId] = stats;
    localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(all));
  } catch {}
}

function nextStreak(previousActivity, previousStreak) {
  if (!previousActivity) return 1;
  const previous = new Date(previousActivity);
  const now = new Date();
  const previousDay = new Date(previous.getFullYear(), previous.getMonth(), previous.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today - previousDay) / 86400000);
  if (diffDays <= 0) return Math.max(1, previousStreak || 1);
  if (diffDays === 1) return Math.max(1, previousStreak || 0) + 1;
  return 1;
}

/** Per-user Academy completion and resume state. */
export function useAcademyProgress() {
  const { user, tier } = useAuth();
  const [completed, setCompleted] = useState({});
  const [stats, setStats] = useState(emptyStats());
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setCompleted({});
      setStats(emptyStats());
      setLoading(false);
      return;
    }

    setLoading(true);
    const [{ data, error }, statsResult] = await Promise.all([
      supabase
        .from("academy_progress")
        .select("level_key, lesson_index")
        .eq("user_id", user.id),
      supabase
        .from("academy_user_stats")
        .select("current_level_key,current_lesson_index,last_activity,study_streak")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (error) console.error("Failed to load academy progress:", error.message);

    const next = {};
    for (const row of data || []) {
      if (!next[row.level_key]) next[row.level_key] = new Set();
      next[row.level_key].add(row.lesson_index);
    }
    setCompleted(next);

    if (!statsResult.error && statsResult.data) {
      const remote = {
        currentLevelKey: statsResult.data.current_level_key,
        currentLessonIndex: statsResult.data.current_lesson_index,
        lastActivity: statsResult.data.last_activity,
        studyStreak: statsResult.data.study_streak || 0,
      };
      setStats(remote);
      writeLocalStats(user.id, remote);
    } else {
      // Backward-compatible fallback until the SQL migration is applied.
      setStats(readLocalStats(user.id));
      if (statsResult.error && statsResult.error.code !== "PGRST116") {
        console.warn("Academy resume table unavailable; using browser fallback:", statsResult.error.message);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const saveStats = useCallback(async (patch, countStudyDay = false) => {
    if (!user) return;
    setStats((previous) => {
      const nowIso = new Date().toISOString();
      const next = {
        ...previous,
        ...patch,
        lastActivity: nowIso,
        studyStreak: countStudyDay
          ? nextStreak(previous.lastActivity, previous.studyStreak)
          : previous.studyStreak,
      };
      writeLocalStats(user.id, next);

      supabase.from("academy_user_stats").upsert({
        user_id: user.id,
        current_level_key: next.currentLevelKey,
        current_lesson_index: next.currentLessonIndex,
        last_activity: next.lastActivity,
        study_streak: next.studyStreak,
        updated_at: nowIso,
      }, { onConflict: "user_id" }).then(({ error }) => {
        if (error) console.warn("Academy resume state saved locally only:", error.message);
      });
      return next;
    });
  }, [user]);

  const recordLessonView = useCallback((levelKey, lessonIndex) => {
    return saveStats({ currentLevelKey: levelKey, currentLessonIndex: lessonIndex }, true);
  }, [saveStats]);

  const markComplete = useCallback(async (levelKey, lessonIndex) => {
    if (!user) return;
    setCompleted((prev) => {
      const next = { ...prev };
      const set = new Set(next[levelKey] || []);
      set.add(lessonIndex);
      next[levelKey] = set;
      return next;
    });

    const { error } = await supabase.from("academy_progress").upsert({
      user_id: user.id,
      level_key: levelKey,
      lesson_index: lessonIndex,
    }, { onConflict: "user_id,level_key,lesson_index" });

    if (error) {
      console.error("Failed to save progress:", error.message);
      fetchProgress();
      return;
    }
    await saveStats({ currentLevelKey: levelKey, currentLessonIndex: lessonIndex }, true);
  }, [user, fetchProgress, saveStats]);

  const levelProgress = useCallback((levelKey, totalLessons) => {
    const set = completed[levelKey];
    if (!set || totalLessons === 0) return 0;
    return Math.round((set.size / totalLessons) * 100);
  }, [completed]);

  const isLevelUnlocked = useCallback((levelIndex, allLevels) => {
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
  }, [completed, tier]);

  return {
    completed,
    stats,
    loading,
    markComplete,
    recordLessonView,
    levelProgress,
    isLevelUnlocked,
    refreshProgress: fetchProgress,
  };
}
