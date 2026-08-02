import {
  assertSessionContract,
  createEmptyReplayState,
} from "../contracts";

function createId(prefix = "session") {
  const random =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}-${random}`;
}

export function createSession({
  user = {},
  scenario,
} = {}) {
  if (!scenario || typeof scenario !== "object") {
    throw new Error("createSession requires a scenario object.");
  }

  const now = new Date().toISOString();

  const session = {
    id: createId(),
    status: "created",
    createdAt: now,
    startedAt: null,
    completedAt: null,
    user: {
      id: user.id ?? null,
      email: user.email ?? null,
      tier: user.tier ?? null,
    },
    scenario: {
      id: scenario.id,
      type: scenario.type,
      category: scenario.category,
      difficulty: scenario.difficulty,
      validSetup: Boolean(scenario.answer?.validSetup),
    },
    replay: {
      ...createEmptyReplayState(),
      totalCandles: scenario.candles?.length ?? 0,
    },
    decisions: [],
    trade: null,
    grading: null,
    coach: [],
    analytics: {
      eventCount: 0,
      decisionCount: 0,
      correctDecisionCount: 0,
      pauseCount: 0,
      rewindCount: 0,
    },
    achievements: [],
    events: [],
  };

  return assertSessionContract(session);
}

export default createSession;
