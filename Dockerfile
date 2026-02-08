# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /build

# ── Build panoplia.peer library (local copy in libs/) ────────────
COPY libs/panoplia.peer/package.json libs/panoplia.peer/package-lock.json libs/panoplia.peer/
COPY libs/panoplia.peer/tsconfig.json libs/panoplia.peer/tsup.config.ts libs/panoplia.peer/
COPY libs/panoplia.peer/src libs/panoplia.peer/src
RUN cd libs/panoplia.peer && npm ci --ignore-scripts && npm run build

# ── Build panoplia.defi library (local copy in libs/) ────────────
COPY libs/panoplia.defi/package.json libs/panoplia.defi/package-lock.json libs/panoplia.defi/
COPY libs/panoplia.defi/tsconfig.json libs/panoplia.defi/tsup.config.ts libs/panoplia.defi/
COPY libs/panoplia.defi/src libs/panoplia.defi/src
RUN cd libs/panoplia.defi && npm ci --ignore-scripts && npm run build

# ── Build web app ────────────────────────────────────────────────
COPY app/ app/
RUN cd app && npm install && npx vite build

# ── Stage 2: Serve with nginx ────────────────────────────────────
FROM nginx:alpine

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /build/app/dist /usr/share/nginx/html

ENV API_SERVER_URL=http://localhost:3000

EXPOSE 80
