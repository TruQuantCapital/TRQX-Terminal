const ENGINE_STORAGE_KEY = "trqx_engine_v2";
const ENGINE_STORAGE_VERSION = 2;
const MAX_SESSIONS = 100;
const MAX_JOURNAL_ENTRIES = 250;

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function createEmptyState() {
  return {
    version: ENGINE_STORAGE_VERSION,
    sessions: [],
    journal: [],
    settings: {},
    updatedAt: new Date().toISOString(),
  };
}

function sanitizeState(value) {
  const state = value && typeof value === "object"
    ? value
    : createEmptyState();

  return {
    version: ENGINE_STORAGE_VERSION,
    sessions: Array.isArray(state.sessions)
      ? state.sessions.slice(0, MAX_SESSIONS)
      : [],
    journal: Array.isArray(state.journal)
      ? state.journal.slice(0, MAX_JOURNAL_ENTRIES)
      : [],
    settings:
      state.settings &&
      typeof state.settings === "object" &&
      !Array.isArray(state.settings)
        ? state.settings
        : {},
    updatedAt:
      typeof state.updatedAt === "string"
        ? state.updatedAt
        : new Date().toISOString(),
  };
}

export function readEngineStorage() {
  if (!canUseStorage()) {
    return createEmptyState();
  }

  try {
    const raw = window.localStorage.getItem(
      ENGINE_STORAGE_KEY
    );

    if (!raw) {
      return createEmptyState();
    }

    return sanitizeState(JSON.parse(raw));
  } catch {
    return createEmptyState();
  }
}

export function writeEngineStorage(nextState) {
  const state = sanitizeState({
    ...nextState,
    updatedAt: new Date().toISOString(),
  });

  if (!canUseStorage()) {
    return {
      ok: false,
      state,
      error: "Storage is unavailable.",
    };
  }

  try {
    const json = JSON.stringify(state);

    window.localStorage.setItem(
      ENGINE_STORAGE_KEY,
      json
    );

    return {
      ok: true,
      state,
      bytes: new Blob([json]).size,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      state,
      bytes: 0,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}

export function updateEngineStorage(updater) {
  const current = readEngineStorage();
  const next =
    typeof updater === "function"
      ? updater(current)
      : current;

  return writeEngineStorage(next);
}

export function getStorageDiagnostics() {
  const state = readEngineStorage();
  const json = JSON.stringify(state);
  const bytes =
    typeof Blob !== "undefined"
      ? new Blob([json]).size
      : json.length;

  return {
    version: state.version,
    sessions: state.sessions.length,
    journalEntries: state.journal.length,
    bytes,
    kilobytes: Number(
      (bytes / 1024).toFixed(2)
    ),
    estimatedMegabytes: Number(
      (bytes / 1024 / 1024).toFixed(3)
    ),
    status:
      bytes < 3_500_000
        ? "healthy"
        : bytes < 4_500_000
          ? "warning"
          : "critical",
  };
}

export function clearEngineStorage() {
  if (canUseStorage()) {
    window.localStorage.removeItem(
      ENGINE_STORAGE_KEY
    );
  }
}

export {
  ENGINE_STORAGE_KEY,
  ENGINE_STORAGE_VERSION,
  MAX_SESSIONS,
  MAX_JOURNAL_ENTRIES,
};

export default {
  read: readEngineStorage,
  write: writeEngineStorage,
  update: updateEngineStorage,
  diagnostics: getStorageDiagnostics,
  clear: clearEngineStorage,
};
