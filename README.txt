TRQX EXECUTION DESK V2

Replace these two frontend files:

src/features/operations/components/LiveTradeManager.jsx
src/features/operations/components/LiveTradeManager.css

No database migration or backend change is required.

Features:
- Live underlying quote refresh every 15 seconds using VITE_API_URL /api/quote/:ticker
- Current R calculation for LONG/CALL and SHORT/PUT tickets
- Target progress rail
- Eastern Time market open/close countdown
- Existing lifecycle controls preserved

Notes:
- Current R is calculated from the underlying ticker price, entry, and stop.
- It is not options-contract P/L.
- Weekend countdown displays Market Closed.
