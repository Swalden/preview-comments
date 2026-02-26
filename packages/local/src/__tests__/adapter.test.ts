import { describe, it, expect, beforeEach } from 'vitest'
import type { PinAnchor } from '@preview-comments/core'
import { createLocalStorageAdapter } from '../adapter'

const anchor: PinAnchor = {
  selector: '#app',
  offsetXPercent: 0.5,
  offsetYPercent: 0.5,
  pageXPercent: 0.5,
  pageYPercent: 0.5,
  pathname: '/demo',
  viewport: { width: 1200, height: 800 },
}

describe('createLocalStorageAdapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates and retrieves threads', async () => {
    const adapter = createLocalStorageAdapter()
    await adapter.createThread(anchor, 'First note')
    const threads = await adapter.getThreads()

    expect(threads).toHaveLength(1)
    expect(threads[0].comments[0].body).toBe('First note')
  })

  it('adds, edits, and deletes comments', async () => {
    const adapter = createLocalStorageAdapter()
    const thread = await adapter.createThread(anchor, 'Original')

    const reply = await adapter.addComment(thread.id, 'Reply text')
    const edited = await adapter.editComment(reply.id, 'Edited reply')
    expect(edited.body).toBe('Edited reply')

    await adapter.deleteComment(reply.id)
    const threads = await adapter.getThreads()
    expect(threads[0].comments).toHaveLength(1)
    expect(threads[0].comments[0].body).toBe('Original')
  })

  it('deletes thread when last comment is removed', async () => {
    const adapter = createLocalStorageAdapter()
    const thread = await adapter.createThread(anchor, 'Only comment')

    await adapter.deleteComment(thread.comments[0].id)
    const threads = await adapter.getThreads()
    expect(threads).toHaveLength(0)
  })

  it('persists across adapter instances', async () => {
    const adapter1 = createLocalStorageAdapter({ storageKey: 'custom-key' })
    await adapter1.createThread(anchor, 'Persist me')

    const adapter2 = createLocalStorageAdapter({ storageKey: 'custom-key' })
    const threads = await adapter2.getThreads()
    expect(threads).toHaveLength(1)
    expect(threads[0].comments[0].body).toBe('Persist me')
  })
})
