import {
  readEngineStorage,
  writeEngineStorage,
} from "./storageService";

const LEGACY_SESSION_KEY =
  "trqx_training_sessions_v1";

const LEGACY_JOURNAL_KEY =
  "trqx_training_journal_v1";

function readLegacyArray(key) {
  if (
    typeof window === "undefined" ||
    !window.localStorage
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(key);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function migrateLegacyStorage() {
  if (
    typeof window === "undefined" ||
    !window.localStorage
  ) {
    return {
      migrated: false,
      sessions: 0,
      journalEntries: 0,
    };
  }

  const current = readEngineStorage();

  const legacyJournal =
    readLegacyArray(
      LEGACY_JOURNAL_KEY
    );

  const next = {
    ...current,
    journal:
      current.journal.length > 0
        ? current.journal
        : legacyJournal.slice(0, 250),
  };

  const result = writeEngineStorage(next);

  window.localStorage.removeItem(
    LEGACY_SESSION_KEY
  );

  window.localStorage.removeItem(
    LEGACY_JOURNAL_KEY
  );

  return {
    migrated: result.ok,
    sessions: 0,
    journalEntries:
      legacyJournal.length,
  };
}

export default migrateLegacyStorage;
