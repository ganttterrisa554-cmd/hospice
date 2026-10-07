const defaultRole = 'Patient Intake & Data Entry Specialist'

function greetingName(fullName) {
  const first = String(fullName || '').trim().split(/\s+/)[0]
  return first ? first[0].toUpperCase() + first.slice(1) : 'there'
}

export function subject() {
  return 'We received your application — Apex Care Partners'
}

export function preheader({ reference } = {}) {
  return `Your application is in our review queue (ref ${reference}).`
}

export function text({ fullName, reference, roleTitle = defaultRole } = {}) {
  return `Hi ${greetingName(fullName)},

Thank you for applying for the ${roleTitle} role with Apex Care Partners. Your application came through and is now in our review queue.

Here's what happens next:
- Our hiring team reviews your application and availability details.
- If your background looks like a good fit, we'll reach out by email or phone.
- If you don't hear from us this round, we'll keep your details on file for future openings.

Your reference number is ${reference}. Keep it handy if you contact us about this application.

Thanks again for your interest in joining our team.

The Apex Care Partners hiring team`
}
