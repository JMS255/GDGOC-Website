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

## How membership actually works here

**Applying and signing in are two separate steps, in a specific order.**
Signing in with Google does NOT by itself get you an account — you have to
apply first.

1. Anyone applies at `/apply` (no login required) — name, email, student ID,
   course, year, contact number, interests. Creates an `applications` doc
   with `status: "new"`.
2. Department Heads review applications relevant to their department
   (`/admin/applications` — filtered by whether the applicant's `interests`
   array includes that head's `department`; Chief Exec/System Admin see all),
   add interview notes/a rating, and Approve or Reject.
3. Only once approved does the applicant's *first Google sign-in* actually
   create an account. `POST /api/auth/session` looks up an `applications` doc
   matching the signed-in email with `status: "approved"` — if none exists,
   the sign-in is rejected outright (and the just-created Firebase Auth user
   is deleted) with a message pointing them to `/apply`. If a match exists,
   the account is created directly as `membershipStatus: "active"` (no
   separate pending step — the interview already happened at the application
   stage), `memberProfiles` is populated from the application data, and the
   application is marked `status: "converted"`.

This means `membershipStatus: "pending"` on a `users` doc can no longer
actually occur through normal sign-up — the type still allows it (existing
`/pending` page still serves member accounts that later go `expired`/
`rejected`, e.g. a lapsed renewal), but new applicants are gated at the
`applications` stage, before any account exists.

- `POST /api/auth/session` is also the **only place the `@adzu.edu.ph` domain
  restriction is enforced** — re-verifies the token server-side and rejects
  (and deletes) any account outside the allowed domain; the client-side
  Google picker's domain hint is cosmetic only.
- Every protected page checks auth/role itself via `src/lib/dal.ts`
  (`requireActiveMember()`, `requireRole()`) rather than in a shared layout —
  Next.js's own docs warn that layout-level checks don't re-run on
  client-side navigations, so each page/Server Action re-verifies.

## What's built so far (MVP skeleton)

- Public: landing, about, events listing, privacy policy
- Auth: Google sign-in restricted to the university domain, session cookies
- Membership: public application (`/apply`, no login) → department-routed
  interview review (`/admin/applications`) → approval gates first sign-in,
  which creates an already-active account (see "How membership actually
  works" above)
- RBAC: `chief_exec`, `system_admin`, `department_head`, `committee`, `member`
  roles, enforced in Firestore rules + `src/lib/dal.ts`
- Events: admin create/publish/cancel (`/admin/events`), member RSVP on the
  public events page, manual check-in toggle (`/admin/events/[id]/checkin`)
- Payment proof: member uploads a GCash screenshot to upgrade to paid tier
  (`/membership`), admin approves/rejects (`/admin/payments`)
- Renewal per term: admin creates/activates a term (`/admin/terms`); members
  see a renewal prompt on `/membership` — one-click for free tier, payment
  proof for paid tier, tracked in `membershipRenewals`
- Membership lookup (`/lookup`): read-only name/email search for Committee
  and above — for verifying membership (e.g. at an event door) without full
  admin dashboard access
- Responsibilities + performance reviews (`/admin/members/[uid]`): dept heads
  assign a small number of specific responsibilities per member (done/missed,
  not exhaustive tracking) and submit one rating+note review per member per
  term; members see their own open responsibilities and latest review on
  `/dashboard`. Deliberately no rank/position ladder on top of this (deferred
  per the org's decision to keep structure simple — the review/responsibility
  data doesn't preclude adding recognition features later if that changes)
- Analytics (`/admin/analytics`): membership funnel by status/tier, course and
  year-level demographics, acquisition channel breakdown, event attendance
  rate — all aggregated in-memory (fine at ~100 members, no need for a real
  aggregation pipeline yet)
- Merch storefront (`/merch`): guest checkout, no account required — GCash
  proof upload, pre-order model (no stock tracking), admin review
  (`/admin/merch`). Guest orders are written exclusively through a server
  action (Firestore rules block direct client writes to `merchOrders`
  entirely), since there's no auth to scope a client-side rule against
- Admin quick-links on `/dashboard` for Department Head+ (all admin pages)
  and Committee+ (membership lookup)

## What's not built yet
Nothing from the original roadmap remains — see the deferred items above
(position ladder, org infrastructure) for what's intentionally on hold.
