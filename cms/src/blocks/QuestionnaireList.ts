import type { Block } from 'payload'

export const QuestionnaireListBlock: Block = {
  slug: 'questionnaireList',
  labels: { singular: 'Questionnaire list', plural: 'Questionnaire lists' },
  fields: [
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'questionnaires',
      hasMany: true,
      filterOptions: {
        published: { equals: true },
      },
      admin: {
        description: 'Leave empty to show all published questionnaires and tests',
      },
    },
  ],
}