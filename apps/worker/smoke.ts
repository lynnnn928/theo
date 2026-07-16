// S1 链路验证脚本（不依赖 DB，仅测 LLM + Search）
import { config } from '@theo/config'
import { parseJD } from '@theo/analysis/parse-jd'
import { businessSearch } from '@theo/analysis/business-search'
import { generateReport } from '@theo/analysis/generate-report'

const SAMPLE_JD = `
职位：高级前端工程师
公司：字节跳动 - 抖音电商
职责：
- 负责抖音电商核心交易链路的前端开发
- 与产品、设计、后端协作，保障大促活动稳定
要求：
- 本科及以上，3-5 年前端经验
- 精通 React、TypeScript，熟悉 Next.js
- 有大型高并发前端项目经验
- 了解前端性能优化与监控
`

async function main() {
  console.log('=== R1: parseJD ===')
  const parsed = await parseJD(SAMPLE_JD)
  console.log(JSON.stringify(parsed, null, 2))

  console.log('\n=== R2: businessSearch ===')
  const search = await businessSearch(parsed)
  console.log(`sources: ${search.sources.length}, contexts: ${search.contexts.length}`)
  console.log(search.sources.map((s) => `  [${s.id}] ${s.title} — ${s.url}`).join('\n'))

  console.log('\n=== R3: generateReport ===')
  const report = await generateReport(parsed, search)
  console.log(JSON.stringify(report, null, 2))

  console.log('\n✅ S1 pipeline OK')
}

main().catch((e) => {
  console.error('❌ S1 test failed:', e)
  process.exit(1)
})
