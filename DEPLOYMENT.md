# Roshteh (روشتة) — Production Deployment & Operations Guide

**System:** Roshteh (روشتة) — Professional Offline-First Prescription Platform  
**Target Environment:** Node.js 20+ / Docker / Standalone Clinic Server / Cloud Host  

---

## 1. Overview & Architecture

Roshteh is designed with a **Dual-Tier Architecture**:
1. **Clinic Client Tier (100% Offline-First):** Runs in the doctor's web browser, local kiosk, or tablet utilizing **Dexie.js IndexedDB**. All clinical operations (searching drugs, composing prescriptions, generating PDFs, editing templates) require **zero internet connectivity**.
2. **Central Tier (Optional / On-Demand):** Provides central medicine catalog updates, crowdsourced medicine suggestion review, and incremental change publishing powered by **PostgreSQL** and Next.js Route Handlers (`/api/v1/...`).

---

## 2. Production Environment Variables (`.env.production`)

Configure the following environment variables for deployment:

```bash
# Node Environment
NODE_ENV=production
PORT=3000

# Central PostgreSQL Connection (Optional — defaults to persistent in-memory fallback if omitted)
DATABASE_URL=postgresql://roshteh_admin:secure_password@localhost:5432/roshteh_central

# System Base URL (Used for API routing and manifest generation)
NEXT_PUBLIC_APP_URL=https://roshteh.clinic.local

# Security & Secret Key (Used for session integrity if authentication is enabled)
NEXTAUTH_SECRET=your_32_character_cryptographically_secure_random_key
```

---

## 3. Production Build & Deployment Options

### Option A: Standard Node.js Standalone Server

```bash
# 1. Install production dependencies
pnpm install --frozen-lockfile

# 2. Run TypeScript strict type-check
npx tsc --noEmit

# 3. Execute full automated test suite
pnpm test

# 4. Compile optimized production build
pnpm build

# 5. Start the production server
pnpm start
```

### Option B: Docker Container Deployment

Create a `Dockerfile` in the project root:

```dockerfile
# Multi-stage Next.js Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies Stage
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder Stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm build

# Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t roshteh:1.0.0 .
docker run -d -p 3000:3000 --name roshteh-clinic roshteh:1.0.0
```

---

## 4. Progressive Web App (PWA) & Offline Desktop Installation

Doctors can install Roshteh as a standalone desktop application directly from the browser without needing Electron:

1. Open Google Chrome, Microsoft Edge, or Safari at your clinic's URL (e.g. `http://localhost:3000` or `https://roshteh.clinic`).
2. Click the **Install App** icon (or Settings -> "Install Roshteh" / "تثبيت روشتة").
3. Roshteh launches in a dedicated window without browser navigation chrome (`display: standalone`).
4. The Service Worker (`/sw.js`) caches the application shell and static assets for seamless offline operation.

---

## 5. Security & Clinical Data Protection

1. **HTTP Security Headers:**
   Configured in `next.config.ts`:
   - `X-Frame-Options: SAMEORIGIN` (Clickjacking prevention).
   - `X-Content-Type-Options: nosniff` (MIME-sniffing prevention).
   - `X-XSS-Protection: 1; mode=block` (Reflected XSS filter).
   - `Referrer-Policy: origin-when-cross-origin`.
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
2. **Local Storage Isolation:**
   - Patient names, ages, diagnoses, and custom doctor formulas reside exclusively in the client's IndexedDB.
   - Central sync endpoints (`/api/v1/medicines/...`) only transfer global drug metadata; **patient data is never sent to the cloud**.
