import type { PagePath, Slug } from './types'

export type Route =
  | { kind: 'page'; path: PagePath }
  | { kind: 'survey'; slug: Slug }

export function parseRoute(pathname: string = location.pathname): Route {
  const match = /^\/survey\/([^/]+)\/?$/.exec(pathname)
  const rawSlug = match?.[1]

  if (rawSlug) {
    try {
      return { kind: 'survey', slug: decodeURIComponent(rawSlug) }
    } catch {
      // Malformed percent-encoding, use the raw value
      return { kind: 'survey', slug: rawSlug }
    }
  }

  // Remove trailing slashes: "/about/" becomes "/about", "" becomes "/"
  const path = pathname.replace(/\/+$/, '') || '/'
  return { kind: 'page', path }
}

type RouteHandler = (route: Route) => void

let handler: RouteHandler | null = null

export function navigate(to: string): void {
  const url = new URL(to, location.href)
  if (url.pathname === location.pathname) return
  history.pushState(null, '', url.pathname)
  handler?.(parseRoute())
  window.scrollTo(0, 0)
}

function onLinkClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  const target = event.target
  if (!(target instanceof Element)) return

  const anchor = target.closest('a')
  if (!anchor) return
  if (anchor.target && anchor.target !== '_self') return
  if (anchor.hasAttribute('download')) return

  const url = new URL(anchor.href, location.href)
  if (url.origin !== location.origin) return

  // Internal link: handle it without reloading the page
  event.preventDefault()
  navigate(url.pathname)
}

export function startRouter(onRoute: RouteHandler): void {
  handler = onRoute
  window.addEventListener('popstate', () => handler?.(parseRoute()))
  document.addEventListener('click', onLinkClick)
  onRoute(parseRoute())
}