import { describe, it, expect, beforeEach } from 'vitest'
import { createAnchor, resolveAnchor } from '../anchor'

describe('createAnchor', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'app'
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ left: 100, top: 200, width: 400, height: 300, right: 500, bottom: 500 }),
    })
    document.body.innerHTML = ''
    document.body.appendChild(container)
  })

  it('creates an anchor from element and click coordinates', () => {
    const anchor = createAnchor(container, 200, 350, '/products')
    expect(anchor.selector).toBe('#app')
    expect(anchor.offsetXPercent).toBeCloseTo(0.25)
    expect(anchor.offsetYPercent).toBeCloseTo(0.5)
    expect(anchor.pathname).toBe('/products')
    expect(anchor.viewport.width).toBeGreaterThan(0)
  })
})

describe('resolveAnchor', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'app'
    Object.defineProperty(container, 'getBoundingClientRect', {
      value: () => ({ left: 100, top: 200, width: 400, height: 300, right: 500, bottom: 500 }),
    })
    document.body.innerHTML = ''
    document.body.appendChild(container)
  })

  it('resolves position from selector + offset', () => {
    const pos = resolveAnchor({
      selector: '#app', offsetXPercent: 0.25, offsetYPercent: 0.5,
      pageXPercent: 0.1, pageYPercent: 0.2, pathname: '/products',
      viewport: { width: 1920, height: 1080 },
    })
    expect(pos).not.toBeNull()
    expect(pos!.x).toBeCloseTo(200)
    expect(pos!.y).toBeCloseTo(350)
    expect(pos!.strategy).toBe('selector')
  })

  it('falls back to page position when selector not found', () => {
    const pos = resolveAnchor({
      selector: '#nonexistent', offsetXPercent: 0.5, offsetYPercent: 0.5,
      pageXPercent: 0.3, pageYPercent: 0.4, pathname: '/products',
      viewport: { width: 1000, height: 800 },
    })
    expect(pos).not.toBeNull()
    expect(pos!.strategy).toBe('page')
  })

  it('falls back to page position when selector is empty', () => {
    const pos = resolveAnchor({
      selector: '', offsetXPercent: 0.5, offsetYPercent: 0.5,
      pageXPercent: 0.3, pageYPercent: 0.4, pathname: '/products',
      viewport: { width: 1000, height: 800 },
    })
    expect(pos).not.toBeNull()
    expect(pos!.strategy).toBe('page')
  })
})
