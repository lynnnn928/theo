// Round 1: 解析 JD → 结构化信息

import { config } from '@theo/config'
import { callLLMJson } from './llm'
import { PARSE_JD_SYSTEM, PARSE_JD_USER } from './prompts'
import type { ParsedJD } from './types'

export async function parseJD(rawJd: string): Promise<ParsedJD> {
  const result = await callLLMJson<ParsedJD>(
    config.llm.modelJd,
    PARSE_JD_SYSTEM,
    PARSE_JD_USER(rawJd),
    { temperature: 0.2, maxTokens: 2048 }
  )

  // 兜底：确保 dimensions 有内容
  if (!result.dimensions || result.dimensions.length === 0) {
    result.dimensions = [{ num: 1, title: '综合评估', focus: '岗位整体匹配度与风险' }]
  }

  return result
}
