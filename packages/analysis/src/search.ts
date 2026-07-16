// TokenDance UniFuncs 搜索客户端
// web-search: 搜索相关网页
// web-reader: 抓取网页正文 Markdown

import { config } from '@theo/config'
import type { SourceInfo } from '@theo/types'

interface UniFuncsWebPage {
  name: string
  url: string
  displayUrl?: string
  snippet?: string
  summary?: string
  siteName?: string
  siteIcon?: string
  datePublished?: string | null
}

interface UniFuncsSearchResp {
  code?: number
  data?: { webPages?: UniFuncsWebPage[] }
}

/** 搜索网页，返回 SourceInfo 列表 */
export async function webSearch(query: string, count = 5): Promise<SourceInfo[]> {
  const res = await fetch(`${config.search.baseUrl}/web-search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.search.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, count, format: 'json' }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Web search failed (${res.status}): ${text.slice(0, 200)}`)
  }

  const data = (await res.json()) as UniFuncsSearchResp
  const pages = data.data?.webPages ?? []

  return pages.slice(0, count).map((p, i) => ({
    id: i + 1,
    type: 'web',
    title: p.name ?? p.url,
    url: p.url,
    cred: 'mid' as const,
    credText: p.siteName ?? new URL(p.url).hostname,
    date: p.datePublished ?? undefined,
  }))
}

/** 抓取网页正文，返回 Markdown */
export async function webReader(url: string): Promise<string> {
  const res = await fetch(`${config.search.baseUrl}/web-reader`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.search.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, format: 'md', liteMode: true }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Web reader failed (${res.status}): ${text.slice(0, 200)}`)
  }

  return await res.text()
}
