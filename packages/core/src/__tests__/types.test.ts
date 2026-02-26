import { describe, it, expect } from 'vitest'
import { isPinAnchor } from '../types'

describe('isPinAnchor', () => {
  it('returns true for a valid PinAnchor', () => {
    expect(isPinAnchor({
      selector: '#main',
      offsetXPercent: 0.5,
      offsetYPercent: 0.3,
      pageXPercent: 0.25,
      pageYPercent: 0.15,
      pathname: '/products/123',
      viewport: { width: 1920, height: 1080 },
    })).toBe(true)
  })

  it('returns false for missing fields', () => {
    expect(isPinAnchor({ selector: '#main' })).toBe(false)
  })

  it('returns false for non-objects', () => {
    expect(isPinAnchor(null)).toBe(false)
    expect(isPinAnchor('string')).toBe(false)
  })
})
