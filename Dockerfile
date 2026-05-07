# ---- Build stage ----
FROM node:20-alpine AS builder

# better-sqlite3 needs build tools to compile native bindings
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build-time env vars — must be set before `next build` so static-rendered
# pages embed them in their pre-computed metadata and footer/legal content.
ARG GOOGLE_SITE_VERIFICATION=
ARG BING_SITE_VERIFICATION=
ARG SITE_LEGAL_ENTITY=
ARG SITE_LEGAL_ADDRESS=
ARG SITE_PHONE=
ARG SITE_EMAIL=
ARG SITE_DPO_NAME=
ARG SITE_DPO_EMAIL=
ARG SITE_ORIAS=
ENV GOOGLE_SITE_VERIFICATION=$GOOGLE_SITE_VERIFICATION
ENV BING_SITE_VERIFICATION=$BING_SITE_VERIFICATION
ENV SITE_LEGAL_ENTITY=$SITE_LEGAL_ENTITY
ENV SITE_LEGAL_ADDRESS=$SITE_LEGAL_ADDRESS
ENV SITE_PHONE=$SITE_PHONE
ENV SITE_EMAIL=$SITE_EMAIL
ENV SITE_DPO_NAME=$SITE_DPO_NAME
ENV SITE_DPO_EMAIL=$SITE_DPO_EMAIL
ENV SITE_ORIAS=$SITE_ORIAS

# Generate the legal-doc seed migration with up-to-date hashes before building
RUN npx tsx migrations/seed-legal.ts
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runner

# Native bindings runtime: nothing extra needed at runtime once compiled.
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user (matches INFRA.md convention)
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Bring over the standalone build only — much smaller image
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/migrations ./migrations
COPY --from=builder --chown=nextjs:nodejs /app/src/content ./src/content

# Volume for SQLite database persistence
RUN mkdir -p /data && chown -R nextjs:nodejs /data
VOLUME ["/data"]

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
