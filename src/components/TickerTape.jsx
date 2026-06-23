import React, { useEffect, useState, useRef } from "react";

const API = "https://trqx-flow-scanner-production.up.railway.app";

const TICKERS = [
  "SPY","QQQ","IWM","NVDA","AAPL","MSFT","TSLA","AMZN",
  "META","GOOGL","AMD","COIN","JPM","GLD","PLTR","NFLX",
  "UBER","BA","XOM","VIX"
];

export default function TickerTape() {
  const [quotes, setQuotes] = useState([]);
  const tapeRef = useRef(null);

  async function fetchQuotes() {
    const results = await Promise.allSettled(
      TICKERS.map((sym) =>
        fetch(`${API}/api/quote/${sym}`)
          .then((r) => r.json())
          .then((d) => ({
            symbol: sym,
            price: d.price,
            changePct: d.changePct,
          }))
      )
    );
    const valid = results
      .filter((r) => r.status === "fulfilled" && r.value.price)
      .map((r) => r.value);
    if (valid.length > 0) setQuotes(valid);
  }

  useEffect(() => {
    fetchQuotes();
    const t = setInterval(fetchQuotes, 60000);
    return () => clearInterval(t);
  }, []);

  if (quotes.length === 0) return null;

  const items = [...quotes, ...quotes];

  return (
    <div className="tickerTape">
      <div className="tickerTapeTrack" ref={tapeRef}>
        {items.map((q, i) => (
          <span className="tickerTapeItem" key={`${q.symbol}-${i}`}>
            <b>{q.symbol}</b>
            <span>{Number(q.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <em className={Number(q.changePct) >= 0 ? "tapePos" : "tapeNeg"}>
              {Number(q.changePct) >= 0 ? "+" : ""}{Number(q.changePct).toFixed(2)}%
            </em>
          </span>
        ))}
      </div>
    </div>
  );
}
