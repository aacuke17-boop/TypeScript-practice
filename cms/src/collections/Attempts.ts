import type { CollectionConfig } from 'payload'

export const Attempts: CollectionConfig = {
  slug: 'attempts',
  admin: {
    defaultColumns: ['questionnaire', 'participantName', 'score', 'completedAt'],
  },
  access: {
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'questionnaire',
      type: 'relationship',
      relationTo: 'questionnaires',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'participantName',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'score',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Empty for surveys',
      },
    },
    {
      name: 'answers',
      type: 'json',
      required: true,
      admin: { readOnly: true },
      validate: (value: unknown) => {
        if (!Array.isArray(value)) return 'Answers must be an array'
        for (const item of value) {
          if (
            typeof item !== 'object' ||
            item === null ||
            !('questionId' in item) ||
            !('optionIds' in item) ||
            !Array.isArray((item as { optionIds: unknown }).optionIds)
          ) {
            return 'Each answer must have questionId and optionIds'
          }
        }
        return true
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
}