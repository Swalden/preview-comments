// Deploy as a Cloudflare Worker. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET as secrets.
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')

    if (!code) {
      return new Response('Missing code', { status: 400 })
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const { access_token, error } = await tokenResponse.json() as { access_token?: string; error?: string }
    if (error || !access_token) {
      return new Response(`OAuth error: ${error ?? 'missing access_token'}`, { status: 400 })
    }

    return new Response(`<script>
      window.opener.postMessage({ type: 'preview-comments:token', token: '${access_token}' }, '*')
      window.close()
    </script>`, {
      headers: { 'Content-Type': 'text/html' },
    })
  },
}
