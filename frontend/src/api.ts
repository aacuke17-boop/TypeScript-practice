import type { Id, PagePath, Slug } from './aliases'
import type { Block } from './blocks'

// ---------- Result wrapper ----------

// Union: either data or an error message
export type ApiResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string }

// Body of an error response from the CMS, e.g. { "message": "Page not found" }
export type ApiErrorBody = {
  message: string
}

// ---------- GET /api/common ----------

export type MenuItem = {
  label: string
  path: PagePath
}

export type CommonResponse = {
  siteName: string
  menu: MenuItem[]
  footerText: string
  footerContact: string
}

// ---------- GET /api/page ----------

export type ApiMeta = {
  title: string
  path: PagePath
}

export type PageData = {
  blocks: Block[]
}

// Intersection: meta & content
export type PageResponse = ApiMeta & PageData

// ---------- POST /api/attempt ----------

export type AnswerPayload = {
  questionId: string
  optionIds: string[]
}

export type AttemptRequest = {
  slug: Slug
  participantName?: string
  answers: AnswerPayload[]
}

export type ReviewOption = {
  id: string
  text: string
  isCorrect: boolean
  selected: boolean
}

export type ReviewQuestion = {
  questionId: string
  text: string
  points: number
  earned: number
  options: ReviewOption[]
}

export type TestAttemptResult = {
  isTest: true
  score: number
  maxScore: number
  review: ReviewQuestion[]
}

export type SurveyAttemptResult = {
  isTest: false
  saved: true
}

// Union with discriminant "isTest"
export type AttemptResult = TestAttemptResult | SurveyAttemptResult

// Re-exported so that API types and ids stay importable from one place
export type { Id }