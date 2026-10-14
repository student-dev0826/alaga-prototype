# ALAGA source audit — 2026-10-14

Repository: student-dev0826/alaga-prototype. Preserve README commit 08c80b0 and work on development.

Source: https://www.figma.com/make/Xi3g7PsyRfjbYTy8C0IscE/Create-attachment-feature

Downloaded the original ZIP through the signed-in Make Files → File actions → Download code UI. Inspected App.tsx, MobileApp.tsx, DesktopApp.tsx, data.ts, icons.tsx, index.css, package.json, TypeScript/Vite configuration, and the four source specification/flow documents. The local reference export is ignored by Git to avoid shipping duplicate prototype implementations and Figma runtime configuration.

Export ZIP SHA-256: `4F4A887B64050471E4F8002294B2DF914300EA203709DC617727082E9D83DE0B`.

## Confirmed stack and visual system
- React/React DOM ^19.0.0, TypeScript ^5.7.0 with strict mode, Vite ^8.0.5, React Vite plugin ^6.0.0, Tailwind CSS ^4.0.0.
- Inter with system sans-serif fallback; primary #16a34a, dark primary #15803d, secondary #2563eb, gray surfaces, rounded cards, heart logo, original SVG icon set.
- Separate desktop sidebar/header and mobile bottom navigation. App.tsx embeds a phone frame and platform demonstration toggle.
- No static raster images are referenced by exported application code. Original SVG icons are reused directly.

## Feature inventory
- Splash/onboarding; dashboard; service-first search, suggestions and query interpretation; results and filters.
- Directory, map placeholder, facility details, service listings.
- Booking wizard, patient information/review/success, appointment tabs/details, cancellation and rescheduling.
- Health Guide categories/article reader; notifications; sample resident profile; accessibility toggles and Help & Support.
- All provider records, slots, bookings, notifications, identity, and medical article content are prototype data. Booking success is simulated and cannot be carried into production.
- No upload, attachment input, storage integration, or attachment requirements found in the exported code/specifications. The file title alone does not establish a requirement.

## Foundation migration
Reuse the original icons, palette, hero wording, suggestion chips, card shapes, navigation information architecture and category metadata. Compose a single responsive shell and shared route components, removing phone framing and platform toggles. Improve contrast, body text sizing, focus, labels, touch targets, keyboard behavior and reduced motion. Persist functional accessibility preferences; screen reader support is always enabled rather than a cosmetic toggle. Extract routes into lazy modules and use reusable skeletons/error boundaries. Replace unverified sample data with honest empty states. Search suggestions are examples, not verified service availability; database-backed matching comes in the backend phase. Do not collect patient information before secure persistence is available.

## Backend and security plan (deferred)
Normalized profiles, facilities, services, facility_services, appointment_slots, appointments, notifications, health_articles and user_preferences. UUID keys, integrity constraints, verified-only public reads, owner-only RLS for private records, Supabase Auth and least privilege. Transaction-safe server booking operations lock/check capacity, prevent double booking, enforce status/cancellation/reschedule policies and generate unique references. Store timezone-aware timestamps; Asia/Manila for display/business rules. If attachments are confirmed later, use private storage, ownership policies, validated files and signed access. Avoid sensitive information in logs, analytics and URLs. Technical controls do not establish legal compliance.

## Milestones and missing inputs
1. Complete responsive foundation; verify TypeScript, lint, unit tests, build and browser accessibility/responsive checks; commit/push development.
2. Supabase schema/migrations/RLS/Auth; then verified service search and transactional appointments.
3. Supporting persistent features and confirmed attachments; performance/security checks; Vercel verification.

Backend phase needs a Supabase project URL/public publishable key and authorized migration access, verified facility/service/scheduling data, and Vercel project/redirect configuration. No service-role key belongs in browser code or chat.
