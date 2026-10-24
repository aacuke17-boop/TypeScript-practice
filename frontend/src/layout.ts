import { el } from './dom'
import type { CommonResponse } from './types'

export function renderHeader(container: HTMLElement, common: CommonResponse): void {
  const brand = el('a', {
    className: 'brand',
    text: common.siteName,
    attrs: { href: '/' },
  })

  const toggle = el('button', {
    className: 'menu-toggle',
    text: 'Menu',
    attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': 'site-menu' },
  })

  const nav = el(
    'nav',
    { className: 'menu', attrs: { id: 'site-menu' } },
    common.menu.map((item) => el('a', { text: item.label, attrs: { href: item.path } })),
  )

  function setOpen(open: boolean): void {
    container.classList.toggle('menu-open', open)
    toggle.setAttribute('aria-expanded', String(open))
    toggle.textContent = open ? 'Close' : 'Menu'
  }

  toggle.addEventListener('click', () => {
    setOpen(!container.classList.contains('menu-open'))
  })

  // After choosing a menu item the menu closes by itself
  nav.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) setOpen(false)
  })

  container.replaceChildren(brand, toggle, nav)
  setOpen(false)
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