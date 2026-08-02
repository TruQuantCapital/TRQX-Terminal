import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import {
  assertSessionContract,
} from "../contracts";
import createSession from "./createSession";
import SESSION_EVENTS from "./sessionEvents";
import sessionReducer from "./sessionReducer";
import {
  saveSession,
} from "./sessionStore";
import {
  migrateLegacyStorage,
} from "../storage";

export default function useTrainingSession({
  scenario,
  user = {},
  persist = true,
} = {}) {
  const [session, dispatch] =
    useReducer(
      sessionReducer,
      { scenario, user },
      ({
        scenario: initialScenario,
        user: initialUser,
      }) =>
        createSession({
          scenario:
            initialScenario,
          user: initialUser,
        })
    );

  useEffect(() => {
    migrateLegacyStorage();
  }, []);

  useEffect(() => {
    if (
      persist &&
      (
        session.status ===
          "completed" ||
        session.status ===
          "abandoned"
      )
    ) {
      saveSession(session);
    }
  }, [
    persist,
    session,
  ]);

  const start = useCallback(() => {
    dispatch({
      type:
        SESSION_EVENTS.STARTED,
    });
  }, []);

  const updateReplay = useCallback(
    (replay) => {
      dispatch({
        type:
          SESSION_EVENTS.REPLAY_UPDATED,
        payload: replay,
      });
    },
    []
  );

  const recordDecision =
    useCallback(
      (decision) => {
        dispatch({
          type:
            SESSION_EVENTS
              .DECISION_RECORDED,
          payload: decision,
        });
      },
      []
    );

  const updateTrade = useCallback(
    (trade) => {
      dispatch({
        type:
          SESSION_EVENTS.TRADE_UPDATED,
        payload: trade,
      });
    },
    []
  );

  const submitTrade = useCallback(
    (trade) => {
      dispatch({
        type:
          SESSION_EVENTS
            .TRADE_SUBMITTED,
        payload: trade,
      });
    },
    []
  );

  const recordGrade = useCallback(
    (grading) => {
      dispatch({
        type:
          SESSION_EVENTS
            .TRADE_GRADED,
        payload: grading,
      });
    },
    []
  );

  const recordCoach = useCallback(
    (coach) => {
      dispatch({
        type:
          SESSION_EVENTS
            .COACH_RECORDED,
        payload: coach,
      });
    },
    []
  );

  const unlockAchievement =
    useCallback(
      (achievement) => {
        dispatch({
          type:
            SESSION_EVENTS
              .ACHIEVEMENT_UNLOCKED,
          payload: achievement,
        });
      },
      []
    );

  const complete = useCallback(
    (payload = {}) => {
      dispatch({
        type:
          SESSION_EVENTS.COMPLETED,
        payload,
      });
    },
    []
  );

  const abandon = useCallback(
    (payload = {}) => {
      dispatch({
        type:
          SESSION_EVENTS.ABANDONED,
        payload,
      });
    },
    []
  );

  const validatedSession =
    useMemo(
      () =>
        assertSessionContract(
          session
        ),
      [session]
    );

  return {
    session: validatedSession,
    start,
    updateReplay,
    recordDecision,
    updateTrade,
    submitTrade,
    recordGrade,
    recordCoach,
    unlockAchievement,
    complete,
    abandon,
  };
}
