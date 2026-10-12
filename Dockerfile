FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Migraties in shell / pre-deploy (Railway): npm run db:migrate
COPY --from=builder /app/database ./database
COPY --from=builder /app/scripts/migrate.mjs ./scripts/migrate.mjs
EXPOSE 4000
CMD ["node", "server.js"]
