'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { TaskStatus } from '@theo/types'

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  queued: { label: '排队中', variant: 'secondary' },
  parsing: { label: '解析 JD', variant: 'outline' },
  reasoning: { label: '联网搜索', variant: 'outline' },
  outputting: { label: '生成报告', variant: 'outline' },
  completed: { label: '已完成', variant: 'default' },
  failed: { label: '失败', variant: 'destructive' },
}

const stageLabels: Partial<Record<TaskStatus, string>> = {
  queued: '等待 Worker 拾取任务...',
  parsing: '正在解析 JD 结构化信息...',
  reasoning: '正在搜索公司/行业背景...',
  outputting: '正在生成洞察报告...',
}

interface TaskData {
  id: string
  raw_jd: string
  recognized_company: string | null
  recognized_position: string | null
  status: TaskStatus
  progress: number
  error_message: string | null
  reports: { id: string }[]
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [task, setTask] = useState<TaskData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data } = await supabase
        .from('tasks')
        .select('id, raw_jd, recognized_company, recognized_position, status, progress, error_message, reports (id)')
        .eq('id', id)
        .single()

      if (data) {
        setTask(data as TaskData)
        // If completed and has report, redirect to report page
        if (data.status === 'completed' && data.reports?.length) {
          router.push(`/reports/${data.reports[0].id}`)
          return
        }
      }
      setLoading(false)
    }

    load()

    // Poll for updates
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [id, router])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-32 rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <p className="text-muted-foreground">任务不存在或无权访问</p>
        <Link href="/tasks" className={cn(buttonVariants({ variant: "ghost" }), "mt-4")}>
          返回任务列表
        </Link>
      </div>
    )
  }

  const status = statusConfig[task.status]
  const jdPreview = task.raw_jd.slice(0, 200).replace(/\n/g, ' ')

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/tasks" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        ← 返回任务列表
      </Link>

      {/* Status card */}
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            {task.recognized_company || '分析中'}
            {task.recognized_position && (
              <span className="ml-2 text-muted-foreground">· {task.recognized_position}</span>
            )}
          </h1>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {/* Progress */}
        {task.status !== 'failed' && (
          <>
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {stageLabels[task.status] || `进度 ${task.progress}%`}
            </p>
          </>
        )}

        {/* Error */}
        {task.status === 'failed' && task.error_message && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {task.error_message}
          </div>
        )}

        {/* JD preview */}
        <div className="mt-6 border-t border-border/60 pt-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">JD 内容</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{jdPreview}...</p>
        </div>
      </div>

      {task.status === 'failed' && (
        <div className="mt-4 text-center">
          <Link href="/tasks/new" className={buttonVariants({ variant: "outline" })}>
            重新分析
          </Link>
        </div>
      )}
    </div>
  )
}
