FROM node:22-slim
WORKDIR /app

RUN npm install -g pm2

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
#prenvent crash
CMD ["pm2-runtime", "start", "index.mjs", "--name", "midgard"]