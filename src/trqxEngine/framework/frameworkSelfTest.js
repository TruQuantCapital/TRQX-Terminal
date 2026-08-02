import {
  createBullishReversalCoachMap,
  createBullishReversalMaps,
  createScenarioDefinition,
} from "./index";

export function runFrameworkSelfTest() {
  const maps = createBullishReversalMaps({
    patternRole: "test-pattern",
  });

  const coachMap =
    createBullishReversalCoachMap({
      patternRole: "test-pattern",
      patternTitle: "Test Pattern",
    });

  const definition =
    createScenarioDefinition({
      metadata: {
        id: "framework-test",
        title: "Framework Test",
        category: "candlestick",
        difficulty: "development",
      },

      generate: () => ({
        decisionMap: maps.decisionMap,
        reasonMap: maps.reasonMap,
        coachMap,
      }),
    });

  return {
    passed:
      definition.id === "framework-test" &&
      maps.decisionMap.confirmation === "buy" &&
      coachMap.confirmation.tone === "positive",

    definition,
  };
}

export default runFrameworkSelfTest;
