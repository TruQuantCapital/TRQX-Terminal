# TRQX Unified Terminal — Merged Build

This package combines:

- The new TRQX Unified Terminal dashboard UI
- Your existing TRQX Flow Scanner frontend pages
- Supabase auth hooks
- Live scanner page
- Pricing, alerts, reports, and welcome pages

## Run locally

```bash
npm install
npm run dev
```

Then open:

```txt
http://localhost:5173
```

## Required environment variables

Create a `.env` file from `.env.example` and use the values from your existing TRQX Flow Scanner frontend project.

Required:

```txt
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=https://trqx-flow-scanner-production.up.railway.app
VITE_WS_URL=wss://trqx-flow-scanner-production.up.railway.app
```

## Important security note

Do not commit backend secrets to GitHub. Never commit:

- Supabase service role key
- Whop API key
- Polygon API key
- Anthropic API key
- Resend API key

Frontend Supabase anon keys are client-side keys, but still keep environment files out of GitHub unless intentionally configured.

## Routes

```txt
/auth
/welcome
/dashboard
/scanner
/options-flow
/gamma-ex
/academy
/pricing
/alerts
/reports
/economic-calendar
/discord
/news
/settings
```

## What changed

- Added React Router
- Added AuthProvider
- Added protected terminal layout
- Added live Scanner page from your TRQX Flow project
- Added Auth, Pricing, Alerts, Reports, and Welcome pages
- Kept the unified TRQX dashboard, Gamma Ex, Options Flow, and Academy modules
- Patched owner emails in `useAuth.jsx`
- Removed partial JWT token logging from `useAuth.jsx`
