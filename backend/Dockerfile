# Picsellio – Fastify backend (Node + Prisma)
FROM node:20-alpine AS base

# Build stage: Prisma schema database/ içinde olduğu için context proje kökü olacak
FROM base AS builder
WORKDIR /app

# Önce database (Prisma schema) ve backend kopyala
COPY database ./database
COPY backend/package.json backend/package-lock.json* ./backend/
WORKDIR /app/backend
RUN npm ci 2>/dev/null || npm install

COPY backend .
RUN npx prisma generate --schema=../database/prisma/schema.prisma
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

COPY --from=builder /app/database ./database
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
# Statik dosyalar için boş public (runtime'da mount veya volume ile doldurulabilir)
RUN mkdir -p public/uploads && chown -R fastify:nodejs public

USER fastify
EXPOSE 4000
ENV PORT=4000

# İlk açılışta migration (schema database/ içinde)
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./database/prisma/schema.prisma 2>/dev/null; node dist/index.js"]
