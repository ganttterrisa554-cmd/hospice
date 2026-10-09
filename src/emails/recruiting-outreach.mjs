import { brand } from '../lib/brand.mjs'

const defaultRole = 'Patient Intake & Data Entry Specialist'

export function subject({ firstName = 'there' } = {}) {
  return firstName === 'there' ? 'Are you open to remote work?' : `${firstName}, are you open to remote work?`
}

export function preheader() {
  return 'Quick question — hiring for a remote role and thought of you.'
}

export function text({ firstName = 'there', callbackNumber = '', roleTitle = defaultRole }) {
  return `Hi ${firstName},

I found your resume while hiring for a ${roleTitle} at Canyon HomeCare & Hospice — it's fully remote with flexible hours, and we handle the training.

Would you be interested? If so, just reply here or call/text me at ${callbackNumber} and I'll get you the details.

Thanks,
Daniel
Canyon HomeCare & Hospice
${brand.hiringInbox}`
}
