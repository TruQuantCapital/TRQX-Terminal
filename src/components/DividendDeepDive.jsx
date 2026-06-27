import React, { useState } from "react";
import { X, Loader, TrendingUp, Shield, DollarSign, BarChart3, Users, Star } from "lucide-react";
import DividendDeepDive from "../components/DividendDeepDive";

const [deepDiveTicker, setDeepDiveTicker] = useState(null);
const API = "https://trqx-flow-scanner-production.up.railway.app";
const GOLD = "#d4af37";
const GOLD_DIM = "rgba(212,175,55,0.12)";
const GOLD_BORDER = "rgba(212,175,55,0.3)";
const CARD_BG = "rgba(255,255,255,0.04)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f5f1e8";
const MUTED = "#9ca3af";
const GREEN = "#22c55e";
const RED = "#ef4444";

function fmt(v, dec = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(dec) : "--";
}

function ScoreBar({ score, max = 100 }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const color = pct >= 70 ? GREEN : pct >= 50 ? GOLD : RED;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.8s ease" }} />
      </div>
      <span style={{ color, fontSize: "14px", fontWeight: "800", minWidth: "40px" }}>{Math.round(score)}</span>
    </div>
  );
}

function MetricRow({ label, value, color, note }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${CARD_BORDER}` }}>
      <div>
        <span style={{ color: TEXT, fontSize: "14px" }}>{label}</span>
        {note && <div style={{ color: MUTED, fontSize: "11px", marginTop: "2px" }}>{note}</div>}
      </div>
      <span style={{ color: color || TEXT, fontSize: "14px", fontWeight: "700" }}>{value}</span>
    </div>
  );
}

function Section({ icon: Icon, title, color, children }) {
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: "14px", padding: "24px", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <Icon size={18} color={color || GOLD} />
        <span style={{ color: color || GOLD, fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function DividendDeepDive({ ticker, onClose }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/api/research/profile/${ticker}`);
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setProfile(data);

        const prompt = `You are an institutional dividend analyst at TRQX Capital. Generate a comprehensive dividend investment report for ${ticker} (${data.name}).

Available Data:
- Price: $${fmt(data.price)}
- Market Cap: ${data.marketCap ? `$${(data.marketCap/1000).toFixed(1)}B` : "N/A"}
- Sector: ${data.industry || "N/A"}
- P/E Ratio: ${fmt(data.pe)}
- Forward P/E: ${fmt(data.forwardPE)}
- ROE: ${fmt(data.roe)}%
- Gross Margin: ${fmt(data.grossMargin)}%
- Net Margin: ${fmt(data.netMargin)}%
- Debt/Equity: ${fmt(data.debtEquity)}
- Current Ratio: ${fmt(data.currentRatio)}
- Revenue Growth YoY: ${fmt(data.revenueGrowthYoy)}%
- EPS Growth YoY: ${fmt(data.epsGrowthYoy)}%
- Dividend Yield: ${fmt(data.dividendYield)}%
- Beta: ${fmt(data.beta)}
- 52W High: $${fmt(data.week52High)}
- 52W Low: $${fmt(data.week52Low)}

Respond ONLY with a valid JSON object, no markdown, no explanation, exactly this structure:
{
  "moat": "Wide|Narrow|None",
  "moatExplanation": "2 sentence explanation",
  "dividendSafety": "Safe|Moderate|At Risk",
  "dividendSafetyExplanation": "2 sentence explanation",
  "yearsGrowthEstimate": "number as string or Unknown",
  "fcfCoverageEstimate": "Good|Moderate|Poor|Unknown",
  "debtLevel": "Low|Moderate|High",
  "interestCoverageEstimate": "Strong|Adequate|Weak|Unknown",
  "creditQuality": "Investment Grade|Speculative|Unknown",
  "peVsHistorical": "Undervalued|Fair|Overvalued",
  "dcfFairValue": "dollar amount as string",
  "marginOfSafety": "percentage as string with % sign",
  "fcfYieldEstimate": "percentage as string with % sign or Unknown",
  "insiderSentiment": "Buying|Neutral|Selling|Unknown",
  "institutionalOwnership": "High|Moderate|Low|Unknown",
  "capitalAllocation": "Excellent|Good|Poor",
  "moatScore": 0-25,
  "dividendSafetyScore": 0-25,
  "financialStrengthScore": 0-25,
  "valuationScore": 0-25,
  "overallScore": 0-100,
  "overallRating": "Strong Buy|Buy|Hold|Sell|Strong Sell",
  "summary": "3 sentence overall assessment for a dividend investor"
}`;

        const aiRes = await fetch(`${API}/api/market-intelligence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (!aiRes.ok) throw new Error("AI analysis failed");
        const aiData = await aiRes.json();
        const text = aiData.reply || "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setReport(parsed);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ticker]);

  const ratingColor = report?.overallRating?.includes("Buy") ? GREEN :
    report?.overallRating?.includes("Sell") ? RED : GOLD;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: "900px", background: "#0b1420", border: `1px solid ${GOLD_BORDER}`, borderRadius: "20px", padding: "32px", position: "relative" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <div style={{ color: GOLD, fontSize: "11px", fontWeight: "800", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>TRQX Dividend Deep Dive</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
              <span style={{ color: TEXT, fontSize: "36px", fontWeight: "900" }}>{ticker}</span>
              {profile && <span style={{ color: MUTED, fontSize: "18px" }}>{profile.name}</span>}
            </div>
            {profile && (
              <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                <span style={{ color: TEXT, fontSize: "24px", fontWeight: "800" }}>${fmt(profile.price)}</span>
                <span style={{ color: MUTED, fontSize: "14px" }}>{profile.industry}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${CARD_BORDER}`, borderRadius: "8px", padding: "10px", cursor: "pointer", color: TEXT }}>
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px", gap: "16px" }}>
            <Loader size={36} color={GOLD} />
            <span style={{ color: MUTED, fontSize: "16px" }}>Generating institutional dividend analysis...</span>
            <span style={{ color: MUTED, fontSize: "13px" }}>Analyzing moat, dividend safety, valuation, and financials</span>
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "20px", color: "#fca5a5" }}>
            Error: {error}
          </div>
        )}

        {report && profile && (
          <div>
            {/* Overall Score */}
            <div style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "16px", padding: "28px", marginBottom: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "center" }}>
                <div>
                  <div style={{ color: ratingColor, fontSize: "32px", fontWeight: "900", marginBottom: "8px" }}>{report.overallRating}</div>
                  <p style={{ color: TEXT, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>{report.summary}</p>
                </div>
                <div style={{ textAlign: "center", minWidth: "120px" }}>
                  <div style={{ color: ratingColor, fontSize: "56px", fontWeight: "900", lineHeight: 1 }}>{report.overallScore}</div>
                  <div style={{ color: MUTED, fontSize: "14px" }}>/100</div>
                  <div style={{ color: MUTED, fontSize: "12px", marginTop: "4px" }}>Overall Score</div>
                </div>
              </div>
            </div>

            {/* Score breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              {[
                { label: "Economic Moat", score: report.moatScore, max: 25 },
                { label: "Dividend Safety", score: report.dividendSafetyScore, max: 25 },
                { label: "Financial Strength", score: report.financialStrengthScore, max: 25 },
                { label: "Valuation", score: report.valuationScore, max: 25 },
              ].map((s, i) => (
                <div key={i} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: "12px", padding: "16px 20px" }}>
                  <div style={{ color: MUTED, fontSize: "12px", fontWeight: "700", textTransform: "uppercase", marginBottom: "10px" }}>{s.label}</div>
                  <ScoreBar score={s.score} max={s.max} />
                </div>
              ))}
            </div>

            {/* 1. Company Overview */}
            <Section icon={BarChart3} title="1. Company Overview">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
                <MetricRow label="Ticker" value={ticker} />
                <MetricRow label="Sector" value={profile.industry || "--"} />
                <MetricRow label="Market Cap" value={profile.marketCap ? `$${(profile.marketCap/1000).toFixed(1)}B` : "--"} />
                <MetricRow label="Current Price" value={`$${fmt(profile.price)}`} />
                <MetricRow label="52W Range" value={`$${fmt(profile.week52Low)} - $${fmt(profile.week52High)}`} />
                <MetricRow label="Beta" value={fmt(profile.beta)} note="Market sensitivity" />
              </div>
            </Section>

            {/* 2. Business Quality */}
            <Section icon={TrendingUp} title="2. Business Quality" color={GREEN}>
              <MetricRow label="Economic Moat" value={report.moat} color={report.moat === "Wide" ? GREEN : report.moat === "Narrow" ? GOLD : RED} />
              <div style={{ color: MUTED, fontSize: "13px", lineHeight: "1.5", padding: "8px 0 12px", borderBottom: `1px solid ${CARD_BORDER}` }}>{report.moatExplanation}</div>
              <MetricRow label="Revenue Growth (YoY)" value={profile.revenueGrowthYoy ? `${fmt(profile.revenueGrowthYoy)}%` : "--"} color={Number(profile.revenueGrowthYoy) > 0 ? GREEN : RED} />
              <MetricRow label="EPS Growth (YoY)" value={profile.epsGrowthYoy ? `${fmt(profile.epsGrowthYoy)}%` : "--"} color={Number(profile.epsGrowthYoy) > 0 ? GREEN : RED} />
              <MetricRow label="Return on Equity (ROE)" value={profile.roe ? `${fmt(profile.roe)}%` : "--"} color={Number(profile.roe) > 15 ? GREEN : MUTED} note="15%+ is strong" />
              <MetricRow label="Gross Margin" value={profile.grossMargin ? `${fmt(profile.grossMargin)}%` : "--"} color={Number(profile.grossMargin) > 40 ? GREEN : MUTED} />
              <MetricRow label="Net Margin" value={profile.netMargin ? `${fmt(profile.netMargin)}%` : "--"} color={Number(profile.netMargin) > 10 ? GREEN : MUTED} />
            </Section>

            {/* 3. Dividend Safety */}
            <Section icon={DollarSign} title="3. Dividend Safety" color={GOLD}>
              <MetricRow label="Dividend Yield" value={profile.dividendYield ? `${fmt(profile.dividendYield)}%` : "N/A"} color={Number(profile.dividendYield) >= 3 ? GREEN : MUTED} />
              <MetricRow label="Dividend Safety Rating" value={report.dividendSafety} color={report.dividendSafety === "Safe" ? GREEN : report.dividendSafety === "Moderate" ? GOLD : RED} />
              <div style={{ color: MUTED, fontSize: "13px", lineHeight: "1.5", padding: "8px 0 12px", borderBottom: `1px solid ${CARD_BORDER}` }}>{report.dividendSafetyExplanation}</div>
              <MetricRow label="Payout Ratio" value={profile.payoutRatio ? `${fmt(profile.payoutRatio)}%` : "--"} color={Number(profile.payoutRatio) < 60 ? GREEN : Number(profile.payoutRatio) < 80 ? GOLD : RED} note="Under 60% is ideal" />
              <MetricRow label="FCF Coverage (AI Est.)" value={report.fcfCoverageEstimate} color={report.fcfCoverageEstimate === "Good" ? GREEN : report.fcfCoverageEstimate === "Moderate" ? GOLD : RED} />
              <MetricRow label="Years of Dividend Growth" value={report.yearsGrowthEstimate} color={GREEN} note="AI estimate based on company profile" />
            </Section>

            {/* 4. Financial Strength */}
            <Section icon={Shield} title="4. Financial Strength" color="#3b82f6">
              <MetricRow label="Debt / Equity" value={fmt(profile.debtEquity)} color={Number(profile.debtEquity) < 1 ? GREEN : Number(profile.debtEquity) < 2 ? GOLD : RED} note="Under 1x is conservative" />
              <MetricRow label="Debt Level (AI Est.)" value={report.debtLevel} color={report.debtLevel === "Low" ? GREEN : report.debtLevel === "Moderate" ? GOLD : RED} />
              <MetricRow label="Interest Coverage (AI Est.)" value={report.interestCoverageEstimate} color={report.interestCoverageEstimate === "Strong" ? GREEN : report.interestCoverageEstimate === "Adequate" ? GOLD : RED} />
              <MetricRow label="Current Ratio" value={fmt(profile.currentRatio)} color={Number(profile.currentRatio) > 1.5 ? GREEN : MUTED} note="Above 1.5 is healthy" />
              <MetricRow label="Credit Quality (AI Est.)" value={report.creditQuality} color={report.creditQuality === "Investment Grade" ? GREEN : GOLD} />
            </Section>

            {/* 5. Valuation */}
            <Section icon={Star} title="5. Valuation" color="#a78bfa">
              <MetricRow label="P/E Ratio" value={fmt(profile.pe)} />
              <MetricRow label="Forward P/E" value={fmt(profile.forwardPE)} />
              <MetricRow label="P/E vs Historical" value={report.peVsHistorical} color={report.peVsHistorical === "Undervalued" ? GREEN : report.peVsHistorical === "Overvalued" ? RED : GOLD} />
              <MetricRow label="FCF Yield (AI Est.)" value={report.fcfYieldEstimate} color={GREEN} />
              <MetricRow label="DCF Fair Value (AI Est.)" value={report.dcfFairValue} color={GREEN} note="Based on growth & margins" />
              <MetricRow label="Margin of Safety" value={report.marginOfSafety} color={GREEN} note="Discount to estimated fair value" />
            </Section>

            {/* 6. Management & Ownership */}
            <Section icon={Users} title="6. Management & Ownership" color={MUTED}>
              <MetricRow label="Insider Sentiment (AI Est.)" value={report.insiderSentiment} color={report.insiderSentiment === "Buying" ? GREEN : report.insiderSentiment === "Selling" ? RED : MUTED} />
              <MetricRow label="Institutional Ownership" value={report.institutionalOwnership} color={report.institutionalOwnership === "High" ? GREEN : MUTED} />
              <MetricRow label="Capital Allocation" value={report.capitalAllocation} color={report.capitalAllocation === "Excellent" ? GREEN : report.capitalAllocation === "Good" ? GOLD : RED} />
            </Section>

            {/* Disclaimer */}
            <div style={{ padding: "14px 20px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", textAlign: "center" }}>
              <span style={{ color: MUTED, fontSize: "12px" }}>⚠️ AI estimates are based on available financial data and historical patterns. Not financial advice. Always verify with primary sources before investing.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
