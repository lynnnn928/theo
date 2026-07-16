// JD 分析引擎内部类型

import type { Signal } from '@theo/types'

/** Round 1: parseJD 输出 */
export interface ParsedJD {
  company: string
  position: string
  industry: string
  domain: string[]
  skills: string[]
  experienceYears: string
  responsibilities: string[]
  requirements: string[]
  // 关键分析维度（供 Round 3 展开）
  dimensions: {
    num: number
    title: string
    focus: string
  }[]
}

/** Round 2: businessSearch 输出 */
export interface SearchResult {
  sources: import('@theo/types').SourceInfo[]
  // 抓取到的正文片段，按 source id 索引
  contexts: { id: number; markdown: string }[]
}

/** Round 3: generateReport 输出（对齐 ReportInfo） */
export interface ReportData {
  oneLiner: string
  signal: Signal
  quickCard: import('@theo/types').QuickCard
  dimensions: import('@theo/types').DimensionResult[]
  sources: import('@theo/types').SourceInfo[]
}
