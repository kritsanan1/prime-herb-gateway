// Cloudflare Workers entry point — only used in production build
// @ts-nocheck
import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

app.use('/*', serveStatic({ root: './dist' }))

app.get('*', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Dr. Arty Prime Herb Intimate Care</title>
        <script>window.location.href = '/index.html';</script>
      </head>
      <body><div id="root"></div></body>
    </html>
  `)
})

export default app
