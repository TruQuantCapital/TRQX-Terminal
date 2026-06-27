import React, { useEffect, useMemo, useState } from "react";
import PageChatWidget from "../components/PageChatWidget";
const API = "https://trqx-flow-scanner-production.up.railway.app";

const WATCHLIST = [
  "ALL","SPY","QQQ","IWM","SPX","NVDA","TSLA","AAPL","AMD","META",
  "MSFT","AMZN","GOOGL","PLTR","COIN","MSTR","NFLX","ARM","SMCI","MU","BABA","SOFI",
];

const IMPORTANT_WORDS = [
  "earnings","guidance","upgrade","downgrade","analyst","fed","fomc","powell",
  "inflation","cpi","jobs","payroll","rates","treasury","oil","tariff","ai",
  "chip","delivery","lawsuit","merger","acquisition","approval",
];

const JUNK_WORDS = [
  "class action","deadline","investors with losses","market size","market share",
  "cagr","research report","law firm","notice",
];

function getImpactScore(item) {
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  const tickers = item.tickers || [];
  let score = 3;
  if (tickers.some((t) => WATCHLIST.includes(t))) score += 3;
  if (IMPORTANT_WORDS.some((w) => text.includes(w))) score += 3;
  if (String(item.sentiment || "").toLowerCase() !== "neutral") score += 1;
  return Math.min(10, score);
}

function isJunk(item) {
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  return JUNK_WORDS.some((w) => text.includes(w));
}

function sentimentClass(sentiment) {
  const s = String(sentiment || "").toLowerCase();
  if (s.includes("positive")) return "bullish";
  if (s.includes("negative")) return "bearish";
  return "";
}

function catalystType(item) {
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  if (text.includes("earnings") || text.includes("guidance")) return "Earnings";
  if (text.includes("upgrade") || text.includes("downgrade") || text.includes("analyst")) return "Analyst";
  if (text.includes("fed") || text.includes("fomc") || text.includes("cpi") || text.includes("inflation")) return "Macro";
  if (text.includes("ai") || text.includes("chip")) return "AI / Tech";
  if (text.includes("merger") || text.includes("acquisition")) return "M&A";
  if (text.includes("lawsuit")) return "Legal";
  return "Market News";
}

function getCatalystType(title = "") {
  const t = title.toLowerCase();
  if (t.includes("earnings")) return "Earnings";
  if (t.includes("guidance")) return "Guidance";
  if (t.includes("upgrade")) return "Upgrade";
  if (t.includes("downgrade")) return "Downgrade";
  if (t.includes("contract")) return "Government";
  if (t.includes("ai")) return "AI / Tech";
  if (t.includes("merger")) return "M&A";
  if (t.includes("acquisition")) return "M&A";
  if (t.includes("sec")) return "SEC Filing";
  if (t.includes("offering")) return "Offering";
  if (t.includes("fda")) return "FDA";
  if (t.includes("bankruptcy")) return "Bankruptcy";
  return "Market-Wide";
}

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch(`${API}/api/news`);
        if (res.ok) {
          const data = await res.json();
          const sorted = (data.rows || []).sort((a, b) => getImpactScore(b) - getImpactScore(a));
          setNews(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  const cleanNews = useMemo(() => {
    return news
      .filter((item) => !isJunk(item))
      .map((item) => ({
        ...item,
        impactScore: getImpactScore(item),
        catalystType: catalystType(item),
      }))
      .filter((item) => {
        if (filter === "ALL") return true;
        return (item.tickers || []).includes(filter);
      })
      .sort((a, b) => b.impactScore - a.impactScore);
  }, [news, filter]);

  const topCatalysts = cleanNews.slice(0, 3);

  return (
    <main className="pageStack">
      <section className="pageHeader">
        <div>
          <p>TRQX MODULE</p>
          <h1>Catalyst Radar</h1>
          <span>Live market-moving headlines and institutional catalysts.</span>
        </div>
      </section>

      <section className="flowQuickStats">
        <section className="newsVideoCard newsVideoWide">
          <div className="tvChartHeader">
            <div>
              <small>LIVE MARKET NEWS</small>
              <h3>Market News Feed</h3>
            </div>
            <span>Live Feed</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "14px" }}>
            {/* Left: Live TV Links */}
<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
  <div style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" }}>Live Financial TV</div>
  <div style={{ display: "flex", flexDirection: "column", gap: "10px", height: "280px", overflowY: "auto" }}>
    {[
      { name: "Bloomberg Markets", desc: "Live markets coverage and breaking financial news", url: "https://www.youtube.com/@markets/live", color: "#d4af37" },
      { name: "CNBC Live TV", desc: "Real-time business news, market data, and analysis", url: "https://www.youtube.com/@CNBC/live", color: "#0088ff" },
      { name: "Yahoo Finance Live", desc: "Live market coverage, earnings, and economic data", url: "https://www.youtube.com/@YahooFinance/live", color: "#a855f7" },
    ].map((s, i) => (
      <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#f5f1e8", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>{s.name}</div>
          <div style={{ color: "#9ca3af", fontSize: "11px" }}>{s.desc}</div>
        </div>
        <button onClick={() => window.open(s.url, "_blank")}
          style={{ background: `${s.color}22`, border: `1px solid ${s.color}55`, borderRadius: "8px", padding: "8px 16px", color: s.color, fontSize: "11px", fontWeight: "800", cursor: "pointer", whiteSpace: "nowrap", marginLeft: "12px" }}>
          WATCH LIVE
        </button>
      </div>
    ))}
  </div>
</div>
            {/* Right: TradingView Top Stories */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" }}>Top Stories</div>
              <div style={{ height: "280px", borderRadius: "10px", overflow: "hidden" }}>
                <iframe
                  src="https://s.tradingview.com/embed-widget/timeline/?locale=en#%7B%22feedMode%22%3A%22market%22%2C%22market%22%3A%22stock%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22displayMode%22%3A%22adaptive%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%7D"
                  title="Top Stories"
                  style={{ border: "none", width: "100%", height: "100%" }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flowMiniCard gold" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <small>FILTERED HEADLINES</small>
          <b style={{ fontSize: "28px" }}>{cleanNews.length}</b>
          <span>Trader-relevant stories</span>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {cleanNews.slice(0, 3).map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ color: "#f5f1e8", fontSize: "11px", lineHeight: "1.4", opacity: 0.85 }}>
                  {item.title?.slice(0, 70)}{item.title?.length > 70 ? "..." : ""}
                </div>
                <div style={{ color: "#9ca3af", fontSize: "10px", marginTop: "2px" }}>{item.source}</div>
              </a>
            ))}
          </div>
        </div>

        <div className="flowMiniCard" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <small>LIVE FEED</small>
          <b style={{ color: "#22c55e", fontSize: "20px" }}>ACTIVE</b>
          <span>Polygon News</span>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af", fontSize: "11px" }}>Total Stories</span>
              <span style={{ color: "#f5f1e8", fontSize: "11px", fontWeight: "700" }}>{news.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af", fontSize: "11px" }}>After Filter</span>
              <span style={{ color: "#f5f1e8", fontSize: "11px", fontWeight: "700" }}>{cleanNews.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af", fontSize: "11px" }}>High Impact</span>
              <span style={{ color: "#d4af37", fontSize: "11px", fontWeight: "700" }}>{cleanNews.filter(n => n.impactScore >= 7).length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af", fontSize: "11px" }}>Last Updated</span>
              <span style={{ color: "#f5f1e8", fontSize: "11px", fontWeight: "700" }}>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </div>

        <div className="flowMiniCard bullish" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <small>TOP IMPACT</small>
          <b style={{ fontSize: "28px" }}>{topCatalysts[0]?.impactScore ?? "--"}/10</b>
          <span style={{ color: "#d4af37", fontWeight: "700" }}>{topCatalysts[0]?.tickers?.[0] || "Market"}</span>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {topCatalysts[0] && (
              <a href={topCatalysts[0].url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ color: "#f5f1e8", fontSize: "11px", lineHeight: "1.4" }}>
                  {topCatalysts[0].title?.slice(0, 100)}{topCatalysts[0].title?.length > 100 ? "..." : ""}
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <span style={{ color: "#9ca3af", fontSize: "10px" }}>{topCatalysts[0].source}</span>
                  <span style={{ color: topCatalysts[0].sentiment === "positive" ? "#22c55e" : topCatalysts[0].sentiment === "negative" ? "#ef4444" : "#9ca3af", fontSize: "10px", fontWeight: "700" }}>
                    {topCatalysts[0].sentiment?.toUpperCase() || "NEUTRAL"}
                  </span>
                </div>
              </a>
            )}
            {topCatalysts.slice(1).map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: "11px" }}>{item.tickers?.[0] || "MKT"}</span>
                <span style={{ color: "#d4af37", fontSize: "11px", fontWeight: "700" }}>{item.impactScore}/10</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="calendarFilterBar">
        {WATCHLIST.map((x) => (
          <button key={x} className={filter === x ? "active" : ""} onClick={() => setFilter(x)}>
            {x}
          </button>
        ))}
      </section>

      <section className="smartMoneySummary">
        <div>
          <small>TODAY'S TOP CATALYSTS</small>
          <h3>{filter === "ALL" ? "Market-Wide" : filter}</h3>
        </div>
        <div className="smartMoneyGrid">
          {topCatalysts.length ? (
            topCatalysts.map((item, i) => (
              <div key={i}>
                <span>{item.tickers?.slice(0, 2).join(", ") || "Market"}</span>
                <b>{item.impactScore}/10</b>
                <small>{item.catalystType}</small>
              </div>
            ))
          ) : (
            <div>
              <span>No catalyst</span>
              <b>--</b>
              <small>No matching news</small>
            </div>
          )}
        </div>
      </section>

      <section className="calendarGrid">
        {loading ? (
          <div className="calendarCard"><b>Loading news...</b></div>
        ) : cleanNews.length ? (
          cleanNews.map((item, idx) => (
            <div key={idx} className={`calendarCard ${sentimentClass(item.sentiment)}`}>
              <div className="calendarTop">
                <small>{item.source}</small>
                <span>{item.sentiment || "Neutral"}</span>
              </div>
              <h3>{item.title}</h3>
              <div className="newsMeta">
                <span className={`impactBadge impact-${item.impact || 5}`}>Impact {item.impact || 5}/10</span>
                <span className="typeBadge">{item.category || "Market"}</span>
              </div>
              <p>{item.description}</p>
              <div className="calendarMetrics">
                <div><small>Impact</small><b>{getImpactScore(item)}/10</b></div>
                <div><small>Type</small><b>{getCatalystType(item.title)}</b></div>
                <div><small>Tickers</small><b>{(item.tickers || []).slice(0, 3).join(", ") || "--"}</b></div>
              </div>
              <p className="tradeImpactText">
                <strong>TRQX Read:</strong>{" "}
                {item.reason || "Headline may affect short-term sentiment. Confirm with price action and volume."}
              </p>
              <a href={item.url} target="_blank" rel="noreferrer" className="tradePlanBtn">Read Story</a>
            </div>
          ))
        ) : (
          <div className="calendarCard"><b>No trader-relevant catalyst news found.</b></div>
        )}
      </section>

      <PageChatWidget context="The user is on the News & Alerts page viewing live market headlines, catalyst events, and options flow news." placeholder="Ask me about any headline, what it means for the market, or how to trade around this news." />
    </main>
  );
}
