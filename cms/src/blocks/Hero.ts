import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Hero blocks' },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'subheading',
      type: 'text',
    },
  ],
}