/* Records computed styles, element boxes and screenshots for every scenario, so a refactor can be compared against a baseline.
   usage: node scripts/visual/capture.mjs --out .visual/baseline [--only regex] [--merge] [--viewports 375,1440] [--base http://localhost:3199] [--concurrency 4] [--list] */
import { chromium } from 'playwright-core'
import { spawn, execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { PROPS, MOTION_PROPS } from './props.mjs'
import { SESSIONS } from './sessions.mjs'
import { SCENARIOS, HEIGHT } from './scenarios.mjs'

const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
const FIXED_TIME = new Date('2026-11-07T10:00:00+07:00')
const FREEZE = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}'
const SLICE = 6000

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true
}
const out = path.resolve(arg('out', '.visual/current'))
const only = arg('only') ? new RegExp(arg('only')) : null
const vpFilter = arg('viewports') ? String(arg('viewports')).split(',').map(Number) : null
const concurrency = Number(arg('concurrency', 4))
let base = arg('base', null)

// Pure function, serialised into the page: interned computed-style table for every element.
function collect({ props, pseudo }) {
  const SKIP = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'TEMPLATE', 'TITLE', 'HEAD'])
  const table = [], index = new Map()
  const intern = (s) => {
    let i = index.get(s)
    if (i === undefined) { i = table.length; table.push(s); index.set(s, i) }
    return i
  }
  const round = (n) => Math.round(n * 100) / 100
  const rows = [], pseudoRows = []
  for (const el of [document.documentElement, ...document.body.querySelectorAll('*')]) {
    if (SKIP.has(el.tagName) || el.closest('next-route-announcer, nextjs-portal')) continue
    const cs = getComputedStyle(el), r = el.getBoundingClientRect()
    rows.push([intern(el.tagName), round(r.x + scrollX), round(r.y + scrollY), round(r.width), round(r.height), ...props.map((p) => intern(cs.getPropertyValue(p)))])
    if (!pseudo) continue
    for (const ps of ['::before', '::after']) {
      const c = getComputedStyle(el, ps), content = c.getPropertyValue('content')
      if (content && content !== 'none' && content !== 'normal') pseudoRows.push([rows.length - 1, intern(ps), ...props.map((p) => intern(c.getPropertyValue(p)))])
    }
  }
  return { table, rows, pseudoRows }
}

function git(cmd) { try { return execSync(`git ${cmd}`, { encoding: 'utf8', cwd: path.resolve('..') }).trim() } catch { return '' } }

async function serve() {
  const port = 3199
  base = `http://localhost:${port}`
  const proc = spawn('npx', ['next', 'start', '-p', String(port)], { stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(base)).ok) return proc } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500))
  }
  proc.kill()
  throw new Error('next start did not come up (run npm run build first)')
}

/* A step can lose a race with a re-render under load; one retry keeps recordings from flaking. */
const retry = async (fn) => { try { await fn() } catch { await new Promise((r) => setTimeout(r, 600)); await fn() } }

const locate = (page, s) => {
  const root = s.in ? locate(page, s.in) : page
  const l = s.role ? root.getByRole(s.role, { name: s.name, exact: s.exact }) : s.label ? root.getByLabel(s.label, { exact: s.exact }) : s.placeholder ? root.getByPlaceholder(s.placeholder, { exact: s.exact }) : root.getByText(s.text, { exact: s.exact })
  return l.nth(s.nth ?? 0)
}

/* Makes the page state independent of timing: all images loaded, scroll at the top, the mouse out of the way (unless the scenario is about hover). */
async function settlePage(page, keepPointer) {
  if (!keepPointer) await page.mouse.move(0, 0)
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach((i) => { i.loading = 'eager' })
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.addEventListener('load', r); i.addEventListener('error', r) }))))
    await Promise.all([...document.images].map((i) => i.decode?.().catch(() => {})))
    await document.fonts.ready
  })
  if (!keepPointer) await page.evaluate(() => window.scrollTo(0, 0))
  // GSAP ScrollTrigger measures pins on resize; without this, the page height depends on when the last measurement ran.
  await page.evaluate(() => window.dispatchEvent(new Event('resize')))
  await page.waitForTimeout(450)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
}

async function snapshot(page, dir, name, vw, error, keepPointer, tiles) {
  await settlePage(page, keepPointer)
  const motion = await page.evaluate(collect, { props: MOTION_PROPS, pseudo: false })
  const freeze = await page.addStyleTag({ content: FREEZE })
  await page.waitForTimeout(150)
  const style = await page.evaluate(collect, { props: PROPS, pseudo: true })
  const text = await page.evaluate(() => document.body.innerText)
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const meta = { name, vw, height, error: error ?? null, text, motion, style }
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${name}.json.gz`), zlib.gzipSync(JSON.stringify(meta)))
  if (tiles) {
    const vh = HEIGHT[vw]
    for (let i = 0, y = 0; y < height; i++, y += vh) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y)
      await page.waitForTimeout(1300) // scrubbed GSAP animations catch up with the scroll position
      await page.screenshot({ path: path.join(dir, `${name}.${i}.png`), animations: 'disabled', caret: 'hide' })
    }
    await page.evaluate(() => window.scrollTo(0, 0))
  }
  else for (let i = 0, y = 0; y < height; i++, y += SLICE) {
    await page.screenshot({ path: path.join(dir, `${name}.${i}.png`), fullPage: true, clip: { x: 0, y, width: vw, height: Math.min(SLICE, height - y) }, animations: 'disabled', caret: 'hide' })
  }
  await freeze.evaluate((n) => n.remove())
}

async function runTask(browser, task) {
  const { scenario: s, vw } = task
  const ctx = await browser.newContext({ viewport: { width: vw, height: HEIGHT[vw] }, deviceScaleFactor: 1, reducedMotion: 'reduce', locale: 'id-ID', timezoneId: 'Asia/Jakarta', colorScheme: 'light', serviceWorkers: 'block' })
  await ctx.addInitScript((session) => {
    let a = 0x9e3779b9
    Math.random = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
    if (session) localStorage.setItem('saksi:session-v2', JSON.stringify(session))
  }, s.session ? SESSIONS[s.session] : null)
  // the real backend is slow and changes over time; refusing it makes the app use its local fallback, so runs stay repeatable
  await ctx.route(/azurewebsites\.net|localhost:8080/, (r) => r.abort())
  const page = await ctx.newPage()
  await page.clock.setFixedTime(FIXED_TIME)
  const dir = path.join(out, s.id, String(vw))
  const keepPointer = s.steps.some((x) => x.hover)
  let snaps = 0
  const errors = []
  const error = () => (errors.length ? errors.join(' ; ') : null)
  const settle = async () => { await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(350) }
  try {
    await page.goto(base + s.path, { waitUntil: 'networkidle' })
    await settle()
    for (const step of s.steps) {
      if (step.only && !step.only.includes(vw)) continue
      try {
        if (step.snap) { await settle(); await snapshot(page, dir, step.snap, vw, error(), keepPointer, s.tiles); snaps++ }
        else if (step.wait) await page.waitForTimeout(step.wait)
        else if (step.click) await retry(() => locate(page, step.click).click({ timeout: 4000 }))
        else if (step.hover) await retry(() => locate(page, step.hover).hover({ timeout: 4000 }))
        else if (step.check) await retry(() => locate(page, step.check).check({ force: true, timeout: 4000 }))
        else if (step.fill) await retry(() => locate(page, step.fill).fill(step.value, { timeout: 4000 }))
        else if (step.select) await retry(() => locate(page, step.select).selectOption(step.value, { timeout: 4000 }))
        if (!step.snap) await page.waitForTimeout(120)
      } catch (e) {
        errors.push(`${JSON.stringify(step)}: ${String(e.message).split('\n')[0]}`)
      }
    }
    if (!s.steps.some((x) => x.snap) || s.steps.at(-1)?.snap === undefined) { await settle(); await snapshot(page, dir, snaps ? 'end' : 'main', vw, error(), keepPointer, s.tiles); snaps++ }
  } catch (e) {
    errors.push(`navigation: ${String(e.message).split('\n')[0]}`)
  } finally {
    await ctx.close()
  }
  return { id: `${s.id}@${vw}`, snaps, error: error() }
}

const tasks = SCENARIOS.filter((s) => !only || only.test(s.id)).flatMap((scenario) => scenario.viewports.filter((v) => !vpFilter || vpFilter.includes(v)).map((vw) => ({ scenario, vw })))
if (arg('list')) { console.log(tasks.map((t) => `${t.scenario.id}@${t.vw}`).join('\n')); console.log(`\n${tasks.length} captures`); process.exit(0) }

const server = base ? null : await serve()
const browser = await chromium.launch({ executablePath: BRAVE, headless: true, args: ['--no-first-run', '--disable-brave-update', '--force-color-profile=srgb'] })
if (!arg('merge')) fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out, { recursive: true })
if (!arg('merge')) fs.writeFileSync(path.join(out, '_meta.json'), JSON.stringify({ at: new Date().toISOString(), head: git('rev-parse --short HEAD'), changes: git('status --porcelain').split('\n').length, diffHash: git('diff HEAD').length, tasks: tasks.length }, null, 2))

const queue = [...tasks], results = [], started = Date.now()
await Promise.all(Array.from({ length: concurrency }, async () => {
  for (let t; (t = queue.shift()); ) {
    const r = await runTask(browser, t)
    results.push(r)
    console.log(`${r.error ? 'WARN' : 'ok  '} ${r.id.padEnd(60)} ${r.snaps} snap${r.error ? '  ' + r.error.slice(0, 140) : ''}  [${results.length}/${tasks.length}]`)
  }
}))
await browser.close()
server?.kill()
const warned = results.filter((r) => r.error)
console.log(`\n${results.length} captures in ${Math.round((Date.now() - started) / 1000)}s, ${warned.length} with step errors -> ${out}`)
