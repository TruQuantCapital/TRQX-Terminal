const REQUIRED_OBJECT_FIELDS = [
  "context",
  "levels",
  "decisionMap",
  "reasonMap",
  "coachMap",
  "answer",
];

const REQUIRED_STRING_FIELDS = [
  "id",
  "type",
  "category",
  "difficulty",
];

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateScenarioContract(scenario) {
  const errors = [];

  if (!isObject(scenario)) {
    return { valid: false, errors: ["Scenario must be an object."] };
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof scenario[field] !== "string" || scenario[field].trim() === "") {
      errors.push(`Scenario requires a non-empty "${field}" field.`);
    }
  }

  if (!Array.isArray(scenario.candles) || scenario.candles.length === 0) {
    errors.push("Scenario requires a non-empty candles array.");
  }

  for (const field of REQUIRED_OBJECT_FIELDS) {
    if (!isObject(scenario[field])) {
      errors.push(`Scenario requires an object field named "${field}".`);
    }
  }

  if (
    isObject(scenario.answer) &&
    typeof scenario.answer.validSetup !== "boolean"
  ) {
    errors.push('Scenario answer requires a boolean "validSetup".');
  }

  return { valid: errors.length === 0, errors };
}

export function assertScenarioContract(scenario) {
  const result = validateScenarioContract(scenario);

  if (!result.valid) {
    throw new Error(`Invalid scenario contract:\n${result.errors.join("\n")}`);
  }

  return scenario;
}

export default {
  validate: validateScenarioContract,
  assert: assertScenarioContract,
};
