import { brand } from '../lib/brand.mjs'

const defaultRole = 'Patient Intake & Data Entry Specialist'

export function subject({ roleTitle = defaultRole } = {}) {
  return `Remote ${roleTitle} role — Apex Care Partners`
}

export function preheader({ firstName = 'there' } = {}) {
  return `${firstName}, a remote intake role that might fit you — no healthcare experience needed.`
}

export function text({ firstName = 'there', highlight = '', callbackNumber = '', roleTitle = defaultRole } = {}) {
  const intro = highlight
    ? `I came across your resume, and your experience with ${highlight} stood out to me. I work with Apex Care Partners, and we're hiring a remote ${roleTitle} — I think you could be a great fit.`
    : `I came across your resume while looking for our next ${roleTitle} at Apex Care Partners, and I think you could be a great fit.`

  return `Hi ${firstName},

${intro}

The role is fully remote with a flexible weekly schedule, and no healthcare experience is required — we provide training. You can see the details and apply in a couple of minutes here:
${brand.siteUrl}/apply

If it sounds interesting, call or text ${callbackNumber} — or just reply to this email.

All the best,
The Apex Care Partners hiring team`
}
