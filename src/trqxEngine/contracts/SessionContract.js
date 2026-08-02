export const SESSION_STATUSES = [
  "created",
  "active",
  "completed",
  "abandoned",
];

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function createEmptySessionShape() {
  return {
    id: "",
    status: "created",
    createdAt: "",
    startedAt: null,
    completedAt: null,
    user: {},
    scenario: {},
    replay: {},
    decisions: [],
    trade: null,
    grading: null,
    coach: [],
    analytics: {},
    achievements: [],
  };
}

export function validateSessionContract(session) {
  const errors = [];

  if (!isObject(session)) {
    return { valid: false, errors: ["Session must be an object."] };
  }

  if (typeof session.id !== "string" || session.id.trim() === "") {
    errors.push("Session requires a non-empty id.");
  }

  if (!SESSION_STATUSES.includes(session.status)) {
    errors.push(`Session status must be one of: ${SESSION_STATUSES.join(", ")}.`);
  }

  if (
    typeof session.createdAt !== "string" ||
    session.createdAt.trim() === ""
  ) {
    errors.push("Session requires a createdAt timestamp.");
  }

  if (!isObject(session.scenario)) {
    errors.push("Session requires a scenario object.");
  }

  if (!isObject(session.replay)) {
    errors.push("Session requires a replay object.");
  }

  if (!Array.isArray(session.decisions)) {
    errors.push("Session decisions must be an array.");
  }

  if (!Array.isArray(session.coach)) {
    errors.push("Session coach history must be an array.");
  }

  if (!Array.isArray(session.achievements)) {
    errors.push("Session achievements must be an array.");
  }

  return { valid: errors.length === 0, errors };
}

export function assertSessionContract(session) {
  const result = validateSessionContract(session);

  if (!result.valid) {
    throw new Error(`Invalid session contract:\n${result.errors.join("\n")}`);
  }

  return session;
}

export default {
  createEmpty: createEmptySessionShape,
  validate: validateSessionContract,
  assert: assertSessionContract,
};
