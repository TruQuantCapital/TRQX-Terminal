import SESSION_EVENTS from "./sessionEvents";

function appendEvent(session, type, payload = {}) {
  const event = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    at: new Date().toISOString(),
    payload,
  };

  return {
    ...session,
    events: [...(session.events ?? []), event],
    analytics: {
      ...session.analytics,
      eventCount: (session.analytics?.eventCount ?? 0) + 1,
    },
  };
}

export function sessionReducer(session, action) {
  if (!session) {
    return session;
  }

  switch (action.type) {
    case SESSION_EVENTS.STARTED: {
      const next = {
        ...session,
        status: "active",
        startedAt: session.startedAt ?? new Date().toISOString(),
      };

      return appendEvent(next, action.type, action.payload);
    }

    case SESSION_EVENTS.REPLAY_UPDATED: {
      const previous = session.replay ?? {};
      const replay = {
        ...previous,
        ...action.payload,
        paused: !Boolean(action.payload?.playing),
      };

      const pauseIncrement =
        previous.playing === true && replay.playing === false ? 1 : 0;

      const rewindIncrement =
        Number(replay.visibleCount) < Number(previous.visibleCount ?? 0)
          ? 1
          : 0;

      const next = {
        ...session,
        replay,
        analytics: {
          ...session.analytics,
          pauseCount:
            (session.analytics?.pauseCount ?? 0) + pauseIncrement,
          rewindCount:
            (session.analytics?.rewindCount ?? 0) + rewindIncrement,
        },
      };

      return appendEvent(next, action.type, action.payload);
    }

    case SESSION_EVENTS.DECISION_RECORDED: {
      const decision = {
        id: `decision-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        at: new Date().toISOString(),
        ...action.payload,
      };

      const correctIncrement = decision.correct ? 1 : 0;

      const next = {
        ...session,
        decisions: [...session.decisions, decision],
        analytics: {
          ...session.analytics,
          decisionCount:
            (session.analytics?.decisionCount ?? 0) + 1,
          correctDecisionCount:
            (session.analytics?.correctDecisionCount ?? 0) +
            correctIncrement,
        },
      };

      return appendEvent(next, action.type, decision);
    }

    case SESSION_EVENTS.TRADE_UPDATED: {
      const next = {
        ...session,
        trade: {
          ...(session.trade ?? {}),
          ...action.payload,
        },
      };

      return appendEvent(next, action.type, action.payload);
    }

    case SESSION_EVENTS.TRADE_SUBMITTED: {
      const next = {
        ...session,
        trade: {
          ...(session.trade ?? {}),
          ...action.payload,
          submittedAt: new Date().toISOString(),
        },
      };

      return appendEvent(next, action.type, action.payload);
    }

    case SESSION_EVENTS.TRADE_GRADED: {
      const next = {
        ...session,
        grading: action.payload,
      };

      return appendEvent(next, action.type, action.payload);
    }

    case SESSION_EVENTS.COACH_RECORDED: {
      const coachEntry = {
        id: `coach-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        at: new Date().toISOString(),
        ...action.payload,
      };

      const next = {
        ...session,
        coach: [...session.coach, coachEntry],
      };

      return appendEvent(next, action.type, coachEntry);
    }

    case SESSION_EVENTS.ACHIEVEMENT_UNLOCKED: {
      const achievement = action.payload;

      if (
        session.achievements.some(
          (item) => item.id === achievement.id
        )
      ) {
        return session;
      }

      const next = {
        ...session,
        achievements: [...session.achievements, achievement],
      };

      return appendEvent(next, action.type, achievement);
    }

    case SESSION_EVENTS.COMPLETED: {
      const next = {
        ...session,
        status: "completed",
        completedAt: new Date().toISOString(),
      };

      return appendEvent(next, action.type, action.payload);
    }

    case SESSION_EVENTS.ABANDONED: {
      const next = {
        ...session,
        status: "abandoned",
        completedAt: new Date().toISOString(),
      };

      return appendEvent(next, action.type, action.payload);
    }

    default:
      return session;
  }
}

export default sessionReducer;
