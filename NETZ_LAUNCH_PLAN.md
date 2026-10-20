# NETZ Launch Plan — Tasks, Streaks, Gems, Art, Backend, Pricing, Ads

> **Written**: 2026-10-19 (version 2, with the owner's decisions)
> **Replaces**: the XP and levels parts of `NETZ_BACKEND_IMPLEMENTATION_PLAN.md` (section 6),
> `MASTER_ROADMAP_AND_PENDING_TASKS.md` (Module D) and `SAAS_STATE_MANAGEMENT_AND_GROWTH_PLAN.md`.
> Those plans are still the reference for the public notes pages and the Razorpay code.
> Where this plan and an older one disagree, this plan wins.
> **Moving to a VPS later**: see `NETZ_VPS_DEPLOYMENT_LIGHTSAIL.md`.
> **Status (2026-10-20)**: sections 2–6 built (tasks and rewards, art, backend, pricing and Razorpay, ads); section 7 (the full check run) next; owner setup waits in `NETZ_OWNER_TODO.md`.

---

> **Everything the owner still has to do** (accounts, keys, KYC, decisions) is collected in one checklist:
> **`NETZ_OWNER_TODO.md`**. The owner setup notes in sections 4.5 and 5.4 below are the detail behind it.

## 0. Owner decisions (2026-10-19)

| # | Topic | Decision |
| :---: | :--- | :--- |
| 1 | Progress system | **No XP and no levels.** Tasks, **streaks**, medals and **gems**. |
| 2 | Medals | **50 task medals + 5 onboarding medals + 20 streak medals**, plus **monthly medals** (like LeetCode / Duolingo) and **yearly medals**. ⚠ You wrote "74 in total", but 50 + 5 + 20 = **75**. This plan uses 75 until you confirm. |
| 3 | Gems | Tasks can be repeated after the first time and give **gems**. Gems buy **banner art** and **mascot skins** in a shop. |
| 4 | Pro yearly items | Each year has a **unique mascot skin, a unique year medal and a unique banner**, unlocked through **Pro tasks**. One paid month is enough if the Pro tasks are done in that month, and the items stay **forever**. |
| 5 | Mascot | **A little robot calculator.** |
| 6 | Lifetime plan | **Keep it** (₹3,499 / $49.99). |
| 7 | Payments | **Razorpay for everyone** (India and other countries). |
| 8 | Hosting | **Vercel now.** A separate doc covers moving to the AWS Lightsail VPS later. |
| 9 | Ads | **Rewarded ads: yes.** Also **time-based ads**: after about 15 minutes of use, the person sees an ad. |
| 10 | Art | **Claude makes the first art**, and we decide on it together before more is made. |

---

## 1. Where the app is today (checked in the code, 2026-10-19)

| Area | What exists now | What is missing |
| :--- | :--- | :--- |
| **Backend** | Nothing. No `src/app/api/`, no accounts, no database. Notes are kept in `localStorage` (`netz_notes_v2_data`) and the Playground in IndexedDB (`NETZ_PLAYGROUND_DB`). The "community notes" in `NoteShareModal.js` are fixed samples. | Accounts, sign-in, a cloud copy, public note links, and a server that can be trusted with gems, streaks and payments. |
| **Progress** | Nothing. `/Profile` shows `<UnderConstruction />`. | The whole system. |
| **Art** | App icons, landing guide screenshots, `bg1`, lucide icons. `lottie-react` is installed but nothing uses it for a mascot. | Mascot, skins, medals, banners, empty states. |
| **Pricing** | Only in the older plans. | Pricing page, Razorpay, the Pro check, and the Terms, Refund and Contact pages. |
| **Ads** | The AdSense script loads when the browser is idle (`layout.js`). One slot on the landing page (`components/landing/AdSlot.js`). The old full-screen `components/Ad.js` is not used anywhere. | `ads.txt`, a consent message, more slots, the 15-minute ads, rewarded ads, and no ads for Pro. |

### Build order

```
Step 1  Art round 1 (mascot choices + sample medals/banner/skin) ──► owner decides
Step 2  Tasks, streaks, medals, gems on the device + Profile page (board first)
Step 3  Backend: sign-in, server-kept gems & streaks, cloud notes, public notes
Step 4  Shop (spend gems) + rest of the art
Step 5  Pricing page + Razorpay + Pro tasks / yearly collection
Step 6  Ads: slots, 15-minute ads, rewarded ads, consent
Step 7  All checks together (build first, test later)
```

Step 2 works **without the backend**, the same way notes work today. Gems and streaks are only "safe"
once step 3 is in, so the shop (step 4) opens after the backend.

---

## 2. Tasks, streaks, medals and gems

### 2.1 The parts

| Part | What it is | How many |
| :--- | :--- | :---: |
| **Task** | A real thing to do in NETZ ("Solve a root with Bisection"). The **first** time gives a **medal + gems**. **After that** it can be done again for **gems**, once per task per day. | 50 |
| **Onboarding task** | The first steps for a new student. Done once each: medal + gems. | 5 |
| **Daily goal** | Finish **any 3 tasks** in a day. Gives bonus gems. | — |
| **Streak** | The number of days in a row with **at least 1 task** done. | — |
| **Streak medal** | Reached at set streak lengths. | 20 |
| **Monthly medal** | Unique art for each month (e.g. "October 2026"). Earned by doing tasks on **20 days** of that month. | 12 per year |
| **Yearly medals** | **Pro year medal**: unique each year, from Pro tasks (2.7). **Free year medal** (my suggestion, please confirm): 6 or more monthly medals in that year. | 1–2 per year |
| **Gems** 💎 | Earned from tasks. Spent in the shop on mascot skins, banners and streak freezes. | — |

**Medals in total: 50 + 5 + 20 = 75**, plus the monthly and yearly ones, which are added every year.

### 2.2 The 50 tasks

Each task listens for an **activity** the app already does (2.6). "Solve" means the method finished with a real answer.

**Unit 1: roots and systems (7)**
1. Solve with Bisection · 2. False Position · 3. Newton-Raphson · 4. Secant · 5. Iteration (fixed point) · 6. Gauss-Seidel
7. *Compare*: solve the same function with 2 different root methods

**Unit 2: interpolation (7)**
8. Newton Forward · 9. Newton Backward · 10. Gauss Forward · 11. Gauss Backward · 12. Lagrange · 13. Newton Divided Difference
14. *Big table*: interpolate with 6 or more points

**Unit 3: integration and differentiation (8)**
15. Trapezoidal · 16. Simpson 1/3 · 17. Simpson 3/8 · 18. Boole · 19. Weddle · 20. Gauss Quadrature · 21. Numerical Differentiation
22. *Compare*: the same integral with 3 different rules

**Unit 4: ODEs and matrices (8)**
23. Euler · 24. Modified Euler · 25. Runge-Kutta · 26. Taylor Series · 27. Gauss Elimination · 28. Gauss-Jordan · 29. Jacobi · 30. LU Decomposition

**Unit 5: statistics (7)**
31. Chi-square · 32. F-test · 33. t-test · 34. Test of Significance · 35. Fit a Straight Line · 36. Fit a Parabola · 37. Least Squares

**Notes (6)**
38. Write a note with 3 or more blocks · 39. Put a solver widget in a note · 40. Write a maths (KaTeX) block · 41. Make a quiz block · 42. Answer a quiz correctly · 43. Export a note as PDF

**Playground (6)**
44. Turn handwritten maths into an equation · 45. Turn handwritten words into text · 46. Get a live `=` answer · 47. Make a graph block · 48. Insert a shape or symbol · 49. Export a page

**Sharing (1)**
50. Publish a note to the web (needs the backend)

Each day the Profile page **suggests 3 of the 50** as "Today's tasks", and at least one is from a part of
NETZ the student uses little. Any 3 tasks count towards the daily goal, not only the suggested ones.

### 2.3 The 5 onboarding tasks

1. **Meet the robot**: give the mascot a name and pick your units.
2. **First solve**: run any algorithm.
3. **First note**: write a note.
4. **First ink**: draw something in the Playground and convert it.
5. **Save your progress**: create an account (Google sign-in). This one needs the backend, so until then it shows "coming soon".

### 2.4 Streaks

- A day counts when **at least 1 task** (new or repeated) is done. The day is the student's **own local date**.
- **Streak freeze** (like Duolingo): bought with gems, at most 2 held at a time. It is used up by itself on a missed day, so the streak continues. Pro members get 1 free freeze each month.
- When a streak breaks, the medals already earned **stay**. Only the day counter goes back to 0.
- **The 20 streak medals** at: 1 · 5 · 10 · 25 · 50 · 75 · 100 · 150 · 200 · 250 · 300 · 365 · 400 · 450 · 500 · 600 · 700 · 800 · 900 · 1,000 days (1,000 is the last). Quick list of everything: `NETZ_TASK_SHEET.md`. Tiers and designs: `NETZ_MEDALS_CATALOG.md` section 4.
- Each streak medal also gives gems (see 2.5).

### 2.5 Gems: earning and spending

**Earning**

| From | Gems |
| :--- | ---: |
| A task done for the **first time** | 20 (+ its medal) |
| A task **repeated** (each task once per day) | 5 |
| An onboarding task | 25 |
| Daily goal (3 tasks in a day) | +15 |
| A streak medal | 20 for 1–10 days · 50 for 25–75 · 100 for 100–200 · 250 for 250–365 · 500 above 365 |
| A monthly medal | 200 |
| A rewarded ad (section 6) | 10, up to 3 a day |
| **Cap**: repeated tasks + daily goal | at most 60 a day |

An active student earns about **40–60 gems a day**, so a 500-gem skin takes about 10 days.

**Spending (the shop)**

| Item | Price |
| :--- | ---: |
| Mascot skins (about 20 at launch) | 400 – 1,500 |
| Banner art (about 15 at launch) | 250 – 1,000 |
| Streak freeze | 200 |

**Not for sale with gems**: Pro yearly items, monthly medals and other medals.
**Gems cannot be bought with money** at launch. Selling gems makes refunds and tax harder, and shop
items should come from studying.

### 2.6 How tasks are counted

One small helper that the pages call:

```js
// src/app/utils/activity.js (new)
recordActivity('solver.run',      { method: 'bisection', unit: 1, points: 4, fn: 'x^3-x-2' });
recordActivity('quiz.created',    { noteId });
recordActivity('quiz.correct',    { noteId, blockId });
recordActivity('note.saved',      { noteId, blocks: 4, hasMath: true, hasWidget: false });
recordActivity('note.exported',   { kind: 'pdf' });
recordActivity('ink.converted',   { kind: 'math' | 'text' });
recordActivity('playground.eval', {});
recordActivity('playground.block',{ type: 'graph' | 'shape' | 'symbol' });
recordActivity('page.exported',   {});
recordActivity('note.published',  { slug });
```

| Activity | Called from | Counts only if |
| :--- | :--- | :--- |
| `solver.run` | Calculate button on each algorithm page, `EmbeddedMathWidget.js` | it finished with an answer (no error, did not run forever) |
| `quiz.correct` | `QuizBlock.js` | first correct answer on that quiz block that day |
| `note.saved` | `noteStorage.js` | 3 or more blocks with content |
| `ink.converted` | Playground convert / recognition pill | the user kept the result |
| `playground.eval` | live `=` result | a number came out |
| `note.published` | publish (needs backend) | the note went live |

The same activity with the same details counts **once per minute**, so pressing Calculate many times does nothing extra.
Task rules (which activity, what details) live in **one file**, `src/app/utils/progress/catalog.js`.

### 2.7 Pro tasks and the yearly collection

- Every year (1 January – 31 December) has **10 Pro tasks**. Only Pro members (monthly, yearly or lifetime) can do them.
- They are a bit harder versions of normal tasks, for example "Solve 3 Unit 4 methods in one note", "Publish a note with a quiz", "Use 10 different methods this month". **All 10 can be done in one month.**
- Rewards, each kept **forever**, even after Pro ends:
  - **3 Pro tasks** → the year's **banner** (e.g. "2026 Circuit Board").
  - **6 Pro tasks** → the year's **mascot skin** (e.g. "2026 Robot: Gold Edition").
  - **10 Pro tasks** → the **2026 Pro medal**.
- When a year ends, its items can never be earned again. That is what makes them special.
- Lifetime members get the Pro tasks every year.

### 2.8 Where the student sees it

- **Profile page** (`/Profile`): banner at the top, mascot with its skin, streak counter 🔥 and freezes, gem balance, today's 3 tasks, the daily goal ring, all 50 tasks with done/not done, the medal case (task / onboarding / streak / monthly / yearly tabs), a month calendar showing the days a task was done, and sign-in.
- **Shop** (tab on Profile): skins and banners with a preview on your own mascot and banner.
- **Small chip** in the side navigation / phone dock: 🔥 12 · 💎 340 · "2 of 3 today". Tapping it opens Profile.
- **"Task done" toast** with the mascot. It never shows while the pen is on the canvas; it waits until the stroke ends.
- **Medal pop-up** (bigger, mascot cheering) the first time a medal is earned.
- **Algorithm pages**: a "Task: first Bisection solve — 20 💎" line under the title until it is done.
- **Settings**: switch toasts off; reset progress.

### 2.9 Data on the device (before sign-in)

```
localStorage key: netz_progress_v1
{
  version: 1,
  activity: [...last 40 days, trimmed],
  tasksFirstDone: { 'unit1.bisection': '2026-10-19', ... },
  tasksDoneToday: { date: '2026-10-19', ids: [...] },
  onboarding: ['meet-robot', 'first-solve'],
  streak: { current: 5, best: 12, lastDay: '2026-10-19', freezes: 1 },
  days: ['2026-10-15', ...],              // days with a task (for monthly medals and the calendar)
  medals: { 'task.unit1.bisection': '2026-10-19', 'streak.7': ..., 'month.2026-10': ... },
  gems: 340,                              // only trusted after the server confirms (section 4)
  owned: { skins: ['default'], banners: ['default'] },
  equipped: { skin: 'default', banner: 'default' },
  robotName: 'Bolt'
}
```

### 2.10 Build steps

**Progress 2026-10-19:** steps 1 and 2 are built, and the "task done" toast from step 4.
- `src/app/utils/progress/catalog.js` (50 + 5 tasks, 20 streak medals, gems), `progress/engine.js` (device engine), `utils/activity.js` (`recordActivity`, `useRecordSolve`).
- All 34 solver pages call `useRecordSolve`. Notes report from `saveSingleNote` (a copied community note does not count), `QuizBlock` and PDF export. The Playground reports convert, the live "=" answer, graph, shape, symbol and export.
- Robot: `components/mascot/NetzRobot.js` (+ `netzRobot.css`); `robotReact('cheer')` from anywhere. `ProgressToast` sits in `components/layout.js` and waits while a pen or finger is down.
- Checks: `node test_progress_engine.mjs` (25 checks); in the browser, a Bisection solve gave 65 gems and the toast.
- Profile page built from the approved boards (artboards 8–9): `Profile/ProfileView.js`, `OnboardingDialog.js`, `profile.css` (`--pf-` tokens, light and dark), Fredoka for numbers and titles. Shop, banners, Pro and Google sign-in show as "soon" until the backend.
- Onboarding: opens by itself on the first Profile visit (robot name, your name, units); units shape today's suggestions. Skipping keeps a "Getting started" card.
- Nav chip (`components/mascot/ProgressChip.js`) in the side rail / open sidebar and the phone top bar; it is also the phone's way to Profile.
- Year badge is now awarded (6 monthly medals; 2 in 2026).
- Settings: "Tasks, streaks and medals" section (robot toast switch, reset progress with a second tap). The Notes solver widget now reports solves too. Step 2 is complete; next is step 3, the backend.

1. `activity.js`, `progress/catalog.js` (all 50 + 5 tasks, 20 streak levels, monthly rule, gem amounts), `progress/engine.js` (counts tasks, streak, medals, gems; saves).
2. Call `recordActivity` from algorithm pages, embedded widget, quiz block, note save/export, Playground convert / `=` / blocks / export.
3. **Profile page board** (phone, tablet, laptop) → owner approves → build.
4. Chip in nav/dock, toast, medal pop-up, task line on algorithm pages.
5. Onboarding flow (first visit, short, can be skipped).
6. Settings switches.

---

## 3. Art

Duolingo-style means **one friendly character** + **flat, bold, rounded shapes** + **a few strong colours**,
used everywhere the app talks to the student. We do not copy Duolingo's owl, its green or its exact shapes.

### 3.1 The mascot: a little robot calculator

- The body is a calculator: a screen on the face (the eyes and mouth show on the screen, so it can show any mood, and even numbers), a small keypad on the belly, short arms and legs, and one antenna.
- **Name**: chosen by each student in onboarding. Default name to be decided (ideas: *Bolt*, *Calcu*, *Digi*, *Netzo*).
- Round corners, thick outlines, 2–3 main colours from the NETZ accents. It must look good at 32 px (the chip) and at 300 px (Profile).

### 3.2 Everything to make

| Group | Items | Format |
| :--- | :--- | :--- |
| Mascot poses | idle, waving, cheering, thinking, writing, surprised (error), sleeping (empty state), holding a medal, sad (streak lost) | SVG; later 3 short Lottie animations (blink, cheer, thinking) |
| Mascot skins (shop) | ~20: lab coat, graduation cap, headphones, scarf, wizard, astronaut, pixel, neon… | SVG layers on top of the base robot |
| Pro yearly skin | 1 per year (2026: gold edition) | SVG |
| Task medals | 50, one colour per unit + Notes / Playground / Sharing colours, all in one shared frame | SVG, 96 and 192 px |
| Onboarding medals | 5 | SVG |
| Streak medals | 20, getting fancier as days grow (bronze → silver → gold → flame → diamond) | SVG |
| Monthly medals | 12 per year, each unique (e.g. October = leaf, December = snow) | SVG |
| Yearly medals | Pro year medal + free year medal, one each per year | SVG |
| Banners (shop) | ~15: graph paper, circuit, galaxy, chalkboard, sine waves, matrix rain… | wide SVG/WebP, light + dark |
| Pro yearly banner | 1 per year | SVG/WebP |
| Empty states | no notes, all tasks done, offline, error, no search result | SVG with mascot |
| Pricing page art | Free vs Pro | SVG |
| Share cards | medal earned, note published, streak reached (1200×630) | made by code from SVG |

Rules: works in **light and dark**, uses the NETZ accent colours (`--ld-accent`, `--pg-accent`, `--nt-accent`),
each SVG under ~15 KB, no words drawn into images (so text can be translated).

### 3.3 Art round 1 (the next thing to make)

One board for the owner to choose from:
1. **3 different robot designs** (shape, colours, face style).
2. For the chosen look: **4 poses** (idle, cheering, thinking, sleeping).
3. **1 sample medal** of each kind: task, onboarding, streak, monthly, Pro year.
4. **2 sample banners** and **2 sample skins**.

After the owner decides, the rest is made in batches (medals first, because Profile needs them).

---

## 4. Backend (Vercel + Supabase, all free)

> **Changed 2026-10-19:** the owner chose **Supabase on the free plan** instead of Neon, and wants
> everything to stay free. The code stays on plain Postgres (Drizzle), so moving off Supabase later
> (for example to Postgres on the Lightsail server already paid for) is a connection-string change.

### 4.1 Choices

| Part | Choice | Cost |
| :--- | :--- | :--- |
| Server code | **Next.js route handlers in this app** (`src/app/api/...`), no separate server | ₹0 (Vercel free) |
| Database | **Supabase Postgres** (free plan, Mumbai region) through **Drizzle** + `postgres` driver on the pooler URL | ₹0 |
| Sign-in | **Supabase Auth with Google** (no passwords stored) via `@supabase/ssr` cookies | ₹0 |
| Note images (later) | Supabase Storage (1 GB free) | ₹0 |
| Keep awake | GitHub Actions job pings the database daily, so a quiet week never pauses the free project | ₹0 |
| Rate limits | a Postgres table / per-request caps; nothing paid | ₹0 |
| If it ever outgrows free | Postgres on the existing Lightsail server → `NETZ_VPS_DEPLOYMENT_LIGHTSAIL.md` | ₹0 extra |

Free-plan limits to watch (check supabase.com/pricing): about 500 MB database, 50,000 monthly sign-in users,
1 GB storage, and a pause after about a week with no activity at all.

**Security:** the browser only ever gets the public anon key. All tables have row-level security turned on
with **no** policies, so the browser cannot read or write them directly; only our route handlers can,
through the server-side database connection.

> This project's Next.js version has breaking changes (see `AGENTS.md`). Before writing route handlers,
> read `node_modules/next/dist/docs/` (route handlers, server functions, caching; middleware is now called `proxy`).

### 4.2 The server is the boss of gems and streaks

Once someone signs in, the **server** keeps the real gem balance, streak and medals. The device sends
its activities; the server checks them and replies with the true numbers.

- **Before sign-in**: everything is counted on the device. On first sign-in the device sends its activity log, and the server **re-counts it with the daily caps** (max 60 gems a day from repeats, etc.), so a changed `localStorage` cannot create 1 million gems.
- **Dates**: the device sends its local date. The server accepts it only if it is within 14 hours of the server's UTC time, and a day that is already counted cannot be changed.
- **Gems** are kept in an append-only list (`gem_ledger`); the balance is the sum. Shop buys and streak freezes are written there too, so nothing is lost or counted twice.

### 4.3 Tables

**As built (2026-10-19), simpler than the sketch below:** the server runs the *same* engine as the device
(`utils/progress/engine.js`, pure `reduceActivity`), so the true progress is one JSON record per user that only
the server writes. Tables (`src/db/schema.js`, migration in `supabase/migrations/`):

- `profiles` (user id from Supabase Auth, display name, robot name, created)
- `progress` (user id, `state` JSONB, `version`, `updated_at`) — the server's copy of the engine state
- `activity_log` (user id, kind, details JSONB, local day, received at) — every reported activity, for audits and re-counts
- `gem_ledger` (user id, amount, reason, created) — shop spending and later Razorpay/ad rewards; unique reason per user

Notes, public notes and entitlements are added in their own rounds. The longer sketch below is kept for reference:

```sql
CREATE TABLE activity (            -- what the device reported (kept 60 days)
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, details JSONB, local_day DATE NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_done (           -- one row per task per day it was done
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,           -- 'unit1.bisection', 'onboard.first-note', 'pro2026.t3'
  local_day DATE NOT NULL,
  first_time BOOLEAN NOT NULL,
  PRIMARY KEY (user_id, task_id, local_day)   -- once per task per day: no double gems
);

CREATE TABLE streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current INT NOT NULL DEFAULT 0, best INT NOT NULL DEFAULT 0,
  last_day DATE, freezes INT NOT NULL DEFAULT 0 CHECK (freezes BETWEEN 0 AND 2)
);

CREATE TABLE medals (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  medal_id TEXT NOT NULL,          -- 'task.unit1.bisection', 'streak.30', 'month.2026-10', 'year.pro.2026'
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, medal_id)
);

CREATE TABLE gem_ledger (          -- every gem in or out
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL,             -- +20, +5, -400 ...
  reason TEXT NOT NULL,            -- 'task.first:unit1.bisection', 'shop:skin.labcoat', 'ad.reward'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, reason)         -- for one-time reasons; repeat reasons include the day
);

CREATE TABLE owned_items (         -- skins and banners, bought or earned
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,           -- 'skin.labcoat', 'banner.galaxy', 'skin.pro2026'
  source TEXT NOT NULL,            -- 'shop', 'pro_tasks', 'gift'
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE entitlements (        -- is this user Pro / ad-free right now?
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('pro', 'ad_free')),
  source TEXT NOT NULL,            -- 'razorpay', 'gift'
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,             -- NULL = lifetime
  PRIMARY KEY (user_id, kind, source, starts_at)
);
```

`profiles` also gets `robot_name`, `equipped_skin`, `equipped_banner`.

### 4.4 Endpoints

| Endpoint | What it does |
| :--- | :--- |
| `/api/auth/*` | Google sign-in, magic link, sign-out |
| `GET /api/me` | profile, plan, streak, gems, medals, owned and equipped items |
| `POST /api/progress/sync` | device sends new activities → server counts tasks, streak, medals, gems → returns the true state |
| `POST /api/shop/buy` | `{ itemId }` → checks the balance, writes to `gem_ledger` and `owned_items` |
| `POST /api/shop/equip` | choose skin / banner |
| `GET/POST/PATCH/DELETE /api/notes` | cloud copy of notes (the device stays the main copy; the newest edit wins) |
| `POST /api/notes/publish`, `/unpublish` + page `src/app/p/[slug]/page.js` | public read-only note with working solvers and quizzes, a "Copy to my notes" button, and the author's banner, mascot and medals |
| `POST /api/ads/reward` | gives the rewarded-ad gems (section 6) |
| `/api/billing/*` | section 5 |

### 4.5 Build steps

**Progress 2026-10-19:** steps 2 and 3 are built and tested; they switch on when the keys are set.
- Code: `src/db/` (Drizzle schema + pooled connection), `supabase/migrations/20261019000000_progress.sql`,
  `src/lib/supabase/` (browser + server clients), `src/proxy.js` (session refresh, only with a Supabase cookie),
  `app/auth/callback`, `app/api/progress/sync`, `app/api/health`, `utils/progress/syncCore.js` (pure server counting),
  `cloudSync.js` (outbox + sync), `useAccount.js`, `components/CloudSync.js`; Profile's account card and sign-out.
- Tests: `node test_progress_sync.mjs` (18), `node test_progress_engine.mjs` (25), `tests/db/sync-db.mjs` against
  Postgres in Docker (9: migration, row lock, parallel syncs, row-level security).
- A device that signs in to an account that already has progress takes the account's progress; what that device
  did while signed out is not merged (it is only uploaded on an account's very first sync).

**Shop (step 4), built 2026-10-19:** `utils/progress/shop.js` (prices, buy, wear; pure), `api/shop/buy` + `api/shop/equip`
through `db/progressStore.js` (row lock + `gem_ledger`), `components/mascot/banners.js` (all 8 banners), `Profile/ShopDialog.js`
(Banners, Streak freezes, Robot skins "being drawn"). The Profile header shows the worn banner. Buying needs sign-in.
Tests: `node test_shop.mjs` (11); `tests/db/sync-db.mjs` now 11, including two buys at once charging only once.
**Robot skins built 2026-10-20 (artboard 13 approved):** 9 skins in `utils/progress/shop.js` (`SKINS`; Classic free,
Lab Coat 400, Winter 450, Graduation Cap 500, Headphones 600, Neon Night 700, Wizard 900, Astronaut 1200, Circuit 2026
Pro-only) drawn in `components/mascot/skins.js` (palette + under/body/head layers; hats move with the head). `NetzRobot`
takes `skin` or wears the student's own; `RobotHead` avatars too (Profile header, public-note author). Shop "Robot skins"
tab with buy/wear. Same server routes (buy/equip handle skins). `node test_shop.mjs` now 18. Then the full medal set (2026-10-20): `components/mascot/medals.js` draws every medal — 50 task hexagons with a picture of each method (`taskEmblems.js`), 5 onboarding coins where the robot's screen shows the step, 20 streak shields (tier colour, day count, 1–3 stars, wings from Plum up), 12 month coins, the year badge and the yearly Pro medal. Not-yet-earned medals show their picture in grey. Used on Profile (medal case, today, all tasks, getting started) and in the toasts. Step 4 is done; next is step 5, pricing and Razorpay.

**Notes cloud copy (step 5), built 2026-10-19:** `supabase/migrations/20261020000000_notes.sql` (`notes` table,
tombstones, row-level security), `Notes/utils/notesCore.js` (pure rules: newest version wins, 20 free cloud notes,
samples never uploaded, 300 KB per note), `api/notes/sync` (per-student advisory lock, microsecond cursor),
`Notes/utils/notesCloud.js` (sends changed notes a moment after a save, takes newer ones, deletions + undo),
`NotesCloudStatus` line under the notes list. Images in notes stay on the device for now (Supabase Storage later).
Tests: `node test_notes_sync.mjs` (12); `tests/db/sync-db.mjs` now 15.
**Owner setup step 2 now has two files:** run both migrations in `supabase/migrations/` in name order.

**Public notes (step 6), server side built 2026-10-19; screens wait for board artboards 10–12:**
`supabase/migrations/20261021000000_public_notes.sql`, `Notes/utils/publishCore.js` (slugs, public copy without private
fields, 2 free public notes), `db/publicNotesStore.js` (publish/update, unpublish, list, read with author + view count;
task 50 counted on the server), routes `api/notes/publish`, `api/notes/unpublish`, `api/notes/published`.
Tests: `node test_publish.mjs` (14); `tests/db/sync-db.mjs` now 19. Run all three migrations in name order.
Screens built 2026-10-20 from the approved boards: `NoteShareModal` "This note" tab (A signed out, B private with
"x of 2 used", C published with link, views, "Update the public copy", Unpublish; Export PDF/Markdown; access-key import
removed, Community tab kept), `Notes/utils/publishClient.js`, and `/p/[slug]` (`(Primary.pages)/p/[slug]/`: no app
menus, note cover or author banner, author robot + medals, read-only blocks with working solver and quiz, sketches only
as images so nothing in them runs, "Copy to my notes"). "Public/Private" labels in Notes now mean really published.
Checked in the browser against Postgres in Docker (`tests/db/seed-public.mjs` seeds a note at /p/newton-raphson-x7k2).
A missing slug shows the not-found page with status 200 in dev (the site-wide `loading.js` streams first).

**Owner setup (all free), then sign-in works:**
1. supabase.com → New project, region **Mumbai (ap-south-1)**, free plan. Save the database password.
2. SQL editor → run every file in `supabase/migrations/` in name order (four as of 2026-10-20).
3. Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web application). Authorised redirect URI:
   the callback URL Supabase shows under Authentication → Providers → Google. Paste the client ID and secret there and enable Google.
4. Supabase → Authentication → URL configuration: Site URL = the live site; Redirect URLs = `http://localhost:3210/auth/callback`
   and `https://<live site>/auth/callback`.
5. `Netz/.env.local` from `.env.example` (URL, publishable key, pooler `DATABASE_URL`); the same three in Vercel → Settings → Environment Variables.
6. GitHub repo → Settings → Secrets → Actions: `NETZ_SITE_URL` = the live site (for the daily keep-awake job).

1. Supabase project (free, Mumbai), Drizzle, tables, `.env.local` keys (never committed).
2. Google sign-in, session, `GET /api/me`, sign-in on Profile and Settings (finishes onboarding task 5).
3. `progress/sync` with server counting and caps; first sign-in upload of device progress.
4. Shop endpoints → open the shop in the app.
5. Notes cloud copy.
6. Public notes `/p/[slug]` + publish (task 50).

---

## 5. Pricing and Razorpay

### 5.1 Plans

| | **Free** | **Pro** |
| :--- | :--- | :--- |
| **India** | ₹0 | ₹199 / month · ₹1,499 / year · **₹3,499 lifetime** |
| **Other countries** | $0 | $2.99 / month · $19.99 / year · **$49.99 lifetime** |
| All 34 solvers, steps, graphs, tables | ✅ | ✅ |
| Notes, Playground, handwriting (runs on the device) | ✅ | ✅ |
| 50 tasks, streaks, medals, gems, shop | ✅ | ✅ |
| **Pro tasks + yearly skin, banner and medal** (kept forever) | — | ✅ |
| Free streak freeze each month | — | 1 |
| Public note links | 2 | 25 |
| Cloud copy of notes | 20 notes | unlimited |
| Exports | PNG, PDF with a small NETZ mark | clean PDF, SVG, LaTeX, code export |
| Ads | yes (section 6) | **none** |

- Handwriting and making quizzes stay free: handwriting runs on the student's device (it costs nothing), and teachers making quizzes bring whole classes.
- Lifetime members get every year's Pro tasks.

### 5.2 Razorpay for everyone

- **India**: UPI, cards, netbanking. Monthly and yearly plans as Razorpay **Subscriptions** (UPI AutoPay / card mandate); lifetime as a one-time **Order**.
- **Other countries**: Razorpay **international payments** must be turned on for the account (Razorpay checks the business first). Prices shown in USD.
- The price shown follows the visitor's country (from the browser / IP), and the student can switch currency by hand.
- Payments are confirmed **only by the Razorpay webhook** (signature checked on the server), never by the browser alone → row in `subscriptions` → row in `entitlements`.

### 5.3 Must exist before taking money

- `/Terms`, `/Refund` (e.g. refund within 7 days), `/Contact` (email + address), and an updated `/Privacy` (accounts, payments).
- Razorpay KYC: owner's or business details, PAN, bank account (the owner does this).
- GST: ask an accountant whether registration is needed for the expected income, and for export of services.

### 5.4 Build steps

1. Terms, Refund, Contact pages; Privacy update.
2. `/Pricing` page — **board first**, using the mascot art. Linked from nav, Profile, every 🔒 Pro lock, and the Pro tasks card.
3. Razorpay: subscriptions (monthly, yearly) + order (lifetime) + webhook → entitlements.
4. Pro checks in the app: public notes, cloud notes, exports, Pro tasks, monthly freeze, ads off.
5. Manage plan on Profile: next payment date, cancel (Pro stays until the paid period ends).

**Progress (2026-10-20):** step 1 built: `/Terms`, `/Refund` (7 days), `/Contact` and the updated `/Privacy` share `components/landing/LegalPage.js`, linked from the landing footer and from each other. **The owner fills in `components/landing/legalDetails.js`** (name, email, address, courts); empty fields are left off the pages, and Razorpay needs them real. Terms links to `/Pricing`, which comes next. Step 2 built: `/Pricing` (artboards 14 and 15, landing style) with billing and currency switches (INR guessed from the Indian time zone or locale, choice remembered in `netz_currency`). Prices live in `src/app/utils/pricing.js`, which the Razorpay routes must charge from. Linked from the sidebar, the Profile Pro card, the landing footer and the legal pages. Until `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set the buy button reads "Pro opens soon". Step 3 built (2026-10-20), inert until the keys are set:

- Tables `purchases`, `payments`, `billing_events` (migration `20261022000000_billing.sql`). Payment rows are kept if an account is deleted (accounts and tax).
- `POST /api/billing/start` makes a Razorpay subscription (monthly, yearly) or order (lifetime) for the signed-in student, with the amount from `utils/pricing.js` and `notes: { user_id, plan, currency }`. It does not unlock anything.
- `POST /api/billing/webhook` is the only thing that turns Pro on: HMAC-SHA256 signature over the raw body, each `X-Razorpay-Event-Id` handled once, one transaction per event. Handles subscription activated/charged/pending/halted/cancelled/completed, `order.paid` (a smaller payment never unlocks lifetime) and `refund.processed` (a full refund ends that purchase's Pro).
- `GET /api/billing/status`, `POST /api/billing/cancel` (stops renewal; Pro stays until the paid date).
- Rules in `utils/billingCore.js` (who is Pro: lifetime, or paid-until in the future, with 2 days' grace for a late renewal webhook). Pricing page opens Razorpay Checkout and waits up to 45 s for the webhook.
- Checks: `node test_billing.mjs` (28), `tests/db/billing-db.mjs` against Postgres in Docker (16: forged signature, duplicates, parallel deliveries, late events, user mismatch, underpaid, refunds).

**Owner setup for payments (test mode first):**
1. Razorpay dashboard in **Test mode** → API Keys → generate → put Key ID and Secret in `.env.local` (`.env.example` lists every name).
2. Subscriptions → Plans → make the 4 plans in `.env.example` with those exact prices → paste the plan ids.
3. Webhooks → add `https://<your site>/api/billing/webhook`, choose a secret (→ `RAZORPAY_WEBHOOK_SECRET`), tick: subscription.activated, subscription.charged, subscription.pending, subscription.halted, subscription.cancelled, subscription.completed, order.paid, refund.processed. (For a local test, expose the dev server with a tunnel such as `cloudflared tunnel --url http://localhost:3210`.)
4. Run the migration `20261022000000_billing.sql` in the Supabase SQL editor (after the three earlier ones).
5. Add the same variables in Vercel → Project → Settings → Environment Variables.
6. After KYC: repeat 1–3 in **Live mode** and swap the keys. Turn on international payments for USD.

**Step 4 built (2026-10-20): what Pro changes.** The server always decides with its own status (`db/billingStore.js getProStatus`); the device keeps a cached copy (`utils/proClient.js`, `netz_pro_v1`, refreshed by `components/CloudSync.js`, cleared on sign-out) only for ads, exports and toasts.
- Limits (`utils/proLimits.js`): cloud notes 20 → unlimited (`api/notes/sync`), public links 2 → 25 (`db/publicNotesStore.js`, `api/notes/published`).
- Pro tasks: the 10 tasks of 2026 and the Season table are in `utils/progress/catalog.js` (`PRO_TASKS`, `PRO_SEASONS`, rewards at 3/6/10). The engine counts them only with `{ pro: true }`; the server passes its own status in `api/progress/sync` and when publishing. Kept in `state.proTasks`; rewards go to `owned` and `medals['pro.2026']` and stay after Pro ends. Profile's Pro card lists them with progress.
- Monthly freeze: one free streak freeze with the first activity of each month, up to the usual maximum of 2 (`state.proFreezeMonth`).
- Exports: free PDFs (note and Playground page) say "Made with NETZ"; Pro PDFs are clean. Playground SVG export is Pro (the button links to Pricing). LaTeX and code export do not exist yet (see `NETZ_OWNER_TODO.md` A).
- Ads: `components/AdsenseScript.js` replaces the script tags in both layouts and never loads for Pro; `AdSlot` renders nothing for Pro.
- Checks: `node test_pro.mjs` (22); `tests/db/billing-db.mjs` now 18 (free 2 public notes vs Pro 25).

**Step 5 built (2026-10-20):** Profile's Pro card starts with "Your plan" (`YourPlan` in `Profile/ProfileView.js`): the plan, "Renews on …" / "Pro until …" / "Pro for life", and a two-tap "Cancel renewal" (`api/billing/cancel`, then the cached status is refreshed). It reads the device's cached status (`useProStatus` in `utils/useIsPro.js`). **Section 5 is done; next is section 6, ads.**

Refunds are given from the Razorpay dashboard; the webhook then ends Pro by itself. When refunding a monthly or yearly plan, also cancel that subscription in the dashboard, or Razorpay will charge the next renewal. Next: step 4, Pro checks in the app.

---

## 6. Ads (free users only)

### 6.1 Never

- Inside the Playground canvas or while drawing, over a note being edited, on Pricing / checkout, or for Pro users.
- For Pro users the ad script is **not even loaded**.

### 6.2 Normal ad slots (each with its height kept, so the page never jumps — like `AdSlot.js` today)

1. Landing page (exists).
2. Algorithm pages: one slot **below** the result and steps.
3. Algorithms hub: one slot after the first unit.
4. Notes list: bottom of the sidebar (not inside a note).
5. Profile: one slot below the tasks.

### 6.3 Time-based ads ("about 15 minutes → an ad")

- NETZ counts **active minutes** (tab visible and the person did something in the last minute).
- After **15 active minutes**, NETZ **allows one full-screen ad at the next natural break**: changing page, closing a note, or leaving the Playground. It never cuts in the middle of a drawing or a calculation.
- Then the clock starts again. At most 1 per 15 minutes and 4 a day.
- **Important rule**: we must not build our own pop-up and put an AdSense ad inside it, because AdSense forbids ads in self-made pop-ups and overlays and the account could be banned. The full-screen ad must be **Google's own format**:
  - **AdSense "vignette" ads** (part of Auto ads; they show when the user changes page), turned on only once the 15 minutes have passed, **or**
  - **Google Ad Manager "web interstitial"** (it also shows on page change), with NETZ setting it up only once the 15 minutes have passed.
- Google decides whether an ad is actually there to show, so "15 minutes" means "**at most** one every 15 minutes", not "exactly every 15".

### 6.4 Rewarded ads ("watch an ad, get gems")

- A "Watch an ad → +10 💎" button on Profile / the shop, up to 3 times a day. Later it can also be "watch an ad to repair a lost streak", once a month.
- This needs **Google Ad Manager rewarded ads** (plain AdSense units cannot do it). Ad Manager must be linked to the AdSense account; check that NETZ is eligible.
- Gems are given only after Google reports the ad was watched, and the server gives them (`/api/ads/reward`, at most 3 a day).

### 6.5 Must-do items

- `public/ads.txt` with the AdSense publisher line (missing today; without it, ad income is lower).
- **Consent message** for Europe/UK visitors (Google requires a certified consent tool there): turn on AdSense's free "Privacy & messaging" tool.
- Delete the unused `components/Ad.js`.
- Update `/Privacy`: more ad places, rewarded and full-screen ads.
- No ad requests when offline (the slot just hides, so the PWA keeps working).

### 6.6 Build steps

**Built 2026-10-20 (all six steps; each part stays off until the owner's AdSense / Ad Manager setup, `NETZ_OWNER_TODO.md` H):**
- `public/ads.txt`; the unused `components/Ad.js` (a self-made full-screen pop-up, against AdSense rules) deleted.
- `utils/ads/adsPolicy.js` (`adsAllowedAt`: never Pro, offline, `/Playground`, `/Pricing`, `/p/…`) + `useAdsAllowed()`; `components/AdsenseScript.js` loads AdSense only on an allowed page.
- `components/ads/AdUnit.js` + `AdSlot.js` (reserved height, "ADVERTISEMENT" label): algorithm pages (inside `AlgorithmNavigation`, so all 34), the Algorithms hub after the cards, the end of the Notes list, Profile below "All 50 tasks". Unit ids from `NEXT_PUBLIC_ADSENSE_SLOT_*`, falling back to the landing unit.
- 15-minute ad: `utils/ads/activeClock.js` (active = tab visible and input in the last minute; 15 min, at most 4 a day) and `components/ads/TimedAds.js`, which arms Google Ad Manager's own web interstitial (`utils/ads/gpt.js`) so Google shows it at the next page change; removed again when leaving for a no-ads page.
- Rewarded: `playRewarded()` (GPT rewarded) → `POST /api/ads/reward` (`utils/ads/adReward.js`: +10 gems, 3 a day, unique `gem_ledger` reason; refused for Pro) → Profile's gems card "Watch an ad · +10 gems (n left today)", signed in only. Web rewarded ads cannot be confirmed server-side, so the daily cap is the protection.
- Privacy page lists every ad place, the full-screen and the rewarded ads. Checks: `node test_ads.mjs` (15); browser: no AdSense script on Pricing and Playground, one ad place on each allowed page.


1. `ads.txt`, consent message, delete `Ad.js`.
2. `useAdsAllowed()` hook (false for Pro, offline, Playground, Pricing), used by `AdSlot` and by `layout.js` before the script loads.
3. Slots 2–5.
4. Active-minutes counter + vignette / Ad Manager interstitial switched on after 15 minutes.
5. Ad Manager rewarded ads + `/api/ads/reward`.
6. Privacy page update.

---

## 7. Checks (all at the end, per "build first, test later")

- **Tasks**: each of the 50 + 5 finishes from the right activity; a repeat gives 5 gems once per day; pressing Calculate many times gives nothing extra; the 60-gem cap holds.
- **Streak**: a day counts with 1 task; a missed day uses a freeze; with no freeze it goes back to 0 and medals stay; it works across midnight and time zones; the monthly medal appears on the 20th day.
- **Server**: a changed `localStorage` gem number is fixed by the server; shop buys cannot go below 0 gems; the same webhook sent twice gives Pro only once.
- **Pro yearly**: a 1-month Pro member who does all 10 Pro tasks keeps the skin, banner and medal after Pro ends.
- **Sign-in** on phone, tablet and laptop; the first sign-in keeps every device note and gives back the right progress.
- **Public note** opens in a private window; solvers and quizzes work there.
- **Razorpay test mode**: monthly, yearly, lifetime, cancel, international card.
- **Ads**: no ad script for Pro (check the network tab); free users only see ads in the 5 places; no full-screen ad before 15 active minutes and never mid-drawing; rewarded gems arrive only after the ad finishes.
- **Art**: light and dark theme, 32 px and 300 px mascot, phone width with no sideways scroll.
- The existing browser harness in `tests/browser` (touch + pen) still passes.

---

## 8. Still open

1. **Medal count**: settled at 75 (50 + 5 + 20). Every medal and its design idea: `NETZ_MEDALS_CATALOG.md`; samples on the board https://claude.ai/artifact/JFXh5BEz6uJPHfXUiG9JGS.
2. **Free year medal** (6 monthly medals in a year): keep, or are yearly medals Pro-only?
3. **Robot's default name.**
4. **Gem prices and amounts** in 2.5 are a first guess, to be tuned after a few weeks of real use.
