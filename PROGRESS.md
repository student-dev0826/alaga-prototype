# ALAGA progress

Updated: 2026-10-14 (Asia/Manila)

## Current application
- Cleanup milestone: pruned 41 unused installed packages and removed their lockfile entries; all remaining direct packages are used. Cached static page elements, removed duplicate search navigation/profile reads, avoided rebuilding unchanged auth UI and prevented same-account token refresh from overwriting unsaved profile edits. Corrected email-limit guidance. Lint/build and 12 browser checks passed; application remains plain HTML/CSS/JavaScript with lazy account code.
- Live checks reported by the user: signup email/confirmation, profile loading, profile save after refresh, and sign-out/sign-in with saved name all worked. Recovery email redirected to Page not found; fixed callback routing so auth fragments reach verification, provider errors show a fresh-link option, and existing sessions cannot mask failed links. Lint/build and three targeted mocked browser tests passed. Live recovery completion and two-account cloud isolation remain pending.
- Plain HTML/CSS/JavaScript is the only current implementation, promoted to the repository root at the user's request. Removed duplicate React source, its tests/tooling and dependencies; preserved database migrations, environment files and screenshots. Main uses npm run build with dist output. Clean installation, lint, production build, six PostgreSQL/RLS tests and eight browser tests passed after promotion.
- Prior React milestones below describe historical work retained in Git, not a second current application.

## Completed milestones
- Added a separate beginner-friendly plain HTML/CSS/JavaScript remake in plain-html, preserving the React app and database. Static HTML sections, original CSS/icons/fonts, hash navigation, persistent accessibility settings and lazy Supabase account/profile/notifications code. No React runtime in its production output.
- Plain remake production build and lint passed; eight browser tests passed covering 320/768/1440 layouts, enlarged text, keyboard skip link, preference persistence, axe AA scans, mocked auth validation, text-only notification rendering, account-specific recovery and late profile-save protection after logout. These account tests use a mocked SDK, not live email verification.
- Exact repository student-dev0826/alaga-prototype; branch development. Preserved README history, source-audit commit decca38 and foundation commit 8a28a46.
- Original Figma Make ZIP recovered after sign-in, inspected and migrated into one responsive app. Original icons, palette, Inter, hero, cards and navigation preserved; local reference export is ignored.
- Foundation has lazy routes/optional location panel, reusable skeletons, error boundary, semantic navigation, keyboard focus/skip link, honest empty states and persistent accessibility preferences.
- Supabase public values loaded from ignored .env.local (copied from the user's .env.local.example, which remains preserved). No credential values committed or logged.
- Implemented lazy Supabase client, PKCE registration/login/recovery/logout, private profile read/edit, paginated private notifications, validation with React Hook Form/Zod, and TanStack Query caching with resident isolation.
- Applied 202610140001_foundation.sql through the authenticated SQL Editor to project hvfmtimijtvxwxlpaknj after confirming no public tables existed. Verified nine cloud tables with RLS/policies. Public facilities API returns HTTP 200/zero records; anonymous private-profile reads are denied.
- User approved development Site URL http://127.0.0.1:4173 and exact /auth/callback redirects for ports 4173 and 5173; saved and verified. Email provider/confirmation enabled; saved server password minimum 12 and recent-session secure password changes.
- Vercel CSP permits only the exact backend origin. Build-time and runtime guards reject privileged browser keys; a synthetic secret-key build was correctly refused.
- TypeScript/build/lint passed; 21 unit/auth/cache/PostgreSQL tests and seven browser tests passed. Browser checks include 320/768/1440px layouts, keyboard use, direct routes, 200% text reflow, reduced motion, persistent preferences and axe scans with no detected AA violations on tested pages.
- Fixed a late-profile-save cache edge case after logout. Manual screen-reader audit remains pending. Auth mock tests and local PostgreSQL tests are not claimed as live hosted email/identity verification.

## Decisions / limits
- No verified production providers, facility-service relationships, slots or medical articles are inserted. No seed records or simulated booking success.
- Direct client slot/appointment writes are denied. Transactional booking, cancellation/rescheduling policies, database-backed search and history remain the next phase.
- No attachment/upload requirement found in actual source/specifications; storage remains deferred.
- Supabase migration was manually applied, not registered in the CLI ledger. Mark version 202610140001 applied with the authorized CLI repair workflow before a later db push; do not re-run the table-creation SQL. See docs/SUPABASE-SETUP.md.
- The plain JavaScript app uses the versioned SQL schema; obsolete TypeScript definitions were removed with the React implementation.
- Live recovery is currently blocked by the email sending limit; SMTP setup or a reset of the provider's quota is needed before retrying. No rate-limit settings were weakened.
- No Vercel deployment. Production domain, SMTP and auth redirects are pending; local Site URL is for development.

## Next work
1. Finish live recovery/password-change verification and two-account cloud RLS checks using authorized test accounts. Signup, confirmation, profile persistence and login/logout have user-reported success.
2. Deterministic verified-service/facility search with pagination/filtering and real availability.
3. Protected transactional booking/cancellation/rescheduling with slot locking/capacity constraints, approved policies and Asia/Manila rules.
4. Verified provider/scheduling data, persistent supporting features and confirmed attachment requirements.
5. Manual accessibility/security/performance checks and authorized Vercel deployment verification.
