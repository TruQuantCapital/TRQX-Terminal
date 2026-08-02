import React, {
  useMemo,
  useState,
} from "react";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  XCircle,
} from "lucide-react";
import runEngineDiagnostics from "./runEngineDiagnostics";
import "./diagnostics.css";

function StatusIcon({
  passed,
  size = 17,
}) {
  return passed ? (
    <CheckCircle2
      size={size}
      aria-label="Passed"
    />
  ) : (
    <XCircle
      size={size}
      aria-label="Failed"
    />
  );
}

function VariantChecks({
  title,
  variant,
}) {
  return (
    <section className="trqx-diagnostics__variant">
      <div className="trqx-diagnostics__variant-heading">
        <strong>{title}</strong>

        <span
          className={
            variant.passed
              ? "passed"
              : "failed"
          }
        >
          {variant.passed
            ? "PASS"
            : "FAIL"}
        </span>
      </div>

      <div className="trqx-diagnostics__checks">
        {variant.checks.map(
          (check) => (
            <article
              key={`${title}-${check.id}`}
              className={
                check.passed
                  ? "passed"
                  : "failed"
              }
            >
              <StatusIcon
                passed={check.passed}
                size={15}
              />

              <div>
                <strong>
                  {check.label}
                </strong>

                <span>
                  {check.detail}
                </span>
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}

export default function EngineDiagnosticsPanel() {
  const [version, setVersion] =
    useState(0);

  const [expanded, setExpanded] =
    useState({});

  const report = useMemo(
    () => runEngineDiagnostics(),
    [version]
  );

  function toggleScenario(id) {
    setExpanded((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  return (
    <section className="trqx-diagnostics">
      <header className="trqx-diagnostics__header">
        <div>
          <small>
            TRQX ENGINE STATUS
          </small>

          <h2>
            <Activity size={22} />
            Diagnostics
          </h2>

          <p>
            Generates and validates both confirmed
            and failed variants of every registered
            scenario.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setVersion(
              (current) => current + 1
            )
          }
        >
          <RefreshCw size={16} />
          Run Again
        </button>
      </header>

      <div className="trqx-diagnostics__health">
        <div>
          <span>
            Overall Engine Health
          </span>

          <strong>
            {report.health}%
          </strong>
        </div>

        <div className="trqx-diagnostics__health-track">
          <div
            style={{
              width: `${report.health}%`,
            }}
          />
        </div>

        <span
          className={
            report.passed
              ? "passed"
              : "failed"
          }
        >
          {report.passed
            ? "ALL SYSTEMS PASS"
            : "REVIEW REQUIRED"}
        </span>
      </div>

      <section className="trqx-diagnostics__summary">
        <article>
          <span>
            Registered Scenarios
          </span>

          <strong>
            {report.totals.scenarios}
          </strong>
        </article>

        <article>
          <span>
            Passed Scenarios
          </span>

          <strong>
            {report.totals.passedScenarios}
          </strong>
        </article>

        <article>
          <span>
            Total Checks
          </span>

          <strong>
            {report.totals.checks}
          </strong>
        </article>

        <article>
          <span>
            Failed Checks
          </span>

          <strong>
            {report.totals.failedChecks}
          </strong>
        </article>
      </section>

      <section className="trqx-diagnostics__modules">
        <h3>Engine Modules</h3>

        <div>
          {report.modules.map(
            (module) => (
              <article
                key={module.id}
                className={
                  module.passed
                    ? "passed"
                    : "failed"
                }
              >
                <StatusIcon
                  passed={module.passed}
                />

                <div>
                  <strong>
                    {module.label}
                  </strong>

                  <span>
                    {module.detail}
                  </span>
                </div>
              </article>
            )
          )}
        </div>
      </section>

      <section className="trqx-diagnostics__scenarios">
        <h3>Scenario Health</h3>

        {report.scenarios.map(
          (scenario) => {
            const isExpanded =
              Boolean(
                expanded[scenario.id]
              );

            return (
              <article
                key={scenario.id}
                className="trqx-diagnostics__scenario"
              >
                <button
                  type="button"
                  className="trqx-diagnostics__scenario-heading"
                  onClick={() =>
                    toggleScenario(
                      scenario.id
                    )
                  }
                >
                  <StatusIcon
                    passed={
                      scenario.passed
                    }
                  />

                  <div>
                    <strong>
                      {scenario.title}
                    </strong>

                    <span>
                      {scenario.passedChecks}/
                      {scenario.totalChecks} checks passed
                    </span>
                  </div>

                  {isExpanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>

                {isExpanded ? (
                  <div className="trqx-diagnostics__scenario-body">
                    <VariantChecks
                      title="Confirmed"
                      variant={
                        scenario.confirmed
                      }
                    />

                    <VariantChecks
                      title="Failed"
                      variant={
                        scenario.failed
                      }
                    />
                  </div>
                ) : null}
              </article>
            );
          }
        )}
      </section>
    </section>
  );
}
