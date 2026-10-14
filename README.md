# ALAGA

Accessible Local Appointment and Guide App — HCI project for residents in the Philippines.

The application uses **plain HTML, CSS and JavaScript**, preserving the original ALAGA Figma Make design. Supabase handles resident accounts and private profile/notification data. Vite provides local development and production bundling; the website has no React, TypeScript or Tailwind runtime.

## Source files

- `index.html`: page sections, navigation and accessible forms.
- `styles.css`: ALAGA colors, typography and responsive layouts.
- `app.js`: navigation, search interface, guide categories and saved accessibility settings.
- `auth.js`: lazy-loaded Supabase accounts, profiles and notifications.
- `icons.js`: original SVG icons.
- `supabase/migrations/`: versioned database schema and ownership policies.

## Run locally

Use Node.js 22.12 or newer. From the repository root:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Copy `.env.example` to `.env.local` and supply only the public Supabase URL and publishable/anon key. Never supply a service-role key. Existing local configuration is preserved. Use an HTTP server rather than double-clicking the source file: modules and authentication redirects require an origin.

```sh
npm run lint
npm test
npm run build
npm run test:e2e
npm run preview
```

Production files are generated in `dist`. Hash navigation supports reloads and Back/Forward. Healthcare queries remain in memory; backend text uses `textContent`. Account code loads only on private/account pages. Private requests and caches are isolated by resident and cleared after sign-out.

## Current scope

Responsive navigation, search interface, Health Guide categories, accessibility settings, resident authentication, private profiles and notifications are implemented. Database schema/RLS is applied to the authorized Supabase project. Verified provider records, service matching, slots, transactional booking and reviewed medical articles remain pending; there are no simulated appointments. Live email flows and manual screen-reader verification are pending.

Browser tests cover responsive layouts, keyboard navigation, enlarged text, preference persistence, axe AA scans and mocked account privacy. Database tests execute the migration and RLS against local PostgreSQL. Mocked account checks are not live email verification. See [progress](PROGRESS.md), [source audit](docs/SOURCE-AUDIT.md) and [Supabase setup](docs/SUPABASE-SETUP.md).

## Vercel

Use this exact repository, branch `main`, build command `npm run build`, and output directory `dist`. `vercel.json` supplies SPA fallback and security headers. Configure public environment values and approved production authentication redirects before launch; run `npm run configure:headers` if the backend endpoint changes. No deployment is claimed.

The previous React implementation was removed from the current files at the user's request; its history remains recoverable in Git.
