# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

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

# ── Build web app ────────────────────────────────────────────────
COPY app/ app/
RUN cd app && npm install --ignore-scripts && npx vite build

# ── Stage 2: Serve with nginx ────────────────────────────────────
FROM nginx:alpine

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /build/app/dist /usr/share/nginx/html

ENV API_SERVER_URL=http://localhost:3000

EXPOSE 80
