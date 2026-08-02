import {
  readEngineStorage,
  updateEngineStorage,
} from "../../storage";

export function readJournalEntries() {
  return readEngineStorage().journal;
}

export function saveJournalEntry(entry) {
  if (!entry) {
    return {
      ok: false,
      error: "Journal entry is empty.",
    };
  }

  return updateEngineStorage(
    (state) => {
      const withoutDuplicate =
        state.journal.filter(
          (item) =>
            item.id !== entry.id
        );

      return {
        ...state,
        journal: [
          entry,
          ...withoutDuplicate,
        ].slice(0, 250),
      };
    }
  );
}

export function removeJournalEntry(entryId) {
  return updateEngineStorage(
    (state) => ({
      ...state,
      journal:
        state.journal.filter(
          (entry) =>
            entry.id !== entryId
        ),
    })
  );
}

export function clearJournalEntries() {
  return updateEngineStorage(
    (state) => ({
      ...state,
      journal: [],
    })
  );
}

export default {
  read: readJournalEntries,
  save: saveJournalEntry,
  remove: removeJournalEntry,
  clear: clearJournalEntries,
};
