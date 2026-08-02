import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateAccuracy,
  calculateDecisionXP,
  calculateTradePlanXP,
} from "../scoring/simulatorScoring";
import {
  evaluateAchievements,
} from "../scoring/achievements";

const STORAGE_KEY = "trqx_simulator_progress_v1";

const DEFAULT_PROGRESS = {
  attempts: 0,
  correct: 0,
  xp: 0,
  currentStreak: 0,
  bestStreak: 0,
  scenariosCompleted: 0,
  tradePlansSubmitted: 0,
  tradePlanScoreTotal: 0,
};

function readProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return DEFAULT_PROGRESS;
    }

    const parsed = JSON.parse(stored);

    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export default function useSimulatorProgress() {
  const [progress, setProgress] = useState(readProgress);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(progress)
    );
  }, [progress]);

  const accuracy = calculateAccuracy(
    progress.correct,
    progress.attempts
  );

  const averageTradePlanScore =
    progress.tradePlansSubmitted > 0
      ? Math.round(
          progress.tradePlanScoreTotal /
            progress.tradePlansSubmitted
        )
      : 0;

  const enrichedProgress = useMemo(
    () => ({
      ...progress,
      accuracy,
      averageTradePlanScore,
    }),
    [accuracy, averageTradePlanScore, progress]
  );

  const achievements = useMemo(
    () => evaluateAchievements(enrichedProgress),
    [enrichedProgress]
  );

  const recordDecision = useCallback((result) => {
    setProgress((current) => {
      const correct = Boolean(result?.correct);
      const nextStreak = correct
        ? current.currentStreak + 1
        : 0;

      return {
        ...current,
        attempts: current.attempts + 1,
        correct:
          current.correct + (correct ? 1 : 0),
        xp:
          current.xp +
          calculateDecisionXP(result),
        currentStreak: nextStreak,
        bestStreak: Math.max(
          current.bestStreak,
          nextStreak
        ),
      };
    });
  }, []);

  const recordTradePlan = useCallback((result) => {
    setProgress((current) => ({
      ...current,
      xp:
        current.xp +
        calculateTradePlanXP(result),
      tradePlansSubmitted:
        current.tradePlansSubmitted + 1,
      tradePlanScoreTotal:
        current.tradePlanScoreTotal +
        Number(result?.score ?? 0),
    }));
  }, []);

  const recordScenarioComplete = useCallback(() => {
    setProgress((current) => ({
      ...current,
      scenariosCompleted:
        current.scenariosCompleted + 1,
      xp: current.xp + 75,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    progress: enrichedProgress,
    achievements,
    recordDecision,
    recordTradePlan,
    recordScenarioComplete,
    resetProgress,
  };
}
