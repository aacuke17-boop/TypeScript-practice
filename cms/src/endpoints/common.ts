import type { Endpoint } from 'payload'

export const commonEndpoint: Endpoint = {
  path: '/common',
  method: 'get',
  handler: async (req) => {
    const header = await req.payload.findGlobal({ slug: 'header', depth: 0 })
    const footer = await req.payload.findGlobal({ slug: 'footer', depth: 0 })

    return Response.json({
      siteName: header.siteName ?? '',
      menu: (header.menu ?? []).map((item) => ({
        label: item.label,
        path: item.path,
      })),
      footerText: footer.text ?? '',
      footerContact: footer.contact ?? '',
    })
  },
}