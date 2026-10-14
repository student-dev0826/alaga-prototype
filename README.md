# alaga-prototype
HCI project
# ALAGA
Accessible Local Appointment and Guide App

A healthcare service discovery and appointment
scheduling website for residents in the Philippines.

Built with React, TypeScript, Supabase, and Vercel.

## Current milestone

The responsive React + TypeScript + Vite foundation is implemented from the original ALAGA Figma Make source. It uses shared routes, the source icons/palette/card patterns, Inter fonts, desktop sidebar and mobile navigation. Supabase is planned and **not integrated yet**.

Provider records, service availability, appointment slots, private profiles and notifications are deliberately empty until verified data and secure backend operations are connected. No bookings are simulated or confirmed. Health Guide categories are preserved; prototype medical articles are not published. See [source audit](docs/SOURCE-AUDIT.md) and [progress](PROGRESS.md).

## Local development

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

`.env.example` documents the future public Supabase variables. Keep local secrets out of Git. Once Supabase is integrated, configure approved authentication redirects and update the restrictive CSP `connect-src` for the exact project endpoints. Geolocation is currently disabled until reliable coordinates and a user-initiated location workflow are implemented. Never expose a service-role key in browser code.
