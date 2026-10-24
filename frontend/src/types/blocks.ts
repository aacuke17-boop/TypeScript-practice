import type { Id } from './aliases'
import type { QuestionnaireCard } from './questionnaire'

// Fields common to every block
export type BlockBase = {
  id: Id
  type: string
}

// Intersection: common fields & fields of a specific block.
// The literal type of "type" narrows the generic string from BlockBase.
export type HeroBlock = BlockBase & {
  type: 'hero'
  heading: string
  subheading: string
}

export type TextBlock = BlockBase & {
  type: 'text'
  body: string
}

export type ImageBlock = BlockBase & {
  type: 'image'
  url: string
  alt: string
}

export type QuestionnaireListBlock = BlockBase & {
  type: 'questionnaireList'
  heading: string
  items: QuestionnaireCard[]
}

// Union of all blocks: "type" is the discriminant
export type Block = HeroBlock | TextBlock | ImageBlock | QuestionnaireListBlock