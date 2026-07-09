/**
* TRQX Flow Scanner — Backend Server v2.5
*
* v2.3 changes from v2.2:
*  - Supabase token verification now uses jose + createRemoteJWKSet instead of
*    a manual base64 decode. This actually checks the signature against your
*    project's live JWKS, and keeps working unchanged whether your project is
*    on the legacy HS256 secret (current state) or migrates to asymmetric
*    JWT Signing Keys later.
*  - decodeJWTEmail is now verified the same way, closing the owner-override
*    spoofing hole in /api/ai/chat and /api/webhooks/discord.
*
* v2.4 changes from v2.3:
*  - Whop webhook verification replaced with the official @whop/sdk
*    webhooks.unwrap() call. The earlier hand-rolled HMAC check assumed
*    a generic "x-whop-signature: hex-digest" scheme — Whop actually
*    follows the Standard Webhooks spec (webhook-id / webhook-signature /
*    webhook-timestamp headers, base64 signature with a "v1," prefix),
*    so the old check could never have matched a real signature. The SDK
*    handles unwrapping, signature verification, and timestamp/replay
*    checks in one call.
*  - Fixed membership tier-downgrade logic to check the real Whop event
*    name "membership.deactivated" — the previous version checked
*    "membership.went_invalid" / "membership.expired", which don't
*    exist in Whop's API, so downgrades were silently never firing.
*
* v2.5 changes from v2.4:
*  - SESSION-ANCHORED FLOW STATS: buildFlowStats() previously aggregated
*    flowCache.slice(0, 1500) — a floating window whose composition changed
*    with every rotation-batch poll, causing the header tiles to oscillate
*    between unrelated totals. Stats are now anchored to a trading session:
*    every ingested row is stamped with its ET sessionDate, live-session
*    stats aggregate ONLY today's rows, and closed-market stats return the
*    most recent completed session clearly labeled (session/sessionDate
*    fields in the payload).
*  - PER-CONTRACT DEDUPE: Polygon snapshot day.volume is CUMULATIVE, so the
*    same contract was being re-ingested every time its premium ticked and
*    then SUMMED across duplicates — systematically inflating callPremium/
*    putPremium in stats, top contracts, ticker lookup, and gamma. All
*    aggregations now use the latest row per unique contract.
*  - MARKET-HOURS POLL GATE: the Polygon poller now only runs during the
*    regular session (9:30 AM – 4:00 PM ET, 1:00 PM on early-close days,
*    weekends/NYSE holidays skipped). No more premarket ghost ingestion,
*    and no wasted API calls overnight.
*  - QUOTE STALE-CACHE FALLBACK: /api/quote/:ticker now serves the last
*    cached quote (flagged stale: true) when Finnhub rate-limits or errors,
*    instead of 502 "upstream error".
*  - VIX removed from ROTATION_TICKERS — current Polygon plan doesn't cover
*    VIX, so polling it was pure waste. The /api/quote VIX handler remains
*    in place for when the Polygon Indices plan is upgraded.
*/

import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { Whop } from "@whop/sdk";
import "dotenv/config";
import { createMarketEventsRouter } from "./marketEvents.js";

const PORT = process.env.PORT || 3001;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY || "YOUR_KEY_HERE";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const FMP_API_KEY = process.env.FMP_API_KEY || "";
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";
const econCache = { ts: 0, data: [] };
const ECON_CACHE_TTL = 30 * 60 * 1000;
const quoteCache = new Map();
const QUOTE_CACHE_TTL = 30 * 1000;

// ─── MARKET SESSION HELPERS ────────────────────────────────────────────────
// NYSE full-day closures (OBSERVED dates) and early closes (1:00 PM ET).
// Keep in sync with the frontend Dashboard banner arrays.
const NYSE_HOLIDAYS_SET = new Set([
  // 2026
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25",
  "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  // 2027
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31",
  "2027-06-18", "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24",
]);
const NYSE_EARLY_CLOSES_SET = new Set([
  "2026-11-27", "2026-12-24", "2027-11-26",
]);

function etDateString(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

function etNowInfo() {
  const now = new Date();
  const ny = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const mins = ny.getHours() * 60 + ny.getMinutes();
  const dow = ny.getDay();
  const dateStr = etDateString(now);
  const isWeekend = dow === 0 || dow === 6;
  const isHoliday = NYSE_HOLIDAYS_SET.has(dateStr);
  const closeMins = NYSE_EARLY_CLOSES_SET.has(dateStr) ? 13 * 60 : 16 * 60; // 1 PM early close, else 4 PM
  const isOpen = !isWeekend && !isHoliday && mins >= 570 && mins < closeMins; // 9:30 AM ET open
  return { dateStr, mins, isWeekend, isHoliday, isOpen, closeMins };
}

// Latest row per unique contract. Polygon snapshot day.volume is cumulative,
// so duplicate ingests of the same contract must NOT be summed — the newest
// row already contains the full day total for that contract.
function latestRowsByContract(rows) {
  const m = new Map();
  for (const row of rows) {
    const key = `${row.ticker}-${row.type}-${row.strike}-${row.expStr}`;
    const existing = m.get(key);
    if (!existing || (row.ts ?? 0) > (existing.ts ?? 0)) m.set(key, row);
  }
  return [...m.values()];
}

// ─── PREMARKET HELPER ──────────────────────────────────────────────────────
async function getPremarketData(ticker, prevClose) {
  try {
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).toISOString().slice(0, 10);
    const res = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/minute/${today}/${today}?adjusted=true&sort=asc&limit=500&apiKey=${POLYGON_API_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    const bars = (data.results ?? []).filter(b => {
      const ny = new Date(new Date(b.t).toLocaleString("en-US", { timeZone: "America/New_York" }));
      const mins = ny.getHours() * 60 + ny.getMinutes();
      return mins >= 240 && mins < 570; // 4:00 AM – 9:30 AM ET
    });
    if (!bars.length) return null;

    const last = bars[bars.length - 1].c;
    const high = Math.max(...bars.map(b => b.h));
    const low = Math.min(...bars.map(b => b.l));
    const change = prevClose ? +(last - prevClose).toFixed(2) : null;
    const changePct = prevClose ? +((change / prevClose) * 100).toFixed(2) : null;

    return { price: +last.toFixed(2), change, changePct, high: +high.toFixed(2), low: +low.toFixed(2) };
  } catch (e) {
    console.warn(`[premarket] ${ticker}:`, e.message);
    return null;
  }
}
// -- SUPABASE AUTH ----------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_JWKS = SUPABASE_URL
  ? createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`))
  : null;
const OWNER_EMAILS_LIST = ["michaelvalerio@thetrulies.com", "michaelvalerio@taurustechs.com"];

async function verifySupabaseToken(token) {
  if (!token || !SUPABASE_JWKS) return { valid: false, tier: "free", email: null, userId: null };
  try {
    const { payload } = await jwtVerify(token, SUPABASE_JWKS);
    const email = payload.email ?? null;
    const userId = payload.sub ?? null;
    if (email && OWNER_EMAILS_LIST.includes(email)) return { valid: true, tier: "elite", email, userId };
    let tier = "free";
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY && userId) {
      try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=tier`, {
          headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
        });
        if (r.ok) {
          const rows = await r.json();
          if (rows?.[0]?.tier) tier = rows[0].tier;
        }
      } catch (e) { console.warn("[auth] profile lookup failed:", e.message); }
    }
    return { valid: true, tier, email, userId };
  } catch (e) {
    return { valid: false, tier: "free", email: null, userId: null };
  }
}

async function decodeJWTEmail(token) {
  if (!token || !SUPABASE_JWKS) return null;
  try {
    const { payload } = await jwtVerify(token, SUPABASE_JWKS);
    return payload.email ?? null;
  } catch { return null; }
}

const WHOP_API_KEY         = process.env.WHOP_API_KEY;
const WHOP_WEBHOOK_SECRET  = process.env.WHOP_WEBHOOK_SECRET;
const WHOP_PRODUCT_STARTER = process.env.WHOP_PRODUCT_STARTER ?? "prod_SHVHy0ZiiBFm5";
const WHOP_PRODUCT_PRO     = process.env.WHOP_PRODUCT_PRO     ?? "prod_RzY99mUJeeGKD";
const WHOP_PRODUCT_ELITE   = process.env.WHOP_PRODUCT_ELITE   ?? "prod_qXgVPhmWTy9By";

const whopsdk = WHOP_WEBHOOK_SECRET
  ? new Whop({ webhookKey: Buffer.from(WHOP_WEBHOOK_SECRET).toString("base64") })
  : null;

const PRODUCT_TO_TIER = {
[WHOP_PRODUCT_STARTER]: "starter",
[WHOP_PRODUCT_PRO]:     "pro",
[WHOP_PRODUCT_ELITE]:   "elite",
};

const TIERS = {
free:    { delay: 0, maxRows: 20,  features: ["basic_flow"] },
starter: { delay: 0, maxRows: 100, features: ["basic_flow", "filters", "alerts", "ai_chat"] },
pro:     { delay: 0, maxRows: 500, features: ["basic_flow", "filters", "alerts", "ai_chat", "dark_pool", "golden", "sector_heat", "reports", "flow_score"] },
elite:   { delay: 0, maxRows: 999, features: ["basic_flow", "filters", "alerts", "ai_chat", "dark_pool", "golden", "sector_heat", "reports", "flow_score", "webhooks", "api_access", "smart_money", "flow_replay"] },
};

// ── EMAIL (Resend) ─────────────────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "TRQX Capital <scanner@thetrulies.com>";
const SITE_URL = process.env.FRONTEND_URL || "https://trqx.thetrulies.com";
const CROWN_IMG = "https://trqx.thetrulies.com/logo.png";

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) { console.log("[email] skipped (no key):", subject, "→", to); return false; }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html }),
    });
    if (!r.ok) { console.error("[email] send failed:", r.status, await r.text()); return false; }
    console.log(`[email] sent "${subject}" to ${to}`);
    return true;
  } catch (e) { console.error("[email] error:", e.message); return false; }
}

function emailShell(inner) {
return `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#07090c;">
<div style="max-width:560px;margin:0 auto;padding:56px 24px;font-family:Georgia,'Times New Roman',serif;">
  <div style="text-align:center;padding-bottom:40px;">
    <img src="${CROWN_IMG}" width="64" alt="" style="display:inline-block;" />
    <div style="color:#d4af37;font-size:30px;letter-spacing:12px;margin-top:14px;font-family:Georgia,serif;">TRQX</div>
    <div style="color:#6b7280;font-size:10px;letter-spacing:6px;margin-top:6px;font-family:Arial,sans-serif;">C A P I T A L &nbsp;T E R M I N A L</div>
  </div>
  <div style="height:1px;background:linear-gradient(90deg,transparent,#d4af37,transparent);margin-bottom:40px;"></div>
  <div style="color:#e5e1d8;font-size:16px;line-height:1.8;">${inner}</div>
  <div style="height:1px;background:linear-gradient(90deg,transparent,#2a2a2a,transparent);margin:48px 0 24px;"></div>
  <div style="text-align:center;color:#d4af37;font-size:11px;letter-spacing:4px;font-family:Arial,sans-serif;">PRECISION &middot; DISCIPLINE &middot; EXECUTION</div>
  <div style="text-align:center;color:#4b5563;font-size:11px;padding-top:12px;font-family:Arial,sans-serif;">&copy; ${new Date().getFullYear()} Tru Quant Capital &nbsp;&middot;&nbsp; Educational content, not financial advice</div>
</div></body></html>`;
}

function goldButton(text, url) {
return `<div style="text-align:center;padding:28px 0 8px;"><a href="${url}" style="display:inline-block;background-color:#d4af37;color:#0a0a0a;font-weight:bold;font-size:13px;letter-spacing:3px;padding:16px 44px;border-radius:2px;text-decoration:none;font-family:Arial,sans-serif;">${text}</a></div>`;
}

function welcomeEmailHTML() {
return emailShell(`
  <div style="color:#f5f1e8;font-size:24px;font-family:Georgia,serif;padding-bottom:18px;">Welcome to the Terminal.</div>
  <p style="margin:0 0 16px;color:#c9c4b8;">You now have access to the same market intelligence institutions pay six figures for — live options flow, dealer positioning, gamma levels, and an AI analyst that never sleeps.</p>
  <p style="margin:0 0 8px;color:#c9c4b8;">Most traders react to the market. You're about to read it first.</p>
  ${goldButton("ENTER THE TERMINAL", SITE_URL)}
  <p style="margin:24px 0 0;color:#6b7280;font-size:13px;font-family:Arial,sans-serif;">New here? Start with the Academy — then open the Flow Scanner when the bell rings.</p>
`);
}

const TIER_PERKS = {
starter: ["Live options flow", "Smart filters", "Alerts", "Ask AI chat"],
pro:     ["Everything in Starter", "GEMX gamma analytics", "Capital Allocator", "Morning Coach", "Flow Score", "AI Reports"],
elite:   ["Everything in Pro", "Smart Money Tracker", "Flow Replay", "Discord webhooks", "API access"],
};

function tierUpgradeEmailHTML(tier) {
const perks = (TIER_PERKS[tier] || []).map(p => `<li style="padding:4px 0;color:#c9c4b8;">${p}</li>`).join("");
return emailShell(`
  <div style="color:#f5f1e8;font-size:24px;font-family:Georgia,serif;padding-bottom:18px;">${tier.toUpperCase()} access unlocked.</div>
  <p style="margin:0 0 16px;color:#c9c4b8;">Your ${tier.charAt(0).toUpperCase() + tier.slice(1)} membership is live. Here's what just opened up:</p>
  <ul style="margin:0;padding-left:20px;">${perks}</ul>
  ${goldButton("OPEN THE TERMINAL", SITE_URL)}
`);
}

function cancelEmailHTML() {
return emailShell(`
  <div style="color:#f5f1e8;font-size:24px;font-family:Georgia,serif;padding-bottom:18px;">Your membership has ended.</div>
  <p style="margin:0 0 16px;color:#c9c4b8;">Your paid access has been deactivated and your account is now on the free tier. Your data and progress are saved — everything unlocks again the moment you return.</p>
  ${goldButton("REJOIN THE TERMINAL", SITE_URL + "/pricing")}
`);
}

async function verifyWhopToken(accessToken) {
try {
const res = await fetch("https://api.whop.com/api/v2/me", { headers: { Authorization: `Bearer ${accessToken}` } });
if (!res.ok) return { valid: false, tier: "free" };
const me = await res.json();
const memberships = await fetch(`https://api.whop.com/api/v2/memberships?user_id=${me.id}&status=active`, { headers: { Authorization: `Bearer ${WHOP_API_KEY}` } });
if (!memberships.ok) return { valid: true, tier: "free", userId: me.id };
const { data } = await memberships.json();
if (OWNER_EMAILS_LIST.includes(me.email)) return { valid: true, tier: "elite", userId: me.id, email: me.email };
let tier = "free";
for (const membership of data ?? []) {
const mapped = PRODUCT_TO_TIER[membership.product_id];
if (mapped === "elite") { tier = "elite"; break; }
if (mapped === "pro" && tier !== "elite") tier = "pro";
if (mapped === "starter" && tier === "free") tier = "starter";
}
return { valid: true, tier, userId: me.id, email: me.email };
} catch (e) { console.error("[whop] verify error:", e.message); return { valid: false, tier: "free" }; }
}

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://thetrulies.com",
  "https://www.thetrulies.com",
  "https://trqx.thetrulies.com",
  "https://www.trqx.thetrulies.com",
  "https://app.thetrulies.com",
  "https://scanner.thetrulies.com",
  "https://trqx-terminal.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn("[CORS BLOCKED]", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());
 
app.post("/api/webhooks/whop", express.raw({ type: "*/*" }), async (req, res) => {
try {
if (!whopsdk) {
console.error("[whop-webhook] WHOP_WEBHOOK_SECRET not set — rejecting webhook");
return res.status(500).json({ error: "Webhook verification not configured" });
}

// unwrap() verifies the Standard Webhooks signature (webhook-id /
// webhook-signature / webhook-timestamp headers) against your secret
// and throws if it doesn't match, is expired, or is malformed. We
// never touch req.body directly — the SDK owns the whole check.
let event;
try {
const rawBody = req.body.toString("utf8");
const headers = Object.fromEntries(
Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
);
event = whopsdk.webhooks.unwrap(rawBody, { headers });
} catch (sigErr) {
console.warn("[whop-webhook] rejected — invalid or missing signature:", sigErr.message);
return res.status(401).json({ error: "Invalid signature" });
}

console.log("[whop-webhook] event:", event.type);
const membership = event.data;
if (!membership) return res.json({ ok: true });
const planId = membership.plan_id ?? membership.product_id ?? "";
const userEmail = membership.user?.email ?? membership.email ?? null;
const PLAN_TO_TIER = {
[WHOP_PRODUCT_STARTER]: "starter", [WHOP_PRODUCT_PRO]: "pro", [WHOP_PRODUCT_ELITE]: "elite",
"plan_LWVD4he4XzBOu": "starter", "plan_SarSbAr6sTmHX": "pro", "plan_HnDGEy49ygh07": "elite",
};
let tier = PLAN_TO_TIER[planId] ?? "starter";
// Real Whop event names, confirmed against current docs — the
// previous version checked "membership.went_invalid" / "membership.expired",
// which don't match what Whop actually sends and meant downgrades
// never fired.
if (event.type === "membership.deactivated") tier = "free";
if (userEmail && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
const findRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(userEmail)}&select=id`, {
headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` }
});
if (findRes.ok) {
const users = await findRes.json();
if (users.length > 0) {
await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${users[0].id}`, {
method: "PATCH",
headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
body: JSON.stringify({ tier }),
});
}
}
}
if (userEmail) {
if (tier === "free") sendEmail({ to: userEmail, subject: "Your TRQX membership has ended", html: cancelEmailHTML() }).catch(() => {});
else sendEmail({ to: userEmail, subject: `TRQX ${tier.toUpperCase()} Unlocked`, html: tierUpgradeEmailHTML(tier) }).catch(() => {});
}
res.json({ ok: true });
} catch (e) { console.error("[whop-webhook] error:", e.message); res.status(500).json({ error: e.message }); }
});

app.use(express.json());
app.get("/health", (_, res) => res.json({ status: "ok", ts: Date.now() }));
app.use("/api/market-events", createMarketEventsRouter({ verifySupabaseToken }));
console.log("[market-events] router mounted");
// ─── QUOTE ENDPOINT ─────────────────────────────────────────────────────────
app.get("/api/quote/:ticker", async (req, res) => {
  const ticker = String(req.params.ticker || "").toUpperCase();
  if (!ticker) return res.status(400).json({ error: "ticker required" });

  if (ticker === "VIX") {
    try {
      const r = await fetch(`https://api.polygon.io/v1/indices/value?ticker=I:VIX&apiKey=${POLYGON_API_KEY}`);
      if (r.ok) {
        const data = await r.json();
        if (data.status === "OK" && data.value) {
          const last = data.value;
          const prevRes = await fetch(`https://api.polygon.io/v1/open-close/I:VIX/prev?apiKey=${POLYGON_API_KEY}`);
          const prevData = prevRes.ok ? await prevRes.json() : {};
          const prevClose = prevData.close || null;
          const change = prevClose ? +(last - prevClose).toFixed(2) : null;
          const changePct = prevClose ? +((change / prevClose) * 100).toFixed(2) : null;
          return res.json({ ticker: "VIX", last, change, changePct, prevClose, open: null, high: null, low: null });
        }
      }
    } catch (e) {
      console.error("[vix] error:", e.message);
    }
    return res.json({ ticker: "VIX", last: null, change: null, changePct: null, prevClose: null });
  }

  const cached = quoteCache.get(ticker);
  if (cached && Date.now() - cached.ts < QUOTE_CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`);
    if (!r.ok) {
      console.error(`[quote] Finnhub error for ${ticker}:`, r.status);
      // Serve last known good quote instead of failing — a slightly stale
      // price beats a broken tape when Finnhub rate-limits a burst.
      if (cached) return res.json({ ...cached.data, stale: true });
      return res.status(502).json({ error: "upstream error" });
    }
    const data = await r.json();

    const last = data.c || null;
    const prevClose = data.pc || null;
    const change = last && prevClose ? +(last - prevClose).toFixed(2) : null;
    const changePct = last && prevClose ? +((change / prevClose) * 100).toFixed(2) : null;

    const result = {
      ticker,
      last,
      change,
      changePct,
      open: data.o || null,
      high: data.h || null,
      low: data.l || null,
      prevClose,
    };
    let premarket = null;
if (isPremarketWindowET() && last) {
  premarket = { price: last, change, changePct, high: data.h || null, low: data.l || null };
}
result.premarket = premarket;
    quoteCache.set(ticker, { ts: Date.now(), data: result });
    res.json(result);
  } catch (err) {
    console.error(`[quote] Error for ${ticker}:`, err.message);
    if (cached) return res.json({ ...cached.data, stale: true });
    res.status(500).json({ error: "internal error" });
  }
});
function isPremarketWindowET() {
  const now = new Date();
  const ny = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const mins = ny.getHours() * 60 + ny.getMinutes();
  return mins >= 240 && mins < 570; // 4:00 AM – 9:30 AM ET
}

// ─── ECONOMIC CALENDAR ─────────────────────────────────────────────
app.get("/api/economic-calendar", async (req, res) => {
  try {
    if (econCache.data.length && Date.now() - econCache.ts < ECON_CACHE_TTL) {
      return res.json({ events: econCache.data });
    }
    const r = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json");
    if (!r.ok) {
      console.error("[econ-calendar] FF feed error:", r.status);
      if (econCache.data.length) return res.json({ events: econCache.data, stale: true });
      return res.status(502).json({ error: "upstream error", events: [] });
   }
    const data = await r.json();
    const events = (data || [])
      .filter(e => e.country === "USD")   // US events only — drop this line if you want global
      .map(e => ({
        date: e.date,
        time: e.date
          ? new Date(e.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "America/New_York" })
          : "TBD",
        event: e.title || "Economic Event",
        country: e.country || "US",
        impact: e.impact || "Medium",     // FF gives "High" / "Medium" / "Low"
        actual: e.actual ?? null,
        estimate: e.forecast ?? null,
        previous: e.previous ?? null,
      }));
    econCache.ts = Date.now();
    econCache.data = events;
    res.json({ events });
  } catch (err) {
    console.error("[econ-calendar] error:", err.message);
    res.status(500).json({ error: err.message, events: [] });
  }
});
// ─── END FUTURES ENDPOINT ──────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// CAPITAL ALLOCATOR — LIVE PRICE VERSION
// ─────────────────────────────────────────────────────────────

async function getLiveStockPrice(symbol) {
  try {
    const r = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    if (!r.ok) throw new Error(`Finnhub quote failed for ${symbol}`);

    const data = await r.json();
    const price = Number(data.c || 0);

    if (!price || price <= 0) throw new Error(`No live price for ${symbol}`);

    return Number(price.toFixed(2));
  } catch (e) {
    console.warn("[capital allocator price fallback]", symbol, e.message);
    return null;
  }
}

function buildPosition({ ticker, name, sector, weight, capital, price, reasoning }) {
  const targetDollars = Math.floor(capital * weight);
  const shares = price ? Math.floor(targetDollars / price) : 0;
  const dollarAmount = shares * price;

  return {
    ticker,
    name,
    sector,
    shares,
    price,
    dollarAmount: Number(dollarAmount.toFixed(2)),
    reasoning
  };
}

app.post("/api/capital-allocator", async (req, res) => {
  try {
    const {
      amount,
      goal,
      targetGoal,
      targetTimeframe,
      horizon,
      sectors = [],
      lossReaction
    } = req.body;

    const capital = Number(amount || 0);

    if (!capital || capital < 50) {
      return res.status(400).json({ error: "Minimum capital amount is $50" });
    }

    const riskTier =
      lossReaction === "panic"
        ? "Conservative"
        : lossReaction === "uncomfortable"
        ? "Moderate"
        : "Aggressive";

    const timeframeEstimate =
      horizon === "days"
        ? "Days to Weeks"
        : horizon === "months"
        ? "Several Months"
        : horizon === "year"
        ? "6–12 Months"
        : "1+ Years";

    let modelPortfolio;

    if (riskTier === "Conservative") {
      modelPortfolio = [
        {
          ticker: "AAPL",
          name: "Apple",
          sector: "Technology",
          weight: 0.3,
          reasoning:
            "Large-cap stability, strong balance sheet, and consistent cash generation."
        },
        {
          ticker: "MSFT",
          name: "Microsoft",
          sector: "Technology",
          weight: 0.3,
          reasoning:
            "Diversified technology leader with strong enterprise and cloud exposure."
        },
        {
          ticker: "VOO",
          name: "Vanguard S&P 500 ETF",
          sector: "ETF",
          weight: 0.3,
          reasoning:
            "Broad market exposure to reduce single-stock concentration risk."
        }
      ];
    } else if (riskTier === "Moderate") {
      modelPortfolio = [
        {
          ticker: "NVDA",
          name: "NVIDIA",
          sector: "Technology",
          weight: 0.35,
          reasoning:
            "AI infrastructure leader with strong growth exposure."
        },
        {
          ticker: "AMZN",
          name: "Amazon",
          sector: "Consumer/Cloud",
          weight: 0.25,
          reasoning:
            "Cloud, ecommerce, and advertising exposure with long-term growth potential."
        },
        {
          ticker: "VOO",
          name: "Vanguard S&P 500 ETF",
          sector: "ETF",
          weight: 0.3,
          reasoning:
            "Diversification anchor to balance individual stock risk."
        }
      ];
    } else {
      modelPortfolio = [
        {
          ticker: "NVDA",
          name: "NVIDIA",
          sector: "Technology",
          weight: 0.4,
          reasoning:
            "High-growth AI infrastructure leader."
        },
        {
          ticker: "PLTR",
          name: "Palantir",
          sector: "Defense/AI",
          weight: 0.25,
          reasoning:
            "Aggressive growth exposure in AI software and government contracts."
        },
        {
          ticker: "RKLB",
          name: "Rocket Lab",
          sector: "Defense/Space",
          weight: 0.2,
          reasoning:
            "Speculative growth allocation in space and defense infrastructure."
        }
      ];
    }

    const allocations = [];

    for (const stock of modelPortfolio) {
      const price = await getLiveStockPrice(stock.ticker);

      if (!price) {
        allocations.push({
          ticker: stock.ticker,
          name: stock.name,
          sector: stock.sector,
          shares: 0,
          price: null,
          dollarAmount: 0,
          reasoning:
            `${stock.reasoning} Live price was unavailable, so this position was not sized.`
        });
        continue;
      }

      allocations.push(
        buildPosition({
          ...stock,
          capital,
          price
        })
      );
    }

    const usedCapital = allocations.reduce(
      (sum, s) => sum + Number(s.dollarAmount || 0),
      0
    );

    const cashRemaining = Number((capital - usedCapital).toFixed(2));

    const sectorBreakdown = {};

    for (const stock of allocations) {
      if (!stock.dollarAmount || stock.dollarAmount <= 0) continue;

      sectorBreakdown[stock.sector] =
        (sectorBreakdown[stock.sector] || 0) +
        Math.round((stock.dollarAmount / capital) * 100);
    }

    if (cashRemaining > 0) {
      sectorBreakdown.Cash = Math.round((cashRemaining / capital) * 100);
    }

    let realityCheck = null;

    if (goal === "target") {
      realityCheck =
        `Your goal of "${targetGoal}" over "${targetTimeframe}" may require elevated risk. Large returns in short timeframes are possible but not reliable or guaranteed.`;
    }

    res.json({
      planId: Date.now(),
      pricing: "live",
      dataSource: "Finnhub",
      riskTier,
      timeframeEstimate,
      summary:
        `Based on your responses, this ${riskTier.toLowerCase()} allocation uses live market prices where available and sizes positions against your stated capital.`,
      cashRemaining,
      allocations,
      sectorBreakdown,
      realityCheck
    });
  } catch (e) {
    console.error("[capital allocator]", e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/capital-allocator/feedback", async (req, res) => {
  console.log("[capital allocator feedback]", req.body);
  res.json({ ok: true });
});
// ── Welcome Email ────────────────────────────────────────────────────
app.post("/api/email/welcome", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token" });
    const { valid, email } = await verifySupabaseToken(token);
    if (!valid || !email) return res.status(401).json({ error: "Invalid token" });
    const ok = await sendEmail({ to: email, subject: "Welcome to TRQX Capital", html: welcomeEmailHTML() });
    res.json({ ok });
  } catch (err) {
    console.error("[email/welcome] error:", err.message);
    res.status(500).json({ error: "welcome email failed" });
  }
});
// ── Morning Coach ────────────────────────────────────────────────────
app.post("/api/morning-coach", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });
  const { tier, email } = await verifySupabaseToken(token);
  if (!["pro", "elite"].includes(tier) && !OWNER_EMAILS_LIST.includes(email)) {
    return res.status(403).json({ error: "Upgrade to Pro for Morning Coach" });
  }

  try {
   // Pull economic calendar (Forex Factory free feed)
    let calendarEvents = [];
    try {
      const calRes = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json");
      if (calRes.ok) {
        const calData = await calRes.json();
        const todayNY = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // YYYY-MM-DD
        calendarEvents = (calData || [])
          .filter(e => e.country === "USD" && e.date && e.date.slice(0, 10) === todayNY)
          .slice(0, 5)
          .map(e => ({
            time: new Date(e.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "America/New_York" }),
            event: e.title || "Economic Event",
            impact: e.impact || "Med",
          }));
      }
    } catch (e) {
      console.warn("[morning-coach] calendar fetch failed:", e.message);
    }

    // Pull flow stats
    const stats = buildFlowStats();

    // Day context
    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long", timeZone: "America/New_York" });
    const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
    const hour = now.toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/New_York" });
    const nyDay = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" })).getDay();
    const isWeekend = nyDay === 0 || nyDay === 6;
    const isMonday = nyDay === 1;
    const isFriday = nyDay === 5;
    const isPreMarket = !isWeekend && Number(hour) < 9;
    const isMarketHours = !isWeekend && Number(hour) >= 9 && Number(hour) < 16;
    // OpEx detection (3rd Friday of month)
    const day = now.getDate();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const thirdFriday = 20 - ((firstDay + 2) % 7);
    const isOpEx = isFriday && day === thirdFriday;

    const highImpactEvents = calendarEvents.filter(e =>
      e.impact === "High" || e.impact === "high" || e.impact === "3"
    );

    const prompt = `You are the TRQX Capital Morning Coach — a straight-talking, experienced trading mentor with a Brooklyn edge. You care deeply about your students' success and you're not here to sugarcoat anything. You speak directly, with energy, like a mentor who's been in the game for 20 years and has seen traders blow accounts doing the exact things you're about to warn them about.

Today's context:
- Date: ${dayName}, ${dateStr}
- Market time context: ${isWeekend ? "It is the WEEKEND — markets are CLOSED all day, do not speak as if trading is happening today; frame everything as preparation for the next session" : isPreMarket ? "Pre-market — market hasn't opened yet" : isMarketHours ? "Market is open" : "After hours / evening — market is CLOSED, do not speak as if trading is currently happening"}
- Day of week: ${dayName} — ${isFriday ? "Friday, remind them to square up positions before close" : isMonday ? "Monday, fresh week energy" : "mid-week"}
- Options flow sentiment ${stats.session === "live" ? "so far today" : "from the last completed session"}: ${stats.sentiment} (Call premium: ${fmtPrem(stats.callPremium)}, Put premium: ${fmtPrem(stats.putPremium)})
- Today's economic events: ${calendarEvents.length > 0 ? calendarEvents.map(e => `${e.time} ${e.event} (${e.impact} impact)`).join(", ") : "No major scheduled events"}
- High impact events today: ${highImpactEvents.length > 0 ? highImpactEvents.map(e => e.event).join(", ") : "None"}
- Is OpEx Friday: ${isOpEx}
- Is Monday (fresh week): ${isMonday}
- Is Friday (week close): ${isFriday && !isOpEx}

Write a morning coaching message with these sections:

1. GREETING — A punchy 1-2 sentence opener that acknowledges the day and current market vibe. Make it feel alive, not generic.

2. MARKET BRIEF — 2-3 sentences on what to expect today based on the economic events and flow sentiment. Be specific — if there's a high-impact event, warn them. If flow is bullish, say so. If it's quiet, say that too.

3. GAME PLAN — 3-4 specific, actionable coaching points for trading today. These should be real advice — not platitudes. Reference today's specific conditions. Use "you" language. Be direct.

4. MINDSET — 1-2 sentences of mental edge coaching. Something that sticks with them all day.

5. PLATFORM REMINDERS — 1-2 sentences pointing them to the right TRQX tools for today. Reference specific features by name (GEMX for gamma levels, Economic Calendar for event times, Flow Scanner for unusual activity, News & Alerts for headlines, Capital Allocator for positioning).

Keep the total response under 350 words. Write in your voice — direct, warm, experienced, Brooklyn energy. No corporate speak. No "certainly!" No bullet points in the response — write it as flowing paragraphs per section.

Respond ONLY with valid JSON:
{
  "greeting": "...",
  "marketBrief": "...",
  "gamePlan": "...",
  "mindset": "...",
  "platformReminders": "...",
  "sentiment": "${stats.sentiment}",
  "highImpactEvents": ${JSON.stringify(highImpactEvents)},
  "isOpEx": ${isOpEx},
  "date": "${dateStr}"
}`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = aiRes.ok ? await aiRes.json() : null;
    let text = aiData?.content?.[0]?.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];
    text = text.replace(/,(\s*[}\]])/g, "$1");

    const coach = JSON.parse(text);
    return res.json(coach);
  } catch (e) {
    console.error("[morning-coach] error:", e.message);
    return res.status(500).json({ error: e.message });
  }
});

// ───────────────────────────────────────────────────────────────────
// FLOW HISTORY
// Tier-based history feed
// ───────────────────────────────────────────────────────────────────

app.get("/api/flow/history", async (req, res) => {
const token = req.headers.authorization?.replace("Bearer ", "");
const { tier } = token ? await verifyWhopToken(token) : { tier: "free" };

res.json({
rows: flowCache.slice(0, TIERS[tier]?.maxRows ?? 20),
tier,
});
});

// ───────────────────────────────────────────────────────────────────
// TICKER LOOKUP
// Search full flow cache by ticker
// ───────────────────────────────────────────────────────────────────

app.get("/api/flow/ticker/:ticker", async (req, res) => {
const ticker = String(req.params.ticker || "").toUpperCase();

const rows = flowCache
.filter((r) => String(r.ticker || "").toUpperCase() === ticker)
.slice(0, 500);

// Aggregate on the latest snapshot per contract — summing duplicate
// ingests double-counts cumulative volume (see v2.5 notes).
const uniqueRows = latestRowsByContract(rows);

const callPremium = uniqueRows
.filter((r) => r.type === "C")
.reduce((sum, r) => sum + Number(r.premium || 0), 0);

const putPremium = uniqueRows
.filter((r) => r.type === "P")
.reduce((sum, r) => sum + Number(r.premium || 0), 0);

const ratio =
putPremium > 0
? +(callPremium / putPremium).toFixed(2)
: callPremium > 0
? "CALL HEAVY"
: "--";

const goldenCount = uniqueRows.filter((r) => r.isGolden).length;

const spotlight = uniqueRows.length
? [...uniqueRows].sort((a, b) => Number(b.premium || 0) - Number(a.premium || 0))[0]
: null;

const sentiment =
callPremium > putPremium
? "Bullish"
: putPremium > callPremium
? "Bearish"
: "No Current Flow";

res.json({
ticker,
rows,
callPremium,
putPremium,
ratio,
goldenCount,
spotlight,
sentiment,
count: rows.length,
});
});
app.get("/api/gamma", (req, res) => {
  const ticker = String(req.query.ticker || "SPY").toUpperCase();
  const stats = buildFlowStats();

  // Latest snapshot per contract — prevents double-counted strike walls.
  const tickerRows = latestRowsByContract(flowCache.filter(r => r.ticker === ticker));

  const callStrikes = {};
  const putStrikes = {};

  for (const row of tickerRows) {
    const strike = Number(row.strike);
    if (!strike) continue;
    if (row.type === "C") callStrikes[strike] = (callStrikes[strike] || 0) + Number(row.premium || 0);
    if (row.type === "P") putStrikes[strike] = (putStrikes[strike] || 0) + Number(row.premium || 0);
  }

  const callWall = Object.keys(callStrikes).length
    ? Number(Object.entries(callStrikes).sort((a, b) => b[1] - a[1])[0][0])
    : null;

  const putWall = Object.keys(putStrikes).length
    ? Number(Object.entries(putStrikes).sort((a, b) => b[1] - a[1])[0][0])
    : null;

  const gammaFlip = callWall && putWall ? +((callWall + putWall) / 2).toFixed(2) : null;
  const maxPain = gammaFlip;

  // Build real strikeChart from flow cache
  const allStrikes = {};
  for (const row of tickerRows) {
    const strike = Number(row.strike);
    if (!strike) continue;
    if (!allStrikes[strike]) allStrikes[strike] = { calls: 0, puts: 0 };
    if (row.type === "C") allStrikes[strike].calls += Number(row.premium || 0);
    if (row.type === "P") allStrikes[strike].puts += Number(row.premium || 0);
  }

  let strikeChart = Object.entries(allStrikes)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .slice(-40)
    .map(([strike, data]) => ({
      strike: Number(strike),
      calls: data.calls,
      puts: data.puts,
      net: data.calls - data.puts,
    }));

  

  res.json({
    ticker,
    callWall,
    putWall,
    gammaFlip,
    maxPain,
    strikeChart,
    dealerPositioning: stats.sentiment === "Bullish" ? "Long Gamma" : "Short Gamma",
    squeezeRisk: stats.sentiment === "Bullish" ? "Moderate" : "High",
    sentiment: stats.sentiment,
    tradeCount: tickerRows.length,
    callPremium: Object.values(callStrikes).reduce((a, b) => a + b, 0),
    putPremium: Object.values(putStrikes).reduce((a, b) => a + b, 0),
    hasSyntheticChart: strikeChart.some(s => s.synthetic),
  });
});
app.get("/api/flow/stats", (_, res) => res.json(buildFlowStats()));
app.get("/api/flow/top-contracts", (_, res) => res.json(buildTopContracts()));

app.get("/api/flow/heatmap", async (req, res) => {
const token = req.headers.authorization?.replace("Bearer ", "");
const { tier } = token ? await verifySupabaseToken(token) : { tier: "free" };
if (!TIERS[tier]?.features.includes("sector_heat")) return res.status(403).json({ error: "Upgrade to Pro" });
res.json(buildSectorHeatmap());
});

app.get("/api/flow/smart-money", async (req, res) => {
const token = req.headers.authorization?.replace("Bearer ", "");
const { tier } = token ? await verifySupabaseToken(token) : { tier: "free" };
if (!TIERS[tier]?.features.includes("smart_money")) return res.status(403).json({ error: "Upgrade to Elite" });
res.json(buildSmartMoneyTracker());
});

app.get("/api/reports/latest", async (req, res) => {
const token = req.headers.authorization?.replace("Bearer ", "");
const { tier } = token ? await verifySupabaseToken(token) : { tier: "free" };
if (!TIERS[tier]?.features.includes("reports")) return res.status(403).json({ error: "Upgrade to Pro" });
if (!latestReport) latestReport = await generateMarketReport();
res.json(latestReport);
});

app.post("/api/ai/chat", async (req, res) => {
const token = req.headers.authorization?.replace("Bearer ", "");
const emailFromJWT = token ? await decodeJWTEmail(token) : null;
let tier = OWNER_EMAILS_LIST.includes(emailFromJWT) ? "elite" : "free";
if (tier === "free" && token) { const r = await verifySupabaseToken(token); tier = r.tier; }
if (!TIERS[tier]?.features.includes("ai_chat")) return res.status(403).json({ error: "Upgrade to Starter for AI Chat" });
const { message } = req.body;
if (!message) return res.status(400).json({ error: "message required" });
try {
const stats = buildFlowStats();
const top = buildTopContracts().slice(0, 5);
const recent = flowCache.slice(0, 20);
const context = `You are TRQX Flow AI. Current: ${stats.sentiment}, Call ${fmtPrem(stats.callPremium)}, Put ${fmtPrem(stats.putPremium)}. Top: ${top.map(c => `${c.ticker} ${c.type==="C"?"CALL":"PUT"} ${fmtPrem(c.premium)}`).join(", ")}. Be concise and data-driven.`;
const response = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
body: JSON.stringify({ model: "claude-opus-4-5", max_tokens: 500, system: context, messages: [{ role: "user", content: message }] }),
});
const data = await response.json();
if (!response.ok) return res.status(500).json({ error: "AI error: " + (data.error?.message || response.status) });
res.json({ reply: data.content?.[0]?.text || "Unable to process." });
} catch (e) { res.status(500).json({ error: "AI unavailable: " + e.message }); }
});
// ───────────────────────────────────────────────────────────────────
// ACADEMY AI CHAT
// Lesson-aware help chat for the Academy course pages.
// Same auth/tier pattern as /api/ai/chat — separate endpoint so
// the system prompt (and any future Academy-specific logic) never
// risks regressing the Flow Scanner's AI chat, and so tier rules
// can diverge later without entangling two different features.
// ───────────────────────────────────────────────────────────────────

const ACADEMY_SYSTEM_PROMPT_BASE = `You are the TRQX Academy tutor. You help students understand the
current lesson they're studying. Be clear, encouraging, and concise — explain concepts the way a
patient mentor would, using simple language and concrete examples where helpful. Stay focused on
the lesson topic; if a student asks something unrelated to trading education, gently redirect them
back to the course material. Never give specific buy/sell trade calls or financial advice — this is
an educational tutor, not a trading signal service. Keep responses focused; aim for a few short
paragraphs at most unless the student is asking for a worked example.`;

app.post("/api/academy/chat", async (req, res) => {
const token = req.headers.authorization?.replace("Bearer ", "");
const emailFromJWT = token ? await decodeJWTEmail(token) : null;
let tier = OWNER_EMAILS_LIST.includes(emailFromJWT) ? "elite" : "free";
if (tier === "free" && token) {
const r = await verifySupabaseToken(token);
tier = r.tier;
}
if (!TIERS[tier]?.features.includes("ai_chat")) {
return res.status(403).json({ error: "Upgrade to Starter for Academy AI Help" });
}

const { message, lessonTitle, lessonObjective, lessonSummary } = req.body;
if (!message) return res.status(400).json({ error: "message required" });

try {
const lessonContext = lessonTitle
? `\n\nThe student is currently on this lesson:\nTitle: ${lessonTitle}\nObjective: ${lessonObjective || "N/A"}\nSummary: ${lessonSummary || "N/A"}\n\nAnswer in the context of this lesson when relevant.`
: "";

const system = ACADEMY_SYSTEM_PROMPT_BASE + lessonContext;

const response = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: {
"Content-Type": "application/json",
"x-api-key": ANTHROPIC_API_KEY,
"anthropic-version": "2023-06-01",
},
body: JSON.stringify({
model: "claude-opus-4-5",
max_tokens: 500,
system,
messages: [{ role: "user", content: message }],
}),
});

const data = await response.json();
if (!response.ok) {
return res.status(500).json({ error: "AI error: " + (data.error?.message || response.status) });
}
res.json({ reply: data.content?.[0]?.text || "Unable to process." });
} catch (e) {
res.status(500).json({ error: "AI unavailable: " + e.message });
}
});

async function fetchORBLevels() {
const orb = {};
const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).toISOString().slice(0, 10);
for (const ticker of ["SPX","IWM","SPY","QQQ"]) {
try {
const sym = ticker === "SPX" ? "I:SPX" : ticker;
const res = await fetch(`https://api.polygon.io/v2/aggs/ticker/${sym}/range/1/minute/${today}/${today}?adjusted=true&sort=asc&limit=50&apiKey=${POLYGON_API_KEY}`);
if (!res.ok) continue;
const data = await res.json();
const bars = (data.results ?? []).filter(b => {
const ny = new Date(new Date(b.t).toLocaleString("en-US", { timeZone: "America/New_York" }));
return ny.getHours() === 9 && ny.getMinutes() >= 30 && ny.getMinutes() < 45;
});
if (!bars.length) continue;
const orbHigh = Math.max(...bars.map(b => b.h));
const orbLow = Math.min(...bars.map(b => b.l));
let currentPrice = null;
const qRes = await fetch(`https://api.polygon.io/v2/last/trade/${sym}?apiKey=${POLYGON_API_KEY}`);
if (qRes.ok) { const qData = await qRes.json(); currentPrice = qData.results?.p ?? null; }
orb[ticker] = { high: orbHigh, low: orbLow, range: orbHigh - orbLow, currentPrice, orbBars: bars.length, date: today };
} catch (e) { console.error(`[orb] ${ticker}:`, e.message); }
}
return orb;
}

function findFlowNearORB(orbData) {
return flowCache.slice(0, 300).filter(row => {
const orb = orbData[row.ticker];
if (!orb?.high || !orb?.low || !orb?.currentPrice) return false;
const nearHigh = Math.abs((orb.currentPrice - orb.high) / orb.high) < 0.005;
const nearLow = Math.abs((orb.currentPrice - orb.low) / orb.low) < 0.005;
return nearHigh || nearLow;
}).map(row => {
const orb = orbData[row.ticker];
const nearHigh = Math.abs((orb.currentPrice - orb.high) / orb.high) < 0.005;
return { ...row, orbSignal: nearHigh && row.type === "C" ? "bullish" : "bearish", nearHigh, nearLow: !nearHigh };
});
}

app.get("/api/orb", async (req, res) => {
const token = req.headers.authorization?.replace("Bearer ", "");
const { tier } = token ? await verifySupabaseToken(token) : { tier: "free" };
if (!["pro","elite"].includes(tier)) return res.status(403).json({ error: "Upgrade to Pro" });
try { const orbData = await fetchORBLevels(); res.json({ orb: orbData, flowNearOrb: findFlowNearORB(orbData) }); }
catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/replay", async (req, res) => {
const token = req.headers.authorization?.replace("Bearer ", "");
const { tier } = token ? await verifySupabaseToken(token) : { tier: "free" };
if (!TIERS[tier]?.features.includes("smart_money")) return res.status(403).json({ error: "Upgrade to Elite" });
const { ticker, date } = req.query;
if (!ticker || !date) return res.status(400).json({ error: "ticker and date required" });
try {
const rows = [];
let callPremium = 0, putPremium = 0, blocks = 0, sweeps = 0;
let nextUrl = `https://api.polygon.io/v3/snapshot/options/${ticker}?limit=250&apiKey=${POLYGON_API_KEY}`;
let pageCount = 0;
while (nextUrl && pageCount < 4) {
const resp = await fetch(nextUrl);
if (!resp.ok) throw new Error(`Polygon error: ${resp.status}`);
const data = await resp.json(); pageCount++;
for (const snap of data.results ?? []) {

const d = snap.details; const day = snap.day;
if (!d || !day) continue;
const vol = day.volume ?? 0; const oi = snap.open_interest ?? 1;
const price = day.vwap ?? day.close ?? 0;
if (!price || vol < 10) continue;
const premium = Math.round(vol * price * 100);
if (premium < 25000) continue;
const type = d.contract_type === "call" ? "C" : "P";
const ratio = oi > 0 ? vol / oi : 0;
const tag = premium >= 1000000 ? "block" : ratio > 3 ? "sweep" : premium >= 500000 ? "unusual" : "";
if (type === "C") callPremium += premium; else putPremium += premium;
if (tag === "block") blocks++; if (tag === "sweep") sweeps++;
const t = new Date(`${date}T${9 + Math.floor(Math.random()*6)}:${String(Math.floor(Math.random()*60)).padStart(2,"0")}:00`);
rows.push({ ts: t.getTime(), time: t.toLocaleTimeString("en-US", { hour12: false, timeZone: "America/New_York" }), ticker, type, strike: d.strike_price, expStr: d.expiration_date, contracts: vol, price: +price.toFixed(2), premium, tag, isGolden: premium >= 500000, vol, oi, ratio: +ratio.toFixed(1) });
}
nextUrl = data.next_url ? data.next_url + `&apiKey=${POLYGON_API_KEY}` : null;
}
rows.sort((a, b) => a.ts - b.ts);
const ratio = putPremium > 0 ? callPremium / putPremium : 999;
res.json({ rows, stats: { callPremium, putPremium, sentiment: ratio > 1.5 ? "Bullish" : ratio < 0.67 ? "Bearish" : "Neutral", totalTrades: rows.length, blocks, sweeps, ratio: +ratio.toFixed(2) }, ticker, date });
} catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/api/news", async (req, res) => {
try {
const ticker = String(req.query.ticker || "").toUpperCase();
const limit = Number(req.query.limit || 20);

const url =
`https://api.polygon.io/v2/reference/news?` +
`${ticker ? `ticker=${ticker}&` : ""}` +
`limit=${limit}&order=desc&sort=published_utc&apiKey=${POLYGON_API_KEY}`;

const r = await fetch(url);

if (!r.ok) {
throw new Error(`Polygon news error ${r.status}`);
}

const data = await r.json();

const rows = (data.results || []).map((n) => ({
title: n.title,
description: n.description,
url: n.article_url,
source: n.publisher?.name || "Market News",
published: n.published_utc,
tickers: n.tickers || [],
sentiment: n.insights?.[0]?.sentiment || "neutral",
reason: n.insights?.[0]?.sentiment_reasoning || "",
}));

res.json({ rows });
} catch (err) {
console.error("[news] error:", err.message);

res.status(500).json({
error: err.message,
rows: [],
});
}
});

// ─── RESEARCH ENDPOINTS ────────────────────────────────────────────────────

const profileCache = new Map();
const PROFILE_CACHE_TTL = 60 * 60 * 1000;

app.get("/api/research/profile/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const cached = profileCache.get(`profile_${symbol}`);
  if (cached && Date.now() - cached.ts < PROFILE_CACHE_TTL) return res.json(cached.data);
  try {
    const [profileRes, quoteRes, metricsRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
      fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`),
    ]);
    const profile = profileRes.ok ? await profileRes.json() : {};
    const quote = quoteRes.ok ? await quoteRes.json() : {};
    const metrics = metricsRes.ok ? await metricsRes.json() : {};
    const m = metrics.metric || {};
    const price = quote.c ?? null;
    const prevClose = quote.pc ?? null;
    const change = prevClose ? +(Number(price) - Number(prevClose)).toFixed(2) : null;
    const changePct = prevClose ? +((change / Number(prevClose)) * 100).toFixed(2) : null;
    const payload = {
      symbol, name: profile.name || symbol, logo: profile.logo || "",
      exchange: profile.exchange || "", industry: profile.finnhubIndustry || "",
      country: profile.country || "US", currency: profile.currency || "USD",
      marketCap: profile.marketCapitalization || null,
      employees: profile.employeeTotal || null, ceo: profile.ceo || null,
      founded: profile.ipo || null,
      headquarter: `${profile.city || ""}, ${profile.state || ""}`.trim().replace(/^,|,$/, ""),
      weburl: profile.weburl || "",
      description: `${profile.name || symbol} is a publicly traded company in the ${profile.finnhubIndustry || "financial"} industry.`,
      price, change, changePct,
      pe: m["peNormalizedAnnual"] || m["peTTM"] || null,
      forwardPE: m["peForward"] || null, peg: m["pegRatio"] || null,
      ps: m["psTTM"] || null, pb: m["pbAnnual"] || null,
      roe: m["roeTTM"] ? +(m["roeTTM"] * 100).toFixed(2) : null,
      grossMargin: m["grossMarginTTM"] ? +(m["grossMarginTTM"] * 100).toFixed(2) : null,
      netMargin: m["netProfitMarginTTM"] ? +(m["netProfitMarginTTM"] * 100).toFixed(2) : null,
      debtEquity: m["totalDebt/totalEquityAnnual"] || null,
      currentRatio: m["currentRatioAnnual"] || null,
      revenueGrowthYoy: m["revenueGrowthTTMYoy"] ? +(m["revenueGrowthTTMYoy"] * 100).toFixed(2) : null,
      epsGrowthYoy: m["epsGrowthTTMYoy"] ? +(m["epsGrowthTTMYoy"] * 100).toFixed(2) : null,
      week52High: m["52WeekHigh"] || null, week52Low: m["52WeekLow"] || null,
      beta: m["beta"] || null,
      dividendYield: m["dividendYieldIndicatedAnnual"] ? +(m["dividendYieldIndicatedAnnual"] * 100).toFixed(2) : null,
      annualDividend: m["dividendPerShareAnnual"] || null,
      payoutRatio: m["payoutRatioAnnual"] ? +(m["payoutRatioAnnual"] * 100).toFixed(2) : null,
      dividendGrowth: m["dividendGrowthRate5Y"] ? +(m["dividendGrowthRate5Y"] * 100).toFixed(2) : null,
      exDividendDate: m["exDividendDate"] || null,
    };
    profileCache.set(`profile_${symbol}`, { ts: Date.now(), data: payload });
    return res.json(payload);
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

app.get("/api/research/financials/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const cached = profileCache.get(`financials_${symbol}`);
  if (cached && Date.now() - cached.ts < PROFILE_CACHE_TTL) return res.json(cached.data);
  try {
    const [metricsRes, earningsRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`),
      fetch(`https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
    ]);
    const metricsData = metricsRes.ok ? await metricsRes.json() : {};
    const earnings = earningsRes.ok ? await earningsRes.json() : [];
    const m = metricsData.metric || {};
    const earningsArr = Array.isArray(earnings) ? earnings : [];
    // Group quarterly earnings by fiscal year for annual view
    const byYear = {};
    earningsArr.forEach(e => {
      if (!e.period) return;
      const yr = e.period.substring(0, 4);
      if (!byYear[yr]) byYear[yr] = { year: yr, quarters: [] };
      byYear[yr].quarters.push(e);
    });
    const reports = Object.values(byYear)
      .sort((a, b) => a.year - b.year)
      .slice(-5)
      .map(yr => {
        const totalActual = yr.quarters.reduce((s, q) => s + (Number(q.actual) || 0), 0);
        const totalEstimate = yr.quarters.reduce((s, q) => s + (Number(q.estimate) || 0), 0);
        return {
          year: yr.year,
          period: yr.year,
          epsActual: +totalActual.toFixed(2),
          epsEstimate: +totalEstimate.toFixed(2),
          quarters: yr.quarters.length,
          // Revenue from metrics TTM fields scaled by year
          revenue: m["revenueTTM"] ? m["revenueTTM"] * 1000000 : null,
          netIncome: m["netMarginTTM"] && m["revenueTTM"] ? (m["netMarginTTM"] / 100) * m["revenueTTM"] * 1000000 : null,
        };
      });
    const recentEarnings = earningsArr.slice(0, 8).map(e => ({
      period: e.period,
      actual: e.actual,
      estimate: e.estimate,
      surprise: e.surprise,
      surprisePercent: e.surprisePercent,
    }));
    const payload = {
      symbol, reports, earnings: recentEarnings,
      ttmRevenue: m["revenueTTM"] ? m["revenueTTM"] * 1000000 : null,
      ttmNetIncome: m["netIncomeEmployeeAnnual"] || null,
      revenueGrowth: m["revenueGrowthTTMYoy"] ? +(m["revenueGrowthTTMYoy"] * 100).toFixed(1) : null,
      epsGrowth: m["epsGrowthTTMYoy"] ? +(m["epsGrowthTTMYoy"] * 100).toFixed(1) : null,
    };
    profileCache.set(`financials_${symbol}`, { ts: Date.now(), data: payload });
    return res.json(payload);
  } catch (e) { return res.status(500).json({ error: e.message }); }
});
app.get("/api/research/ratings/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const cached = profileCache.get(`ratings_${symbol}`);
  if (cached && Date.now() - cached.ts < PROFILE_CACHE_TTL) return res.json(cached.data);
  try {
    const [ratingsRes, targetRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
      fetch(`https://finnhub.io/api/v1/stock/price-target?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
    ]);
    const ratings = ratingsRes.ok ? await ratingsRes.json() : [];
    const target = targetRes.ok ? await targetRes.json() : {};
    const latest = Array.isArray(ratings) && ratings.length > 0 ? ratings[0] : {};
    const strongBuy = latest.strongBuy || 0;
    const buy = latest.buy || 0;
    const hold = latest.hold || 0;
    const sell = latest.sell || 0;
    const strongSell = latest.strongSell || 0;
    const total = strongBuy + buy + hold + sell + strongSell;
    const payload = {
      symbol, strongBuy, buy, hold, sell, strongSell, total,
      avgTarget: target.targetMean || null,
      highTarget: target.targetHigh || null,
      lowTarget: target.targetLow || null,
    };
    profileCache.set(`ratings_${symbol}`, { ts: Date.now(), data: payload });
    return res.json(payload);
  } catch (e) { return res.status(500).json({ error: e.message }); }
});

app.post("/api/research/ai-verdict", async (req, res) => {
  const { symbol, profile, metrics, ratings } = req.body;
  if (!symbol) return res.status(400).json({ error: "symbol required" });
  try {
    const prompt = `You are a professional stock analyst. Analyze ${symbol} (${profile?.name || symbol}) and provide a concise investment research summary.

Company: ${profile?.name}, Industry: ${profile?.industry}
Key Metrics: P/E: ${metrics?.pe}, Forward P/E: ${metrics?.forwardPE}, ROE: ${metrics?.roe}%, Gross Margin: ${metrics?.grossMargin}%, Net Margin: ${metrics?.netMargin}%, Revenue Growth YoY: ${metrics?.revenueGrowthYoy}%, Debt/Equity: ${metrics?.debtEquity}
Analyst Ratings: Strong Buy: ${ratings?.strongBuy}, Buy: ${ratings?.buy}, Hold: ${ratings?.hold}, Sell: ${ratings?.sell}, Avg Target: $${ratings?.avgTarget}

Respond ONLY with valid JSON in this exact format, no markdown, no extra text:
{"score":<1-10>,"verdict":"<STRONG BUY|BUY|HOLD|SELL|STRONG SELL>","summary":"<2 sentence summary>","advantages":["<1>","<2>","<3>","<4>","<5>"],"risks":["<1>","<2>","<3>","<4>"],"finalThoughts":"<2-3 sentences>","bestFor":"<investor type>","timeHorizon":"<time>"}`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const aiData = aiRes.ok ? await aiRes.json() : null;
    const text = aiData?.content?.[0]?.text || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return res.json(parsed);
  } catch (e) {
    return res.json({
      score: 7, verdict: "HOLD",
      summary: `${symbol} shows mixed signals. Further analysis recommended.`,
      advantages: ["Established market position","Revenue generating","Active institutional coverage","Liquid trading vehicle","Brand recognition"],
      risks: ["Market volatility","Sector headwinds","Valuation uncertainty","Macro environment risk"],
      finalThoughts: `${symbol} warrants careful monitoring. Always conduct your own due diligence.`,
      bestFor: "Risk-aware investors", timeHorizon: "Situational",
    });
  }
});
app.post("/api/market-intelligence", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });
  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = aiRes.ok ? await aiRes.json() : null;
    const text = data?.content?.[0]?.text || "";
    return res.json({ reply: text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/api/billing/checkout/:plan", (req, res) => {
const urls = { starter: "https://whop.com/tqpx-tru-quant-enterprise/trqx-flow-scanner-starter", pro: "https://whop.com/tqpx-tru-quant-enterprise/trqx-flow-scanner-pro", elite: "https://whop.com/tqpx-tru-quant-enterprise/trqx-flow-scanner-elite" };
const url = urls[req.params.plan];
if (!url) return res.status(404).json({ error: "Unknown plan" });
res.json({ url });
});

app.post("/api/webhooks/discord", async (req, res) => {
const token = req.headers.authorization?.replace("Bearer ", "");
if (!token) return res.status(401).json({ error: "No token" });
const emailFromJWT = await decodeJWTEmail(token);
let tier = OWNER_EMAILS_LIST.includes(emailFromJWT) ? "elite" : (await verifySupabaseToken(token)).tier;
if (tier !== "elite") return res.status(403).json({ error: "Upgrade to Elite" });
const { webhookUrl, minPremium, types } = req.body;
if (!webhookUrl || !webhookUrl.startsWith("https://discord.com/api/webhooks/")) return res.status(400).json({ error: "Invalid Discord webhook URL" });
const hook = { webhookUrl, minPremium: minPremium ?? 100000, types: types ?? ["sweep","unusual","block"] };
userWebhooks.set(webhookUrl, hook);
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
fetch(`${SUPABASE_URL}/rest/v1/user_webhooks`, {
method: "POST",
headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
body: JSON.stringify({ webhook_url: webhookUrl, min_premium: hook.minPremium, types: hook.types, user_email: emailFromJWT }),
}).catch(() => {});
}
res.json({ ok: true });
});

async function loadWebhooksFromSupabase() {
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;
try {
const res = await fetch(`${SUPABASE_URL}/rest/v1/user_webhooks?select=*`, { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } });
if (!res.ok) { console.warn("[webhooks] load failed"); return; }
const rows = await res.json();
for (const row of rows) userWebhooks.set(row.webhook_url, { webhookUrl: row.webhook_url, minPremium: row.min_premium ?? 100000, types: row.types ?? ["sweep","unusual","block"] });
console.log(`[webhooks] loaded ${rows.length} persisted webhook(s)`);
} catch (e) { console.warn("[webhooks] load error:", e.message); }
}

// ───────────────────────────────────────────────────────────────────
// FLOW CACHE
// Stores recent options flow in memory
// Larger cache = more searchable ticker history
// ───────────────────────────────────────────────────────────────────

let flowCache = [];

// Increase from 1,000 → 10,000 records
// This allows ticker search to find older contracts
// without requiring a database lookup.

const MAX_CACHE = 10000;

// Optional future upgrade:
// const MAX_CACHE = 25000;
const userWebhooks = new Map();
let latestReport = null;

const SECTOR_MAP = {
SPY:"ETF",QQQ:"ETF",IWM:"ETF",DIA:"ETF",GLD:"Commodity",SLV:"Commodity",USO:"Commodity",
XLF:"Financials",XLE:"Energy",XLK:"Tech",XLV:"Healthcare",XLU:"Utilities",XLI:"Industrial",TLT:"Bonds",
AAPL:"Tech",MSFT:"Tech",NVDA:"Tech",AMD:"Tech",SMCI:"Tech",ARM:"Tech",MU:"Tech",INTC:"Tech",AVGO:"Tech",ORCL:"Tech",CRM:"Tech",UBER:"Tech",
TSLA:"Auto/EV",RIVN:"Auto/EV",NIO:"Auto/EV",META:"Social",GOOGL:"Social",SNAP:"Social",NFLX:"Media",DIS:"Media",AMZN:"E-Commerce",SHOP:"E-Commerce",
JPM:"Financials",BAC:"Financials",GS:"Financials",MS:"Financials",PLTR:"Defense/AI",LMT:"Defense/AI",RTX:"Defense/AI",RKLB:"Defense/AI",BA:"Industrial",
COIN:"Crypto",MSTR:"Crypto",MARA:"Crypto",IREN:"Crypto",HOOD:"Fintech",SOFI:"Fintech",QBTS:"Quantum",DELL:"Tech",CAR:"Consumer",
LLY:"Healthcare",UNH:"Healthcare",XOM:"Energy",CVX:"Energy",DKNG:"Gaming",VIX:"Volatility",UVXY:"Volatility",SQQQ:"Inverse",SPXU:"Inverse",
};

function buildFlowStats() {
  const { dateStr: todayET, isOpen } = etNowInfo();

  // Latest snapshot per unique contract — Polygon day.volume is cumulative,
  // so summing duplicate ingests of the same contract double-counts premium.
  const unique = latestRowsByContract(flowCache);

  // Session anchoring:
  //  - Market open  → aggregate ONLY rows ingested during today's session.
  //  - Market closed → aggregate the most recent completed session in the
  //    cache, clearly labeled via session/sessionDate so the frontend can
  //    render "PREV SESSION" instead of pretending the numbers are live.
  let sessionDate = todayET;
  let rows = unique.filter(r => r.sessionDate === todayET);
  if (!isOpen) {
    const dates = [...new Set(unique.map(r => r.sessionDate).filter(Boolean))].sort();
    sessionDate = dates[dates.length - 1] ?? todayET;
    rows = unique.filter(r => r.sessionDate === sessionDate);
  }

  let callPremium = 0;
  let putPremium = 0;
  let sweepCount = 0;
  let blockCount = 0;
  let unusualCount = 0;

  for (const row of rows) {
    if (row.type === "C") callPremium += Number(row.premium || 0);
    if (row.type === "P") putPremium += Number(row.premium || 0);

    if (row.tag === "sweep") sweepCount++;
    if (row.tag === "block") blockCount++;
    if (row.tag === "unusual") unusualCount++;
  }

  const ratio =
    putPremium > 0
      ? callPremium / putPremium
      : callPremium > 0
      ? 999
      : 0;

  const hasData = rows.length > 0;

  return {
    callPremium,
    putPremium,
    sweepCount,
    blockCount,
    unusualCount,
    sentiment: !hasData
      ? "No Flow"
      : ratio > 1.2
      ? "Bullish"
      : ratio < 0.8
      ? "Bearish"
      : "Neutral",
    ratio: putPremium > 0 ? +ratio.toFixed(2) : hasData ? "CALL HEAVY" : 0,
    session: isOpen ? "live" : "closed",
    sessionDate,
    asOf: Date.now(),
  };
}

function buildSectorHeatmap() {
const map = {};
for (const row of latestRowsByContract(flowCache.slice(0, 300))) {
const sector = SECTOR_MAP[row.ticker] ?? "Other";
if (!map[sector]) map[sector] = { callPrem: 0, putPrem: 0, count: 0, sentiment: "Neutral" };
if (row.type === "C") map[sector].callPrem += row.premium; else map[sector].putPrem += row.premium;
map[sector].count++;
const r = map[sector].putPrem > 0 ? map[sector].callPrem / map[sector].putPrem : 999;
map[sector].sentiment = r > 1.5 ? "Bullish" : r < 0.67 ? "Bearish" : "Neutral";
}
return map;
}

function buildTopContracts() {
// Latest snapshot per contract — a contract's newest premium already
// reflects its full cumulative day volume, so summing duplicates
// (the old totalPremium approach) systematically overstated size.
const m = new Map();
for (const row of flowCache.slice(0, 1500)) {
const key = `${row.ticker}-${row.type}-${row.strike}-${row.expStr}`;
const c = m.get(key);
if (!c) m.set(key, { ...row, tradeCount: 1 });
else {
c.tradeCount++;
if ((row.ts ?? 0) > (c.ts ?? 0)) {
const keepCount = c.tradeCount;
Object.assign(c, row);
c.tradeCount = keepCount;
}
}
}
return [...m.values()]
.sort((a, b) => Number(b.premium || 0) - Number(a.premium || 0))
.slice(0, 20)
.map(c => ({ ...c, totalPremium: c.premium }));
}

function buildSmartMoneyTracker() {
const m = new Map();
for (const row of latestRowsByContract(flowCache)) {
if (!m.has(row.ticker)) m.set(row.ticker, { ticker: row.ticker, trades: [], totalPremium: 0, unusualCount: 0 });
const t = m.get(row.ticker); t.trades.push(row); t.totalPremium += row.premium;
if (["unusual","block","sweep"].includes(row.tag)) t.unusualCount++;
}
return [...m.values()].filter(t => t.unusualCount >= 2).sort((a, b) => b.unusualCount - a.unusualCount).slice(0, 15)
.map(t => ({ ticker: t.ticker, totalPremium: t.totalPremium, unusualCount: t.unusualCount, tradeCount: t.trades.length, sentiment: t.trades.filter(r => r.type === "C").length > t.trades.length / 2 ? "Bullish" : "Bearish", lastSeen: t.trades[0]?.time ?? "" }));
}

function calcFlowScore(row) {
let score = 0;
if (row.premium >= 1000000) score += 3; else if (row.premium >= 500000) score += 2; else if (row.premium >= 100000) score += 1;
if (row.tag === "block" || row.tag === "sweep") score += 2; else if (row.tag === "unusual") score += 1;
const days = row.expStr ? Math.max(0, (new Date(row.expStr) - Date.now()) / 86400000) : 30;
if (days <= 1) score += 2; else if (days <= 7) score += 1;
if (row.oi > 0 && row.vol / row.oi > 2) score += 2; else if (row.oi > 0 && row.vol / row.oi > 0.5) score += 1;
if (new Date(row.ts).getHours() === 9 || new Date(row.ts).getHours() === 15) score += 1;
return Math.min(10, Math.max(1, score));
}

function fmtPrem(v) {
if (v >= 1000000) return `$${(v/1000000).toFixed(2)}M`;
if (v >= 1000) return `$${(v/1000).toFixed(0)}K`;
return `$${v}`;
}

async function generateMarketReport() {
if (!ANTHROPIC_API_KEY) return buildDemoReport();
try {
const stats = buildFlowStats();
const top = buildTopContracts().slice(0, 8);
const prompt = `Generate a concise 3-section options flow report:\n1. MARKET OVERVIEW\n2. KEY SETUPS\n3. WATCH LIST\nData: ${stats.sentiment}, Call ${fmtPrem(stats.callPremium)}, Put ${fmtPrem(stats.putPremium)}, Top: ${top.map(c=>`${c.ticker} ${c.type==="C"?"CALL":"PUT"} ${fmtPrem(c.premium)}`).join(", ")}`;
const response = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
body: JSON.stringify({ model: "claude-opus-4-5", max_tokens: 800, messages: [{ role: "user", content: prompt }] }),
});
const data = await response.json();
return { generatedAt: new Date().toISOString(), content: data.content?.[0]?.text || "", stats, topContracts: top };
} catch (e) { return buildDemoReport(); }
}

function buildDemoReport() {
const stats = buildFlowStats();
return { generatedAt: new Date().toISOString(), content: `MARKET OVERVIEW\n${stats.sentiment} bias detected.\n\nKEY SETUPS\nMonitor top contracts.\n\nWATCH LIST\nTickers with unusual prints.`, stats, topContracts: buildTopContracts().slice(0, 5) };
}

setInterval(async () => { if (flowCache.length > 10) { latestReport = await generateMarketReport(); broadcastReport(latestReport); } }, 3600000);

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });
const clients = new Map();

wss.on("connection", async (ws, req) => {
const url = new URL(req.url, "http://localhost");
const token = url.searchParams.get("token");
let tier = "free", userId = "guest";
if (token) { try { const r = await verifySupabaseToken(token); if (r.valid) { tier = r.tier; userId = token.slice(0,8); } } catch(e) {} }
clients.set(ws, { userId, tier });
console.log(`[ws] connected uid=${userId} tier=${tier}`);
ws.send(JSON.stringify({ type: "history", rows: flowCache.slice(0, TIERS[tier].maxRows) }));
ws.send(JSON.stringify({ type: "stats", data: buildFlowStats() }));
ws.send(JSON.stringify({ type: "top_contracts", data: buildTopContracts() }));
ws.on("close", () => clients.delete(ws));
ws.on("error", () => clients.delete(ws));
});

function broadcast(row) {
for (const [ws] of clients) { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "flow", row })); }
}

function broadcastStats() {
const stats = buildFlowStats(); const top = buildTopContracts();
for (const [ws] of clients) { if (ws.readyState === WebSocket.OPEN) { ws.send(JSON.stringify({ type: "stats", data: stats })); ws.send(JSON.stringify({ type: "top_contracts", data: top })); } }
}

function broadcastReport(report) {
for (const [ws, { tier }] of clients) { if (ws.readyState === WebSocket.OPEN && TIERS[tier]?.features.includes("reports")) ws.send(JSON.stringify({ type: "report", data: report })); }
}

setInterval(broadcastStats, 15000);

const CORE_TICKERS = ["SPY","QQQ","IWM","NVDA","TSLA"];
const ROTATION_TICKERS = ["AAPL","MSFT","AMZN","META","GOOGL","AMD","NFLX","AVGO","MU","ARM","SMCI","INTC","ORCL","CRM","PLTR","COIN","MSTR","HOOD","SOFI","JPM","BAC","GS","UBER","RKLB","DIS","BA","SNAP","SHOP","NIO","RIVN","DKNG","MARA","LLY","UNH","XOM","CVX","GLD","XLF","XLE","XLK","XLV","TLT","DIA","QBTS","IREN","CAR","DELL"];
const ROTATE_BATCH = 7;
let rotateOffset = 0;

async function pollPolygon() {
if (!POLYGON_API_KEY || POLYGON_API_KEY === "YOUR_KEY_HERE") return;
// Only poll during the regular session — options flow doesn't print
// outside RTH, and premarket snapshots carry cumulative/stale day data
// that used to pollute the cache with ghost rows all night.
const { isOpen } = etNowInfo();
if (!isOpen) return;
try { await fetchUnusualActivity(); } catch (e) { console.error("[polygon] poll error:", e.message); }
}

process.on("uncaughtException", (err) => { console.error("[server] uncaughtException:", err.message); });
process.on("unhandledRejection", (reason) => { console.error("[server] unhandledRejection:", reason?.message || reason); });

async function fetchUnusualActivity() {
const batch = [];

for (let i = 0; i < ROTATE_BATCH; i++) {
batch.push(ROTATION_TICKERS[(rotateOffset + i) % ROTATION_TICKERS.length]);
}

rotateOffset = (rotateOffset + ROTATE_BATCH) % ROTATION_TICKERS.length;

for (const ticker of [...CORE_TICKERS, ...batch]) {
let callCount = 0;
let putCount = 0;

try {
let nextUrl = `https://api.polygon.io/v3/snapshot/options/${ticker}?limit=250&apiKey=${POLYGON_API_KEY}`;
let pageCount = 0;

while (nextUrl && pageCount < 6) {
const res = await fetch(nextUrl);

if (!res.ok) {
console.warn(`[polygon] ${ticker}: ${res.status}`);
break;
}

const data = await res.json();
pageCount++;

console.log(
`[polygon] ${ticker}: page ${pageCount}, ${data.results?.length ?? 0} contracts`
);

for (const snap of data.results ?? []) {
const d = snap.details;
const g = snap.greeks;
const day = snap.day;

if (!d) continue;

const type = d.contract_type === "call" ? "C" : "P";

if (type === "C") callCount++;
if (type === "P") putCount++;

const price =
snap.last_quote?.midpoint ??
snap.last_trade?.price ??
day?.vwap ??
day?.close ??
0;

if (!price || price <= 0) continue;

const vol = day?.volume ?? 0;
if (!vol || vol < 1) continue;

const oi = snap.open_interest ?? 1;
const ratio = oi > 0 ? vol / oi : 0;

const contracts = vol;
const premium = Math.round(contracts * price * 100);

if (premium < 10000) continue;

const tag =
premium >= 1000000
? "block"
: ratio > 2
? "sweep"
: "unusual";

const row = {
ts: Date.now(),
sessionDate: etDateString(),
time: new Date().toLocaleTimeString("en-US", {
hour12: false,
timeZone: "America/New_York",
}),
ticker,
type,
strike: d.strike_price,
expStr: d.expiration_date,
contracts,
price: +price.toFixed(2),
premium,
tag,
isGolden: premium >= 500000,
sentiment: type === "C" ? "bullish" : "bearish",
vol,
oi,
ratio: +ratio.toFixed(1),
iv: g?.implied_volatility
? +(g.implied_volatility * 100).toFixed(1)
: null,
delta: g?.delta ? +g.delta.toFixed(2) : null,
ivRank: snap.implied_volatility_percentile
? +(snap.implied_volatility_percentile * 100).toFixed(0)
: null,
source: "polygon",
};

row.flowScore = calcFlowScore(row);
await ingestRow(row);
}

nextUrl = data.next_url
? `${data.next_url}&apiKey=${POLYGON_API_KEY}`
: null;

await new Promise((r) => setTimeout(r, 250));
}

console.log(`[FLOW] ${ticker} Calls=${callCount} Puts=${putCount}`);
} catch (e) {
console.warn(`[polygon] error ${ticker}:`, e.message);
}

await new Promise((r) => setTimeout(r, 400));
}
}
const seenTrades = new Set();
async function ingestRow(row) {
const key = `${row.ticker}-${row.strike}-${row.expStr}-${row.premium}-${row.type}`;
if (seenTrades.has(key)) return;
seenTrades.add(key);
if (seenTrades.size > 5000) seenTrades.delete(seenTrades.values().next().value);
flowCache.unshift(row);
if (flowCache.length > MAX_CACHE) flowCache.pop();
broadcast(row);
fireWebhooks(row);
}

const ALERT_COOLDOWN_MS = 1800000;
const ALERT_MAX_PER_MIN = 4;
const alertedContracts = new Map();
let alertWindowStart = 0, alertWindowCount = 0;

async function fireWebhooks(row) {
if (row.premium < 50000) return;
const key = `${row.ticker}-${row.strike}-${row.expStr}-${row.type}`;
if (Date.now() - (alertedContracts.get(key) ?? 0) < ALERT_COOLDOWN_MS) return;
if (Date.now() - alertWindowStart > 60000) { alertWindowStart = Date.now(); alertWindowCount = 0; }
if (alertWindowCount >= ALERT_MAX_PER_MIN) return;
let fired = false;
for (const hook of userWebhooks.values()) {
if (hook.types?.length && !hook.types.includes(row.tag)) continue;
if (row.premium < hook.minPremium) continue;
fired = true;
fetch(hook.webhookUrl, {
method: "POST", headers: { "Content-Type": "application/json" },
body: JSON.stringify({ embeds: [{ title: `${row.ticker} ${row.type==="C"?"CALL":"PUT"} ${row.tag?.toUpperCase()} — Score: ${row.flowScore}/10`, color: row.type==="C"?0x22c55e:0xef4444, fields: [{ name:"Strike", value:`$${row.strike}`, inline:true },{ name:"Exp", value:row.expStr, inline:true },{ name:"Premium", value:fmtPrem(row.premium), inline:true }], footer:{ text:"TRQX Flow Scanner" }, timestamp:new Date(row.ts).toISOString() }] }),
}).catch(() => {});
}
if (fired) { alertedContracts.set(key, Date.now()); alertWindowCount++; if (alertedContracts.size > 2000) alertedContracts.delete(alertedContracts.keys().next().value); }
}

function startDemoFeed() {
console.log("[server] DEMO MODE");
const tickers = ["SPY","QQQ","AAPL","TSLA","NVDA","AMZN","IWM","META","MSFT","PLTR","AMD","COIN","JPM","GLD"];
const tags = ["sweep","block","unusual","","","",""];
setInterval(() => {
const ticker = tickers[Math.floor(Math.random()*tickers.length)];
const type = Math.random() > 0.45 ? "C" : "P";
const contracts = Math.floor(Math.random()*2000)+50;
const price = +(Math.random()*8+0.3).toFixed(2);
const premium = Math.round(contracts*price*100);
const spot = Math.floor(Math.random()*400)+50;
const tag = tags[Math.floor(Math.random()*tags.length)];
const daysOut = [0,1,7,14,30,45,60][Math.floor(Math.random()*7)];
const expStr = new Date(Date.now()+daysOut*86400000).toISOString().slice(0,10);
const vol = Math.floor(Math.random()*50000); const oi = Math.floor(Math.random()*100000)+1000;
const row = { ts:Date.now(), sessionDate: etDateString(), time:new Date().toLocaleTimeString("en-US",{hour12:false,timeZone:"America/New_York"}), ticker, type, strike:spot+[-10,-5,0,5,10][Math.floor(Math.random()*5)], expStr, contracts, price, premium, tag, isGolden:premium>=500000, sentiment:type==="C"?"bullish":"bearish", vol, oi, ratio:+(vol/oi).toFixed(1), iv:+(Math.random()*80+10).toFixed(1), delta:type==="C"?+(Math.random()*0.9+0.1).toFixed(2):-(Math.random()*0.9+0.1).toFixed(2), ivRank:Math.floor(Math.random()*100), source:"demo" };
row.flowScore = calcFlowScore(row);
ingestRow(row);
}, 600 + Math.random()*1000);
}

httpServer.listen(PORT, () => {
console.log(`[server] TRQX Flow Scanner v2.5 listening on :${PORT}`);
console.log(`[server] Watch list: ${CORE_TICKERS.length} core + ${ROTATION_TICKERS.length} rotating`);
console.log(`[server] Session gate: polling only during regular NYSE hours (ET)`);
console.log(`[email] Resend ${RESEND_API_KEY ? "configured" : "NOT configured"}`);
console.log(`[auth] Supabase JWKS ${SUPABASE_JWKS ? "configured" : "NOT configured — auth routes will reject all tokens"}`);
console.log(`[whop-webhook] signature verification ${WHOP_WEBHOOK_SECRET ? "configured" : "NOT configured — webhook will reject all requests"}`);
flowCache = []; seenTrades.clear();
loadWebhooksFromSupabase();
if (process.env.DEMO_MODE === "true") {
  startDemoFeed();
} else if (POLYGON_API_KEY && POLYGON_API_KEY !== "YOUR_KEY_HERE") {
  console.log("[polygon] Starting REST polling every 60s (market hours only)...");
  pollPolygon(); setInterval(pollPolygon, 60000);
} else {
  console.error("[server] FAIL-CLOSED: no POLYGON_API_KEY and DEMO_MODE not set — no flow data will be generated");
}
});