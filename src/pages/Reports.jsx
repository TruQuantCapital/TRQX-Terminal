import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const API = import.meta.env.VITE_API_URL || "https://trqx-flow-scanner-production.up.railway.app";

function fmtPrem(v) {
  if (!v) return "$0";
  if (v >= 1_000_000) return `$${(v/1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v/1_000).toFixed(0)}K`;
  return `$${v}`;
}

export default function Reports() {
  const { token, tier } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasReports = ["pro", "elite"].includes(tier);

  useEffect(() => {
    if (!hasReports) { setLoading(false); return; }
    fetch(`${API}/api/reports/latest`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setReport(data); setLoading(false); })
      .catch(() => { setError("Failed to load report"); setLoading(false); });
  }, [token, tier]);

  if (!hasReports) return (
    <div className="reports-page">
      <div className="reports-locked">
        <div className="locked-icon-large">📊</div>
        <h2>Hourly Market Reports</h2>
        <p>Every hour, TRQX AI analyzes millions of options trades to generate comprehensive market intelligence reports.</p>
        <ul className="reports-features">
          <li>📈 Top market movers with sentiment analysis</li>
          <li>🎯 Unusual activity patterns flagged automatically</li>
          <li>💡 Key insights distilled into actionable summaries</li>
        </ul>
        <a href="/pricing" className="upgrade-btn">Upgrade to Pro →</a>
      </div>
    </div>
  );

  if (loading) return <div className="reports-page"><div className="reports-loading">Generating market intelligence report...</div></div>;
  if (error)   return <div className="reports-page"><div className="reports-error">{error}</div></div>;
  if (!report) return <div className="reports-page"><div className="reports-loading">No reports yet. Check back after market open.</div></div>;

  const sections = report.content?.split(/\n\n/).filter(Boolean) || [];

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div className="reports-title">📊 TRQX MARKET INTELLIGENCE REPORT</div>
        <div className="reports-meta">
          <span className="reports-time">Generated: {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : "—"}</span>
          <span className="reports-badge">AI POWERED</span>
        </div>
      </div>

      {/* Quick Stats */}
      {report.stats && (
        <div className="reports-stats">
          <div className={`rs-stat ${report.stats.sentiment?.toLowerCase()}`}>
            <div className="rs-label">OVERALL FLOW</div>
            <div className="rs-value">{report.stats.sentiment}</div>
          </div>
          <div className="rs-stat">
            <div className="rs-label">CALL PREMIUM</div>
            <div className="rs-value bullish">{fmtPrem(report.stats.callPremium)}</div>
          </div>
          <div className="rs-stat">
            <div className="rs-label">PUT PREMIUM</div>
            <div className="rs-value bearish">{fmtPrem(report.stats.putPremium)}</div>
          </div>
          <div className="rs-stat">
            <div className="rs-label">CALL/PUT RATIO</div>
            <div className="rs-value">{report.stats.ratio}</div>
          </div>
          <div className="rs-stat">
            <div className="rs-label">SWEEPS</div>
            <div className="rs-value gold">{report.stats.sweepCount}</div>
          </div>
          <div className="rs-stat">
            <div className="rs-label">BLOCKS</div>
            <div className="rs-value purple">{report.stats.blockCount}</div>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className="reports-content">
        {sections.map((section, i) => {
          const lines = section.split("\n");
          const title = lines[0];
          const body = lines.slice(1).join("\n");
          return (
            <div key={i} className="report-section">
              <div className="report-section-title">{title}</div>
              <div className="report-section-body">{body}</div>
            </div>
          );
        })}
      </div>

      {/* Top Contracts from report */}
      {report.topContracts?.length > 0 && (
        <div className="reports-contracts">
          <div className="reports-contracts-title">🏆 TOP CONTRACTS THIS PERIOD</div>
          <div className="reports-contracts-grid">
            {report.topContracts.map((c, i) => (
              <div key={i} className={`rc-card ${c.type === "C" ? "rc-call" : "rc-put"}`}>
                <div className="rc-rank">#{i+1}</div>
                <div className="rc-ticker">{c.ticker}</div>
                <div className="rc-contract">${c.strike} {c.type === "C" ? "CALL" : "PUT"}</div>
                <div className="rc-exp">{c.expStr}</div>
                <div className="rc-prem">{fmtPrem(c.premium)}</div>
                {c.tradeCount && <div className="rc-trades">{c.tradeCount} trades</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
