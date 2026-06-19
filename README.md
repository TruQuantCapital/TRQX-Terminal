# TRQX Unified Terminal — Phase 1 Next Move

This version restructures the app into real modules.

## What changed

- Split code into components, pages, and mock data
- Added clickable sidebar pages
- Added dedicated Scanner page
- Added dedicated Gamma Ex page
- Added dedicated Options Flow page
- Added dedicated Academy page
- Kept Dashboard as consolidated command center
- Added integration notes for moving scanner API into the main app

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Next build step

Move your live scanner code/data into:

```txt
src/pages/ScannerPage.jsx
src/data/mockData.js
```

Recommended future API route structure:

```txt
/api/scanner?type=momentum
/api/scanner?type=orb
/api/scanner?type=low-float
/api/gamma?ticker=SPY
/api/options-flow?ticker=SPY
```
