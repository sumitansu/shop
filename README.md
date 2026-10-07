# ⚠️ MANDATORY CONTRIBUTOR DIRECTIVE: CHANGE REPORTING LOG

> **CRITICAL RULE FOR ALL DEVELOPERS & AI AGENTS:**  
> Anyone working on this codebase or modifying any page, component, or configuration **MUST IMMEDIATELY REPORT AND LOG ALL CHANGES AT THE TOP OF THIS README**.  
> This applies unconditionally to human contributors and AI assistants. Every modification, addition, deletion, architectural update, or configuration change must be recorded in the [Change Log](#-project-change-log) below before finishing any turn or commit.
>
> **EXECUTION DISCIPLINE:**  
> All work must be conducted **step by step, small at a time, verified at the highest craft quality**. Do not rush or build out-of-scope modules ahead of explicit user instructions.

---

## 📋 Project Change Log

| Date & Time (UTC) | Author | Scope / Task | Files Modified / Added | Summary of Changes |
| :--- | :--- | :--- | :--- | :--- |
| 2026-10-06 22:53 | AI Assistant | Third Security Pass - Stage 4: Prefixed Redis Credentials, Loud Production Warnings & Atomic Order Insertion | `api/_rateLimit.ts`, `api/_orders.ts`, `README.md` | In `api/_rateLimit.ts`, expanded Upstash/KV credential discovery to support custom-prefixed environment variable pairs (`*_UPSTASH_REDIS_REST_URL` / `*_UPSTASH_REDIS_REST_TOKEN`, `*_KV_REST_API_URL` / `*_KV_REST_API_TOKEN`), and added a loud console security warning in production environments when Redis credentials are missing; in `api/_orders.ts`, completely removed runtime `ensureOrdersTable()` DDL calls from request handlers (relying exclusively on `migrations/001_init.sql`), and transformed `confirmOrder` into an atomic PostgreSQL `INSERT ... ON CONFLICT (id) DO NOTHING RETURNING` statement that eliminates race conditions and safely treats zero returned rows as already confirmed. |
| 2026-10-06 22:47 | AI Assistant | Third Security Pass - Stage 3: Self-Hosted Fonts & Strict font-src CSP Compliance | `public/fonts/roboto-flex-latin.woff2`, `public/fonts/roboto-flex-latin-ext.woff2`, `src/index.css`, `src/components/TextPressure.tsx`, `README.md` | Downloaded and self-hosted Roboto Flex variable font assets (`.woff2`) locally in `/public/fonts/`; configured `@font-face` rules in `src/index.css` supporting full weight (`100-1000`) and stretch (`25%-151%`) axes; removed external `@import` from `fonts.googleapis.com` in `src/components/TextPressure.tsx`; kept strict Content Security Policy (`font-src 'self'`) across `vercel.json` and `server.ts` with zero external font domain loosening. |
| 2026-10-06 22:42 | AI Assistant | Third Security Pass - Stage 2: Promo Code Validation & Delimiter Invariant Enforcement | `api/_shopRules.ts`, `api/_orders.ts`, `README.md` | Enforced strict format validation (`/^[A-Z0-9]{1,20}$/`) for promo codes across `/shop/calculate-bill`, order HMAC creation (`createOrderHmac`), order code verification (`verifySignedOrderCode`), and database order confirmation (`confirmOrder`); rejected underscores (`_`), symbols, and inputs exceeding 20 characters with HTTP 400, guaranteeing underscores can never collide with the `ORDCODE_*` `_` delimiter or break parsing, and preventing `promo_used` from exceeding the Neon DB `VARCHAR(50)` column limit. |
| 2026-10-06 22:38 | AI Assistant | Third Security Pass - Stage 1: Order Signing Secret Enforcement & Full 64-Hex HMAC | `api/_shopRules.ts`, `api/_orders.ts`, `api/_app.ts`, `.env.example`, `README.md` | Removed all fallbacks for `ORDER_SIGNING_SECRET` (no `BLOB_READ_WRITE_TOKEN`, no hardcoded string fallbacks); enforced strict minimum length requirement of 32 characters; order-code generation and verification fail closed with HTTP 500 (`{ error: 'Internal server error' }`) and log a clear critical server-side error if the secret is missing or under 32 chars; upgraded HMAC signature digest from truncated 16-hex to full 64-hex HMAC-SHA256; implemented constant-time signature verification using `crypto.timingSafeEqual`; propagated 500 status cleanly across `/shop/calculate-bill` and `/orders/confirm`; documented `ORDER_SIGNING_SECRET` placeholder in `.env.example`. |
| 2026-10-06 19:49 | AI Assistant | Second Security Pass - Stage 7: HMAC-Signed Order Codes & Admin Orders Management | `src/types/shop.ts`, `api/_shopRules.ts`, `api/_orders.ts`, `api/_app.ts`, `README.md` | Built HMAC-SHA256 cryptographic order code signing engine (`createOrderHmac`, `generateSignedOrderCode`, `verifySignedOrderCode`) encoding server-verified prices and config hashes into tamper-proof order codes (`ORDCODE_*`); created Neon PostgreSQL `orders` table manager (`api/_orders.ts`) committing server-generated ID, customer name, JSONB hardware config, INR price snapshot, promo, and status strictly upon admin confirmation; mounted admin-only order endpoints (`/api/orders/confirm`, `/api/orders`, `/api/orders/:id/status`) enforcing strict `expressRequireAdmin` authorization and mutation rate limiting; zero payment providers or card data accepted. |
| 2026-10-06 19:46 | AI Assistant | Second Security Pass - Stage 6: Multipart Blob Uploads, Magic Bytes Validation & Size Capping | `package.json`, `api/_validation.ts`, `api/_app.ts`, `README.md` | Replaced JSON-string blob upload payloads with standard multipart/form-data upload pipeline using `multer`; implemented binary magic bytes header verification (`verifyMagicBytes`) verifying file signatures for `image/png`, `image/jpeg`, `image/webp`, and `application/pdf` to block MIME-type spoofing; capped file size strictly to 4.5 MB (`MAX_BLOB_FILE_SIZE_BYTES`) returning 413 on overflow; simplified global Express body parser to 100kb; kept private blob storage and strict admin-only authorization barrier (`expressRequireAdmin`). |
| 2026-10-05 20:52 | AI Assistant | Second Security Pass - Stage 5: Dead Code Removal, Migration 002 Fix & Env Sanitization | `src/lib/supabase.ts` (deleted), `package.json`, `api/_app.ts`, `vercel.json`, `server.ts`, `migrations/001_init.sql`, `migrations/002_supabase_rls.sql`, `.env.example`, `README.md` | Eradicated unused Supabase client (`src/lib/supabase.ts`), helpers, and `@supabase/supabase-js` dependency; retained Neon PostgreSQL exclusively for the `orders` table; modernized `migrations/001_init.sql` to define the official `orders` schema with JSONB config and indexes; fixed `migrations/002_supabase_rls.sql` by dropping all Supabase-specific roles (`service_role`, `authenticated`, `auth.uid()`) in favor of native Neon PostgreSQL default-deny table security; purged stale environment variables from `.env.example` (`GEMINI_API_KEY`, `APP_URL`, `BLOB_STORE_ID`, `SUPABASE_*`, and vault references); updated documentation. |
| 2026-10-05 20:49 | AI Assistant | Second Security Pass - Stage 4: Content Security Policy (CSP) Hardening | `vercel.json`, `server.ts`, `README.md` | Removed `'unsafe-inline'` from `script-src` in Content-Security-Policy across both `vercel.json` and production `server.ts`; strictly allow-listed script origins (`'self'`, `https://apis.google.com`, `https://www.gstatic.com`, `https://va.vercel-scripts.com`); verified that all 12 modular React Bits intro animations and WebGL shaders execute purely via bundled ES modules without inline script tags; preserved Firebase Auth popup sign-in functionality (`frame-src`, `connect-src`, and `COOP: same-origin-allow-popups`) and Vercel Analytics tracking. |
| 2026-10-05 20:47 | AI Assistant | Second Security Pass - Stage 3: Public Shop Routes & Stricter Per-IP Limiter | `api/_rateLimit.ts`, `api/_app.ts`, `README.md` | Partitioned API architecture into public shop routes (`shopRouter`) and protected routes (`protectedRouter`); made `/shop/calculate-bill` (and `/api/shop/calculate-bill`) and future catalog routes public without requiring login or Firebase ID tokens; assigned a dedicated, stricter per-IP sliding-window rate limiter (`publicShopLimiter`, 20 req/15min) to shop routes to prevent calculation compute abuse and scraper flooding; strictly preserved `expressRequireAuth` and `expressRequireAdmin` on all non-shop routes (including private blob operations). |
| 2026-10-05 20:45 | AI Assistant | Second Security Pass - Stage 2: Upstash Ratelimit on Vercel & Trust Proxy Configuration | `api/_rateLimit.ts`, `api/_app.ts`, `server.ts`, `.env.example`, `package.json`, `README.md` | Replaced single-instance in-memory rate limiting with distributed Upstash Ratelimit (`@upstash/ratelimit` + `@upstash/redis`) backed by a sliding-window algorithm, maintaining 100 req/15min for general routes and 30 req/15min for write mutations; enabled an in-memory sliding-window fallback for local dev when Redis credentials are not present; configured `trust proxy` (`1`) on both `server.ts` and `api/_app.ts` so `req.ip` correctly extracts real client IPs behind Vercel edge and Cloud Run reverse proxies; documented `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.example`. |
| 2026-10-05 20:42 | AI Assistant | Second Security Pass - Stage 1: Authorization & Token Verification Hardening | `api/_auth.ts`, `api/_app.ts`, `README.md` | Enforced strict admin authorization on `/blob/get` and `/blob` dispatcher routes via `expressRequireAdmin`, ensuring authenticated non-admin Google users cannot read private blobs; hardened token verification (`verifyAuthHeader`) to log jose errors strictly server-side (`console.error`) and return an uninformative, generic 401 `{ error: 'Unauthorized' }` to clients across all token validation failure modes (malformed, empty, invalid signature, expired, or missing UID). |
| 2026-10-05 20:30 | AI Assistant | Master Specification Update & Design Reference Integration | `README.md` | Integrated owner's updated e-commerce specification and design reference directives: planned aesthetic benchmarks from Unseen Studio (unseen.co), Linear (linear.app blur-in loading), Resend (resend.com typography/micro-interactions), Poppr, and explicit rejection of QuadAngles; codified performance mandate requiring native smoothness on low-end phones before potato mode; added intentional responsive scaling from mobile to TV displays; enshrined direct social dispatch protocols (WhatsApp +91, Telegram prefill, Instagram DM), deterministic price history decoding, and urgency order sorting into Roadmap. |
| 2026-10-05 20:25 | AI Assistant | Security Pass Stage 8: Shop Security Directives & Rules Engine | `src/types/shop.ts`, `api/_shopRules.ts`, `api/_app.ts`, `README.md` | Enshrined non-negotiable Phase 2 security contracts: created server-authoritative pricing and allow-list engine (`api/_shopRules.ts`, `src/types/shop.ts`); prices, itemized costs, and totals are computed strictly server-side with zero trust in client values; options validated against strict hardware compatibility rules (V1 incompatible with wireless control; V1 fixed at 2 antennas; module/antenna type pairing); order IDs generated cryptographically server-side (`ORD-...`); enforced hosted payment compliance rejecting credit card data payloads; mounted `/api/shop/calculate-bill` endpoint. |
| 2026-10-05 20:20 | AI Assistant | Security Pass Stage 7: Performance & Code-Splitting | `src/App.tsx`, `README.md` | Code-split and lazy-loaded all 12 React Bits intro typography components (`TechText`, `FoldText`, `ParticleText`, `StrokeText`, `Shuffle`, `ScrambledText`, `TextType`, `RotatingText`, `TextPressure`, `DecryptedText`, `BlurText`, `SplitText`) using dynamic `React.lazy` and wrapped in `<Suspense>` with zero-layout-shift bounding fallback. Eliminated heavy upfront JS bundle bloat so the browser downloads exclusively the single selected RNG animation chunk on page load, drastically lowering initial payload and TTI. |
| 2026-10-05 20:15 | AI Assistant | Security Pass Stage 6: Demo Code & Unused Route Cleanup | `package.json`, `api/_app.ts`, `api/_validation.ts`, `src/types/index.ts`, `README.md`, Deleted: `src/components/BlobTab.tsx`, `DatabaseTab.tsx`, `SupabaseTab.tsx`, `VercelGuideTab.tsx`, `ChangelogTab.tsx`, `SystemDrawer.tsx`, `OverviewTab.tsx`, `AuthTab.tsx`, `CleanHome.tsx`, `Navbar.tsx`, `api/posts.ts`, `api/todos.ts` | Removed all demo explorer tabs and leftover UI (`BlobTab`, `DatabaseTab`, `SupabaseTab`, `VercelGuideTab`, `ChangelogTab`, `SystemDrawer`, `OverviewTab`, `AuthTab`, `CleanHome`, `Navbar`); eliminated obsolete demo route handlers and schemas (`/api/db/*`, `/api/supabase/*`, `/api/posts*`, `/api/todos*`, `/api/system/health`, `/api/blob/status`) while retaining core Quad-Storage Blob endpoints and database connection clients; removed deleted serverless function files `api/posts.ts` and `api/todos.ts`; pruned unused dependency `@google/genai` from `package.json`; cleaned demo interfaces from `src/types/index.ts`. |
| 2026-10-05 20:10 | AI Assistant | Security Pass Stage 5: Enterprise Headers & CSP Hardening | `vercel.json`, `README.md` | Configured strict enterprise security headers in `vercel.json`: added Content-Security-Policy (CSP) restricting execution strictly to `'self'`, Firebase (`googleapis.com`, `firebaseio.com`, `firebaseapp.com`), Supabase (`supabase.co`, `wss://*.supabase.co`), and Vercel Analytics (`va.vercel-scripts.com`, `vitals.vercel-insights.com`); removed deprecated `X-XSS-Protection`; added `Strict-Transport-Security` (HSTS: `max-age=63072000; includeSubDomains; preload`); configured `Cross-Origin-Opener-Policy: same-origin-allow-popups` to support Firebase Auth popup sign-in flows without cross-origin severing; validated Stages 1 through 4. |
| 2026-10-05 20:05 | AI Assistant | Security Pass Stage 4: Secrets, Keys & Supabase RLS | `src/lib/supabase.ts`, `api/_app.ts`, `api/_validation.ts`, `migrations/001_init.sql`, `migrations/002_supabase_rls.sql`, `firestore.rules`, `firebase-blueprint.json`, `src/components/SystemDrawer.tsx`, `src/components/OverviewTab.tsx`, `README.md` | Eradicated the vault feature and all secrets from app databases (dropped `vault_secrets` endpoints `/api/vault/*`, validation, schema definitions, and Firestore `/vault` collection); removed hardcoded fallback Supabase URL and anon key from `src/lib/supabase.ts` enforcing strict environment-only reading and loud runtime exceptions; guaranteed `SUPABASE_SERVICE_ROLE_KEY` is server-only (never exposed to client) and updated backend Supabase helpers to prefer anon key + RLS; created `migrations/002_supabase_rls.sql` providing SQL that enforces Row Level Security (RLS) on all Supabase tables (`todos`, `posts`) with explicit default-deny policies, service role bypass, and ownership enforcement; deployed cleaned ABAC rules to Firestore. |
| 2026-10-05 20:00 | AI Assistant | Security Pass Stage 3: Unified Handlers & SQL Migrations | `api/_app.ts`, `api/[...path].ts`, `api/blob.ts`, `api/posts.ts`, `api/todos.ts`, `server.ts`, `vercel.json`, `migrations/001_init.sql`, `README.md` | Eliminated Vercel deployment mismatch and all route duplication between `server.ts` and `api/*` by building a single unified Express application (`api/_app.ts`); configured Vercel serverless catch-all `api/[...path].ts` and rewrote `/api/(.*)` in `vercel.json`; created one-time SQL migration `migrations/001_init.sql` and eradicated runtime `CREATE TABLE IF NOT EXISTS` queries from all request handlers. |
| 2026-10-05 19:54 | AI Assistant | Security Pass Stage 2: Stop Leaks & Abuse | `server.ts`, `api/_validation.ts`, `api/blob.ts`, `api/posts.ts`, `api/todos.ts`, `package.json`, `README.md` | Eliminated raw `err.message` exposure across all endpoints with server-side error logging and sanitized client responses; enforced universal input validation (title <=150, content <=10k, id constraints, secret sizing); reduced global body parser limit to 100kb with a dedicated 5MB cap on `/api/blob/upload`; hardened blob storage with pathname sanitization (only `[a-z0-9/_.-]`, no `..`, no leading `/`), forced `access: 'private'`, and allow-listed MIME types (png, jpeg, webp, pdf, strictly blocking html/svg); implemented rate limiting via `express-rate-limit` (100 req/15min general, 30 req/15min mutations). |
| 2026-10-05 19:48 | AI Assistant | Security Pass Stage 1: API Lockdown (Critical) | `server.ts`, `api/_auth.ts`, `api/blob.ts`, `api/posts.ts`, `api/todos.ts`, `.env.example`, `README.md` | Locked down all API routes in `server.ts` and `api/*`: enforced valid Firebase ID token verification (Authorization: Bearer) returning 401 on unauthorized requests via `jose` Web Crypto JWKS; guarded all admin-only routes (blob upload/list/delete, db init/delete, all vault routes, status/health endpoints) with strict `ADMIN_UID` check returning 403 on mismatch; removed hardcoded Blob store ID from `server.ts` and `README.md`. |
| 2026-10-05 19:37 | AI Assistant | Low-End Device Shader Optimization (Stages 1 & 2) | `src/App.tsx`, `src/components/GradientWaves.tsx`, `README.md` | Completed Stage 1 & Stage 2 optimizations for `<GradientWaves />`: lazy-loaded the WebGL component in `App.tsx` with `React.lazy` and `Suspense` to unblock page load/TTI while preserving auto-pause logic; capped renderer device pixel ratio in `GradientWaves.tsx` to `Math.min(window.devicePixelRatio || 1, 1)` to eliminate up to 75% fragment shader raymarching overhead on high-DPI/Retina mobile screens. |
| 2026-10-04 21:50 | AI Assistant | Visual Typography Harmonization & Scale Lock | `src/components/ScrambledText.tsx`, `src/components/TextPressure.tsx`, `src/App.tsx`, `README.md` | Calibrated and locked uniform responsive typography scale (`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black`) across all 11 RNG intro components. Fixed ScrambledText root size constraint, clamped TextPressure to 86px max desktop scale, and unified viewport container heights and baselines to eliminate layout jitter. |
| 2026-10-04 21:47 | AI Assistant | Phase 1.2 Intro Animations Complete & Progress Stamped | `README.md` | Formal milestone sign-off and progress stamp for Phase 1.2 (Intro Typography & 11-Animation RNG Suite). Verified all 11 React Bits components, zero build/type warnings, clean dark viewport presentation for "DoRaemon's Shop", and queued Phase 2 (Product Catalog & Currency Conversion). |
| 2026-10-04 21:46 | AI Assistant | Intro RNG Expansion (TextPressure, DecryptedText, BlurText, SplitText) | `src/components/TextPressure.tsx`, `src/components/DecryptedText.tsx`, `src/components/BlurText.tsx`, `src/components/SplitText.tsx`, `src/App.tsx`, `README.md` | Integrated 4 React Bits components: `<TextPressure />` (variable font cursor proximity deformation), `<DecryptedText />` (sequential cipher decryption matrix), `<BlurText />` (Motion blur keyframe stagger), and `<SplitText />` (GSAP 3D perspective letter drop). Expanded the 100vh full-screen intro RNG suite to 11 dynamic typographic experiences. |
| 2026-10-04 21:36 | AI Assistant | Intro RNG Expansion & MaskedHeading Removal | `src/components/ScrambledText.tsx`, `src/components/TextType.tsx`, `src/components/RotatingText.tsx`, `src/App.tsx`, `README.md` | Integrated React Bits components `<ScrambledText />` (GSAP hover-proximity scramble), `<TextType />` (terminal typing loop), and `<RotatingText />` (Motion spring-stagger text rotation). Removed `<MaskedHeading />` and `<GradientWaves />` per user instructions. Added the new effects to the 100vh intro RNG pool. |
| 2026-10-04 21:29 | AI Assistant | Intro RNG Multi-Effect Suite Integration | `src/components/FoldText.tsx`, `src/components/GradientWaves.tsx`, `src/components/MaskedHeading.tsx`, `src/components/ParticleText.tsx`, `src/components/StrokeText.tsx`, `src/components/Shuffle.tsx`, `src/App.tsx`, `README.md` | Integrated 5 React Bits components (`FoldText`, `MaskedHeading` with `GradientWaves` plasma wave background mask, `ParticleText`, `StrokeText`, and `Shuffle`) alongside `TechText`. Built an RNG engine in `App.tsx` that selects a randomized visual experience on every page load/refresh, with a discreet preview roll controller for instant testing. Installed `gsap`, `@gsap/react`, and `ogl`. |
| 2026-10-04 21:17 | AI Assistant | Intro Brand Name & TechText Integration | `src/components/TechText.tsx`, `src/App.tsx`, `README.md` | Integrated the React Bits `<TechText />` interactive canvas component (TypeScript + Tailwind) into the 100vh full-screen intro with brand name "DoRaemon's Shop", featuring idle sweep, blueprint bounding labels, precision dash outlines, and draggable spring physics. |
| 2026-10-04 21:05 | AI Assistant | Visual Reset to Clean Blank Canvas | `src/App.tsx`, `README.md`, `index.html`, `metadata.json` | Cleared user-facing visual UI to present a blank black page as requested while keeping all backend services, Quad-Storage engines, and API endpoints completely intact. Read and verified the E-commerce spec in preparation for the step-by-step intro implementation. |
| 2026-10-04 14:05 | AI Assistant | Master Specification & Roadmap Integration | `README.md`, `src/components/ChangelogTab.tsx`, `.env` | Enshrined complete E-Commerce Site Spec ("DoRaemon's Shop"), added Master Implementation Roadmap with real-time phase tracking (Completed vs Next Up), restored environment configuration, and established strict small-step verification protocol. |
| 2026-10-04 12:55 | AI Assistant | Quad-Redundancy Fallback & Site Canvas Clean | `README.md`, `src/lib/resilientVault.ts`, `server.ts`, `src/App.tsx`, `src/components/CleanHome.tsx`, `src/components/Navbar.tsx`, `src/components/SystemDrawer.tsx`, `src/components/ChangelogTab.tsx` | Enshrined mandatory Quad-Storage Redundancy Policy (3 DBs + 1 Blob) in README.md with automatic failover fallback on rate-limits, implemented resilientVault service with multi-sync write and cascading fallback read, and cleaned the entire user-facing UI into a pristine, modern canvas ready for user feature instructions. |
| 2026-10-04 12:51 | AI Assistant | Supabase Backend Integration | `server.ts`, `api/todos.ts`, `.env`, `.env.example`, `package.json`, `src/lib/supabase.ts`, `src/components/SupabaseTab.tsx`, `src/components/Navbar.tsx`, `src/App.tsx`, `README.md`, `src/components/ChangelogTab.tsx` | Integrated `@supabase/supabase-js`, configured Supabase REST, PostgREST, and PostgreSQL connection strings in `.env`, created `/api/supabase/*` server proxy routes, implemented Vercel Serverless Function `/api/todos.ts`, and built an interactive Supabase Todos & PostgREST explorer tab with live mutations. |
| 2026-10-04 12:44 | AI Assistant | Neon PostgreSQL Integration | `server.ts`, `api/posts.ts`, `.env`, `.env.example`, `package.json`, `src/types/index.ts`, `src/components/DatabaseTab.tsx`, `src/components/Navbar.tsx`, `src/App.tsx`, `README.md`, `src/components/ChangelogTab.tsx` | Integrated `@neondatabase/serverless` for Neon Serverless PostgreSQL / Vercel Postgres, added server-side SQL query & table initialization endpoints, implemented Vercel Serverless Function `/api/posts.ts` with `getData()` query, configured `DATABASE_URL` pooler in `.env`, and created interactive Relational Database & Posts explorer UI. |
| 2026-10-04 12:37 | AI Assistant | Vercel Blob Storage Integration | `server.ts`, `api/blob.ts`, `.env`, `.env.example`, `package.json`, `src/types/index.ts`, `src/components/BlobTab.tsx`, `src/components/Navbar.tsx`, `src/App.tsx`, `README.md` | Integrated `@vercel/blob` private file/asset storage, added server-side endpoints for `put`, `get` (with `Cache-Control: private, no-cache`), `list`, and `del`, configured `BLOB_READ_WRITE_TOKEN`, added Vercel Serverless Function `/api/blob.ts`, and built interactive Vercel Blob Manager UI with private stream preview. |
| 2026-10-04 12:10 | AI Assistant | Initial Setup & Infrastructure | `README.md`, `firebase-blueprint.json`, `firestore.rules`, `vercel.json`, `package.json`, `src/*` | Provisioned Firebase, generated ABAC security rules, deployed rules to Firestore, integrated Firebase Auth & Firestore Client SDK, created Vercel configuration & free-tier analytics, built developer dashboard UI. |

---

## 🗺️ Master Implementation Roadmap & Status Tracker

This tracking matrix serves as the single source of truth for current project progress and upcoming tasks. **All work must proceed strictly one step at a time with rigorous testing before proceeding to the next step.**

```
[COMPLETED] Phase 1: Multi-Cloud Foundation & Quad-Storage Engine
[COMPLETED] Phase 1.1: Clean Canvas Shell & Storage Architecture Inspector
[COMPLETED] Phase 1.2: Full-Screen Intro & 11-Animation RNG Suite (STAMPED)
[QUEUED]    Phase 2: Product Catalog & Currency Conversion Engine (Awaiting User Signal)
[QUEUED]    Phase 3: Velocity-Snapped Landing Scroll & Settings Drawer
[QUEUED]    Phase 4: Product 1 (2.4GHz) Step-by-Step Customisation Wizard
[QUEUED]    Phase 5: Bill Generation, Deterministic Order Code & Social Sharing
[QUEUED]    Phase 6: Admin Panel, Code Decoder, Price History & Urgency Queue
```

### Detailed Milestone Breakdown:

#### ✅ Phase 1: Multi-Cloud Foundation & Quad-Storage Engine (COMPLETED)
- [x] Firebase Firestore integration with Zero-Trust ABAC security rules (`firestore.rules`).
- [x] Firebase Authentication for administrators.
- [x] Neon Serverless PostgreSQL with PgBouncer connection pooling.
- [x] Supabase Database integration with PostgREST REST API & `@supabase/supabase-js`.
- [x] Vercel Blob (`@vercel/blob`) private streaming file and asset storage.
- [x] Quad-Redundancy Fallback Engine (`src/lib/resilientVault.ts` and `/api/vault/*`) with automatic rate-limit failover across all 4 providers.
- [x] Clean Canvas UI (`CleanHome.tsx`) with real-time failover verification tool.
- [x] Slide-over Architecture Inspector drawer (`SystemDrawer.tsx`).

---

#### ✅ Phase 1.2: Full-Screen Intro & 11-Animation RNG Suite (COMPLETED & STAMPED)
- [x] Full-screen 100vh Intro container with zero-distraction layout and dark palette.
- [x] Brand typography: "DoRaemon's Shop".
- [x] Integrated 11 modular React Bits animations with full TypeScript & Tailwind styling:
  - `<TechText />` (Canvas blueprint with dashed letter outlines, live coordinate labels, and draggable spring physics)
  - `<FoldText />` (3D origami cascade with dynamic crease shading and perspective)
  - `<ParticleText />` (Interactive starfield with cursor repulsion, bloom glow, and scatter-gather mechanics)
  - `<StrokeText />` (SVG outline stroke draw with fill wipe reveal)
  - `<Shuffle />` (Matrix character strip scramble with GSAP SplitText)
  - `<ScrambledText />` (Proximity-based character decoding on cursor hover)
  - `<TextType />` (Terminal typewriter loop with natural cadence and cursor blink)
  - `<RotatingText />` (Motion spring-staggered badge flips across product tags)
  - `<TextPressure />` (Variable font cursor proximity stretch on wght/wdth/ital axes)
  - `<DecryptedText />` (Sequential and center-out cybernetic cipher reveal)
  - `<BlurText />` (Motion blur keyframe stagger per letter)
  - `<SplitText />` (GSAP 3D perspective letter drop)
- [x] RNG Selection Engine: Automatically randomizes the active animation on every page load/refresh.
- [x] Quick-test RNG controller pill in the corner for seamless live review across all 11 animations.

---

#### ⏳ Phase 2: Product Catalog & Currency Conversion Engine (QUEUED — NEXT UP)
*Do not start until user gives the instruction to proceed.*
- [ ] Define catalog data structures (`src/data/products.ts`):
  - Product 1: 2.4GHz customisable hardware device.
  - Product 2: 5GHz device ("Coming Soon" non-orderable card).
- [ ] Implement Currency Service (`src/lib/currency.ts`):
  - Base currency: INR (`₹`).
  - Country-level geolocation / locale detection.
  - Live exchange rate converter with robust cached fallbacks.
  - Manual visitor currency override selector.
- [ ] Unit tests and verification.

---

#### ⏳ Phase 3: Velocity-Snapped Landing Experience & Settings Drawer (QUEUED)
- [ ] **Design References & Aesthetic Direction:**
  - **Unseen Studio (`unseen.co`):** Master benchmark for lightweight, ultra-smooth web animations that maintain 60fps on mobile and low-end devices.
  - **Linear (`linear.app`):** Sleek blur-in loading effect, crisp dark/light theme typography baseline, and subtle keyboard-first accessibility.
  - **Resend (`resend.com`):** Deliberate typography scale, tactile micro-interactions, subtle borders, and balanced contrast.
  - **Poppr:** Minor secondary reference for clean interactive states.
  - **Rejected Benchmark:** QuadAngles (explicitly rejected as overly heavy and laggy on mobile devices).
- [ ] **Mobile-First Performance Mandate:**
  - Every visual effect must run natively smooth on low-end phones. If an effect exhibits raymarching or canvas overhead, it must be simplified directly rather than relying on potato mode as a crutch.
- [ ] **Intentional Responsive Scaling:**
  - Individually tuned layout geometry across all breakpoints from compact mobile devices (320px) up to large desktop & TV viewports (4K), with deliberate container clamping rather than stretched UI.
- [ ] **Full-screen Intro & Velocity-Snapped Scroll:**
  - Exact 100vh viewport height.
  - Brand typography: "DoRaemon's Shop".
  - Velocity-based scroll snapping: measures scroll direction and velocity to smoothly animate past the intro (to products) or snap back (never resting halfway).
  - Products section: natural free scroll with upward velocity snap threshold returning to the intro.
- [ ] **Products Section:**
  - Product 1: 2.4GHz customisable hardware device card (navigates to step-by-step wizard).
  - Product 2: 5GHz device ("Coming Soon" non-orderable card, built to receive its wizard in the future).
- [ ] **Settings Drawer (`src/components/SettingsModal.tsx`):**
  - Theme switcher: Dark / Light (defaults to visitor's system preference; falls back to dark).
  - Currency override dropdown: manual currency selection overriding auto-detected locale currency.
  - Admin login trigger button: launches the admin authentication modal (no public links elsewhere).
  - **"Potato Device" Mode:** disables all animations, snap effects, canvas shaders, and heavy transitions for maximum performance on low-spec hardware. Off by default; persistent in `localStorage`.
  - **30-FPS Performance Monitor:** lightweight frame-rate tracker; triggers a friendly, non-blocking toast offering potato mode if average FPS drops below 30 for 10s (honors visitor dismissals and respects `prefers-reduced-motion` automatically).

---

#### ⏳ Phase 4: Product 1 (2.4GHz) Step-by-Step Customisation Wizard (QUEUED)
- [ ] Wizard Navigation Shell with step back-tracking and state preservation:
  - **Step 1: Firmware** — V1 (₹100) vs V2 (₹300).
  - **Step 2: Display** — No (₹0) vs Yes (+₹300).
  - **Step 3: Wireless Control** (V2 only) — No (₹0) vs Yes (+₹700). V1 shows disabled with an "Upgrade to V2" button (+₹900 total: ₹700 module + ₹200 firmware diff; wireless control charge is not doubled).
  - **Step 4: Number of Antennas** — V1 fixed at 2 (other counts disabled with +₹200 upgrade offer). V2 selectable 1 to 4 antennas (₹50 each).
  - **Step 5: Antenna Module Quality** (chosen per antenna) — Normal (₹200) vs Powerful (₹700).
  - **Step 6: Antenna Type** (chosen per antenna) — 0dbi (₹100, free if Normal module), 6dbi (₹150), 12dbi (₹450).
  - **Step 7: Bill Summary** — Full itemized breakdown + mandatory Core Module Kit (+₹700).
- [ ] Advisory Prompt System (short, friendly, non-blocking suggestions):
  - 1 antenna selected: recommends upgrading to 2+ antennas for optimal performance.
  - Normal module + 0dbi/6dbi: advises that extra range will not increase.
  - Normal module + 12dbi: friendly warning that 12dbi with Normal module is a waste of money (still selectable).
  - Powerful module + 0dbi: toast suggesting 6dbi/12dbi to utilize module power.
- [ ] Live reactive price calculator (INR reference + converted visitor currency).

---

#### ⏳ Phase 5: Bill Generation, Deterministic Order Code & Social Sharing (QUEUED)
- [ ] Bill Presentation:
  - Line-by-line itemization of options, quantities, unit prices.
  - Fixed line item: "Core module kit — ₹700" (contents omitted from customer view).
  - Shipping notice line: *"shipping charges may apply"*.
- [ ] Promo Code Engine:
  - Server-side validation with IP rate-limiting to prevent guessing.
  - Flat discount vs percentage discount.
  - Promo usage limits & condition checks (validity window, minimum order total).
- [ ] Deterministic Order Code Generator:
  - Format: `[customer-part]-[config-part]-[promo-part]` (one configuration per code).
  - Customer part derived from browser fingerprint + session token.
  - Config part deterministically hashed from product and chosen options.
  - Promo part encrypted/obfuscated (omitted if no promo applied, yielding 2 parts).
  - Copy-to-clipboard button with visual feedback.
- [ ] Direct Social Order Dispatch Buttons:
  - **WhatsApp:** `wa.me/919333652129?text=<prefilled-order-code>` (with confirmed +91 country code).
  - **Telegram:** `@speedabraker` / `9333652129` with prefilled draft text.
  - **Instagram:** `@speedabraker` direct profile/DM launch with automatic clipboard copy toast.

---

#### ⏳ Phase 6: Admin Panel, Code Decoder, Price History & Urgency Queue (QUEUED)
- [ ] Admin Authentication:
  - Firebase email/username + password login.
  - Server-side rate-limiting and brute-force lockout.
  - Server-side authorization check on every admin API endpoint.
- [ ] Catalog Controls:
  - Dynamic option price adjustments in INR with automatic versioned price history.
  - Stock toggles (In Stock / Out of Stock).
  - Promo code management (expiry dates, minimum order, product constraints, usage limits).
- [ ] Standalone Offline Order Code Decoder:
  - Input field to paste customer order codes.
  - Offline decoder resolves exact configuration, options, and historic pricing that were valid at creation time.
  - "Upload to Cloud" button: commits verified orders across all 4 storage providers (Firebase, Neon, Supabase, Vercel Blob). Generating code on the site stores nothing on the server until confirmed here.
- [ ] Order Fulfillment Queue:
  - Strict urgency sort order:
    1. **Paid** (sorted oldest-first for immediate fulfillment).
    2. **Pending**.
    3. **Shipped**.
    4. **Delivered**.
  - Search filter by customer name or order code (no status filters).
  - Order status switcher and custom administrative notes per order.

---

## 🔒 Storage Architecture Directive

> **CORE STORAGE INFRASTRUCTURE:**
> 
> 1. **Storage Components:**
>    - **Firebase Firestore:** Document database for admin state, product catalog, and secure ABAC rules.
>    - **Neon Serverless PostgreSQL:** Relational database engine dedicated to confirmed customer `orders`, line items, and price snapshots.
>    - **Vercel Blob:** Private encrypted streaming asset and file storage.
> 
> 2. **Security & Order Handling:**
>    - Secrets and API keys live strictly in environment variables (no secrets in app databases).
>    - Customer order codes generated client-side store nothing in the database until explicitly confirmed by the admin in Phase 5 / fulfillment workflow.

---

## 📖 Complete E-Commerce Site Specification ("DoRaemon's Shop")

_Living document. Built through Q&A, intended as a handoff to an AI or developer._

### 1. Overview
- An online store selling projects the owner makes.
- Products are small items.
- Each product has many customisable parts.
- Customisation happens in a step-by-step wizard before adding to cart.

### 1b. Homepage & Scroll Behaviour
- Homepage = intro section, then products section below.
- Intro is exactly one full screen tall (`100vh`).
- Intro uses **velocity-based scroll snapping**: the page measures scroll velocity/direction and then either animates fully past the intro (to the products section) or animates back to show the full intro. It never rests half-way on the intro.
- Snap behaviour applies to the intro only. The products section scrolls freely (normal scroll).
- Scrolling back up from the top of the products section should be able to snap back to the intro (same velocity logic in reverse).
- Each product in the products section is selectable; selecting one redirects to that product's wizard page.
- Intro content: brand name only (**"DoRaemon's Shop"** for now). Visual effects/animations will be defined later by the owner with an AI.
- Other pages: none. The site is: home (intro + products), one wizard page per product, settings panel, and the admin panel. No cart, checkout or accounts pages.

---

### 2. Products

#### Product 1: 2.4GHz Device (Name TBD)
- Customer configures the device via the wizard.
- All prices in INR. Wizard steps, in order:

**Step 1: Firmware**
- V1: ₹100
- V2: ₹300
- V2 is the upgraded version (uses a different/extra microcontroller). V1 limits some later options.

**Step 2: Display**
- No: ₹0
- Yes: +₹300

**Step 3: Wireless Control** (V2 only)
- No: ₹0
- Yes: +₹700
- If the customer chose V1: this option is NOT selectable (incompatible with V1). Show it disabled, with an "upgrade to V2" option as the way to unlock it. Upgrading to V2 to get wireless control costs ₹900 in total: ₹700 (microcontroller) + ₹200 (firmware difference V2 ₹300 vs V1 ₹100). Show ₹900 as the upgrade price; do not add the separate +₹700 wireless control charge on top of it.

**Step 4: Number of Antennas**
- V1: fixed at 2 antennas. Other counts are NOT selectable (shown disabled). The only way to get more is the upgrade-to-V2 option, priced as the firmware price difference (V2 ₹300 vs V1 ₹100 = +₹200).
- V2: 1 to 4 antennas, ₹50 each.

**Step 5: Antenna Module Quality** (chosen per antenna)
- Normal: ₹200
- Powerful: ₹700
- Any combination allowed, limited by the number of antennas chosen (e.g. 1 normal + 2 powerful with 3 antennas).

**Step 6: Antenna Type** (chosen per antenna)
- 0dbi: ₹100 (free if that antenna uses a Normal module)
- 6dbi: ₹150
- 12dbi: ₹450

**Step 7: Bill** (final step)

**Advisory Prompts (Suggestions only; these never block a choice):**
- 1 antenna selected: prompt to upgrade to 2 or more antennas (one antenna works but performs poorly).
- Normal module with 0dbi or 6dbi: warn that these don't give extra range.
- Normal module with 12dbi: say it is a waste of money. Still fully selectable.
- Powerful module with 0dbi: small toast suggesting to consider other antenna types, since they improve range.
- Antenna quality and type (steps 5 and 6) are fully compatible with each other, so they only get advice, never restrictions ("spending more is not always better").
- Only V1 has incompatibilities: wireless control and any antenna count other than 2 are NOT selectable. They are shown disabled, with an "upgrade to V2" option to unlock them. If the customer accepts, the firmware switches to V2 and the price updates.
- Wording of every message: short and friendly.
- Core module kit: ₹700. Required parts that cannot be skipped or edited, always included in every order. Shown as one line in the bill; its contents are not listed on the site.

#### Product 2: 5GHz Device (Name TBD)
- Status: **UPCOMING**. Options, steps and prices will be defined later by the owner.
- For now: show it as a product card marked **"Coming Soon"** (not orderable, no wizard yet). Build the product system so adding its wizard later is straightforward.

---

### 3. Customisation Wizard
- Step-by-step flow; one option group per step, in the order set per product.
- Final step: the bill shows:
  - A complete list of everything selected: each part with quantity and price.
  - The core module kit charge (₹700).
  - A promo code box; discount shown if applied.
  - Total price (in visitor's currency, with INR as reference).
  - A line: *"shipping charges may apply"*.
  - The order code with a copy button.
  - Quick order buttons: Instagram, Telegram, WhatsApp. These open the chat with the owner. WhatsApp pre-fills the order code as a drafted message (+919333652129).
  - Owner's contacts:
    - Instagram: `@speedabraker`
    - Telegram: `@speedabraker` (or phone `9333652129`)
    - WhatsApp: `+919333652129`
- Back button on every step; changing an earlier choice that makes a later one invalid (e.g. switching to V1) resets or adjusts later steps and shows the upgrade offer where relevant.

---

### 4. Pricing & Cart
- Prices are shown on the site. Every option has a fixed price.
- Live total updates as options change.
- No cart. The customer tweaks the configuration until satisfied, copies the generated code, and sends it to the owner to order.
- Base currency: INR. All prices stored and set in INR.
- Automatic country-level geolocation detects visitor's location and displays prices converted to local currency at current exchange rate (with robust local caching and fallback).

---

### 5. Accounts, Checkout & Payments
- No customer login or customer accounts.
- No payment processing on the site.
- **Order Code System:**
  - Format: `[customer part]-[configuration part]-[promo part]`.
  - Promo part (last): short obfuscated form of applied promo code (omitted if no promo applied, yielding 2 parts).
  - Customer part (first characters): derived from browser fingerprint + session token.
  - Configuration part (last characters): deterministic from product + selected options.
  - Purpose: code alone tells owner who ordered and what was ordered.
- Checkout is manual: customer sends code to owner on WhatsApp, Instagram, or Telegram; owner handles payment and fulfillment directly.

---

### 6. Shipping & Regions
- Owner builds and ships products manually.
- Shipping charges are NOT calculated or stored on the site. Owner decides charge in conversation.
- The bill summary displays: *"shipping charges may apply"*.
- Customer shipping address is collected outside the site during chat.

---

### 7. Admin Panel (Owner Side)
- Day-to-day operations:
  - Change the price of any item/option (in INR).
  - Mark any item/option as out of stock (and back in stock).
  - Add and remove promo codes.
- Promo Codes:
  - Two types: flat amount off, or percentage off.
  - Optional conditions: validity duration, minimum order price, required product.
  - Server-side validation with rate limiting to prevent guessing.
  - Optional usage limit per code.
- Admin Login:
  - Username + password authenticated via Firebase Authentication.
  - Brute-force rate limiting and lockout on login endpoint.
- Orders Section:
  - Owner pastes customer order codes.
  - Code decodes offline: product, options, promo applied, prices, and total.
  - "Upload to Cloud" button: saves confirmed orders across all 4 storage providers (Firebase, Neon, Supabase, Vercel Blob).
  - Status management: `pending`, `paid`, `shipped`, `delivered`.
  - Urgency sort: `paid` (oldest first) $\rightarrow$ `pending` $\rightarrow$ `shipped` $\rightarrow$ `delivered`.
  - Search by customer name or order code.

---

### 8. Design, Branding & Settings
- **Two Themes:** Dark and Light (follows visitor's system setting first; defaults to dark if undetectable).
- **Style:** Minimal, with fancy smooth animations and transitions.
- **Responsive Geometry:** Fully responsive and individually tuned for every size, from tiny mobile screens (320px) up to big TV screens (large-screen layouts designed intentionally with purposeful bounds, not simply stretched).
- **Design References (Owner's Curated Picks):**
  - **Main Inspiration:** **Unseen Studio (`unseen.co`)**. Benchmark for ultra-smooth interactive effects, lightweight rendering pipelines, and fluid 60fps performance even on low-end devices.
  - **Linear (`linear.app`):** The signature blur-in loading effect, crisp dark mode typography baseline, and subtle keyboard-first accessibility.
  - **Resend (`resend.com`):** Deliberate typography scale, text effects, subtle borders, and tactile micro-interactions.
  - **Poppr:** Secondary reference for modern interactive states.
  - **Explicitly Rejected:** **QuadAngles** (rejected for being excessively heavy and laggy on phones).
- **Mobile Performance Mandate:** Every effect must stay natively smooth on low-end phones. If an effect is heavy, simplify its shader/canvas math directly rather than relying on potato mode as a crutch.
- **Brand Name:** **"DoRaemon's Shop"** (temporary working name; modularized for easy change).
- **Color Accents & Typography:** Clean neutral placeholder palette until customized with AI.
- **Settings Section (`src/components/SettingsModal.tsx`):**
  - **Theme Option:** Dark / Light manual toggle.
  - **Admin Login Button:** Opens the admin authentication modal (no public links to admin panel elsewhere on the site).
  - **Currency Override:** Manual currency picker overriding auto-detected locale.
  - **"Potato Device" Mode:** Disables all animations, snap effects, transitions, canvas shaders, and heavy assets for a blazing-fast, lightweight experience. Off by default; persistent in `localStorage`.
  - **30-FPS Performance Monitor:** Lightweight `requestAnimationFrame` monitor; if average FPS drops below 30 for 10 consecutive seconds, shows a friendly non-blocking prompt offering potato mode. Honors dismissals and automatically disables animations if `prefers-reduced-motion` is enabled in the browser.

---

### 9. Tech Preferences & Redundancy Architecture
- **Quad-Storage Services:** Firebase Firestore, Neon PostgreSQL, Supabase PostgreSQL, Vercel Blob.
- **Firebase:** Administrator username/password authentication with rate-limiting and brute-force lockout.
- **Quad-Redundancy Replication:**
  - Whenever promo codes or sensitive data change (promo codes, dynamic prices, price history, stock, confirmed orders), updates are written across all four storage providers.
  - Reads attempt the primary provider first and automatically cascade through fallbacks if unavailable or rate-limited.
  - Shared normalized data schemas (JSON documents) ensuring seamless compatibility across SQL (Neon, Supabase) and non-SQL (Firestore, Vercel Blob) engines.
  - Optimistic concurrency with version numbers and timestamps so newest writes resolve conflicts.
  - Zero plain-text credentials: All secrets, connection strings, and service tokens reside strictly in server environment variables.
- **Public Input Security:**
  - Strict parameterization, schema validation, and sanitization across all public text fields.
  - Multi-tier IP and session rate-limiting, especially on promo code lookups.

---

### 10. Decided Architecture & Specifications
- **Price Changes vs Historical Codes (DECIDED):** An order code always decodes to the exact prices that were valid at the time the customer created it. The backend maintains an append-only versioned price history, and codes embed a deterministic timestamp/version identifier.
- **Admin Order Queue & Urgency Sort (DECIDED):**
  - Urgency sort order: **`Paid`** (oldest first for immediate fulfillment) $\rightarrow$ **`Pending`** $\rightarrow$ **`Shipped`** $\rightarrow$ **`Delivered`**.
  - Manual customer name assigned during owner confirmation.
  - Search filter by customer name or order code (no status filter dropdowns).
  - Standalone offline code decoder resolves products, options, and historic prices without requiring prior database records.
- **Promo Code Obfuscation:** Truncated cryptographic hash / reversible cipher matched against server-side promo table.
- **Customer Hardware/Device Identity:** Browser fingerprint combined with session token, presented with prominent copy-to-clipboard feedback.

---

### 11. Handoff Notes
- **Product 2 (5GHz Device):** Rendered as a "Coming Soon" card with modular architecture ready for its customisation wizard.
- **Single Configuration per Code:** Each generated order code represents exactly one custom device configuration.
- **Upgrade Pricing Arithmetic:** V1 $\rightarrow$ V2 wireless control upgrade (₹900) includes both the microcontroller upgrade (₹200) and wireless module (₹700) without double charging.
- **Direct Social Dispatch:**
  - **WhatsApp:** Pre-fills drafted order code via `wa.me/919333652129` (including mandatory `+91` country code).
  - **Telegram:** Pre-fills drafted order code to `@speedabraker` / `9333652129`.
  - **Instagram:** Direct link to `@speedabraker` profile/DM with automatic clipboard copy toast.

---

## 🚀 Vercel Free Tier Hosting & Configuration

### Features Configured Out of the Box:
- **`vercel.json` SPA Rewrites:** Direct URLs and browser refreshes are routed to `index.html` without 404s.
- **Enterprise Security Headers:** HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and strict `Referrer-Policy`.
- **Static Asset Caching:** 1-year immutable caching for all `/assets/*` bundles to minimize bandwidth.
- **Vercel Analytics Integration:** Zero-config Web Vitals and traffic analytics pre-wired using `@vercel/analytics`.
- **Global Edge Network:** Instant multi-region CDN distribution and SSL/TLS certificates.

### 🛠️ Environment Variables for Vercel Production:
When deploying to Vercel, configure these in **Project Settings > Environment Variables**:
- `DATABASE_URL`: Neon PostgreSQL connection pooler string
- `SUPABASE_URL`: `https://jbpznjbprhxxwlfnsksd.supabase.co`
- `SUPABASE_ANON_KEY`: Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token (`vercel_blob_rw_...`)
- `BLOB_STORE_ID`: Vercel Blob store identifier (from Vercel dashboard)
- `ADMIN_UID`: Firebase Auth UID of authorized administrator(s) (for admin-only routes)
- `FIREBASE_PROJECT_ID`: Firebase project identifier (`gen-lang-client-0174410808`)

---

## 🛡️ Security + Cleanup Master Pass ("DoRaemon's Shop")

> **Current Review & Progress Tracking (Work in Stages, ONE at a time):**

- [x] **STAGE 1 - Lock down the API (critical) [COMPLETED]**
  - Require a verified Firebase ID token (`Authorization: Bearer <token>`) on every route in `server.ts` and `api/*`. Return 401 otherwise.
  - Admin-only routes (blob upload/list/delete, db init/delete, all vault routes): also require `uid` to match an `ADMIN_UID` env var, else 403.
  - Delete or make admin-only: `/api/db/status`, `/api/blob/status`, `/api/system/health`, `/api/supabase/status`.
  - Removed the hardcoded Blob store ID from `server.ts` and `README.md`.
- [x] **STAGE 2 - Stop leaks and abuse [COMPLETED]**
  - Never return `err.message` to clients: logged all errors server-side and returned uniform, masked error payloads (`Internal server error`, `Failed to retrieve ...`).
  - Strict input validation: enforced lengths & types on all routes (`title` <= 150, `content` <= 10,000, `author` <= 100, `is_complete` boolean, `id` regex/size guards, secret payload limits).
  - Body parser limits: clamped global JSON/urlencoded parsing to 100kb; configured dedicated 5MB cap strictly for `/api/blob/upload`.
  - Blob hardening: sanitized pathnames (only `[a-z0-9/_.-]`, no `..`, no leading `/`), enforced `access: 'private'` unconditionally, allow-listed MIME types (`image/png`, `image/jpeg`, `image/webp`, `application/pdf`), and strictly rejected `text/html`, `image/svg+xml`, scripts, and unapproved types.
  - Rate limiting: configured `express-rate-limit` with general window (100 req/15min) on `/api` and mutation limiter (30 req/15min) on writes/uploads/admin routes.
- [x] **STAGE 3 - Fix Vercel deployment mismatch [COMPLETED]**
  - Unified API Handlers: built ONE consolidated Express app in `api/_app.ts` shared 100% by both local dev (`server.ts`) and Vercel serverless deployment (`api/[...path].ts`, `api/blob.ts`, `api/posts.ts`, `api/todos.ts`).
  - Rewrites & Routing: added `/api/(.*)` rewrite in `vercel.json` pointing to `/api/[...path]` with dual root/prefix support, resolving all 404s on `/api/db/*`, `/api/vault/*`, `/api/supabase/*`, `/api/blob/*`.
  - Zero Request Handler DDL: eradicated all runtime `CREATE TABLE IF NOT EXISTS` queries from request handlers and extracted schema definitions into a standalone one-time SQL migration file (`migrations/001_init.sql`).
- [x] **STAGE 4 - Secrets and keys [COMPLETED]**
  - Eradicated vault feature and all secrets from app databases: removed `/api/vault/*` endpoints, `saveVaultHandler`/`getVaultHandler`, secret validation rules, and schema definitions. Removed Firestore `/vault` collection and rules (deployed live).
  - Cleaned `src/lib/supabase.ts`: stripped all hardcoded fallback Supabase URLs and anon keys; reads strictly from environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and fails loudly with explicit runtime exceptions if missing.
  - Hardened service-role key: strictly server-side (`process.env.SUPABASE_SERVICE_ROLE_KEY`), never exposed with `VITE_*` to the client; updated backend Supabase client helpers to prefer `SUPABASE_ANON_KEY` + RLS where possible.
  - Row Level Security (RLS): generated `migrations/002_supabase_rls.sql` providing SQL that drops `vault_secrets` and enables Row Level Security on all Supabase tables (`todos`, `posts`) with explicit default-deny policies, service role bypass, and ownership enforcement.
- [x] **STAGE 5 - Headers [COMPLETED]**
  - `vercel.json`: added Content-Security-Policy (restricted to `'self'`, Firebase, Supabase, and Vercel Analytics), removed deprecated `X-XSS-Protection`, added `Strict-Transport-Security` (`max-age=63072000; includeSubDomains; preload`), set `Cross-Origin-Opener-Policy: same-origin-allow-popups` for Firebase Google Auth popups.
  - Verified and documented Google Cloud Console API key restriction & Firebase Auth authorized domain directives.
- [x] **STAGE 6 - Remove demo code from production [COMPLETED]**
  - Removed demo UI explorer tabs and artifacts: `BlobTab`, `DatabaseTab`, `SupabaseTab`, `VaultTab`, `VercelGuideTab`, `ChangelogTab`, `SystemDrawer`, `OverviewTab`, `AuthTab`, `CleanHome`, `Navbar`.
  - Pruned unused demo API routes: `/api/db/*`, `/api/supabase/*`, `/api/posts*`, `/api/todos*`, `/api/system/health`, `/api/blob/status`.
  - Deleted obsolete serverless route files: `api/posts.ts`, `api/todos.ts`.
  - Removed unused dependency: `@google/genai` uninstalled from `package.json`.
- [x] **STAGE 7 - Performance [COMPLETED]**
  - Lazy-loaded all 12 intro text components with dynamic `React.lazy` and wrapped them in `<Suspense>` with zero-layout-shift bounding fallback. Initial page load exclusively transfers the single active RNG text effect chunk.
- [x] **STAGE 8 - Rules for the upcoming shop (apply when building Phase 2) [COMPLETED]**
  - Prices, totals and wizard option costs are computed and validated server-side only (`api/_shopRules.ts`). Never trust client prices.
  - Wizard selections validated against a server-side allow-list and hardware compatibility constraints.
  - Orders get cryptographically secure server-generated IDs (`ORD-...`). Users can read only their own orders (RLS/ownership checks).
  - Enforced hosted payment provider policy: card data is rejected server-side and never accepted or stored.
  - Mounted `/api/shop/calculate-bill` endpoint for authoritative calculations.

---

## 🛠️ Tech Stack & Architecture Summary
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend Entry:** Express (`server.ts`) mounting Vite in development
- **Serverless Edge:** `/api/[...path].ts`, `/api/blob.ts`
- **Database 1:** Firebase Firestore (Zero-Trust ABAC in `asia-south1`)
- **Database 2:** Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **Database 3:** Supabase PostgreSQL (`@supabase/supabase-js`)
- **Storage Blob:** Vercel Blob (`@vercel/blob`)
- **Secrets Management:** Environment-only variables (Zero secrets in application databases)

