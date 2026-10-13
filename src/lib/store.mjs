import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

// Persistence that works both locally (JSON files on disk) and on Vercel
// (read-only filesystem → Vercel KV / Upstash Redis via REST). On Vercel,
// attach a KV store to the project so KV_REST_API_URL and KV_REST_API_TOKEN
// are injected; without them the fs path is used.

const kvUrl = process.env.KV_REST_API_URL
const kvToken = process.env.KV_REST_API_TOKEN
const useKv = Boolean(kvUrl && kvToken)

async function kvGet(key) {
  const r = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
    cache: 'no-store',
  })
  if (!r.ok) throw new Error(`KV read failed: ${r.status}`)
  const { result } = await r.json()
  return result == null ? null : JSON.parse(result)
}

async function kvSet(key, value) {
  const r = await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kvToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  })
  if (!r.ok) throw new Error(`KV write failed: ${r.status}`)
}

export function createJsonStore({ dir, namespace }) {
  const keyFor = name => `${namespace}:${name}`

  // On read-only filesystems (Vercel) fall back to a writable tmp dir so
  // requests don't fail — persistence there is best-effort until KV is set up.
  let dirPromise
  const resolveDir = () =>
    (dirPromise ??= (async () => {
      const p = path.join(process.cwd(), dir)
      try {
        await mkdir(p, { recursive: true })
        return p
      } catch {
        const t = path.join(tmpdir(), dir)
        await mkdir(t, { recursive: true })
        return t
      }
    })())

  return {
    async load(name, fallback) {
      if (useKv) {
        try {
          return (await kvGet(keyFor(name))) ?? fallback
        } catch {
          return fallback
        }
      }
      try {
        return JSON.parse(await readFile(path.join(await resolveDir(), `${name}.json`), 'utf8'))
      } catch {
        return fallback
      }
    },
    async save(name, data) {
      if (useKv) return kvSet(keyFor(name), data)
      await writeFile(
        path.join(await resolveDir(), `${name}.json`),
        JSON.stringify(data, null, 2),
      )
    },
  }
}
