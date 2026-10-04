FROM node:22-slim

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

CMD ["pnpm", "docs:dev", "--host", "0.0.0.0"]
