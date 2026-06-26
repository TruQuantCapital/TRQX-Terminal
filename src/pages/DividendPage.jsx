import React, { useState, useEffect } from "react";
import { Search, TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";
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
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "KO", name: "Coca-Cola", sector: "Consumer Staples", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "PG", name: "Procter & Gamble", sector: "Consumer Staples", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "MMM", name: "3M Company", sector: "Industrials", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "T", name: "AT&T", sector: "Telecom", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "VZ", name: "Verizon", sector: "Telecom", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "XOM", name: "ExxonMobil", sector: "Energy", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "CVX", name: "Chevron", sector: "Energy", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "ABBV", name: "AbbVie", sector: "Healthcare", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "MO", name: "Altria Group", sector: "Consumer Staples", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "O", name: "Realty Income", sector: "REIT", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "MAIN", name: "Main Street Capital", sector: "Finance", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "AAPL", name: "Apple", sector: "Technology", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "MSFT", name: "Microsoft", sector: "Technology", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Finance", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "BAC", name: "Bank of America", sector: "Finance", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "WMT", name: "Walmart", sector: "Consumer Staples", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "HD", name: "Home Depot", sector: "Consumer Discretionary", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "MDT", name: "Medtronic", sector: "Healthcare", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "PFE", name: "Pfizer", sector: "Healthcare", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "PM", name: "Philip Morris", sector: "Consumer Staples", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "LMT", name: "Lockheed Martin", sector: "Defense", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "GIS", name: "General Mills", sector: "Consumer Staples", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "NEE", name: "NextEra Energy", sector: "Utilities", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
  { ticker: "DUK", name: "Duke Energy", sector: "Utilities", yield: null, annualDiv: null, payoutRatio: null, exDate: null },
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

export default function DividendPage() {
  const [stocks, setStocks] = useState(CURATED_DIVIDENDS);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sector, setSector] = useState("All");
  const [sortBy, setSortBy] = useState("yield");
  const [liveData, setLiveData] = useState({});
  const [loadingLive, setLoadingLive] = useState(true);
  const [navigate, setNavigate] = useState(null);

  // Load live data for curated stocks
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
                exDividendDate: data.exDividendDate || null,
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

  const filteredStocks = stocks
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
          <span>Curated dividend-paying stocks with live yields, payout data, and AI research.</span>
        </div>
        <div className="flowProviderBadge">
          <span className="liveDot"></span>
          LIVE YIELDS
        </div>
      </section>

      {/* Search Bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "14px", background: "rgba(255,255,255,0.05)", border: `1px solid ${CARD_BORDER}`, borderRadius: "12px", padding: "14px 20px" }}>
          <Search size={18} color={MUTED} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search any dividend stock... (e.g. SCHD, VYM, JEPI)"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: TEXT, fontSize: "15px" }}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searchLoading || !search.trim()}
          style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "12px", padding: "14px 28px", color: GOLD, fontSize: "14px", fontWeight: "800", cursor: "pointer", opacity: searchLoading ? 0.6 : 1 }}
        >
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
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ color: TEXT, fontSize: "24px", fontWeight: "900" }}>{searchResult.ticker}</span>
                  <span style={{ color: MUTED, fontSize: "16px" }}>{searchResult.name}</span>
                </div>
                <div style={{ display: "flex", gap: "24px" }}>
                  <div>
                    <div style={{ color: MUTED, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Dividend Yield</div>
                    <div style={{ color: yieldColor(searchResult.dividendYield), fontSize: "28px", fontWeight: "900" }}>
                      {searchResult.dividendYield ? `${fmt(searchResult.dividendYield)}%` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: MUTED, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Price</div>
                    <div style={{ color: TEXT, fontSize: "28px", fontWeight: "900" }}>${fmt(searchResult.price)}</div>
                  </div>
                  <div>
                    <div style={{ color: MUTED, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Sector</div>
                    <div style={{ color: TEXT, fontSize: "18px", fontWeight: "700" }}>{searchResult.industry || "--"}</div>
                  </div>
                </div>
              </div>
              <a
                href={`/research?ticker=${searchResult.ticker}`}
                style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "10px", padding: "12px 24px", color: GOLD, fontSize: "14px", fontWeight: "800", textDecoration: "none" }}
              >
                Full AI Research →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1 }}>
          {SECTORS.map(s => (
            <button key={s} onClick={() => setSector(s)} style={{
              background: sector === s ? GOLD_DIM : "rgba(255,255,255,0.03)",
              border: `1px solid ${sector === s ? GOLD_BORDER : CARD_BORDER}`,
              borderRadius: "8px", padding: "6px 14px",
              color: sector === s ? GOLD : MUTED,
              fontSize: "12px", fontWeight: "700", cursor: "pointer",
            }}>{s}</button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${CARD_BORDER}`, borderRadius: "8px", padding: "8px 14px", color: TEXT, fontSize: "13px", outline: "none", cursor: "pointer" }}
        >
          <option value="yield">Sort: Yield ↓</option>
          <option value="name">Sort: Name A-Z</option>
          <option value="sector">Sort: Sector</option>
        </select>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Stocks Tracked", value: CURATED_DIVIDENDS.length, icon: BarChart3, color: GOLD },
          { label: "Avg Yield", value: loadingLive ? "..." : `${fmt(Object.values(liveData).reduce((s, d) => s + (Number(d.yield) || 0), 0) / Math.max(Object.values(liveData).filter(d => d.yield).length, 1))}%`, icon: TrendingUp, color: GREEN },
          { label: "High Yield (5%+)", value: loadingLive ? "..." : Object.values(liveData).filter(d => Number(d.yield) >= 5).length, icon: DollarSign, color: GREEN },
          { label: "Sectors Covered", value: SECTORS.length - 1, icon: Calendar, color: GOLD },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: "12px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <Icon size={16} color={stat.color} />
                <span style={{ color: MUTED, fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>{stat.label}</span>
              </div>
              <div style={{ color: stat.color, fontSize: "28px", fontWeight: "900" }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Main Table */}
      <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: "14px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
              {["Ticker", "Company", "Sector", "Div Yield", "Annual Div", "Payout Ratio", "5Y Growth", "Price", "Research"].map(h => (
                <th key={h} style={{ color: MUTED, fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", padding: "16px 20px", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock, i) => {
              const live = liveData[stock.ticker];
              const yld = live?.yield;
              return (
                <tr key={stock.ticker} style={{ borderBottom: `1px solid ${CARD_BORDER}`, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ color: GOLD, fontSize: "15px", fontWeight: "800" }}>{stock.ticker}</span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ color: TEXT, fontSize: "14px", fontWeight: "600" }}>{stock.name}</span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${CARD_BORDER}`, borderRadius: "6px", padding: "4px 10px", color: MUTED, fontSize: "12px", fontWeight: "600" }}>{stock.sector}</span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    {loadingLive ? (
                      <span style={{ color: MUTED, fontSize: "13px" }}>Loading...</span>
                    ) : (
                      <span style={{ color: yieldColor(yld), fontSize: "18px", fontWeight: "800" }}>
                        {yld ? `${fmt(yld)}%` : "N/A"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ color: TEXT, fontSize: "14px", fontWeight: "700" }}>
                      {live?.annualDividend ? `$${fmt(live.annualDividend)}` : "--"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    {live?.payoutRatio ? (
                      <span style={{ color: Number(live.payoutRatio) > 80 ? RED : Number(live.payoutRatio) > 60 ? GOLD : GREEN, fontSize: "14px", fontWeight: "700" }}>
                        {fmt(live.payoutRatio)}%
                      </span>
                    ) : <span style={{ color: MUTED }}>--</span>}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    {live?.dividendGrowth ? (
                      <span style={{ color: Number(live.dividendGrowth) > 0 ? GREEN : RED, fontSize: "14px", fontWeight: "700" }}>
                        {Number(live.dividendGrowth) > 0 ? "+" : ""}{fmt(live.dividendGrowth)}%
                      </span>
                    ) : <span style={{ color: MUTED }}>--</span>}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ color: TEXT, fontSize: "14px", fontWeight: "600" }}>
                      {live?.price ? `$${fmt(live.price)}` : "--"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <a
                      href={`/research`}
                      onClick={e => { e.preventDefault(); window.location.href = `/research`; }}
                      style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, borderRadius: "8px", padding: "8px 16px", color: GOLD, fontSize: "12px", fontWeight: "800", textDecoration: "none", whiteSpace: "nowrap" }}
                    >
                      AI Research →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px", padding: "14px 20px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", textAlign: "center" }}>
        <span style={{ color: MUTED, fontSize: "12px" }}>⚠️ Dividend yields are estimates and change with stock price. Always verify current data before investing. This is not financial advice.</span>
      </div>

      <PageChatWidget
        context="The user is browsing a dividend stock page showing yields, prices, and fundamentals for top dividend-paying stocks."
        placeholder="Ask me about dividend investing, yield comparison, or any stock on this list."
      />
    </main>
  );
}
