import { brand } from '../lib/brand.mjs'

export function subject() {
  return 'Remote Patient Intake & Data Entry role — Apex Care Partners'
}

export function preheader() {
  return 'A fully remote role on our intake team — details inside.'
}

export function text({ firstName = 'there' } = {}) {
  return `Hi ${firstName},

I'm reaching out from Apex Care Partners — we're hiring a remote Patient Intake & Data Entry Specialist, and I thought it might be a good fit for you.

It's a fully remote role: you'd help new patients get set up with our care team, enter and verify intake details, and keep records accurate. We offer flexible weekly hours, provided training, and a schedule built for quiet home work.

If it sounds interesting, you can read the full role and apply in a few minutes here:
${brand.siteUrl}/apply

No pressure either way — if the timing isn't right, feel free to pass it along to someone who'd be a great fit.

All the best,
The Apex Care Partners hiring team`
}
