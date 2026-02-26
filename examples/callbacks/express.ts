// Mount at app.get('/api/preview-comments/callback', handler)
import express from 'express'

const app = express()

app.get('/api/preview-comments/callback', async (req, res) => {
  const code = req.query.code as string | undefined
  if (!code) {
    return res.status(400).send('Missing code')
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
    return res.status(400).send(`OAuth error: ${error ?? 'missing access_token'}`)
  }

  return res.type('html').send(`<script>
    window.opener.postMessage({ type: 'preview-comments:token', token: '${access_token}' }, '*')
    window.close()
  </script>`)
})

export default app
