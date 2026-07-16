// Round 3: 综合 JD 解析 + 搜索结果 → 生成报告

import { config } from '@theo/config'
import { callLLMJson } from './llm'
import { GENERATE_REPORT_SYSTEM, GENERATE_REPORT_USER } from './prompts'
import type { ParsedJD, SearchResult, ReportData } from './types'
import type { SourceInfo } from '@theo/types'

export async function generateReport(
  parsed: ParsedJD,
  search: SearchResult
): Promise<ReportData> {
  const report = await callLLMJson<ReportData>(
    config.llm.modelReport,
    GENERATE_REPORT_SYSTEM,
    GENERATE_REPORT_USER(parsed, search.sources, search.contexts),
    { temperature: 0.4, maxTokens: 8192 }
  )

  // 合并来源：优先用模型输出的（带 cred 评估），补充搜索到但未引用的
  const modelSources = report.sources ?? []
  const modelIds = new Set(modelSources.map((s) => s.id))
  const merged: SourceInfo[] = [
    ...modelSources.map((s) => ({
      id: s.id,
      type: s.type ?? 'web',
      title: s.title,
      url: s.url,
      cred: s.cred ?? 'mid',
      credText: s.credText ?? '',
      date: s.date,
    })),
    ...search.sources
      .filter((s) => !modelIds.has(s.id))
      .map((s) => ({ ...s })),
  ]

  return {
    oneLiner: report.oneLiner,
    signal: report.signal,
    quickCard: report.quickCard,
    dimensions: report.dimensions,
    sources: merged,
  }
}
