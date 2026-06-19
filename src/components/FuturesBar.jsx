// ─── FUTURES ENDPOINT ──────────────────────────────────────────────────────
const FUTURES_TICKERS = ["I:SPX", "I:NDX", "I:RUT", "I:DJI", "I:VIX"];
let futuresCache = {};
let futuresCacheTime = 0;
const FUTURES_CACHE_TTL = 14000;

app.get("/api/futures", async (req, res) => {
  try {
    const now = Date.now();
    if (now - futuresCacheTime < FUTURES_CACHE_TTL && Object.keys(futuresCache).length > 0) {
      return res.json(futuresCache);
    }
    const tickerList = FUTURES_TICKERS.join(",");
    const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/indices/tickers?tickers=${tickerList}&apiKey=${process.env.POLYGON_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error("[futures] Polygon error:", response.status);
      return res.status(502).json({ error: "upstream error" });
    }
    const data = await response.json();
    const result = {};
    for (const item of (data.results || [])) {
      const ticker = item.ticker;
      const day = item.day || {};
      const prev = item.prevDay || {};
      const last = day.c || item.lastQuote?.P || null;
      const prevClose = prev.c || null;
      const change = last && prevClose ? +(last - prevClose).toFixed(2) : null;
      const changePct = last && prevClose ? +((change / prevClose) * 100).toFixed(2) : null;
      result[ticker] = { last, change, changePct };
    }
    futuresCache = result;
    futuresCacheTime = now;
    res.json(result);
  } catch (err) {
    console.error("[futures] Error:", err.message);
    res.status(500).json({ error: "internal error" });
  }
});
// ─── END FUTURES ENDPOINT ──────────────────────────────────────────────────
