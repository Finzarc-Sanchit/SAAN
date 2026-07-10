# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /app

COPY server/package.json server/package-lock.json* ./
RUN npm ci

COPY server/ ./
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S saan && adduser -S saan -G saan

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER saan

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "dist/server.js"]
