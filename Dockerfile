FROM node:20-slim AS base

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Copier le fichier .env
COPY .env .env

# Exécuter le script de déploiement des commandes Discord
RUN pnpm run deploy:discord

CMD ["pnpm", "start"]
