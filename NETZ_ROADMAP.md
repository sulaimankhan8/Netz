# NETZ — Roadmap: From Today to Launch and Growth

> **Written**: 2026-11-03
> **Companion doc**: `NETZ_METHODS_CATALOG.md` holds every method and unit to add. This file only says *when*.
> **Built from**: `reports/NETZ market and readiness analysis.md` and `reports/NETZ global market and new methods.md`
> **Owner corrections already applied**: Pro and ads are for **Notes and the Board**, for learners **worldwide**; testing is done.
> Where the two reports disagree, the second one wins (it knows the paid product is Notes + Board).

---

## 1. Where NETZ stands today

| Area | State |
| :--- | :--- |
| Method pages | 34 pages in 5 units, steps + tables + graphs, code/LaTeX export (Pro) |
| Board / Playground | On-device handwriting (text + maths), shapes, symbols, equations, export |
| Notes | Blocks, KaTeX, live solver widgets, quizzes, handwriting, public links |
| Rewards | Tasks, streaks, 75 medals, gems, shop, Bolt |
| Accounts and money | Supabase sign-in, Razorpay (test mode), ads code ready but off |
| Testing | Done (owner, 2026-11) |
| Not live yet | Razorpay Live, AdSense, custom domain, foreign payments |

**The idea in one line:** method pages are the free way in (people find them on Google). Notes and the Board are what people pay for. Every new method should also work as a live widget inside Notes.

---

## 2. Two decisions only the owner can make

The research disagrees with the owner on two points. Read the evidence, then decide. Nothing in the roadmap below changes the maths model.

### 2.1 Handwriting training data

- **What the research found:** NETZ's three models are its own (trained from scratch), so no model licence applies. But the training data is non-commercial:
  - MathWriting: CC BY-NC-SA 4.0. The GitHub page licenses the *code* as Apache 2.0, but the *data* is non-commercial.
  - IAM-OnDB: "non-commercial research purpose only".
  - The planned DeepWriting and BRUSH data are non-commercial too.
- **Why it matters:** Pro and ads run on the same screens as recognition.
- **Options:**
  - **A.** Email Google (MathWriting) and FKI (IAM-OnDB) for written commercial permission. This is the only option that keeps the frozen maths model unchanged, and it costs nothing.
  - **B.** Retrain the text model and router on data NETZ may use commercially: its own handwriting collected with consent, synthetic strokes, UJI Pen Characters (CC BY), and Quick, Draw! (CC BY).
  - **C.** Keep the current view and accept the risk. Get a lawyer's opinion first.
- **Recommendation:** do A now. Start B for the text model and router in parallel.

### 2.2 Users under 18

- **What the research found:** AdSense does protect minors that *Google* has identified. India's DPDP Act, however, needs a parent's consent before NETZ stores **any** data (account, notes) of anyone under 18, not only before showing ads. COPPA (US, under 13) and the UK Children's Code apply too. Visitors from the EU, UK and Switzerland also need a Google-certified cookie banner.
- **Options:**
  - **A.** Ask for date of birth at sign-up and allow 18+ only. This is the cheapest option: 1–3 days of work.
  - **B.** Ask for date of birth and run a parent-consent flow for minors. Mark their ads as TFAT CHILD/TEEN and turn off profiling. This is more work and needs a lawyer to review.
- **Deadline:** the DPDP duties start 13 May 2027, or possibly earlier if the proposed 13 Nov 2026 date is adopted. Check which date applies.

---

## 3. The roadmap

Each phase has a **gate**: don't start the next phase until the gate is met.

### Phase 0 — Clear the blockers (this week, mostly owner tasks)

| # | Task | Who | Time |
| :---: | :--- | :--- | :--- |
| 0.1 | Rotate the Supabase DB password and the Razorpay secrets that were shared in chat | Owner | 1 h |
| 0.2 | Run the `note_assets` migration; check the yearly plan is really yearly | Owner | 1 h |
| 0.3 | Send the two licence emails (section 2.1, option A) | Owner | 1 h |
| 0.4 | Decide on under-18 users (section 2.2) | Owner | — |
| 0.5 | Book a CA: GST from day one or only at ₹20 lakh? LUT for exports? Presumptive tax? | Owner | ₹2–5k |
| 0.6 | Check whether Vercel Hobby allows a paid site; if not, move to Pro or the Lightsail plan | Owner | 1 h |
| 0.7 | Buy a custom domain | Owner | ₹1k/yr |

**Gate:** secrets rotated, licence emails sent, under-18 decision made, CA answer received.

### Phase 1 — Launch in India (weeks 1–4)

| # | Task | Notes |
| :---: | :--- | :--- |
| 1.1 | Add date of birth at sign-up, plus the chosen under-18 rule | Section 2.2 |
| 1.2 | Rewrite the privacy notice and add a grievance contact, one-tap "delete my account" and a breach plan | DPDP basics |
| 1.3 | Change the Refund page from "no refunds" to "no refunds for change of mind, except double charges and faults"; make Cancel one tap | Consumer rules on subscription traps |
| 1.4 | Change prices in `pricing.js` and Razorpay: **₹79–99/mo, ₹699–799/yr, ₹1,999–2,499 lifetime** | Goodnotes India is ₹699/yr |
| 1.5 | Make pages findable on Google and AI assistants: give every page its own title and description (live pages all say "NETZ" / "current objective: survive"), add the 7 missing pages to the sitemap, connect the domain, set up Search Console + Bing Webmaster Tools, and name the AI crawlers in robots.txt. Then do the ⭐ page items in `NETZ_METHODS_CATALOG.md`, starting with the 16 pages that already exist. Code task list: **section 4 (F1–F13)** | Google, ChatGPT, Gemini and Claude are the free channel |
| 1.6 | Switch Razorpay to Live | After 1.4 |
| 1.7 | Apply for AdSense (needs the domain and real pages); keep ads off the Board and off for Pro | Approval takes up to 4 weeks |
| 1.8 | Build the **"Move from Microsoft Whiteboard / Jamboard"** page | Whiteboard's personal accounts close in late 2026 |
| 1.9 | Start **Batch 1** from `NETZ_METHODS_CATALOG.md` | Build 2–3 pages each week |
| 1.10 | Search IP India for "NETZ", register on Udyam, file classes 9, 41 and 42 | About ₹13.5k |

**Gate:** live payments work, first real users, Search Console shows impressions.

### Phase 2 — Go global (weeks 4–10)

| # | Task | Notes |
| :---: | :--- | :--- |
| 2.1 | Open a merchant-of-record account (**Dodo Payments** or **Paddle**) for buyers outside India; keep Razorpay for India | The merchant of record collects UK, EU and US tax for you |
| 2.2 | Prices abroad: **$19.99/yr, $34.99–39.99 lifetime**; drop or raise the $2.99 monthly plan; 30–40% off in Tier B countries, 50–70% off in Tier C | Fees eat about 20% of a $2.99 sale |
| 2.3 | Add a Google-certified cookie banner (TCF) for EU, UK and Switzerland visitors | AdSense requires it |
| 2.4 | File the LUT for GST-free exports; keep a FIRC or eFIRA for each foreign payout | Follow the CA's answer |
| 2.5 | Build **Batch 2** from `NETZ_METHODS_CATALOG.md`, starting with the symbolic step engine (catalog section 0.1) | Unlocks Calculus, Algebra and ODE pages |
| 2.6 | Add **"Check my AI's answer"**: paste a chatbot's steps and NETZ marks the first wrong row | Turns free AI into a reason to use NETZ |
| 2.7 | No course-code pages. Each **topic** in those courses becomes its own page (the catalog lists them), with a small "used in: Anna, VTU, GTU…" line on the page | People search for the topic; courses only tell us which topics to build |
| 2.8 | Make the 7-day streak the onboarding goal and add "exam sprint" goals; GATE runs 6–21 Feb 2027 | Duolingo's data on early streaks |

**Gate:** first foreign sale, free-to-paid rate measured by country.

### Phase 3 — Grow (months 3–6)

| # | Task | Notes |
| :---: | :--- | :--- |
| 3.1 | Check the demand order for Waves 3–4 in Google Trends or Keyword Planner, in English and Spanish | 1 hour |
| 3.2 | **Spanish interface** for method pages and Notes, then Portuguese | About 40% of matrix-calculator traffic is Spanish-speaking |
| 3.3 | Build **Batches 3–4** from `NETZ_METHODS_CATALOG.md` | Rest of the new units |
| 3.4 | Retrain the text model and router on commercially usable data, if Google and FKI haven't said yes | Section 2.1, option B |
| 3.5 | Measure handwriting accuracy on real users' writing (collected with consent) | No real-world number exists yet |
| 3.6 | Try B2B: class licences or embeds for colleges and coaching institutes | The Desmos model |

**Numbers to track from Phase 1 onwards:** sign-ups, 7-day retention, free-to-paid rate (expect about 1.5–3%), Search Console impressions, ad earnings per 1,000 views by country.

---

## 4. Findability code tasks — Google and AI assistants (do later)

These are the code changes behind roadmap task 1.5 and the ⭐ section of `NETZ_METHODS_CATALOG.md`. They are not done yet: the owner chose "later" on 2026-11-03. **Do F1–F5 first:** they fix the 34 live pages at once.

**What's wrong today** (checked on the live site 2026-11-03):
- Every method page is titled **"NETZ"**, with the description **"current objective: survive"**.
- The cause is `src/app/(pages.algorithems)/layout.js`:
  - line 19 sets `APP_DESCRIPTION = "Best PWA app in the world!"`;
  - line 56 sets `description: "current objective: survive"`;
  - every method page inherits these.
- `src/app/(Primary.pages)/layout.js` line 16 has the same "Best PWA app" text.
- The good part: the worked example and table are already sent as plain HTML, so crawlers can read them.

| # | Task | Where | Size |
| :---: | :--- | :--- | :--- |
| F1 | Replace the placeholder description with a real one (e.g. "Step-by-step maths solver and handwritten maths notes that work in any browser") | `(pages.algorithems)/layout.js` lines 19 and 56; `(Primary.pages)/layout.js` line 16 | 10 min |
| F2 | Give each method page its own title and description. The pages are `'use client'`, so they can't export `metadata`. Add a small server `layout.js` next to each `page.js` that exports `metadata`, built from one shared list | One new `layout.js` per method folder + one data file, e.g. `src/app/utils/seo/methodsMeta.js` | 1 day for all 34 |
| F3 | Use the ⭐ search words from `NETZ_METHODS_CATALOG.md` for those titles and descriptions ("Newton-Raphson Method Calculator with Steps — NETZ") | Same data file as F2 | Part of F2 |
| F4 | Fix the sitemap: add the 7 missing method pages and `lastmod` dates. Choose **one** sitemap source, because both `src/app/sitemap.js` and `next-sitemap.config.js` (writing `public/sitemap.xml`) exist today | `src/app/sitemap.js`, `next-sitemap.config.js` | 1–2 h |
| F5 | Switch every URL to the custom domain once it's bought (the config still says `netz-ruby.vercel.app`) | `next-sitemap.config.js`, `metadataBase` in both layouts, `public/robots.txt` | 30 min |
| F6 | Name the AI crawlers in robots.txt as allowed: `Googlebot`, `Google-Extended`, `Bingbot`, `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot` | `next-sitemap.config.js` → `robotsTxtOptions.policies` (or a `src/app/robots.js`) | 30 min |
| F7 | Add JSON-LD structured data (`MathSolver` + `LearningResource` + `BreadcrumbList`) from one shared component. Check Google's current structured-data docs first | New `src/app/components/seo/JsonLd.js`, used by each method `layout.js` | Half a day |
| F8 | Add an answer-first intro sentence and a 3–5 question FAQ to each ⭐ page, written from its search words | Each method page | 1–2 pages an hour |
| F9 | Add links between related pages (e.g. Newton-Raphson ↔ Secant ↔ Bisection) | Method pages / `components/editorial/navData.js` | Half a day |
| F10 | Add `public/llms.txt`: the ⭐ pages with a one-line description each | `public/llms.txt` | 30 min |
| F11 | **Owner:** set up Google Search Console + Bing Webmaster Tools, submit the sitemap; add IndexNow pings for new pages | Owner accounts (add to `NETZ_OWNER_TODO.md`) | 1 h |
| F12 | Track visits referred by chatgpt.com, gemini.google.com, claude.ai and perplexity.ai in Google Analytics | GA settings / existing analytics code | 1 h |
| F13 | Add an "Open in Notes" / "Try it on the Board" button on every ⭐ page | Method pages | Half a day |

**Done when:** each live method page shows its own title in the browser tab, Search Console shows the pages indexed, and a page check (e.g. Google's Rich Results Test) reads the structured data.

---

## 5. What's still unknown

- Exact Google search volumes per method. The catalog's order uses Wikipedia views and Semrush, so check the top 10 in Trends before Batch 3.
- Mumbai, SPPU, AKTU and DU syllabi (they couldn't be read).
- How much users outside India will pay for the maths layer in notes. This is only tested by selling.
- Real-world handwriting accuracy.
