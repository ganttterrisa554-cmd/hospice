import { brand } from './brand.mjs'
import * as applicationConfirmation from '../emails/application-confirmation.mjs'
import * as campaignIntro from '../emails/campaign-intro.mjs'
import * as recruitingOutreach from '../emails/recruiting-outreach.mjs'

// Static template registry — keeps bundlers (Next/webpack) and plain Node happy.
const templates = {
  'application-confirmation': applicationConfirmation,
  'campaign-intro': campaignIntro,
  'recruiting-outreach': recruitingOutreach,
}

export const templateNames = Object.keys(templates)

export function render(template, input = {}) {
  const mod = templates[template]
  if (!mod) {
    throw new Error(`Unknown email template: ${template}. Available: ${templateNames.join(', ')}`)
  }
  const text = mod.text(input)
  return {
    subject: mod.subject(input),
    text,
    html: emailShell({
      preheader: typeof mod.preheader === 'function' ? mod.preheader(input) : text.split('\n')[0],
      bodyHtml: paragraphsToHtml(text),
    }),
  }
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const pStyle = 'margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#233e32;'
const ulStyle = 'margin:0 0 16px;padding-left:22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#233e32;'
const liStyle = 'margin:0 0 4px;'
const aStyle = 'color:#254b39;text-decoration:underline;'

const LINK_RE = /\[([^\]]{1,200})\]\((https?:\/\/[^\s)]{1,2000})\)|(https?:\/\/[^\s<>"')]{1,2000})/g

// Escapes a text line while turning [text](url) and bare https:// URLs into <a>.
function linkify(line) {
  let html = ''
  let last = 0
  let m
  LINK_RE.lastIndex = 0
  while ((m = LINK_RE.exec(line))) {
    html += escapeHtml(line.slice(last, m.index))
    const url = m[2] || m[3].replace(/[.,;:!?]+$/, '')
    const label = m[1] || url
    html += `<a href="${escapeHtml(url)}" style="${aStyle}">${escapeHtml(label)}</a>`
    if (m[3]) html += escapeHtml(m[3].slice(url.length))
    last = m.index + m[0].length
  }
  return html + escapeHtml(line.slice(last))
}

// Splits on blank lines. Within a block, lines starting with "- " become a
// simple <ul>; any leading non-bullet lines (typically ending in ":") stay a <p>.
export function paragraphsToHtml(text) {
  const blocks = String(text || '')
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)

  return blocks
    .map(block => {
      const lines = block.split('\n')
      const proseLines = []
      const bulletLines = []
      for (const line of lines) {
        if (line.trim().startsWith('- ')) bulletLines.push(line.trim().slice(2))
        else proseLines.push(line)
      }

      let html = ''
      const prose = proseLines.map(line => linkify(line.trim())).filter(Boolean).join('<br>')
      if (prose) html += `<p style="${pStyle}">${prose}</p>`
      if (bulletLines.length) {
        html += `<ul style="${ulStyle}">` +
          bulletLines.map(item => `<li style="${liStyle}">${linkify(item)}</li>`).join('') +
          '</ul>'
      }
      return html
    })
    .filter(Boolean)
    .join('\n')
}

// Light branded shell: wordmark + 3px accent bar, 560px table, muted footer.
// No images, no big colored card — restraint helps deliverability.
export function emailShell({ preheader = '', bodyHtml = '' }) {
  const host = brand.siteUrl.replace(/^https?:\/\//, '')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(brand.name)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f7f2;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f7f2;">
<tr><td align="center" style="padding:28px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
<tr><td style="padding:0 0 14px;">
  <span style="font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;line-height:1;letter-spacing:-1px;color:#233e32;">canyon</span><br>
  <span style="font-family:Arial,Helvetica,sans-serif;font-size:8px;font-weight:600;line-height:1;letter-spacing:2px;color:#657064;">HOMECARE &amp; HOSPICE</span>
</td></tr>
<tr><td style="height:3px;line-height:3px;font-size:0;background-color:${brand.accent};">&nbsp;</td></tr>
<tr><td style="padding:26px 0 8px;">
${bodyHtml}
</td></tr>
<tr><td style="padding:22px 0 0;border-top:1px solid #dce0d4;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:#657064;">
  ${escapeHtml(brand.name)} &middot; <a href="${escapeHtml(brand.siteUrl)}" style="color:#657064;text-decoration:underline;">${escapeHtml(host)}</a><br>
  You're getting this because you applied or were contacted about a role.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

// Builds the exact JSON body POSTed to Resend — exported so scripts can
// preview the payload on --dry-run without duplicating the shape.
export function buildMailPayload({ to, subject, text, html, replyTo, fromName, fromAddress }) {
  const payload = {
    from: `${fromName || brand.senderName} <${fromAddress || brand.senderAddress}>`,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html,
  }
  if (replyTo) payload.reply_to = replyTo
  return payload
}

export async function sendMail({ to, subject, text, html, replyTo, idempotencyKey, fromName, fromAddress }) {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) return { ok: false, error: 'RESEND_API_KEY is not configured' }

  const headers = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify(buildMailPayload({ to, subject, text, html, replyTo, fromName, fromAddress })),
      signal: AbortSignal.timeout(15000),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || !result.id) {
      return { ok: false, error: result.message || `Resend returned HTTP ${response.status}` }
    }
    return { ok: true, id: result.id }
  } catch (err) {
    return { ok: false, error: err?.message || 'Unable to reach email provider' }
  }
}
