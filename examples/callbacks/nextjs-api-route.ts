// Place at app/api/preview-comments/callback/route.ts (App Router)
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const { access_token, error } = await tokenResponse.json() as { access_token?: string; error?: string }
  if (error || !access_token) {
    return NextResponse.json({ error: error ?? 'missing access_token' }, { status: 400 })
  }

  return new NextResponse(`<script>
    window.opener.postMessage({ type: 'preview-comments:token', token: '${access_token}' }, '*')
    window.close()
  </script>`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
