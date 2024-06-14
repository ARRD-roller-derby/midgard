FROM node:20-slim AS base

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
RUN pnpm deploy:discord

COPY . .

# Copier le fichier .env
COPY .env .env
