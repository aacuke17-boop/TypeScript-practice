import type { Block } from 'payload'

export const TextBlock: Block = {
  slug: 'text',
  labels: { singular: 'Text', plural: 'Text blocks' },
  fields: [
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
  ],
}