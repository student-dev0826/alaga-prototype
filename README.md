# alaga-prototype
HCI project
# ALAGA
Accessible Local Appointment and Guide App

A healthcare service discovery and appointment
scheduling website for residents in the Philippines.

Built with React, TypeScript, Supabase, and Vercel.

## Current milestone

The responsive React + TypeScript + Vite foundation is implemented from the original ALAGA Figma Make source. It uses shared routes, the source icons/palette/card patterns, Inter fonts, desktop sidebar and mobile navigation. Supabase authentication and private profile/notification access are implemented. The versioned schema/RLS migration is applied to the authorized cloud project; live email flows remain to be verified. See [Supabase setup](docs/SUPABASE-SETUP.md).

Provider records, services and slots remain empty until verified data and secure scheduling are connected. Profiles and notifications are gated by resident sign-in. No bookings are simulated or confirmed. Health Guide categories are preserved; prototype medical articles are not published. See [source audit](docs/SOURCE-AUDIT.md) and [progress](PROGRESS.md).

## Local development

An additional beginner-friendly version is available in [plain-html](plain-html/README.md). Its UI uses plain HTML, CSS and JavaScript with no React, TypeScript or Tailwind runtime. Run `npm run dev:plain`, or build with `npm run build:plain` and preview with `npm run preview:plain` at port 5173. `npm run test:plain` checks that version. The original React version remains available with the commands below.

Use Node.js 22.12+ (verified on 22.21.0).

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The production build includes TypeScript checking. Playwright runs against the production preview, including keyboard search, nested routes, mobile/tablet/desktop layouts, enlarged text, preference persistence and axe checks. Automated checks are not a substitute for a full manual screen-reader audit.

## Vercel preparation

Import this exact repository into the authorized Vercel account. Use Vite, `npm run build`, and `dist`. Set the appropriate deployment branch; current implementation work is on `development`. `vercel.json` supplies SPA fallback and security headers. No deployment is claimed.

`.env.example` documents the public Supabase variables. Keep local secrets out of Git. Follow the Supabase setup guide to apply migrations, configure approved redirects and run `npm run configure:headers` for the exact project endpoint before deployment. Geolocation remains disabled until reliable coordinates and a user-initiated location workflow exist. Never expose a service-role key in browser code.
