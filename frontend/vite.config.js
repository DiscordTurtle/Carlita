import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function scenesPlugin() {
  const dir = path.resolve('public/scenes')
  const safe = name => name.replace(/[<>:"/\\|?*]/g, '_')
  return {
    name: 'scenes',
    configureServer(server) {
      server.middlewares.use('/api/scenes', (req, res, next) => {
        fs.mkdirSync(dir, { recursive: true })
        const name = safe(decodeURIComponent(req.url.slice(1)))

        if (req.method === 'GET' && req.url === '/') {
          const files = fs.existsSync(dir)
            ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5))
            : []
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(files))
          return
        }
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => body += chunk)
          req.on('end', () => { fs.writeFileSync(path.join(dir, name + '.json'), body); res.end('ok') })
          return
        }
        if (req.method === 'DELETE') {
          const file = path.join(dir, name + '.json')
          if (fs.existsSync(file)) fs.unlinkSync(file)
          res.end('ok')
          return
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), scenesPlugin()],
  server: {
    host: true,
    port: 5000,
    watch: { ignored: ['**/public/sprites/**'] },
  },
  build: {
    rollupOptions: {
      input: {
        main:         'index.html',
        sceneBuilder: 'scene-builder.html',
      }
    }
  }
})
