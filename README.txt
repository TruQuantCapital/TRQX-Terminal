TRQX ADMIN INTELLIGENCE — PHASE 2

This package does four things:
1. Restricts the frontend owner list to michaelvalerio@thetrulies.com only.
2. Restricts Supabase admin RPC access to that same single email.
3. Backfills last activity, current lesson reference, and study streak for existing learners.
4. Adds lesson-title translation, inactivity metrics, recent activity, and improved student profiles.

INSTALL ORDER
1. Run supabase/trqx_admin_phase2.sql in the Supabase SQL Editor.
2. Replace src/pages/AdminPage.jsx.
3. Replace src/styles/admin.css.
4. Replace src/App.jsx.
5. Run npm run build.
6. Commit/push or deploy to Vercel.
7. Sign out and back in as michaelvalerio@thetrulies.com.
8. Open /admin and click Refresh.

SECURITY CHECK
After running the SQL, verify:
select pg_get_functiondef('public.is_trqx_admin()'::regprocedure);

It should contain only:
michaelvalerio@thetrulies.com

NOTE
The backfill derives last activity and the current lesson reference from the latest completed lesson for older users. It cannot reconstruct historical study minutes that were never recorded, so those remain 0 until new study sessions are tracked.
