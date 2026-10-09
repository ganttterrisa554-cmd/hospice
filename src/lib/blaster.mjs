import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { emailShell, escapeHtml, paragraphsToHtml, sendMail } from './mail.mjs'

const dataDir = path.join(process.cwd(), 'data', 'blaster')
const templatesPath = path.join(dataDir, 'templates.json')
const campaignsPath = path.join(dataDir, 'campaigns.json')
const sentLogPath = path.join(dataDir, 'sent-log.json')
const settingsPath = path.join(dataDir, 'settings.json')

const SEND_DELAY_MS = 150
const MAX_RECIPIENTS = 500
const MERGE_TAGS = /\{(firstName|name|email)\}/g

async function loadJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return fallback
  }
}

async function saveJson(file, data) {
  await mkdir(dataDir, { recursive: true })
  await writeFile(file, JSON.stringify(data, null, 2))
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export function deriveFirstName(name, email) {
  const first = String(name || '').trim().split(/\s+/)[0]
  if (first) return first[0].toUpperCase() + first.slice(1)
  const local = String(email).split('@')[0].split(/[._\-+]/)[0].replace(/\d+$/, '')
  return local ? local[0].toUpperCase() + local.slice(1) : 'there'
}

// Substitutes {firstName} {name} {email} merge tags. `escape` HTML-escapes the
// inserted values — required when substituting into an HTML body so recipient
// names can't inject markup.
export function substitute(text, recipient, { escape = false } = {}) {
  const firstName = deriveFirstName(recipient.name, recipient.email)
  const val = v => (escape ? escapeHtml(v) : v)
  return String(text || '').replace(MERGE_TAGS, (_, tag) => {
    if (tag === 'email') return val(recipient.email)
    if (tag === 'name') return val(recipient.name || firstName)
    return val(firstName)
  })
}

// Email-safe tags only — strips everything else and all attributes except a
// sanitized href on <a>.
const ALLOWED_TAGS = new Set(['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote'])

export function sanitizeEmailHtml(html) {
  return String(html || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|iframe|object|embed|form|input|button|svg|math|img|video|audio|link|meta)[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g, (match, tag, attrs) => {
      const t = tag.toLowerCase()
      const closing = match.startsWith('</')
      if (!ALLOWED_TAGS.has(t)) return ''
      if (closing) return `</${t}>`
      if (t === 'a') {
        const href = (attrs.match(/href\s*=\s*["']([^"']+)["']/i) || [])[1] || ''
        if (!/^(https?:|mailto:)/i.test(href)) return ''
        return `<a href="${escapeHtml(href)}" style="color:#254b39;text-decoration:underline;">`
      }
      if (t === 'br') return '<br>'
      const styled = { p: ` style="margin:0 0 16px;"`, h1: ` style="margin:0 0 12px;font-size:20px;"`, h2: ` style="margin:0 0 10px;font-size:17px;"`, h3: ` style="margin:0 0 8px;font-size:15px;"`, ul: ` style="margin:0 0 16px;padding-left:22px;"`, ol: ` style="margin:0 0 16px;padding-left:22px;"`, li: ` style="margin:0 0 4px;"`, blockquote: ` style="margin:0 0 16px;padding-left:12px;border-left:3px solid #dce0d4;color:#657064;"` }
      return `<${t}${styled[t] || ''}>`
    })
}

// Converts editor HTML to a plain-text fallback for the email's text part.
export function htmlToText(html) {
  return String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
      const t = label.replace(/<[^>]+>/g, '').trim()
      return t && t !== href ? `${t} (${href})` : href
    })
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h[1-3]|ul|ol|blockquote|div)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function renderCustomEmail({ subject, body, recipient, plain = false }) {
  const isHtml = /<[a-zA-Z][^>]*>/.test(String(body))
  const finalSubject = substitute(subject, recipient)
  const substituted = substitute(body, recipient, { escape: isHtml })
  const text = isHtml ? htmlToText(substituted) : substituted
  if (plain) {
    // Text-only — cold outreach stays out of Promotions without the HTML shell.
    return { subject: finalSubject, text, html: undefined }
  }
  const bodyHtml = isHtml ? sanitizeEmailHtml(substituted) : paragraphsToHtml(text)
  return {
    subject: finalSubject,
    text,
    html: emailShell({
      preheader: text.split('\n')[0] || finalSubject,
      bodyHtml,
    }),
  }
}

export async function listCustomTemplates() {
  return loadJson(templatesPath, [])
}

export async function saveCustomTemplate({ id, name, subject, body }) {
  const templates = await listCustomTemplates()
  const now = new Date().toISOString()
  if (id) {
    const i = templates.findIndex(t => t.id === id)
    if (i === -1) throw new Error(`Template not found: ${id}`)
    templates[i] = { ...templates[i], name, subject, body, updatedAt: now }
    await saveJson(templatesPath, templates)
    return templates[i]
  }
  const template = {
    id: `t-${randomSuffix()}`,
    name,
    subject,
    body,
    createdAt: now,
    updatedAt: now,
  }
  templates.push(template)
  await saveJson(templatesPath, templates)
  return template
}

export async function deleteCustomTemplate(id) {
  const templates = await listCustomTemplates()
  const next = templates.filter(t => t.id !== id)
  if (next.length === templates.length) throw new Error(`Template not found: ${id}`)
  await saveJson(templatesPath, next)
}

export async function listCampaigns() {
  const campaigns = await loadJson(campaignsPath, [])
  return campaigns.map(({ results, ...rest }) => rest).reverse()
}

export async function getCampaign(id) {
  const campaigns = await loadJson(campaignsPath, [])
  return campaigns.find(c => c.id === id) || null
}

// Sender identity defaults — editable from /admin, applied to every campaign
// unless overridden. Empty fields fall back to brand.mjs at send time.
export async function getSettings() {
  return loadJson(settingsPath, { fromName: '', fromAddress: '', replyTo: '' })
}

export async function saveSettings({ fromName, fromAddress, replyTo }) {
  if (fromAddress && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(fromAddress)) {
    throw new Error('From address must be a valid email.')
  }
  if (replyTo && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(replyTo)) {
    throw new Error('Reply-to must be a valid email.')
  }
  const settings = {
    fromName: String(fromName || '').trim(),
    fromAddress: String(fromAddress || '').trim(),
    replyTo: String(replyTo || '').trim(),
    updatedAt: new Date().toISOString(),
  }
  await saveJson(settingsPath, settings)
  return settings
}

export async function sentEmails() {
  const log = await loadJson(sentLogPath, {})
  return Object.keys(log)
}

export async function runCampaign({ name, subject, body, recipients, resend = false, sender = {}, plain = false }) {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('Campaign needs at least one recipient.')
  }
  if (recipients.length > MAX_RECIPIENTS) {
    throw new Error(`Campaigns are capped at ${MAX_RECIPIENTS} recipients.`)
  }
  if (!subject?.trim() || !body?.trim()) {
    throw new Error('Subject and message body are required.')
  }

  const sentLog = await loadJson(sentLogPath, {})
  const campaigns = await loadJson(campaignsPath, [])
  const settings = await getSettings()
  const effectiveSender = {
    fromName: sender.fromName || settings.fromName,
    fromAddress: sender.fromAddress || settings.fromAddress,
    replyTo: sender.replyTo || settings.replyTo,
  }
  const campaign = {
    id: `c-${Date.now().toString(36)}-${randomSuffix()}`,
    name: String(name || '').trim() || `Campaign ${new Date().toLocaleDateString()}`,
    subject,
    body,
    sender: effectiveSender,
    plain,
    createdAt: new Date().toISOString(),
    recipientCount: recipients.length,
    status: 'running',
    sent: 0,
    failed: 0,
    skipped: 0,
    results: [],
  }
  campaigns.push(campaign)
  await saveJson(campaignsPath, campaigns)

  const seen = new Set()
  for (const recipient of recipients) {
    const email = String(recipient.email || '').trim().toLowerCase()
    if (!email || seen.has(email)) {
      campaign.skipped++
      campaign.results.push({ email, ok: false, skipped: true, error: 'duplicate' })
      continue
    }
    seen.add(email)

    if (sentLog[email] && !resend) {
      campaign.skipped++
      campaign.results.push({ email, ok: false, skipped: true, error: 'already emailed' })
      continue
    }

    const rendered = renderCustomEmail({ subject, body, recipient: { ...recipient, email }, plain })
    const key = `campaign-${campaign.id}-${createHash('sha256').update(email).digest('hex').slice(0, 16)}`
    const result = await sendMail({
      to: email,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      idempotencyKey: key,
      fromName: effectiveSender.fromName || undefined,
      fromAddress: effectiveSender.fromAddress || undefined,
      replyTo: effectiveSender.replyTo || undefined,
    })

    if (result.ok) {
      campaign.sent++
      sentLog[email] = { campaignId: campaign.id, at: new Date().toISOString() }
    } else {
      campaign.failed++
    }
    campaign.results.push({ email, ok: result.ok, id: result.id, error: result.error })
    await sleep(SEND_DELAY_MS)
  }

  campaign.status = campaign.failed === 0 ? 'completed' : 'partial'
  campaign.finishedAt = new Date().toISOString()
  await saveJson(campaignsPath, campaigns)
  await saveJson(sentLogPath, sentLog)
  return campaign
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8)
}
