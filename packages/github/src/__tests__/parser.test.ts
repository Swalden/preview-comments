import { describe, expect, it } from 'vitest'
import type { PinAnchor } from '@preview-comments/core'
import { parseThread, serializeThread } from '../parser'

const anchor: PinAnchor = {
  selector: '#app',
  offsetXPercent: 0.5,
  offsetYPercent: 0.3,
  pageXPercent: 0.25,
  pageYPercent: 0.15,
  pathname: '/products/123',
  viewport: { width: 1920, height: 1080 },
}

describe('serializeThread', () => {
  it('produces markdown with hidden metadata', () => {
    const body = serializeThread(anchor, [
      { body: 'This button looks off', author: 'alice' },
    ])
    expect(body).toContain('Preview comment')
    expect(body).toContain('/products/123')
    expect(body).toContain('This button looks off')
    expect(body).toContain('<!-- preview-comments:')
  })
})

describe('parseThread', () => {
  it('round-trips through serialize/parse', () => {
    const body = serializeThread(anchor, [
      { body: 'Looks broken', author: 'alice' },
    ])
    const parsed = parseThread(body)
    expect(parsed).not.toBeNull()
    expect(parsed?.anchor.selector).toBe('#app')
    expect(parsed?.anchor.pathname).toBe('/products/123')
    expect(parsed?.comments).toHaveLength(1)
    expect(parsed?.comments[0].body).toBe('Looks broken')
  })

  it('returns null for non-preview-comments body', () => {
    expect(parseThread('Just a regular PR comment')).toBeNull()
  })

  it('parses multiple replies', () => {
    const body = serializeThread(anchor, [
      { body: 'First comment', author: 'alice' },
      { body: 'Second comment', author: 'bob' },
    ])
    const parsed = parseThread(body)
    expect(parsed?.comments).toHaveLength(2)
    expect(parsed?.comments[1].body).toBe('Second comment')
  })
})
