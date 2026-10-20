# NETZ — the owner's to-do list

Everything only the owner can do (accounts, keys, money, decisions), in one place, in the order to do it in
one sitting. The code for all of it is already built and stays switched off until these are done.
Claude adds every new owner task here as later steps are built. Last updated **2026-10-20** (after Pro features).

Secrets (keys, passwords, `DATABASE_URL`) go only in `Netz/.env.local` and in Vercel, never in chat or a commit.
`.env.example` lists every variable name.

---

## A. Decisions (5 minutes, no accounts needed)

- [ ] **Free year badge**: keep it for everyone (6 monthly medals in a year), or make yearly medals Pro-only? (plan 8.2)
- [ ] **Robot's default name** before the student names it. (plan 8.3)
- [ ] **Gem amounts and shop prices** (plan 2.5) are a first guess: fine for launch, retune after a few weeks of use. (plan 8.4)
- [ ] **LaTeX and code export** are listed for Pro on the Pricing page but do not exist yet. Either Claude builds
      them, or they come off the Pricing page until they do.
- [ ] **The 10 Pro tasks of 2026** (Profile → Pro card, or `PRO_TASKS` in `src/app/utils/progress/catalog.js`):
      happy with them? Each year after 2026 needs a new season (name, banner, skin) and 10 new tasks.
- [ ] **Refunding a monthly or yearly plan**: either you also cancel the subscription in the Razorpay dashboard each time,
      or Claude makes the webhook cancel it automatically after a full refund. Pick one.

## B. Your details on the legal pages (5 minutes)

Razorpay reads these pages before it switches payments on, so they must be real.

- [ ] Fill in `src/app/components/landing/legalDetails.js`: `owner` (your name or business name), `email`,
      `address` (city, state, PIN), `jurisdiction` (your city and state for disputes). Empty fields are simply left off.
- [ ] Read `/Terms`, `/Refund`, `/Privacy`, `/Contact` once. They are plain-language drafts, not legal advice;
      have a lawyer look if you can.

## C. Supabase + Google sign-in (about 30 minutes, free)

1. [ ] supabase.com → New project, region **Mumbai (ap-south-1)**, free plan. Save the database password somewhere safe.
2. [ ] Supabase → SQL editor → run **all four** files in `supabase/migrations/`, one after another in name order:
   - [ ] `20261019000000_progress.sql`
   - [ ] `20261020000000_notes.sql`
   - [ ] `20261021000000_public_notes.sql`
   - [ ] `20261022000000_billing.sql`
3. [ ] Google Cloud Console → APIs & Services → OAuth consent screen (app name NETZ, your email) → Credentials →
   Create OAuth client ID (Web application). Authorised redirect URI: the callback URL Supabase shows under
   Authentication → Providers → Google. Paste the client ID and secret back into Supabase and enable Google.
4. [ ] Supabase → Authentication → URL configuration: Site URL = the live site; Redirect URLs =
   `http://localhost:3210/auth/callback` and `https://<live site>/auth/callback`.
5. [ ] Copy `.env.example` to `Netz/.env.local` and fill in: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL` (the **Transaction pooler** string, port 6543).

## D. Razorpay in test mode (about 30 minutes, free)

1. [ ] Razorpay dashboard → switch to **Test mode** → Account & Settings → API Keys → generate.
   Put `NEXT_PUBLIC_RAZORPAY_KEY_ID` (rzp_test_…) and `RAZORPAY_KEY_SECRET` in `.env.local`.
2. [ ] Subscriptions → Plans → create 4 plans with exactly these prices, and paste each plan id into `.env.local`:
   - [ ] ₹199 every 1 month → `RAZORPAY_PLAN_MONTHLY_INR`
   - [ ] ₹1,499 every 1 year → `RAZORPAY_PLAN_YEARLY_INR`
   - [ ] $2.99 every 1 month → `RAZORPAY_PLAN_MONTHLY_USD`
   - [ ] $19.99 every 1 year → `RAZORPAY_PLAN_YEARLY_USD`
3. [ ] Webhooks → Add: URL `https://<live site>/api/billing/webhook`, a secret you make up
   (→ `RAZORPAY_WEBHOOK_SECRET`), and tick these 8 events: `subscription.activated`, `subscription.charged`,
   `subscription.pending`, `subscription.halted`, `subscription.cancelled`, `subscription.completed`,
   `order.paid`, `refund.processed`.
   For a test on your own computer first, a tunnel gives the dev server a public URL:
   `cloudflared tunnel --url http://localhost:3210`.

## E. Vercel and GitHub (10 minutes)

- [ ] Vercel → Project → Settings → Environment Variables: add **every** variable from your `.env.local`
      (Supabase 3 + Razorpay 7). Redeploy.
- [ ] GitHub repo → Settings → Secrets and variables → Actions → New secret `NETZ_SITE_URL` = the live site,
      no trailing slash (the daily job that keeps the free database awake).
- [ ] GitHub → Actions → "Keep database awake" → Run workflow once, and check it goes green.

## F. Try it yourself (15 minutes)

- [ ] Sign in with Google on a laptop and on a phone; Profile shows "saved to your account".
- [ ] Publish a note and open its link in a private window.
- [ ] Pricing → buy **monthly** with Razorpay's test card or test UPI → the page says "Pro is on".
      Then try yearly and lifetime, **Cancel renewal on Profile** (Pro should stay until the paid date), and a
      refund from the Razorpay dashboard (Pro should end).
- [ ] Tell Claude what happened; Claude runs the full check list (plan section 7) afterwards.

## G. Before taking real money (takes days; Razorpay and the bank are slow)

- [ ] Razorpay **KYC**: your or the business's details, PAN, bank account. Business website = the live site
      (it checks Terms, Refund, Contact, Privacy and Pricing).
- [ ] Ask an accountant about **GST**: whether registration is needed for the expected income, and for payments
      from abroad (export of services).
- [ ] After KYC: switch to **Live mode** and repeat D1–D3 (new keys, 4 new plans, new webhook), then swap the values
      in Vercel and redeploy.
- [ ] Turn on **international payments** in Razorpay (needed for the USD prices).

## H. Ads (built 2026-10-20; all off until these are set)

- [ ] AdSense → Privacy & messaging → turn on the free **consent message** for Europe/UK visitors.
- [ ] AdSense → Sites: check the site is approved and `https://<live site>/ads.txt` shows
      `google.com, pub-3746721364737268, DIRECT, f08c47fec0942fa0` (Claude added `public/ads.txt`; check the
      publisher id matches your account).
- [ ] AdSense → Ads → By ad unit → make 4 **display** units (responsive) and put their ids in `.env.local` and Vercel:
      `NEXT_PUBLIC_ADSENSE_SLOT_ALGORITHM`, `_HUB`, `_NOTES`, `_PROFILE`. (Until then they all use the landing unit.)
- [ ] AdSense → Ads → By site → **Auto ads**: turn **off** vignette and anchor ads, or at least exclude `/Playground`,
      `/Pricing` and `/p/` pages. NETZ's own 15-minute ad replaces vignettes, so the two never double up.
- [ ] **Google Ad Manager**: create an account, link it to AdSense, check NETZ is eligible, then make two ad units:
  - [ ] a **Web interstitial** unit → its path (e.g. `/1234567/netz_interstitial`) in `NEXT_PUBLIC_GAM_INTERSTITIAL_UNIT`
  - [ ] a **Rewarded** unit → its path in `NEXT_PUBLIC_GAM_REWARDED_UNIT`
- [ ] Add the Ad Manager line Google gives you to `public/ads.txt` too (tell Claude, or add it yourself).
- [ ] Note: Google cannot confirm a watched rewarded ad to our server on the web, so the cap (3 a day, 30 gems)
      is what limits abuse. Fine for gems; never use rewarded ads for anything worth money.

## I. Saving the work

- [ ] Commit everything to `main` yourself when you are happy (Claude does not commit or push).

---

### Done already

_(Tick items move here with the date, so the list above only shows what is left.)_
