/* Records the current build, compares it with the baseline, and re-records only the snapshots that differ (a real change repeats, rendering noise does not).
   usage: node scripts/visual/verify.mjs [--out .visual/after] [--baseline .visual/baseline] [--only regex] [--retries 2] [--max 8] [--skip-capture] */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { compareSnapshot, walkSnapshots } from './compare.mjs'

const argv = process.argv
const arg = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d)
const baseline = path.resolve(arg('baseline', '.visual/baseline'))
const out = path.resolve(arg('out', '.visual/after'))
const only = arg('only', null)
const retries = Number(arg('retries', 2))
const MAX = Number(arg('max', 8))

const capture = (dir, extra = []) => {
  const r = spawnSync('node', ['scripts/visual/capture.mjs', '--out', dir, ...extra], { stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' })
  const tail = r.stdout.trim().split('\n').slice(-1)[0]
  console.log('  ' + tail)
  return r.status === 0
}

if (!argv.includes('--skip-capture')) { console.log(`recording ${out}`); capture(out, only ? ['--only', only] : []) }

let failing = new Map()
const all = walkSnapshots(baseline).filter((f) => (!only || new RegExp(only).test(f)))
for (const f of all) {
  const r = await compareSnapshot(baseline, out, f, { max: MAX, diffDir: path.join(out, '_diff') })
  if (r.bad) failing.set(f, r)
}
console.log(`first pass: ${all.length - failing.size}/${all.length} snapshots match`)

for (let n = 1; n <= retries && failing.size; n++) {
  const ids = [...new Set([...failing.keys()].map((f) => f.split('/')[0]))]
  const dir = path.resolve(`${out}-retry${n}`)
  console.log(`retry ${n}: re-recording ${ids.length} scenario(s) that differ`)
  capture(dir, ['--only', `^(${ids.map((i) => i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`])
  for (const f of [...failing.keys()]) {
    const r = await compareSnapshot(baseline, dir, f, { max: MAX })
    if (!r.bad) failing.delete(f)
    else failing.set(f, r)
  }
  console.log(`  still different: ${failing.size}`)
}

if (!failing.size) { console.log('\nPASS: every snapshot matches the baseline'); process.exit(0) }
console.log(`\nFAIL: ${failing.size} snapshot(s) differ in every attempt`)
for (const [f, r] of failing) { console.log(`DIFF ${f}`); r.lines.slice(0, MAX).forEach((l) => console.log('       ' + l)) }
process.exit(1)
