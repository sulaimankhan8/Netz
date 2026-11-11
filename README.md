# NETZ

Maths study app: step-by-step method pages and calculators, a handwriting whiteboard (Playground), and block notes (Notes Studio). Built with Next.js 16; sign-in and sync through Supabase; payments through Razorpay.

**Documentation lives in [`docs/`](docs/README.md).** Start with the index there.

## Run it

```bash
npm install
npx next dev -p 3210        # development, http://localhost:3210
npm run build               # production build (must succeed before a release)
npx next start -p 3210      # serve the production build
```

Copy `.env.example` to `.env.local` and fill it in for sign-in, sync, payments and ads. Without it the app runs with those features switched off.

This Next.js version differs from older guides. Read `AGENTS.md` and the guides in `node_modules/next/dist/docs/` before changing framework code.

## Check it

```bash
npm run test:unit           # every logic test in tests/unit (npm run test:unit -- shape: only some)
npm run test:engines        # every method engine
npm run check:methods       # the method list: pages, medals, code export
npm run check:code-export   # compile and run the exported Python and Go
node scripts/benchmark_recognition.mjs --self-test   # handwriting models load and run
```

Browser checks need the app running (port 3210, or set `NETZ_URL`). Run them from `tests/browser`: `npm install` once, then `node run-all.mjs`. See [the Playground handoff](docs/playground/PLAYGROUND_HANDOFF.md), section 4.

## Folders

| Folder | What is in it |
|---|---|
| `src/app/(Primary.pages)/` | Main pages: landing, Algorithm hub, Notes, Playground, Pricing, Profile, legal pages |
| `src/app/(pages.algorithems)/` | One folder per method page, grouped by unit |
| `src/app/api/` | Server routes: billing, notes, progress, shop, ads |
| `src/app/data/methods.js` | The list of every method and unit; pages, menus, sitemap and medals are built from it |
| `src/app/utils/` | Engines, code export, progress and rewards, pricing, ads |
| `src/db/`, `supabase/migrations/` | Database schema and migrations |
| `public/models/` | The three on-device handwriting models (the maths model is frozen) |
| `notebooks/` | Training notebooks for those models |
| `scripts/` | Generators (shapes, symbols, widget data), new-method setup, code-export check, recognition benchmark |
| `tests/unit/` | Logic tests, one file per area, run with `node` |
| `tests/engines/` | Method engine tests (`npm run test:engines`) |
| `tests/browser/` | Browser checks with real touch and pen input (puppeteer) |
| `tests/db/` | Database checks against a throwaway Postgres |
| `docs/` | Plans, status, owner to-do, research and reports |

## Rules

- The owner commits, on `main` only.
- Do not change the maths handwriting model, its notebook, its feature extraction or its decoder.
- Owner-only tasks (accounts, keys, money, decisions) go in [`docs/launch/NETZ_OWNER_TODO.md`](docs/launch/NETZ_OWNER_TODO.md).
