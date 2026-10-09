import {
  deleteCustomTemplate,
  deriveFirstName,
  getSettings,
  listCampaigns,
  listCustomTemplates,
  renderCustomEmail,
  runCampaign,
  saveCustomTemplate,
  saveSettings,
  sentEmails,
} from '../../../../lib/blaster.mjs'
import { render, templateNames } from '../../../../lib/mail.mjs'
import { brand } from '../../../../lib/brand.mjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request) {
  const [customTemplates, campaigns, sent, settings] = await Promise.all([
    listCustomTemplates(),
    listCampaigns(),
    sentEmails(),
    getSettings(),
  ])

  const builtinTemplates = templateNames.map(name => {
    const sample = render(name, { firstName: '{firstName}' })
    return { id: name, name, subject: sample.subject, body: sample.text, builtin: true }
  })

  return Response.json({
    success: true,
    builtinTemplates,
    customTemplates,
    campaigns,
    sent,
    settings,
    defaults: { fromName: brand.senderName, fromAddress: brand.senderAddress, replyTo: brand.hiringInbox },
  })
}

export async function POST(request) {
  let data
  try {
    data = await request.json()
  } catch {
    return Response.json({ success: false, error: 'Invalid payload.' }, { status: 400 })
  }

  try {
    switch (data.action) {
      case 'preview': {
        const recipient = {
          name: data.name || 'Alex Johnson',
          email: data.email || 'alex@example.com',
        }
        const rendered = renderCustomEmail({
          subject: data.subject,
          body: data.body,
          recipient,
        })
        return Response.json({ success: true, rendered, recipient })
      }

      case 'send': {
        const recipients = (data.recipients || [])
          .map(r => ({
            name: String(r?.name || '').slice(0, 120),
            email: String(r?.email || '').trim().slice(0, 200),
          }))
          .filter(r => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(r.email))
        const campaign = await runCampaign({
          name: data.name,
          subject: String(data.subject || '').slice(0, 300),
          body: String(data.body || '').slice(0, 20000),
          recipients,
          resend: data.resend === true,
          sender: {
            fromName: String(data.fromName || '').slice(0, 120),
            fromAddress: String(data.fromAddress || '').slice(0, 200),
            replyTo: String(data.replyTo || '').slice(0, 200),
          },
        })
        const { results, ...summary } = campaign
        return Response.json({ success: true, campaign: summary, results })
      }

      case 'save-template': {
        const template = await saveCustomTemplate({
          id: data.id,
          name: String(data.name || '').trim().slice(0, 120),
          subject: String(data.subject || '').slice(0, 300),
          body: String(data.body || '').slice(0, 20000),
        })
        return Response.json({ success: true, template })
      }

      case 'save-settings': {
        const settings = await saveSettings({
          fromName: data.fromName,
          fromAddress: data.fromAddress,
          replyTo: data.replyTo,
        })
        return Response.json({ success: true, settings })
      }

      case 'delete-template': {
        await deleteCustomTemplate(String(data.id))
        return Response.json({ success: true })
      }

      default:
        return Response.json({ success: false, error: 'Unknown action.' }, { status: 400 })
    }
  } catch (err) {
    return Response.json({ success: false, error: err?.message || 'Request failed.' }, { status: 400 })
  }
}
