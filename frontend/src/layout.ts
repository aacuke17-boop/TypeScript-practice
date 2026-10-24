import { el } from './dom'
import type { CommonResponse } from './types'

export function renderHeader(container: HTMLElement, common: CommonResponse): void {
  const brand = el('a', {
    className: 'brand',
    text: common.siteName,
    attrs: { href: '/' },
  })

  const nav = el(
    'nav',
    { className: 'menu', attrs: { id: 'site-menu' } },
    common.menu.map((item) => el('a', { text: item.label, attrs: { href: item.path } })),
  )

  container.replaceChildren(brand, nav)
}

export function renderFooter(container: HTMLElement, common: CommonResponse): void {
  const nodes: Node[] = [el('p', { className: 'footer-text', text: common.footerText })]

  if (common.footerContact) {
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(common.footerContact)
    nodes.push(
      looksLikeEmail
        ? el('a', {
            className: 'footer-contact',
            text: common.footerContact,
            attrs: { href: `mailto:${common.footerContact}` },
          })
        : el('span', { className: 'footer-contact', text: common.footerContact }),
    )
  }

  container.replaceChildren(...nodes)
}

// Marks the menu link of the current page
export function markActiveLink(container: HTMLElement, pathname: string): void {
  const current = pathname.replace(/\/+$/, '') || '/'

  container.querySelectorAll<HTMLAnchorElement>('nav a').forEach((link) => {
    const linkPath = new URL(link.href).pathname.replace(/\/+$/, '') || '/'
    if (linkPath === current) {
      link.setAttribute('aria-current', 'page')
    } else {
      link.removeAttribute('aria-current')
    }
  })
}