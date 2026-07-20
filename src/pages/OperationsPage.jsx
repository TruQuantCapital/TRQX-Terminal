import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_TRQX_OPERATIONS_API_URL || "http://127.0.0.1:8000";

const defaultWatchlist = [
  "SPY",
  "SPX",
  "QQQ",
  "IWM",
  "TSLA",
  "NVDA",
  "META",
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

export default function OperationsPage() {
  const [apiStatus, setApiStatus] = useState({
    loading: true,
    online: false,
    message: "Checking TRQX Operations API...",
    version: null,
  });

  const [tradingDay, setTradingDay] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [premarketLevels, setPremarketLevels] = useState([]);
  const [notice, setNotice] = useState("");
  const [working, setWorking] = useState(false);

  const [dayForm, setDayForm] = useState({
    trading_date: todayIsoDate(),
    floor_status: "premarket",
    market_bias: "pending",
    market_condition: "Pending premarket review",
    risk_environment: "Pending premarket review",
    expected_volatility: "Pending economic-event review",
    notes: "",
  });

  const [levelForm, setLevelForm] = useState({
  ticker: "SPY",
  supportLevels: "",
  resistanceLevels: "",
  bullishAbove: "",
  bearishBelow: "",
  gapFill: "",
  previousHigh: "",
  previousLow: "",
  premarketHigh: "",
  premarketLow: "",
  bias: "Neutral",
  notes: "",
});

  const [ticketForm, setTicketForm] = useState({
    ticker: "SPY",
    direction: "call",
    setup: "",
    entry: "",
    stop: "",
    target1: "",
    target2: "",
    target3: "",
    grade: "A",
    status: "watching",
    reasoning: "",
    notes: "",
  });

  const canCreateTicket = useMemo(
    () => Boolean(tradingDay?.id),
    [tradingDay],
  );

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const detail =
        typeof data === "object" && data?.detail
          ? data.detail
          : `Request failed with HTTP ${response.status}`;

      throw new Error(detail);
    }

    return data;
  }

  async function checkApiHealth() {
    setApiStatus({
      loading: true,
      online: false,
      message: "Checking TRQX Operations API...",
      version: null,
    });

    try {
      const data = await apiRequest("/health");

      setApiStatus({
        loading: false,
        online: data.status === "ok",
        message: "TRQX Operations API is online.",
        version: data.version || null,
      });
    } catch (error) {
      setApiStatus({
        loading: false,
        online: false,
        message: error.message || "Unable to reach API.",
        version: null,
      });
    }
  }

  async function loadTickets() {
    if (!tradingDay?.id) {
      setTickets([]);
      return;
    }

    try {
      const data = await apiRequest(
        `/trade-tickets?trading_day_id=${encodeURIComponent(tradingDay.id)}`,
      );
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotice(`Unable to load tickets: ${error.message}`);
    }
  }

  async function loadPremarketLevels() {
    if (!tradingDay?.id) {
      setPremarketLevels([]);
      return;
    }

    try {
      const data = await apiRequest(
        `/premarket-levels?trading_day_id=${encodeURIComponent(
          tradingDay.id,
        )}`,
      );

      setPremarketLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotice(`Unable to load Premarket Levels: ${error.message}`);
    }
  }

  function parseLevelList(value) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map(Number)
      .filter((item) => Number.isFinite(item) && item > 0);
  }

  function optionalNumber(value) {
    if (value === "") return null;

    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  async function createPremarketLevel(event) {
    event.preventDefault();

    if (!tradingDay?.id) {
      setNotice("Create a Trading Day before publishing Premarket Levels.");
      return;
    }

    const supportLevels = parseLevelList(levelForm.supportLevels);
    const resistanceLevels = parseLevelList(levelForm.resistanceLevels);

    if (supportLevels.length === 0 && resistanceLevels.length === 0) {
      setNotice("Enter at least one support or resistance level.");
      return;
    }

    setWorking(true);
    setNotice("");

    try {
      const payload = {
        trading_day_id: tradingDay.id,
        ticker: levelForm.ticker,
        support_levels: supportLevels,
        resistance_levels: resistanceLevels,
        bullish_above: optionalNumber(levelForm.bullishAbove),
        bearish_below: optionalNumber(levelForm.bearishBelow),
        gap_fill: optionalNumber(levelForm.gapFill),
        previous_high: optionalNumber(levelForm.previousHigh),
        previous_low: optionalNumber(levelForm.previousLow),
        premarket_high: optionalNumber(levelForm.premarketHigh),
        premarket_low: optionalNumber(levelForm.premarketLow),
        bias: levelForm.bias,
        notes: levelForm.notes || null,
      };

      const created = await apiRequest("/premarket-levels", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setPremarketLevels((current) => [...current, created]);
      setNotice(
        `${created.ticker} Premarket Levels published successfully.`,
      );

      setLevelForm((current) => ({
        ...current,
        supportLevels: "",
        resistanceLevels: "",
        bullishAbove: "",
        bearishBelow: "",
        gapFill: "",
        previousHigh: "",
        previousLow: "",
        premarketHigh: "",
        premarketLow: "",
        notes: "",
      }));
    } catch (error) {
      setNotice(`Premarket Levels failed: ${error.message}`);
    } finally {
      setWorking(false);
    }
  }

  async function createTradingDay(event) {
    event.preventDefault();
    setWorking(true);
    setNotice("");

    try {
      const payload = {
        ...dayForm,
        core_watchlist: defaultWatchlist,
        economic_events: [],
        notes: dayForm.notes || null,
      };

      const created = await apiRequest("/trading-days", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setTradingDay(created);
      setTickets([]);
      setPremarketLevels([]);
      setNotice(`Trading Day created for ${created.trading_date}.`);
    } catch (error) {
      setNotice(`Trading Day creation failed: ${error.message}`);
    } finally {
      setWorking(false);
    }
  }

  async function createTradeTicket(event) {
    event.preventDefault();

    if (!tradingDay?.id) {
      setNotice("Create a Trading Day before creating a Trade Ticket.");
      return;
    }

    const targets = [
      ticketForm.target1,
      ticketForm.target2,
      ticketForm.target3,
    ]
      .filter((value) => value !== "")
      .map(Number);

    if (targets.length === 0) {
      setNotice("Enter at least one target.");
      return;
    }

    setWorking(true);
    setNotice("");

    try {
      const payload = {
        trading_day_id: tradingDay.id,
        ticker: ticketForm.ticker,
        direction: ticketForm.direction,
        setup: ticketForm.setup,
        entry: Number(ticketForm.entry),
        stop: Number(ticketForm.stop),
        targets,
        grade: ticketForm.grade,
        status: ticketForm.status,
        reasoning: ticketForm.reasoning
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: ticketForm.notes || null,
      };

      const created = await apiRequest("/trade-tickets", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setTickets((current) => [...current, created]);
      setNotice(`${created.ticker} Trade Ticket created successfully.`);

      setTicketForm((current) => ({
        ...current,
        entry: "",
        stop: "",
        target1: "",
        target2: "",
        target3: "",
        reasoning: "",
        notes: "",
      }));
    } catch (error) {
      setNotice(`Trade Ticket creation failed: ${error.message}`);
    } finally {
      setWorking(false);
    }
  }

  useEffect(() => {
    checkApiHealth();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [tradingDay?.id]);

  useEffect(() => {
  loadPremarketLevels();
}, [tradingDay?.id]);

  return (
    <main style={{ padding: "24px", maxWidth: "1500px", margin: "0 auto" }}>
      <section
        style={{
          border: "1px solid rgba(212,175,55,0.25)",
          background:
            "linear-gradient(145deg, rgba(13,17,23,0.98), rgba(20,24,31,0.96))",
          borderRadius: "18px",
          padding: "28px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
        }}
      >
        <div
          style={{
            color: "#d4af37",
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Owner Administration
        </div>

        <h1 style={{ margin: "8px 0 4px", fontSize: "32px" }}>
          TRQX Operations Center
        </h1>

        <p style={{ color: "#94a3b8", marginTop: 0 }}>
          Trading-floor control, trade-ticket management and publishing
          operations.
        </p>

        {notice && (
          <div
            style={{
              marginTop: "18px",
              padding: "13px 15px",
              borderRadius: "10px",
              border: "1px solid rgba(212,175,55,0.3)",
              background: "rgba(212,175,55,0.07)",
              color: "#f4d675",
            }}
          >
            {notice}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            marginTop: "22px",
          }}
        >
          <div style={cardStyle()}>
            <div style={labelStyle()}>Operations API</div>
            <div style={{ fontWeight: 900 }}>
              {apiStatus.loading
                ? "🟡 Checking"
                : apiStatus.online
                  ? "🟢 Online"
                  : "🔴 Offline"}
            </div>
            <div style={{ color: "#94a3b8", marginTop: "6px" }}>
              {apiStatus.message}
            </div>
            {apiStatus.version && (
              <div style={{ color: "#64748b", marginTop: "5px" }}>
                Version {apiStatus.version}
              </div>
            )}
            <button
              type="button"
              onClick={checkApiHealth}
              style={{ ...buttonStyle(), marginTop: "13px" }}
            >
              Recheck
            </button>
          </div>

          <div style={cardStyle()}>
            <div style={labelStyle()}>Trading Day</div>
            <div style={{ fontWeight: 900 }}>
              {tradingDay ? "🟢 Open" : "⚪ Not opened"}
            </div>
            <div style={{ color: "#94a3b8", marginTop: "6px" }}>
              {tradingDay
                ? `${tradingDay.trading_date} · ${tradingDay.floor_status}`
                : "Create today’s operating record below."}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={labelStyle()}>Trade Desk</div>
            <div style={{ fontWeight: 900 }}>
              {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
            </div>
            <div style={{ color: "#94a3b8", marginTop: "6px" }}>
              Current API session
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={labelStyle()}>Discord Floor</div>
            <div style={{ fontWeight: 900 }}>⚪ Not connected</div>
            <div style={{ color: "#94a3b8", marginTop: "6px" }}>
              Discord publishing is the next backend integration.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
  "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "20px",
            marginTop: "22px",
          }}
        >
          <form onSubmit={createTradingDay} style={cardStyle()}>
            <div style={{ color: "#d4af37", fontWeight: 900 }}>
              OPEN TRADING DAY
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={labelStyle()}>Trading Date</label>
              <input
                type="date"
                value={dayForm.trading_date}
                onChange={(event) =>
                  setDayForm({
                    ...dayForm,
                    trading_date: event.target.value,
                  })
                }
                style={inputStyle()}
              />
            </div>

            <div style={{ marginTop: "14px" }}>
              <label style={labelStyle()}>Market Bias</label>
              <select
                value={dayForm.market_bias}
                onChange={(event) =>
                  setDayForm({
                    ...dayForm,
                    market_bias: event.target.value,
                  })
                }
                style={inputStyle()}
              >
                <option value="pending">Pending</option>
                <option value="bullish">Bullish</option>
                <option value="bearish">Bearish</option>
                <option value="neutral">Neutral</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div style={{ marginTop: "14px" }}>
              <label style={labelStyle()}>Market Condition</label>
              <input
                value={dayForm.market_condition}
                onChange={(event) =>
                  setDayForm({
                    ...dayForm,
                    market_condition: event.target.value,
                  })
                }
                style={inputStyle()}
              />
            </div>

            <div style={{ marginTop: "14px" }}>
              <label style={labelStyle()}>Risk Environment</label>
              <input
                value={dayForm.risk_environment}
                onChange={(event) =>
                  setDayForm({
                    ...dayForm,
                    risk_environment: event.target.value,
                  })
                }
                style={inputStyle()}
              />
            </div>

            <div style={{ marginTop: "14px" }}>
              <label style={labelStyle()}>Expected Volatility</label>
              <input
                value={dayForm.expected_volatility}
                onChange={(event) =>
                  setDayForm({
                    ...dayForm,
                    expected_volatility: event.target.value,
                  })
                }
                style={inputStyle()}
              />
            </div>

            <button
              type="submit"
              disabled={working || !apiStatus.online}
              style={{
                ...buttonStyle(true),
                marginTop: "18px",
                width: "100%",
                opacity: working || !apiStatus.online ? 0.55 : 1,
              }}
            >
              {working ? "Processing..." : "Create Trading Day"}
            </button>
          </form>

          <form onSubmit={createTradeTicket} style={cardStyle()}>
            <div style={{ color: "#d4af37", fontWeight: 900 }}>
              TRQX TRADE TICKET
            </div>

            {!canCreateTicket && (
              <div
                style={{
                  marginTop: "13px",
                  color: "#fca5a5",
                  fontSize: "13px",
                }}
              >
                Create a Trading Day before submitting a Trade Ticket.
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
                <label style={labelStyle()}>Ticker</label>
                <input
                  value={ticketForm.ticker}
                  onChange={(event) =>
                    setTicketForm({
                      ...ticketForm,
                      ticker: event.target.value.toUpperCase(),
                    })
                  }
                  style={inputStyle()}
                />
              </div>

              <div>
                <label style={labelStyle()}>Direction</label>
                <select
                  value={ticketForm.direction}
                  onChange={(event) =>
                    setTicketForm({
                      ...ticketForm,
                      direction: event.target.value,
                    })
                  }
                  style={inputStyle()}
                >
                  <option value="call">Call</option>
                  <option value="put">Put</option>
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "13px" }}>
              <label style={labelStyle()}>Setup</label>
              <input
                value={ticketForm.setup}
                onChange={(event) =>
                  setTicketForm({
                    ...ticketForm,
                    setup: event.target.value,
                  })
                }
                style={inputStyle()}
              />
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
                <label style={labelStyle()}>Entry</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={ticketForm.entry}
                  onChange={(event) =>
                    setTicketForm({
                      ...ticketForm,
                      entry: event.target.value,
                    })
                  }
                  style={inputStyle()}
                />
              </div>

              <div>
                <label style={labelStyle()}>Stop</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={ticketForm.stop}
                  onChange={(event) =>
                    setTicketForm({
                      ...ticketForm,
                      stop: event.target.value,
                    })
                  }
                  style={inputStyle()}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "13px",
                marginTop: "13px",
              }}
            >
              {["target1", "target2", "target3"].map((field, index) => (
                <div key={field}>
                  <label style={labelStyle()}>Target {index + 1}</label>
                  <input
                    type="number"
                    step="any"
                    value={ticketForm[field]}
                    onChange={(event) =>
                      setTicketForm({
                        ...ticketForm,
                        [field]: event.target.value,
                      })
                    }
                    style={inputStyle()}
                  />
                </div>
              ))}
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
                <label style={labelStyle()}>Grade</label>
                <select
                  value={ticketForm.grade}
                  onChange={(event) =>
                    setTicketForm({
                      ...ticketForm,
                      grade: event.target.value,
                    })
                  }
                  style={inputStyle()}
                >
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              <div>
                <label style={labelStyle()}>Status</label>
                <select
                  value={ticketForm.status}
                  onChange={(event) =>
                    setTicketForm({
                      ...ticketForm,
                      status: event.target.value,
                    })
                  }
                  style={inputStyle()}
                >
                  <option value="watching">Watching</option>
                  <option value="active">Active</option>
                  <option value="partial">Partial</option>
                  <option value="breakeven">Breakeven</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "13px" }}>
              <label style={labelStyle()}>
                Reasoning — separate items with commas
              </label>
              <input
                value={ticketForm.reasoning}
                onChange={(event) =>
                  setTicketForm({
                    ...ticketForm,
                    reasoning: event.target.value,
                  })
                }
                placeholder="VWAP reclaim, ORB break, volume confirmation"
                style={inputStyle()}
              />
            </div>

            <div style={{ marginTop: "13px" }}>
              <label style={labelStyle()}>Notes</label>
              <textarea
                value={ticketForm.notes}
                onChange={(event) =>
                  setTicketForm({
                    ...ticketForm,
                    notes: event.target.value,
                  })
                }
                rows={3}
                style={{ ...inputStyle(), resize: "vertical" }}
              />
            </div>

            <button
              type="submit"
              disabled={working || !canCreateTicket || !apiStatus.online}
              style={{
                ...buttonStyle(true),
                marginTop: "18px",
                width: "100%",
                opacity:
                  working || !canCreateTicket || !apiStatus.online ? 0.55 : 1,
              }}
            >
              {working ? "Processing..." : "Create Trade Ticket"}
            </button>
          </form>
          <form onSubmit={createPremarketLevel} style={cardStyle()}>
  <div style={{ color: "#d4af37", fontWeight: 900 }}>
    PREMARKET LEVELS
  </div>

  {!tradingDay && (
    <div
      style={{
        marginTop: "13px",
        color: "#fca5a5",
        fontSize: "13px",
      }}
    >
      Create a Trading Day before publishing Premarket Levels.
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
      <label style={labelStyle()}>Ticker</label>
      <input
        value={levelForm.ticker}
        onChange={(event) =>
          setLevelForm({
            ...levelForm,
            ticker: event.target.value.toUpperCase(),
          })
        }
        style={inputStyle()}
      />
    </div>

    <div>
      <label style={labelStyle()}>Bias</label>
      <select
        value={levelForm.bias}
        onChange={(event) =>
          setLevelForm({
            ...levelForm,
            bias: event.target.value,
          })
        }
        style={inputStyle()}
      >
        <option value="Bullish">Bullish</option>
        <option value="Bearish">Bearish</option>
        <option value="Neutral">Neutral</option>
        <option value="Mixed">Mixed</option>
      </select>
    </div>
  </div>

  <div style={{ marginTop: "13px" }}>
    <label style={labelStyle()}>
      Support Levels — separate with commas
    </label>
    <input
      value={levelForm.supportLevels}
      onChange={(event) =>
        setLevelForm({
          ...levelForm,
          supportLevels: event.target.value,
        })
      }
      placeholder="293.80, 293.12, 292.43"
      style={inputStyle()}
    />
  </div>

  <div style={{ marginTop: "13px" }}>
    <label style={labelStyle()}>
      Resistance Levels — separate with commas
    </label>
    <input
      value={levelForm.resistanceLevels}
      onChange={(event) =>
        setLevelForm({
          ...levelForm,
          resistanceLevels: event.target.value,
        })
      }
      placeholder="294.25, 295.00"
      style={inputStyle()}
    />
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
      <label style={labelStyle()}>Bullish Above</label>
      <input
        type="number"
        step="any"
        value={levelForm.bullishAbove}
        onChange={(event) =>
          setLevelForm({
            ...levelForm,
            bullishAbove: event.target.value,
          })
        }
        style={inputStyle()}
      />
    </div>

    <div>
      <label style={labelStyle()}>Bearish Below</label>
      <input
        type="number"
        step="any"
        value={levelForm.bearishBelow}
        onChange={(event) =>
          setLevelForm({
            ...levelForm,
            bearishBelow: event.target.value,
          })
        }
        style={inputStyle()}
      />
    </div>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "13px",
      marginTop: "13px",
    }}
  >
    <div>
      <label style={labelStyle()}>Premarket High</label>
      <input
        type="number"
        step="any"
        value={levelForm.premarketHigh}
        onChange={(event) =>
          setLevelForm({
            ...levelForm,
            premarketHigh: event.target.value,
          })
        }
        style={inputStyle()}
      />
    </div>

    <div>
      <label style={labelStyle()}>Premarket Low</label>
      <input
        type="number"
        step="any"
        value={levelForm.premarketLow}
        onChange={(event) =>
          setLevelForm({
            ...levelForm,
            premarketLow: event.target.value,
          })
        }
        style={inputStyle()}
      />
    </div>

    <div>
      <label style={labelStyle()}>Gap Fill</label>
      <input
        type="number"
        step="any"
        value={levelForm.gapFill}
        onChange={(event) =>
          setLevelForm({
            ...levelForm,
            gapFill: event.target.value,
          })
        }
        style={inputStyle()}
      />
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
      <label style={labelStyle()}>Previous High</label>
      <input
        type="number"
        step="any"
        value={levelForm.previousHigh}
        onChange={(event) =>
          setLevelForm({
            ...levelForm,
            previousHigh: event.target.value,
          })
        }
        style={inputStyle()}
      />
    </div>

    <div>
      <label style={labelStyle()}>Previous Low</label>
      <input
        type="number"
        step="any"
        value={levelForm.previousLow}
        onChange={(event) =>
          setLevelForm({
            ...levelForm,
            previousLow: event.target.value,
          })
        }
        style={inputStyle()}
      />
    </div>
  </div>

  <div style={{ marginTop: "13px" }}>
    <label style={labelStyle()}>Premarket Plan and Notes</label>
    <textarea
      value={levelForm.notes}
      onChange={(event) =>
        setLevelForm({
          ...levelForm,
          notes: event.target.value,
        })
      }
      rows={4}
      placeholder="Watch for rejection at resistance. Acceptance above the bullish trigger invalidates the bearish plan."
      style={{ ...inputStyle(), resize: "vertical" }}
    />
  </div>

  <button
    type="submit"
    disabled={working || !tradingDay || !apiStatus.online}
    style={{
      ...buttonStyle(true),
      marginTop: "18px",
      width: "100%",
      opacity:
        working || !tradingDay || !apiStatus.online ? 0.55 : 1,
    }}
  >
    {working ? "Processing..." : "Publish Premarket Levels"}
  </button>
</form>
        </div>
<section style={{ ...cardStyle(), marginTop: "22px" }}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      gap: "12px",
      alignItems: "center",
    }}
  >
    <div>
      <div style={{ color: "#d4af37", fontWeight: 900 }}>
        PUBLISHED PREMARKET LEVELS
      </div>
      <div style={{ color: "#94a3b8", marginTop: "4px" }}>
        Levels attached to the active Trading Day.
      </div>
    </div>

    <button
      type="button"
      onClick={loadPremarketLevels}
      disabled={!tradingDay}
      style={buttonStyle()}
    >
      Refresh Levels
    </button>
  </div>

  {premarketLevels.length === 0 ? (
    <div
      style={{
        marginTop: "18px",
        padding: "25px",
        textAlign: "center",
        color: "#64748b",
        border: "1px dashed rgba(255,255,255,0.1)",
        borderRadius: "12px",
      }}
    >
      No Premarket Levels have been published for this Trading Day.
    </div>
  ) : (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "14px",
        marginTop: "18px",
      }}
    >
      {premarketLevels.map((level) => (
        <article key={level.id} style={cardStyle()}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div
              style={{
                color: "#d4af37",
                fontSize: "20px",
                fontWeight: 950,
              }}
            >
              {level.ticker}
            </div>

            <strong>{level.bias}</strong>
          </div>

          <div style={{ marginTop: "14px" }}>
            <div style={labelStyle()}>Resistance</div>
            <strong>
              {level.resistance_levels.length
                ? level.resistance_levels.join(" | ")
                : "None"}
            </strong>
          </div>

          <div style={{ marginTop: "14px" }}>
            <div style={labelStyle()}>Support</div>
            <strong>
              {level.support_levels.length
                ? level.support_levels.join(" | ")
                : "None"}
            </strong>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
              marginTop: "14px",
            }}
          >
            <div>
              <div style={labelStyle()}>Bullish Above</div>
              <strong>{level.bullish_above ?? "N/A"}</strong>
            </div>

            <div>
              <div style={labelStyle()}>Bearish Below</div>
              <strong>{level.bearish_below ?? "N/A"}</strong>
            </div>
          </div>

          {level.notes && (
            <div style={{ marginTop: "14px" }}>
              <div style={labelStyle()}>Plan</div>
              <div style={{ color: "#cbd5e1" }}>{level.notes}</div>
            </div>
          )}
        </article>
      ))}
    </div>
  )}
</section>
        <section style={{ ...cardStyle(), marginTop: "22px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ color: "#d4af37", fontWeight: 900 }}>
                TODAY’S TRADE DESK
              </div>
              <div style={{ color: "#94a3b8", marginTop: "4px" }}>
                Tickets attached to the active Trading Day.
              </div>
            </div>

            <button
              type="button"
              onClick={loadTickets}
              disabled={!tradingDay}
              style={buttonStyle()}
            >
              Refresh Tickets
            </button>
          </div>

          {tickets.length === 0 ? (
            <div
              style={{
                marginTop: "18px",
                padding: "25px",
                textAlign: "center",
                color: "#64748b",
                border: "1px dashed rgba(255,255,255,0.1)",
                borderRadius: "12px",
              }}
            >
              No Trade Tickets have been created for this Trading Day.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "14px",
                marginTop: "18px",
              }}
            >
              {tickets.map((ticket) => (
                <article key={ticket.id} style={cardStyle()}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#d4af37",
                          fontSize: "20px",
                          fontWeight: 950,
                        }}
                      >
                        {ticket.ticker}
                      </div>
                      <div
                        style={{
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          fontSize: "12px",
                          marginTop: "3px",
                        }}
                      >
                        {ticket.direction} · {ticket.status}
                      </div>
                    </div>

                    <div
                      style={{
                        color: "#f4d675",
                        fontWeight: 900,
                        fontSize: "18px",
                      }}
                    >
                      {ticket.grade}
                    </div>
                  </div>

                  <div style={{ marginTop: "15px", color: "#cbd5e1" }}>
                    {ticket.setup}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "10px",
                      marginTop: "15px",
                    }}
                  >
                    <div>
                      <div style={labelStyle()}>Entry</div>
                      <strong>{ticket.entry}</strong>
                    </div>
                    <div>
                      <div style={labelStyle()}>Stop</div>
                      <strong>{ticket.stop}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: "14px" }}>
                    <div style={labelStyle()}>Targets</div>
                    <strong>{ticket.targets.join(" · ")}</strong>
                  </div>

                  {ticket.reasoning?.length > 0 && (
                    <div style={{ marginTop: "14px" }}>
                      <div style={labelStyle()}>Reasoning</div>
                      <div style={{ color: "#cbd5e1" }}>
                        {ticket.reasoning.join(" • ")}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}