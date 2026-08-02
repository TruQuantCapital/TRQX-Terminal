export function createJournalEntry({
  session,
  tradeGrade,
  certification,
}) {
  if (!session) {
    throw new Error("createJournalEntry requires a session.");
  }

  return {
    id: `journal-${session.id}`,
    sessionId: session.id,
    createdAt: new Date().toISOString(),

    scenario: {
      id: session.scenario?.id ?? null,
      type: session.scenario?.type ?? null,
      category: session.scenario?.category ?? null,
      difficulty: session.scenario?.difficulty ?? null,
      validSetup: Boolean(session.scenario?.validSetup),
    },

    replay: {
      visibleCount: session.replay?.visibleCount ?? 0,
      totalCandles: session.replay?.totalCandles ?? 0,
      finished: Boolean(session.replay?.finished),
      speed: session.replay?.speed ?? 1,
      pauses: session.analytics?.pauseCount ?? 0,
      rewinds: session.analytics?.rewindCount ?? 0,
    },

    decisions: [...(session.decisions ?? [])],

    trade: session.trade ?? null,

    grading: tradeGrade ?? session.grading ?? null,

    certification: certification ?? null,

    analytics: {
      decisionCount: session.analytics?.decisionCount ?? 0,
      correctDecisionCount:
        session.analytics?.correctDecisionCount ?? 0,
      eventCount: session.analytics?.eventCount ?? 0,
    },

    achievements: [...(session.achievements ?? [])],
  };
}

export default createJournalEntry;
