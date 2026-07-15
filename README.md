# GDGoC Website

Membership management + events site for GDGoC. Next.js (App Router) + Firebase
(Firestore/Auth/Storage), deployed on Vercel.

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind
- Firebase Auth (Google Sign-In, restricted to a single email domain)
- Firestore (data), Firebase Storage (payment-proof images)
- Hosting: Vercel (Firebase is used only for Firestore/Auth/Storage — not
  Firebase Hosting — to avoid needing the Blaze billing plan)

## First-time setup

### 1. Create the Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) and create a new project.
2. Enable **Authentication → Sign-in method → Google**.
3. Enable **Firestore Database** (production mode).
4. Enable **Storage**.
5. Deploy the security rules already in this repo:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add   # select your project
   firebase deploy --only firestore:rules,firestore:indexes,storage:rules
   ```

### 2. Get client config

Project settings → General → Your apps → Web app → copy the config values into `.env.local` (copy from `.env.local.example`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=adzu.edu.ph
```

### 3. Get Admin SDK credentials (server-only, never commit these)

Project settings → Service accounts → **Generate new private key** — downloads a JSON file. From it, fill in:

```
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

(Keep the `\n` characters literal — the app converts them to real newlines at runtime.)

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** pages that read Firestore (`/dashboard`, `/events`, `/admin/*`) will
> error without valid Firebase Admin credentials in `.env.local` — this is
> expected until step 3 above is done.

## How auth works here

- Login (`/login`) uses Firebase's client SDK for Google Sign-In, then POSTs
  the ID token to `POST /api/auth/session`.
- That route is the **only place the `@adzu.edu.ph` domain restriction is
  actually enforced** — it re-verifies the token server-side and rejects (and
  deletes) any account outside the allowed domain. The client-side Google
  picker's domain hint is cosmetic only and must never be trusted alone.
- On first sign-in, a `users/{uid}` Firestore doc is created with
  `membershipStatus: "pending"`.
- Every protected page checks auth/role itself via `src/lib/dal.ts`
  (`requireActiveMember()`, `requireRole()`) rather than in a shared layout —
  Next.js's own docs warn that layout-level checks don't re-run on
  client-side navigations, so each page/Server Action re-verifies.

## What's built so far (MVP skeleton)

- Public: landing, about, events listing, privacy policy
- Auth: Google sign-in restricted to the university domain, session cookies
- Membership: signup → pending → admin approval flow (`/admin/members`)
- RBAC: `chief_exec`, `system_admin`, `department_head`, `committee`, `member`
  roles, enforced in Firestore rules + `src/lib/dal.ts`

## What's not built yet (see the original plan for the full roadmap)

- Event RSVP + manual check-in
- Payment-proof upload/review for the paid tier
- Renewal flow per term
- Responsibilities/performance-review accountability system
- Department position ladder (Member → Staff → Secretary → Subhead → Head)
- Analytics dashboard
