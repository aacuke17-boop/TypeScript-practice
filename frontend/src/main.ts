import './style.css'
import { fetchJson } from './api'
import { el } from './dom'
import { markActiveLink, renderFooter, renderHeader } from './layout'
import { startRouter, type Route } from './router'
import { showError, showLoading, showReady } from './state'
import type { CommonResponse } from './types'

function getElement(id: string): HTMLElement {
  const node = document.getElementById(id)
  if (!node) throw new Error(`Element #${id} not found`)
  return node
}

const header = getElement('site-header')
const content = getElement('content')
const footer = getElement('site-footer')

let routerStarted = false

// Temporary stub: real page rendering is added in steps 11 and 12
function renderRoute(route: Route): void {
  markActiveLink(header, location.pathname)
  const text =
    route.kind === 'page' ? `CMS page: ${route.path}` : `Questionnaire: ${route.slug}`
  showReady(content, el('p', { text }))
}

async function init(): Promise<void> {
  showLoading(content)

  const result = await fetchJson<CommonResponse>('/api/common')
  if (result.status === 'error') {
    showError(content, result.message, () => void init())
    return
  }

  document.title = result.data.siteName
  renderHeader(header, result.data)
  renderFooter(footer, result.data)

  if (!routerStarted) {
    routerStarted = true
    startRouter(renderRoute)
  }
}

void init()