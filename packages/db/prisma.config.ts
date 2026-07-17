import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

// 加载 monorepo 根目录的 .env（含 DATABASE_URL）
config({ path: new URL('../.env', import.meta.url) })

export default defineConfig({
  datasources: {
    postgresql: {
      // 构建时（Docker/CI）可能没有 DATABASE_URL，用占位符避免报错
      // 运行时由环境变量覆盖
      url: process.env.DATABASE_URL || 'postgresql://build:build@localhost:5432/build',
    },
  },
})
