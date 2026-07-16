// Theo Worker — JD 分析引擎
// 轮询 queued tasks → 三轮分析 → 写 report

import { prisma } from '@theo/db'
import { config } from '@theo/config'
import { parseJD } from '@theo/analysis/parse-jd'
import { businessSearch } from '@theo/analysis/business-search'
import { generateReport } from '@theo/analysis/generate-report'

const POLL_INTERVAL = 3000 // 3 秒轮询

async function main() {
  console.log('[worker] Theo Worker started')
  console.log(`[worker] LLM: ${config.llm.provider}/${config.llm.model}`)
  console.log(`[worker] Search: ${config.search.provider}`)

  while (true) {
    try {
      const task = await prisma.$queryRawUnsafe<Array<{ id: string; raw_jd: string }>>(
        `SELECT id, raw_jd FROM tasks WHERE status = 'queued' ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED`
      )

      if (!task.length) {
        await sleep(POLL_INTERVAL)
        continue
      }

      const { id, raw_jd } = task[0]!
      console.log(`[worker] Processing task ${id}`)

      // Round 1: Parse
      await prisma.task.update({ where: { id }, data: { status: 'parsing', progress: 33 } })
      const r1 = await parseJD(raw_jd)

      // Round 2: Business Search
      await prisma.task.update({ where: { id }, data: { status: 'reasoning', progress: 66 } })
      const r2 = await businessSearch(r1)

      // Round 3: Generate Report
      await prisma.task.update({ where: { id }, data: { status: 'outputting', progress: 90 } })
      const report = await generateReport(r1, r2)

      // Write report
      await prisma.report.create({
        data: {
          taskId: id,
          userId: '', // FIXME: from task
          oneLiner: report.oneLiner,
          overallSignal: report.signal,
          quickCard: report.quickCard,
          dimensions: report.dimensions,
          sources: report.sources,
        },
      })

      await prisma.task.update({ where: { id }, data: { status: 'completed', progress: 100, completedAt: new Date() } })
      console.log(`[worker] Task ${id} completed`)
    } catch (err) {
      console.error('[worker] Error:', err)
      await sleep(POLL_INTERVAL)
    }
  }
}

function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

main().catch(err => { console.error('[worker] Fatal:', err); process.exit(1) })
