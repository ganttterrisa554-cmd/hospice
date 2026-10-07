#!/usr/bin/env node
// Usage: pnpm campaign -- --list <file.json> --template <name> [--dry-run] [--resend] [--bulk]
//                            [--subject "..."] [--from-name "..."]
// List file: JSON array of { name, email } (name optional — first name is derived
// from the email local part when missing). Sent addresses are recorded in
// scripts/.campaign-log.json and skipped on later runs unless --resend is passed.
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { brand } from '../src/lib/brand.mjs'
import { buildMailPayload, render, sendMail, templateNames } from '../src/lib/mail.mjs'
import { argHelpers, emailPattern, loadJsonLog, saveJsonLog, sleep } from './lib/campaign-utils.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const logPath = path.join(scriptDir, '.campaign-log.json')
const { has, flagValue } = argHelpers()

function deriveFirstName(name, email) {
  const first = String(name || '').trim().split(/\s+/)[0]
  if (first) return first[0].toUpperCase() + first.slice(1)
  const local = email.split('@')[0].split(/[._\-+]/)[0].replace(/\d+$/, '')
  return local ? local[0].toUpperCase() + local.slice(1) : 'there'
}

const loadLog = () => loadJsonLog(logPath)

async function main() {
  const listFile = flagValue('--list')
  const template = flagValue('--template') || 'campaign-intro'
  const subjectOverride = flagValue('--subject')
  const fromName = flagValue('--from-name')
  const dryRun = has('--dry-run')
  const resend = has('--resend')
  const bulk = has('--bulk')

  if (has('--help') || has('-h') || !listFile) {
    console.log('Usage: pnpm campaign -- --list <file.json> --template <name> [--dry-run] [--resend] [--bulk]')
    console.log('       [--subject "..."] [--from-name "..."]')
    console.log(`Templates: ${templateNames.join(', ')}`)
    process.exit(listFile ? 0 : 1)
  }

  if (!templateNames.includes(template)) {
    console.error(`Unknown template "${template}". Available: ${templateNames.join(', ')}`)
    process.exit(1)
  }

  let list
  try {
    list = JSON.parse(await readFile(listFile, 'utf8'))
  } catch (err) {
    console.error(`Could not read list file ${listFile}: ${err.message}`)
    process.exit(1)
  }
  if (!Array.isArray(list)) {
    console.error('List file must contain a JSON array of { name, email }.')
    process.exit(1)
  }
  if (list.length > 500 && !bulk) {
    console.error(`Refusing to process ${list.length} recipients without --bulk (limit is 500).`)
    process.exit(1)
  }

  const recipients = list.map((entry, i) => {
    const email = String(entry?.email || '').trim().toLowerCase()
    return {
      index: i,
      email,
      firstName: email ? deriveFirstName(entry?.name, email) : '',
      valid: emailPattern.test(email),
    }
  })

  if (dryRun) {
    const sample = recipients.filter(r => r.valid).slice(0, 3)
    console.log(`DRY RUN — template "${template}", ${list.length} recipient(s), showing ${sample.length}:`)
    for (const r of sample) {
      const { subject, text, html } = render(template, { firstName: r.firstName })
      const payload = buildMailPayload({
        to: r.email,
        subject: subjectOverride || subject,
        text,
        html,
        replyTo: brand.hiringInbox,
        fromName,
      })
      console.log(`\n===== ${r.email} =====`)
      console.log(`Subject: ${payload.subject}`)
      console.log(`--- text ---\n${payload.text}`)
      console.log(`--- Resend payload ---\n${JSON.stringify({ ...payload, html: `${payload.html.length} chars of HTML` }, null, 2)}`)
    }
    console.log('\nDry run: nothing sent.')
    return
  }

  const log = await loadLog()
  const alreadySent = new Set(log[template] || [])
  const runId = Date.now()
  const tally = { sent: 0, skipped: 0, failed: 0 }
  const newSent = []

  for (const r of recipients) {
    if (!r.valid) {
      tally.failed++
      console.log(`failed ${r.email || `#${r.index}`} invalid email address`)
      continue
    }
    if (!resend && alreadySent.has(r.email)) {
      tally.skipped++
      console.log(`skipped ${r.email}`)
      continue
    }

    try {
      const { subject, text, html } = render(template, { firstName: r.firstName })
      const result = await sendMail({
        to: r.email,
        subject: subjectOverride || subject,
        text,
        html,
        replyTo: brand.hiringInbox,
        fromName,
        idempotencyKey: `campaign-${template}-${createHash('sha256').update(r.email).digest('hex').slice(0, 16)}-${runId}`,
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
    await sleep(600) // pace sends; also delays after failures
  }

  if (newSent.length) {
    log[template] = [...new Set([...(log[template] || []), ...newSent])]
    await saveJsonLog(logPath, log)
  }

  console.log(JSON.stringify(tally))
}

main().catch(err => {
  console.error(`campaign failed: ${err.message}`)
  process.exit(1)
})
