# Development image for @viteplus/versions.
# The repo is not copied in - compose.yml mounts it at /app, so edits on the host are live.
# Only the dependencies are installed here, into /app/node_modules.
FROM node:24-alpine

# Pinned to the pnpm that wrote pnpm-lock.yaml; override with --build-arg PNPM_VERSION=...
ARG PNPM_VERSION=12.4.1

# pnpm installed through npm rather than Corepack: npm puts pnpm's native binary in place at
# build time, so nothing is fetched on first run, and the image keeps working on Node
# versions that no longer ship Corepack. A global install needs root, so it runs before USER
RUN npm install -g pnpm@${PNPM_VERSION} \
    && npm cache clean --force

# Run as the image's own unprivileged `node` user. Its uid/gid 1000 is the usual id of the
# first user on a Linux host, so files written into the mounted repo (dist/, docs cache)
# stay owned by you there. WORKDIR creates /app owned by it
USER node
WORKDIR /app

# Install the dependencies into the image. Changing package.json or the lockfile needs a
# rebuild: docker compose -f docker/compose.yml up --build -V
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# VitePress dev server
EXPOSE 5173

CMD ["pnpm", "docs:dev", "--host", "0.0.0.0", "--port", "5173"]
