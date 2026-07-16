// === JD 分析 ===
export interface TaskInfo {
  id: string
  userId: string
  rawJd: string
  recognizedCompany?: string
  recognizedPosition?: string
  status: TaskStatus
  progress: number
  errorMessage?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type TaskStatus = 'queued' | 'parsing' | 'reasoning' | 'outputting' | 'completed' | 'failed'

export type Signal = 'green' | 'yellow' | 'red'

export interface ReportInfo {
  id: string
  taskId: string
  userId: string
  oneLiner: string
  overallSignal: Signal
  quickCard: QuickCard
  dimensions: DimensionResult[]
  sources: SourceInfo[]
  matchResult?: MatchResult
  createdAt: string
}

export interface QuickCard {
  oneLiner: string
  signal: Signal
  opportunities: string[]
  risks: string[]
  keyDims: { num: number; title: string; signal: Signal; summary: string }[]
}

export interface DimensionResult {
  num: number
  title: string
  signal: Signal
  body: string
  sources: number[]
  inferred?: boolean
}

export interface SourceInfo {
  id: number
  type: string
  title: string
  url: string
  cred: 'high' | 'mid' | 'low'
  credText: string
  date?: string
}

export interface MatchResult {
  score: number
  advantages: string[]
  gaps: string[]
  strategies: string[]
}

// === 档案 ===
export interface ProfileInfo {
  id: string
  userId: string
  basicInfo: BasicInfo
  focusDirections: string[]
  capabilityMap: CapabilityMap
  rawMaterials: RawMaterials
  lockStatus: 'unlocked' | 'locked'
  updatedAt: string
}

export interface BasicInfo {
  name?: string
  currentPosition?: string
  experienceYears?: number
  city?: string
  companyType?: string
  jobSearchStatus?: string
}

export interface CapabilityMap {
  general: CapabilityItem[]
  industry: CapabilityItem[]
  domain: CapabilityItem[]
}

export interface CapabilityItem {
  name: string
  level: string
  status: 'verified' | 'unverified' | 'advantage'
  evidence?: string
}

export interface RawMaterials {
  resumeText?: string
  resumeFileUrl?: string
  chatSummaries?: string[]
}

// === 追问 ===
export interface FollowupMessage {
  id: string
  reportId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export type MsgRole = 'user' | 'assistant'
