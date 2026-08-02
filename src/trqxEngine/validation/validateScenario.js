import { validateOHLC } from "./validateOHLC";
import {
  VALID_COACH_TONES,
  VALID_DECISIONS,
} from "../Framework/scenarioRules";

export function validateScenario(scenario) {
  const errors = [];

  if (!scenario || typeof scenario !== "object") {
    return {
      valid: false,
      errors: ["Scenario must be an object."],
    };
  }

  if (!scenario.id || typeof scenario.id !== "string") {
    errors.push("Scenario requires a string id.");
  }

  if (!scenario.type || typeof scenario.type !== "string") {
    errors.push("Scenario requires a string type.");
  }

  if (!scenario.category) {
    errors.push("Scenario requires a category.");
  }

  const ohlcResult = validateOHLC(scenario.candles);

  if (!ohlcResult.valid) {
    errors.push(...ohlcResult.errors);
  }

  if (!scenario.decisionMap || typeof scenario.decisionMap !== "object") {
    errors.push("Scenario requires a decisionMap.");
  } else {
    Object.entries(scenario.decisionMap).forEach(
      ([role, decision]) => {
        if (!VALID_DECISIONS.includes(decision)) {
          errors.push(
            `Decision "${decision}" for role "${role}" is invalid.`
          );
        }
      }
    );
  }

  if (!scenario.reasonMap || typeof scenario.reasonMap !== "object") {
    errors.push("Scenario requires a reasonMap.");
  }

  if (!scenario.coachMap || typeof scenario.coachMap !== "object") {
    errors.push("Scenario requires a coachMap.");
  } else {
    Object.entries(scenario.coachMap).forEach(
      ([role, coach]) => {
        if (!coach || typeof coach !== "object") {
          errors.push(
            `Coach entry for role "${role}" must be an object.`
          );

          return;
        }

        if (!VALID_COACH_TONES.includes(coach.tone)) {
          errors.push(
            `Coach tone "${coach.tone}" for role "${role}" is invalid.`
          );
        }

        if (!coach.title || !coach.message || !coach.rule) {
          errors.push(
            `Coach entry for role "${role}" requires title, message, and rule.`
          );
        }
      }
    );
  }

  if (!scenario.answer || typeof scenario.answer !== "object") {
    errors.push("Scenario requires an answer object.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function assertValidScenario(scenario) {
  const result = validateScenario(scenario);

  if (!result.valid) {
    throw new Error(
      `Invalid TRQX scenario:\n${result.errors.join("\n")}`
    );
  }

  return scenario;
}

export default validateScenario;
