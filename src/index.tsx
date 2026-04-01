import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static files from dist directory
app.use('/*', serveStatic({ root: './dist' }))

// Fallback to index.html for SPA routing
app.get('*', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Prime Herb Gateway</title>
        <script>
          // Redirect to the main app
          window.location.href = '/index.html';
        </script>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/assets/index.js"></script>
      </body>
    </html>
  `)
})

export default app