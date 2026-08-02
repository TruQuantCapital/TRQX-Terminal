import {
  generateScenario,
  listScenarios,
} from "../index";
import { validateOHLC } from "../validation/validateOHLC";

const REQUIRED_LEVELS = [
  "confirmation",
  "entry",
  "stop",
  "target1",
  "target2",
];

function createCheck({
  id,
  label,
  passed,
  detail,
}) {
  return {
    id,
    label,
    passed: Boolean(passed),
    detail,
  };
}

function validateScenarioShape(scenario) {
  const checks = [];

  checks.push(
    createCheck({
      id: "scenario-object",
      label: "Scenario generated",
      passed:
        scenario &&
        typeof scenario === "object",
      detail:
        scenario?.id ??
        "Generator returned no scenario.",
    })
  );

  const ohlcResult = validateOHLC(
    scenario?.candles ?? []
  );

  checks.push(
    createCheck({
      id: "ohlc",
      label: "OHLC sequence valid",
      passed: ohlcResult.valid,
      detail: ohlcResult.valid
        ? `${scenario?.candles?.length ?? 0} candles`
        : ohlcResult.errors.join(" | "),
    })
  );

  checks.push(
    createCheck({
      id: "decision-map",
      label: "Decision rules present",
      passed:
        scenario?.decisionMap &&
        Object.keys(
          scenario.decisionMap
        ).length >= 4,
      detail:
        `${Object.keys(
          scenario?.decisionMap ?? {}
        ).length} mapped roles`,
    })
  );

  checks.push(
    createCheck({
      id: "reason-map",
      label: "Decision explanations present",
      passed:
        scenario?.reasonMap &&
        Object.keys(
          scenario.reasonMap
        ).length >= 4,
      detail:
        `${Object.keys(
          scenario?.reasonMap ?? {}
        ).length} explanations`,
    })
  );

  checks.push(
    createCheck({
      id: "coach-map",
      label: "Coach rules present",
      passed:
        scenario?.coachMap &&
        Object.keys(
          scenario.coachMap
        ).length >= 4,
      detail:
        `${Object.keys(
          scenario?.coachMap ?? {}
        ).length} coach states`,
    })
  );

  const missingLevels =
    REQUIRED_LEVELS.filter(
      (key) =>
        !Number.isFinite(
          scenario?.levels?.[key]
        )
    );

  checks.push(
    createCheck({
      id: "levels",
      label: "Trade levels complete",
      passed:
        missingLevels.length === 0,
      detail:
        missingLevels.length
          ? `Missing: ${missingLevels.join(", ")}`
          : "Entry, stop, and targets available",
    })
  );

  checks.push(
    createCheck({
      id: "answer",
      label: "Answer contract present",
      passed:
        typeof scenario?.answer
          ?.validSetup === "boolean" &&
        Boolean(
          scenario?.answer?.pattern
        ) &&
        Boolean(
          scenario?.answer?.action
        ),
      detail:
        scenario?.answer?.pattern ??
        "Missing answer metadata",
    })
  );

  return checks;
}

function runVariant(
  definition,
  confirmation
) {
  try {
    const scenario = generateScenario(
      definition.id,
      {
        startingPrice: 100,
        volatility: 1,
        confirmation,
        volumeProfile: "increasing",
      }
    );

    const checks =
      validateScenarioShape(scenario);

    return {
      confirmation,
      passed: checks.every(
        (check) => check.passed
      ),
      checks,
      scenarioId: scenario.id,
      candleCount:
        scenario.candles.length,
    };
  } catch (error) {
    return {
      confirmation,
      passed: false,
      checks: [
        createCheck({
          id: "generation-error",
          label: "Scenario generation",
          passed: false,
          detail:
            error instanceof Error
              ? error.message
              : String(error),
        }),
      ],
      scenarioId: null,
      candleCount: 0,
    };
  }
}

export function runEngineDiagnostics() {
  const definitions = listScenarios();

  const scenarios = definitions.map(
    (definition) => {
      const confirmed = runVariant(
        definition,
        true
      );

      const failed = runVariant(
        definition,
        false
      );

      const variants = [
        confirmed,
        failed,
      ];

      const checks = variants.flatMap(
        (variant) => variant.checks
      );

      const passedChecks =
        checks.filter(
          (check) => check.passed
        ).length;

      return {
        ...definition,
        passed: variants.every(
          (variant) => variant.passed
        ),
        confirmed,
        failed,
        passedChecks,
        totalChecks: checks.length,
      };
    }
  );

  const totalScenarios =
    scenarios.length;

  const passedScenarios =
    scenarios.filter(
      (scenario) => scenario.passed
    ).length;

  const totalChecks = scenarios.reduce(
    (total, scenario) =>
      total + scenario.totalChecks,
    0
  );

  const passedChecks = scenarios.reduce(
    (total, scenario) =>
      total + scenario.passedChecks,
    0
  );

  const health =
    totalChecks > 0
      ? Math.round(
          (passedChecks / totalChecks) *
            100
        )
      : 0;

  return {
    generatedAt:
      new Date().toISOString(),
    health,
    passed:
      totalScenarios > 0 &&
      passedScenarios === totalScenarios,

    totals: {
      scenarios: totalScenarios,
      passedScenarios,
      failedScenarios:
        totalScenarios -
        passedScenarios,
      checks: totalChecks,
      passedChecks,
      failedChecks:
        totalChecks - passedChecks,
    },

    modules: [
      {
        id: "registry",
        label: "Scenario Registry",
        passed: totalScenarios > 0,
        detail: `${totalScenarios} scenarios registered`,
      },
      {
        id: "generation",
        label: "Scenario Generation",
        passed:
          scenarios.every(
            (scenario) =>
              scenario.confirmed
                .scenarioId &&
              scenario.failed
                .scenarioId
          ),
        detail:
          "Confirmed and failed variants",
      },
      {
        id: "validation",
        label: "OHLC Validation",
        passed:
          scenarios.every(
            (scenario) =>
              scenario.confirmed.checks
                .find(
                  (check) =>
                    check.id === "ohlc"
                )?.passed &&
              scenario.failed.checks
                .find(
                  (check) =>
                    check.id === "ohlc"
                )?.passed
          ),
        detail:
          "All generated candle sequences",
      },
      {
        id: "decision",
        label: "Decision Engine",
        passed:
          scenarios.every(
            (scenario) =>
              scenario.confirmed.checks
                .find(
                  (check) =>
                    check.id ===
                    "decision-map"
                )?.passed &&
              scenario.failed.checks
                .find(
                  (check) =>
                    check.id ===
                    "decision-map"
                )?.passed
          ),
        detail:
          "Pattern decision states",
      },
      {
        id: "coach",
        label: "Coach Engine",
        passed:
          scenarios.every(
            (scenario) =>
              scenario.confirmed.checks
                .find(
                  (check) =>
                    check.id ===
                    "coach-map"
                )?.passed &&
              scenario.failed.checks
                .find(
                  (check) =>
                    check.id ===
                    "coach-map"
                )?.passed
          ),
        detail:
          "Pattern-specific coaching",
      },
      {
        id: "trade-plan",
        label: "Trade Plan Contract",
        passed:
          scenarios.every(
            (scenario) =>
              scenario.confirmed.checks
                .find(
                  (check) =>
                    check.id === "levels"
                )?.passed &&
              scenario.failed.checks
                .find(
                  (check) =>
                    check.id === "levels"
                )?.passed
          ),
        detail:
          "Entry, stop, and targets",
      },
    ],

    scenarios,
  };
}

export default runEngineDiagnostics;
