# Supabase foundation

This phase prepares schema/RLS, resident authentication, private profile read/edit and paginated notifications. Booking and live facility search are not enabled yet. Cloud migration and live email flows must be verified against the selected project.

## Verified project state — 2026-10-14

Applied `202610140001_foundation.sql` through the signed-in SQL Editor to project `hvfmtimijtvxwxlpaknj` after verifying there were no public tables. Confirmed all nine tables have RLS and their intended policies; the public facilities API returns HTTP 200 with zero records, and anonymous profile access is denied. This manual SQL application is not registered automatically in the Supabase CLI migration ledger. Before a later `db push`, use the authorized CLI workflow to mark version `202610140001` applied (`supabase migration repair --status applied 202610140001`) after checking the project link and migration list. Do not re-execute the table-creation migration against this project.

With explicit user approval, saved development Site URL `http://127.0.0.1:4173` and exact callbacks at `/auth/callback` for ports 4173 and 5173. Email provider and email confirmation are enabled. Saved a 12-character server minimum and secure password changes requiring a recent session. Live email delivery and resident registration/confirmation/recovery have not been tested yet. The production domain/SMTP configuration remains pending.

## Connect the authorized project

1. Copy `.env.example` to `.env.local` and set the exact project URL and **publishable** key. Legacy anon keys are supported; secret/service-role keys are rejected by browser configuration. Never commit `.env.local`.
2. Inspect `supabase/migrations/202610140001_foundation.sql`, then apply it through the authorized project's SQL Editor or migration workflow. It creates new tables without deleting records, backfills profile/preferences for existing auth users, and seeds no facilities or slots. If similarly named tables already exist, reconcile first rather than replacing them. Browser public keys cannot apply migrations.
3. Enable email/password auth with email confirmation, minimum password length 12 and appropriate rate limits. Set the production Site URL. Allow exact `/auth/callback` redirects for the authorized production domain and local origins you use (`http://127.0.0.1:5173/auth/callback` and `http://127.0.0.1:4173/auth/callback`). PKCE links must open in the browser where requested. Configure production SMTP before relying on delivery.
4. Run `npm run configure:headers` after adding the URL. It permits only that exact HTTPS backend origin in Vercel CSP and writes no keys. Commit the public-origin change before deploying.
5. Restart development or rebuild the preview after editing environment values; public Vite variables are embedded at build time.
6. Keep JavaScript queries aligned with the versioned database schema. The current plain JavaScript app does not require generated TypeScript database types.

## Verification

```sh
npm run lint
npm test
npm run build
npm run test:e2e
```

`tests/database.test.ts` executes the migration and real PostgreSQL RLS using PGlite, with test-only auth roles/`auth.uid()` fixtures. It verifies cross-resident isolation, column restrictions, verified-only public reads, constraints and denied scheduling writes. It does not verify hosted JWT processing, SMTP, PostgREST or cloud deployment. Docker was unavailable during initial validation.

Auth tests explicitly mock provider responses to verify validation, rejected login, confirmation-required signup, recovery-session gating, sanitized errors and cache isolation. Browser checks cover responsive flows and accessibility. Live signup/email confirmation/login/recovery/logout and two-account cloud RLS tests remain required after connection.

## Security boundaries and next phase

- Private data is owner-only. Clients cannot verify facilities or create/alter slots/appointments. Updates are limited to profile display name, presentation preferences and notification read state. Notification read timestamps are normalized by the server.
- Supabase owns session persistence/refresh; passwords are never manually stored. SDK imports are dynamic. The production build rejects privileged browser keys; the build guard was tested with a synthetic secret key. Timeouts and abortable queries bound loading. Private cache keys include resident ID; caches clear on account changes/logout.
- Callback codes are removed from browser history after initialization. Errors are sanitized; patient details are not logged or placed in URLs.
- Trigger functions use an unexposed `private` schema, explicit grants and pinned search paths. Do not expose this schema through the Data API.
- Transactional booking must validate/lock slots, maintain capacity and unique references, and enforce approved cancellation/rescheduling policies. Current constraints are groundwork, not a complete concurrency solution; client booking writes are denied.
- No seed providers or attachment uploads. Verified facility/service data and scheduling arrangements are needed before enabling discovery and booking.
- Data retention and applicable Philippine privacy obligations need separate review; technical controls do not establish legal compliance.
