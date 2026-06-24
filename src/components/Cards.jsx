import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Waves, Crown, ExternalLink } from "lucide-react";
import DataTable from "./DataTable";
import {
  economicRows,
  gammaMetrics,
  optionsFlowRows,
  scannerRows,
} from "../data/mockData";

const API = "https://trqx-flow-scanner-production.up.railway.app";

export function GaugeCard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${API}/api/flow/stats`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setStats(data);
      } catch {}
    }
    fetchStats();
    const t = setInterval(fetchStats, 15000);
    return () => clearInterval(t);
  }, []);

  const ratio = stats?.ratio ?? 1;
  const callPrem = stats?.callPremium ?? 0;
  const putPrem = stats?.putPremium ?? 0;
  const sweeps = stats?.sweepCount ?? 0;
  const blocks = stats?.blockCount ?? 0;

  // Score 0-100 based on flow data
  const rawScore = Math.min(100, Math.max(0, Math.round(
    (ratio / (ratio + 1)) * 60 +
    (sweeps > 50 ? 20 : sweeps > 20 ? 10 : 0) +
    (blocks > 30 ? 20 : blocks > 10 ? 10 : 0)
  )));

  const regime = ratio > 1.3 ? "RISK ON" : ratio < 0.75 ? "RISK OFF" : "NEUTRAL";
  const regimeColor = regime === "RISK ON" ? "var(--green)" : regime === "RISK OFF" ? "var(--red)" : "var(--gold)";

  const breadth = ratio > 1 ? `${Math.min(99, Math.round(50 + (ratio - 1) * 30))}%` : `${Math.max(1, Math.round(50 - (1 - ratio) * 30))}%`;
  const volatility = sweeps > 80 ? "High" : sweeps > 40 ? "Moderate" : "Low";
  const momentum = ratio > 1.2 ? "Bullish" : ratio < 0.8 ? "Bearish" : "Neutral";

  // SVG arc gauge
  const size = 120;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = 45;
  const startAngle = -200;
  const endAngle = 20;
  const totalAngle = endAngle - startAngle;
  const scoreAngle = startAngle + (rawScore / 100) * totalAngle;

  function polarToXY(angle, radius) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(start, end, radius) {
    const s = polarToXY(start, radius);
    const e = polarToXY(end, radius);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const needleTip = polarToXY(scoreAngle, r - 8);
  const needleBase1 = polarToXY(scoreAngle + 90, 6);
  const needleBase2 = polarToXY(scoreAngle - 90, 6);

  return (
    <section className="card regime">
      <div className="cardTitle">Market Regime</div>
      <h1 style={{ color: regimeColor }}>{regime}</h1>

      <div className="gaugeWrap">
        <svg viewBox={`0 0 ${size} ${size}`} width="140" height="140">
          {/* Background arc */}
          <path d={arcPath(startAngle, endAngle, r)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
          {/* Score arc */}
          <path d={arcPath(startAngle, scoreAngle, r)} fill="none" stroke={regimeColor} strokeWidth="10" strokeLinecap="round" />
          {/* Needle */}
          <polygon
            points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
            fill={regimeColor}
            opacity="0.9"
          />
          <circle cx={cx} cy={cy} r="5" fill={regimeColor} />
          {/* Score text */}
          <text x={cx} y={cy + 22} textAnchor="middle" fontSize="20" fontWeight="700" fill="white" fontFamily="monospace">{rawScore}</text>
          <text x={cx} y={cy + 34} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)" fontFamily="monospace">/100</text>
        </svg>
      </div>

      <div className="metrics3">
        <div><b>{breadth}</b><span>Breadth</span></div>
        <div><b>{volatility}</b><span>Volatility</span></div>
        <div><b style={{ color: ratio > 1.2 ? "var(--green)" : ratio < 0.8 ? "var(--red)" : "var(--gold)" }}>{momentum}</b><span>Momentum</span></div>
      </div>
    </section>
  );
}

export function CalendarCard() {
  const [rows, setRows] = useState(economicRows);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch(`${API}/api/economic-calendar`);
        if (!res.ok) throw new Error("Calendar fetch failed");

        const data = await res.json();

        if (Array.isArray(data) && data.length) {
          setRows(data);
        }
      } catch (err) {
        console.warn("Economic calendar fallback loaded:", err);
      }
    }

    fetchCalendar();

    const interval = setInterval(fetchCalendar, 1800000); // 30 min

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="card calendar">
      <div className="cardTitle">Economic Calendar</div>

      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Impact</th>
            <th>Actual</th>
            <th>Forecast</th>
            <th>Prev</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r[0]}</td>
              <td>{r[1]}</td>
              <td>
                <span className={`tag ${String(r[2]).toLowerCase()}`}>
                  {r[2]}
                </span>
              </td>
              <td>{r[3]}</td>
              <td>{r[4]}</td>
              <td>{r[5]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <a>View Full Calendar</a>
    </section>
  );
}

export function AiSummary() {
  return (
    <section className="card ai">
      <div className="cardTitle purple">
        AI Market Summary <span>TRQX AI</span>
      </div>
      <p>
        Markets are trading higher as investors digest inflation data and await
        the Fedâ€™s next move. Tech and growth names are leading while volatility
        remains compressed.
      </p>
      <b>Key Takeaways</b>
      <ul>
        <li>Inflation cooling supports risk assets</li>
        <li>Gamma exposure positive above 530</li>
        <li>Watch 4,300 SPX for regime change</li>
      </ul>
    </section>
  );
}

export function BreadthCard() {
  const sectors = [
    ["Technology", "+1.25%", 92],
    ["Communication", "+0.60%", 78],
    ["Financials", "+0.23%", 52],
    ["Energy", "-0.12%", 38],
    ["Healthcare", "-0.32%", 30],
    ["Utilities", "-0.45%", 24],
  ];

  return (
    <section className="card breadth">
      <div className="cardTitle">Market Breadth</div>
      <div className="donut"></div>
      <div className="breadStats">
        <span><b className="positive">72%</b> Advancing</span>
        <span><b className="negative">23%</b> Declining</span>
        <span><b>5%</b> Unchanged</span>
      </div>
      <div className="sectorList">
        {sectors.map((s) => (
          <div className="sector" key={s[0]}>
            <span>{s[0]}</span>
            <div><i style={{ width: `${s[2]}%` }}></i></div>
            <b className={s[1].startsWith("+") ? "positive" : "negative"}>
              {s[1]}
            </b>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GammaCard({ full = false }) {
  return (
    <section className={`card gamma ${full ? "fullPageCard" : "wide"}`}>
      <div className="cardTitle purple">Gamma Exposure (SPY)</div>
      <div className="gammaTiles">
        {gammaMetrics.map((m) => (
          <div className={`metric ${m.tone}`} key={m.label}>
            <small>{m.label}</small>
            <b>{m.value}</b>
            <span>{m.detail}</span>
          </div>
        ))}
      </div>
      <div className="gammaChart">
        {Array.from({ length: 42 }).map((_, i) => {
          const h = Math.abs(Math.sin(i / 4) * 72) + 10;
          const isCall = i > 20;
          return (
            <span
              key={i}
              className={isCall ? "bar call" : "bar put"}
              style={{ height: h }}
            ></span>
          );
        })}
        <div className="zeroLine"></div>
      </div>
    </section>
  );
}

export function ScannerCard({ full = false }) {
  return (
    <section className={`card scanner ${full ? "fullPageCard" : "wide"}`}>
      <div className="cardTitle purple">Scanner</div>
      <div className="tabs">
        <button>Momentum</button>
        <button>ORB</button>
        <button>Low Float</button>
        <button>Unusual Volume</button>
        <button>Gappers</button>
        <button>Squeeze Candidates</button>
      </div>
      <DataTable
        headers={[
          "Rank",
          "Ticker",
          "Price",
          "Change %",
          "Volume",
          "Rel Volume",
          "Float",
          "RSI",
          "Setup",
        ]}
        rows={scannerRows}
        getCells={(r) => [
          r.rank,
          r.ticker,
          r.price,
          r.change,
          r.volume,
          r.relVolume,
          r.float,
          r.rsi,
          r.setup,
        ]}
      />
      <a>View Full Scanner</a>
    </section>
  );
}

export function OptionsFlowCard({ full = false }) {
  const [rows, setRows] = useState(optionsFlowRows);
  const [query, setQuery] = useState("");

  function fmtPremium(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "--";
    if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  }

  useEffect(() => {
    async function fetchFlow() {
      try {
        const res = await fetch(`${API}/api/flow/history`);
        if (!res.ok) throw new Error("Flow fetch failed");

        const data = await res.json();
        const liveRows = Array.isArray(data?.rows) ? data.rows : [];

        if (liveRows.length) {
          setRows(liveRows);
        }
      } catch (err) {
        console.warn("Options flow fallback loaded:", err);
      }
    }

    fetchFlow();
    const interval = setInterval(fetchFlow, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredRows = rows
    .filter((r) => {
      const q = query.trim().toUpperCase();
      if (!q) return true;
      return String(r.ticker || "").toUpperCase().includes(q);
    })
    .slice(0, full ? 25 : 8);

  return (
    <section className={`card options ${full ? "fullPageCard" : "wide"}`}>
      <div className="cardTitle purple">Options Flow</div>

      <div className="tabs">
        <button>Sweeps</button>
        <button>Blocks</button>
        <button>Big Premium</button>
        <button>Unusual</button>
      </div>

      <div style={{ margin: "10px 0 12px" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ticker: SPY, NVDA, TSLA..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "10px",
            color: "#fff",
            padding: "10px 12px",
            outline: "none",
            fontWeight: 700,
          }}
        />
      </div>

      <DataTable
        headers={[
          "Time",
          "Ticker",
          "Type",
          "Expiry",
          "Strike",
          "C/P",
          "Premium",
          "Details",
        ]}
        rows={filteredRows}
        getCells={(r) => [
          r.time ?? "--",
          r.ticker ?? "--",
          r.tag ?? r.type ?? "--",
          r.expStr ?? r.expiry ?? "--",
          r.strike ?? "--",
          r.type ?? r.cp ?? "--",
          fmtPremium(r.premium),
          r.contracts && r.price
            ? `${Number(r.contracts).toLocaleString()} @ ${Number(r.price).toFixed(2)}`
            : r.details ?? "--",
        ]}
      />

      <a onClick={() => navigate("/options-flow")} style={{ cursor: "pointer" }}>{query ? `Showing ${filteredRows.length} result(s) for ${query.toUpperCase()}` : "View All Options Flow →"}</a>
    </section>
  );
}

export function WatchlistCard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([
    { ticker: "SPY", price: "—", change: "—", volume: "—" },
    { ticker: "QQQ", price: "—", change: "—", volume: "—" },
    { ticker: "IWM", price: "—", change: "—", volume: "—" },
    { ticker: "NVDA", price: "—", change: "—", volume: "—" },
    { ticker: "TSLA", price: "—", change: "—", volume: "—" },
  ]);

  useEffect(() => {
    async function fetchPrices() {
      const symbols = ["SPY", "QQQ", "IWM", "NVDA", "TSLA"];
      const results = await Promise.all(symbols.map(async (sym) => {
        try {
          const res = await fetch(`${API}/api/quote/${sym}`);
          if (!res.ok) throw new Error("failed");
          const d = await res.json();
          const price = d.price ? Number(d.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
          const change = d.changePct != null ? `${d.changePct >= 0 ? "+" : ""}${Number(d.changePct).toFixed(2)}%` : "—";
          return { ticker: sym, price, change, volume: "—" };
        } catch {
          return { ticker: sym, price: "—", change: "—", volume: "—" };
        }
      }));
      setRows(results);
    }
    fetchPrices();
    const t = setInterval(fetchPrices, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="card watch">
      <div className="cardTitle purple">
        Watchlists
        <select><option>My Main List</option></select>
      </div>
      <DataTable
        headers={["Ticker", "Price", "Change %", "Volume"]}
        rows={rows}
        getCells={(r) => [r.ticker, r.price, r.change, r.volume]}
      />
      <a onClick={() => navigate("/scanner")} style={{ cursor: "pointer" }}>Manage Watchlists</a>
    </section>
  );
}

export function NewsCard() {
  const rows = [
    ["9:12 AM", "CPI comes in line with expectations"],
    ["9:05 AM", "Fed policy remains well-positioned"],
    ["8:58 AM", "Unusual call activity detected in NVDA"],
    ["8:45 AM", "Pre-market movers: MSTR, PLTR, GME"],
  ];

  return (
    <section className="card news">
      <div className="cardTitle purple">News & Alerts</div>
      {rows.map((r) => (
        <p className="newsLine" key={r[0]}>
          <b>{r[0]}</b> {r[1]}
        </p>
      ))}
      <a onClick={() => navigate("/news")} style={{ cursor: "pointer" }}>View All News →</a>
    </section>
  );
}

export function AcademyCard() {
  return (
    <section className="card academy full">
      <div className="course greenCourse">
        <GraduationCap />
        <div>
          <small>Beginner Course</small>
          <b>Learn Options Trading</b>
          <span><i style={{ width: "75%" }}></i></span>
        </div>
      </div>

      <div className="course purpleCourse">
        <Waves />
        <div>
          <small>Intermediate Course</small>
          <b>Gamma Exposure Mastery</b>
          <span><i style={{ width: "45%" }}></i></span>
        </div>
      </div>

      <div className="course goldCourse">
        <Crown />
        <div>
          <small>Advanced Course</small>
          <b>The TRQX System</b>
          <span><i style={{ width: "20%" }}></i></span>
        </div>
      </div>

      <div className="course greenCourse continue">
        <ExternalLink />
        <div>
          <small>Continue Learning</small>
          <b>Understanding Gamma</b>
        </div>
        <button onClick={() => navigate("/academy")}>Continue →</button>
      </div>
    </section>
  );
}





