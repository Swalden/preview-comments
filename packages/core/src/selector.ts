export function generateSelector(el: Element): string {
  if (el === document.documentElement) return 'html'
  if (el === document.body) return 'body'

  const testId = el.getAttribute('data-testid')
  if (testId) return `[data-testid="${testId}"]`
  if (el.id) return `#${el.id}`

  const path: string[] = []
  let current: Element | null = el

  while (current && current !== document.documentElement) {
    if (current === document.body) {
      path.unshift('body')
      break
    }
    const testId = current.getAttribute('data-testid')
    if (testId) { path.unshift(`[data-testid="${testId}"]`); break }
    if (current.id) { path.unshift(`#${current.id}`); break }

    const parent: Element | null = current.parentElement
    if (!parent) { path.unshift(current.tagName.toLowerCase()); break }

    const siblings: Element[] = Array.from(parent.children)
    const sameTag = siblings.filter((s: Element) => s.tagName === current!.tagName)
    const tag = current.tagName.toLowerCase()

    if (sameTag.length === 1) {
      path.unshift(tag)
    } else {
      const index = sameTag.indexOf(current) + 1
      path.unshift(`${tag}:nth-of-type(${index})`)
    }
    current = parent
  }
  const selector = path.join(' > ')
  return selector.length > 0 ? selector : 'body'
}
