# stage 1 dependency stage
FROM node:22-alpine AS deps
# libc6-compat is required by Next.js/Node on Alpine, openssl is required by Prisma
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# enable pnpm
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
# innstall all dependencies needed for build
RUN pnpm install --frozen-lockfile

# stage 2 builf the app
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# generate prisma client before building nextjs
RUN pnpm dlx prisma generate
# build nextjs app 
RUN pnpm run build

# stage 3 production stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# openssl required at runtime by prisma to talk to postgres
RUN apk add --no-cache openssl

# create a non root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# copy public folder
COPY --from=builder /app/public ./public

# copy only the files nextjs needs to run
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]