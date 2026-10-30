// Build the React + CSS reconstruction of https://midu.design into ./dist
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(ROOT, "dist");

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

await build({
  entryPoints: [path.join(ROOT, "src/main.jsx")],
  bundle: true,
  outfile: path.join(DIST, "app.js"),
  format: "iife",
  target: ["chrome110", "firefox110", "safari16"],
  jsx: "automatic",
  minify: true,
  legalComments: "none",
  define: { "process.env.NODE_ENV": '"production"' },
});

fs.copyFileSync(path.join(ROOT, "src/styles/framer.css"), path.join(DIST, "framer.css"));
fs.copyFileSync(path.join(ROOT, "public/index.html"), path.join(DIST, "index.html"));
fs.cpSync(path.join(ROOT, "assets"), path.join(DIST, "assets"), { recursive: true });

const size = (p) => (fs.statSync(p).size / 1024).toFixed(1) + " KB";
console.log("dist/app.js    ", size(path.join(DIST, "app.js")));
console.log("dist/framer.css", size(path.join(DIST, "framer.css")));
console.log("dist/index.html", size(path.join(DIST, "index.html")));
console.log("dist/assets    ", fs.readdirSync(path.join(DIST, "assets")).length, "files");
