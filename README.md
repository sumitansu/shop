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
- [ ] Full-screen Intro section:
  - Exact 100vh viewport height.
  - Brand typography: "DoRaemon's Shop".
  - Velocity-based scroll snapping: measures scroll direction and velocity to smoothly animate past the intro or snap back (never resting halfway).
- [ ] Products Section:
  - Standard smooth natural scroll.
  - Reverse scroll-up snap threshold returning to Intro.
  - Product cards: Product 1 (clickable to wizard) and Product 2 ("Coming Soon" badge).
- [ ] Settings Drawer (`src/components/SettingsModal.tsx`):
  - Dark / Light theme toggle (defaults to system preference).
  - Currency override dropdown.
  - Admin login trigger button.
  - **"Potato Device" Mode:** completely removes animations, heavy canvas, and transitions for maximum performance.
  - **30-FPS Performance Monitor:** tracks average frame-rate; triggers a friendly prompt if FPS drops below 30 for 10s (honors visitor dismissals and respects `prefers-reduced-motion`).

---

#### ⏳ Phase 4: Product 1 (2.4GHz) Step-by-Step Customisation Wizard (QUEUED)
- [ ] Wizard Navigation Shell with step back-tracking and state preservation:
  - **Step 1: Firmware** — V1 (₹100) vs V2 (₹300).
  - **Step 2: Display** — No (₹0) vs Yes (+₹300).
  - **Step 3: Wireless Control** — V2 only (+₹700). V1 shows disabled with an "Upgrade to V2" button (+₹900 total: ₹700 module + ₹200 firmware diff).
  - **Step 4: Number of Antennas** — V1 fixed at 2 (other counts disabled with +₹200 upgrade offer). V2 selectable 1 to 4 antennas (₹50 each).
  - **Step 5: Antenna Module Quality** (per antenna) — Normal (₹200) vs Powerful (₹700).
  - **Step 6: Antenna Type** (per antenna) — 0dbi (₹100, free if Normal module), 6dbi (₹150), 12dbi (₹450).
  - **Step 7: Bill Summary** — Full itemized breakdown + mandatory Core Module Kit (+₹700).
- [ ] Advisory Prompt System (friendly, non-blocking guidance):
  - 1 antenna selected: recommends upgrading to 2+ antennas for optimal performance.
  - Normal module + 0dbi/6dbi: advises that extra range will not increase.
  - Normal module + 12dbi: friendly warning that it's a waste of money.
  - Powerful module + 0dbi: toast suggesting 6dbi/12dbi to utilize module power.
- [ ] Live reactive price calculator (INR reference + visitor currency).

---

#### ⏳ Phase 5: Bill Generation, Deterministic Order Code & Social Sharing (QUEUED)
- [ ] Bill Presentation:
  - Line-by-line itemization of options, quantities, unit prices.
  - Fixed line item: "Core module kit — ₹700".
  - Shipping notice line: *"shipping charges may apply"*.
- [ ] Promo Code Engine:
  - Server-side validation with IP rate-limiting to prevent brute-forcing.
  - Flat discount vs percentage discount.
- [ ] Deterministic Order Code Generator:
  - Format: `[customer-part]-[config-part]-[promo-part]`.
  - Customer part derived from browser fingerprint + session token.
  - Config part deterministically hashed from product and chosen options.
  - Promo part encrypted/obfuscated (omitted if no promo applied).
  - Copy-to-clipboard button with visual feedback.
- [ ] Direct Social Order Dispatch Buttons:
  - **WhatsApp:** `wa.me/919333652129?text=<prefilled-order-code>`
  - **Telegram:** `@speedabraker` / `9333652129` with prefilled draft text.
  - **Instagram:** `@speedabraker` profile launch with clipboard reminder.

---

#### ⏳ Phase 6: Admin Panel, Code Decoder, Price History & Urgency Queue (QUEUED)
- [ ] Admin Authentication:
  - Firebase email/username + password login.
  - Server-side rate-limiting and brute-force lockout.
- [ ] Catalog Controls:
  - Dynamic option price adjustments in INR with automatic versioned price history.
  - Stock toggles (In Stock / Out of Stock).
  - Promo code management (expiry dates, minimum order, product constraints, usage limits).
- [ ] Order Code Decoder Console:
  - Input field to paste customer order codes.
  - Offline decoder resolves exact configuration, options, and historic pricing at creation time.
  - "Upload to Cloud" button: commits verified orders across all 4 storage providers (Firebase, Neon, Supabase, Vercel Blob).
- [ ] Order Fulfillment Queue:
  - Strict urgency sort order:
    1. **Paid** (sorted oldest-first for immediate fulfillment).
    2. **Pending**.
    3. **Shipped**.
    4. **Delivered**.
  - Search filter by customer name or order code.
  - Order status switcher and custom administrative notes.

---

## 🔒 Mandatory Quad-Storage Redundancy & Resilient Fallback Directive

> **CRITICAL ARCHITECTURE REQUIREMENT FOR ANYONE WORKING ON THIS PROJECT:**
> 
> 1. **Quad-Storage Infrastructure (3 Databases + 1 Storage Blob):**
>    - **Database 1:** **Firebase Firestore** (Document DB with ABAC security rules & Google Auth)
>    - **Database 2:** **Neon Serverless PostgreSQL** (Relational SQL DB with PgBouncer pooling)
>    - **Database 3:** **Supabase Database** (PostgreSQL with PostgREST REST APIs & realtime)
>    - **Storage Blob:** **Vercel Blob** (`@vercel/blob` encrypted private streaming asset store)
> 
> 2. **Quad-Replication of Critical Data:**
>    - Any secret, important code file, token, credential, promo code, price history, or saved order **MUST be saved across ALL FOUR storage engines simultaneously**.
> 
> 3. **Automatic Failover & Limit Fallback Rule:**
>    - When retrieving any secret, order, or important asset, the application/server MUST attempt the primary provider first.
>    - If a provider is **out of limit, rate-limited, over quota, unavailable, or encounters an error**, the system **MUST automatically failover and call the next provider** in sequence until the request succeeds:
>      $$\text{Primary (Neon/Firestore)} \longrightarrow \text{Fallback 1 (Supabase)} \longrightarrow \text{Fallback 2 (Vercel Blob)} \longrightarrow \text{Fallback 3 (Firestore/Neon)}$$
>    - Zero disruption: The user or visitor must never receive a failure just because a single database is rate-limited.

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
- Themes: Dark and Light (defaults to visitor's system preference).
- Brand name: **"DoRaemon's Shop"**.
- Settings drawer:
  - Theme override (Dark / Light).
  - Manual currency override.
  - Admin login trigger.
  - **"Potato Device" Mode:** disables all animations, snap effects, transitions, and heavy assets for maximum performance.
  - **30-FPS Monitor:** tracks average frame-rate; offers potato mode prompt if FPS falls below 30 for 10 consecutive seconds. Remembers visitor's preference and honors `prefers-reduced-motion`.

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
- `BLOB_STORE_ID`: `store_Ai7bFlevUBpVJohX`

---

## 🛠️ Tech Stack & Architecture Summary
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend Entry:** Express (`server.ts`) mounting Vite in development
- **Serverless Edge:** `/api/posts.ts`, `/api/todos.ts`, `/api/blob.ts`
- **Database 1:** Firebase Firestore (Zero-Trust ABAC in `asia-south1`)
- **Database 2:** Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **Database 3:** Supabase PostgreSQL (`@supabase/supabase-js`)
- **Storage Blob:** Vercel Blob (`@vercel/blob`)
- **Failover Engine:** `resilientVault.ts` with cascading provider failover
