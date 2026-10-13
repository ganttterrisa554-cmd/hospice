import { readFile } from 'node:fs/promises'
import path from 'node:path'

// One-time migration: uploads local data/blaster/*.json to Vercel KV.
// Run: node --env-file=.env.local scripts/seed-kv.mjs

const url = process.env.KV_REST_API_URL
const token = process.env.KV_REST_API_TOKEN
if (!url || !token) {
  console.error('Set KV_REST_API_URL and KV_REST_API_TOKEN in .env.local first.')
  process.exit(1)
}

for (const name of ['templates', 'campaigns', 'sent-log', 'settings']) {
  let raw
  try {
    raw = await readFile(path.join('data', 'blaster', `${name}.json`), 'utf8')
  } catch {
    console.log(`${name}: no local file, skipped`)
    continue
  }
  const r = await fetch(`${url}/set/blaster:${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: raw,
  })
  console.log(`${name}: ${r.ok ? 'seeded' : `FAILED ${r.status}`}`)
}
