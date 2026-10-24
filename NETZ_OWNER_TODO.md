# NETZ — the owner's to-do list

Everything only the owner can do (accounts, keys, money, decisions), in one place, in the order to do it in
one sitting. The code for all of it is already built and stays switched off until these are done.
Claude adds every new owner task here as later steps are built. Last updated **2026-10-25** (Notes Studio assets: one migration, two decisions); before that **2026-10-21** (owner finished B, C, D (rupee plans), E and KYC; decisions in A answered).

Secrets (keys, passwords, `DATABASE_URL`) go only in `Netz/.env.local` and in Vercel, never in chat or a commit.
`.env.example` lists every variable name.

---

## A. Decisions (5 minutes, no accounts needed)

- [x] (2026-10-21) **Year badge**: free for everyone, bought in the shop for 1,500 gems during its year (no monthly medals needed).
- [x] (2026-10-21) **Robot's default name**: Bolt.
- [ ] **Gem amounts and shop prices** (plan 2.5) are a first guess: fine for launch, retune after a few weeks of use. (plan 8.4)
- [x] (2026-10-21) **LaTeX and code export**: built. Code export (Python, MATLAB, C++, JavaScript, Rust, Go) on all
      34 solver pages; LaTeX on solver pages, Notes and the Playground. Both Pro only.
- [x] (2026-10-21, approved as they are) **The 10 Pro tasks of 2026** (Profile → Pro card, or `PRO_TASKS` in `src/app/utils/progress/catalog.js`):
      happy with them? Each year after 2026 needs a new season (name, banner, skin) and 10 new tasks.
- [x] (2026-10-21) **Refunds**: none. Students cancel any time and keep Pro until the paid date. The Refund, Terms,
      Pricing and Profile pages say so. The one exception kept on the Refund page: a double or mistaken charge is refunded.
- [ ] **Handwriting models and selling NETZ** (new, 2026-10-21): NETZ is commercial, but the shipped text model was
      trained on IAM-OnDB and the maths model on MathWriting, and both datasets say non-commercial (MathWriting: CC BY-NC-SA 4.0
      in its paper). BRUSH is non-commercial too, so it is off the training plan. Options: ask the dataset owners for
      commercial permission, get legal advice, or retrain on handwriting collected in the app (the maths model is
      frozen, so that needs your say-so). Details in `PLAYGROUND_HANDOFF.md` section 7.

- [ ] **Assets library storage per student** (new, 2026-10-25): starting values are **50 MB free** and **1 GB Pro**
      (`FREE_ASSET_BYTES` / `PRO_ASSET_BYTES` in `src/app/(Primary.pages)/Notes/utils/assetCore.js`). Supabase's free plan
      has about 1 GB of file storage in total, so watch it (Supabase → Storage) and move to a paid plan or lower the
      numbers as students arrive.
- [ ] **Training data upload** (later, 2026-10-25): lines read in Writing mode are saved on the student's device only
      (Notes → Training data, Export JSONL). Sending them to NETZ needs a consent question and a line in `/Privacy` first.

## B. Your details on the legal pages (5 minutes)

Razorpay reads these pages before it switches payments on, so they must be real.

- [x] (2026-10-21, filled in by Claude from the owner's details) Fill in `src/app/components/landing/legalDetails.js`: `owner` (your name or business name), `email`,
      `address` (city, state, PIN), `jurisdiction` (your city and state for disputes). Empty fields are simply left off.
- [ ] Read `/Terms`, `/Refund`, `/Privacy`, `/Contact` once. They are plain-language drafts, not legal advice;
      have a lawyer look if you can.

## C. Supabase + Google sign-in (about 30 minutes, free)

1. [x] supabase.com → New project, region **Mumbai (ap-south-1)**, free plan. Save the database password somewhere safe.
2. [x] (done by Claude on 2026-10-20, all 9 tables with row-level security) Supabase → SQL editor → run **all four** files in `supabase/migrations/`, one after another in name order:
   - [x] `20261019000000_progress.sql`
   - [x] `20261020000000_notes.sql`
   - [x] `20261021000000_public_notes.sql`
   - [x] `20261022000000_billing.sql`
   - [ ] (new, 2026-10-25) `20261024000000_note_assets.sql`: the Notes Studio Assets library in your account. It makes the
         `note_assets` table and a private Storage bucket `note-assets` (25 MB per file) with rules so each student
         reaches only their own folder. Until it is run, the library works on each device but is not copied to accounts.
3. [x] (2026-10-21) Google Cloud Console → APIs & Services → OAuth consent screen (app name NETZ, your email) → Credentials →
   Create OAuth client ID (Web application). Authorised redirect URI: the callback URL Supabase shows under
   Authentication → Providers → Google. Paste the client ID and secret back into Supabase and enable Google.
4. [x] (2026-10-21) Supabase → Authentication → URL configuration: Site URL = the live site; Redirect URLs =
   `http://localhost:3210/auth/callback` and `https://<live site>/auth/callback`.
5. [x] Copy `.env.example` to `Netz/.env.local` and fill in: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL` (the **Transaction pooler** string, port 6543).

## D. Razorpay in test mode (about 30 minutes, free)

1. [x] Razorpay dashboard → switch to **Test mode** → Account & Settings → API Keys → generate.
   Put `NEXT_PUBLIC_RAZORPAY_KEY_ID` (rzp_test_…) and `RAZORPAY_KEY_SECRET` in `.env.local`.
2. [x] (2026-10-21) Subscriptions → Plans → create 4 plans with exactly these prices, and paste each plan id into `.env.local`:
   - [x] ₹199 every 1 month → `RAZORPAY_PLAN_MONTHLY_INR`
   - [x] ₹1,499 every 1 year → `RAZORPAY_PLAN_YEARLY_INR` (**redo**: the first one was made with "every 1 month")
   - [ ] $2.99 every 1 month → `RAZORPAY_PLAN_MONTHLY_USD` (Razorpay refuses USD until international payments are on)
   - [ ] $19.99 every 1 year → `RAZORPAY_PLAN_YEARLY_USD`
   - Until the two USD plans exist, Pricing shows rupees only. After making them, set `NEXT_PUBLIC_USD_PAYMENTS=on`
     in `.env.local` and Vercel and redeploy; that brings back the ₹ / $ switch.
3. [x] (2026-10-21) Webhooks → Add: URL `https://<live site>/api/billing/webhook`, a secret you make up
   (→ `RAZORPAY_WEBHOOK_SECRET`), and tick these 8 events: `subscription.activated`, `subscription.charged`,
   `subscription.pending`, `subscription.halted`, `subscription.cancelled`, `subscription.completed`,
   `order.paid`, `refund.processed`.
   For a test on your own computer first, a tunnel gives the dev server a public URL:
   `cloudflared tunnel --url http://localhost:3210`.

## E. Vercel and GitHub (10 minutes)

- [x] (2026-10-21) Vercel → Project → Settings → Environment Variables: add **every** variable from your `.env.local`
      (Supabase 3 + Razorpay 7). Redeploy.
- [x] (2026-10-21) GitHub repo → Settings → Secrets and variables → Actions → New secret `NETZ_SITE_URL` = the live site,
      no trailing slash (the daily job that keeps the free database awake).
- [x] (2026-10-21) GitHub → Actions → "Keep database awake" → Run workflow once, and check it goes green.

## F. Try it yourself (15 minutes)

- [ ] Sign in with Google on a laptop and on a phone; Profile shows "saved to your account".
- [ ] Publish a note and open its link in a private window.
- [ ] Pricing → buy **monthly** with Razorpay's test card or test UPI → the page says "Pro is on".
      Then try yearly and lifetime, **Cancel renewal on Profile** (Pro should stay until the paid date), and a
      refund from the Razorpay dashboard (Pro should end).
- [ ] Tell Claude what happened; Claude runs the full check list (plan section 7) afterwards.

## G. Before taking real money (takes days; Razorpay and the bank are slow)

- [x] (2026-10-21, done with PAN, no GST) Razorpay **KYC**: your or the business's details, PAN, bank account. Business website = the live site
      (it checks Terms, Refund, Contact, Privacy and Pricing).
- [ ] (No GST number yet; KYC went through on PAN.) Ask an accountant about **GST**: whether registration is needed for the expected income, and for payments
      from abroad (export of services).
- [ ] After KYC: switch to **Live mode** and repeat D1–D3 (new keys, 4 new plans, new webhook), then swap the values
      in Vercel and redeploy.
- [ ] Turn on **international payments** in Razorpay (needed for the USD prices).

## H. Ads: a new AdSense account from scratch (redone 2026-10-22)

The old AdSense account is no longer used: its id is gone from the code and `public/ads.txt` is deleted.
NETZ now reads the account from settings, so **no ads, no ad script and no AdSense tag load until you set
`NEXT_PUBLIC_ADSENSE_CLIENT`**. The steps, in order:

1. [ ] **Sign up**: adsense.google.com with the Google account you want paid through. Site = the live
   address (`netz-ruby.vercel.app`, or your own domain if you buy one first: AdSense approves one site
   address, and a custom domain usually gets approved more easily than a `vercel.app` one).
   Country India, your name and address exactly as on your PAN/bank (it must match for payment).
2. [ ] **Copy your publisher id**: AdSense → Account → Account information → "Publisher ID"
   (`pub-` and 16 digits). Put it in `.env.local` and Vercel as
   `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX`, then redeploy.
   That one setting switches on everything Google checks:
   - the `google-adsense-account` tag in every page's head,
   - the AdSense script (only on pages where ads are allowed, never for Pro),
   - `https://<live site>/ads.txt` with your line `google.com, pub-…, DIRECT, f08c47fec0942fa0`.
3. [ ] **Connect the site**: AdSense → Sites → Add site → choose **"Meta tag"** (already on the pages after
   step 2) → Verify → **Request review**. Review usually takes a few days, sometimes 2–4 weeks.
   Google looks for real content and the Terms, Privacy, Contact and Refund pages (all filled in).
4. [ ] **ads.txt**: AdSense → Sites shows "ads.txt status". Open `https://<live site>/ads.txt` and check it
   shows your pub id. "Not found" for a day or two after adding the site is normal.
5. [ ] **Privacy & messaging** → turn on the free **consent message for Europe/UK** (GDPR). Required for
   visitors there.
6. [ ] **After approval, make the ad units**: Ads → By ad unit → **Display ads**, responsive, one per place.
   Copy each unit's number (`data-ad-slot="…"`) into `.env.local` and Vercel:
   - `NEXT_PUBLIC_ADSENSE_SLOT_LANDING` (landing page; also used by any place you leave empty)
   - `NEXT_PUBLIC_ADSENSE_SLOT_ALGORITHM`, `_HUB`, `_NOTES`, `_PROFILE` (optional, for separate reports)
   Redeploy. Until the landing unit is set, the ad boxes stay hidden, so nothing empty shows.
7. [ ] **Auto ads**: Ads → By site → turn Auto ads **off** (NETZ places its own ads), or at least turn off
   vignette and anchor ads and exclude `/Playground`, `/Pricing` and `/p/`.
8. [ ] **Payments**: AdSense → Payments → add your bank account. Google sends a PIN by post at ₹1,000 of
   earnings (enter it), and pays out each month once you pass the threshold. A tax form for India may be asked.
9. [ ] **Later, optional: Google Ad Manager** (the 15-minute full-screen ad and "watch an ad, get gems").
   Needs an approved AdSense account first. Make a Web interstitial unit → `NEXT_PUBLIC_GAM_INTERSTITIAL_UNIT`,
   a Rewarded unit → `NEXT_PUBLIC_GAM_REWARDED_UNIT`, and put the ads.txt line Ad Manager gives you in
   `NEXT_PUBLIC_ADS_TXT_EXTRA`. Without these, those two ad types simply stay off.
- Note: Google cannot confirm a watched rewarded ad to our server on the web, so the cap (3 a day, 30 gems)
  is what limits abuse. Fine for gems; never use rewarded ads for anything worth money.
- Rules to keep the account safe: never click your own ads, don't ask friends to, and don't put ads on
  pages with no content. Invalid clicks are the most common reason accounts get closed.

## Last: change the secrets that were shared in chat (2026-10-20)

- [ ] Supabase → Project Settings → Database → **Reset database password** (pick one without `@`), then update
      `DATABASE_URL` in `.env.local` and Vercel.
- [ ] Razorpay (Test mode) → API Keys → **Regenerate** the key secret, and in Webhooks set a **new secret**; update
      `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` in `.env.local` and Vercel.

## I. Saving the work

- [ ] Commit everything to `main` yourself when you are happy (Claude does not commit or push).

---

### Done already

_(Tick items move here with the date, so the list above only shows what is left.)_
