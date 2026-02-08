# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Native deps for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /build

# ── Build submodule libraries (needed by web app as file: deps) ──
COPY submodules/panoplia.peer/package.json submodules/panoplia.peer/package-lock.json submodules/panoplia.peer/
COPY submodules/panoplia.peer/tsconfig.json submodules/panoplia.peer/tsup.config.ts submodules/panoplia.peer/
COPY submodules/panoplia.peer/src submodules/panoplia.peer/src
RUN cd submodules/panoplia.peer && npm ci && npm run build

COPY submodules/panoplia.defi/package.json submodules/panoplia.defi/package-lock.json submodules/panoplia.defi/
COPY submodules/panoplia.defi/tsconfig.json submodules/panoplia.defi/tsup.config.ts submodules/panoplia.defi/
COPY submodules/panoplia.defi/src submodules/panoplia.defi/src
RUN cd submodules/panoplia.defi && npm ci && npm run build

# ── Build MPC server ─────────────────────────────────────────────
COPY submodules/panoplia.mpc/package.json submodules/panoplia.mpc/package-lock.json submodules/panoplia.mpc/
RUN cd submodules/panoplia.mpc && npm ci
COPY submodules/panoplia.mpc/tsconfig.json submodules/panoplia.mpc/
COPY submodules/panoplia.mpc/src submodules/panoplia.mpc/src
RUN cd submodules/panoplia.mpc && npm run build

# ── Build web app ────────────────────────────────────────────────
COPY app/package.json app/
COPY app/ app/
RUN cd app && npm install --ignore-scripts && npx vite build

# ── Stage 2: Production ──────────────────────────────────────────
FROM node:20-alpine

# Runtime native deps for better-sqlite3
RUN apk add --no-cache libstdc++

WORKDIR /app

# Copy compiled MPC server + production node_modules
COPY --from=builder /build/submodules/panoplia.mpc/dist ./dist
COPY --from=builder /build/submodules/panoplia.mpc/node_modules ./node_modules
COPY --from=builder /build/submodules/panoplia.mpc/package.json ./

# Copy built web app static files
COPY --from=builder /build/app/dist ./public

# Copy production entry point and entrypoint script
COPY docker/serve.mjs ./
COPY docker/entrypoint.sh ./

ENV NODE_ENV=production
ENV PORT=3000
ENV DEMO_MODE=true
ENV DB_PATH=./data/panoplia.db
ENV CORS_ORIGIN=*

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
