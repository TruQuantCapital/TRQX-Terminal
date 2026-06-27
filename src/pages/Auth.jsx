/**
* TRQX Flow Scanner â€” Backend Server v2.4
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
*    a generic "x-whop-signature: hex-digest" scheme â€” Whop actually
*    follows the Standard Webhooks spec (webhook-id / webhook-signature /
*    webhook-timestamp headers, base64 signature with a "v1," prefix),
*    so the old check could never have matched a real signature. The SDK
*    handles unwrapping, signature verification, and timestamp/replay
*    checks in one call.
*  - Fixed membership tier-downgrade logic to check the real Whop event
*    name "membership.deactivated" â€” the previous version checked
*    "membership.went_invalid" / "membership.expired", which don't
*    exist in Whop's API, so downgrades were silently never firing.
*/

import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { Whop } from "@whop/sdk";
import "dotenv/config";

const PORT = process.env.PORT || 3001;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY || "YOUR_KEY_HERE";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const FMP_API_KEY = process.env.FMP_API_KEY || "";
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";
const econCache = { ts: 0, data: [] };
const ECON_CACHE_TTL = 30 * 60 * 1000;
const quoteCache = new Map();
const QUOTE_CACHE_TTL = 30 * 1000;

const WHOP_API_KEY         = process.env.WHOP_API_KEY;
const WHOP_WEBHOOK_SECRET  = process.env.WHOP_WEBHOOK_SECRET;
const WHOP_PRODUCT_STARTER = process.env.WHOP_PRODUCT_STARTER ?? "prod_SHVHy0ZiiBFm5";
const WHOP_PRODUCT_PRO     = process.env.WHOP_PRODUCT_PRO     ?? "prod_RzY99mUJeeGKD";
const WHOP_PRODUCT_ELITE   = process.env.WHOP_PRODUCT_ELITE   ?? "prod_qXgVPhmWTy9By";

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

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "TRQX Flow Scanner <scanner@thetrulies.com>";
const SCANNER_URL = "https://trqx.thetrulies.com";
const WHOP_HUB_URL = "https://whop.com/tqpx-tru-quant-enterprise";
const CROWN_IMG = "https://thetrulies.com/wp-content/uploads/2026/06/ChatGPT-Image-Jun-7-2026-09_11_29-PM.png";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// AUTH: owner override list â€” declared early since both
// verifySupabaseToken and decodeJWTEmail reference it.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const OWNER_EMAILS_LIST = [
  "michaelvalerio@thetrulies.com",
  "michaelvalerio@taurustechs.com"
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// AUTH: Supabase JWT verification via JWKS
//
// Your project is currently on Supabase's legacy HS256 shared secret.
// createRemoteJWKSet + jwtVerify checks against whatever keys are live
// at your project's JWKS endpoint right now â€” so this keeps working
// unchanged if/when you migrate to asymmetric JWT Signing Keys later.
// No code change needed on that day.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_JWT_ISSUER = SUPABASE_URL ? `${SUPABASE_URL}/auth/v1` : null;
const SUPABASE_JWKS = SUPABASE_URL
? createRemoteJWKSet(new URL(`${SUPABASE_JWT_ISSUER}/.well-known/jwks.json`))
: null;

async function verifySupabaseToken(token) {
try {
if (!token || typeof token !== "string" || !token.includes(".")) {
return { valid: false, tier: "free" };
}

if (!SUPABASE_JWKS) {
console.error("[auth] SUPABASE_URL not set â€” refusing to trust unverified token");
return { valid: false, tier: "free" };
}

// Throws on bad signature, expiry, or wrong issuer/audience.
// This is the actual security check â€” everything before this
// line is just precondition checks.
const { payload } = await jwtVerify(token, SUPABASE_JWKS, {
issuer: SUPABASE_JWT_ISSUER,
audience: "authenticated",
});

const userId = payload.sub;
if (!userId) return { valid: false, tier: "free" };

if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=tier`, {
headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` }
});
if (res.ok) {
const data = await res.json();
return { valid: true, tier: data?.[0]?.tier ?? "free", userId, email: payload.email ?? null };
}
}

const email = payload.email ?? "";
if (OWNER_EMAILS_LIST.includes(email)) {
return { valid: true, tier: "elite", userId, email };
}
return { valid: true, tier: "free", userId, email };
} catch (e) {
// Expected path for forged/expired/malformed tokens â€” not a server error.
console.warn("[auth] token verification failed:", e.message);
return { valid: false, tier: "free" };
}
}

// Verified email decode â€” used for owner-override checks in
// /api/ai/chat and /api/webhooks/discord. Returns null for any
// token that doesn't carry a valid signature. NOTE: async, unlike
// the old base64-decode version â€” callers must await it.
async function decodeJWTEmail(token) {
if (!SUPABASE_JWKS) return null;
try {
const { payload } = await jwtVerify(token, SUPABASE_JWKS, {
issuer: SUPABASE_JWT_ISSUER,
audience: "authenticated",
});
return payload.email ?? null;
} catch {
return null;
}
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// AUTH: Whop webhook signature verification
//
// Whop follows the Standard Webhooks spec (https://www.standardwebhooks.com/),
// NOT a simple "x-whop-signature: hex-hmac" scheme. Real headers are
// webhook-id / webhook-signature / webhook-timestamp, and the signature
// value is base64 with a "v1," version prefix â€” not a hex digest. Hand-
// rolling this is error-prone (wrong encoding, no timestamp/replay check,
// no multi-secret-rotation support), so this uses Whop's own SDK, which
// the docs confirm "automatically handles unwrapping and verifying the
// webhook bodies according to the spec" and throws on a bad signature.
//
// npm install @whop/sdk
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const whopsdk = WHOP_WEBHOOK_SECRET
? new Whop({
apiKey: WHOP_API_KEY,
webhookKey: Buffer.from(WHOP_WEBHOOK_SECRET).toString("base64"),
})
: null;

async function sendEmail({ to, subject, html }) {
if (!RESEND_API_KEY) { console.warn("[email] RESEND_API_KEY not set â€” skipping email to", to); return false; }
try {
const res = await fetch("https://api.resend.com/emails", {
method: "POST",
headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html }),
});
if (!res.ok) { console.error("[email] send failed:", res.status, await res.text()); return false; }
console.log(`[email] sent "${subject}" to ${to}`);
return true;
} catch (e) { console.error("[email] error:", e.message); return false; }
}

function emailShell(inner) {
return `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#0a0a0a;"><div style="max-width:600px;margin:0 auto;padding:32px 20px;font-family:Arial,Helvetica,sans-serif;"><div style="text-align:center;padding-bottom:24px;"><img src="${CROWN_IMG}" width="72" alt="TRQX Crown" style="display:inline-block;" /><div style="color:#d4af37;font-size:28px;font-weight:bold;letter-spacing:6px;margin-top:8px;">TRQX</div><div style="color:#888888;font-size:11px;letter-spacing:4px;">FLOW SCANNER</div></div><div style="background-color:#111111;border:1px solid #2a2a2a;border-radius:12px;padding:28px;color:#e5e5e5;font-size:15px;line-height:1.65;">${inner}</div><div style="text-align:center;color:#d4af37;font-size:12px;letter-spacing:3px;padding-top:24px;font-weight:bold;">PLAN IT. TRADE IT. SLAY IT.</div><div style="text-align:center;color:#555555;font-size:11px;padding-top:10px;">Â© ${new Date().getFullYear()} Tru Quant Capital</div></div></body></html>`;
}

function goldButton(text, url) {
return `<div style="text-align:center;padding:20px 0 8px 0;"><a href="${url}" style="display:inline-block;background-color:#d4af37;color:#0a0a0a;font-weight:bold;font-size:15px;letter-spacing:1px;padding:14px 36px;border-radius:8px;text-decoration:none;">${text}</a></div>`;
}

function welcomeEmailHTML() {
return emailShell(`<div style="color:#d4af37;font-size:22px;font-weight:bold;padding-bottom:12px;">Welcome to the Scanner</div><p>Your TRQX Flow Scanner account is live.</p>${goldButton("ENTER THE SCANNER", SCANNER_URL)}`);
}

const TIER_PERKS = {
starter: ["Live options flow", "Smart filters", "Alerts", "Ask AI chat"],
pro:     ["Everything in Starter", "Sector Heat Map", "Golden sweeps", "Hourly AI Reports", "Flow Score", "ORB Dashboard"],
elite:   ["Everything in Pro", "Smart Money Tracker", "Flow Replay", "Discord webhooks", "API access"],
};

function tierUpgradeEmailHTML(tier) {
const perks = (TIER_PERKS[tier] ?? []).map(p => `<p>${p}</p>`).join("");
return emailShell(`<div style="color:#d4af37;font-size:22px;font-weight:bold;padding-bottom:12px;">${tier.toUpperCase()} Unlocked</div>${perks}${goldButton("OPEN THE SCANNER", SCANNER_URL)}`);
}

function tierCancelEmailHTML() {
return emailShell(`<div style="color:#d4af37;font-size:22px;font-weight:bold;padding-bottom:12px;">Your membership has ended</div><p>Your account has been moved to the free tier.</p>${goldButton("REACTIVATE MY PLAN", WHOP_HUB_URL)}`);
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
console.error("[whop-webhook] WHOP_WEBHOOK_SECRET not set â€” rejecting webhook");
return res.status(500).json({ error: "Webhook verification not configured" });
}

// unwrap() verifies the Standard Webhooks signature (webhook-id /
// webhook-signature / webhook-timestamp headers) against your secret
// and throws if it doesn't match, is expired, or is malformed. We
// never touch req.body directly â€” the SDK owns the whole check.
let event;
try {
const rawBody = req.body.toString("utf8");
const headers = Object.fromEntries(
Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
);
event = whopsdk.webhooks.unwrap(rawBody, { headers });
} catch (sigErr) {
console.warn("[whop-webhook] rejected â€” invalid or missing signature:", sigErr.message);
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
// Real Whop event names, confirmed against current docs â€” the
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
if (tier === "free") sendEmail({ to: userEmail, subject: "Your TRQX membership has ended", html: tierCancelEmailHTML() }).catch(() => {});
else sendEmail({ to: userEmail, subject: `TRQX ${tier.toUpperCase()} Unlocked`, html: tierUpgradeEmailHTML(tier) }).catch(() => {});
}
res.json({ ok: true });
} catch (e) { console.error("[whop-webhook] error:", e.message); res.status(500).json({ error: e.message }); }
});

app.use(express.json());
app.get("/health", (_, res) => res.json({ status: "ok", ts: Date.now() }));
app.get("/api/economic-calendar", async (req, res) => {
try {
if (Date.now() - econCache.ts < ECON_CACHE_TTL && econCache.data.length) {
return res.json(econCache.data);
}

const fallback = [];

if (!FMP_API_KEY) {
return res.json(fallback);
}

const today = new Date().toISOString().slice(0, 10);
const url = `https://financialmodelingprep.com/api/v3/economic_calendar?from=${today}&to=${today}&apikey=${FMP_API_KEY}`;

const r = await fetch(url);
console.log("[econ] FMP status:", r.status, "date:", today);
if (!r.ok) {
  console.log("[econ] FMP failed, returning fallback");
  return res.json(fallback);
}

const data = await r.json();

const rows = (data || []).slice(0, 8).map((e) => [
new Date(e.date).toLocaleTimeString("en-US", {
hour: "2-digit",
minute: "2-digit",
hour12: true,
}),
e.event || e.name || "Economic Event",
e.impact || "Med",
e.actual ?? "--",
e.estimate ?? e.forecast ?? "--",
e.previous ?? "--",
]);

econCache.ts = Date.now();
econCache.data = rows.length ? rows : fallback;

res.json(econCache.data);
} catch (err) {
res.status(500).json({ error: "Economic calendar unavailable" });
}
});

// â”€â”€â”€ FUTURES ENDPOINT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FUTURES_SYMBOLS = [
{ yahoo: "ES=F", label: "/ES" },
{ yahoo: "NQ=F", label: "/NQ" },
{ yahoo: "RTY=F", label: "/RTY" },
{ yahoo: "YM=F", label: "/YM" },
];

let futuresCache = {};
let futuresCacheTime = 0;
const FUTURES_CACHE_TTL = 30 * 1000; 

app.get("/api/futures", async (req, res) => {
const fallback = {
"ES=F": { last: null, change: null, changePct: null, label: "/ES", source: "fallback" },
"NQ=F": { last: null, change: null, changePct: null, label: "/NQ", source: "fallback" },
"RTY=F": { last: null, change: null, changePct: null, label: "/RTY", source: "fallback" },
"YM=F": { last: null, change: null, changePct: null, label: "/YM", source: "fallback" },
};

try {
if (
Date.now() - futuresCacheTime < FUTURES_CACHE_TTL &&
Object.keys(futuresCache).length
) {
return res.json(futuresCache);
}

const FUTURES_POLYGON = [
  { key: "ES=F", ticker: "I:ES1!", label: "/ES" },
  { key: "NQ=F", ticker: "I:NQ1!", label: "/NQ" },
  { key: "RTY=F", ticker: "I:RTY1!", label: "/RTY" },
  { key: "YM=F", ticker: "I:YM1!", label: "/YM" },
];

const result = {};
for (const f of FUTURES_POLYGON) {
  try {
    const url = `https://api.polygon.io/v2/snapshot/locale/global/markets/forex/tickers/${f.ticker}?apiKey=${POLYGON_API_KEY}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Polygon futures ${r.status}`);
    const data = await r.json();
    const ticker = data?.ticker;
    const day = ticker?.day || {};
    const prev = ticker?.prevDay || {};
    const last = ticker?.lastTrade?.p ?? day.c ?? null;
    const prevClose = prev.c ?? null;
    const change = last && prevClose ? +(last - prevClose).toFixed(2) : null;
    const changePct = last && prevClose ? +((change / prevClose) * 100).toFixed(2) : null;
    result[f.key] = { last, change, changePct, label: f.label, source: "polygon" };
  } catch {
    result[f.key] = { last: null, change: null, changePct: null, label: f.label, source: "fallback" };
  }
}

futuresCache = result;
futuresCacheTime = Date.now();

return res.json(result);
} catch {
return res.json(fallback);
}
});

// â”€â”€â”€ QUOTE ENDPOINT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.get("/api/quote/:symbol", async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  const cached = quoteCache.get(symbol);
  if (cached && Date.now() - cached.ts < QUOTE_CACHE_TTL) {
    return res.json({ ...cached.data, source: `${cached.data.source}-cached` });
  }

  try {
    const finnSymbol = symbol === "SPX" ? "^GSPC" : symbol;
    const url = `https://finnhub.io/api/v1/quote?symbol=${finnSymbol}&token=${FINNHUB_API_KEY}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Finnhub status ${r.status}`);
    const data = await r.json();
    const price = data.c ?? null;
    const prevClose = data.pc ?? null;
    if (!price || Number(price) === 0) throw new Error("No Finnhub price");
    const change = prevClose ? +(Number(price) - Number(prevClose)).toFixed(2) : null;
    const changePct = prevClose ? +((change / Number(prevClose)) * 100).toFixed(2) : null;
    const payload = { symbol, price: +Number(price).toFixed(2), change, changePct, source: "finnhub" };
    quoteCache.set(symbol, { ts: Date.now(), data: payload });
    return res.json(payload);
  } catch {
    const payload = { symbol, price: null, change: null, changePct: null, source: "safe-fallback" };
    quoteCache.set(symbol, { ts: Date.now(), data: payload });
    return res.json(payload);
  }
});

const welcomeSentCache = new Set();
app.post("/api/email/welcome", async (req, res) => {
const token = req.headers.authorization?.replace("Bearer ", "");
if (!token) return res.status(401).json({ error: "No token" });

const verified = await verifySupabaseToken(token);
if (!verified.valid || !verified.email) {
return res.status(401).json({ error: "Invalid token" });
}
const email = verified.email;
const userId = verified.userId;

if (welcomeSentCache.has(email)) return res.json({ ok: true, skipped: true });
if (userId && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
try {
const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=welcome_sent`, { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } });
if (checkRes.ok) { const data = await checkRes.json(); if (data?.[0]?.welcome_sent === true) { welcomeSentCache.add(email); return res.json({ ok: true, skipped: true }); } }
} catch (e) { console.warn("[email] welcome_sent check failed:", e.message); }
}
const sent = await sendEmail({ to: email, subject: "Welcome to TRQX Flow Scanner", html: welcomeEmailHTML() });
if (sent) {
welcomeSentCache.add(email);
if (userId && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
method: "PATCH",
headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
body: JSON.stringify({ welcome_sent: true, non_professional: true, attested_at: new Date().toISOString() }),
}).catch(() => {});
}
}
res.json({ ok: sent });
});

app.post("/api/auth/whop", async (req, res) => {
const { accessToken } = req.body;
if (!accessToken) return res.status(400).json({ error: "accessToken required" });
res.json(await verifyWhopToken(accessToken));
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FLOW HISTORY
// Tier-based history feed
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get("/api/flow/history", async (req, res) => {
const token = req.headers.authorization?.replace("Bearer ", "");
const { tier } = token ? await verifyWhopToken(token) : { tier: "free" };

res.json({
rows: flowCache.slice(0, TIERS[tier]?.maxRows ?? 20),
tier,
});
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TICKER LOOKUP
// Search full flow cache by ticker
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get("/api/flow/ticker/:ticker", async (req, res) => {
const ticker = String(req.params.ticker || "").toUpperCase();

const rows = flowCache
.filter((r) => String(r.ticker || "").toUpperCase() === ticker)
.slice(0, 500);

const callPremium = rows
.filter((r) => r.type === "C")
.reduce((sum, r) => sum + Number(r.premium || 0), 0);

const putPremium = rows
.filter((r) => r.type === "P")
.reduce((sum, r) => sum + Number(r.premium || 0), 0);

const ratio =
putPremium > 0
? +(callPremium / putPremium).toFixed(2)
: callPremium > 0
? "CALL HEAVY"
: "--";

const goldenCount = rows.filter((r) => r.isGolden).length;

const spotlight = rows.length
? [...rows].sort((a, b) => Number(b.premium || 0) - Number(a.premium || 0))[0]
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

  const tickerRows = flowCache.filter(r => r.ticker === ticker);

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

  const allStrikes = {};
  for (const row of tickerRows) {
    const strike = Number(row.strike);
    if (!strike) continue;
    if (!allStrikes[strike]) allStrikes[strike] = { calls: 0, puts: 0 };
    if (row.type === "C") allStrikes[strike].calls += Number(row.premium || 0);
    if (row.type === "P") allStrikes[strike].puts += Number(row.premium || 0);
  }

  const strikeChart = Object.entries(allStrikes)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .slice(-40)
    .map(([strike, data]) => ({
      strike: Number(strike),
      calls: data.calls,
      puts: data.puts,
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
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ACADEMY AI CHAT
// Lesson-aware help chat for the Academy course pages.
// Same auth/tier pattern as /api/ai/chat â€” separate endpoint so
// the system prompt (and any future Academy-specific logic) never
// risks regressing the Flow Scanner's AI chat, and so tier rules
// can diverge later without entangling two different features.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ACADEMY_SYSTEM_PROMPT_BASE = `You are the TRQX Academy tutor. You help students understand the
current lesson they're studying. Be clear, encouraging, and concise â€” explain concepts the way a
patient mentor would, using simple language and concrete examples where helpful. Stay focused on
the lesson topic; if a student asks something unrelated to trading education, gently redirect them
back to the course material. Never give specific buy/sell trade calls or financial advice â€” this is
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
        max_tokens: 400,
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
// ... rest stays the same
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FLOW CACHE
// Stores recent options flow in memory
// Larger cache = more searchable ticker history
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let flowCache = [];

// Increase from 1,000 â†’ 10,000 records
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
let callPremium = 0;
let putPremium = 0;
let sweepCount = 0;
let blockCount = 0;
let unusualCount = 0;

const rows = flowCache.slice(0, 1500);

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

return {
callPremium,
putPremium,
sweepCount,
blockCount,
unusualCount,
sentiment:
ratio > 1.2
? "Bullish"
: ratio < 0.8
? "Bearish"
: "Neutral",
ratio: putPremium > 0 ? +ratio.toFixed(2) : "CALL HEAVY",
};
}

function buildSectorHeatmap() {
const map = {};
for (const row of flowCache.slice(0, 300)) {
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
const m = new Map();
for (const row of flowCache.slice(0, 500)) {
const key = `${row.ticker}-${row.type}-${row.strike}-${row.expStr}`;
if (!m.has(key)) m.set(key, { ...row, totalPremium: 0, tradeCount: 0 });
const c = m.get(key); c.totalPremium += row.premium; c.tradeCount++;
}
return [...m.values()].sort((a, b) => b.totalPremium - a.totalPremium).slice(0, 20).map(c => ({ ...c, premium: c.totalPremium }));
}

function buildSmartMoneyTracker() {
const m = new Map();
for (const row of flowCache) {
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
const ROTATION_TICKERS = ["AAPL","MSFT","AMZN","META","GOOGL","AMD","NFLX","AVGO","MU","ARM","SMCI","INTC","ORCL","CRM","PLTR","COIN","MSTR","HOOD","SOFI","JPM","BAC","GS","UBER","RKLB","DIS","BA","SNAP","SHOP","NIO","RIVN","DKNG","MARA","LLY","UNH","XOM","CVX","GLD","XLF","XLE","XLK","XLV","TLT","VIX","DIA","QBTS","IREN","CAR","DELL"];
const ROTATE_BATCH = 7;
let rotateOffset = 0;

async function pollPolygon() {
if (!POLYGON_API_KEY || POLYGON_API_KEY === "YOUR_KEY_HERE") return;
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
body: JSON.stringify({ embeds: [{ title: `${row.ticker} ${row.type==="C"?"CALL":"PUT"} ${row.tag?.toUpperCase()} â€” Score: ${row.flowScore}/10`, color: row.type==="C"?0x22c55e:0xef4444, fields: [{ name:"Strike", value:`$${row.strike}`, inline:true },{ name:"Exp", value:row.expStr, inline:true },{ name:"Premium", value:fmtPrem(row.premium), inline:true }], footer:{ text:"TRQX Flow Scanner" }, timestamp:new Date(row.ts).toISOString() }] }),
}).catch(() => {});
}
if (fired) { alertedContracts.set(key, Date.now()); alertWindowCount++; if (alertedContracts.size > 2000) alertedContracts.delete(alertedContracts.keys().next().value); }
}

function startDemoFeed() {
console.log("[server] DEMO MODE");
const tickers = ["SPY","QQQ","AAPL","TSLA","NVDA","AMZN","IWM","META","MSFT","PLTR","AMD","COIN","JPM","GLD","VIX"];
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
const row = { ts:Date.now(), time:new Date().toLocaleTimeString("en-US",{hour12:false,timeZone:"America/New_York"}), ticker, type, strike:spot+[-10,-5,0,5,10][Math.floor(Math.random()*5)], expStr, contracts, price, premium, tag, isGolden:premium>=500000, sentiment:type==="C"?"bullish":"bearish", vol, oi, ratio:+(vol/oi).toFixed(1), iv:+(Math.random()*80+10).toFixed(1), delta:type==="C"?+(Math.random()*0.9+0.1).toFixed(2):-(Math.random()*0.9+0.1).toFixed(2), ivRank:Math.floor(Math.random()*100), source:"demo" };
row.flowScore = calcFlowScore(row);
ingestRow(row);
}, 600 + Math.random()*1000);
}

httpServer.listen(PORT, () => {
console.log(`[server] TRQX Flow Scanner v2.4 listening on :${PORT}`);
console.log(`[server] Watch list: ${CORE_TICKERS.length} core + ${ROTATION_TICKERS.length} rotating`);
console.log(`[email] Resend ${RESEND_API_KEY ? "configured" : "NOT configured"}`);
console.log(`[auth] Supabase JWKS ${SUPABASE_JWKS ? "configured" : "NOT configured â€” auth routes will reject all tokens"}`);
console.log(`[whop-webhook] signature verification ${WHOP_WEBHOOK_SECRET ? "configured" : "NOT configured â€” webhook will reject all requests"}`);
flowCache = []; seenTrades.clear();
loadWebhooksFromSupabase();
if (POLYGON_API_KEY && POLYGON_API_KEY !== "YOUR_KEY_HERE") {
console.log("[polygon] Starting REST polling every 15s...");
pollPolygon(); setInterval(pollPolygon, 60000);
} else { startDemoFeed(); }
});

















