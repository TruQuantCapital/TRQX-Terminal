import React, { useMemo, useState } from "react";

const MARKET_BIAS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "bullish", label: "Bullish" },
  { value: "bearish", label: "Bearish" },
  { value: "neutral", label: "Neutral" },
  { value: "range_bound", label: "Range Bound" },
];

const MARKET_CONDITION_OPTIONS = [
  { value: "Pending analysis", label: "Pending Analysis" },
  { value: "trending", label: "Trending" },
  { value: "balanced", label: "Balanced" },
  { value: "choppy", label: "Choppy" },
  { value: "expansion", label: "Expansion" },
  { value: "consolidation", label: "Consolidation" },
];

const RISK_ENVIRONMENT_OPTIONS = [
  { value: "Pending analysis", label: "Pending Analysis" },
  { value: "risk_on", label: "Risk On" },
  { value: "neutral", label: "Neutral" },
  { value: "risk_off", label: "Risk Off" },
];

const VOLATILITY_OPTIONS = [
  { value: "Pending analysis", label: "Pending Analysis" },
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "elevated", label: "Elevated" },
  { value: "extreme", label: "Extreme" },
];

function todayIsoDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(now.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function cardStyle(extra = {}) {
  return {
    padding: "20px",
    borderRadius: "15px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.025)",
    ...extra,
  };
}

function labelStyle() {
  return {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: "7px",
  };
}

function inputStyle() {
  return {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "9px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(4,8,14,0.8)",
    color: "#f8fafc",
    padding: "11px 12px",
    outline: "none",
  };
}

function buttonStyle(primary = false) {
  return {
    padding: "11px 16px",
    borderRadius: "9px",
    border: primary
      ? "1px solid rgba(212,175,55,0.7)"
      : "1px solid rgba(255,255,255,0.14)",
    background: primary
      ? "linear-gradient(135deg, rgba(212,175,55,0.28), rgba(212,175,55,0.1))"
      : "rgba(255,255,255,0.05)",
    color: primary ? "#f4d675" : "#e2e8f0",
    fontWeight: 900,
    cursor: "pointer",
  };
}

function normalizeTicker(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9.-]/g, "");
}

export default function MarketPlanCard({
  apiOnline,
  existingMarketPlan,
  operationsApi,
  onCreated,
  setNotice,
}) {
  const [working, setWorking] = useState(false);
  const [watchlistInput, setWatchlistInput] = useState("");
  const [form, setForm] = useState({
    trading_date: todayIsoDate(),
    floor_status: "premarket",
    market_bias: "pending",
    market_condition: "Pending analysis",
    risk_environment: "Pending analysis",
    expected_volatility: "Pending analysis",
    core_watchlist: [],
    notes: "",
  });

  const canSubmit = useMemo(
    () => apiOnline && !working && !existingMarketPlan,
    [apiOnline, existingMarketPlan, working],
  );

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addTicker() {
    const ticker = normalizeTicker(watchlistInput);

    if (!ticker) return;

    setForm((current) => {
      if (current.core_watchlist.includes(ticker)) {
        return current;
      }

      return {
        ...current,
        core_watchlist: [...current.core_watchlist, ticker],
      };
    });

    setWatchlistInput("");
  }

  function removeTicker(ticker) {
    setForm((current) => ({
      ...current,
      core_watchlist: current.core_watchlist.filter(
        (item) => item !== ticker,
      ),
    }));
  }

  function handleWatchlistKeyDown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTicker();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (existingMarketPlan) {
      setNotice("A Market Plan already exists for today.");
      return;
    }

    if (form.core_watchlist.length === 0) {
      setNotice("Add at least one symbol to the Core Watchlist.");
      return;
    }

    setWorking(true);
    setNotice("");

    try {
      const payload = {
        ...form,
        economic_events: [],
        notes: form.notes.trim() || null,
      };

      const created = await operationsApi.createTradingDay(payload);

      onCreated(created);
      setNotice(`Market Plan created for ${created.trading_date}.`);
    } catch (error) {
      setNotice(`Market Plan creation failed: ${error.message}`);
    } finally {
      setWorking(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={cardStyle()}>
      <div style={{ color: "#d4af37", fontWeight: 900 }}>
        MARKET PLAN
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "13px",
          lineHeight: 1.6,
          marginTop: "6px",
        }}
      >
        Define the market environment, active watchlist, and trading
        thesis before publishing levels or trade tickets.
      </div>

      {existingMarketPlan && (
        <div
          style={{
            marginTop: "14px",
            padding: "12px 13px",
            borderRadius: "10px",
            border: "1px solid rgba(134,239,172,0.28)",
            background: "rgba(34,197,94,0.07)",
            color: "#86efac",
            fontSize: "13px",
          }}
        >
          Today&apos;s Market Plan is already active.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "13px",
          marginTop: "16px",
        }}
      >
        <div>
          <label style={labelStyle()}>Market Date</label>
          <input
            type="date"
            value={form.trading_date}
            onChange={(event) =>
              updateField("trading_date", event.target.value)
            }
            style={inputStyle()}
          />
        </div>

        <div>
          <label style={labelStyle()}>Floor Status</label>
          <select
            value={form.floor_status}
            onChange={(event) =>
              updateField("floor_status", event.target.value)
            }
            style={inputStyle()}
          >
            <option value="premarket">Premarket</option>
            <option value="live">Live</option>
            <option value="standing_aside">Standing Aside</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "13px",
          marginTop: "13px",
        }}
      >
        <div>
          <label style={labelStyle()}>Market Bias</label>
          <select
            value={form.market_bias}
            onChange={(event) =>
              updateField("market_bias", event.target.value)
            }
            style={inputStyle()}
          >
            {MARKET_BIAS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle()}>Market Condition</label>
          <select
            value={form.market_condition}
            onChange={(event) =>
              updateField("market_condition", event.target.value)
            }
            style={inputStyle()}
          >
            {MARKET_CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle()}>Risk Environment</label>
          <select
            value={form.risk_environment}
            onChange={(event) =>
              updateField("risk_environment", event.target.value)
            }
            style={inputStyle()}
          >
            {RISK_ENVIRONMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle()}>Expected Volatility</label>
          <select
            value={form.expected_volatility}
            onChange={(event) =>
              updateField("expected_volatility", event.target.value)
            }
            style={inputStyle()}
          >
            {VOLATILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <label style={labelStyle()}>Core Watchlist</label>

        <div
          style={{
            display: "flex",
            gap: "9px",
            alignItems: "stretch",
          }}
        >
          <input
            value={watchlistInput}
            onChange={(event) =>
              setWatchlistInput(event.target.value.toUpperCase())
            }
            onKeyDown={handleWatchlistKeyDown}
            placeholder="Type a ticker and press Enter"
            style={inputStyle()}
          />

          <button
            type="button"
            onClick={addTicker}
            style={{
              ...buttonStyle(),
              flexShrink: 0,
            }}
          >
            Add Symbol
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "11px",
            minHeight: "35px",
          }}
        >
          {form.core_watchlist.length === 0 ? (
            <span style={{ color: "#64748b", fontSize: "13px" }}>
              No symbols added.
            </span>
          ) : (
            form.core_watchlist.map((ticker) => (
              <button
                key={ticker}
                type="button"
                onClick={() => removeTicker(ticker)}
                title={`Remove ${ticker}`}
                style={{
                  borderRadius: "999px",
                  border: "1px solid rgba(212,175,55,0.35)",
                  background: "rgba(212,175,55,0.08)",
                  color: "#f4d675",
                  padding: "7px 10px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {ticker} ×
              </button>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <label style={labelStyle()}>Today&apos;s Thesis</label>
        <textarea
          value={form.notes}
          onChange={(event) =>
            updateField("notes", event.target.value)
          }
          rows={6}
          maxLength={2000}
          placeholder={
            "Example: Looking for acceptance above PMH. No longs below VWAP. Expecting expansion after the opening range."
          }
          style={{
            ...inputStyle(),
            resize: "vertical",
            lineHeight: 1.6,
          }}
        />

        <div
          style={{
            marginTop: "6px",
            textAlign: "right",
            color: "#64748b",
            fontSize: "11px",
          }}
        >
          {form.notes.length}/2000
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          ...buttonStyle(true),
          marginTop: "18px",
          width: "100%",
          opacity: canSubmit ? 1 : 0.55,
        }}
      >
        {working
          ? "Saving Market Plan..."
          : existingMarketPlan
            ? "Market Plan Already Created"
            : "Save Market Plan"}
      </button>
    </form>
  );
}