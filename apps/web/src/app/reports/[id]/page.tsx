import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignalBadge } from '@/components/signal-badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Signal, QuickCard, DimensionResult, SourceInfo, MatchResult } from '@theo/types'

interface ReportRow {
  id: string
  one_liner: string
  overall_signal: Signal
  quick_card: QuickCard
  dimensions: DimensionResult[]
  sources: SourceInfo[]
  match_result: MatchResult | null
  created_at: string
  tasks: { recognized_company: string | null; recognized_position: string | null }[]
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: report } = await supabase
    .from('reports')
    .select(`
      id, one_liner, overall_signal, quick_card, dimensions, sources, match_result, created_at,
      tasks ( recognized_company, recognized_position )
    `)
    .eq('id', id)
    .single()

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground">报告不存在或无权访问</p>
        <Link href="/tasks" className={cn(buttonVariants({ variant: "ghost" }), "mt-4")}>
          返回任务列表
        </Link>
      </div>
    )
  }

  const r = report as ReportRow
  const task = r.tasks?.[0]
  const quick = r.quick_card
  const sources = r.sources ?? []
  const dimensions = r.dimensions ?? []
  const match = r.match_result

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back */}
      <Link href="/tasks" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        ← 返回任务列表
      </Link>

      {/* === Header === */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          {task?.recognized_company && <span>{task.recognized_company}</span>}
          {task?.recognized_position && <span>· {task.recognized_position}</span>}
          <span>· {new Date(r.created_at).toLocaleDateString('zh-CN')}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-tight tracking-tight">{r.one_liner}</h1>
          <SignalBadge signal={r.overall_signal} />
        </div>
      </div>

      {/* === Quick Card === */}
      {quick && (
        <Card className="mb-6 p-5">
          {/* Opportunities & Risks */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-signal-green">
                <span className="inline-block h-2 w-2 rounded-full bg-signal-green" />
                机会点
              </h3>
              <ul className="space-y-1.5">
                {quick.opportunities?.map((opp, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed">
                    <span className="text-signal-green">+</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-signal-red">
                <span className="inline-block h-2 w-2 rounded-full bg-signal-red" />
                风险点
              </h3>
              <ul className="space-y-1.5">
                {quick.risks?.map((risk, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed">
                    <span className="text-signal-red">!</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Key dimensions summary */}
          {quick.keyDims?.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {quick.keyDims.map((dim) => (
                  <div key={dim.num} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <SignalBadge signal={dim.signal} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{dim.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{dim.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {/* === Match Result (if exists) === */}
      {match && (
        <Card className="mb-6 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">能力匹配度</h2>
            <span className={`text-2xl font-bold ${
              match.score >= 75 ? 'text-signal-green' : match.score >= 50 ? 'text-signal-yellow' : 'text-signal-red'
            }`}>
              {match.score}
              <span className="text-sm text-muted-foreground">/100</span>
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {match.advantages?.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-signal-green">优势</p>
                <ul className="space-y-1">
                  {match.advantages.map((a, i) => <li key={i} className="text-xs leading-relaxed">{a}</li>)}
                </ul>
              </div>
            )}
            {match.gaps?.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-signal-red">差距</p>
                <ul className="space-y-1">
                  {match.gaps.map((g, i) => <li key={i} className="text-xs leading-relaxed">{g}</li>)}
                </ul>
              </div>
            )}
            {match.strategies?.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-primary">策略</p>
                <ul className="space-y-1">
                  {match.strategies.map((s, i) => <li key={i} className="text-xs leading-relaxed">{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* === Dimensions === */}
      {dimensions.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-bold tracking-tight">维度分析</h2>
          <div className="space-y-3">
            {dimensions.map((dim) => (
              <Card key={dim.num} className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {dim.num}
                  </span>
                  <h3 className="flex-1 font-semibold">{dim.title}</h3>
                  <SignalBadge signal={dim.signal} size="sm" />
                  {dim.inferred && (
                    <span className="text-xs text-muted-foreground">推断</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{dim.body}</p>
                {dim.sources?.length > 0 && dim.sources.some((s) => s <= sources.length) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {dim.sources.filter((s) => s <= sources.length).map((srcId) => (
                      <a
                        key={srcId}
                        href={sources.find((s) => s.id === srcId)?.url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      >
                        [{srcId}]
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* === Sources === */}
      {sources.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-bold tracking-tight">参考来源</h2>
          <div className="space-y-2">
            {sources.map((src) => (
              <div key={src.id} className="flex items-start gap-3 rounded-lg border border-border/40 p-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
                  {src.id}
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {src.title}
                  </a>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{src.credText}</span>
                    <span>·</span>
                    <span className={
                      src.cred === 'high' ? 'text-signal-green' :
                      src.cred === 'low' ? 'text-signal-yellow' : ''
                    }>
                      {src.cred === 'high' ? '高可信' : src.cred === 'mid' ? '中等' : '低可信'}
                    </span>
                    {src.date && <><span>·</span><span>{src.date}</span></>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
