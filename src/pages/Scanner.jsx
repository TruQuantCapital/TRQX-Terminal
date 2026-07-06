
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";

const API = import.meta.env.VITE_API_URL || "https://trqx-flow-scanner-production.up.railway.app";
const WS  = API.replace(/^http/, "ws");

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

const swipeRow = {
  display: "flex", flexWrap: "nowrap", overflowX: "auto",
  WebkitOverflowScrolling: "touch", scrollbarWidth: "thin", gap: "6px", paddingBottom: "6px",
};

function fmtPrem(v) {
  if (!v) return "$0";
  if (v >= 1_000_000) return `$${(v/1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v/1_000).toFixed(0)}K`;
  return `$${v}`;
}

function fmtTime(t) { return t || ""; }

function DTE({ expStr }) {
  if (!expStr) return <span>—</span>;
  const days = Math.max(0, Math.round((new Date(expStr) - Date.now()) / 86400000));
  const cls = days === 0 ? "dte-red" : days <= 7 ? "dte-orange" : "dte-green";
  return <span className={cls}>{days}d</span>;
}

function FlowScore({ score }) {
  if (!score) return <span className="score-badge score-0">—</span>;
  const cls = score >= 8 ? "score-high" : score >= 5 ? "score-mid" : "score-low";
  return <span className={`score-badge ${cls}`}>{score}/10</span>;
}

function TagBadge({ tag, compact = false }) {
  if (!tag) return null;
  const cls = { sweep: "tag-sweep", block: "tag-block", unusual: "tag-unusual" }[tag] || "";
  const full = { sweep: "⚡ SWEEP", block: "🏦 BLOCK", unusual: "🔥 UNUSUAL" }[tag] || tag.toUpperCase();
  const mini = { sweep: "⚡", block: "🏦", unusual: "🔥" }[tag] || tag.slice(0,3).toUpperCase();
  return <span className={`tag-badge ${cls}`} style={compact ? { padding: "2px 5px", fontSize: "12px" } : undefined}>{compact ? mini : full}</span>;
}

function StatCard({ label, value, sub, color, compact = false }) {
  return (
    <div className="stat-card" style={compact ? { padding: "8px 10px", minWidth: 0 } : undefined}>
      <div className="stat-label" style={compact ? { fontSize: "9px", letterSpacing: "1px" } : undefined}>{label}</div>
      <div className="stat-value" style={{ color, ...(compact ? { fontSize: "16px" } : {}) }}>{value}</div>
      {sub && <div className="stat-sub" style={compact ? { fontSize: "10px" } : undefined}>{sub}</div>}
    </div>
  );
}

function TopContracts({ contracts }) {
  const isMobile = useIsMobile();
  if (!contracts?.length) return null;
  return (
    <div className="top-contracts">
      <div className="top-contracts-label">📊 TOP CONTRACTS BY PREMIUM</div>
      <div className="top-contracts-pills" style={isMobile ? swipeRow : undefined}>
        {contracts.slice(0, 15).map((c, i) => (
          <span key={i} className={`contract-pill ${c.type === "C" ? "pill-call" : "pill-put"}`}
            style={isMobile ? { flexShrink: 0, whiteSpace: "nowrap", fontSize: "11px" } : undefined}
            title={`${fmtPrem(c.premium)} • ${c.tradeCount} trades`}>
            {c.ticker} {c.strike}{c.type} {c.expStr?.slice(2,10).replace(/-/g,"/")} {fmtPrem(c.premium)}
          </span>
        ))}
      </div>
    </div>
  );
}

function AIChat({ hasFeature }) {
  const [msgs, setMsgs] = useState([{ role: "ai", text: "Ask me anything about today's options flow. Try: \"What's unusual on NVDA?\" or \"Is SPY bullish today?\"" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput("");
    setMsgs(m => [...m, { role: "user", text: userMsg }]); setLoading(true);
    try {
      const res = await fetch(`${API}/api/ai/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: userMsg }) });
      const data = await res.json();
      setMsgs(m => [...m, { role: "ai", text: data.reply || data.error || "No response" }]);
    } catch { setMsgs(m => [...m, { role: "ai", text: "Connection error. Please try again." }]); }
    finally { setLoading(false); }
  };
  if (!hasFeature) return (<div className="ai-chat-locked"><div className="locked-icon">🤖</div><div className="locked-title">Ask AI Anything</div><div className="locked-sub">Upgrade to Starter to unlock AI flow analysis</div></div>);
  return (
    <div className="ai-chat">
      <div className="ai-chat-header">🤖 TRQX FLOW AI</div>
      <div className="ai-messages">
        {msgs.map((m, i) => (<div key={i} className={`ai-msg ai-msg-${m.role}`}><span className="ai-msg-label">{m.role === "user" ? "YOU" : "AI"}</span><span className="ai-msg-text">{m.text}</span></div>))}
        {loading && <div className="ai-msg ai-msg-ai"><span className="ai-msg-label">AI</span><span className="ai-typing">analyzing flow data...</span></div>}
        <div ref={bottomRef} />
      </div>
      <div className="ai-input-row">
        <input className="ai-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="e.g. What's unusual on NVDA today? Is SPY bullish?" />
        <button className="ai-send" onClick={send} disabled={loading}>→</button>
      </div>
    </div>
  );
}

function SectorHeatmap({ data, hasFeature }) {
  const isMobile = useIsMobile();
  if (!hasFeature) return (<div className="heatmap-locked"><div className="locked-icon">🗺️</div><div className="locked-title">Sector Heat Map</div><div className="locked-sub">Upgrade to Pro to unlock sector sentiment</div></div>);
  if (!data || !Object.keys(data).length) return <div className="heatmap-empty">Collecting sector data...</div>;
  return (
    <div className="heatmap">
      <div className="heatmap-title">🗺️ SECTOR HEAT MAP</div>
      <div className="heatmap-grid" style={isMobile ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" } : undefined}>
        {Object.entries(data).map(([sector, d]) => (
          <div key={sector} className={`heatmap-cell heatmap-${d.sentiment?.toLowerCase()}`}>
            <div className="heatmap-sector">{sector}</div><div className="heatmap-sentiment">{d.sentiment}</div>
            <div className="heatmap-prem">{fmtPrem(d.callPrem + d.putPrem)}</div><div className="heatmap-count">{d.count} trades</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SmartMoney({ data, hasFeature }) {
  if (!hasFeature) return (<div className="smart-locked"><div className="locked-icon">🎯</div><div className="locked-title">Smart Money Tracker</div><div className="locked-sub">Upgrade to Elite to track institutional accumulation</div></div>);
  if (!data?.length) return <div className="smart-empty">Tracking institutional activity...</div>;
  return (
    <div className="smart-money">
      <div className="smart-title">🎯 SMART MONEY TRACKER</div>
      <div className="smart-list">
        {data.map((t, i) => (
          <div key={i} className="smart-row" style={{ flexWrap: "wrap", rowGap: "4px" }}>
            <div className="smart-ticker">{t.ticker}</div><div className={`smart-sentiment ${t.sentiment?.toLowerCase()}`}>{t.sentiment}</div>
            <div className="smart-prem">{fmtPrem(t.totalPremium)}</div><div className="smart-unusual">🔥 {t.unusualCount} unusual prints</div>
            <div className="smart-last">{t.lastSeen}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ORBDashboard({ token, tier }) {
  const isMobile = useIsMobile();
  const hasFeature = ["pro","elite"].includes(tier);
  const [orbData, setOrbData] = useState({});
  const [flowNearOrb, setFlowNearOrb] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState("SPX");
  const [lastUpdate, setLastUpdate] = useState(null);
  const ORB_TICKERS = ["SPX","IWM","SPY","QQQ"];
  const fetchORB = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/orb`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrbData(data.orb || {}); setFlowNearOrb(data.flowNearOrb || []);
      setLastUpdate(new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: "America/New_York" }));
    } catch(e) { console.error("ORB fetch error:", e); } finally { setLoading(false); }
  };
  useEffect(() => { if (hasFeature) { fetchORB(); const i = setInterval(fetchORB, 60_000); return () => clearInterval(i); } }, [token, tier]);
  if (!hasFeature) return (<div className="orb-locked"><div className="locked-icon">📐</div><div className="locked-title">ORB Dashboard</div><div className="locked-sub">Upgrade to Pro to access the Live ORB + Flow Dashboard</div><a href="/pricing" className="upgrade-btn" style={{marginTop:"16px"}}>Upgrade to Pro →</a></div>);
  const getORBStatus = (orb) => { if (!orb?.currentPrice || !orb?.high || !orb?.low) return "waiting"; if (orb.currentPrice > orb.high) return "bullish-breakout"; if (orb.currentPrice < orb.low) return "bearish-breakout"; return "inside"; };
  const getStatusLabel = (s) => ({"bullish-breakout":"🚀 BREAKOUT ABOVE","bearish-breakout":"📉 BREAKDOWN BELOW","inside":"⏳ INSIDE RANGE","waiting":"⏰ WAITING FOR ORB"}[s] || "—");
  const getStatusColor = (s) => ({"bullish-breakout":"var(--green)","bearish-breakout":"var(--red)","inside":"var(--gold)","waiting":"var(--text-muted)"}[s] || "var(--text-muted)");
  return (
    <div className="orb-page">
      <div className="orb-header" style={isMobile ? { display:"flex", flexDirection:"column", gap:"10px", alignItems:"flex-start" } : undefined}>
        <div className="orb-title-row"><div className="orb-title" style={isMobile ? { fontSize:"16px" } : undefined}>📐 TRQX ORB DASHBOARD — 15MIN</div><div className="orb-sub">Opening Range Breakout levels with institutional flow confirmation</div></div>
        <div className="orb-header-right">{lastUpdate && <div className="orb-update">Updated: {lastUpdate} ET</div>}<button className="orb-refresh-btn" onClick={fetchORB} disabled={loading}>{loading ? "↻ Loading..." : "↻ Refresh"}</button></div>
      </div>
      <div className="orb-cards" style={isMobile ? { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" } : undefined}>
        {ORB_TICKERS.map(t => {
          const orb = orbData[t]; const status = getORBStatus(orb); const flowCount = flowNearOrb.filter(f => f.ticker === t).length;
          return (
            <div key={t} className={`orb-card ${selectedTicker === t ? "orb-card-selected" : ""} orb-${status}`} onClick={() => setSelectedTicker(t)} style={isMobile ? { minWidth:0 } : undefined}>
              <div className="orb-card-ticker">{t}</div>
              {orb ? (<><div className="orb-card-status" style={{color:getStatusColor(status),...(isMobile?{fontSize:"11px"}:{})}}>{getStatusLabel(status)}</div>
                <div className="orb-levels">
                  <div className="orb-level"><span className="orb-level-label">ORB HIGH</span><span className="orb-level-val green">${orb.high?.toFixed(2)}</span></div>
                  <div className="orb-level"><span className="orb-level-label">ORB LOW</span><span className="orb-level-val red">${orb.low?.toFixed(2)}</span></div>
                  <div className="orb-level"><span className="orb-level-label">CURRENT</span><span className="orb-level-val gold">${orb.currentPrice?.toFixed(2)}</span></div>
                  <div className="orb-level"><span className="orb-level-label">RANGE</span><span className="orb-level-val">${((orb.high||0)-(orb.low||0)).toFixed(2)}</span></div>
                </div>
                {flowCount > 0 && <div className="orb-flow-alert">🎯 {flowCount} flow print{flowCount > 1 ? "s" : ""} near ORB</div>}
              </>) : (<div className="orb-waiting">{loading ? "Loading..." : "ORB data unavailable"}</div>)}
            </div>
          );
        })}
      </div>
      <div className="orb-main" style={isMobile ? { display:"flex", flexDirection:"column", gap:"16px" } : undefined}>
        <div className="orb-chart-wrap">
          <div className="orb-chart-header">📈 {selectedTicker} — 5 Min Chart
            {orbData[selectedTicker] && <span className="orb-chart-levels">ORB H: <span className="green">${orbData[selectedTicker]?.high?.toFixed(2)}</span> ORB L: <span className="red">${orbData[selectedTicker]?.low?.toFixed(2)}</span></span>}
          </div>
          <iframe key={selectedTicker} src={`https://www.tradingview.com/widgetembed/?frameElementId=tv_orb&symbol=${selectedTicker==="SPX"?"SP:SPX":selectedTicker}&interval=5&hidesidetoolbar=0&symboledit=1&saveimage=0&theme=dark&style=1&timezone=America%2FNew_York&withdateranges=1&showpopupbutton=1&locale=en&utm_source=scanner.thetrulies.com`} className="orb-iframe" style={isMobile?{height:"320px",width:"100%"}:undefined} allowTransparency={true} scrolling="no" allowFullScreen={true} />
        </div>
        <div className="orb-flow-wrap">
          <div className="orb-flow-header">🎯 FLOW NEAR ORB LEVELS</div>
          <div className="orb-flow-scroll" style={isMobile?{overflowX:"auto",WebkitOverflowScrolling:"touch"}:undefined}>
            {flowNearOrb.filter(f=>f.ticker===selectedTicker).length > 0 ? (
              <table className="flow-table"><thead><tr><th style={{color:'#FFFFFF',fontWeight:700}}>TIME</th><th style={{color:'#FFFFFF',fontWeight:700}}>CONTRACT</th><th style={{color:'#FFFFFF',fontWeight:700}}>TYPE</th><th style={{color:'#FFFFFF',fontWeight:700}}>PREMIUM</th><th style={{color:'#FFFFFF',fontWeight:700}}>SIGNAL</th></tr></thead>
                <tbody>{flowNearOrb.filter(f=>f.ticker===selectedTicker).map((row,i)=>(<tr key={i} className={`flow-row ${row.isGolden?"golden-row":""}`}><td className="td-time">{row.time}</td><td className="td-contract">${row.strike}{row.type} {row.expStr?.slice(2,10).replace(/-/g,"/")}</td><td style={{color:row.type==="C"?"#22c55e":"#ef4444",fontWeight:700}}>{row.type==="C"?"CALL":"PUT"}</td><td className="td-premium">{fmtPrem(row.premium)}</td><td><span className={`orb-signal ${row.orbSignal}`}>{row.orbSignal==="bullish"?"🚀 BULL":"📉 BEAR"}</span></td></tr>))}</tbody>
              </table>
            ) : (<div className="orb-no-flow"><div style={{fontSize:"32px"}}>🎯</div><div>No flow detected near {selectedTicker} ORB levels yet</div><div style={{fontSize:"12px",color:"var(--text-muted)",marginTop:"8px"}}>Flow prints within 0.5% of ORB high/low will appear here</div></div>)}
          </div>
          <div className="orb-rules">
            <div className="orb-rules-title">📋 TRQX ORB RULES — 15MIN</div>
            <div className="orb-rule bullish-rule"><span className="rule-icon">🟢</span><span>LONG: Price breaks ORB High + Call flow confirms → enter on retest</span></div>
            <div className="orb-rule bearish-rule"><span className="rule-icon">🔴</span><span>SHORT: Price breaks ORB Low + Put flow confirms → enter on retest</span></div>
            <div className="orb-rule neutral-rule"><span className="rule-icon">⚠️</span><span>FADE: Flow opposite to breakout direction = trap signal, avoid</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowReplay({ hasFeature, token }) {
  const isMobile = useIsMobile();
  const [ticker, setTicker] = useState("SPY");
  const [date, setDate] = useState(() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); });
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false); const [playIndex, setPlayIndex] = useState(0);
  const [visibleRows, setVisibleRows] = useState([]); const [stats, setStats] = useState(null);
  const [error, setError] = useState(null); const playRef = useRef(null);
  const POPULAR = ["SPY","QQQ","AAPL","NVDA","TSLA","MSFT","AMZN","META","GOOGL","AMD","PLTR","IWM","SPX"];
  const maxDate = new Date(); maxDate.setDate(maxDate.getDate()-1);
  const minDate = new Date(); minDate.setFullYear(minDate.getFullYear()-2);
  const fetchReplay = async () => {
    if (!ticker||!date) return;
    setLoading(true); setError(null); setRows([]); setVisibleRows([]); setStats(null); setPlaying(false); setPlayIndex(0);
    try {
      const res = await fetch(`${API}/api/replay?ticker=${ticker.toUpperCase()}&date=${date}`, { headers: { Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      setRows(data.rows||[]); setVisibleRows(data.rows||[]); setStats(data.stats);
    } catch { setError("Failed to fetch replay data"); } finally { setLoading(false); }
  };
  const startPlay = () => { if (!rows.length) return; setVisibleRows([]); setPlayIndex(0); setPlaying(true); };
  useEffect(() => {
    if (!playing) return;
    if (playIndex >= rows.length) { setPlaying(false); return; }
    playRef.current = setTimeout(() => { setVisibleRows(v => [rows[playIndex],...v]); setPlayIndex(i => i+1); }, 300);
    return () => clearTimeout(playRef.current);
  }, [playing, playIndex, rows]);
  const stopPlay = () => { setPlaying(false); clearTimeout(playRef.current); setVisibleRows(rows); };
  if (!hasFeature) return (<div className="replay-locked"><div className="locked-icon">⏮️</div><div className="locked-title">Flow Replay</div><div className="locked-sub">Upgrade to Elite to access 2 years of historical flow data with TradingView chart integration</div><a href="/pricing" className="upgrade-btn" style={{marginTop:"16px"}}>Upgrade to Elite →</a></div>);
  return (
    <div className="replay-page">
      <div className="replay-controls" style={isMobile?{display:"flex",flexDirection:"column",gap:"12px",alignItems:"stretch"}:undefined}>
        <div className="replay-controls-left" style={isMobile?{display:"flex",flexDirection:"column",gap:"10px",alignItems:"stretch"}:undefined}>
          <div className="replay-field"><label className="replay-label">TICKER</label><input className="replay-input" value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} placeholder="e.g. AAPL" maxLength={5} style={isMobile?{width:"100%"}:undefined} /></div>
          <div className="replay-quick-tickers" style={isMobile?swipeRow:undefined}>{POPULAR.map(t=><button key={t} className={`replay-quick ${ticker===t?"active":""}`} onClick={()=>setTicker(t)} style={isMobile?{flexShrink:0}:undefined}>{t}</button>)}</div>
          <div className="replay-field"><label className="replay-label">DATE</label><input className="replay-input" type="date" value={date} onChange={e=>setDate(e.target.value)} max={maxDate.toISOString().slice(0,10)} min={minDate.toISOString().slice(0,10)} style={isMobile?{width:"100%"}:undefined} /></div>
          <button className="replay-fetch-btn" onClick={fetchReplay} disabled={loading} style={isMobile?{width:"100%"}:undefined}>{loading?"Loading...":"Load Flow →"}</button>
        </div>
        <div className="replay-controls-right" style={isMobile?{display:"flex",alignItems:"center",gap:"10px"}:undefined}>
          {rows.length>0&&(<><button className="replay-play-btn" onClick={playing?stopPlay:startPlay}>{playing?"⏹ Stop":"▶ Replay"}</button><div className="replay-progress">{playing?`${playIndex}/${rows.length} trades`:`${rows.length} trades loaded`}</div></>)}
        </div>
      </div>
      {error&&<div className="replay-error">⚠ {error}</div>}
      {stats&&(<div className="replay-stats" style={isMobile?{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"8px"}:undefined}>
        <div className="rs-card"><div className="rs-label">CALL PREMIUM</div><div className="rs-val green">{fmtPrem(stats.callPremium)}</div></div>
        <div className="rs-card"><div className="rs-label">PUT PREMIUM</div><div className="rs-val red">{fmtPrem(stats.putPremium)}</div></div>
        <div className="rs-card"><div className="rs-label">SENTIMENT</div><div className={`rs-val ${stats.sentiment?.toLowerCase()}`}>{stats.sentiment}</div></div>
        <div className="rs-card"><div className="rs-label">TOTAL TRADES</div><div className="rs-val gold">{stats.totalTrades}</div></div>
        <div className="rs-card"><div className="rs-label">BLOCKS</div><div className="rs-val purple">{stats.blocks}</div></div>
        <div className="rs-card"><div className="rs-label">SWEEPS</div><div className="rs-val gold">{stats.sweeps}</div></div>
      </div>)}
      {rows.length>0&&(<div className="replay-main" style={isMobile?{display:"flex",flexDirection:"column",gap:"16px"}:undefined}>
        <div className="replay-chart"><div className="replay-chart-header">📈 {ticker} — {date} (TradingView)</div>
          <iframe src={`https://www.tradingview.com/widgetembed/?frameElementId=tradingview_replay&symbol=${ticker}&interval=5&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=F1F3F6&studies=[]&theme=dark&style=1&timezone=America%2FNew_York&withdateranges=1&showpopupbutton=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=scanner.thetrulies.com`} className="replay-iframe" style={isMobile?{height:"300px",width:"100%"}:undefined} allowTransparency={true} scrolling="no" allowFullScreen={true} />
        </div>
        <div className="replay-table-wrap">
          <div className="replay-table-header">⏮️ FLOW TAPE — {date}{playing&&<span className="replay-live-dot">● REPLAYING</span>}</div>
          <div className="replay-table-scroll" style={isMobile?{overflowX:"auto",WebkitOverflowScrolling:"touch"}:undefined}>
            <table className="flow-table"><thead><tr><th style={{color:'#FFFFFF',fontWeight:700}}>TIME</th><th style={{color:'#FFFFFF',fontWeight:700}}>CONTRACT</th><th style={{color:'#FFFFFF',fontWeight:700}}>TYPE</th><th style={{color:'#FFFFFF',fontWeight:700}}>PREMIUM</th>{!isMobile&&<th style={{color:'#FFFFFF',fontWeight:700}}>SIZE</th>}<th style={{color:'#FFFFFF',fontWeight:700}}>TAG</th></tr></thead>
              <tbody>
                {visibleRows.map((row,i)=>(<tr key={i} className={`flow-row ${row.isGolden?"golden-row":""} replay-row-enter`}><td className="td-time">{row.time}</td><td className="td-contract">${row.strike}{row.type} {row.expStr?.slice(2,10).replace(/-/g,"/")}</td><td style={{color:row.type==="C"?"#22c55e":"#ef4444",fontWeight:700}}>{row.type==="C"?"CALL":"PUT"}</td><td className={`td-premium ${row.premium>=1_000_000?"prem-block":row.premium>=500_000?"prem-big":""}`}>{fmtPrem(row.premium)}</td>{!isMobile&&<td>{row.contracts?.toLocaleString()}</td>}<td><TagBadge tag={row.tag} compact={isMobile} /></td></tr>))}
                {visibleRows.length===0&&<tr><td colSpan={isMobile?5:6} className="empty-row">Press Replay to animate the flow tape</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>)}
      {!rows.length&&!loading&&!error&&(<div className="replay-empty"><div className="replay-empty-icon">⏮️</div><div className="replay-empty-title">Flow Replay</div><div className="replay-empty-sub">Select a ticker and date, then click "Load Flow" to pull historical institutional options activity.</div></div>)}
    </div>
  );
}

function CommunityChat({ tier }) {
  const isMobile = useIsMobile();
  const hasFeature = ["elite"].includes(tier);
  const CHANNELS = [{ id:"1504283420199616624", label:"💬 General Chat" },{ id:"1514044380346847342", label:"📊 Scanner Chat" }];
  const [channel, setChannel] = useState(CHANNELS[1].id);
  if (!hasFeature) return (<div className="smart-locked"><div className="locked-icon">💬</div><div className="locked-title">TRQX Trading Floor</div><div className="locked-sub">Upgrade to Elite to chat live with the community inside the scanner</div><a href="/pricing" className="upgrade-btn" style={{marginTop:"16px"}}>Upgrade to Elite →</a></div>);
  return (
    <div style={{border:"1px solid rgba(201,168,76,0.2)",borderRadius:"12px",overflow:"hidden",background:"var(--black-3, #111)"}}>
      <div style={{padding:"12px 16px",fontFamily:"var(--font-head)",fontWeight:700,fontSize:"14px",letterSpacing:"1px",color:"var(--gold, #C9A84C)",borderBottom:"1px solid rgba(201,168,76,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
        <span>💬 TRQX TRADING FLOOR — LIVE COMMUNITY</span>
        <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
          {CHANNELS.map(c=>(<button key={c.id} onClick={()=>setChannel(c.id)} style={{background:channel===c.id?"linear-gradient(135deg, #C9A84C, #FFD700)":"transparent",color:channel===c.id?"#000":"var(--text-dim, #999)",border:channel===c.id?"1px solid #C9A84C":"1px solid rgba(201,168,76,0.3)",borderRadius:"16px",padding:"5px 14px",fontSize:"12px",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{c.label}</button>))}
          <a href="https://discord.gg/jy3ta9qkfH" target="_blank" rel="noreferrer" style={{color:"var(--text-dim, #999)",fontSize:"12px",textDecoration:"none"}}>Open in Discord ↗</a>
        </div>
      </div>
      <iframe key={channel} src={`https://e.widgetbot.io/channels/1504253974608347176/${channel}`} style={{width:"100%",height:isMobile?"65vh":"70vh",border:"none",display:"block"}} allow="clipboard-write; fullscreen" title="TRQX Discord Community" />
    </div>
  );
}

function StatsBar({ rows, stats, search, connected }) {
  const isMobile = useIsMobile();
  const searchUpper = search?.toUpperCase() || "";
  let displayStats = stats;
  if (searchUpper) {
    const activeRows = rows.filter(r => r.ticker === searchUpper);
    let fCallPrem=0, fPutPrem=0, fSweeps=0, fBlocks=0, fUnusual=0;
    for (const r of activeRows) {
      if (r.type==="C") fCallPrem+=r.premium; else fPutPrem+=r.premium;
      if (r.tag==="sweep") fSweeps++; if (r.tag==="block") fBlocks++; if (r.tag==="unusual") fUnusual++;
    }
    const fRatio = fPutPrem>0 ? fCallPrem/fPutPrem : fCallPrem>0 ? 99 : 1;
    const fSentiment = fRatio>1.5 ? "Bullish" : fRatio<0.67 ? "Bearish" : "Neutral";
    displayStats = { sentiment:fSentiment, ratio:+fRatio.toFixed(2), callPremium:fCallPrem, putPremium:fPutPrem, sweepCount:fSweeps, blockCount:fBlocks, unusualCount:fUnusual };
  }
  return (
    <div className="stats-bar" style={isMobile?{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"8px",alignItems:"stretch",padding:"10px"}:undefined}>
      {searchUpper&&<div className="stats-filter-label" style={isMobile?{gridColumn:"1 / -1",textAlign:"center"}:undefined}>📌 {searchUpper}</div>}
      <StatCard label="OVERALL FLOW" value={displayStats?.sentiment||"Loading..."} sub={`Ratio: ${displayStats?.ratio||"—"}`} color={displayStats?.sentiment==="Bullish"?"#22c55e":displayStats?.sentiment==="Bearish"?"#ef4444":"#C9A84C"} compact={isMobile} />
      <StatCard label="CALL PREMIUM" value={fmtPrem(displayStats?.callPremium)} sub={searchUpper||"Today"} color="#22c55e" compact={isMobile} />
      <StatCard label="PUT PREMIUM"  value={fmtPrem(displayStats?.putPremium)}  sub={searchUpper||"Today"} color="#ef4444" compact={isMobile} />
      <StatCard label="SWEEPS"  value={displayStats?.sweepCount ||0} color="#C9A84C" compact={isMobile} />
      <StatCard label="BLOCKS"  value={displayStats?.blockCount ||0} color="#a78bfa" compact={isMobile} />
      <StatCard label="UNUSUAL" value={displayStats?.unusualCount||0} color="#f97316" compact={isMobile} />
      <div className={`connection-badge ${connected?"conn-live":"conn-off"}`} style={isMobile?{gridColumn:"1 / -1",justifyContent:"center",display:"flex",alignItems:"center"}:undefined}>
        <span className={`conn-dot ${connected?"dot-live":"dot-off"}`} />{connected?"LIVE":"RECONNECTING"}
      </div>
    </div>
  );
}

const TABS = ["ALL","UNUSUAL","0DTE","WEEKLIES","SWINGS","LEAPS"];

export default function Scanner() {
  const isMobile = useIsMobile();
  const { token, getToken, tier } = useAuth();
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [topContracts, setTopContracts] = useState([]);
  const [heatmap, setHeatmap] = useState(null);
  const [smartMoney, setSmartMoney] = useState([]);
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [minPrem, setMinPrem] = useState(0);
  const [connected, setConnected] = useState(false);
  const [activeView, setActiveView] = useState("scanner");
  const wsRef = useRef(null);

  const features = {
    aiChat:     ["starter","pro","elite"].includes(tier),
    darkPool:   ["pro","elite"].includes(tier),
    sectorHeat: ["pro","elite"].includes(tier),
    reports:    ["pro","elite"].includes(tier),
    flowScore:  ["pro","elite"].includes(tier),
    smartMoney: ["elite"].includes(tier),
    webhooks:   ["elite"].includes(tier),
  };

  useEffect(() => {
    let ws;
    const connect = () => {
      ws = new WebSocket(`${WS}?token=${token||""}`);
      wsRef.current = ws;
      ws.onopen = () => setConnected(true);
      ws.onclose = () => { setConnected(false); setTimeout(connect, 3000); };
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type==="history") setRows(msg.rows||[]);
          if (msg.type==="flow")    setRows(r => [msg.row,...r].slice(0,500));
          if (msg.type==="stats")   setStats(msg.data);
          if (msg.type==="top_contracts") setTopContracts(msg.data||[]);
        } catch {}
      };
    };
    connect();
    return () => ws?.close();
  }, []);

  useEffect(() => {
    if (features.sectorHeat) fetch(`${API}/api/flow/heatmap`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()).then(setHeatmap).catch(()=>{});
    if (features.smartMoney) fetch(`${API}/api/flow/smart-money`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()).then(setSmartMoney).catch(()=>{});
    const interval = setInterval(() => {
      if (features.sectorHeat) fetch(`${API}/api/flow/heatmap`, { headers:{ Authorization:`Bearer ${token}` } }).then(r=>r.json()).then(setHeatmap).catch(()=>{});
    }, 30_000);
    return () => clearInterval(interval);
  }, [tier]);

  const filteredRows = rows.filter(row => {
    if (search && !row.ticker?.includes(search.toUpperCase())) return false;
    if (minPrem && row.premium < minPrem*1000) return false;
    if (tab==="UNUSUAL") return ["sweep","block","unusual"].includes(row.tag);
    if (tab==="0DTE") { const d=Math.floor((new Date(row.expStr)-Date.now())/86400000); return d<=0; }
    if (tab==="WEEKLIES") { const d=Math.floor((new Date(row.expStr)-Date.now())/86400000); return d>=1&&d<=7; }
    if (tab==="SWINGS") { const d=Math.floor((new Date(row.expStr)-Date.now())/86400000); return d>7&&d<=45; }
    if (tab==="LEAPS") { const d=Math.floor((new Date(row.expStr)-Date.now())/86400000); return d>180; }
    return true;
  });

  const mTh = { color:'#FFFFFF', fontWeight:700, fontSize:"10px", padding:"8px 6px", whiteSpace:"nowrap" };
  const mTd = { fontSize:"11px", padding:"8px 6px", whiteSpace:"nowrap" };

  return (
    <div className="scanner-page">
       <StatsBar rows={rows} stats={stats} search={search} connected={connected} />
      <TopContracts contracts={search ? topContracts.filter(c=>c.ticker?.includes(search.toUpperCase())) : topContracts} />

      <div className="view-switcher" style={isMobile?swipeRow:undefined}>
        <button style={isMobile?{flexShrink:0,whiteSpace:"nowrap"}:undefined} className={activeView==="scanner"?"view-btn active":"view-btn"} onClick={()=>setActiveView("scanner")}>📊 Flow Scanner</button>
        <button style={isMobile?{flexShrink:0,whiteSpace:"nowrap"}:undefined} className={activeView==="ai"?"view-btn active":"view-btn"} onClick={()=>setActiveView("ai")}>🤖 Ask AI</button>
        <button style={isMobile?{flexShrink:0,whiteSpace:"nowrap"}:undefined} className={activeView==="heatmap"?"view-btn active":"view-btn"} onClick={()=>setActiveView("heatmap")}>🗺️ Sector Heat</button>
        <button style={isMobile?{flexShrink:0,whiteSpace:"nowrap"}:undefined} className={activeView==="smart"?"view-btn active":"view-btn"} onClick={()=>setActiveView("smart")}>🎯 Smart Money</button>
        <button style={isMobile?{flexShrink:0,whiteSpace:"nowrap"}:undefined} className={activeView==="community"?"view-btn active":"view-btn"} onClick={()=>setActiveView("community")}>💬 Community {!["elite"].includes(tier)&&<span className="elite-badge">ELITE</span>}</button>
        <button style={isMobile?{flexShrink:0,whiteSpace:"nowrap"}:undefined} className={activeView==="orb"?"view-btn active":"view-btn"} onClick={()=>setActiveView("orb")}>📐 ORB Dashboard {!["pro","elite"].includes(tier)&&<span className="elite-badge">PRO</span>}</button>
        <button style={isMobile?{flexShrink:0,whiteSpace:"nowrap"}:undefined} className={activeView==="replay"?"view-btn active":"view-btn"} onClick={()=>setActiveView("replay")}>⏮️ Flow Replay {!["elite"].includes(tier)&&<span className="elite-badge">ELITE</span>}</button>
      </div>

      {activeView==="scanner"&&(<>
        <div className="filter-bar" style={isMobile?{display:"flex",flexDirection:"column",gap:"10px",alignItems:"stretch"}:undefined}>
          <div style={isMobile?{display:"flex",gap:"8px"}:{display:"contents"}}>
            <input className="search-input" placeholder="Filter by symbol..." value={search} onChange={e=>setSearch(e.target.value)} style={isMobile?{flex:1,minWidth:0}:undefined} />
            <select className="prem-select" value={minPrem} onChange={e=>setMinPrem(+e.target.value)} style={isMobile?{flexShrink:0}:undefined}>
              <option value={0}>All Premium</option><option value={100}>$100K+</option><option value={500}>$500K+</option><option value={1000}>$1M+</option><option value={5000}>$5M+</option>
            </select>
          </div>
          <div className="tabs" style={isMobile?swipeRow:undefined}>
            {TABS.map(t=><button key={t} className={tab===t?"tab active":"tab"} onClick={()=>setTab(t)} style={isMobile?{flexShrink:0,whiteSpace:"nowrap"}:undefined}>{t}</button>)}
          </div>
        </div>

        {isMobile?(
          <div className="table-wrap" style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
            <table className="flow-table" style={{width:"100%"}}>
              <thead><tr><th style={mTh}>TIME</th><th style={mTh}>SYM</th><th style={mTh}>CONTRACT</th><th style={mTh}>PREM</th>{features.flowScore&&<th style={mTh}>SCORE</th>}<th style={mTh}>TAG</th></tr></thead>
              <tbody>
                {filteredRows.slice(0,200).map((row,i)=>(
                  <tr key={i} className={`flow-row ${row.isGolden?"golden-row":""} ${row.tag==="block"?"block-row":""}`}>
                    <td className="td-time" style={{...mTd,fontSize:"10px"}}>{fmtTime(row.time)?.slice(0,5)}</td>
                    <td className="td-ticker" style={mTd}>{row.ticker}</td>
                    <td style={{...mTd,color:row.type==="C"?"#22c55e":"#ef4444",fontWeight:700}}>{row.strike&&`$${row.strike}${row.type} ${row.expStr?.slice(5,10).replace(/-/g,"/")}`}</td>
                    <td className={`td-premium ${row.premium>=1_000_000?"prem-block":row.premium>=500_000?"prem-big":""}`} style={mTd}>{fmtPrem(row.premium)}</td>
                    {features.flowScore&&<td style={mTd}><FlowScore score={row.flowScore} /></td>}
                    <td style={mTd}><TagBadge tag={row.tag} compact /></td>
                  </tr>
                ))}
                {filteredRows.length===0&&<tr><td colSpan={features.flowScore?6:5} className="empty-row">Waiting for flow data...</td></tr>}
              </tbody>
            </table>
          </div>
        ):(
          <div className="table-wrap">
            <table className="flow-table">
              <thead><tr>
                <th style={{color:'#FFFFFF',fontWeight:700}}>TIME</th><th style={{color:'#FFFFFF',fontWeight:700}}>SYMBOL</th>
                <th style={{color:'#FFFFFF',fontWeight:700}}>CONTRACT</th><th style={{color:'#FFFFFF',fontWeight:700}}>DTE</th>
                <th style={{color:'#FFFFFF',fontWeight:700}}>TYPE</th><th style={{color:'#FFFFFF',fontWeight:700}}>PREMIUM</th>
                <th style={{color:'#FFFFFF',fontWeight:700}}>SIZE</th><th style={{color:'#FFFFFF',fontWeight:700}}>PRICE</th>
                {features.flowScore&&<th style={{color:'#FFFFFF',fontWeight:700}}>SCORE</th>}
                <th style={{color:'#FFFFFF',fontWeight:700}}>VOL/OI</th>
                {features.darkPool&&<th style={{color:'#FFFFFF',fontWeight:700}}>IV RANK</th>}
                <th style={{color:'#FFFFFF',fontWeight:700}}>TAG</th>
              </tr></thead>
              <tbody>
                {filteredRows.slice(0,200).map((row,i)=>(
                  <tr key={i} className={`flow-row ${row.isGolden?"golden-row":""} ${row.tag==="block"?"block-row":""}`}>
                    <td className="td-time">{fmtTime(row.time)}</td><td className="td-ticker">{row.ticker}</td>
                    <td className="td-contract">{row.strike&&`$${row.strike}${row.type} ${row.expStr?.slice(2,10).replace(/-/g,"/")}`}</td>
                    <td><DTE expStr={row.expStr} /></td>
                    <td style={{color:row.type==="C"?"#22c55e":"#ef4444",fontWeight:700}}>{row.type==="C"?"CALL":"PUT"}</td>
                    <td className={`td-premium ${row.premium>=1_000_000?"prem-block":row.premium>=500_000?"prem-big":""}`}>{fmtPrem(row.premium)}</td>
                    <td>{row.contracts?.toLocaleString()}</td><td>${row.price?.toFixed(2)}</td>
                    {features.flowScore&&<td><FlowScore score={row.flowScore} /></td>}
                    <td className="td-ratio">{row.ratio>0?`${row.ratio}x`:"—"}</td>
                    {features.darkPool&&<td className="td-iv">{row.ivRank!=null?`${row.ivRank}%`:"—"}</td>}
                    <td><TagBadge tag={row.tag} /></td>
                  </tr>
                ))}
                {filteredRows.length===0&&<tr><td colSpan="13" className="empty-row">Waiting for flow data...</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </>)}

      {activeView==="ai"        && <AIChat hasFeature={features.aiChat} />}
      {activeView==="heatmap"   && <SectorHeatmap data={heatmap} hasFeature={features.sectorHeat} />}
      {activeView==="smart"     && <SmartMoney data={smartMoney} hasFeature={features.smartMoney} />}
      {activeView==="community" && <CommunityChat tier={tier} />}
      {activeView==="orb"       && <ORBDashboard token={token} tier={tier} />}
      {activeView==="replay"    && <FlowReplay hasFeature={features.smartMoney} token={token} />}
    </div>
  );
}
