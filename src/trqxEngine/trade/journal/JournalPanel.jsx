import React, {
  useMemo,
  useState,
} from "react";
import {
  BookOpenCheck,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  clearJournalEntries,
  readJournalEntries,
  removeJournalEntry,
} from "./journalStore";
import "./journal.css";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleString();
}

function formatPattern(value) {
  return String(value ?? "Unknown")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function JournalPanel() {
  const [version, setVersion] =
    useState(0);

  const entries = useMemo(
    () => readJournalEntries(),
    [version]
  );

  function refresh() {
    setVersion((current) => current + 1);
  }

  function removeEntry(entryId) {
    removeJournalEntry(entryId);
    refresh();
  }

  function clearAll() {
    clearJournalEntries();
    refresh();
  }

  return (
    <section className="trqx-journal">
      <header className="trqx-journal__header">
        <div>
          <small>
            TRAINING HISTORY
          </small>

          <h2>
            <BookOpenCheck size={22} />
            TRQX Journal
          </h2>

          <p>
            Completed simulation sessions,
            trade grades, certification scores,
            and achievements.
          </p>
        </div>

        <div className="trqx-journal__actions">
          <button
            type="button"
            onClick={refresh}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={clearAll}
            disabled={entries.length === 0}
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </header>

      <div className="trqx-journal__summary">
        <article>
          <span>
            Completed Entries
          </span>

          <strong>
            {entries.length}
          </strong>
        </article>

        <article>
          <span>
            Certified
          </span>

          <strong>
            {
              entries.filter(
                (entry) =>
                  entry.certification?.passed
              ).length
            }
          </strong>
        </article>

        <article>
          <span>
            Average Grade
          </span>

          <strong>
            {entries.length
              ? Math.round(
                  entries.reduce(
                    (total, entry) =>
                      total +
                      (entry.grading?.overall ?? 0),
                    0
                  ) / entries.length
                )
              : 0}
            %
          </strong>
        </article>
      </div>

      {entries.length === 0 ? (
        <div className="trqx-journal__empty">
          Complete and submit a trade plan to
          create the first journal entry.
        </div>
      ) : (
        <div className="trqx-journal__entries">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="trqx-journal__entry"
            >
              <div className="trqx-journal__entry-main">
                <div>
                  <strong>
                    {formatPattern(
                      entry.scenario?.type
                    )}
                  </strong>

                  <span>
                    {formatDate(entry.createdAt)}
                  </span>
                </div>

                <div className="trqx-journal__badges">
                  <span
                    className={
                      entry.scenario?.validSetup
                        ? "confirmed"
                        : "failed"
                    }
                  >
                    {entry.scenario?.validSetup
                      ? "CONFIRMED"
                      : "FAILED SETUP"}
                  </span>

                  <span
                    className={
                      entry.certification?.passed
                        ? "certified"
                        : "not-certified"
                    }
                  >
                    {entry.certification?.passed
                      ? "CERTIFIED"
                      : "NOT CERTIFIED"}
                  </span>
                </div>
              </div>

              <div className="trqx-journal__metrics">
                <div>
                  <span>
                    Direction
                  </span>

                  <strong>
                    {entry.trade?.direction
                      ?.toUpperCase() ??
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Trade Grade
                  </span>

                  <strong>
                    {entry.grading?.overall ?? 0}%
                  </strong>
                </div>

                <div>
                  <span>
                    Certification
                  </span>

                  <strong>
                    {entry.certification?.score ?? 0}%
                  </strong>
                </div>

                <div>
                  <span>
                    Decisions
                  </span>

                  <strong>
                    {
                      entry.analytics
                        ?.correctDecisionCount
                    }
                    /
                    {
                      entry.analytics
                        ?.decisionCount
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    R:R
                  </span>

                  <strong>
                    {entry.grading?.riskReward
                      ?.label ??
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Achievements
                  </span>

                  <strong>
                    {entry.achievements?.length ??
                      0}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="trqx-journal__remove"
                onClick={() =>
                  removeEntry(entry.id)
                }
              >
                <Trash2 size={15} />
                Remove
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
