export const COACH_TONES = [
  "positive",
  "negative",
  "warning",
  "neutral",
];

export const COACH_SEVERITIES = [
  "info",
  "low",
  "medium",
  "high",
  "critical",
];

export function validateCoachContract(coach) {
  const errors = [];

  if (!coach || typeof coach !== "object" || Array.isArray(coach)) {
    return { valid: false, errors: ["Coach response must be an object."] };
  }

  if (!COACH_TONES.includes(coach.tone)) {
    errors.push(`Coach tone must be one of: ${COACH_TONES.join(", ")}.`);
  }

  for (const field of ["title", "message", "rule"]) {
    if (typeof coach[field] !== "string" || coach[field].trim() === "") {
      errors.push(`Coach response requires a non-empty "${field}".`);
    }
  }

  if (
    coach.severity !== undefined &&
    !COACH_SEVERITIES.includes(coach.severity)
  ) {
    errors.push(
      `Coach severity must be one of: ${COACH_SEVERITIES.join(", ")}.`
    );
  }

  return { valid: errors.length === 0, errors };
}

export function assertCoachContract(coach) {
  const result = validateCoachContract(coach);

  if (!result.valid) {
    throw new Error(`Invalid coach contract:\n${result.errors.join("\n")}`);
  }

  return coach;
}

export default {
  tones: COACH_TONES,
  severities: COACH_SEVERITIES,
  validate: validateCoachContract,
  assert: assertCoachContract,
};
