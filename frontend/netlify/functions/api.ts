import express, { Router } from 'express'
import serverless from 'serverless-http'
import fs from 'node:fs'
import path from 'node:path'

import { createServer } from '../../server'
const api = express()

const router = Router()
const __dirname = require('path').dirname(__filename)
const resolve = (p) => path.resolve(__dirname, p)

router.get('/hello', (req, res) => res.send('Hello World!'))

api.use('/', router)


async function setupApi() {
  const serveStatic = (await import("serve-static")).default;
  api.use("/", serveStatic(resolve("dist/client"), { index: false }));
}

setupApi();


api.use('*', async (req, res) => {
  
  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  vite = await (
    await import("vite"))
  try {
    
    const url = req.originalUrl



    let template, render
    const indexProd = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8')

    template = indexProd
    render = (await import('./dist/server/entry-server.js')).render

    const manifest = JSON.parse(fs.readFileSync(resolve('dist/client/ssr-manifest.json'), 'utf-8'))

    const [appHtml, preloadLinks] = await render(url, manifest)

    const html = template.replace(`<!--preload-links-->`, preloadLinks).replace(`<!--app-html-->`, appHtml)

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    vite && vite.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

export const handler = serverless(api)
