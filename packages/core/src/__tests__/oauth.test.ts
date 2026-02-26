import { beforeEach, describe, expect, it } from 'vitest'
import { createOAuthManager } from '../oauth'

describe('createOAuthManager', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores and retrieves a token', () => {
    const oauth = createOAuthManager({ clientId: 'test', callbackUrl: 'http://localhost/cb' })
    oauth.setToken('ghp_abc123')
    expect(oauth.getToken()).toBe('ghp_abc123')
  })

  it('persists token in localStorage', () => {
    const oauth = createOAuthManager({ clientId: 'test', callbackUrl: 'http://localhost/cb' })
    oauth.setToken('ghp_abc123')

    const oauth2 = createOAuthManager({ clientId: 'test', callbackUrl: 'http://localhost/cb' })
    expect(oauth2.getToken()).toBe('ghp_abc123')
  })

  it('clears token on logout', () => {
    const oauth = createOAuthManager({ clientId: 'test', callbackUrl: 'http://localhost/cb' })
    oauth.setToken('ghp_abc123')
    oauth.clearToken()
    expect(oauth.getToken()).toBeNull()
  })

  it('builds correct auth URL', () => {
    const oauth = createOAuthManager({ clientId: 'my-client', callbackUrl: 'http://localhost/cb' })
    const url = oauth.getAuthUrl()
    expect(url).toContain('client_id=my-client')
    expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%2Fcb')
    expect(url).toContain('scope=repo')
  })
})
