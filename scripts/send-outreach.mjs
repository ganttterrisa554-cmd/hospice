#!/usr/bin/env node
// Usage: pnpm outreach -- --list <file.json> [--dry-run] [--resend]
// List file: JSON array of { name, resumeUrl, jobgetUrl? } (or a JobGet-shaped
// payload). Each resume is downloaded, its email extracted, and the same
// recruiting-outreach email sent to every address. Sent emails are logged to
// scripts/.outreach-log.json and skipped on later runs unless --resend.
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { brand } from '../src/lib/brand.mjs'
import { render, sendMail } from '../src/lib/mail.mjs'
import { argHelpers, emailPattern, loadJsonLog, saveJsonLog, sleep } from './lib/campaign-utils.mjs'
import { hydrateCandidate } from './lib/jobget.mjs'

const logPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '.outreach-log.json')
const { has, flagValue } = argHelpers()

async function main() {
  const listFile = flagValue('--list')
  const dryRun = has('--dry-run')
  const resend = has('--resend')

  if (has('--help') || has('-h') || !listFile) {
    console.log('Usage: pnpm outreach -- --list <file.json> [--dry-run] [--resend]')
    process.exit(listFile ? 0 : 1)
  }

  const list = JSON.parse(await readFile(listFile, 'utf8'))
  const raw = Array.isArray(list) ? list : list.candidates || list.items || list.results || list.data || []
  if (!Array.isArray(raw) || !raw.length) {
    console.error('List file must contain a non-empty array of { name, resumeUrl }.')
    process.exit(1)
  }

  if (!dryRun && !/\d{7,}/.test(brand.hiringPhone)) {
    console.error('Set hiringPhone in src/lib/brand.mjs before sending — it goes in the email.')
    process.exit(1)
  }

  console.log(`Hydrating ${raw.length} candidate(s)…`)
  const candidates = await Promise.all(raw.map(hydrateCandidate))
  const recipients = candidates
    .map(c => ({ ...c, firstName: c.name ? c.name.trim().split(/\s+/)[0] : 'there' }))
    .filter(c => emailPattern.test(c.email))

  const noEmail = candidates.filter(c => !emailPattern.test(c.email))
  for (const c of noEmail) console.log(`no-email ${c.name || c.resumeUrl || '(unnamed)'}`)

  const { subject, text, html } = render('recruiting-outreach', {
    firstName: recipients[0]?.firstName || 'there',
    callbackNumber: brand.hiringPhone,
  })

  if (dryRun) {
    console.log(`\nDRY RUN — ${recipients.length} deliverable, ${noEmail.length} without email`)
    console.log(`Subject: ${subject}`)
    console.log(`--- text ---\n${text}`)
    console.log('\nRecipients:')
    for (const r of recipients) console.log(`  ${r.email}  (${r.name || 'unnamed'})`)
    console.log('\nDry run: nothing sent.')
    return
  }

  const log = await loadJsonLog(logPath)
  const alreadySent = new Set(log.sent || [])
  const tally = { sent: 0, skipped: 0, failed: 0, noEmail: noEmail.length }
  const newSent = []

  for (const r of recipients) {
    if (!resend && alreadySent.has(r.email)) {
      tally.skipped++
      console.log(`skipped ${r.email}`)
      continue
    }
    const body = render('recruiting-outreach', { firstName: r.firstName, callbackNumber: brand.hiringPhone })
    try {
      // Plain text only — the branded HTML shell lands cold outreach in Promotions.
      const result = await sendMail({
        to: r.email,
        subject: body.subject,
        text: body.text,
        replyTo: brand.hiringInbox,
        idempotencyKey: `outreach-${createHash('sha256').update(r.email).digest('hex').slice(0, 16)}`,
      })
      if (result.ok) {
        tally.sent++
        newSent.push(r.email)
        console.log(`sent ${r.email}`)
      } else {
        tally.failed++
        console.log(`failed ${r.email} ${result.error}`)
      }
    } catch (err) {
      tally.failed++
      console.log(`failed ${r.email} ${err.message}`)
    }
    await sleep(600)
  }

  if (newSent.length) {
    log.sent = [...new Set([...(log.sent || []), ...newSent])]
    await saveJsonLog(logPath, log)
  }
  console.log(JSON.stringify(tally))
}

main().catch(err => {
  console.error(`outreach failed: ${err.message}`)
  process.exit(1)
})
