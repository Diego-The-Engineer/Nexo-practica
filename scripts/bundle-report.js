import { build, analyzeMetafile } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('.cache', { recursive: true })
const result = await build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  write: false,
  metafile: true,
  minify: true,
  splitting: true,
  format: 'esm',
  outdir: '.cache/bundle',
  loader: { '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"' },
})
writeFileSync('.cache/bundle-meta.json', JSON.stringify(result.metafile, null, 2))
console.log(await analyzeMetafile(result.metafile, { verbose: false }))
