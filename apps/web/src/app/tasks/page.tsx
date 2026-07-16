import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { SignalBadge } from '@/components/signal-badge'
import type { TaskStatus } from '@theo/types'

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  queued: { label: '排队中', variant: 'secondary' },
  parsing: { label: '解析中', variant: 'outline' },
  reasoning: { label: '推理中', variant: 'outline' },
  outputting: { label: '生成中', variant: 'outline' },
  completed: { label: '已完成', variant: 'default' },
  failed: { label: '失败', variant: 'destructive' },
}

interface TaskRow {
  id: string
  raw_jd: string
  recognized_company: string | null
  recognized_position: string | null
  status: TaskStatus
  progress: number
  error_message: string | null
  created_at: string
  completed_at: string | null
  reports: { id: string; overall_signal: 'green' | 'yellow' | 'red' }[]
}

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id, raw_jd, recognized_company, recognized_position,
      status, progress, error_message, created_at, completed_at,
      reports ( id, overall_signal )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">我的任务</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            粘贴 JD，获取深度洞察报告
          </p>
        </div>
        <Link href="/tasks/new" className={buttonVariants()}>
          新建分析
        </Link>
      </div>

      {/* Empty state */}
      {(!tasks || tasks.length === 0) && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="mb-4 text-4xl font-bold text-muted-foreground/40">Theo</div>
          <p className="mb-1 text-lg font-medium">还没有分析任务</p>
          <p className="mb-6 text-sm text-muted-foreground">粘贴一份 JD，开始你的第一次洞察分析</p>
          <Link href="/tasks/new" className={buttonVariants()}>
            新建分析
          </Link>
        </div>
      )}

      {/* Task list */}
      {tasks && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => {
            const t = task as TaskRow
            const status = statusConfig[t.status]
            const report = t.reports?.[0]
            const jdPreview = t.raw_jd.slice(0, 80).replace(/\n/g, ' ')

            return (
              <Link
                key={t.id}
                href={report ? `/reports/${report.id}` : `/tasks/${t.id}`}
                className="block rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Title line */}
                    <div className="flex items-center gap-2">
                      {t.recognized_company && (
                        <span className="font-medium">{t.recognized_company}</span>
                      )}
                      {t.recognized_position && (
                        <span className="text-muted-foreground">· {t.recognized_position}</span>
                      )}
                      {!t.recognized_company && !t.recognized_position && (
                        <span className="font-medium text-muted-foreground">未识别职位</span>
                      )}
                    </div>
                    {/* JD preview */}
                    <p className="mt-1 truncate text-sm text-muted-foreground">{jdPreview}...</p>
                    {/* Meta */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(t.created_at).toLocaleString('zh-CN')}</span>
                      {t.status === 'failed' && t.error_message && (
                        <span className="text-destructive">{t.error_message.slice(0, 50)}</span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {report && <SignalBadge signal={report.overall_signal} size="sm" />}
                    {t.status !== 'completed' && t.status !== 'failed' && (
                      <span className="text-xs text-muted-foreground">{t.progress}%</span>
                    )}
                  </div>
                </div>

                {/* Progress bar for in-progress tasks */}
                {t.status !== 'completed' && t.status !== 'failed' && t.status !== 'queued' && (
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
