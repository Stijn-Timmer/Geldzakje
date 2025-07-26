FROM node:20-alpine AS deps
    WORKDIR /app
    RUN npm install -g pnpm
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
FROM deps AS builder
    WORKDIR /app
    COPY . .
    RUN pnpm run prepare
    RUN pnpm prisma generate
    RUN pnpm build
FROM node:20-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    RUN npm install -g pnpm
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
    COPY --from=builder /app/src/lib/server/prisma/generated/libquery** /tmp/prisma-engines/
    COPY --from=builder /app/build ./build
    RUN pnpm install --prod --frozen-lockfile
    EXPOSE 3000
    CMD ["node", "build"]
