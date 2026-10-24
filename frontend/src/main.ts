import './style.css'
import { fetchJson } from './api'
import { el } from './dom'
import { markActiveLink, renderFooter, renderHeader } from './layout'
import { renderCmsPage } from './pages/cmsPage'
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
let siteName = ''
let renderCounter = 0

function renderRoute(route: Route): void {
  markActiveLink(header, location.pathname)

  const current = ++renderCounter
  const isCurrent = (): boolean => current === renderCounter

  if (route.kind === 'page') {
    void renderCmsPage(content, route.path, siteName, isCurrent)
    return
  }

  // Temporary stub: the questionnaire page is added in step 12
  showReady(content, el('p', { text: `Questionnaire: ${route.slug}` }))
}

async function init(): Promise<void> {
  showLoading(content)

  const result = await fetchJson<CommonResponse>('/api/common')
  if (result.status === 'error') {
    showError(content, result.message, () => void init())
    return
  }

  siteName = result.data.siteName
  renderHeader(header, result.data)
  renderFooter(footer, result.data)

  if (!routerStarted) {
    routerStarted = true
    startRouter(renderRoute)
  }
}

void init()