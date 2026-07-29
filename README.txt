TRQX AI COACH — PHASE 1 VISUAL PROTOTYPE

WHAT THIS BUILD DOES
- Adds a protected /ai-coach page.
- Reads the signed-in member's Academy progress.
- Determines beginner/intermediate/advanced learning level.
- Displays current progress, membership tier, and next lesson.
- Answers lesson questions using local TRQX Academy content.
- Handles quick prompts for explanations, quizzes, ORB rules, and next-study guidance.
- Refuses direct buy/sell calls and redirects the member to the TRQX decision framework.
- Does not require an external AI API for this first visual prototype.

FILES
1. pages/AICoachPage.jsx
   Copy to src/pages/AICoachPage.jsx

2. styles/ai-coach.css
   Copy to src/styles/ai-coach.css

3. App.jsx
   Replace src/App.jsx with this version.

INSTALL
1. Copy the two new files.
2. Replace App.jsx.
3. Run:
   npm run build
4. Commit and deploy.
5. Open:
   https://trqx.thetrulies.com/ai-coach

IMPORTANT
This phase is a functional rules-and-curriculum prototype. It shows the full user experience and personalization flow without sending Academy content or user data to a third-party model.

NEXT BACKEND PHASE
After approving the experience, connect the page to your existing secure AI backend. The server should:
- authenticate the Supabase user,
- fetch only that user's progress,
- retrieve relevant TRQX lesson chunks,
- apply the education-only system policy,
- call the selected model server-side,
- return the response without exposing API keys.
