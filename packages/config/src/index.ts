function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export const config = {
  llm: {
    provider: process.env.LLM_PROVIDER || 'tokendance',
    apiKey: requiredEnv('LLM_API_KEY'),
    // TokenDance OpenAI-compatible gateway
    baseUrl: process.env.LLM_BASE_URL || 'https://tokendance.space/gateway/v1',
    // 双模型：JD 解析用快模型，报告生成用推理模型
    modelJd: process.env.LLM_MODEL_JD || 'qwen3-max',
    modelReport: process.env.LLM_MODEL_REPORT || 'deepseek-v4-pro',
  },
  search: {
    provider: process.env.SEARCH_PROVIDER || 'unifuncs',
    apiKey: requiredEnv('SEARCH_API_KEY'),
    baseUrl: process.env.SEARCH_BASE_URL || 'https://tokendance.space/gateway/unifuncs',
  },
  database: {
    url: requiredEnv('DATABASE_URL'),
  },
  supabase: {
    url: requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },
} as const
