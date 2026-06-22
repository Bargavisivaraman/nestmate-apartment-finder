# syntax=docker/dockerfile:1

# ---- Dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# ---- Builder ----
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder so `prisma generate` and the build never need a live database.
# The real DATABASE_URL / DIRECT_URL are injected at runtime by the host.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# build script runs `prisma generate && next build`.
RUN npm run build

# ---- Runner ----
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Bind to all interfaces. Without this the Next standalone server binds to the
# container hostname and is unreachable behind a load balancer (502s).
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone server output + static assets.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma schema + generated client (engine) for the runtime query layer.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000

# Connects to PostgreSQL (Supabase) via DATABASE_URL provided at runtime.
CMD ["node", "server.js"]
