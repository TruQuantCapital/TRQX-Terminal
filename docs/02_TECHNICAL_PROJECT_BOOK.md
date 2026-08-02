# TRQX Technical Project Book

## Purpose

This book explains how the TRQX platform is built, how its major systems work, how to deploy it, and how to maintain it.

## Audience

- Owner
- Developers
- Contractors
- Future technical staff

## Table of Contents

1. Product Vision
2. System Architecture
3. Repository Structure
4. Frontend Application
5. Backend Services
6. Authentication and Access Control
7. Subscription and Feature Gating
8. Market Data Providers
9. Dashboard
10. Scanner
11. Options Flow
12. Gamma Exposure
13. Academy
14. Simulator Engine
15. Scenario Registry
16. Replay Engine
17. Decision Engine
18. AI Coach
19. Session Engine
20. Trade Builder
21. Trade Grader
22. Certification
23. Journal
24. Storage
25. Diagnostics
26. Operations Command Center
27. Social Publishing
28. Deployment
29. Backups and Recovery
30. Troubleshooting
31. Release Process
32. Roadmap

---

## 1. Product Vision

TRQX is a trading education, market-analysis, simulation, and business-operations platform.

Its major product areas are:

- Trading Terminal
- Scanner
- Market Intelligence
- Academy
- Simulator
- Certification
- Journal
- Operations Command Center

---

## 2. System Architecture

The frontend is a React and Vite application.

The platform also uses:

- Supabase for authentication and application data
- Vercel for frontend deployment
- Railway for backend services
- External market-data providers
- Social publishing APIs

Detailed diagrams will be added after the simulator stabilization checkpoint.

---

## 3. Repository Structure

The repository inventory generated beside this document is the current source of truth:

- `REPOSITORY_TREE.txt`
- `FEATURE_INVENTORY.md`
- `BUILD_AND_GIT_SNAPSHOT.txt`

---

## 14. Simulator Engine

Primary location:

`src/trqxEngine/`

Current major modules:

- analytics
- certification
- coach
- contracts
- diagnostics
- engine
- grading
- replay
- scenarios
- session
- storage
- trade
- validation

The simulator uses generated scenarios, reveals candles through replay, grades user decisions, captures a professional trade plan, creates a trade grade, calculates certification, and stores a compact journal record.

---

## Documentation Rule

Every major feature must document:

- Purpose
- User flow
- File locations
- Inputs
- Outputs
- Dependencies
- Error handling
- Tests
- Deployment impact
- Known issues
