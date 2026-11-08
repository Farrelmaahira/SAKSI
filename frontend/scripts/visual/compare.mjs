/* Compares two capture folders. Proof of "no style change" is the computed style and box of every element plus the visible text (layout noise under 0.1px ignored).
   Screenshots are a coarse safety net, because identical code renders with anti-aliasing noise: a slice fails when more than 1% of its pixels
   differ by over 48/255, or more than 0.05% differ by over 128/255, or its size changes.
   usage: node scripts/visual/compare.mjs .visual/baseline .visual/current [--only regex] [--max 12] [--list-failed] */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'
import { PROPS, MOTION_PROPS } from './props.mjs'

const NUM = /-?\d+(?:\.\d+)?/g
/* Layout noise: 0.1px, plus 0.05% of the size (a 460px headline measures up to 0.3px differently between runs). A design step is at least ~1px. */
const close = (x, y) => Math.abs(x - y) < 0.1 + 0.0005 * Math.max(Math.abs(x), Math.abs(y))
function near(a, b) {
  if (a === b) return true
  if (typeof a !== 'string' || typeof b !== 'string') return close(a, b)
  if (a.replace(NUM, '#') !== b.replace(NUM, '#')) return false
  const na = a.match(NUM), nb = b.match(NUM)
  return na.every((v, i) => close(Number(v), Number(nb[i])))
}
const read = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f)))

function diffRows(label, a, b, props, offset, lines, max) {
  if (a.rows.length !== b.rows.length) { lines.push(`${label}: ${a.rows.length} elements before, ${b.rows.length} after (structure changed)`); return 1 }
  let bad = 0
  a.rows.forEach((ra, i) => {
    const rb = b.rows[i]
    const found = []
    if (a.table[ra[0]] !== b.table[rb[0]]) found.push(`tag ${a.table[ra[0]]} -> ${b.table[rb[0]]}`)
    ;['x', 'y', 'w', 'h'].forEach((k, j) => { if (!near(ra[1 + j], rb[1 + j])) found.push(`${k}: ${ra[1 + j]} -> ${rb[1 + j]}`) })
    const at = (t, row, name) => t.table[row[offset + props.indexOf(name)]]
    props.forEach((p, j) => { const bc = p.match(/^border-(top|right|bottom|left)-color$/); if (bc && props.includes(`border-${bc[1]}-width`) && at(a, ra, `border-${bc[1]}-width`) === '0px' && at(b, rb, `border-${bc[1]}-width`) === '0px') return /* colour of a border that is not drawn */
      let va = a.table[ra[offset + j]], vb = b.table[rb[offset + j]]; if (p === 'background-position') { va = va.replace(/\b0px\b/g, '0%'); vb = vb.replace(/\b0px\b/g, '0%') } /* Chrome reports `background: var(--x)` as 0px 0px, a plain colour as 0% 0%: same place */ if (!near(va, vb)) found.push(`${p}: ${va} -> ${vb}`) })
    if (found.length) { bad++; if (lines.length < max) lines.push(`${label} #${i} <${a.table[ra[0]].toLowerCase()}> ${found.slice(0, 4).join(' | ')}${found.length > 4 ? ` (+${found.length - 4})` : ''}`) }
  })
  return bad
}

async function pixels(fa, fb, diffOut) {
  const [ia, ib] = await Promise.all([sharp(fa).ensureAlpha().raw().toBuffer({ resolveWithObject: true }), sharp(fb).ensureAlpha().raw().toBuffer({ resolveWithObject: true })])
  if (ia.info.width !== ib.info.width || ia.info.height !== ib.info.height) return { size: `${ia.info.width}x${ia.info.height} -> ${ib.info.width}x${ib.info.height}` }
  let n48 = 0, n128 = 0
  const diff = diffOut ? Buffer.from(ia.data) : null
  for (let i = 0; i < ia.data.length; i += 4) {
    const d = Math.max(Math.abs(ia.data[i] - ib.data[i]), Math.abs(ia.data[i + 1] - ib.data[i + 1]), Math.abs(ia.data[i + 2] - ib.data[i + 2]), Math.abs(ia.data[i + 3] - ib.data[i + 3]))
    if (d > 48) { n48++; if (d > 128) n128++; if (diff) { diff[i] = 255; diff[i + 1] = 0; diff[i + 2] = 60; diff[i + 3] = 255 } }
  }
  const total = ia.info.width * ia.info.height
  const fail = n48 / total > 0.01 || n128 / total > 0.0005
  if (fail && diffOut) { fs.mkdirSync(path.dirname(diffOut), { recursive: true }); await sharp(diff, { raw: ia.info }).png().toFile(diffOut) }
  return { fail, p48: n48 / total, p128: n128 / total }
}

/* one snapshot (e.g. "home/1440/main"): returns { bad, lines } */
export async function compareSnapshot(A, B, rel, { max = 12, diffDir = null } = {}) {
  const fb = path.join(B, rel)
  if (!fs.existsSync(fb)) return { bad: 1, lines: ['missing in second folder'], missing: true }
  const a = read(path.join(A, rel)), b = read(fb), lines = []
  let bad = 0
  if (a.error !== b.error) { lines.push(`step error: ${a.error} -> ${b.error}`); bad++ }
  if (a.text !== b.text) { lines.push('visible text differs'); bad++ }
  bad += diffRows('style', a.style, b.style, PROPS, 5, lines, max)
  bad += diffRows('motion', a.motion, b.motion, MOTION_PROPS, 5, lines, max)
  // same tolerance as for elements: numbers within layout noise are equal, everything else must match exactly
  const ps = (s) => s.pseudoRows.map((r) => [r[0], s.table[r[1]], ...r.slice(2).map((v) => s.table[v])])
  const pa = ps(a.style), pb = ps(b.style)
  if (pa.length !== pb.length || pa.some((r, i) => r.some((v, j) => !(v === pb[i][j] || (j > 1 && near(v, pb[i][j])))))) { lines.push('pseudo-element (::before/::after) styles differ'); bad++ }
  const base = rel.replace(/\.json\.gz$/, '')
  for (let i = 0; fs.existsSync(path.join(A, `${base}.${i}.png`)); i++) {
    const pb = path.join(B, `${base}.${i}.png`)
    if (!fs.existsSync(pb)) { lines.push(`screenshot ${i} missing`); bad++; continue }
    const r = await pixels(path.join(A, `${base}.${i}.png`), pb, diffDir ? path.join(diffDir, `${base}.${i}.png`) : null)
    if (r.size) { lines.push(`screenshot ${i} size ${r.size}`); bad++ }
    else if (r.fail) { lines.push(`screenshot ${i}: ${(r.p48 * 100).toFixed(2)}% of pixels differ by >48, ${(r.p128 * 100).toFixed(3)}% by >128`); bad++ }
  }
  return { bad, lines }
}

export const walkSnapshots = (d) => {
  const walk = (dir, rel = '') => fs.readdirSync(path.join(dir, rel), { withFileTypes: true }).flatMap((e) => (e.name.startsWith('_') ? [] : e.isDirectory() ? walk(dir, path.join(rel, e.name)) : [path.join(rel, e.name)]))
  return walk(d).filter((f) => f.endsWith('.json.gz'))
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv
  const [A, B] = argv.slice(2).filter((x) => !x.startsWith('--')).map((p) => path.resolve(p))
  const only = argv.includes('--only') ? new RegExp(argv[argv.indexOf('--only') + 1]) : null
  const MAX = argv.includes('--max') ? Number(argv[argv.indexOf('--max') + 1]) : 12
  const files = walkSnapshots(A).filter((f) => !only || only.test(f))
  let same = 0, failed = 0, missing = 0
  for (const f of files) {
    const r = await compareSnapshot(A, B, f, { max: MAX, diffDir: path.join(B, '_diff') })
    if (r.missing) { missing++; console.log(`MISSING  ${f}`) }
    else if (r.bad) { failed++; console.log(`DIFF     ${f}`); r.lines.slice(0, MAX).forEach((l) => console.log(`           ${l}`)) }
    else same++
  }
  console.log(`\n${files.length} snapshots: ${same} identical, ${failed} different, ${missing} missing`)
  process.exit(failed || missing ? 1 : 0)
}
