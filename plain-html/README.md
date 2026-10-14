# ALAGA — plain HTML, CSS and JavaScript

This is a separate version of the current ALAGA app. The React app and Supabase database are preserved. The plain version uses no React, TypeScript, Tailwind, UI framework or form library.

- `index.html`: ordinary page markup, navigation and forms. Sections marked `data-page` are shown/hidden by navigation.
- `styles.css`: normal CSS, preserving the existing ALAGA visual system and responsive layouts.
- `app.js`: navigation, search, guide filtering and accessibility settings.
- `auth.js`: optional Supabase account/profile/notification functionality, loaded only on account pages.
- `icons.js`: the original SVG icons.

From the repository root:

```sh
npm ci
npm run dev:plain
```

Open `http://127.0.0.1:5173`. The existing approved Supabase callback for that origin is reused. No database or Supabase dashboard settings need to change. `.env.local` supplies the existing public configuration; passwords and private records are never manually stored. Private results are safely discarded when the account changes or signs out.

```sh
npm run build:plain
npm run preview:plain
npm run test:plain
```

Vite is used only as development/build tooling to bundle the optional Supabase JavaScript client and local fonts. The production `plain-dist` folder contains ordinary static HTML/CSS/JavaScript and fonts, with no React runtime. Use an HTTP server rather than double-clicking the source file, since ES modules and authentication redirects require an origin.

Hash navigation supports reloads and Back/Forward. Healthcare queries stay in memory and do not enter URLs or storage. Backend-generated text is inserted with `textContent` to prevent HTML injection.

For a future Vercel deployment of this version, use the repository root with build command `npm run build:plain` and output directory `plain-dist`. Keep the existing security headers and SPA fallback in `vercel.json`; configure approved production authentication redirects before launch. The default React deployment configuration remains unchanged.

Verification: production build, ESLint and eight Playwright checks passed. Browser checks include three viewport widths, keyboard navigation, enlarged text, preference persistence, automated axe AA scans and mocked account/privacy behavior. A full manual screen-reader audit and live email-flow checks remain pending.

Same current limitations: no verified facilities/slots, no live service search, no transactional bookings, no reviewed articles, no deployment, and no live email-flow verification. Do not treat the remake as completion of the unfinished backend phases.
