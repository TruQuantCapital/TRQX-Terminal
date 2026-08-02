export function compactSession(session) {
  if (!session) {
    return null;
  }

  return {
    id: session.id,
    status: session.status,
    createdAt: session.createdAt,
    startedAt: session.startedAt,
    completedAt: session.completedAt,

    scenario: {
      id: session.scenario?.id ?? null,
      type: session.scenario?.type ?? null,
      category:
        session.scenario?.category ?? null,
      difficulty:
        session.scenario?.difficulty ?? null,
      validSetup: Boolean(
        session.scenario?.validSetup
      ),
    },

    replay: {
      finished: Boolean(
        session.replay?.finished
      ),
      visibleCount:
        session.replay?.visibleCount ?? 0,
      totalCandles:
        session.replay?.totalCandles ?? 0,
      speed: session.replay?.speed ?? 1,
    },

    trade: session.trade
      ? {
          direction:
            session.trade.direction ?? null,
          entry:
            session.trade.entry ?? null,
          stop:
            session.trade.stop ?? null,
          target1:
            session.trade.target1 ?? null,
          target2:
            session.trade.target2 ?? null,
          riskPercent:
            session.trade.riskPercent ?? null,
          positionSize:
            session.trade.positionSize ?? null,
          confidence:
            session.trade.confidence ?? null,
          rewardRisk:
            session.trade.rewardRisk ?? null,
          thesis:
            session.trade.thesis ?? "",
          submittedAt:
            session.trade.submittedAt ?? null,
        }
      : null,

    grading: session.grading
      ? {
          overall:
            session.grading.overall ?? 0,
          grade:
            session.grading.grade ?? null,
          passed: Boolean(
            session.grading.passed
          ),
        }
      : null,

    analytics: {
      decisionCount:
        session.analytics
          ?.decisionCount ?? 0,
      correctDecisionCount:
        session.analytics
          ?.correctDecisionCount ?? 0,
      pauseCount:
        session.analytics?.pauseCount ?? 0,
      rewindCount:
        session.analytics?.rewindCount ?? 0,
    },

    achievements: Array.isArray(
      session.achievements
    )
      ? session.achievements.map(
          (achievement) => ({
            id: achievement.id,
            title: achievement.title,
          })
        )
      : [],
  };
}

export default compactSession;
