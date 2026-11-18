#!/usr/bin/env node
/**
 * Genera los iconos PWA a partir de los SVG fuente de public/ (logo.svg, icon.svg, icon-maskable.svg).
 * No instala nada: usa el Chrome/Edge/Chromium del sistema en modo headless.
 *
 *   node scripts/generate-icons.mjs
 *
 * Fuente del logo (reutilizable en la app móvil): public/logo.svg
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)
const chrome = candidates.find((p) => existsSync(p))
if (!chrome) {
  console.error('No se encontró Chrome/Edge/Chromium. Define CHROME_PATH.')
  process.exit(1)
}

const jobs = [
  ['icon.svg', 192, 'icon-192.png', true],
  ['icon.svg', 512, 'icon-512.png', true],
  ['icon-maskable.svg', 512, 'icon-maskable-512.png', false],
  ['icon-maskable.svg', 180, 'apple-touch-icon.png', false],
  ['logo.svg', 64, 'favicon-64.png', true],
]

const tmp = mkdtempSync(join(tmpdir(), 'episafe-icons-'))
try {
  for (const [src, size, out, transparent] of jobs) {
    const svg = readFileSync(join(pub, src), 'utf8').replace('<svg ', `<svg width="${size}" height="${size}" `)
    const html = join(tmp, `${out}.html`)
    writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent;overflow:hidden}svg{display:block}</style>${svg}`)
    const r = spawnSync(
      chrome,
      ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${size},${size}`, `--screenshot=${join(pub, out)}`, '--default-background-color=00000000', pathToFileURL(html).href],
      { stdio: 'pipe' },
    )
    if (r.status !== 0 || !existsSync(join(pub, out))) {
      console.error(`Falló ${out}`, r.stderr?.toString())
      process.exit(1)
    }
    console.log(`ok  ${out} (${size}x${size}) <- ${src}${transparent ? '' : ' (sin transparencia)'}`)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
