// Prompt 模板 — JD 三轮分析

export const PARSE_JD_SYSTEM = `你是一名资深的招聘分析师与技术 HR。你的任务是从用户粘贴的职位描述（JD）中抽取结构化信息。
要求：
1. 只输出 JSON，不要任何解释性文字
2. 如果某项信息在 JD 中未提及，填空字符串 "" 或空数组 []
3. dimensions 字段：列出 4-6 个对求职者最关键的分析维度（如"技术栈匹配度""业务理解要求""团队与汇报线""成长空间"等），每个维度要有明确的分析聚焦点 focus`

export const PARSE_JD_USER = (rawJd: string) => `请解析以下 JD：
---
${rawJd}
---
输出格式：
{
  "company": "识别出的公司名（若 JD 未写明则填 \"未知公司\"）",
  "position": "职位名称",
  "industry": "所在行业",
  "domain": ["相关领域标签"],
  "skills": ["核心技能要求"],
  "experienceYears": "经验年限要求（如 \"3-5年\"）",
  "responsibilities": ["主要职责"],
  "requirements": ["任职要求"],
  "dimensions": [
    { "num": 1, "title": "维度名", "focus": "该维度要重点分析什么" }
  ]
}`

export const BUSINESS_SEARCH_QUERY = (company: string, position: string) =>
  `${company} ${position} 公司背景 业务 团队 薪资 评价`

export const GENERATE_REPORT_SYSTEM = `你是一名顶级职业顾问，擅长从 JD 中洞察岗位真实价值与风险。
你会收到：1) 结构化解析结果 2) 联网搜索到的公司/行业背景资料。
你需要输出一份给求职者看的"JD 洞察报告"，要求：
1. 只输出 JSON
2. signal 用 green/yellow/red 表示整体信号
3. dimensions 每个维度要给出 signal、正文分析 body（2-4 句）、引用来源 sources（source id 数组）
4. 来源 cred 评估：high=官方/权威媒体，mid=普通资讯，low=论坛/不可靠
5. 分析要客观、有洞察力，指出机会也指出坑`

export const GENERATE_REPORT_USER = (
  parsed: unknown,
  sources: unknown,
  contexts: unknown
) => `## 结构化 JD 解析
${JSON.stringify(parsed, null, 2)}

## 搜索来源列表
${JSON.stringify(sources, null, 2)}

## 搜索抓取的正文资料
${JSON.stringify(contexts, null, 2)}

请生成报告，格式：
{
  "oneLiner": "一句话总结这个岗位",
  "signal": "green|yellow|red",
  "quickCard": {
    "oneLiner": "同 oneLiner",
    "signal": "green|yellow|red",
    "opportunities": ["3个机会点"],
    "risks": ["3个风险点"],
    "keyDims": [{"num":1,"title":"维度名","signal":"green|yellow|red","summary":"一句话"}]
  },
  "dimensions": [
    {"num":1,"title":"维度名","signal":"green|yellow|red","body":"分析正文","sources":[1,2],"inferred":false}
  ],
  "sources": [{"id":1,"type":"web","title":"标题","url":"https://...","cred":"high|mid|low","credText":"来源说明","date":"2024-01-01"}]
}`
