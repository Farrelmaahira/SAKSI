import fs from 'node:fs'; import zlib from 'node:zlib'
import { PROPS } from './props.mjs'
const [,, f, ...rows] = process.argv
const r = (d) => JSON.parse(zlib.gunzipSync(fs.readFileSync(`.visual/${d}/${f}`))).style
const a = r('baseline'), b = r('after-sub')
const get = (o, i) => { const x = o.rows[i]; return { tag: o.table[x[0]], box: x.slice(1, 5), st: Object.fromEntries(PROPS.map((p, j) => [p, o.table[x[5 + j]]])) } }
for (const i of rows.map(Number)) { const A = get(a, i), B = get(b, i); console.log(i, A.tag, A.box, '->', B.box); for (const p of PROPS) if (A.st[p] !== B.st[p]) console.log('   ', p, A.st[p], '->', B.st[p]) }
