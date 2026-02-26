import type { PinAnchor } from './types'
import { generateSelector } from './selector'

export interface ResolvedPosition {
  x: number
  y: number
  strategy: 'selector' | 'page'
}

export function createAnchor(element: Element, clientX: number, clientY: number, pathname: string): PinAnchor {
  const rect = element.getBoundingClientRect()
  return {
    selector: generateSelector(element),
    offsetXPercent: (clientX - rect.left) / rect.width,
    offsetYPercent: (clientY - rect.top) / rect.height,
    pageXPercent: clientX / window.innerWidth,
    pageYPercent: clientY / window.innerHeight,
    pathname,
    viewport: { width: window.innerWidth, height: window.innerHeight },
  }
}

export function resolveAnchor(anchor: PinAnchor): ResolvedPosition | null {
  let el: Element | null = null
  try {
    el = anchor.selector ? document.querySelector(anchor.selector) : null
  } catch {
    el = null
  }
  if (el) {
    const rect = el.getBoundingClientRect()
    return {
      x: rect.left + anchor.offsetXPercent * rect.width,
      y: rect.top + anchor.offsetYPercent * rect.height,
      strategy: 'selector',
    }
  }
  return {
    x: anchor.pageXPercent * window.innerWidth,
    y: anchor.pageYPercent * window.innerHeight,
    strategy: 'page',
  }
}
