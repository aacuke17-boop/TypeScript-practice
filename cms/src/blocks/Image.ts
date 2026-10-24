import type { Block } from 'payload'

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Image', plural: 'Image blocks' },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}