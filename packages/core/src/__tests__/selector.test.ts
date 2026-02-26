import { describe, it, expect, beforeEach } from 'vitest'
import { generateSelector } from '../selector'

describe('generateSelector', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(container)
  })

  it('prefers data-testid', () => {
    container.innerHTML = '<button data-testid="submit-btn">Submit</button>'
    const el = container.querySelector('button')!
    expect(generateSelector(el)).toBe('[data-testid="submit-btn"]')
  })

  it('falls back to id', () => {
    container.innerHTML = '<button id="my-btn">Click</button>'
    const el = container.querySelector('button')!
    expect(generateSelector(el)).toBe('#my-btn')
  })

  it('generates a path selector when no id or testid', () => {
    container.innerHTML = '<div><span><a>Link</a></span></div>'
    const el = container.querySelector('a')!
    const selector = generateSelector(el)
    expect(document.querySelector(selector)).toBe(el)
  })

  it('handles body as root', () => {
    const selector = generateSelector(document.body)
    expect(selector).toBe('body')
  })
})
