// Theo Worker — JD 分析引擎
// 轮询 queued tasks → 三轮分析 → 写 report

import { prisma } from '@theo/db'
import { config } from '@theo/config'
import { parseJD } from '@theo/analysis/parse-jd'
import { businessSearch } from '@theo/analysis/business-search'
import { generateReport } from '@theo/analysis/generate-report'

const POLL_INTERVAL = 3000 // 3 秒轮询

type QueuedTask = {
  id: string
  user_id: string
  raw_jd: string
}

async function claimTask(): Promise<QueuedTask | null> {
  // FOR UPDATE SKIP LOCKED：多 Worker 并发安全
  const rows = await prisma.$queryRawUnsafe<QueuedTask[]>(
    `SELECT id, user_id, raw_jd
     FROM tasks
     WHERE status = 'queued'
     ORDER BY created_at
     LIMIT 1
     FOR UPDATE SKIP LOCKED`
  )
  return rows[0] ?? null
}

async function main() {
  console.log('[worker] Theo Worker started')
  console.log(`[worker] LLM(JD): ${config.llm.modelJd}`)
  console.log(`[worker] LLM(Report): ${config.llm.modelReport}`)
  console.log(`[worker] Search: ${config.search.provider}`)

  while (true) {
    try {
      const task = await claimTask()
      if (!task) {
        await sleep(POLL_INTERVAL)
        continue
      }

      const { id, user_id, raw_jd } = task
      console.log(`[worker] Processing task ${id} (user ${user_id})`)

      // Round 1: Parse
      await prisma.task.update({ where: { id }, data: { status: 'parsing', progress: 25 } })
      const parsed = await parseJD(raw_jd)
      console.log(`[worker] R1 parsed: ${parsed.company} / ${parsed.position}`)

      // Round 2: Business Search
      await prisma.task.update({ where: { id }, data: { status: 'reasoning', progress: 55 } })
      const search = await businessSearch(parsed)
      console.log(`[worker] R2 search: ${search.sources.length} sources, ${search.contexts.length} contexts`)

      // Round 3: Generate Report
      await prisma.task.update({ where: { id }, data: { status: 'outputting', progress: 85 } })
      const report = await generateReport(parsed, search)
      console.log(`[worker] R3 report: signal=${report.signal}`)

      // Write report
      await prisma.report.create({
        data: {
          taskId: id,
          userId: user_id,
          oneLiner: report.oneLiner,
          overallSignal: report.signal,
          quickCard: report.quickCard as object,
          dimensions: report.dimensions as object,
          sources: report.sources as object,
        },
      })

      await prisma.task.update({
        where: { id },
        data: { status: 'completed', progress: 100, completedAt: new Date() },
      })
      console.log(`[worker] ✅ Task ${id} completed`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[worker] ❌ Error:', msg)
      // 标记任务失败（best-effort，失败不影响主循环）
      try {
        await prisma.$queryRawUnsafe(
          `UPDATE tasks SET status = 'failed', error_message = $1 WHERE status = 'queued' OR status = 'parsing' OR status = 'reasoning' OR status = 'outputting'`,
          msg.slice(0, 500)
        )
      } catch {
        /* ignore */
      }
      await sleep(POLL_INTERVAL)
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main().catch((err) => {
  console.error('[worker] Fatal:', err)
  process.exit(1)
})
