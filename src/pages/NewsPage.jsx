import React, { useEffect, useMemo, useState } from "react";

const API = "https://trqx-flow-scanner-production.up.railway.app";

const WATCHLIST = [
  "ALL",
  "SPY",
  "QQQ",
  "IWM",
  "SPX",
  "NVDA",
  "TSLA",
  "AAPL",
  "AMD",
  "META",
  "MSFT",
  "AMZN",
  "GOOGL",
  "PLTR",
  "COIN",
  "MSTR",
];

const IMPORTANT_WORDS = [
  "earnings",
  "guidance",
  "upgrade",
  "downgrade",
  "analyst",
  "fed",
  "fomc",
  "powell",
  "inflation",
  "cpi",
  "jobs",
  "payroll",
  "rates",
  "treasury",
  "oil",
  "tariff",
  "ai",
  "chip",
  "delivery",
  "lawsuit",
  "merger",
  "acquisition",
  "approval",
];

const JUNK_WORDS = [
  "class action",
  "deadline",
  "investors with losses",
  "market size",
  "market share",
  "cagr",
  "research report",
  "law firm",
  "notice",
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
          const sorted = (data.rows || []).sort(
  (a, b) => getImpactScore(b) - getImpactScore(a)
);

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
      <h3>Bloomberg Television</h3>
    </div>
    <span>Live Feed</span>
  </div>

  <iframe
    className="newsVideoFrame"
    src="https://www.youtube.com/embed/live_stream?channel=UCIALMKvObZNtJ6AmdCLP7Lg&autoplay=0&mute=1"
    title="Bloomberg Live Market News"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />

  <p className="newsVideoNote">
    If the stream is unavailable, the broadcaster is blocking embeds or is not live.
  </p>
</section>
        <div className="flowMiniCard gold">
          <small>FILTERED HEADLINES</small>
          <b>{cleanNews.length}</b>
          <span>Trader-relevant stories</span>
        </div>

        <div className="flowMiniCard">
          <small>LIVE FEED</small>
          <b>ACTIVE</b>
          <span>Polygon News</span>
        </div>

        <div className="flowMiniCard bullish">
          <small>TOP IMPACT</small>
          <b>{topCatalysts[0]?.impactScore ?? "--"}/10</b>
          <span>{topCatalysts[0]?.tickers?.[0] || "Market"}</span>
        </div>
      </section>

      <section className="calendarFilterBar">
        {WATCHLIST.map((x) => (
          <button
            key={x}
            className={filter === x ? "active" : ""}
            onClick={() => setFilter(x)}
          >
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
          <div className="calendarCard">
            <b>Loading news...</b>
          </div>
        ) : cleanNews.length ? (
          cleanNews.map((item, idx) => (
            <div
              key={idx}
              className={`calendarCard ${sentimentClass(item.sentiment)}`}
            >
              <div className="calendarTop">
                <small>{item.source}</small>
                <span>{item.sentiment || "Neutral"}</span>
              </div>

              <h3>{item.title}</h3>
              <div className="newsMeta">
  <span className={`impactBadge impact-${item.impact || 5}`}>
    Impact {item.impact || 5}/10
  </span>

  <span className="typeBadge">
    {item.category || "Market"}
  </span>
</div>

              <p>{item.description}</p>
              <p className="trqxRead">
  <strong>TRQX Read:</strong>{" "}
  {item.description?.slice(0, 180)}
</p>

              <div className="calendarMetrics">

  <div>
    <small>Impact</small>
    <b>{getImpactScore(item)}/10</b>
  </div>

  <div>
    <small>Type</small>
    <b>{getCatalystType(item.title)}</b>
  </div>

  <div>
    <small>Tickers</small>
    <b>
      {(item.tickers || []).slice(0,3).join(", ") || "--"}
    </b>
  </div>

</div>

              <p className="tradeImpactText">
                <strong>TRQX Read:</strong>{" "}
                {item.reason ||
                  "Headline may affect short-term sentiment. Confirm with price action and volume."}
              </p>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="tradePlanBtn"
              >
                Read Story
              </a>
            </div>
          ))
        ) : (
          <div className="calendarCard">
            <b>No trader-relevant catalyst news found.</b>
          </div>
        )}
      </section>
    </main>
  );
}