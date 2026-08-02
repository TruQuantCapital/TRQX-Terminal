import React, {
  useEffect,
  useMemo,
} from "react";
import PatternRenderer from "../renderer/PatternRenderer";
import ReplayControls from "./ReplayControls";
import ReplayProgress from "./ReplayProgress";
import ReplayTimeline from "./ReplayTimeline";
import useReplay from "./useReplay";
import "./replay.css";

function createVisibleScenario(
  scenario,
  visibleCandles,
  finished
) {
  return {
    ...scenario,
    candles: visibleCandles,

    levels: finished
      ? scenario.levels
      : {
          support: scenario.levels?.support,
        },

    answer: finished
      ? scenario.answer
      : {
          pattern: "Market Replay",
          validSetup: false,
          action:
            "Future candles are hidden. Read the current structure before advancing.",
        },

    explanation: finished
      ? scenario.explanation
      : "Advance one candle at a time and make decisions using only printed information.",
  };
}

export default function ReplayPlayer({
  scenario,
  initialVisible = 1,
  enableKeyboard = true,
  onReplayState,
}) {
  const candles = scenario?.candles ?? [];

  const replay = useReplay({
    candles,
    initialVisible,
    initialSpeed: 1,
  });

  const visibleScenario = useMemo(
    () =>
      createVisibleScenario(
        scenario,
        replay.visibleCandles,
        replay.finished
      ),
    [
      replay.finished,
      replay.visibleCandles,
      scenario,
    ]
  );

  useEffect(() => {
    onReplayState?.({
      visibleCount: replay.visibleCount,
      totalCandles: replay.totalCandles,
      currentIndex: replay.currentIndex,
      finished: replay.finished,
      playing: replay.playing,
      progress: replay.progress,
    });
  }, [
    onReplayState,
    replay.currentIndex,
    replay.finished,
    replay.playing,
    replay.progress,
    replay.totalCandles,
    replay.visibleCount,
  ]);

  useEffect(() => {
    if (!enableKeyboard) {
      return undefined;
    }

    function handleKeyDown(event) {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        replay.togglePlay();
      }

      if (event.code === "ArrowRight") {
        event.preventDefault();
        replay.next();
      }

      if (event.code === "ArrowLeft") {
        event.preventDefault();
        replay.previous();
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        replay.reset();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [enableKeyboard, replay]);

  if (!scenario) {
    return (
      <div className="trqx-replay-error">
        No scenario was supplied to ReplayPlayer.
      </div>
    );
  }

  return (
    <section className="trqx-replay-player">
      <div className="trqx-replay-player__header">
        <div>
          <small>TRQX MARKET SIMULATOR</small>
          <h2>Candle Replay</h2>
          <p>
            Future candles remain hidden until they print.
          </p>
        </div>

        <div className="trqx-replay-player__shortcuts">
          <span>Space: Play/Pause</span>
          <span>← →: Step</span>
          <span>R: Reset</span>
        </div>
      </div>

      <ReplayProgress
        visibleCount={replay.visibleCount}
        totalCandles={replay.totalCandles}
        progress={replay.progress}
        finished={replay.finished}
      />

      <PatternRenderer
        scenario={visibleScenario}
        showLevels
        showLabels={replay.finished}
      />

      <ReplayTimeline
        candles={candles}
        visibleCount={replay.visibleCount}
        onSelect={replay.goTo}
      />

      <ReplayControls
        playing={replay.playing}
        finished={replay.finished}
        visibleCount={replay.visibleCount}
        totalCandles={replay.totalCandles}
        speed={replay.speed}
        speedOptions={replay.speedOptions}
        onPrevious={replay.previous}
        onNext={replay.next}
        onTogglePlay={replay.togglePlay}
        onReset={replay.reset}
        onRevealAll={replay.revealAll}
        onSpeedChange={replay.setSpeed}
      />
    </section>
  );
}
