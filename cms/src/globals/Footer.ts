import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
    },
    {
      name: 'contact',
      type: 'text',
      admin: {
        description: 'E-mail or any contact line shown in the footer',
      },
    },
  ],
}