import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  generateScenario,
  listScenarios,
} from "../trqxEngine";
import ReplayPlayer from "../trqxEngine/replay/ReplayPlayer";
import DecisionQuizPanel from "../trqxEngine/quiz/DecisionQuizPanel";
import CoachPanel from "../trqxEngine/coach/CoachPanel";
import useSimulatorProgress from "../trqxEngine/analytics/useSimulatorProgress";
import EngineDiagnosticsPanel from "../trqxEngine/diagnostics/EngineDiagnosticsPanel";
import TradeBuilderPanel from "../trqxEngine/trade/builder/TradeBuilderPanel";
import TradeGradePanel from "../trqxEngine/trade/grading/TradeGradePanel";
import gradeTradePlan from "../trqxEngine/trade/grading/gradeTradePlan";
import CertificationPanel from "../trqxEngine/certification/CertificationPanel";
import calculateCertification from "../trqxEngine/certification/calculateCertification";
import JournalPanel from "../trqxEngine/trade/journal/JournalPanel";
import createJournalEntry from "../trqxEngine/trade/journal/createJournalEntry";
import { saveJournalEntry } from "../trqxEngine/trade/journal/journalStore";
import useTrainingSession from "../trqxEngine/session/useTrainingSession";

const DEFAULT_REPLAY_STATE = {
  visibleCount: 1,
  totalCandles: 0,
  currentIndex: 0,
  finished: false,
  playing: false,
  progress: 0,
};

function SimulatorSession({
  scenario,
  availableScenarios,
  scenarioId,
  confirmed,
  version,
  onScenarioChange,
  onToggleConfirmation,
  onGenerate,
  onResetStats,
  showDiagnostics,
  onToggleDiagnostics,
  showJournal,
  onToggleJournal,
  simulator,
}) {
  const [replayState, setReplayState] =
    useState(DEFAULT_REPLAY_STATE);

  const [latestResult, setLatestResult] =
    useState(null);

  const [tradeGrade, setTradeGrade] =
    useState(null);

  const [certification, setCertification] =
    useState(null);

  const [
    completedScenarioId,
    setCompletedScenarioId,
  ] = useState(null);

  const training = useTrainingSession({
    scenario,
    persist: true,
  });

  useEffect(() => {
    training.start();
  }, []);

  const handleReplayState = useCallback(
    (state) => {
      setReplayState(state);
      training.updateReplay(state);

      if (
        state.finished &&
        completedScenarioId !== scenario.id
      ) {
        simulator.recordScenarioComplete();
        setCompletedScenarioId(scenario.id);
      }
    },
    [
      completedScenarioId,
      scenario.id,
      simulator,
      training,
    ]
  );

  function handleDecisionResult(result) {
    setLatestResult(result);
    simulator.recordDecision(result);

    training.recordDecision({
      ...result,
      visibleCount: replayState.visibleCount,
    });
  }

  function handleTradeChange(trade) {
    setTradeGrade(null);
    setCertification(null);
    training.updateTrade(trade);
  }

  function handleTradeSubmit(trade) {
    training.submitTrade(trade);

    const grade = gradeTradePlan({
      trade,
      scenario,
    });

    setTradeGrade(grade);
    training.recordGrade(grade);

    simulator.recordTradePlan({
      score: grade.overall,
      passed: grade.passed,
    });

    const sessionSnapshot = {
      ...training.session,
      trade,
      grading: grade,
      replay: replayState,
    };

    const certificationResult =
      calculateCertification({
        session: sessionSnapshot,
        tradeGrade: grade,
      });

    setCertification(certificationResult);

    certificationResult.achievements.forEach(
      (achievement) => {
        training.unlockAchievement(achievement);
      }
    );

    const journalEntry = createJournalEntry({
      session: {
        ...sessionSnapshot,
        achievements:
          certificationResult.achievements,
      },
      tradeGrade: grade,
      certification:
        certificationResult,
    });

    saveJournalEntry(journalEntry);

    training.complete({
      certification: certificationResult,
      journalEntryId: journalEntry.id,
    });
  }

  function handleLegacyTradePlanResult(result) {
    simulator.recordTradePlan(result);
    training.recordGrade(result);
  }

  return (
    <>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <small
            style={{
              color: "#d4af37",
              fontWeight: 900,
              letterSpacing: "0.14em",
            }}
          >
            TRQX ENGINE — SPRINT 07A
          </small>

          <h1
            style={{
              margin: "7px 0 0",
              color: "#ffffff",
            }}
          >
            Professional Trade Simulator
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <select
            value={scenarioId}
            onChange={onScenarioChange}
            style={{
              minHeight: 38,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid #303846",
              background: "#111722",
              color: "#ffffff",
            }}
          >
            {availableScenarios.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onToggleConfirmation}
          >
            {confirmed
              ? "Load Failed Setup"
              : "Load Confirmed Setup"}
          </button>

          <button
            type="button"
            onClick={onGenerate}
          >
            Generate New Scenario
          </button>

          <button
            type="button"
            onClick={onToggleDiagnostics}
          >
            {showDiagnostics
              ? "Hide Diagnostics"
              : "Show Diagnostics"}
          </button>

          <button
            type="button"
            onClick={onToggleJournal}
          >
            {showJournal
              ? "Hide Journal"
              : "Show Journal"}
          </button>

          <button
            type="button"
            onClick={onResetStats}
          >
            Reset Stats
          </button>
        </div>
      </header>

      {showDiagnostics ? (
        <EngineDiagnosticsPanel />
      ) : null}

      {showJournal ? (
        <JournalPanel />
      ) : null}

      <div
        className="trqx-simulator-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 330px",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <section
          style={{
            display: "grid",
            gap: "20px",
            minWidth: 0,
          }}
        >
          <ReplayPlayer
            key={`${scenarioId}-${confirmed}-${version}`}
            scenario={scenario}
            initialVisible={1}
            onReplayState={handleReplayState}
          />

          <DecisionQuizPanel
            key={`${scenario.id}-${replayState.visibleCount}`}
            scenario={scenario}
            visibleCount={replayState.visibleCount}
            finished={replayState.finished}
            onDecisionResult={handleDecisionResult}
            onTradePlanResult={handleLegacyTradePlanResult}
          />

          <TradeBuilderPanel
            scenario={scenario}
            session={training.session}
            onTradeChange={handleTradeChange}
            onTradeSubmit={handleTradeSubmit}
          />

          <TradeGradePanel
            result={tradeGrade}
          />

          <CertificationPanel
            result={certification}
          />
        </section>

        <CoachPanel
          scenario={scenario}
          visibleCount={replayState.visibleCount}
          latestResult={latestResult}
          progress={simulator.progress}
          achievements={simulator.achievements}
        />
      </div>
    </>
  );
}

export default function TrqxEngineTestPage() {
  const availableScenarios = useMemo(
    () => listScenarios(),
    []
  );

  const [scenarioId, setScenarioId] =
    useState("hammer");

  const [confirmed, setConfirmed] =
    useState(true);

  const [version, setVersion] =
    useState(0);

  const [
    showDiagnostics,
    setShowDiagnostics,
  ] = useState(false);

  const [
    showJournal,
    setShowJournal,
  ] = useState(false);

  const simulator =
    useSimulatorProgress();

  const scenario = useMemo(
    () =>
      generateScenario(scenarioId, {
        startingPrice: 100,
        volatility: 1,
        confirmation: confirmed,
        volumeProfile: "increasing",
      }),
    [confirmed, scenarioId, version]
  );

  function resetScenarioState() {
    setVersion(
      (current) => current + 1
    );
  }

  function chooseScenario(event) {
    setScenarioId(event.target.value);
    resetScenarioState();
  }

  function toggleConfirmation() {
    setConfirmed((current) => !current);
    resetScenarioState();
  }

  function generateNewScenario() {
    resetScenarioState();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px",
        background: "#06080d",
      }}
    >
      <div
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
          display: "grid",
          gap: "20px",
        }}
      >
        <SimulatorSession
          key={scenario.id}
          scenario={scenario}
          availableScenarios={availableScenarios}
          scenarioId={scenarioId}
          confirmed={confirmed}
          version={version}
          onScenarioChange={chooseScenario}
          onToggleConfirmation={toggleConfirmation}
          onGenerate={generateNewScenario}
          onResetStats={simulator.resetProgress}
          showDiagnostics={showDiagnostics}
          onToggleDiagnostics={() =>
            setShowDiagnostics(
              (current) => !current
            )
          }
          showJournal={showJournal}
          onToggleJournal={() =>
            setShowJournal(
              (current) => !current
            )
          }
          simulator={simulator}
        />
      </div>

      <style>{`
        @media (max-width: 1050px) {
          .trqx-simulator-layout {
            grid-template-columns: 1fr !important;
          }

          .trqx-coach {
            position: static;
          }
        }
      `}</style>
    </main>
  );
}
