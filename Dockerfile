FROM node:22-slim AS base

WORKDIR /app

RUN corepack enable

RUN npm install -g pm2

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

CMD ["pm2-runtime", "start", "index.mjs", "--name", "midgard"]