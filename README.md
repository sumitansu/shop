# ⚠️ MANDATORY CONTRIBUTOR DIRECTIVE: CHANGE REPORTING LOG

> **CRITICAL RULE FOR ALL DEVELOPERS & AI AGENTS:**  
> Anyone working on this codebase or modifying any page, component, or configuration **MUST IMMEDIATELY REPORT AND LOG ALL CHANGES AT THE TOP OF THIS README**.  
> This applies unconditionally to human contributors and AI assistants. Every modification, addition, deletion, architectural update, or configuration change must be recorded in the [Change Log](#-project-change-log) below before finishing any turn or commit.

---

## 📋 Project Change Log

| Date & Time (UTC) | Author | Scope / Task | Files Modified / Added | Summary of Changes |
| :--- | :--- | :--- | :--- | :--- |
| 2026-10-04 12:10 | AI Assistant | Initial Setup & Infrastructure | `README.md`, `firebase-blueprint.json`, `firestore.rules`, `vercel.json`, `package.json`, `src/*` | Provisioned Firebase, generated ABAC security rules, deployed rules to Firestore, integrated Firebase Auth & Firestore Client SDK, created Vercel configuration & free-tier analytics, built developer dashboard UI. |

---

## 🔒 Security & Data Architecture (MANDATORY GUIDELINE)

1. **Zero Public Exposure for Sensitive Data:**
   - **ANY data that cannot or should not be displayed publicly on the website MUST be stored strictly in Firebase Firestore.**
   - Never embed sensitive credentials, private user payloads, internal API tokens, or confidential data in the client-side bundle or public components.
   - All private data collections in Firestore (e.g. `/vault/{vaultId}`) enforce strict **Attribute-Based Access Control (ABAC)** and **Zero-Trust**: reads, updates, and deletes are restricted strictly to the verified owner (`request.auth.uid == resource.data.ownerId`), completely preventing unauthorized reads or data leaks.

2. **Firebase Authentication Architecture:**
   - Firebase is provisioned not only for data persistence, but crucially for **Firebase Authentication** (Google Sign-In popup flow, user session management, and auth tokens).
   - Any future authentication features, user roles, or protected routes must interface directly with Firebase Auth (`getAuth()`).
   - Every developer working on this project must uphold this architecture and update this documentation whenever auth flows are expanded.

---

## 🚀 Vercel Free Tier Hosting & Configuration

This project is optimized for deployment on the **Vercel Hobby (Free Tier)**.

### Features Configured Out of the Box:
- **`vercel.json` SPA Rewrites:** Direct URLs and browser refreshes are routed to `index.html` without 404s.
- **Enterprise Security Headers:** HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and strict `Referrer-Policy`.
- **Static Asset Caching:** 1-year immutable caching for all `/assets/*` bundles to minimize bandwidth.
- **Vercel Analytics Integration:** Zero-config Web Vitals and traffic analytics pre-wired using `@vercel/analytics`.
- **Global Edge Network:** Instant multi-region CDN distribution and SSL/TLS certificates.

### 🛠️ What YOU Need to Do on Your Side (Step-by-Step for Vercel):
To host this project on Vercel from your GitHub repository:

1. **Push Code to GitHub:**
   - Push this repository to your GitHub account (`main` or `master` branch).
2. **Import into Vercel:**
   - Go to [vercel.com](https://vercel.com) and log in with your GitHub account (Free Hobby plan).
   - Click **"Add New..."** > **"Project"**.
   - Select your GitHub repository from the list and click **"Import"**.
3. **Configure Project Settings (Auto-detected):**
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. **Environment Variables (Optional / If needed):**
   - The Firebase configuration is embedded via `firebase-applet-config.json` (Firebase client API keys are public by design and secured via Firestore Security Rules and Firebase Console domain allowlisting).
   - If using custom backend APIs or AI keys, add them under **Project Settings > Environment Variables** in Vercel.
5. **Add Vercel Domain to Firebase Auth Authorized Domains:**
   - In the [Firebase Console](https://console.firebase.google.com/project/gen-lang-client-0174410808/authentication/settings), navigate to **Authentication > Settings > Authorized Domains**.
   - Add your Vercel deployment URL (e.g. `your-project.vercel.app`) so Google Sign-In popups work seamlessly on production.
6. **Enable Analytics in Vercel Dashboard:**
   - In your Vercel Project Dashboard, navigate to the **Analytics** tab and click **"Enable"** (included free on the Hobby tier).

---

## 🛠️ Tech Stack & Dependencies
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Backend / Database:** Firebase Firestore (Enterprise Instance)
- **Auth:** Firebase Authentication (Google OAuth Popup)
- **Hosting:** Vercel (Hobby Free Tier)
- **Icons & Motion:** Lucide React, Motion
