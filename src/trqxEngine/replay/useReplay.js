import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SPEED_DELAYS = {
  0.5: 1800,
  1: 1000,
  2: 500,
  5: 200,
};

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

export default function useReplay({
  candles = [],
  initialVisible = 1,
  initialSpeed = 1,
  loop = false,
} = {}) {
  const totalCandles = Array.isArray(candles) ? candles.length : 0;

  const safeInitialVisible = clamp(
    initialVisible,
    totalCandles > 0 ? 1 : 0,
    totalCandles
  );

  const [visibleCount, setVisibleCount] = useState(safeInitialVisible);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);

  const timerRef = useRef(null);

  const finished =
    totalCandles === 0 || visibleCount >= totalCandles;

  const currentIndex =
    visibleCount > 0 ? visibleCount - 1 : -1;

  const progress =
    totalCandles > 0
      ? Math.round((visibleCount / totalCandles) * 100)
      : 0;

  const visibleCandles = useMemo(
    () => candles.slice(0, visibleCount),
    [candles, visibleCount]
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    setPlaying(false);
    clearTimer();
  }, [clearTimer]);

  const next = useCallback(() => {
    setVisibleCount((current) => {
      if (totalCandles === 0) {
        return 0;
      }

      if (current >= totalCandles) {
        return loop ? 1 : totalCandles;
      }

      return current + 1;
    });
  }, [loop, totalCandles]);

  const previous = useCallback(() => {
    pause();

    setVisibleCount((current) =>
      clamp(current - 1, totalCandles > 0 ? 1 : 0, totalCandles)
    );
  }, [pause, totalCandles]);

  const reset = useCallback(
    (count = safeInitialVisible) => {
      pause();

      setVisibleCount(
        clamp(
          count,
          totalCandles > 0 ? 1 : 0,
          totalCandles
        )
      );
    },
    [pause, safeInitialVisible, totalCandles]
  );

  const revealAll = useCallback(() => {
    pause();
    setVisibleCount(totalCandles);
  }, [pause, totalCandles]);

  const play = useCallback(() => {
    if (totalCandles <= 1) {
      return;
    }

    if (finished) {
      if (loop) {
        setVisibleCount(1);
      } else {
        return;
      }
    }

    setPlaying(true);
  }, [finished, loop, totalCandles]);

  const togglePlay = useCallback(() => {
    if (playing) {
      pause();
    } else {
      play();
    }
  }, [pause, play, playing]);

  const goTo = useCallback(
    (count) => {
      pause();

      setVisibleCount(
        clamp(
          count,
          totalCandles > 0 ? 1 : 0,
          totalCandles
        )
      );
    },
    [pause, totalCandles]
  );

  useEffect(() => {
    pause();
    setVisibleCount(safeInitialVisible);
  }, [candles, pause, safeInitialVisible]);

  useEffect(() => {
    clearTimer();

    if (!playing) {
      return undefined;
    }

    if (finished) {
      if (loop) {
        timerRef.current = window.setTimeout(() => {
          setVisibleCount(1);
        }, SPEED_DELAYS[speed] ?? SPEED_DELAYS[1]);
      } else {
        setPlaying(false);
      }

      return clearTimer;
    }

    timerRef.current = window.setTimeout(() => {
      setVisibleCount((current) =>
        Math.min(current + 1, totalCandles)
      );
    }, SPEED_DELAYS[speed] ?? SPEED_DELAYS[1]);

    return clearTimer;
  }, [
    clearTimer,
    finished,
    loop,
    playing,
    speed,
    totalCandles,
    visibleCount,
  ]);

  useEffect(() => clearTimer, [clearTimer]);

  return {
    visibleCandles,
    visibleCount,
    totalCandles,
    currentIndex,
    progress,
    playing,
    finished,
    speed,
    speedOptions: Object.keys(SPEED_DELAYS).map(Number),
    next,
    previous,
    reset,
    revealAll,
    play,
    pause,
    togglePlay,
    goTo,
    setSpeed,
  };
}
