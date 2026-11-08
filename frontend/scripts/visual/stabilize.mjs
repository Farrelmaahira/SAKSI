/* Makes a baseline trustworthy: where two recordings of the same build disagree, records a third and fourth time and keeps the majority.
   usage: node scripts/visual/stabilize.mjs --baseline .visual/baseline --second .visual/rerun */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { compareSnapshot, walkSnapshots } from './compare.mjs'

const argv = process.argv
const arg = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d)
const A = path.resolve(arg('baseline', '.visual/baseline')), B = path.resolve(arg('second', '.visual/rerun'))
const C = path.resolve('.visual/tie1'), D = path.resolve('.visual/tie2')

const differing = []
for (const f of walkSnapshots(A)) { const r = await compareSnapshot(A, B, f); if (r.bad) differing.push(f) }
console.log(`${differing.length} snapshot(s) disagree between the two recordings`)
if (!differing.length) process.exit(0)
const ids = [...new Set(differing.map((f) => f.split('/')[0]))]
const only = `^(${ids.map((i) => i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`
for (const dir of [C, D]) { console.log(`recording ${ids.length} scenario(s) into ${path.basename(dir)}`); spawnSync('node', ['scripts/visual/capture.mjs', '--out', dir, '--only', only], { stdio: 'ignore' }) }

const copyAll = (from, to, rel) => { const base = rel.replace(/\.json\.gz$/, ''); for (const e of fs.readdirSync(path.dirname(path.join(from, rel)))) if (e === path.basename(rel) || (e.startsWith(path.basename(base) + '.') && e.endsWith('.png'))) { fs.mkdirSync(path.dirname(path.join(to, rel)), { recursive: true }); fs.copyFileSync(path.join(path.dirname(path.join(from, rel)), e), path.join(path.dirname(path.join(to, rel)), e)) } }
let kept = 0, switched = 0, unresolved = []
for (const f of differing) {
  const cands = [A, B, C, D].filter((d) => fs.existsSync(path.join(d, f)))
  const groups = []
  for (const d of cands) {
    let placed = false
    for (const g of groups) if (!(await compareSnapshot(g[0], d, f)).bad) { g.push(d); placed = true; break }
    if (!placed) groups.push([d])
  }
  groups.sort((x, y) => y.length - x.length)
  if (groups[0].length < 2 || (groups[1] && groups[1].length === groups[0].length)) { unresolved.push(f); continue }
  if (groups[0].includes(A)) kept++
  else { copyAll(groups[0][0], A, f); switched++ }
}
console.log(`kept baseline for ${kept}, replaced with the majority value for ${switched}`)
if (unresolved.length) { console.log(`no majority for ${unresolved.length}:`); unresolved.forEach((f) => console.log('  ' + f)) }
process.exit(unresolved.length ? 1 : 0)
