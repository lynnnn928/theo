'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function NewTaskPage() {
  const router = useRouter()
  const [jd, setJd] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const charCount = jd.length
  const canSubmit = jd.trim().length >= 20 && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          raw_jd: jd.trim(),
          status: 'queued',
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      // Go to task detail (will show progress)
      router.push(`/tasks/${data.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '提交失败，请重试'
      setError(msg)
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back link */}
      <Link href="/tasks" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        ← 返回任务列表
      </Link>

      <h1 className="mb-2 text-2xl font-bold tracking-tight">新建 JD 分析</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        粘贴完整的职位描述（JD），Theo 将自动解析并生成洞察报告
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="jd">职位描述</Label>
            <span className="text-xs text-muted-foreground">{charCount} 字</span>
          </div>
          <Textarea
            id="jd"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="粘贴完整的 JD 内容，包括公司、职位、职责、要求等..."
            className="min-h-[300px] resize-y font-mono text-sm leading-relaxed"
            disabled={submitting}
          />
          {jd.trim().length > 0 && jd.trim().length < 20 && (
            <p className="text-xs text-muted-foreground">JD 内容太短，至少需要 20 个字符</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!canSubmit} className="min-w-[120px]">
            {submitting ? '提交中...' : '开始分析'}
          </Button>
          <Link href="/tasks" className={buttonVariants({ variant: "ghost" })}>
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}
