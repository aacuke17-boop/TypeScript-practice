import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header',
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
    },
    {
      name: 'menu',
      type: 'array',
      labels: { singular: 'Menu item', plural: 'Menu items' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'path',
          type: 'text',
          required: true,
          admin: {
            description: 'Path of a CMS page, e.g. "/" or "/about"',
          },
          validate: (value: unknown) => {
            if (typeof value !== 'string' || value.trim() === '') return 'Path is required'
            if (!value.startsWith('/')) return 'Path must start with "/"'
            return true
          },
        },
      ],
    },
  ],
}