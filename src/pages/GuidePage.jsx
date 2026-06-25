import React, { useState } from "react";
import {
  Activity,
  Waves,
  Newspaper,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Target,
  BarChart3,
  Eye,
  Clock,
} from "lucide-react";

const GOLD = "#d4af37";
const GOLD_DIM = "rgba(212,175,55,0.15)";
const GOLD_BORDER = "rgba(212,175,55,0.25)";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f5f1e8";
const MUTED = "#9ca3af";

function SectionCard({ children, style }) {
  return (
    <div style={{
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "16px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function GoldCard({ children, style }) {
  return (
    <div style={{
      background: GOLD_DIM,
      border: `1px solid ${GOLD_BORDER}`,
      borderRadius: "10px",
      padding: "16px 20px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function Tag({ children, color = GOLD, bg = GOLD_DIM }) {
  return (
    <span style={{
      background: bg,
      color,
      border: `1px solid ${color}40`,
      borderRadius: "6px",
      padding: "3px 10px",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "0.05em",
    }}>
      {children}
    </span>
  );
}

function CheckItem({ children, color = "#22c55e" }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
      <CheckCircle size={16} color={color} style={{ marginTop: "2px", flexShrink: 0 }} />
      <span style={{ color: TEXT, fontSize: "14px", lineHeight: "1.5" }}>{children}</span>
    </div>
  );
}

function WarnItem({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
      <AlertTriangle size={16} color="#f59e0b" style={{ marginTop: "2px", flexShrink: 0 }} />
      <span style={{ color: TEXT, fontSize: "14px", lineHeight: "1.5" }}>{children}</span>
    </div>
  );
}

function StepBadge({ number }) {
  return (
    <div style={{
      width: "28px", height: "28px", borderRadius: "50%",
      background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: GOLD, fontSize: "13px", fontWeight: "700", flexShrink: 0,
    }}>
      {number}
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <div style={{ display: "flex", gap: "14px", marginBottom: "20px" }}>
      <StepBadge number={number} />
      <div>
        <div style={{ color: GOLD, fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>{title}</div>
        <div style={{ color: MUTED, fontSize: "14px", lineHeight: "1.6" }}>{children}</div>
      </div>
    </div>
  );
}

function ColumnRow({ label, description, tag, tagColor }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      padding: "12px 0", borderBottom: `1px solid ${BORDER}`, gap: "16px",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: TEXT, fontSize: "13px", fontWeight: "700", marginBottom: "3px" }}>{label}</div>
        <div style={{ color: MUTED, fontSize: "13px", lineHeight: "1.5" }}>{description}</div>
      </div>
      {tag && <Tag color={tagColor || GOLD}>{tag}</Tag>}
    </div>
  );
}

// ─────────────────────────────────────────────
// FLOW SCANNER GUIDE
// ─────────────────────────────────────────────
function FlowScannerGuide() {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <Activity size={22} color={GOLD} />
          <h2 style={{ color: TEXT, fontSize: "20px", fontWeight: "700", margin: 0 }}>Options Flow Scanner</h2>
        </div>
        <p style={{ color: MUTED, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
          The Flow Scanner shows large options trades as they happen in real time. When institutions and hedge funds
          place massive bets in the options market, those trades appear here before the move happens in the stock.
          Learning to read flow is one of the highest-leverage skills in modern trading.
        </p>
      </div>

      {/* What You're Looking At */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 16px" }}>📊 What Each Column Means</h3>
        <ColumnRow label="TICKER" description="The stock or ETF the options trade was placed on. SPY, NVDA, AAPL, TSLA are the most common." />
        <ColumnRow label="TYPE" description="CALL = bet the price goes up. PUT = bet the price goes down." tag="KEY" />
        <ColumnRow label="PREMIUM" description="Total dollar value of the trade. $100K+ is meaningful. $500K+ is institutional size. $1M+ is a major conviction trade." tag="IMPORTANT" tagColor="#22c55e" />
        <ColumnRow label="SWEEP / BLOCK" description="SWEEP = aggressive, urgent order filled across multiple exchanges at once. More directional. BLOCK = single large order, may be a hedge." tag="KEY" />
        <ColumnRow label="EXPIRATION" description="When the contract expires. Short-dated (days to weeks) = more directional urgency. Long-dated (months) = possibly a hedge or macro position." />
        <ColumnRow label="STRIKE" description="The price the option is betting on. Compare to current stock price to determine ITM, ATM, or OTM." />
        <ColumnRow label="SENTIMENT" description="BULLISH = calls bought aggressively. BEARISH = puts bought aggressively. Based on whether the trade hit the ask (buying) or bid (selling)." tag="KEY" />
      </SectionCard>

      {/* Sweep vs Block */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 16px" }}>⚡ Sweep vs Block — What's the Difference?</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <GoldCard style={{ borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Zap size={16} color="#22c55e" />
              <span style={{ color: "#22c55e", fontSize: "14px", fontWeight: "700" }}>SWEEP</span>
            </div>
            <p style={{ color: MUTED, fontSize: "13px", lineHeight: "1.5", margin: 0 }}>
              Filled aggressively across multiple exchanges simultaneously. The buyer is willing to pay full ask price
              to get in immediately. This signals urgency — they expect a move soon.
            </p>
            <div style={{ marginTop: "10px", color: TEXT, fontSize: "12px", fontWeight: "600" }}>
              → More likely directional. Higher conviction signal.
            </div>
          </GoldCard>
          <GoldCard style={{ borderColor: "rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Shield size={16} color="#818cf8" />
              <span style={{ color: "#818cf8", fontSize: "14px", fontWeight: "700" }}>BLOCK</span>
            </div>
            <p style={{ color: MUTED, fontSize: "13px", lineHeight: "1.5", margin: 0 }}>
              A single large order, often executed off-exchange or negotiated. May be a hedge against an existing
              stock position rather than a new directional bet.
            </p>
            <div style={{ marginTop: "10px", color: TEXT, fontSize: "12px", fontWeight: "600" }}>
              → Requires more context. Could be hedging, not betting.
            </div>
          </GoldCard>
        </div>
      </SectionCard>

      {/* How to Use It */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 20px" }}>🎯 How to Use Flow in a Real Trade Decision</h3>
        <Step number="1" title="Filter for size — ignore small trades">
          Focus on trades with $100K+ in premium. Anything smaller is retail noise. The TRQX scanner highlights high-conviction prints automatically.
        </Step>
        <Step number="2" title="Check the type — sweep or block?">
          Sweeps carry more directional weight. A sweep on NVDA calls means someone paid urgency premium to get in fast — that matters. A block may just be a hedge.
        </Step>
        <Step number="3" title="Check the expiration — near-term or long-dated?">
          Short-dated contracts (1–14 days out) signal someone expects a move very soon. Long-dated contracts (months out) may be macro positioning or hedging — less immediately tradeable.
        </Step>
        <Step number="4" title="Go to the chart — does it confirm?">
          Pull up the ticker on TradingView. Does the chart show bullish structure, support holding, higher timeframe uptrend? If the flow is bullish AND the chart agrees — you have confluence.
        </Step>
        <Step number="5" title="Check GEMX — does gamma support it?">
          Open the GEMX page for the ticker. Is price above the gamma flip? Is there a put wall below providing support? If yes — the gamma environment supports the trade.
        </Step>
        <Step number="6" title="Only then — consider the trade">
          Flow alone is never enough. Flow + chart structure + gamma alignment = a high-confidence setup. Any two out of three is acceptable. One alone is not.
        </Step>
      </SectionCard>

      {/* What to Watch For */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 16px" }}>🔥 High-Conviction Flow Signals</h3>
        <CheckItem>Large sweep ($500K+) on a liquid ticker (SPY, QQQ, NVDA, AAPL) — someone big is moving fast</CheckItem>
        <CheckItem>Multiple sweeps on the same ticker in the same direction within minutes — repeated conviction</CheckItem>
        <CheckItem>Short-dated expiration (this week or next week) with large premium — urgency for a near-term move</CheckItem>
        <CheckItem>Flow aligns with the daily chart trend — buying calls in an uptrend, buying puts in a downtrend</CheckItem>
        <CheckItem>Flow appears at a key support or resistance level — institutional entry point confirmed by chart</CheckItem>
      </SectionCard>

      {/* What to Avoid */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 16px" }}>⚠️ Common Flow Trading Mistakes</h3>
        <WarnItem>Copying every large sweep without checking the chart — flow without context loses money</WarnItem>
        <WarnItem>Chasing a print that's already moved 20-30% — you are buying someone else's exit</WarnItem>
        <WarnItem>Treating a long-dated block as a near-term signal — it may be a quarterly hedge, not a trade</WarnItem>
        <WarnItem>Ignoring the bid-ask spread — you may pay significantly more than the institution that placed the print</WarnItem>
        <WarnItem>Going too large on one flow signal — flow is one input, not a guarantee</WarnItem>
      </SectionCard>

      {/* Quick Reference */}
      <GoldCard>
        <h3 style={{ color: GOLD, fontSize: "14px", fontWeight: "700", margin: "0 0 14px" }}>✅ Flow Scanner Quick-Start Checklist</h3>
        <CheckItem>Premium $100K or more</CheckItem>
        <CheckItem>Sweep (preferred) or block with context</CheckItem>
        <CheckItem>Short-dated expiration for near-term trades</CheckItem>
        <CheckItem>Chart structure confirms the direction</CheckItem>
        <CheckItem>GEMX gamma environment supports the trade</CheckItem>
        <CheckItem>Risk defined before entry — stop loss placed</CheckItem>
      </GoldCard>
    </div>
  );
}

// ─────────────────────────────────────────────
// GEMX GUIDE
// ─────────────────────────────────────────────
function GemxGuide() {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <Waves size={22} color={GOLD} />
          <h2 style={{ color: TEXT, fontSize: "20px", fontWeight: "700", margin: 0 }}>GEMX — Gamma Exposure Dashboard</h2>
        </div>
        <p style={{ color: MUTED, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
          GEMX shows how market maker hedging activity creates invisible pressure zones in the market. When dealers
          hedge their options exposure, they buy and sell the underlying stock — and that mechanical buying and selling
          creates real support and resistance that most traders never see. GEMX makes it visible.
        </p>
      </div>

      {/* The Core Concept */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 16px" }}>🧠 The Core Concept — Why Dealers Move Markets</h3>
        <p style={{ color: MUTED, fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px" }}>
          When you buy a call option, a market maker sells it to you. To manage their risk, they buy shares of the
          stock proportional to the Delta of that option. As the stock price moves and Delta changes (due to Gamma),
          they continuously buy or sell more shares to stay hedged. This is called delta hedging.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <GoldCard style={{ borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.05)" }}>
            <div style={{ color: "#22c55e", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>📈 POSITIVE GEX</div>
            <p style={{ color: MUTED, fontSize: "13px", lineHeight: "1.5", margin: 0 }}>
              Dealers buy when price falls, sell when price rises. Acts as a stabilizing force. Price gets
              "pinned" — moves are compressed and reversals are more likely.
            </p>
          </GoldCard>
          <GoldCard style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
            <div style={{ color: "#ef4444", fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>📉 NEGATIVE GEX</div>
            <p style={{ color: MUTED, fontSize: "13px", lineHeight: "1.5", margin: 0 }}>
              Dealers sell when price falls, buy when price rises. Acts as an amplifying force. Moves become
              more explosive — breakouts run harder, selloffs accelerate.
            </p>
          </GoldCard>
        </div>
      </SectionCard>

      {/* Reading Each Metric */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 16px" }}>📊 Reading Each Metric</h3>
        <ColumnRow
          label="CALL WALL"
          description="The strike with the heaviest call open interest. Dealers are short calls here and long stock as a hedge. As price approaches, they sell that hedge — creating ceiling resistance. Price often struggles to break above the call wall."
          tag="RESISTANCE"
          tagColor="#ef4444"
        />
        <ColumnRow
          label="PUT WALL"
          description="The strike with the heaviest put open interest. Dealers are short puts here and short stock as a hedge. As price approaches, they buy back their hedge — creating floor support. Price often bounces at the put wall."
          tag="SUPPORT"
          tagColor="#22c55e"
        />
        <ColumnRow
          label="GAMMA FLIP"
          description="The price level where total dealer GEX transitions from positive to negative. Above = dealers stabilize price, low volatility. Below = dealers amplify moves, high volatility. This is often the most important level on the chart."
          tag="KEY LEVEL"
          tagColor={GOLD}
        />
        <ColumnRow
          label="MAX PAIN"
          description="The price at which the maximum number of options contracts expire worthless — causing the maximum loss to options buyers. Price often gravitates toward max pain as expiration approaches, especially on monthly OpEx."
          tag="EXPIRY MAGNET"
        />
        <ColumnRow
          label="SQUEEZE RISK"
          description="Measures how much potential energy is built up in the gamma environment. High squeeze risk means a breakout in either direction could accelerate sharply due to dealer hedging activity."
          tag="VOLATILITY"
          tagColor="#f59e0b"
        />
        <ColumnRow
          label="DEALER POSITION"
          description="Whether dealers are net long or net short gamma overall. Long gamma = they stabilize. Short gamma = they amplify."
        />
      </SectionCard>

      {/* The Exposure Profile Chart */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 16px" }}>📈 Reading the Exposure Profile Chart</h3>
        <p style={{ color: MUTED, fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px" }}>
          The bar chart shows gamma exposure at each strike price. Think of it as a map of where dealer hedging
          pressure is concentrated across the entire options chain.
        </p>
        <CheckItem color={GOLD}>Green bars above zero = positive GEX at that strike — dealers stabilize price there</CheckItem>
        <CheckItem color={GOLD}>Red bars below zero = negative GEX at that strike — dealers amplify moves there</CheckItem>
        <CheckItem color={GOLD}>The tallest green bar = likely the call wall (maximum stabilizing pressure above)</CheckItem>
        <CheckItem color={GOLD}>The deepest red bar = likely the put wall area (maximum amplifying pressure below)</CheckItem>
        <CheckItem color={GOLD}>The zero crossing line = the gamma flip — watch price behavior here closely</CheckItem>
      </SectionCard>

      {/* The Speedometer */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 16px" }}>🎯 Reading the Speedometer Gauge</h3>
        <p style={{ color: MUTED, fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px" }}>
          The speedometer shows where current price sits relative to the put wall and call wall range.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          <GoldCard style={{ textAlign: "center" }}>
            <TrendingDown size={20} color="#ef4444" style={{ margin: "0 auto 8px" }} />
            <div style={{ color: "#ef4444", fontSize: "12px", fontWeight: "700" }}>LEFT ZONE</div>
            <div style={{ color: MUTED, fontSize: "12px", marginTop: "4px" }}>Near put wall. Dealer support likely. Bounce zone.</div>
          </GoldCard>
          <GoldCard style={{ textAlign: "center" }}>
            <Target size={20} color={GOLD} style={{ margin: "0 auto 8px" }} />
            <div style={{ color: GOLD, fontSize: "12px", fontWeight: "700" }}>CENTER</div>
            <div style={{ color: MUTED, fontSize: "12px", marginTop: "4px" }}>Between walls. Neutral zone. Watch gamma flip direction.</div>
          </GoldCard>
          <GoldCard style={{ textAlign: "center" }}>
            <TrendingUp size={20} color="#22c55e" style={{ margin: "0 auto 8px" }} />
            <div style={{ color: "#22c55e", fontSize: "12px", fontWeight: "700" }}>RIGHT ZONE</div>
            <div style={{ color: MUTED, fontSize: "12px", marginTop: "4px" }}>Near call wall. Dealer resistance likely. Ceiling zone.</div>
          </GoldCard>
        </div>
      </SectionCard>

      {/* How to Use GEMX */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 20px" }}>🎯 How to Use GEMX in a Trade Decision</h3>
        <Step number="1" title="Check the gamma flip first">
          Is price above or below the gamma flip? Above = positive GEX environment, look for controlled moves and
          potential pinning. Below = negative GEX, expect amplified moves and higher volatility.
        </Step>
        <Step number="2" title="Identify the call wall and put wall">
          These are your dealer-driven support and resistance levels for the day. The put wall is your downside
          cushion. The call wall is your upside ceiling. Plan trades within this range.
        </Step>
        <Step number="3" title="Check the exposure profile chart">
          Where is the largest gamma concentration? That strike is the gravitational center for price today —
          especially as expiration approaches.
        </Step>
        <Step number="4" title="Combine with flow and chart">
          GEMX alone tells you the environment. Combined with bullish flow prints AND a bullish chart structure,
          it completes a full three-part confirmation: flow + structure + gamma.
        </Step>
        <Step number="5" title="Update it daily">
          Gamma exposure changes every day as options are bought, sold, and expire. Always check GEMX fresh
          each morning as part of your pre-market routine.
        </Step>
      </SectionCard>

      {/* Quick Reference */}
      <GoldCard>
        <h3 style={{ color: GOLD, fontSize: "14px", fontWeight: "700", margin: "0 0 14px" }}>✅ GEMX Quick-Start Checklist</h3>
        <CheckItem>Is price above or below the gamma flip?</CheckItem>
        <CheckItem>Where is the call wall — my upside ceiling today?</CheckItem>
        <CheckItem>Where is the put wall — my downside cushion today?</CheckItem>
        <CheckItem>Is dealer position long gamma (stable) or short gamma (explosive)?</CheckItem>
        <CheckItem>Does the gamma environment support my trade direction?</CheckItem>
        <CheckItem>Have I updated GEMX data for today's session?</CheckItem>
      </GoldCard>
    </div>
  );
}

// ─────────────────────────────────────────────
// NEWS GUIDE
// ─────────────────────────────────────────────
function NewsGuide() {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <Newspaper size={22} color={GOLD} />
          <h2 style={{ color: TEXT, fontSize: "20px", fontWeight: "700", margin: 0 }}>News & Market Brief</h2>
        </div>
        <p style={{ color: MUTED, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
          The News page and Market Brief tiles give you the macro context behind every trade. Price moves happen
          because of events — earnings, economic data, Fed decisions, geopolitical news. Understanding the news
          environment before the market opens is the difference between trading informed and trading blind.
        </p>
      </div>

      {/* Pre-Market News Routine */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 20px" }}>🌅 The Pre-Market News Routine</h3>
        <Step number="1" title="Check the Economic Calendar first">
          Before reading any headlines, open the Economic Calendar page. Is CPI out today? FOMC meeting?
          NFP? Earnings from major companies? High-impact events change everything — higher volatility,
          wider spreads, faster moves, more risk.
        </Step>
        <Step number="2" title="Read the top 3-5 headlines">
          You don't need to read every story. Focus on what directly affects the tickers you're watching.
          An NVDA earnings beat matters if you're trading NVDA. A Fed speaker matters for SPY and QQQ.
          Filter ruthlessly.
        </Step>
        <Step number="3" title="Form your daily bias">
          After the news scan, ask: is the macro environment risk-on or risk-off today? Risk-on = investors
          comfortable, buying stocks. Risk-off = investors nervous, selling stocks, moving to bonds and cash.
          This becomes your directional backdrop for every trade.
        </Step>
        <Step number="4" title="Check premarket gaps">
          Look at SPY, QQQ, and your watchlist tickers. Did any gap up or down overnight? What news caused it?
          Gaps on earnings or economic data behave differently than unexplained gaps.
        </Step>
      </SectionCard>

      {/* Key Events to Know */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 16px" }}>📅 High-Impact Events Every Trader Must Know</h3>
        <ColumnRow
          label="CPI — Consumer Price Index"
          description="Monthly, 8:30 AM EST. Measures inflation. Higher than expected = bad for stocks (Fed may raise rates). Lower than expected = good for stocks. One of the biggest market-moving events of the month."
          tag="MONTHLY"
          tagColor="#f59e0b"
        />
        <ColumnRow
          label="FOMC Meeting"
          description="8 times per year. The Federal Reserve decides interest rates. Rate decisions can move the entire market 1-3% in minutes. Always check if FOMC is scheduled before trading that day."
          tag="8x YEAR"
          tagColor="#ef4444"
        />
        <ColumnRow
          label="NFP — Non-Farm Payrolls"
          description="First Friday of each month, 8:30 AM EST. Shows how many jobs were added. Strong jobs = strong economy = good for stocks. Weak jobs = concerns about recession. Major volatility driver."
          tag="MONTHLY"
          tagColor="#f59e0b"
        />
        <ColumnRow
          label="Earnings Reports"
          description="Quarterly. Companies report revenue, profit, and guidance. Beats send stocks higher. Misses send stocks lower. But the market trades expectations — a beat can still drop if guidance disappoints."
          tag="QUARTERLY"
          tagColor={GOLD}
        />
        <ColumnRow
          label="Initial Jobless Claims"
          description="Every Thursday, 8:30 AM EST. Weekly jobs data. Fast pulse on the economy. Rising claims = weakening labor market = potential concern for stocks."
          tag="WEEKLY"
          tagColor="#22c55e"
        />
        <ColumnRow
          label="Fed Speakers"
          description="Various dates throughout the year. Federal Reserve officials commenting on rates and the economy. Can move markets significantly even outside of FOMC meetings. Check the calendar daily."
          tag="VARIES"
        />
      </SectionCard>

      {/* Risk On vs Risk Off */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 16px" }}>⚖️ Risk-On vs Risk-Off — Reading the Market Mood</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <GoldCard style={{ borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.05)" }}>
            <div style={{ color: "#22c55e", fontSize: "13px", fontWeight: "700", marginBottom: "10px" }}>📈 RISK-ON ENVIRONMENT</div>
            <CheckItem color="#22c55e">Stocks rising broadly</CheckItem>
            <CheckItem color="#22c55e">VIX (fear index) is low and falling</CheckItem>
            <CheckItem color="#22c55e">Strong economic data</CheckItem>
            <CheckItem color="#22c55e">Fed is dovish (cutting or holding rates)</CheckItem>
            <CheckItem color="#22c55e">Earnings beats across sectors</CheckItem>
            <div style={{ color: MUTED, fontSize: "12px", marginTop: "8px" }}>→ Favor calls. Trade with the trend.</div>
          </GoldCard>
          <GoldCard style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
            <div style={{ color: "#ef4444", fontSize: "13px", fontWeight: "700", marginBottom: "10px" }}>📉 RISK-OFF ENVIRONMENT</div>
            <WarnItem>Stocks selling off broadly</WarnItem>
            <WarnItem>VIX spiking (fear increasing)</WarnItem>
            <WarnItem>Weak economic data</WarnItem>
            <WarnItem>Fed is hawkish (raising rates)</WarnItem>
            <WarnItem>Earnings misses, guidance cuts</WarnItem>
            <div style={{ color: MUTED, fontSize: "12px", marginTop: "8px" }}>→ Favor puts or cash. Reduce size.</div>
          </GoldCard>
        </div>
      </SectionCard>

      {/* How News Connects to Flow and GEMX */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 16px" }}>🔗 How News Connects to Flow and GEMX</h3>
        <p style={{ color: MUTED, fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px" }}>
          News, flow, and gamma all feed each other. Understanding the connection makes each signal stronger:
        </p>
        <CheckItem color={GOLD}>
          Strong CPI beat (inflation lower than expected) → risk-on sentiment → watch for bullish call sweeps in SPY and QQQ on the flow scanner
        </CheckItem>
        <CheckItem color={GOLD}>
          FOMC day with hawkish language → risk-off → watch for negative GEX to amplify any SPY selloff below the gamma flip
        </CheckItem>
        <CheckItem color={GOLD}>
          NVDA earnings beat with raised guidance → watch for call sweeps in the flow AND check GEMX for the new call wall at higher strikes
        </CheckItem>
        <CheckItem color={GOLD}>
          Surprise bad news (geopolitical, unexpected data miss) → GEX may flip negative instantly → dealer hedging amplifies the move → flow will confirm with put sweeps
        </CheckItem>
      </SectionCard>

      {/* What to Ignore */}
      <SectionCard>
        <h3 style={{ color: GOLD, fontSize: "15px", fontWeight: "700", margin: "0 0 16px" }}>🚫 What to Ignore in the News</h3>
        <WarnItem>Analyst price targets — these are marketing, not trading signals</WarnItem>
        <WarnItem>Social media hot takes on market direction — noise, not signal</WarnItem>
        <WarnItem>Headlines that have already been priced in for days — the market looks forward, not backward</WarnItem>
        <WarnItem>Stories about individual stocks you're not watching that day — information overload kills focus</WarnItem>
        <WarnItem>After-hours moves on thin volume — may not hold at the next open</WarnItem>
      </SectionCard>

      {/* Quick Reference */}
      <GoldCard>
        <h3 style={{ color: GOLD, fontSize: "14px", fontWeight: "700", margin: "0 0 14px" }}>✅ News & Market Brief Quick-Start Checklist</h3>
        <CheckItem>Check Economic Calendar — any high-impact events today?</CheckItem>
        <CheckItem>Read top 3-5 headlines relevant to your watchlist</CheckItem>
        <CheckItem>Determine macro mood — risk-on or risk-off?</CheckItem>
        <CheckItem>Check premarket gaps on SPY, QQQ, and watchlist tickers</CheckItem>
        <CheckItem>If major event today — reduce position size, expect higher volatility</CheckItem>
        <CheckItem>Connect news context to flow and GEMX before any trade</CheckItem>
      </GoldCard>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN GUIDE PAGE
// ─────────────────────────────────────────────
const tabs = [
  { key: "flow", label: "Flow Scanner", icon: Activity },
  { key: "gemx", label: "GEMX", icon: Waves },
  { key: "news", label: "News & Market Brief", icon: Newspaper },
];

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState("flow");

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <Eye size={22} color={GOLD} />
          <h1 style={{ color: GOLD, fontSize: "24px", fontWeight: "700", margin: 0 }}>Platform Guide</h1>
        </div>
        <p style={{ color: MUTED, margin: "0", fontSize: "14px", lineHeight: "1.5" }}>
          Learn how to use every tool in the TRQX Terminal — from reading your first flow print to building
          a complete trade decision using flow, gamma, and market context together.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "8px", marginBottom: "28px",
        borderBottom: `1px solid ${BORDER}`, paddingBottom: "0",
      }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              background: "none", border: "none", padding: "10px 20px",
              cursor: "pointer", fontSize: "14px", fontWeight: "600",
              display: "flex", alignItems: "center", gap: "8px",
              color: activeTab === key ? GOLD : MUTED,
              borderBottom: activeTab === key ? `2px solid ${GOLD}` : "2px solid transparent",
              marginBottom: "-1px", transition: "color 0.2s",
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "flow" && <FlowScannerGuide />}
      {activeTab === "gemx" && <GemxGuide />}
      {activeTab === "news" && <NewsGuide />}

    </div>
  );
}
