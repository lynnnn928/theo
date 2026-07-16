import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

// 加载 monorepo 根目录的 .env（含 DATABASE_URL）
config({ path: new URL('../.env', import.meta.url) })

export default defineConfig({
  datasources: {
    postgresql: {
      url: process.env.DATABASE_URL!,
    },
  },
})
