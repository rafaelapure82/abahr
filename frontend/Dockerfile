# ── Stage 1: development ──────────────────────────────────────────────────────
FROM node:20-alpine AS development
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200
CMD ["npm", "run", "dev", "--", "-p", "4200"]

# ── Stage 2: builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 3: production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]
