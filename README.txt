TRQX Academy Dashboard Progress Fix

Replace:
1. src/components/Cards.jsx with components/Cards.jsx
2. src/styles.css with styles.css

What changed:
- Removed hardcoded Beginner 75%, Intermediate 45%, Advanced 20% values.
- Uses the existing useAcademyProgress hook and authenticated Supabase data.
- Uses the same courseLevels data as AcademyPage.
- Shows per-user lesson counts and percentage by level.
- Shows overall percentage and total completed lessons.
- Identifies the next incomplete lesson from the first unlocked level.
- Adds responsive 2-column/tablet and 1-column/mobile behavior.

No database change is included. This expects the existing academy_progress table and RLS policies used by useAcademyProgress.js.
