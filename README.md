# Theo

> 职业洞察工具 — AI 驱动的 JD 分析与职业档案管理

## 项目结构

```
theo/
├── apps/
│   ├── web/          Next.js App Router（前端 + 薄 API）
│   └── worker/       Node 长驻进程（JD 分析引擎）
├── packages/
│   ├── db/           Prisma schema + client（共享）
│   ├── analysis/     JD 洞察引擎逻辑（共享）
│   ├── types/        共享 TypeScript 类型
│   └── config/       环境配置 / 常量
└── turbo.json        Turborepo 编排
```

## 快速开始

```bash
pnpm install
pnpm dev
```

## 环境变量

复制 `.env.example` 为 `.env`，填入 Supabase / LLM / 搜索工具密钥。

## 技术栈

- **前端**：Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui
- **认证**：Supabase Auth（@supabase/ssr）
- **数据库**：Supabase Postgres + Prisma ORM
- **分析引擎**：Node Worker + LLM + WebSearch
- **部署**：Vercel（web）+ 容器/单机（worker）
- **包管理**：pnpm + Turborepo
