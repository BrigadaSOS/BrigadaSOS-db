import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import serverless from "serverless-http";

const isTest = process.env.VITEST
const app = express()

function listDirectoryContents(directory) {
  fs.readdir(directory, (err, files) => {
      if (err) {
          console.error('Error al leer el directorio:', err);
          return;
      }
      files.forEach(file => {
          console.log(file);
      });
  });
}

function listSubdirectories(dir, depth, currentLevel = 0) {
  if (currentLevel > depth) return;

  let files;
  try {
      files = fs.readdirSync(dir);
  } catch (err) {
      console.error(`Error leyendo el directorio ${dir}:`, err);
      return;
  }

  files.forEach(file => {
      let fullPath = path.join(dir, file);
      try {
          if (fs.statSync(fullPath).isDirectory()) {
              console.log(' '.repeat(currentLevel * 2) + file);
              listSubdirectories(fullPath, depth, currentLevel + 1);
          }
      } catch (err) {
          console.error(`Error accediendo a ${fullPath}:`, err);
      }
  });
}



export async function createServer(root = process.cwd(), isProd = process.env.NODE_ENV !== 'production', hmrPort) {
  console.log('Current directory: ' + process.cwd());
  // ./frontend/netlify/
  //listDirectoryContents('../../');
  listDirectoryContents('./frontend');

  
  const indexProd = isProd ? fs.readFileSync(('../client/index.html'), 'utf-8') : ''

  const manifest = isProd ? JSON.parse(fs.readFileSync(('/client/.vite/ssr-manifest.json'), 'utf-8')) : {}

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite
  if (!isProd) {
    vite = await (
      await import('vite')
    ).createServer({
      base: '/',
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: true,
        watch: {
          usePolling: true,
          interval: 100
        },
        hmr: {
          port: hmrPort
        }
      },
      appType: 'custom'
    })
    app.use(vite.middlewares)
  } else {
    app.use((await import('compression')).default())
    app.use(
      '/',
      (await import('serve-static')).default(resolve('/client'), {
        index: false
      })
    )
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      let template, render
      if (!isProd) {
        template = fs.readFileSync(resolve('index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.js')).render
      } else {
        template = indexProd
        render = (await import('./server/entry-server.js')).render
      }

      const [appHtml, preloadLinks] = await render(url, manifest)

      const html = template.replace(`<!--preload-links-->`, preloadLinks).replace(`<!--app-html-->`, appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })
  
  return { app, vite }
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(5173, () => {
      console.log('http://localhost:5173')
    })
  )
}


export const handler = serverless(app);
