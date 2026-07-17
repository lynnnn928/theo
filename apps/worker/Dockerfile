# Theo Worker · Dockerfile
# 单进程 Node Worker，轮询 Supabase PG 分析 JD

FROM node:22-slim

# Prisma 需要 openssl
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# 复制全部源码（.dockerignore 排除 node_modules/.next/.git/.env/apps/web）
COPY . .

# 安装依赖
RUN pnpm install --frozen-lockfile

# 生成 Prisma Client
RUN pnpm --filter @theo/db exec prisma generate

WORKDIR /app/apps/worker
ENV NODE_ENV=production

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
