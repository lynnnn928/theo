# Theo · 部署指南

## 架构

```
用户 → Vercel (Next.js Web)  →  Supabase (Auth + Postgres)
                                    ↑
                          Worker (Docker 容器)
                          轮询 tasks 表，执行分析
```

---

## 一、Supabase Auth 配置

在 [Supabase Dashboard](https://supabase.com/dashboard/project/oclbbqoihkoakzuphpsh) 中操作：

1. **Authentication → URL Configuration**
   - **Site URL**: `https://your-vercel-domain.vercel.app`
   - **Redirect URLs**: 添加以下三条
     - `http://localhost:3000/auth/callback`
     - `https://your-vercel-domain.vercel.app/auth/callback`
     - `https://your-vercel-domain.vercel.app`

2. **Authentication → Providers → Email**
   - 确认 **Enable Email provider** 已开启
   - （可选）关闭 "Confirm email" 方便测试

---

## 二、Vercel Web 部署

### 方式 A：Dashboard 导入（推荐）

1. 打开 [vercel.com/new](https://vercel.com/new)
2. Import GitHub 仓库 `lynnnn928/theo`
3. **Root Directory** 设为 `apps/web`
4. Framework Preset 自动识别为 Next.js
5. **Environment Variables** 配置：

| 变量 | 值 |
|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://oclbbqoihkoakzuphpsh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | （Supabase → Settings → API → anon public） |
| `NEXT_PUBLIC_SITE_URL` | `https://your-vercel-domain.vercel.app` |

6. Deploy

### 方式 B：CLI 部署

```bash
npm i -g vercel
cd apps/web
vercel --prod
```

---

## 三、Worker Docker 部署

### 本地 / VPS

```bash
# 在仓库根目录
cp .env.example .env
# 编辑 .env 填入真实凭据

# 构建并启动
docker compose up -d worker

# 查看日志
docker compose logs -f worker

# 停止
docker compose down
```

### 环境变量（.env）

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.oclbbqoihkoakzuphpsh.supabase.co:5432/postgres

NEXT_PUBLIC_SUPABASE_URL=https://oclbbqoihkoakzuphpsh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...（anon key）
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...（service role key）

LLM_PROVIDER=tokendance
LLM_BASE_URL=https://tokendance.space/gateway/v1
LLM_API_KEY=sk-your-tokendance-key
LLM_MODEL_JD=qwen3-max
LLM_MODEL_REPORT=deepseek-v4-pro

SEARCH_PROVIDER=unifuncs
SEARCH_BASE_URL=https://tokendance.space/gateway/unifuncs
SEARCH_API_KEY=sk-your-tokendance-key
```

### 云端部署（Cloud Run / Fly.io / 任意容器平台）

```bash
# 构建镜像
docker build -f apps/worker/Dockerfile -t theo-worker .

# 推送并部署到你的容器平台
# 确保环境变量已配置
```

---

## 四、验证部署

1. **Web**：访问 Vercel URL，注册/登录
2. **创建任务**：粘贴 JD，提交
3. **Worker**：查看 `docker compose logs`，确认拾取任务
4. **报告**：任务完成后，Web 端自动跳转报告页

---

## 五、常用命令

| 操作 | 命令 |
|------|------|
| 本地启动 Web | `pnpm --filter web dev` |
| 本地启动 Worker | `pnpm --filter worker dev` |
| 运行冒烟测试 | `pnpm --filter worker smoke` |
| 重新生成 Prisma | `pnpm --filter @theo/db db:generate` |
| Docker 构建 Worker | `docker compose build` |
| Docker 启动 Worker | `docker compose up -d` |
