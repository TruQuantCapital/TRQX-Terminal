import React from "react";

function getTradingViewSymbol(symbol) {
  const s = String(symbol || "SPY").toUpperCase();

  const map = {
    SPY: "AMEX:SPY",
    QQQ: "NASDAQ:QQQ",
    IWM: "AMEX:IWM",
    DIA: "AMEX:DIA",
    VIX: "CBOE:VIX",
    SPX: "SP:SPX",
  };

  return map[s] || `NASDAQ:${s}`;
}

export default function TradingViewChart({ symbol = "SPY" }) {
  const tvSymbol = getTradingViewSymbol(symbol);

  const widgetConfig = encodeURIComponent(
    JSON.stringify({
      symbol: tvSymbol,
      interval: "5",
      timezone: "America/New_York",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      
      support_host: "https://www.tradingview.com",
    })
  );

  return (
    <section className="tvChartSection">
      <div className="tvChartHeader">
        <div>
          <small>TRADINGVIEW CHART</small>
          <h3>{symbol || "SPY"}</h3>
        </div>
        <span>5m • VWAP • Volume</span>
      </div>

      <iframe
        title={`TradingView ${tvSymbol}`}
       src={`https://s.tradingview.com/widgetembed/?symbol=${tvSymbol}&interval=5&theme=dark&style=1&timezone=America%2FNew_York&withdateranges=1&hideideas=1&locale=en`}
        className="tvChartIframe"
        allowFullScreen
      />
    </section>
  );
}