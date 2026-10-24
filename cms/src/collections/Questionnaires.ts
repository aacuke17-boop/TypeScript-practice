import type { CollectionConfig } from 'payload'

type OptionRow = { text?: string; isCorrect?: boolean }

export const Questionnaires: CollectionConfig = {
  slug: 'questionnaires',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'isTest', 'published', 'updatedAt'],
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data

        if (typeof data.title === 'string') data.title = data.title.trim()

        const isTest = Boolean(data.isTest ?? originalDoc?.isTest)

        if (Array.isArray(data.questions)) {
          for (const q of data.questions) {
            if (typeof q.text === 'string') q.text = q.text.trim()
            if (!isTest) q.points = 0

            if (Array.isArray(q.options)) {
              for (const o of q.options) {
                if (typeof o.text === 'string') o.text = o.text.trim()
                if (!isTest) o.isCorrect = false
              }
            }
          }
        }

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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Latin letters, digits and hyphens only, e.g. js-basics-quiz',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || value.trim() === '') return 'Slug is required'
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return 'Use lowercase Latin letters, digits and single hyphens'
        }
        return true
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'isTest',
      type: 'checkbox',
      defaultValue: false,
      label: 'This is a test (with correct answers and points)',
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'questions',
      type: 'array',
      labels: { singular: 'Question', plural: 'Questions' },
      validate: (value: unknown) => {
        if (!Array.isArray(value) || value.length < 1) return 'Add at least one question'
        return true
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
        {
          name: 'points',
          type: 'number',
          defaultValue: 1,
          admin: {
            condition: (data) => Boolean(data?.isTest),
          },
          validate: (value: unknown, { data }: { data?: { isTest?: boolean } }) => {
            if (!data?.isTest) return true
            if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
              return 'Points must be a number greater than 0'
            }
            return true
          },
        },
        {
          name: 'options',
          type: 'array',
          labels: { singular: 'Option', plural: 'Options' },
          validate: (value: unknown, { data }: { data?: { isTest?: boolean } }) => {
            const rows = (Array.isArray(value) ? value : []) as OptionRow[]
            if (rows.length < 1) return 'Add at least one option'
            if (data?.isTest && !rows.some((o) => o.isCorrect)) {
              return 'In a test, mark at least one option as correct'
            }
            return true
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
            {
              name: 'isCorrect',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                condition: (data) => Boolean(data?.isTest),
              },
            },
          ],
        },
      ],
    },
  ],
}