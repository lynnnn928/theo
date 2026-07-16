// Round 2: 联网搜索公司/行业背景

import { webSearch, webReader } from './search'
import { BUSINESS_SEARCH_QUERY } from './prompts'
import type { ParsedJD, SearchResult } from './types'

const MAX_CONTEXT_CHARS = 4000 // 每个来源截取长度，控制 token 成本

export async function businessSearch(parsed: ParsedJD): Promise<SearchResult> {
  // 1. 搜索
  const query = BUSINESS_SEARCH_QUERY(parsed.company, parsed.position)
  const sources = await webSearch(query, 5)

  // 2. 抓取前 3 个高相关来源的正文
  const contexts: SearchResult['contexts'] = []
  const topSources = sources.slice(0, 3)
  for (const src of topSources) {
    try {
      const md = await webReader(src.url)
      contexts.push({
        id: src.id,
        markdown: md.slice(0, MAX_CONTEXT_CHARS),
      })
    } catch {
      // 单条抓取失败不影响整体，跳过
      continue
    }
  }

  return { sources, contexts }
}
