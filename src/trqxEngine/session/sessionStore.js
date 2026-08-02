import {
  readEngineStorage,
  updateEngineStorage,
} from "../storage";
import compactSession from "../storage/compactSession";

export function readSessions() {
  return readEngineStorage().sessions;
}

export function saveSession(session) {
  const compact =
    compactSession(session);

  if (!compact) {
    return {
      ok: false,
      error: "Session is empty.",
    };
  }

  return updateEngineStorage(
    (state) => {
      const withoutDuplicate =
        state.sessions.filter(
          (item) =>
            item.id !== compact.id
        );

      return {
        ...state,
        sessions: [
          compact,
          ...withoutDuplicate,
        ].slice(0, 100),
      };
    }
  );
}

export function getSession(sessionId) {
  return (
    readSessions().find(
      (session) =>
        session.id === sessionId
    ) ?? null
  );
}

export function removeSession(sessionId) {
  return updateEngineStorage(
    (state) => ({
      ...state,
      sessions:
        state.sessions.filter(
          (session) =>
            session.id !== sessionId
        ),
    })
  );
}

export function clearSessions() {
  return updateEngineStorage(
    (state) => ({
      ...state,
      sessions: [],
    })
  );
}

export default {
  read: readSessions,
  save: saveSession,
  get: getSession,
  remove: removeSession,
  clear: clearSessions,
};
