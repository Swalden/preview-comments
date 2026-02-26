const STORAGE_KEY = 'preview-comments:github-token'

export interface OAuthConfig {
  clientId: string
  callbackUrl: string
}

export interface OAuthManager {
  getToken(): string | null
  setToken(token: string): void
  clearToken(): void
  getAuthUrl(): string
  openPopup(): Promise<string>
}

export function createOAuthManager(config: OAuthConfig): OAuthManager {
  const { clientId, callbackUrl } = config

  function getToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  }

  function setToken(token: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, token)
    } catch {
      // localStorage may be unavailable.
    }
  }

  function clearToken(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage may be unavailable.
    }
  }

  function getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: 'repo',
    })
    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  function openPopup(): Promise<string> {
    return new Promise((resolve, reject) => {
      const popup = window.open(getAuthUrl(), 'preview-comments-auth', 'width=600,height=700')
      if (!popup) {
        reject(new Error('Popup blocked'))
        return
      }

      function onMessage(event: MessageEvent): void {
        if (event.data?.type === 'preview-comments:token') {
          window.removeEventListener('message', onMessage)
          const token = String(event.data.token ?? '')
          setToken(token)
          resolve(token)
          return
        }

        if (event.data?.type === 'preview-comments:error') {
          window.removeEventListener('message', onMessage)
          reject(new Error(event.data.message ?? 'OAuth failed'))
        }
      }

      window.addEventListener('message', onMessage)
    })
  }

  return { getToken, setToken, clearToken, getAuthUrl, openPopup }
}
