// TokenDance OpenAI-compatible LLM client
// 支持普通文本和 JSON 模式输出

import { config } from '@theo/config'

export interface LLMOptions {
  jsonMode?: boolean
  temperature?: number
  maxTokens?: number
}

/**
 * 调用 LLM，返回文本内容。
 * jsonMode=true 时强制要求模型输出 JSON，并尝试解析为对象返回。
 */
export async function callLLM(
  model: string,
  system: string,
  user: string,
  opts: LLMOptions = {}
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 4096,
  }

  if (opts.jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  const res = await fetch(`${config.llm.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.llm.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LLM request failed (${res.status}): ${text.slice(0, 300)}`)
  }

  const data = await res.json()
  // deepseek-v4-pro 等推理模型：content 在 json_mode 下才有值
  const content: string = data?.choices?.[0]?.message?.content ?? ''
  if (!content) {
    throw new Error('LLM returned empty content')
  }
  return content
}

/** 调用 LLM 并解析 JSON 响应 */
export async function callLLMJson<T = unknown>(
  model: string,
  system: string,
  user: string,
  opts: LLMOptions = {}
): Promise<T> {
  const raw = await callLLM(model, system, user, { ...opts, jsonMode: true })
  // 容忍模型在 JSON 外包裹 ```json 代码块
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  try {
    return JSON.parse(cleaned) as T
  } catch {
    throw new Error(`Failed to parse LLM JSON response: ${cleaned.slice(0, 200)}`)
  }
}
