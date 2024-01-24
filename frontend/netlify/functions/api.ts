import express, { Router } from "express";
import serverless from "serverless-http";
import fs from "node:fs";
import path from "node:path";

const api = express();

const isProd = process.env.NODE_ENV === "production"
let   root = process.cwd()

const __dirname = require('path').dirname(__filename);
const resolve = (p) => path.resolve(__dirname, p);

const indexProd = isProd
  ? fs.readFileSync(resolve("dist/client/index.html"), "utf-8")
  : "";

const manifest = isProd
  ? JSON.parse(
    fs.readFileSync(resolve("dist/client/ssr-manifest.json"), "utf-8")
  )
  : {};


let vite;
if (!isProd) {
  vite = await (
    await import("vite")
  )
  api.use(vite.middlewares);
} else {
  api.use(
    "/",
    (await import("serve-static")).default(resolve("dist/client"), {
      index: false,
    })
  );
}


api.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;

      let template, render;
      if (!isProd) {
        template = fs.readFileSync(resolve("index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule("/src/entry-server.js")).render;
      } else {
        template = indexProd;
        render = (await import("../../dist/server/entry-server.js")).render;
      }

      const [appHtml, preloadLinks] = await render(url, manifest);

      const html = template
        .replace(`<!--preload-links-->`, preloadLinks)
        .replace(`<!--app-html-->`, appHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite && vite.ssrFixStacktrace(e);
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

export const handler = serverless(api);

