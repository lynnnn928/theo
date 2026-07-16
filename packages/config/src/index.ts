function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export const config = {
  llm: {
    provider: process.env.LLM_PROVIDER || 'openai',
    apiKey: requiredEnv('LLM_API_KEY'),
    model: process.env.LLM_MODEL || 'gpt-4o',
  },
  search: {
    provider: process.env.SEARCH_PROVIDER || 'tavily',
    apiKey: requiredEnv('SEARCH_API_KEY'),
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
