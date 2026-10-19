# NETZ — Moving from Vercel to the AWS Lightsail VPS (later)

> **Written**: 2026-10-19
> **Status**: for the future. NETZ stays on **Vercel + Neon** for now (`NETZ_LAUNCH_PLAN.md`, section 4).
> **Based on**: the existing Lightsail server that already runs PactDoc/Signaturly
> (`Desktop/Signaturly/docs/deployment/AWS_LIGHTSAIL_DEPLOYMENT_GUIDE.md`, `.github/workflows/deploy-lightsail.yml`):
> Ubuntu 24.04, Mumbai region, Docker + docker-compose, **Nginx + Certbot on the host**,
> apps in `/home/ubuntu/apps/<name>`, deploys over SSH from GitHub Actions.
> NETZ follows the same pattern, so both apps are run the same way.

---

## 1. When to move

Move when at least one of these is true:
- The Vercel bill (bandwidth, function time) is higher than a bigger Lightsail plan.
- Vercel limits get in the way (function time limits, build minutes).
- You want all projects on one server and one bill.

Until then, Vercel is less work: no server to patch, automatic HTTPS, preview links for each push.

---

## 2. What changes and what stays

| Part | On Vercel now | On Lightsail |
| :--- | :--- | :--- |
| Next.js app | Vercel builds and runs it | Docker container running `node server.js` (standalone output) |
| Database | Neon | **Stays on Neon** (nothing to move). Self-hosted Postgres is possible later, but it adds backups to look after. |
| HTTPS | Vercel | Host **Nginx + Certbot** (same as PactDoc) |
| Build | Vercel | **GitHub Actions** builds the Docker image (the server is too small to build NETZ, see 3) |
| Public notes cache (ISR) | Vercel cache | Next.js cache on the container's disk (kept in a Docker volume) |
| Image optimisation | Vercel | Built into `next start` (uses `sharp`) |
| `@vercel/analytics`, `@vercel/speed-insights` | Work | **Do nothing off Vercel.** Remove them or switch them off by an env flag; Google Analytics stays. |
| Cron jobs (if any are added, e.g. a monthly medal job) | Vercel Cron | Host `crontab` calling an internal URL with a secret (same as PactDoc's internal jobs) |
| Razorpay webhook URL | `https://<domain>/api/billing/razorpay/webhook` | Same URL; only the DNS changes, so nothing to change in Razorpay |
| Google sign-in | Vercel domain in allowed redirect URLs | Same domain: nothing to change. If the domain changes, add the new one in Google Cloud Console first. |
| Big files (`public/onnx` 83 MB, `public/models` 36 MB, `public/audio` 19 MB) | Vercel CDN | Served by Nginx straight from disk with long cache headers (see 6), or later from a Lightsail CDN distribution |

---

## 3. Server size

The PactDoc server is the **1 GB RAM** plan. That is **not enough to build** NETZ (`next build --webpack`
with MathLive, ONNX and the PWA step needs well over 1 GB), and tight for running it next to PactDoc.

- **Build** in GitHub Actions (free runners have 7 GB RAM) and push the image to **GitHub Container Registry (GHCR)**. The server only **pulls** the finished image.
- **Run**: the NETZ server uses about 150–300 MB. On the shared server, move up to the **2 GB plan** (check the current Lightsail price) and keep the 2 GB swap file.
- Lightsail lets you take a **snapshot** and create a bigger instance from it; the static IP can be moved to the new one.

---

## 4. Changes in the NETZ code

1. `next.config.js`: add `output: 'standalone'` to `nextConfig` (keep the PWA wrapper as it is).
2. Read `node_modules/next/dist/docs/01-app/02-guides/self-hosting.md` again before the move (this Next.js version has breaking changes, see `AGENTS.md`). Points that apply to NETZ:
   - Put Nginx in front (we do).
   - Streaming through Nginx needs buffering turned off (`X-Accel-Buffering: no`, see 6).
   - The ISR cache lives on disk: mount `.next/cache` as a volume, so a restart does not empty it.
   - One container only, so no shared cache handler or `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` is needed. If we ever run 2+ containers, both are needed (see the guide).
   - Set `deploymentId` from the git hash, so old browser tabs reload cleanly after a deploy.
3. Remove or switch off `<Analytics />` and `<SpeedInsights />` in `src/app/(Primary.pages)/layout.js` when `process.env.VERCEL` is not set.
4. Add `GET /api/health` (returns `{ ok: true }` after a quick database ping) for the deploy check.

### `Dockerfile` (in `Netz/`)

```dockerfile
# ---- build ----
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- run ----
FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN useradd -m netz
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
RUN mkdir -p .next/cache && chown -R netz:netz /app
USER netz
EXPOSE 3000
CMD ["node", "server.js"]
```

`NEXT_PUBLIC_*` values (e.g. the Razorpay key ID, the AdSense client) are put into the code **at build time**,
so they must be set in GitHub Actions for the build step. Secret keys are only given at run time (`.env` on the server).

---

## 5. On the server

### 5.1 Folder and compose file

```
/home/ubuntu/apps/netz/
├── docker-compose.yml
├── .env                 # secrets, never in git
└── public-static/       # copy of public/onnx, public/models, public/audio for Nginx (see 6)
```

```yaml
# /home/ubuntu/apps/netz/docker-compose.yml
services:
  web:
    image: ghcr.io/sulaimankhan8/netz:latest
    container_name: netz-web
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"      # only Nginx can reach it (PactDoc uses 5000)
    env_file: .env
    volumes:
      - netz_cache:/app/.next/cache
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s
    deploy:
      resources:
        limits:
          memory: 700M

volumes:
  netz_cache:

networks:
  default:
    name: netz-network
```

### 5.2 `.env` on the server

```env
DATABASE_URL=postgres://...neon.tech/netz?sslmode=require
AUTH_SECRET=...                 # openssl rand -hex 32
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
INTERNAL_JOB_SECRET=...         # for cron calls
```

The same names as in Vercel's environment settings, so copying them across is one-to-one.

---

## 6. Nginx site (next to PactDoc's)

```nginx
# /etc/nginx/sites-available/netz
server {
    server_name netz.example.com www.netz.example.com;   # the real NETZ domain

    client_max_body_size 10m;

    # Big Playground files straight from disk, cached for a year
    location ~ ^/(onnx|models|audio)/ {
        root /home/ubuntu/apps/netz/public-static;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;            # Next.js streaming
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/netz /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d netz.example.com -d www.netz.example.com
```

> The `onnx/` runtime files keep the same name between package upgrades (see `next.config.js`), so either
> leave them out of the `immutable` rule or copy them fresh on every deploy. The deploy script below copies them every time.

---

## 7. Deploy from GitHub Actions

`.github/workflows/deploy-lightsail.yml` in the Netz repo (same secrets names as PactDoc: `LIGHTSAIL_HOST`, `LIGHTSAIL_USERNAME`, `LIGHTSAIL_SSH_KEY`):

```yaml
name: Deploy NETZ to Lightsail
on:
  workflow_dispatch:            # by hand at first; switch to "push to main" once it is trusted
concurrency: { group: deploy-netz, cancel-in-progress: true }

jobs:
  build:
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }} }
      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ghcr.io/sulaimankhan8/netz:latest,ghcr.io/sulaimankhan8/netz:${{ github.sha }}
          build-args: |
            NEXT_PUBLIC_RAZORPAY_KEY_ID=${{ secrets.NEXT_PUBLIC_RAZORPAY_KEY_ID }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.LIGHTSAIL_HOST }}
          username: ${{ secrets.LIGHTSAIL_USERNAME }}
          key: ${{ secrets.LIGHTSAIL_SSH_KEY }}
          script_stop: true
          script: |
            cd /home/ubuntu/apps/netz
            docker compose pull web
            docker compose up -d web
            # copy the big Playground files out of the new image for Nginx
            rm -rf public-static && mkdir public-static
            docker cp netz-web:/app/public/onnx   public-static/onnx
            docker cp netz-web:/app/public/models public-static/models
            docker cp netz-web:/app/public/audio  public-static/audio
            sleep 8
            curl -fsS http://127.0.0.1:3000/api/health || (docker compose logs --tail=80 web && exit 1)
            docker image prune -f
```

(Build args need matching `ARG` lines in the Dockerfile build stage. The server needs to log in to GHCR once with a read-only token: `docker login ghcr.io`.)

**Rollback**: in `docker-compose.yml`, set the image to an older tag (`ghcr.io/sulaimankhan8/netz:<old sha>`) and run `docker compose up -d web`.

---

## 8. Switch-over day

1. Deploy to Lightsail and test it at a temporary subdomain (e.g. `next.netz.example.com`) with its own Certbot certificate.
2. Check: pages load, the Playground models download, sign-in works (add the temporary domain to Google's allowed redirect URLs), Razorpay **test mode** payment + webhook, a public note `/p/[slug]`, PWA offline page, ads only for free users.
3. Lower the DNS TTL to 5 minutes a day before.
4. Point the main domain's DNS (A record → Lightsail static IP), run Certbot for the main domain.
5. Watch the logs (`docker compose logs -f web`) and Razorpay's webhook dashboard for an hour.
6. Keep the Vercel project for a week as a fallback (point DNS back if something breaks), then remove its domain.

---

## 9. Looking after it

- **Backups**: Neon keeps its own history; take a weekly **Lightsail snapshot** of the server too.
- **Updates**: `sudo apt update && sudo apt upgrade` monthly; Certbot renews by itself (check with `sudo certbot renew --dry-run`).
- **Memory**: `docker stats` — if NETZ sits near its 700 MB limit, move to the next plan up.
- **Disk**: `docker image prune` runs on each deploy; old images otherwise fill the 40 GB disk.
- **Logs**: `docker compose logs --tail=200 web`; Nginx errors in `/var/log/nginx/error.log`.

---

## 10. To fill in before the move

- The real NETZ domain (replace `netz.example.com`).
- Whether the Lightsail server is moved to 2 GB or NETZ gets its own instance.
- Whether the big Playground files go to a Lightsail CDN distribution instead of plain Nginx (better for users outside India).
