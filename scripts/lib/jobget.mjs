// Resume fetch + contact extraction for outreach batches.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g
const BAD_LOCAL = /^(info|support|help|contact|admin|office|sales|mail|jobs|careers|noreply|no-reply|team)@/i

export function extractEmail(text) {
  for (const match of String(text).match(EMAIL_RE) || []) {
    const addr = match.toLowerCase()
    const [local, domain] = addr.split('@')
    if (!local || !domain) continue
    if (domain.endsWith('jobget.com') || BAD_LOCAL.test(addr)) continue
    if ((domain.split('.').pop() || '').length < 2) continue
    return addr
  }
  return ''
}

const PYPDF = "import sys;from pypdf import PdfReader;print('\\n'.join((p.extract_text() or '') for p in PdfReader(sys.argv[1]).pages))"

export async function resumeText(url) {
  const res = await fetch(url)
  if (!res.ok) return ''
  const buf = Buffer.from(await res.arrayBuffer())
  const ext = extname(new URL(url).pathname).toLowerCase()
  const file = join(mkdtempSync(join(tmpdir(), 'resume-')), `cv${ext || '.bin'}`)
  writeFileSync(file, buf)
  if (ext === '.pdf') return execFileSync('python3', ['-c', PYPDF, file], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  if (ext === '.docx' || ext === '.doc')
    return execFileSync('textutil', ['-convert', 'txt', '-stdout', file], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  if (ext === '.txt' || ext === '.rtf') return buf.toString('utf8')
  return ''
}

const pick = (raw, ...keys) => {
  for (const k of keys) {
    const v = raw?.[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

// Turns a raw list entry (plain {name, resumeUrl} or a JobGet-shaped payload)
// into { name, email }. Tries the payload's own email field first, then the resume text.
export async function hydrateCandidate(raw) {
  const name =
    pick(raw, 'name', 'fullName', 'displayName', 'candidateName') ||
    [raw?.firstName, raw?.lastName].filter(v => typeof v === 'string' && v.trim()).join(' ').trim()
  const resumeUrl = pick(raw, 'resumeUrl', 'customResumeUrl', 'resume_url', 'cvUrl', 'resumeLink')
  let email = pick(raw, 'email', 'emailAddress', 'contactEmail', 'personalEmail').toLowerCase()

  if (!email && resumeUrl) {
    try {
      email = extractEmail(await resumeText(resumeUrl))
    } catch {
      // resume unreadable — leave email empty, caller reports it
    }
  }
  if (email && BAD_LOCAL.test(email)) email = ''
  return { name, email, resumeUrl, jobgetUrl: pick(raw, 'jobgetUrl', 'profileUrl', 'publicProfileUrl') }
}
