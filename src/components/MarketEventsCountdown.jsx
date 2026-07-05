// ============================================================
// TRQX Capital Terminal — Market Events Countdown
// File: src/components/MarketEventsCountdown.jsx  (NEW FILE — complete)
//
// Usage on the Economic/News page:
//   <MarketEventsCountdown
//     apiBase={API_BASE}            // your existing backend base URL const
//     authToken={token}             // Supabase JWT for report requests
//     userTier={tier}               // 'free' | 'starter' | 'pro' | 'elite'
//   />
//
// All styling inline (Vercel CSS caching rule). The only <style>
// tag is the pulse keyframe, which ships inside the JS bundle.
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ---- Brand tokens (adjust to match your existing constants) ----
const C = {
  bg: '#0b0e13',
  panel: '#12161f',
  panelBorder: '#1f2530',
  gold: '#d4af37',
  goldDim: 'rgba(212,175,55,0.14)',
  text: '#e8e6e0',
  textDim: '#8a8f9a',
  amber: '#f0a030',
  red: '#e5484d',
  green: '#30a46c',
};

const TYPE_META = {
  quadwitch:      { label: 'QUAD WITCHING', color: '#a06bff', bg: 'rgba(160,107,255,0.14)' },
  opex:           { label: 'OPEX',          color: C.gold,    bg: C.goldDim },
  vix:            { label: 'VIX EXP',       color: '#6bb8ff', bg: 'rgba(107,184,255,0.12)' },
  fomc:           { label: 'FOMC',          color: C.red,     bg: 'rgba(229,72,77,0.12)' },
  macro:          { label: 'MACRO',         color: C.amber,   bg: 'rgba(240,160,48,0.12)' },
  earnings:       { label: 'EARNINGS',      color: C.green,   bg: 'rgba(48,164,108,0.12)' },
  'central-bank': { label: 'CENTRAL BANK',  color: '#6bb8ff', bg: 'rgba(107,184,255,0.12)' },
  geo:            { label: 'GEOPOLITICAL',  color: '#ff8f6b', bg: 'rgba(255,143,107,0.12)' },
  econ:           { label: 'ECON',          color: C.amber,   bg: 'rgba(240,160,48,0.12)' },
};

function fmtCountdown(ms) {
  if (ms <= 0) return 'LIVE';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function countdownColor(ms) {
  if (ms <= 0) return C.green;
  if (ms < 3.6e6) return C.red;        // < 1 hour
  if (ms < 8.64e7) return C.amber;     // < 24 hours
  return C.text;
}

function fmtEventTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export default function MarketEventsCountdown({ apiBase = '', authToken, userTier = 'free' }) {
  const [events, setEvents] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(null); // event for report modal
  const [report, setReport] = useState(null);
  const [reportState, setReportState] = useState('idle'); // idle | loading | ready | locked | error
  const intervalRef = useRef(null);

  const isPaid = ['pro', 'elite'].includes((userTier || '').toLowerCase());

  // ---- Fetch merged events (Tier 1 + 3 from backend) --------
  useEffect(() => {
    let alive = true;
    fetch(`${apiBase}/api/market-events?limit=15`)
      .then((r) => r.json())
      .then((d) => { if (alive && d.events) setEvents(d.events); })
      .catch((e) => console.error('[MarketEvents] fetch failed:', e));
    return () => { alive = false; };
  }, [apiBase]);

  // ---- Single 1-second tick for ALL countdowns ---------------
  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // ---- Report fetch ------------------------------------------
  const openReport = useCallback((ev) => {
    setSelected(ev);
    setReport(null);
    if (!isPaid) { setReportState('locked'); return; }
    setReportState('loading');
    fetch(`${apiBase}/api/market-events/${encodeURIComponent(ev.id)}/report`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((r) => {
        if (r.status === 403 || r.status === 401) { setReportState('locked'); return null; }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { if (d?.report) { setReport(d.report); setReportState('ready'); } })
      .catch((e) => { console.error('[MarketEvents] report failed:', e); setReportState('error'); });
  }, [apiBase, authToken, isPaid]);

  const upcoming = events.filter((e) => new Date(e.time).getTime() > now - 3.6e6); // keep LIVE 1h
  const strip = upcoming.slice(0, expanded ? upcoming.length : 4);

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16, fontFamily: 'inherit' }}>
      <style>{`@keyframes trqxPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: C.gold, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em' }}>MARKET MOVERS</span>
          <span style={{ color: C.textDim, fontSize: 11 }}>next {strip.length} events</span>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{ background: 'transparent', border: `1px solid ${C.panelBorder}`, color: C.textDim, borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer' }}
        >
          {expanded ? 'Show less' : 'Show all'}
        </button>
      </div>

      {/* Event rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {strip.length === 0 && (
          <div style={{ color: C.textDim, fontSize: 13, padding: '8px 0' }}>Loading upcoming events…</div>
        )}
        {strip.map((ev) => {
          const ms = new Date(ev.time).getTime() - now;
          const meta = TYPE_META[ev.type] || TYPE_META.econ;
          const live = ms <= 0;
          const urgent = ms > 0 && ms < 3.6e6;
          return (
            <div
              key={ev.id}
              onClick={() => openReport(ev)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                background: C.bg, border: `1px solid ${ev.type === 'quadwitch' ? meta.color : C.panelBorder}`,
                borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
              }}
            >
              <span style={{
                background: meta.bg, color: meta.color, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.08em', borderRadius: 4, padding: '3px 7px', whiteSpace: 'nowrap',
              }}>
                {meta.label}
              </span>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{ev.name}</div>
                <div style={{ color: C.textDim, fontSize: 11 }}>{fmtEventTime(ev.time)}</div>
              </div>
              <div style={{
                fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 15,
                color: countdownColor(ms), minWidth: 96, textAlign: 'right',
                animation: (live || urgent) ? 'trqxPulse 1.4s ease-in-out infinite' : 'none',
              }}>
                {fmtCountdown(ms)}
              </div>
              <span style={{ color: C.textDim, fontSize: 11, whiteSpace: 'nowrap' }}>
                {isPaid ? 'Report ▸' : '🔒 Report'}
              </span>
            </div>
          );
        })}
      </div>

      {/* ---------------- Report Modal ---------------- */}
      {selected && (
        <div
          onClick={() => { setSelected(null); setReport(null); setReportState('idle'); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.panel, border: `1px solid ${C.gold}`, borderRadius: 12,
              width: '100%', maxWidth: 640, maxHeight: '82vh', overflowY: 'auto', padding: 22,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>IMPACT REPORT</div>
                <div style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>{selected.name}</div>
                <div style={{ color: C.textDim, fontSize: 12 }}>{fmtEventTime(selected.time)}</div>
              </div>
              <button
                onClick={() => { setSelected(null); setReport(null); setReportState('idle'); }}
                style={{ background: 'transparent', border: 'none', color: C.textDim, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
              >✕</button>
            </div>

            {reportState === 'locked' && (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>🔒</div>
                <div style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                  AI Impact Reports are a Pro & Elite feature
                </div>
                <div style={{ color: C.textDim, fontSize: 13, marginBottom: 18 }}>
                  Dealer-flow mechanics, scenario analysis, and a pre-event watchlist for every major market event.
                </div>
                <a
                  href="/pricing"
                  style={{
                    display: 'inline-block', background: C.gold, color: '#0b0e13', fontWeight: 700,
                    borderRadius: 8, padding: '10px 22px', fontSize: 13, textDecoration: 'none',
                  }}
                >
                  Upgrade to Pro
                </a>
              </div>
            )}

            {reportState === 'loading' && (
              <div style={{ color: C.textDim, fontSize: 13, padding: '26px 0', textAlign: 'center' }}>
                Generating impact analysis…
              </div>
            )}

            {reportState === 'error' && (
              <div style={{ color: C.red, fontSize: 13, padding: '20px 0' }}>
                Report unavailable right now. Try again in a moment.
              </div>
            )}

            {reportState === 'ready' && report && (
              <div style={{ marginTop: 10 }}>
                <div style={{ color: C.gold, fontSize: 14, fontStyle: 'italic', marginBottom: 14 }}>
                  {report.headline}
                </div>

                <SectionTitle>Market Mechanics</SectionTitle>
                <p style={{ color: C.text, fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{report.mechanics}</p>

                {Array.isArray(report.scenarios) && report.scenarios.length > 0 && (
                  <>
                    <SectionTitle>Scenarios</SectionTitle>
                    {report.scenarios.map((s, i) => (
                      <div key={i} style={{ background: C.bg, border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                        <div style={{ color: C.gold, fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{s.label}</div>
                        <div style={{ color: C.text, fontSize: 13, lineHeight: 1.55 }}>{s.detail}</div>
                      </div>
                    ))}
                  </>
                )}

                {Array.isArray(report.watchlist) && report.watchlist.length > 0 && (
                  <>
                    <SectionTitle>What to Watch</SectionTitle>
                    {report.watchlist.map((w, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, color: C.text, fontSize: 13, lineHeight: 1.6, marginBottom: 4 }}>
                        <span style={{ color: C.gold }}>▸</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </>
                )}

                {report.historical_context && (
                  <>
                    <SectionTitle>Historical Context</SectionTitle>
                    <p style={{ color: C.text, fontSize: 13, lineHeight: 1.65 }}>{report.historical_context}</p>
                  </>
                )}

                <div style={{ color: C.textDim, fontSize: 11, marginTop: 16, borderTop: `1px solid ${C.panelBorder}`, paddingTop: 10 }}>
                  {report.disclaimer || 'Educational content only. Not financial advice. No outcome is guaranteed.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ color: '#8a8f9a', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '16px 0 8px' }}>
      {children}
    </div>
  );
}
