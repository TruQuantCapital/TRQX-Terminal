import { assertValidScenario } from "../validation/validateScenario";

export function createScenarioResult({
  id,
  type,
  category,
  difficulty,
  direction,
  context,
  candles,
  levels,
  keyIndexes = {},
  decisionMap,
  reasonMap,
  coachMap,
  answer,
  explanation,
  metadata = {},
}) {
  const scenario = {
    id,
    type,
    category,
    difficulty,
    direction,
    context,
    candles,
    levels,
    keyIndexes,
    decisionMap,
    reasonMap,
    coachMap,
    answer,
    explanation,
    metadata,
  };

  return assertValidScenario(scenario);
}

export default createScenarioResult;
