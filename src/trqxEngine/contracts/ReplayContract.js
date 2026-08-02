export const REPLAY_SPEEDS = [0.5, 1, 2, 5];

export function createEmptyReplayState() {
  return {
    visibleCount: 0,
    totalCandles: 0,
    currentIndex: -1,
    progress: 0,
    playing: false,
    paused: true,
    finished: false,
    speed: 1,
    pauses: 0,
    rewinds: 0,
    startedAt: null,
    completedAt: null,
  };
}

export function validateReplayContract(replay) {
  const errors = [];

  if (!replay || typeof replay !== "object" || Array.isArray(replay)) {
    return { valid: false, errors: ["Replay state must be an object."] };
  }

  for (const field of [
    "visibleCount",
    "totalCandles",
    "currentIndex",
    "progress",
    "speed",
  ]) {
    if (!Number.isFinite(Number(replay[field]))) {
      errors.push(`Replay state requires numeric "${field}".`);
    }
  }

  for (const field of ["playing", "paused", "finished"]) {
    if (typeof replay[field] !== "boolean") {
      errors.push(`Replay state requires boolean "${field}".`);
    }
  }

  if (Number(replay.progress) < 0 || Number(replay.progress) > 100) {
    errors.push("Replay progress must be between 0 and 100.");
  }

  if (!REPLAY_SPEEDS.includes(Number(replay.speed))) {
    errors.push(`Replay speed must be one of: ${REPLAY_SPEEDS.join(", ")}.`);
  }

  return { valid: errors.length === 0, errors };
}

export function assertReplayContract(replay) {
  const result = validateReplayContract(replay);

  if (!result.valid) {
    throw new Error(`Invalid replay contract:\n${result.errors.join("\n")}`);
  }

  return replay;
}

export default {
  speeds: REPLAY_SPEEDS,
  createEmpty: createEmptyReplayState,
  validate: validateReplayContract,
  assert: assertReplayContract,
};
