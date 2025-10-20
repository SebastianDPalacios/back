# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- build ----------
FROM node:20-alpine AS builder
WORKDIR /app
# Copiamos node_modules desde deps
COPY --from=deps /app/node_modules ./node_modules
# ⬅️ IMPORTANTE: copiar package*.json aquí también para que exista al hacer npm run build
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
RUN npm run build

# ---------- run ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# (opcional) Copia package.json solo por referencia
# COPY package*.json ./

EXPOSE 3001

CMD sh -c "npx prisma migrate deploy && npx prisma db seed || true && node dist/index.js"
