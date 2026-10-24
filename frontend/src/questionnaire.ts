import type { Id, Slug } from './aliases'

export type CoverImage = {
  url: string
  alt: string
}

// Short form of a questionnaire, used in lists on pages
export type QuestionnaireCard = {
  id: Id
  title: string
  slug: Slug
  description: string
  isTest: boolean
  cover: CoverImage | null
}

export type OptionData = {
  id: string
  text: string
}

export type QuestionData = {
  id: string
  text: string
  points: number
  options: OptionData[]
}

// Full form returned by GET /api/questionnaire
// Intersection: all fields of the card plus the questions
export type QuestionnaireResponse = QuestionnaireCard & {
  questions: QuestionData[]
}