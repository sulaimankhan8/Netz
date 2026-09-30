# NETZ: Comprehensive Backend Architecture & Implementation Plan

> **Document Status**: Production-Ready Architectural Blueprint & Engineering Specification  
> **Target Release**: NETZ Cloud Backend & SaaS Platform (Phase 2 & 3)  
> **Author**: Antigravity Engineering Team  
> **Source Workspace**: `c:\Users\Sulaiman\Desktop\netznew\Netz`  
> **Revisions**: Removed Supabase in favor of **Neon Serverless / Self-Hosted Docker PostgreSQL**; added **Node/Express/NestJS & Go** framework architectures; integrated **Dual Payment Gateways (Stripe Global + Razorpay India)**; detailed **Redis** caching & rate-limiting; added **Multi-Project Dockerized VPS Architecture** (hosting NETZ, Signaturely, and Discord Application on a single low-cost VPS with flat-rate billing).

---

## 1. Executive Summary & Application Research

NETZ is currently a rich, local-first Next.js 16 App Router application featuring:
1. **Interactive Numerical Algorithm Suite (Units 1–5)**: 34+ numerical solvers running in-browser with KaTeX derivations, dynamic iteration tables, and Chart.js plots.
2. **Notion-Style Block Notes Workspace**: Block editor (H1, H2, Paragraph, KaTeX, Revision Callouts, Embedded Solver Widgets, Interactive Quiz Blocks with MCQ/Tolerance math validation, and Ink Sketching).
3. **Smart Whiteboard Playground**: Hardware-accelerated canvas, Catmull-Rom smoothing, R-Tree spatial indexing, Bezier block connectors, smart blocks, and a **4-tier hybrid handwriting recognition engine** (Google Digital Ink, W3C Native OS, Word-Segmented TrOCR WASM, Tesseract).
4. **Current State Persistence**: Relies purely on client-side browser storage (`localStorage` via `noteStorage.js`, IndexedDB via `smartBlockStore.js`).
5. **Pending SaaS Capabilities**: Dedicated backend service, user authentication (JWT/OAuth), cloud-synced public notes hosting (Notion-style `/p/[slug]`), gamified XP & leveling progression (streaks excluded), user profiles, and dual Stripe/Razorpay monetization.

---

## 2. Core Architecture Strategy: Local-First vs. Cloud-Augmented

Migrating all functionality to a central server would introduce network latency, destroy offline PWA usability, and burden the platform with high cloud compute bills. Therefore, NETZ adopts a **Local-First, Cloud-Augmented Dual Engine**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           NETZ APPLICATION CLIENT                        │
│                 (Browser / WebWorkers / PWA Service Worker)              │
├──────────────────────────────────────────────────────────────────────────┤
│  LOCAL-FIRST EXECUTION (100% Client-Side - $0 Server Cost, Zero Latency) │
│  • Numerical Solvers (MathJS & Nerdamer in background WebWorkers)        │
│  • Handwriting OCR Engine (W3C Native OS API + TrOCR WASM + Tesseract)   │
│  • Whiteboard Strokes, Catmull-Rom Splines, and R-Tree Spatial Indexing  │
│  • Draft Note Editing, Slash Commands, and Interactive Quiz Practice     │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                    Synchronous & Background Cloud Sync
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            CLOUD BACKEND SERVICES                        │
│             (Node/Express/NestJS or Go + Neon PostgreSQL + Redis)        │
├──────────────────────────────────────────────────────────────────────────┤
│  CLOUD-NATIVE CAPABILITIES (Strictly Backend-Driven)                     │
│  1. User Identity & Authentication (JWT Sessions, OAuth, Argon2/Bcrypt)  │
│  2. Notion-Style Public Page Hosting (/p/[slug] + Edge ISR Delivery)    │
│  3. Gamification Engine (XP Ledger, Quadratic Leveling, Anti-Cheat Caps) │
│  4. Dual-Gateway Billing: Stripe (Global) + Razorpay (India UPI/Cards)   │
│  5. Redis Rate-Limiting, Idempotency & Public Note Cache                 │
│  6. Global Community Feed & Note Forking / Cloning Engine                │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Necessity Breakdown

| Component | Execution Tier | Why It Belongs Here |
| :--- | :---: | :--- |
| **Numerical Solvers (34 Algorithms)** | **Client-Side** | Running polynomial roots, Runge-Kutta iterations, or matrix inversion on the server adds round-trip latency and creates DDoS vectors. Client-side WebWorkers compute these in $<15\text{ms}$ at zero server compute cost. |
| **Whiteboard & Handwriting OCR** | **Client-Side** | On-device inference taps W3C Native OS neural engines and local WebAssembly. Streaming high-frequency stylus vector coordinates to a backend would saturate network bandwidth. |
| **Draft Note Editing** | **Client-Side** | Kept in local IndexedDB/`localStorage` so typing is never blocked by poor network connectivity. |
| **Public Note Hosting (Notion-Style)** | **Backend** | Notes published to the web require public URLs (`/p/[slug]`), persistent storage, SEO indexability, social OpenGraph image cards, and read-only interactive sandboxing. |
| **Authentication & Profiles** | **Backend** | User credentials, password hashing (Argon2 / bcrypt), OAuth handshakes, and session security require a trusted server environment. |
| **XP & Leveling System** | **Backend** | XP must be validated against anti-cheat rules (e.g. rate-limiting XP awards) and stored in a tamper-proof ledger to ensure fair leaderboard integrity. *(Streaks are excluded per user requirement).* |
| **Subscriptions & Paywalls** | **Backend** | Secret Stripe and Razorpay API keys, signature-verified webhooks, and license entitlement synchronization cannot be entrusted to client JavaScript. |

---

## 3. Backend Technology Stack & Framework Options

The user specified flexibility between **Node/Express, NestJS, or Go**, and chose **Neon PostgreSQL** (or MongoDB) without Supabase. Below is the technical evaluation and architectural design for each:

### 3.1 Primary Database: Neon Serverless PostgreSQL vs. MongoDB

| Evaluation Criteria | **Neon Serverless PostgreSQL (Recommended)** | **MongoDB (Alternative)** |
| :--- | :--- | :--- |
| **Relational Data** | Native Foreign Keys for `users`, `notes`, `xp_transactions`, `subscriptions`. | Manual application-level joins / references (`$lookup`). |
| **Notion Block Trees** | First-class `JSONB` columns with GIN indexing for arbitrary block hierarchies. | Native BSON documents. |
| **Financial & XP Integrity** | **ACID Transactions** prevent double-charging or duplicate XP exploits. | Multi-document transactions are heavier and more complex. |
| **Serverless Autoscaling** | Autoscales to zero when inactive; instant connection pooling via `@neondatabase/serverless`. | Requires MongoDB Atlas cluster tier with fixed monthly baseline. |
| **Branching** | Instant database branching for staging and preview deployments. | Not natively available. |

> **Decision**: **Neon Serverless PostgreSQL** is the optimal choice. It gives the exact relational rigor needed for user accounts, subscriptions, and transactions, while its `JSONB` support provides identical flexibility to MongoDB for unstructured Notion-style note blocks.

---

### 3.2 Backend Framework Architecture Options

#### Option A: Node.js + Express / NestJS with TypeScript & Drizzle ORM (Fastest Time-to-Market)
- **Why this excels**:
  - Full TypeScript code sharing (types, validation schemas via Zod) between Next.js frontend and backend.
  - Native official SDKs for both **Stripe** (`stripe`) and **Razorpay** (`razorpay`).
  - **Drizzle ORM**: Ultra-lightweight, zero overhead, type-safe SQL queries directly over Neon's serverless HTTP connection pool.
  - Familiar ecosystem matching the user's `Nish-E-Service-Backend` patterns.

#### Option B: Go (Golang) with Gin / Fiber + pgx (Maximum Performance & Efficiency)
- **Why this excels**:
  - Single compiled binary with $<20\text{MB}$ RAM footprint.
  - Sub-millisecond execution times for authentication and public note fetching.
  - Built-in goroutines for async background jobs (sending webhook notifications, processing batch XP re-indexing).
  - Official Go SDKs: `github.com/stripe/stripe-go` and Razorpay REST API integrations.

#### Recommended Directory Structure (Modular Clean Architecture)

Whether using **Node/Express/NestJS** or **Go**, the project follows this domain-driven module structure:

```
backend/
├── src/ (or cmd/server/ & internal/ in Go)
│   ├── modules/
│   │   ├── auth/           # Registration, Login, OAuth (Google/GitHub), JWT validation
│   │   ├── users/          # Profile retrieval, preferences, avatar updates
│   │   ├── notes/          # Note CRUD, "Publish to Web", Slug generation, Forking
│   │   ├── public-pages/   # Read-only public note rendering & caching (/p/:slug)
│   │   ├── gamification/   # XP award rules, Level curve calculator, Leaderboards
│   │   └── billing/        # Dual Payment: Stripe (Global) & Razorpay (India)
│   ├── middleware/
│   │   ├── authGuard.js    # JWT token verification & user context injection
│   │   ├── rateLimiter.js  # Redis sliding-window rate limiter
│   │   └── errorHandler.js # Standardized JSON error response handler
│   ├── config/
│   │   ├── db.js           # Neon PostgreSQL connection pool (Drizzle/pgx)
│   │   ├── redis.js        # Redis client (Upstash / Redis)
│   │   └── payment.js      # Stripe & Razorpay client initialization
│   └── server.js           # Application entrypoint & route registration
```

---

### 3.3 Redis Caching & Rate-Limiting Strategy

User confirmed openness to Redis. We deploy **Redis (Upstash Serverless or self-hosted Redis)** for three mission-critical workloads:

1. **Sliding-Window XP Anti-Cheat Rate Limiting**:
   - Keys: `rate:xp:<user_id>:<action_type>:<YYYY-MM-DD>`
   - Ensures an automated bot cannot trigger 1,000 solver runs to farm infinite XP.
2. **High-Traffic Public Note Caching**:
   - Keys: `cache:note:<public_slug>` (TTL: 120 seconds).
   - Serves trending/viral published notes directly from in-memory cache in $<5\text{ms}$ without touching PostgreSQL.
3. **Webhook Idempotency Protection**:
   - Keys: `idempotency:payment:<event_id>` (TTL: 24 hours).
   - Prevents duplicate webhook events from Stripe or Razorpay from double-crediting user subscriptions.

---

### 3.4 Multi-Project VPS & Docker Containerization Architecture (Flat-Rate Billing)

To prevent escalating cloud bills and unpredictable serverless usage fees, NETZ is architected to deploy on an **affordable, single Linux VPS** (e.g., Hetzner Cloud CX22/CPX21 @ €3.79–€7.00/mo, Contabo VPS S @ €4.50/mo for 4 vCPU/8GB RAM, or DigitalOcean Droplet) hosting **three co-located production applications**:

1. **NETZ Backend / Full-Stack Next.js**: API routes, Notion-style public notes hosting (`/p/[slug]`), and XP ledger.
2. **Signaturely Service**: Digital signature application backend / microservice.
3. **Discord Application / Bot**: Discord bot runtime, event handlers, and webhook receiver.

#### Architectural Topology:
```
                               Internet (HTTPS: 443 / HTTP: 80)
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                      AFFORDABLE LINUX VPS (e.g. 4GB - 8GB RAM, Ubuntu 24.04)             │
│                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                     CADDY REVERSE PROXY (Automated Let's Encrypt SSL)             │  │
│  └──────┬───────────────────────────────────┬───────────────────────────────────┬────┘  │
│         │ (api.netz.app / netz.app)         │ (signaturely.domain.com)          │       │
│         ▼                                   ▼                                   ▼       │
│  ┌──────────────┐                   ┌──────────────┐                   ┌──────────────┐ │
│  │ netz-app     │                   │ signaturely  │                   │ discord-app  │ │
│  │ (Port 3000)  │                   │ (Port 4000)  │                   │ (Bot Worker) │ │
│  └──────┬───────┘                   └──────┬───────┘                   └──────┬───────┘ │
│         │                                  │                                  │         │
│         ├──────────────────────────────────┴──────────────────────────────────┤         │
│         ▼                                                                     ▼         │
│  ┌───────────────────────────────┐                   ┌───────────────────────────────┐  │
│  │    SHARED REDIS CONTAINER     │                   │  POSTGRESQL 16 CONTAINER      │  │
│  │    redis:7-alpine             │                   │  postgres:16-alpine           │  │
│  │  • DB 0 / netz:* (XP & Cache) │                   │  (Or external Neon DB pool)   │  │
│  │  • DB 1 / sig:* (Sessions)    │                   │  • Persistent Docker Volume   │  │
│  │  • DB 2 / discord:* (State)   │                   │  • Automated nightly pg_dump  │  │
│  └───────────────────────────────┘                   └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Multi-Tenant Docker Compose Configuration (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  # --------------------------------------------------------------------------
  # 1. Reverse Proxy & Auto-SSL
  # --------------------------------------------------------------------------
  caddy:
    image: caddy:2-alpine
    container_name: caddy-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - app-network

  # --------------------------------------------------------------------------
  # 2. Shared In-Memory Cache & Rate Limiter
  # --------------------------------------------------------------------------
  redis:
    image: redis:7-alpine
    container_name: shared-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - app-network
    deploy:
      resources:
        limits:
          memory: 300M

  # --------------------------------------------------------------------------
  # 3. Primary Relational Database (Self-Hosted with $0 External Fees)
  # --------------------------------------------------------------------------
  postgres:
    image: postgres:16-alpine
    container_name: shared-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-netz_admin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-netz_production}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - app-network
    deploy:
      resources:
        limits:
          memory: 1024M

  # --------------------------------------------------------------------------
  # 4. Project A: NETZ Application & API
  # --------------------------------------------------------------------------
  netz-app:
    build:
      context: ./Netz
      dockerfile: Dockerfile
    container_name: netz-app
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/netz_production
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      JWT_SECRET: ${NETZ_JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}
      RAZORPAY_KEY_SECRET: ${RAZORPAY_KEY_SECRET}
    networks:
      - app-network
    depends_on:
      - postgres
      - redis
    deploy:
      resources:
        limits:
          memory: 1200M

  # --------------------------------------------------------------------------
  # 5. Project B: Signaturely Service
  # --------------------------------------------------------------------------
  signaturely:
    build:
      context: ../signaturely
      dockerfile: Dockerfile
    container_name: signaturely-service
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 4000
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/1
    networks:
      - app-network
    depends_on:
      - redis
    deploy:
      resources:
        limits:
          memory: 512M

  # --------------------------------------------------------------------------
  # 6. Project C: Discord Bot Application
  # --------------------------------------------------------------------------
  discord-app:
    build:
      context: ../discord-app
      dockerfile: Dockerfile
    container_name: discord-bot
    restart: unless-stopped
    environment:
      DISCORD_BOT_TOKEN: ${DISCORD_BOT_TOKEN}
      DISCORD_CLIENT_ID: ${DISCORD_CLIENT_ID}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/2
    networks:
      - app-network
    depends_on:
      - redis
    deploy:
      resources:
        limits:
          memory: 256M

networks:
  app-network:
    driver: bridge

volumes:
  caddy_data:
  caddy_config:
  redis_data:
  postgres_data:
```

#### Reverse Proxy Routing Configuration (`Caddyfile`)

```caddyfile
# NETZ Public Domain & Notion-Style Pages
netz.yourdomain.com {
    reverse_proxy netz-app:3000
    encode gzip zstd
}

# Signaturely Application Domain
signaturely.yourdomain.com {
    reverse_proxy signaturely:4000
    encode gzip zstd
}

# Discord Webhook / Dashboard (Optional)
discord.yourdomain.com {
    reverse_proxy discord-app:5000
    encode gzip zstd
}
```

#### VPS Resource Budget & Safety Mechanisms

| Container Service | Recommended Memory Allocation | Purpose |
| :--- | :---: | :--- |
| **Caddy Proxy** | ~50 MB | Low-overhead SSL termination & HTTP/3 reverse proxy |
| **Shared Redis** | ~200 MB (Hard limit 256MB) | XP rate limiting, cache, webhook idempotency |
| **PostgreSQL 16** | ~600 MB - 1,024 MB | Relational state, JSONB notes, ACID transactions |
| **NETZ App (Next.js/API)** | ~800 MB - 1,200 MB | Node.js runtime, SSR / ISR public page delivery |
| **Signaturely** | ~300 MB - 512 MB | Signature processing microservice |
| **Discord Application** | ~150 MB - 256 MB | Bot websocket gateway & background worker |
| **Host OS & Buffer** | ~600 MB | Linux kernel, Docker daemon, SSH |
| **Total Target VPS** | **~4 GB RAM (or 8 GB)** | **Contabo VPS S / Hetzner CPX21: ~$4 - $7 / month flat** |

> [!TIP]
> **Linux Swap Memory Safeguard**: On a 4GB VPS, configure a **4GB swapfile** (`fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`). This guarantees that during traffic surges (e.g. Next.js ISR page revalidation + Discord bot bursts), the Linux kernel will never trigger an Out-Of-Memory (OOM) killer process.

---

## 4. Complete Relational Database Schema (PostgreSQL DDL)

Here is the production-ready PostgreSQL DDL schema tailored for **Neon**:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS & CREDENTIALS TABLE (Standalone Auth - No Supabase Dependency)
-- ============================================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- NULL for pure OAuth users
    auth_provider TEXT NOT NULL DEFAULT 'local' CHECK (auth_provider IN ('local', 'google', 'github')),
    oauth_id TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_oauth ON public.users(auth_provider, oauth_id);

-- ============================================================================
-- 2. USER PROFILES TABLE (Identity & Gamification)
-- ============================================================================
CREATE TABLE public.profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'Netz Scholar',
    avatar_url TEXT,
    bio TEXT DEFAULT '',
    
    -- Gamification Metrics (Excluding Streaks)
    total_xp BIGINT NOT NULL DEFAULT 0,
    current_level INTEGER NOT NULL DEFAULT 1,
    rank_title TEXT NOT NULL DEFAULT 'Novice Calculator',
    
    -- SaaS Tier & Entitlements
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro_monthly', 'pro_yearly', 'lifetime')),
    public_notes_quota INTEGER NOT NULL DEFAULT 2, -- Free: 2, Pro: 10, Lifetime: 60
    
    -- Device Preferences
    preferences JSONB NOT NULL DEFAULT '{
        "theme": "dark",
        "precision": 4,
        "defaultUnit": "Unit 1",
        "soundEffects": true
    }'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_total_xp ON public.profiles(total_xp DESC);

-- ============================================================================
-- 3. NOTES TABLE (Local Drafts & Notion-Style Published Pages)
-- ============================================================================
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Math Note',
    subtitle TEXT DEFAULT '',
    tags TEXT[] NOT NULL DEFAULT '{}',
    
    -- Notion Block Structure Stored as JSONB
    -- Contains: [{ id, type: 'heading1'|'paragraph'|'math'|'quiz'|'widget', content, ... }]
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Notion-Style Public Web Hosting Flags
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    public_slug TEXT UNIQUE, -- e.g., 'numerical-methods-roots-derivation-a89c'
    published_at TIMESTAMPTZ,
    
    -- Engagement Metrics
    view_count INTEGER NOT NULL DEFAULT 0,
    fork_count INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_public_slug ON public.notes(public_slug) WHERE is_public = TRUE;
CREATE INDEX idx_notes_tags ON public.notes USING GIN(tags);

-- ============================================================================
-- 4. NOTE FORKS AUDIT TABLE (Attribution & Virality Tracking)
-- ============================================================================
CREATE TABLE public.note_forks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    forked_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    forked_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_forks_source ON public.note_forks(source_note_id);

-- ============================================================================
-- 5. XP TRANSACTION LEDGER (Anti-Cheat & Activity Audit)
-- ============================================================================
CREATE TABLE public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'ALGORITHM_SOLVE',
        'QUIZ_COMPLETED_CORRECT',
        'NOTE_CREATED',
        'NOTE_PUBLISHED',
        'CAS_DERIVATION',
        'WHITEBOARD_EVAL'
    )),
    xp_awarded INTEGER NOT NULL CHECK (xp_awarded > 0),
    client_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_xp_user_action_time ON public.xp_transactions(user_id, action_type, client_timestamp);

-- ============================================================================
-- 6. UNIFIED DUAL-GATEWAY SUBSCRIPTIONS TABLE (Stripe & Razorpay)
-- ============================================================================
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Gateway Provider
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'razorpay')),
    
    -- Stripe Identifiers
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    
    -- Razorpay Identifiers
    razorpay_customer_id TEXT,
    razorpay_subscription_id TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    
    tier TEXT NOT NULL CHECK (tier IN ('pro_monthly', 'pro_yearly', 'lifetime')),
    status TEXT NOT NULL CHECK (status IN ('active', 'trailing', 'past_due', 'canceled', 'unpaid', 'completed')),
    
    currency TEXT NOT NULL DEFAULT 'USD', -- 'USD', 'INR', 'EUR'
    amount_paid INTEGER NOT NULL DEFAULT 0, -- in cents or paise
    
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_razorpay_sub ON public.subscriptions(razorpay_subscription_id);
CREATE INDEX idx_subscriptions_razorpay_order ON public.subscriptions(razorpay_order_id);
```

---

## 5. Notion-Style Public Notes Hosting Engine

### 5.1 Why Custom Subdomains Are Avoided & How Notion Actually Does It

Hosting every user note on an isolated subdomain (e.g. `note-123.netz.app` or `user.netz.app`) introduces high operational overhead:
- Wildcard SSL certificate limits and slow DNS propagation.
- Subdomain isolation destroys shared cookies and single-sign-on (SSO).
- Browser CORS and cross-origin security barriers for embedded solvers.

**The Notion Architectural Model**:
Notion hosts published pages on clean path routes (`notion.so/[page-slug]` or `[workspace].notion.site/[slug]`), backed by **Edge-cached Server-Side Pre-rendering**.

For NETZ, we implement:
- **Clean Canonical URL**: `https://netz.app/p/[slug]` (e.g., `https://netz.app/p/newton-raphson-convergence-guide-8xf4`)
- **Vanity URL (Pro Tier)**: `https://netz.app/@username/[slug]`

### 5.2 The Publishing Workflow

```
[Note Editor] ──► User clicks "Share & Publish"
                       │
                       ▼
             [NoteShareModal.js]
                       │
         (Toggle "Publish to Web" = ON)
                       │
                       ▼
             [Check User Quota Limit]
             • Free Tier: Max 2 public notes
             • Pro Tier:  Max 10-60 public notes
                       │
                       ▼
       [POST /api/notes/publish]
       • Generates URL slug: slugify(title) + '-' + nanoid(6)
       • Takes immutable snapshot of current blocks JSONB
       • Sets `is_public = true` in Neon DB
       • Caches in Redis: `SET cache:note:[slug] [payload]`
       • Awards +50 XP to author
                       │
                       ▼
       [Edge Revalidation via `revalidatePath('/p/[slug]')`]
                       │
                       ▼
   Published Live at: https://netz.app/p/bisection-method-masterclass-a7x9
```

### 5.3 Next.js App Router Public Route (`src/app/p/[slug]/page.js`)

Public pages are served via Next.js ISR (Incremental Static Regeneration) fetching from the backend API:

```jsx
// src/app/p/[slug]/page.js
import { notFound } from 'next/navigation';
import PublicNoteViewer from './components/PublicNoteViewer';

export const revalidate = 60; // Cache for 60 seconds at Edge CDN

export async function generateMetadata({ params }) {
  const res = await fetch(`${process.env.BACKEND_API_URL}/api/public/notes/${params.slug}`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) return { title: 'Note Not Found - NETZ' };
  
  const note = await res.json();
  return {
    title: `${note.title} | NETZ Math Workspace`,
    description: note.subtitle || `Interactive math note by ${note.authorName} with live algorithm widgets.`,
    openGraph: {
      title: note.title,
      description: note.subtitle,
      url: `https://netz.app/p/${params.slug}`,
      siteName: 'NETZ',
      images: [{ url: `https://netz.app/api/og/note?title=${encodeURIComponent(note.title)}` }],
    },
  };
}

export default async function PublicPublishedNotePage({ params }) {
  const res = await fetch(`${process.env.BACKEND_API_URL}/api/public/notes/${params.slug}`, {
    next: { revalidate: 60 }
  });

  if (!res.ok) notFound();
  const note = await res.json();

  return <PublicNoteViewer note={note} />;
}
```

### 5.4 The "Duplicate / Fork to My Netz" Viral Loop

Inside `PublicNoteViewer.js`, visitors get:
1. **Interactive Solver Widgets**: Visitors can modify parameters (e.g. interval $[a, b]$, function $f(x)$) and test the calculation immediately without modifying the author's note.
2. **Interactive Quiz Blocks**: Visitors can select answers, test numeric tolerance, and view step-by-step KaTeX explanations.
3. **Sticky Top Action Header**:
   - `[ Duplicate Note / Save to My Notebook ]` button.
   - If logged in: Clones the note blocks directly into their cloud account (`POST /api/notes/fork`).
   - If not logged in: Loads the note blocks into their local browser `localStorage` and prompts a frictionless sign-up modal ("Save your work to cloud & earn +30 XP").

---

## 6. Gamification: XP & Leveling Engine (No Streaks)

Per the user's explicit specification, **streaks are omitted**, focusing the entire gamification loop on academic performance, problem solving, and community sharing.

### 6.1 XP Allocation Table & Anti-Cheat Rules

To prevent users from writing automated scripts that farm infinite XP, all XP allocations pass through server-side rate limits and validation:

| Trigger Action | XP Value | Verification & Anti-Cheat Daily Cap |
| :--- | :---: | :--- |
| **Algorithm Calculation Run** | **+15 XP** | Maximum 10 runs per day ($150\text{ XP}$ max). Must execute a valid mathematical convergence cycle. |
| **Quiz Block Answered Correctly** | **+25 XP** | Maximum 10 quizzes per day ($250\text{ XP}$ max). User must pass numerical tolerance or correct MCQ. |
| **Interactive CAS Derivation** | **+10 XP** | Maximum 5 operations per day ($50\text{ XP}$ max). Triggers on symbolic differentiation or root finding. |
| **Create & Save a Study Note** | **+30 XP** | Maximum 3 notes per day ($90\text{ XP}$ max). Note must contain at least 3 distinct content blocks. |
| **Publish a Public Note to Web** | **+50 XP** | Maximum 2 publishes per day ($100\text{ XP}$ max). Note must have passed content length criteria. |
| **Handwritten Math Auto-Eval** | **+20 XP** | Maximum 3 whiteboard evaluations per day ($60\text{ XP}$ max). Triggers when `=` gesture computes result. |
| **Daily XP Theoretical Maximum** | **710 XP** | Ensures steady, meaningful progression that reflects genuine study time. |

### 6.2 Mathematical Leveling Formula & Ranks

Leveling is governed by a smooth quadratic progression curve:

$$\text{Level} = \left\lfloor \sqrt{\frac{\text{Total XP}}{75}} \right\rfloor + 1$$

$$\text{XP Required for Level } L = 75 \times (L - 1)^2$$

$$\text{XP Needed for Next Level} = 75 \times L^2 - \text{Total XP}$$

| Level Range | Rank Title | Badge Color | Unlocks / Perks |
| :---: | :--- | :--- | :--- |
| **1 – 4** | **Novice Calculator** | Slate Gray | Basic Solvers, Local Notes |
| **5 – 9** | **Math Explorer** | Emerald Green | Quiz Creation, 2 Public Notes |
| **10 – 19** | **Algorithm Architect** | Cyan Blue | Custom Color Themes, Code Export |
| **20 – 34** | **Matrix Master** | Purple Indigo | Priority Community Showcase |
| **35 – 49** | **Gauss Disciple** | Rose Gold | Gold Profile Ring, Verified Creator Tag |
| **50+** | **Fields Pioneer** | Radiant Diamond | Lifetime Platform Hall of Fame |

---

## 7. Dual Payment Gateway Architecture: Stripe + Razorpay

To maximize conversions and minimize transaction costs, NETZ deploys a **Geographic Dual-Gateway Engine**:
- **Stripe**: International users (North America, Europe, Global) paying in USD/EUR with Cards, Apple Pay, Google Pay.
- **Razorpay**: Indian users paying in INR (₹) via UPI (Google Pay, PhonePe, Paytm), Netbanking, and Indian credit/debit cards (substantially lower 2% processing fees vs international card fees).

```
                            USER CHECKOUT ROUTING
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
          [Country == 'IN' / INR]         [International / USD]
                     │                               │
                     ▼                               ▼
            ┌─────────────────┐             ┌─────────────────┐
            │    RAZORPAY     │             │     STRIPE      │
            │  (UPI / Cards)  │             │ (Cards/Wallets) │
            └────────┬────────┘             └────────┬────────┘
                     │                               │
        Webhook: payment.captured        Webhook: checkout.session.completed
                     │                               │
                     └───────────────┬───────────────┘
                                     ▼
                   ┌───────────────────────────────────┐
                   │    UNIFIED SUBSCRIPTION SERVICE   │
                   │ • Update `subscriptions` record   │
                   │ • Upgrade `profiles.tier` to 'pro'│
                   │ • Set `public_notes_quota` = 10   │
                   │ • Award +200 Supporter XP Bonus   │
                   └───────────────────────────────────┘
```

### 7.1 Tier Pricing Matrix

| Tier | Global Price (Stripe) | India Price (Razorpay) | Public Notes Quota | Key Entitlements |
| :--- | :---: | :---: | :---: | :--- |
| **Free** | **$0** | **₹0** | **2 Notes** | Standard Solvers, Local Notes, Community Quizzes |
| **Pro Monthly** | **$2.99 / mo** | **₹199 / mo** | **10 Notes** | Quiz Creator, Vector/PDF Export, 100% Ad-Free |
| **Pro Yearly** | **$19.99 / yr** | **₹1,499 / yr** | **60 Notes** | Everything in Pro + Priority Cloud Sync |
| **Lifetime Access**| **$49.99 once** | **₹3,499 once** | **60 Notes** | Lifetime Access + Hall of Fame Badge |

### 7.2 Razorpay Integration Spec (Matching Nish-E-Service-Backend Standard)

#### 1. Create Order (`POST /api/billing/razorpay/create-order`)
```javascript
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createRazorpayOrder(req, res) {
  const { tier, userId } = req.body;
  const amountInPaise = tier === 'pro_monthly' ? 19900 : tier === 'pro_yearly' ? 149900 : 349900;

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `rcpt_${userId.slice(0, 8)}_${Date.now()}`,
    notes: { userId, tier }
  });

  res.json({ orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID });
}
```

#### 2. Verify Payment Signature (`POST /api/billing/razorpay/verify`)
```javascript
const crypto = require('crypto');

function verifyRazorpaySignature(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, tier } = req.body;

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid payment signature' });
  }

  // Activate Pro Subscription in Neon DB
  await db.transaction(async (tx) => {
    await tx.insert(subscriptions).values({
      userId,
      provider: 'razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      tier,
      status: 'active',
      currency: 'INR',
      amountPaid: req.body.amount,
      currentPeriodEnd: calculatePeriodEnd(tier)
    });

    await tx.update(profiles)
      .set({ tier, publicNotesQuota: tier === 'pro_monthly' ? 10 : 60 })
      .where(eq(profiles.userId, userId));
  });

  res.json({ success: true, message: 'Subscription activated' });
}
```

---

## 8. Complete REST API Endpoint Specification

| Method | Endpoint Path | Auth Required | Description & Payload |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | No | `{ email, password, username }` $\rightarrow$ creates user + profile, returns JWT. |
| `POST` | `/api/auth/login` | No | `{ email, password }` $\rightarrow$ verifies Argon2 hash, sets secure HTTP-only cookie. |
| `POST` | `/api/auth/oauth/google` | No | `{ code }` $\rightarrow$ exchanges OAuth token with Google, creates/logs in user. |
| `POST` | `/api/auth/logout` | Yes | Clears session cookie and invalidates token in Redis. |
| `GET` | `/api/user/profile` | Yes | Returns authenticated profile, XP, level, rank, and subscription tier. |
| `PATCH` | `/api/user/profile` | Yes | Updates display name, bio, avatar URL, or UI preferences. |
| `GET` | `/api/notes` | Yes | Lists user's private and public cloud-synced notes. |
| `POST` | `/api/notes` | Yes | Creates or cloud-syncs a new note document. |
| `PATCH` | `/api/notes/:id` | Yes | Saves updated block array JSONB for a specific note. |
| `DELETE` | `/api/notes/:id` | Yes | Soft or hard deletes a note owned by the authenticated user. |
| `POST` | `/api/notes/publish` | Yes | Publishes note to web, checks quota, assigns unique slug, awards +50 XP. |
| `POST` | `/api/notes/unpublish` | Yes | Toggles `is_public = false`, revalidates `/p/[slug]`. |
| `GET` | `/api/public/notes/:slug` | No | Public endpoint returning public note blocks and author profile for ISR. |
| `POST` | `/api/notes/fork` | Yes | Clones a public note into the caller's private note library (+1 fork count). |
| `POST` | `/api/gamification/award-xp`| Yes | Award XP with Redis sliding-window anti-cheat checks. |
| `GET` | `/api/gamification/leaderboard`| No | Top 50 scholars ordered by `total_xp DESC` (excluding streaks). |
| `POST` | `/api/billing/stripe/checkout`| Yes | `{ tier }` $\rightarrow$ creates Stripe Checkout Session URL. |
| `POST` | `/api/billing/stripe/webhook` | No (Stripe Sig) | Processes Stripe subscription lifecycle webhooks. |
| `POST` | `/api/billing/razorpay/order`| Yes | `{ tier }` $\rightarrow$ creates Razorpay Order ID for Indian checkout. |
| `POST` | `/api/billing/razorpay/verify`| Yes | Verifies Razorpay HMAC signature and activates Pro subscription. |

---

## 9. Phased Implementation Roadmap

```
Phase 1: DB & Auth Engine ──► Phase 2: Notion Public Notes ──► Phase 3: Gamification Engine ──► Phase 4: Dual Stripe & Razorpay
       (Days 1 - 3)                    (Days 4 - 6)                    (Days 7 - 9)                    (Days 10 - 12)
```

### Phase 1: Database Setup, VPS Docker Infrastructure & Auth Engine (Days 1–3)
- [ ] Prepare `docker-compose.yml` on the Linux VPS with containerized Redis (`redis:7-alpine`), PostgreSQL (`postgres:16-alpine` or Neon DB link), and Caddy reverse proxy.
- [ ] Configure network isolation and memory limits to support **NETZ**, **Signaturely**, and the **Discord application** concurrently.
- [ ] Run PostgreSQL DDL migration (`users`, `profiles`, `notes`, `xp_transactions`, `subscriptions`).
- [ ] Setup Redis connection pool with database separation (`DB 0` for Netz, `DB 1` for Signaturely, `DB 2` for Discord).
- [ ] Build Auth Module: `/api/auth/register`, `/api/auth/login`, and JWT middleware with Argon2 password hashing.
- [ ] Connect frontend `useAuthStore.js` and login/signup modal components.

### Phase 2: Notion-Style Public Notes Hosting Engine (Days 4–6)
- [ ] Implement `/api/notes/publish` with nanoid slug generation and quota verification.
- [ ] Create dynamic Next.js App Router path `src/app/p/[slug]/page.js` with ISR (`revalidate = 60`) and dynamic OpenGraph card generator.
- [ ] Build `PublicNoteViewer.js` rendering interactive read-only blocks (embedded solvers and quiz widgets).
- [ ] Implement "Duplicate / Fork to My Notebook" button with local-first fallback.

### Phase 3: XP & Leveling Engine + Profile Dashboard (Days 7–9)
- [ ] Implement `/api/gamification/award-xp` endpoint with Redis sliding-window anti-cheat limits.
- [ ] Connect solver execution, quiz validation, and note publishing to optimistic XP notifications.
- [ ] Replace `src/app/(Primary.pages)/Profile/page.js` (`<UnderConstruction />`) with the live stats card, level progress bar, rank badge display, and published notes manager.
- [ ] Build global community leaderboard page / tab.

### Phase 4: Dual Payment Gateway (Stripe + Razorpay) (Days 10–12)
- [ ] Integrate Stripe Checkout for global users (`/api/billing/stripe/checkout`).
- [ ] Integrate Razorpay Order creation and HMAC signature verification (`/api/billing/razorpay/verify`) using established patterns from `Nish-E-Service-Backend`.
- [ ] Implement subscription entitlement enforcement (Free: 2 public notes max; prompt upgrade modal upon 3rd publish).

---

## 10. Testing & Verification Checklist

1. **Neon PostgreSQL Verification**:
   - Run DDL migrations on Neon.
   - Verify connection pooling performance via `@neondatabase/serverless`.
2. **Auth Verification**:
   - Register user via email/password and OAuth.
   - Verify `users` and `profiles` records populate atomically.
3. **Public Note Hosting Verification**:
   - Create a note with KaTeX equations and a Bisection Method widget.
   - Click "Publish to Web" and visit `http://localhost:3000/p/[slug]` in an incognito window.
   - Verify page renders in $<100\text{ms}$ with functional interactive widget and correct social metadata.
   - Test "Duplicate Note" from an unauthenticated visitor session.
4. **Gamification Verification**:
   - Complete 3 numerical solver runs and 1 quiz block.
   - Verify XP counter increments optimistically and persists in `xp_transactions`.
   - Test anti-cheat limit: Verify that the 11th solver run in a single day does not award additional XP.
   - Verify that advancing past $1,200\text{ XP}$ automatically upgrades rank title to "Math Explorer".
5. **Dual Payment Verification**:
   - Test Razorpay flow with test UPI ID (`success@razorpay`) $\rightarrow$ verify HMAC signature validation and quota upgrade to 10 notes.
   - Test Stripe checkout session $\rightarrow$ verify webhook processes `checkout.session.completed` properly.
