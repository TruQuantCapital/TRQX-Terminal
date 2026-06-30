import React, { useState, useEffect } from "react";
import { Search, TrendingUp, DollarSign, Calendar, BarChart3, X, Loader, Shield, Star, Users } from "lucide-react";
import PageChatWidget from "../components/PageChatWidget";

const API = "https://trqx-flow-scanner-production.up.railway.app";
const GOLD = "#d4af37";
const GOLD_DIM = "rgba(212,175,55,0.12)";
const GOLD_BORDER = "rgba(212,175,55,0.3)";
const CARD_BG = "rgba(255,255,255,0.03)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f5f1e8";
const MUTED = "#9ca3af";
const GREEN = "#22c55e";
const RED = "#ef4444";

const CURATED_DIVIDENDS = [
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { ticker: "KO", name: "Coca-Cola", sector: "Consumer Staples" },
  { ticker: "PG", name: "Procter & Gamble", sector: "Consumer Staples" },
  { ticker: "MMM", name: "3M Company", sector: "Industrials" },
  { ticker: "T", name: "AT&T", sector: "Telecom" },
  { ticker: "VZ", name: "Verizon", sector: "Telecom" },
  { ticker: "XOM", name: "ExxonMobil", sector: "Energy" },
  { ticker: "CVX", name: "Chevron", sector: "Energy" },
  { ticker: "ABBV", name: "AbbVie", sector: "Healthcare" },
  { ticker: "MO", name: "Altria Group", sector: "Consumer Staples" },
  { ticker: "O", name: "Realty Income", sector: "REIT" },
  { ticker: "MAIN", name: "Main Street Capital", sector: "Finance" },
  { ticker: "AAPL", name: "Apple", sector: "Technology" },
  { ticker: "MSFT", name: "Microsoft", sector: "Technology" },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Finance" },
  { ticker: "BAC", name: "Bank of America", sector: "Finance" },
  { ticker: "WMT", name: "Walmart", sector: "Consumer Staples" },
  { ticker: "HD", name: "Home Depot", sector: "Consumer Discretionary" },
  { ticker: "MDT", name: "Medtronic", sector: "Healthcare" },
  { ticker: "PFE", name: "Pfizer", sector: "Healthcare" },
  { ticker: "PM", name: "Philip Morris", sector: "Consumer Staples" },
  { ticker: "LMT", name: "Lockheed Martin", sector: "Defense" },
  { ticker: "GIS", name: "General Mills", sector: "Consumer Staples" },
  { ticker: "NEE", name: "NextEra Energy", sector: "Utilities" },
  { ticker: "DUK", name: "Duke Energy", sector: "Utilities" },
];

const SECTORS = ["All", "Healthcare", "Consumer Staples", "Technology", "Finance", "Energy", "Telecom", "REIT", "Utilities", "Industrials", "Defense", "Consumer Discretionary"];

function fmt(v, dec = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(dec) : "--";
}

function yieldColor(y) {
  const n = Number(y);
  if (!Number.isFinite(n)) return MUTED;
  if (n >= 5) return GREEN;
  if (n >= 3) return GOLD;
  return TEXT;
}

// ── Score Bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score, max = 25 }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const color = pct >= 70 ? GREEN : pct >= 50 ? GOLD : RED;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "4px" }} />
      </div>
      <span style={{ color, fontSize: "13px", fontWeight: "800", minWidth: "32px" }}>{Math.round(score)}</span>
    </div>
  );
}

// ── Metric Row ────────────────────────────────────────────────────────────────
function MetricRow({ label, value, color, note }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${CARD_BORDER}` }}>
      <div>
        <span style={{ color: TEXT, fontSize: "14px" }}>{label}</span>
        {note && <div style={{ color: MUTED, fontSize: "11px", marginTop: "2px" }}>{note}</div>}
      </div>
      <span style={{ color: color || TEXT, fontSize: "14px", fontWeight: "700" }}>{value}</span>
    </div>
  );
}

// ── Report Section ────────────────────────────────────────────────────────────
function ReportSection({ icon: Icon, title, color, children }) {
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: "14px", padding: "22px", marginBottom: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <Icon size={16} color={color || GOLD} />
        <span style={{ color: color || GOLD, fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

// ── Dividend Deep Dive Modal ──────────────────────────────────────────────────
function DividendDeepDive({ ticker, onClose }) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/research/profile/${ticker}`);
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setProfile(data);

        const prompt = `You are an institutional dividend analyst at TRQX Capital. Generate a comprehensive dividend investment report for ${ticker} (${data.name}).

Available Data:
- Price: $${fmt(data.price)}, Market Cap: ${data.marketCap ? `$${(data.marketCap/1000).toFixed(1)}B` : "N/A"}
- Sector: ${data.industry || "N/A"}, P/E: ${fmt(data.pe)}, Forward P/E: ${fmt(data.forwardPE)}
- ROE: ${fmt(data.roe)}%, Gross Margin: ${fmt(data.grossMargin)}%, Net Margin: ${fmt(data.netMargin)}%
- Debt/Equity: ${fmt(data.debtEquity)}, Current Ratio: ${fmt(data.currentRatio)}
- Revenue Growth YoY: ${fmt(data.revenueGrowthYoy)}%, EPS Growth YoY: ${fmt(data.epsGrowthYoy)}%
- Dividend Yield: ${fmt(data.dividendYield)}%, Beta: ${fmt(data.beta)}
- 52W High: $${fmt(data.week52High)}, 52W Low: $${fmt(data.week52Low)}

Respond ONLY with valid JSON, no markdown, no explanation:
{"moat":"Wide|Narrow|None","moatExplanation":"2 sentences","dividendSafety":"Safe|Moderate|At Risk","dividendSafetyExplanation":"2 sentences","yearsGrowthEstimate":"number or Unknown","fcfCoverageEstimate":"Good|Moderate|Poor|Unknown","debtLevel":"Low|Moderate|High","interestCoverageEstimate":"Strong|Adequate|Weak|Unknown","creditQuality":"Investment Grade|Speculative|Unknown","peVsHistorical":"Undervalued|Fair|Overvalued","dcfFairValue":"$XX.XX","marginOfSafety":"XX%","fcfYieldEstimate":"XX%","insiderSentiment":"Buying|Neutral|Selling|Unknown","institutionalOwnership":"High|Moderate|Low|Unknown","capitalAllocation":"Excellent|Good|Poor","moatScore":0,"dividendSafetyScore":0,"financialStrengthScore":0,"valuationScore":0,"overallScore":0,"overallRating":"Strong Buy|Buy|Hold|Sell|Strong Sell","summary":"3 sentence assessment"}`;

        const aiRes = await fetch(`${API}/api/market-intelligence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const aiData = aiRes.ok ? await aiRes.json() : {};
        let text = (aiData.reply || "").replace(/```json|```/g, "").trim();

        // Extract just the JSON object in case there's extra text before/after
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];

        // Strip trailing commas which break JSON.parse
        text = text.replace(/,(\s*[}\]])/g, "$1");

        try {
          setReport(JSON.parse(text));
        } catch (parseErr) {
          console.error("[DividendDeepDive] JSON parse failed:", parseErr.message, "Raw text:", text);
          throw new Error("The AI report had a formatting issue. Please try again.");
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ticker]);

  const ratingColor = report?.overallRating?.includes("Buy") ? GREEN : report?.overallRating?.includes("Sell") ? RED : GOLD;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 2000, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "40px 20px" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: "860px", background: "#0b1420", border: `1px solid ${GOLD_BORDER}`, borderRadius: "20px", padding: "32px", position: "relative" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <div style={{ color: GOLD, fontSize: "10px", fontWeight: "800", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>TRQX Dividend Deep Dive</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
              <span style={{ color: TEXT, fontSize: "32px", fontWeight: "900" }}>{ticker}</span>
              {profile && <span style={{ color: MUTED, fontSize: "16px" }}>{profile.name}</span>}
            </div>
            {profile && <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}><span style={{ color: TEXT, fontSize: "20px", fontWeight: "800" }}>${fmt(profile.price)}</span><span style={{ color: MUTED, fontSize: "14px" }}>{profile.industry}</span></div>}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${CARD_BORDER}`, borderRadius: "8px", padding: "10px", cursor: "pointer", color: TEXT }}>
            <X size={18} />
          </button>
        </div>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px", gap: "14px" }}>
            <Loader size={32} color={GOLD} />
            <span style={{ color: MUTED, fontSize: "15px" }}>Generating institutional dividend analysis...</span>
            <span style={{ color: MUTED, fontSize: "12px" }}>Analyzing moat, dividend safety, valuation, and financials</span>
          </div>
        )}

        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "20px", color: "#fca5a5" }}>Error: {error}</div>}

        {report && profile && (
          <div>
            {/* Overall */}
            <div style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "14px", padding: "24px", marginBottom: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "center" }}>
                <div>
                  <div style={{ color: ratingColor, fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>{report.overallRating}</div>
                  <p style={{ color: TEXT, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>{report.summary}</p>
                </div>
                <div style={{ textAlign: "center", minWidth: "100px" }}>
                  <div style={{ color: ratingColor, fontSize: "48px", fontWeight: "900", lineHeight: 1 }}>{report.overallScore}</div>
                  <div style={{ color: MUTED, fontSize: "13px" }}>/100</div>
                </div>
              </div>
            </div>

            {/* Score breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {[
                { label: "Economic Moat", score: report.moatScore },
                { label: "Dividend Safety", score: report.dividendSafetyScore },
                { label: "Financial Strength", score: report.financialStrengthScore },
                { label: "Valuation", score: report.valuationScore },
              ].map((s, i) => (
                <div key={i} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: "10px", padding: "14px 18px" }}>
                  <div style={{ color: MUTED, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>{s.label}</div>
                  <ScoreBar score={s.score} />
                </div>
              ))}
            </div>

            {/* 1. Company Overview */}
            <ReportSection icon={BarChart3} title="1. Company Overview">
              <MetricRow label="Ticker" value={ticker} />
              <MetricRow label="Sector" value={profile.industry || "--"} />
              <MetricRow label="Market Cap" value={profile.marketCap ? `$${(profile.marketCap/1000).toFixed(1)}B` : "--"} />
              <MetricRow label="Price" value={`$${fmt(profile.price)}`} />
              <MetricRow label="52W Range" value={`$${fmt(profile.week52Low)} - $${fmt(profile.week52High)}`} />
              <MetricRow label="Beta" value={fmt(profile.beta)} note="Volatility vs market" />
            </ReportSection>

            {/* 2. Business Quality */}
            <ReportSection icon={TrendingUp} title="2. Business Quality" color={GREEN}>
              <MetricRow label="Economic Moat" value={report.moat} color={report.moat === "Wide" ? GREEN : report.moat === "Narrow" ? GOLD : RED} />
              <div style={{ color: MUTED, fontSize: "13px", lineHeight: "1.5", padding: "8px 0 12px", borderBottom: `1px solid ${CARD_BORDER}` }}>{report.moatExplanation}</div>
              <MetricRow label="Revenue Growth (YoY)" value={profile.revenueGrowthYoy ? `${fmt(profile.revenueGrowthYoy)}%` : "--"} color={Number(profile.revenueGrowthYoy) > 0 ? GREEN : RED} />
              <MetricRow label="EPS Growth (YoY)" value={profile.epsGrowthYoy ? `${fmt(profile.epsGrowthYoy)}%` : "--"} color={Number(profile.epsGrowthYoy) > 0 ? GREEN : RED} />
              <MetricRow label="ROE" value={profile.roe ? `${fmt(profile.roe)}%` : "--"} color={Number(profile.roe) > 15 ? GREEN : MUTED} note="15%+ is strong" />
              <MetricRow label="Gross Margin" value={profile.grossMargin ? `${fmt(profile.grossMargin)}%` : "--"} color={Number(profile.grossMargin) > 40 ? GREEN : MUTED} />
              <MetricRow label="Net Margin" value={profile.netMargin ? `${fmt(profile.netMargin)}%` : "--"} color={Number(profile.netMargin) > 10 ? GREEN : MUTED} />
            </ReportSection>

            {/* 3. Dividend Safety */}
            <ReportSection icon={DollarSign} title="3. Dividend Safety" color={GOLD}>
              <MetricRow label="Dividend Yield" value={profile.dividendYield ? `${fmt(profile.dividendYield)}%` : "N/A"} color={Number(profile.dividendYield) >= 3 ? GREEN : MUTED} />
              <MetricRow label="Safety Rating" value={report.dividendSafety} color={report.dividendSafety === "Safe" ? GREEN : report.dividendSafety === "Moderate" ? GOLD : RED} />
              <div style={{ color: MUTED, fontSize: "13px", lineHeight: "1.5", padding: "8px 0 12px", borderBottom: `1px solid ${CARD_BORDER}` }}>{report.dividendSafetyExplanation}</div>
              <MetricRow label="FCF Coverage (AI Est.)" value={report.fcfCoverageEstimate} color={report.fcfCoverageEstimate === "Good" ? GREEN : report.fcfCoverageEstimate === "Moderate" ? GOLD : RED} />
              <MetricRow label="Years of Dividend Growth" value={report.yearsGrowthEstimate} color={GREEN} note="AI estimate" />
            </ReportSection>

            {/* 4. Financial Strength */}
            <ReportSection icon={Shield} title="4. Financial Strength" color="#3b82f6">
              <MetricRow label="Debt / Equity" value={fmt(profile.debtEquity)} color={Number(profile.debtEquity) < 1 ? GREEN : Number(profile.debtEquity) < 2 ? GOLD : RED} note="Under 1x is conservative" />
              <MetricRow label="Debt Level (AI Est.)" value={report.debtLevel} color={report.debtLevel === "Low" ? GREEN : report.debtLevel === "Moderate" ? GOLD : RED} />
              <MetricRow label="Interest Coverage (AI Est.)" value={report.interestCoverageEstimate} color={report.interestCoverageEstimate === "Strong" ? GREEN : GOLD} />
              <MetricRow label="Current Ratio" value={fmt(profile.currentRatio)} color={Number(profile.currentRatio) > 1.5 ? GREEN : MUTED} />
              <MetricRow label="Credit Quality (AI Est.)" value={report.creditQuality} color={report.creditQuality === "Investment Grade" ? GREEN : GOLD} />
            </ReportSection>

            {/* 5. Valuation */}
            <ReportSection icon={Star} title="5. Valuation" color="#a78bfa">
              <MetricRow label="P/E Ratio" value={fmt(profile.pe)} />
              <MetricRow label="Forward P/E" value={fmt(profile.forwardPE)} />
              <MetricRow label="P/E vs Historical" value={report.peVsHistorical} color={report.peVsHistorical === "Undervalued" ? GREEN : report.peVsHistorical === "Overvalued" ? RED : GOLD} />
              <MetricRow label="FCF Yield (AI Est.)" value={report.fcfYieldEstimate} color={GREEN} />
              <MetricRow label="DCF Fair Value (AI Est.)" value={report.dcfFairValue} color={GREEN} />
              <MetricRow label="Margin of Safety" value={report.marginOfSafety} color={GREEN} />
            </ReportSection>

            {/* 6. Management */}
            <ReportSection icon={Users} title="6. Management & Ownership" color={MUTED}>
              <MetricRow label="Insider Sentiment (AI Est.)" value={report.insiderSentiment} color={report.insiderSentiment === "Buying" ? GREEN : report.insiderSentiment === "Selling" ? RED : MUTED} />
              <MetricRow label="Institutional Ownership" value={report.institutionalOwnership} color={report.institutionalOwnership === "High" ? GREEN : MUTED} />
              <MetricRow label="Capital Allocation" value={report.capitalAllocation} color={report.capitalAllocation === "Excellent" ? GREEN : report.capitalAllocation === "Good" ? GOLD : RED} />
            </ReportSection>

            <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ color: MUTED, fontSize: "11px" }}>AI estimates based on available data. Not financial advice. Always verify before investing.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DividendPage() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sector, setSector] = useState("All");
  const [sortBy, setSortBy] = useState("yield");
  const [liveData, setLiveData] = useState({});
  const [loadingLive, setLoadingLive] = useState(true);
  const [deepDiveTicker, setDeepDiveTicker] = useState(null);

  useEffect(() => {
    async function loadLive() {
      setLoadingLive(true);
      const results = {};
      await Promise.allSettled(
        CURATED_DIVIDENDS.map(async (s) => {
          try {
            const res = await fetch(`${API}/api/research/profile/${s.ticker}`);
            if (res.ok) {
              const data = await res.json();
              results[s.ticker] = {
                yield: data.dividendYield || null,
                price: data.price || null,
                pe: data.pe || null,
                annualDividend: data.annualDividend || null,
                payoutRatio: data.payoutRatio || null,
                dividendGrowth: data.dividendGrowth || null,
              };
            }
          } catch {}
        })
      );
      setLiveData(results);
      setLoadingLive(false);
    }
    loadLive();
  }, []);

  async function handleSearch() {
    if (!search.trim()) return;
    const sym = search.trim().toUpperCase();
    setSearchLoading(true);
    setSearchResult(null);
    try {
      const res = await fetch(`${API}/api/research/profile/${sym}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResult({ ticker: sym, ...data });
      } else {
        setSearchResult({ error: "Stock not found" });
      }
    } catch {
      setSearchResult({ error: "Failed to load stock data" });
    }
    setSearchLoading(false);
  }

  const validYields = Object.values(liveData).filter(d => d.yield && Number(d.yield) < 100);
  const avgYield = validYields.length > 0 ? validYields.reduce((s, d) => s + Number(d.yield), 0) / validYields.length : 0;
  const highYieldCount = validYields.filter(d => Number(d.yield) >= 5).length;

  const filteredStocks = CURATED_DIVIDENDS
    .filter(s => sector === "All" || s.sector === sector)
    .map(s => ({ ...s, ...(liveData[s.ticker] || {}) }))
    .sort((a, b) => {
      if (sortBy === "yield") return (Number(b.yield) || 0) - (Number(a.yield) || 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "sector") return a.sector.localeCompare(b.sector);
      return 0;
    });

  return (
    <main className="pageStack">
      <section className="pageHeader">
        <div>
          <p>TRQX MODULE</p>
          <h1>Dividend Stocks</h1>
          <span>Curated dividend-paying stocks with live yields, payout data, and AI deep dive reports.</span>
        </div>
        <div className="flowProviderBadge">
          <span className="liveDot"></span>
          LIVE YIELDS
        </div>
      </section>

      {/* Search */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "14px", background: "rgba(255,255,255,0.05)", border: `1px solid ${CARD_BORDER}`, borderRadius: "12px", padding: "14px 20px" }}>
          <Search size={18} color={MUTED} />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search any dividend stock... (e.g. SCHD, VYM, JEPI)"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: TEXT, fontSize: "15px" }} />
        </div>
        <button onClick={handleSearch} disabled={searchLoading || !search.trim()}
          style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "12px", padding: "14px 28px", color: GOLD, fontSize: "14px", fontWeight: "800", cursor: "pointer", opacity: searchLoading ? 0.6 : 1 }}>
          {searchLoading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Search Result */}
      {searchResult && (
        <div style={{ background: CARD_BG, border: `1px solid ${searchResult.error ? "rgba(239,68,68,0.3)" : GOLD_BORDER}`, borderRadius: "14px", padding: "24px", marginBottom: "24px" }}>
          {searchResult.error ? (
            <p style={{ color: RED, margin: 0 }}>{searchResult.error}</p>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "10px" }}>
                  <span style={{ color: TEXT, fontSize: "22px", fontWeight: "900" }}>{searchResult.ticker}</span>
                  <span style={{ color: MUTED, fontSize: "15px" }}>{searchResult.name}</span>
                </div>
                <div style={{ display: "flex", gap: "28px" }}>
                  <div>
                    <div style={{ color: MUTED, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Dividend Yield</div>
                    <div style={{ color: yieldColor(searchResult.dividendYield), fontSize: "26px", fontWeight: "900" }}>{searchResult.dividendYield ? `${fmt(searchResult.dividendYield)}%` : "N/A"}</div>
                  </div>
                  <div>
                    <div style={{ color: MUTED, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Price</div>
                    <div style={{ color: TEXT, fontSize: "26px", fontWeight: "900" }}>${fmt(searchResult.price)}</div>
                  </div>
                  <div>
                    <div style={{ color: MUTED, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Sector</div>
                    <div style={{ color: TEXT, fontSize: "16px", fontWeight: "700" }}>{searchResult.industry || "--"}</div>
                  </div>
                </div>
              </div>
              <button onClick={() => setDeepDiveTicker(searchResult.ticker)}
                style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "10px", padding: "12px 24px", color: GOLD, fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
                Deep Dive Report →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1 }}>
          {SECTORS.map(s => (
            <button key={s} onClick={() => setSector(s)} style={{ background: sector === s ? GOLD_DIM : "rgba(255,255,255,0.03)", border: `1px solid ${sector === s ? GOLD_BORDER : CARD_BORDER}`, borderRadius: "8px", padding: "6px 14px", color: sector === s ? GOLD : MUTED, fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>{s}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${CARD_BORDER}`, borderRadius: "8px", padding: "8px 14px", color: TEXT, fontSize: "13px", outline: "none", cursor: "pointer" }}>
          <option value="yield">Sort: Yield ↓</option>
          <option value="name">Sort: Name A-Z</option>
          <option value="sector">Sort: Sector</option>
        </select>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Stocks Tracked", value: CURATED_DIVIDENDS.length, icon: BarChart3, color: GOLD },
          { label: "Avg Yield", value: loadingLive ? "..." : `${fmt(avgYield)}%`, icon: TrendingUp, color: GREEN },
          { label: "High Yield (5%+)", value: loadingLive ? "..." : highYieldCount, icon: DollarSign, color: GREEN },
          { label: "Sectors Covered", value: SECTORS.length - 1, icon: Calendar, color: GOLD },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: "12px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <Icon size={16} color={stat.color} />
                <span style={{ color: MUTED, fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>{stat.label}</span>
              </div>
              <div style={{ color: stat.color, fontSize: "28px", fontWeight: "900" }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: "14px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
              {["Ticker", "Company", "Sector", "Div Yield", "Annual Div", "Payout Ratio", "5Y Growth", "Price", "Deep Dive"].map(h => (
                <th key={h} style={{ color: MUTED, fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", padding: "16px 20px", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => {
              const live = liveData[stock.ticker];
              return (
                <tr key={stock.ticker} style={{ borderBottom: `1px solid ${CARD_BORDER}` }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "16px 20px" }}><span style={{ color: GOLD, fontSize: "15px", fontWeight: "800" }}>{stock.ticker}</span></td>
                  <td style={{ padding: "16px 20px" }}><span style={{ color: TEXT, fontSize: "14px", fontWeight: "600" }}>{stock.name}</span></td>
                  <td style={{ padding: "16px 20px" }}><span style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${CARD_BORDER}`, borderRadius: "6px", padding: "4px 10px", color: MUTED, fontSize: "12px", fontWeight: "600" }}>{stock.sector}</span></td>
                  <td style={{ padding: "16px 20px" }}>
                    {loadingLive ? <span style={{ color: MUTED, fontSize: "13px" }}>...</span> :
                      <span style={{ color: yieldColor(live?.yield), fontSize: "17px", fontWeight: "800" }}>{live?.yield && Number(live.yield) < 100 ? `${fmt(live.yield)}%` : "N/A"}</span>}
                  </td>
                  <td style={{ padding: "16px 20px" }}><span style={{ color: TEXT, fontSize: "14px", fontWeight: "700" }}>{live?.annualDividend ? `$${fmt(live.annualDividend)}` : "--"}</span></td>
                  <td style={{ padding: "16px 20px" }}>
                    {live?.payoutRatio ? <span style={{ color: Number(live.payoutRatio) > 80 ? RED : Number(live.payoutRatio) > 60 ? GOLD : GREEN, fontSize: "14px", fontWeight: "700" }}>{fmt(live.payoutRatio)}%</span>
                      : <span style={{ color: MUTED }}>--</span>}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    {live?.dividendGrowth ? <span style={{ color: Number(live.dividendGrowth) > 0 ? GREEN : RED, fontSize: "14px", fontWeight: "700" }}>{Number(live.dividendGrowth) > 0 ? "+" : ""}{fmt(live.dividendGrowth)}%</span>
                      : <span style={{ color: MUTED }}>--</span>}
                  </td>
                  <td style={{ padding: "16px 20px" }}><span style={{ color: TEXT, fontSize: "14px", fontWeight: "600" }}>{live?.price ? `$${fmt(live.price)}` : "--"}</span></td>
                  <td style={{ padding: "16px 20px" }}>
                    <button onClick={() => setDeepDiveTicker(stock.ticker)}
                      style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "8px", padding: "8px 16px", color: GOLD, fontSize: "12px", fontWeight: "800", cursor: "pointer", whiteSpace: "nowrap" }}>
                      Deep Dive →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px", padding: "14px 20px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", textAlign: "center" }}>
        <span style={{ color: MUTED, fontSize: "12px" }}>Dividend yields are live estimates. Always verify current data before investing. This is not financial advice.</span>
      </div>

      {deepDiveTicker && <DividendDeepDive ticker={deepDiveTicker} onClose={() => setDeepDiveTicker(null)} />}

      <PageChatWidget context="The user is browsing dividend stocks with live yields and AI deep dive reports." placeholder="Ask me about dividend investing, yield comparison, or any stock on this list." />
    </main>
  );
}
