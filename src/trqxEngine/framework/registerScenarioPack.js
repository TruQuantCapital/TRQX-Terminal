import {
  hasScenario,
  registerScenario,
} from "../engine/scenarioRegistry";

export function registerScenarioPack(
  scenarios,
  { replace = false } = {}
) {
  if (!Array.isArray(scenarios)) {
    throw new Error(
      "registerScenarioPack requires an array."
    );
  }

  return scenarios.map((scenario) => {
    if (hasScenario(scenario.id) && !replace) {
      return scenario;
    }

    return registerScenario(scenario);
  });
}

export default registerScenarioPack;
