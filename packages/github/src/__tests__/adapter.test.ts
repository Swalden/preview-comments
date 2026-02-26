import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PinAnchor } from '@preview-comments/core'
import { createGitHubAdapter } from '../adapter'
import { serializeThread } from '../parser'

const anchor: PinAnchor = {
  selector: '#app',
  offsetXPercent: 0.5,
  offsetYPercent: 0.3,
  pageXPercent: 0.25,
  pageYPercent: 0.15,
  pathname: '/products/123',
  viewport: { width: 1920, height: 1080 },
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('createGitHubAdapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('throws when token is missing', async () => {
    const adapter = createGitHubAdapter({
      repo: 'owner/repo',
      pr: 1,
      getToken: () => null,
    })

    await expect(adapter.getThreads()).rejects.toThrow('Not authenticated')
  })

  it('returns only preview-comment threads', async () => {
    const body = serializeThread(anchor, [{ author: 'alice', body: 'Looks broken' }])
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      jsonResponse([
        { id: 1, body, created_at: '2026-01-01T00:00:00.000Z' },
        { id: 2, body: 'regular comment', created_at: '2026-01-01T00:00:00.000Z' },
      ]),
    ))

    const adapter = createGitHubAdapter({
      repo: 'owner/repo',
      pr: 1,
      getToken: () => 'token',
    })

    const threads = await adapter.getThreads()
    expect(threads).toHaveLength(1)
    expect(threads[0].id).toBe('1')
    expect(threads[0].comments[0].body).toBe('Looks broken')
  })

  it('creates a thread', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ login: 'alice', avatar_url: 'https://avatar' }))
      .mockResolvedValueOnce(jsonResponse({
        id: 5,
        body: serializeThread(anchor, [{ author: 'alice', body: 'New thread' }]),
        created_at: '2026-01-01T00:00:00.000Z',
      }))
    vi.stubGlobal('fetch', fetchMock)

    const adapter = createGitHubAdapter({
      repo: 'owner/repo',
      pr: 123,
      getToken: () => 'token',
    })

    const thread = await adapter.createThread(anchor, 'New thread')
    expect(thread.id).toBe('5')
    expect(thread.comments[0].author.name).toBe('alice')
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.github.com/repos/owner/repo/issues/123/comments',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('adds a reply to an existing thread', async () => {
    const originalBody = serializeThread(anchor, [{ author: 'alice', body: 'First' }])
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ login: 'bob', avatar_url: 'https://avatar' }))
      .mockResolvedValueOnce(jsonResponse({ id: 10, body: originalBody, created_at: '2026-01-01T00:00:00.000Z' }))
      .mockResolvedValueOnce(jsonResponse({ id: 10, body: 'updated', created_at: '2026-01-01T00:00:00.000Z' }))
    vi.stubGlobal('fetch', fetchMock)

    const adapter = createGitHubAdapter({
      repo: 'owner/repo',
      pr: 123,
      getToken: () => 'token',
    })

    const comment = await adapter.addComment('10', 'Second')
    expect(comment.id).toBe('10-1')
    expect(comment.body).toBe('Second')
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'https://api.github.com/repos/owner/repo/issues/comments/10',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })
})
