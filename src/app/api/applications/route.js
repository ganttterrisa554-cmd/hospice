import { createHash } from 'node:crypto'
import { brand } from '../../../lib/brand.mjs'
import { render, sendMail } from '../../../lib/mail.mjs'

export const runtime = 'nodejs'

// In-memory dedup store for server runtime
let applications = []

const fields = {
  fullName: 'Full name', email: 'Email', phone: 'Phone', city: 'City', state: 'State',
  is18OrOlder: '18 or older', workAuthorizedUS: 'Authorized to work in the US',
  requiresSponsorship: 'Requires sponsorship', currentlyEmployed: 'Currently employed',
  remoteExperience: 'Remote experience', dataEntryExperience: 'Data entry experience',
  typingSpeed: 'Typing speed', ehrExperience: 'EHR experience',
  resumeFileName: 'Resume filename (file not uploaded or attached)', coverLetterNote: 'Cover letter note',
  weeklyHours: 'Weekly availability', preferredShift: 'Preferred shift',
  reliableInternet: 'Reliable internet', primaryDevice: 'Primary device',
  quietWorkspace: 'Quiet workspace', signatureName: 'Signature name', consentDate: 'Date signed'
}

export async function GET() {
  return Response.json({ success: false, error: 'Application records are private.' }, { status: 403 })
}

export async function POST(request) {
  let data
  try {
    const payload = await request.text()
    if (Buffer.byteLength(payload) > 20000) {
      return Response.json({ success: false, error: 'Application is too large.' }, { status: 413 })
    }
    data = JSON.parse(payload)
  } catch {
    return Response.json({ success: false, error: 'Invalid application payload.' }, { status: 400 })
  }

  if (!data || typeof data !== 'object' || Array.isArray(data) ||
    Object.keys(fields).some(field => data[field] !== undefined &&
      (typeof data[field] !== 'string' || data[field].length > (field === 'coverLetterNote' ? 5000 : 500))) ||
    ['fullName', 'email', 'phone', 'city', 'state', 'signatureName', 'dataEntryExperience', 'primaryDevice'].some(field => !data[field]?.trim()) ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email) ||
    data.certifiedAccurate !== true || data.is18OrOlder !== 'Yes' ||
    data.workAuthorizedUS !== 'Yes' || data.reliableInternet !== 'Yes') {
    return Response.json({ success: false, error: 'Please complete the required fields and certification.' }, { status: 400 })
  }

  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    return Response.json({ success: false, error: 'Email delivery is not configured. Please try again later.' }, { status: 503 })
  }

  const details = Object.fromEntries(Object.keys(fields).map(field => [field, data[field]?.trim() || '']))
  const id = `APP-${createHash('sha256').update(JSON.stringify(details)).digest('hex')}`
  const record = { ...details, certifiedAccurate: true, id, submittedAt: new Date().toISOString() }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': id
      },
      body: JSON.stringify({
        from: 'Application Notifications <applications@canyonhospices.com>',
        to: ['Canyonhospice6@gmail.com'],
        reply_to: details.email,
        subject: 'New application submission',
        text: [
          'A new application was submitted through the job-app-next form.',
          `Reference: ${id}`,
          ...Object.entries(fields).map(([field, label]) => `${label}: ${details[field] || 'Not provided'}`),
          'Submission and email sharing confirmed: Yes',
          'Resume files are not uploaded or attached by this form.'
        ].join('\n\n')
      }),
      signal: AbortSignal.timeout(15000)
    })
    const result = await response.json()
    if (!response.ok || !result.id) {
      return Response.json({ success: false, error: 'Email delivery was not accepted. Please try again.' }, { status: 502 })
    }
    applications = [id, ...applications.filter(item => item !== id)].slice(0, 100)
    try {
      // Best-effort applicant confirmation — the notification email above already
      // confirmed delivery, so a failure here must not fail the application.
      const confirmation = render('application-confirmation', { fullName: details.fullName, reference: id })
      await sendMail({
        to: details.email,
        subject: confirmation.subject,
        text: confirmation.text,
        html: confirmation.html,
        replyTo: brand.hiringInbox,
        idempotencyKey: `${id}-confirm`
      })
    } catch {
      // Swallow — never let a confirmation failure fail the application response.
    }
    return Response.json({ success: true, application: record })
  } catch {
    return Response.json({ success: false, error: 'Unable to confirm email delivery. Please retry with the same details.' }, { status: 502 })
  }
}
