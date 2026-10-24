import type { CollectionConfig } from 'payload'
import { HeroBlock } from '../blocks/Hero'
import { TextBlock } from '../blocks/Text'
import { ImageBlock } from '../blocks/Image'
import { QuestionnaireListBlock } from '../blocks/QuestionnaireList'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', 'updatedAt'],
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && typeof data.path === 'string') {
          let p = data.path.trim().toLowerCase()
          if (p !== '' && !p.startsWith('/')) p = `/${p}`
          if (p.length > 1) p = p.replace(/\/+$/, '')
          data.path = p
        }
        if (data && typeof data.title === 'string') data.title = data.title.trim()
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'path',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Use "/" for the home page, e.g. "/about" for other pages',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.trim() === '') return 'Path is required'
        if (!/^\/$|^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(value)) {
          return 'Use "/" or a path like "/about" (lowercase Latin letters, digits, hyphens)'
        }
        if (value === '/survey' || value.startsWith('/survey/')) {
          return 'Paths starting with /survey are reserved for questionnaires'
        }
        return true
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: [HeroBlock, TextBlock, ImageBlock, QuestionnaireListBlock],
    },
  ],
}