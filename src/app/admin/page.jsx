'use client'

import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import {
  Mail, Send, Users, FileText, History, Loader2, CheckCircle2,
  XCircle, Trash2, Edit3, Eye, Plus, ArrowLeft, Sparkles,
} from 'lucide-react'

const EMAIL_RE = /[a-zA-Z0-9._%+'-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

// Domain blob stops at the LAST recognized TLD — so a run-together paste like
// "a@gmail.comb@gmail.com" splits into two emails instead of one garbled one.
const TLD_RE = /\.(com|net|org|edu|gov|mil|int|io|co|ai|app|dev|me|info|biz|name|us|uk|ca|au|de|fr|es|it|nl|ng|za|in|br|jp|kr|cn|tv|cc|xyz|site|online|store|tech|work|email|cloud|pro|vip|careers|jobs|health|church|law|school|agency|live|life|world|group|llc)/gi

function extractEmails(text) {
  const re = /[\w.+'-]+@[\w.-]+/g
  const found = []
  let m
  while ((m = re.exec(text))) {
    const token = m[0]
    const at = token.indexOf('@')
    const domain = token.slice(at + 1)
    let end = -1
    let t
    TLD_RE.lastIndex = 0
    while ((t = TLD_RE.exec(domain))) end = t.index + t[0].length
    const email = (end === -1 ? token : token.slice(0, at + 1 + end)).toLowerCase()
    found.push(email)
    // resume scanning after the truncated end so the remainder becomes its own email
    re.lastIndex = m.index + email.length
  }
  return found
}

// Pulls {name, email} pairs out of pasted junk: "Jane <j@x.com>",
// "j@x.com, Jane", JSON blobs, or bare lists — dedupes by email.
function parseRecipients(text) {
  const seen = new Set()
  const out = []
  for (const line of String(text || '').split(/\n/)) {
    const emails = extractEmails(line)
    if (!emails.length) continue
    let leftover = line
    for (const email of emails) leftover = leftover.split(email).join(' ')
    const nameGuess = leftover
      .replace(EMAIL_RE, ' ')
      .replace(/[<>"',;:\[\]{}()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    for (const email of emails) {
      if (seen.has(email)) continue
      seen.add(email)
      out.push({ name: nameGuess, email })
    }
  }
  return out
}

const headers = () => ({ 'Content-Type': 'application/json' })

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'bullet' }, { list: 'ordered' }],
    [{ header: [false, 2, 3] }],
    ['link'],
    ['clean'],
  ],
}

const esc = s =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Plain-text template body → minimal HTML for the rich editor.
function textToHtml(text) {
  const blocks = String(text || '').split(/\n{2,}/).filter(b => b.trim())
  return blocks
    .map(block => {
      const lines = block.split('\n')
      const bullets = lines.filter(l => l.trim().startsWith('- '))
      if (bullets.length && bullets.length === lines.length) {
        return `<ul>${bullets.map(b => `<li>${esc(b.trim().slice(2))}</li>`).join('')}</ul>`
      }
      const prose = lines.filter(l => !l.trim().startsWith('- ')).map(esc).join('<br>')
      const list = bullets.length ? `<ul>${bullets.map(b => `<li>${esc(b.trim().slice(2))}</li>`).join('')}</ul>` : ''
      return `<p>${prose}</p>${list}`
    })
    .join('')
}

export default function AdminBlaster() {
  const [tab, setTab] = useState('blast')
  const [state, setState] = useState(null)
  const [loadErr, setLoadErr] = useState('')

  const refresh = () =>
    fetch('/api/admin/blaster')
      .then(r => r.json())
      .then(d => (d.success ? setState(d) : setLoadErr(d.error || 'Failed to load')))
      .catch(e => setLoadErr(e.message))

  useEffect(() => {
    refresh()
  }, [])

  const tabs = [
    { id: 'blast', label: 'New Blast', icon: Send },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'campaigns', label: 'Campaigns', icon: History },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-600" /> Email Blaster
            </h1>
            <p className="text-xs text-slate-500">Canyon HomeCare &amp; Hospice · Resend</p>
          </div>
        </div>
        {state && (
          <span className="text-xs text-slate-500">
            {state.sent.length} address{state.sent.length === 1 ? '' : 'es'} emailed to date
          </span>
        )}
      </header>

      <nav className="bg-white border-b border-slate-200 px-6 flex gap-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === id
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {loadErr && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
            {loadErr}
          </div>
        )}
        {!state && !loadErr && (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading…
          </div>
        )}
        {state && tab === 'blast' && <BlastTab state={state} refresh={refresh} goCampaigns={() => setTab('campaigns')} />}
        {state && tab === 'templates' && <TemplatesTab state={state} refresh={refresh} />}
        {state && tab === 'campaigns' && <CampaignsTab state={state} />}
      </main>
    </div>
  )
}

/* ---------------- Blast tab ---------------- */

function BlastTab({ state, refresh, goCampaigns }) {
  const [name, setName] = useState('')
  const [paste, setPaste] = useState('')
  const [recipients, setRecipients] = useState([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [preview, setPreview] = useState(null)
  const [resend, setResend] = useState(false)
  const [plain, setPlain] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')
  const [sender, setSender] = useState({
    fromName: state.settings?.fromName || '',
    fromAddress: state.settings?.fromAddress || '',
    replyTo: state.settings?.replyTo || '',
  })
  const [settingsSaved, setSettingsSaved] = useState(false)

  const sentSet = useMemo(() => new Set(state.sent), [state.sent])
  const newCount = recipients.filter(r => !sentSet.has(r.email)).length
  // Verified domain is fixed — user only picks the local part before the @.
  const senderDomain =
    sender.fromAddress.split('@')[1] ||
    (state.defaults?.fromAddress || '').split('@')[1] ||
    ''

  const handleParse = () => {
    const parsed = parseRecipients(paste)
    setRecipients(parsed)
  }

  const applyTemplate = (id) => {
    const t = [...state.customTemplates, ...state.builtinTemplates].find(x => x.id === id)
    if (t) {
      setSubject(t.subject)
      // Plain-text bodies convert to HTML for the editor; HTML passes through.
      setBody(/<[a-zA-Z][^>]*>/.test(t.body) ? t.body : textToHtml(t.body))
      setPreview(null)
    }
  }

  const doPreview = async () => {
    setErr('')
    const sample = recipients[0] || { name: 'Alex Johnson', email: 'alex@example.com' }
    const r = await fetch('/api/admin/blaster', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action: 'preview', subject, body, name: sample.name, email: sample.email, plain }),
    }).then(x => x.json())
    if (r.success) setPreview(r.rendered)
    else setErr(r.error || 'Preview failed')
  }

  const doSend = async () => {
    if (!recipients.length || !subject.trim() || !body.trim()) return
    if (!window.confirm(`Send to ${resend ? recipients.length : newCount} recipient(s)?${sentSet.size && !resend ? ` (${recipients.length - newCount} already emailed will be skipped)` : ''}`)) return
    setSending(true)
    setErr('')
    setResult(null)
    try {
      const r = await fetch('/api/admin/blaster', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ action: 'send', name, subject, body, recipients, resend, plain, ...sender }),
      }).then(x => x.json())
      if (r.success) {
        setResult(r)
        refresh()
      } else setErr(r.error || 'Send failed')
    } catch (e) {
      setErr(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* left: recipients */}
      <section className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Smart paste — dump any list here
          </label>
          <textarea
            value={paste}
            onChange={e => setPaste(e.target.value)}
            placeholder={'Jane Doe <jane@example.com>\njohn@x.com, John Smith\n["anna@y.com","bob@z.com"]'}
            className="mt-2 w-full h-32 text-sm font-mono rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleParse}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
          >
            <Users className="w-3.5 h-3.5" /> Extract emails
          </button>
        </div>

        {recipients.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">
                {recipients.length} recipient{recipients.length === 1 ? '' : 's'}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {newCount} new · {recipients.length - newCount} already emailed
                </span>
              </h3>
              <button onClick={() => { setRecipients([]); setPaste('') }} className="text-xs text-slate-400 hover:text-rose-600">
                Clear
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1">
              {recipients.map((r, i) => (
                <div key={r.email} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                  <span className="truncate">
                    <span className="font-medium text-slate-700">{r.name || '—'}</span>
                    <span className="text-slate-400 ml-2">{r.email}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {sentSet.has(r.email) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">sent before</span>
                    )}
                    <button
                      onClick={() => setRecipients(recipients.filter((_, j) => j !== i))}
                      className="text-slate-300 hover:text-rose-500"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* right: composer */}
      <section className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Campaign name (optional)"
              className="text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <select
              defaultValue=""
              onChange={e => e.target.value && applyTemplate(e.target.value)}
              className="text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Load template…</option>
              <optgroup label="Custom">
                {state.customTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
              <optgroup label="Built-in">
                {state.builtinTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
            </select>
          </div>

          {/* Sender appearance */}
          <details className="rounded-lg border border-slate-200 px-3 py-2">
            <summary className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
              Sender appearance — {sender.fromName || state.defaults?.fromName || 'Default'} &lt;{sender.fromAddress || state.defaults?.fromAddress || 'brand address'}&gt;
            </summary>
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500">From name</label>
                  <input
                    value={sender.fromName}
                    onChange={e => setSender({ ...sender, fromName: e.target.value })}
                    placeholder={state.defaults?.fromName}
                    className="mt-0.5 w-full text-sm rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">From address</label>
                  <div className="mt-0.5 flex items-center rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-teal-500 overflow-hidden">
                    <input
                      value={sender.fromAddress.split('@')[0] || ''}
                      onChange={e => {
                        const prefix = e.target.value.replace(/@.*/, '').trim()
                        setSender({ ...sender, fromAddress: prefix ? `${prefix}@${senderDomain}` : '' })
                      }}
                      placeholder={(state.defaults?.fromAddress || '').split('@')[0] || 'applications'}
                      className="w-full text-sm px-3 py-1.5 focus:outline-none"
                    />
                    <span className="pr-3 text-sm text-slate-400 whitespace-nowrap bg-slate-50 border-l border-slate-100 pl-2 py-1.5">
                      @{senderDomain}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-500">Reply-to</label>
                <input
                  value={sender.replyTo}
                  onChange={e => setSender({ ...sender, replyTo: e.target.value })}
                  placeholder={state.defaults?.replyTo}
                  className="mt-0.5 w-full text-sm rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400">
                  From domain must be verified in Resend — unverified senders get rejected.
                </p>
                <button
                  onClick={async () => {
                    const r = await fetch('/api/admin/blaster', {
                      method: 'POST',
                      headers: headers(),
                      body: JSON.stringify({ action: 'save-settings', ...sender }),
                    }).then(x => x.json())
                    if (r.success) { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000); refresh() }
                    else setErr(r.error || 'Save failed')
                  }}
                  className="text-xs text-teal-600 hover:underline whitespace-nowrap"
                >
                  {settingsSaved ? 'Saved ✓' : 'Save as default'}
                </button>
              </div>
            </div>
          </details>

          <input
            value={subject}
            onChange={e => { setSubject(e.target.value); setPreview(null) }}
            placeholder="Subject"
            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <ReactQuill
              theme="snow"
              value={body}
              onChange={v => { setBody(v); setPreview(null) }}
              modules={quillModules}
              placeholder="Message body — merge tags: {firstName} {name} {email}"
              className="bg-white [&_.ql-editor]:min-h-56 [&_.ql-editor]:text-sm"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Merge tags: {'{firstName}'} {'{name}'} {'{email}'} · Use the 🔗 toolbar button to embed links
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input type="checkbox" checked={plain} onChange={e => { setPlain(e.target.checked); setPreview(null) }} className="rounded" />
                Plain text (no branding)
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input type="checkbox" checked={resend} onChange={e => setResend(e.target.checked)} className="rounded" />
                Resend to previously emailed
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={doPreview}
                disabled={!subject.trim() || !body.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={doSend}
                disabled={sending || !recipients.length || !subject.trim() || !body.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {sending ? 'Sending…' : `Send ${resend ? recipients.length : newCount}`}
              </button>
            </div>
          </div>
        </div>

        {err && <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">{err}</div>}

        {result && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              {result.campaign.name} — {result.campaign.sent} sent, {result.campaign.failed} failed, {result.campaign.skipped} skipped
            </h3>
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
              {result.results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {r.ok ? <CheckCircle2 className="w-3 h-3 text-teal-500" /> : <XCircle className={`w-3 h-3 ${r.skipped ? 'text-amber-400' : 'text-rose-500'}`} />}
                  <span className="text-slate-600">{r.email}</span>
                  {r.error && <span className="text-slate-400">({r.error})</span>}
                </div>
              ))}
            </div>
            <button onClick={goCampaigns} className="mt-3 text-xs text-teal-600 hover:underline">
              View in campaign history →
            </button>
          </div>
        )}

        {preview && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-600 mb-2">
              Preview for {preview ? `${recipients[0]?.name || 'Alex Johnson'} <${recipients[0]?.email || 'alex@example.com'}>` : ''}
            </h3>
            <p className="text-sm font-medium text-slate-800 mb-2">Subject: {preview.subject}</p>
            {preview.html ? (
              <iframe title="preview" srcDoc={preview.html} className="w-full h-96 rounded-lg border border-slate-200 bg-white" />
            ) : (
              <pre className="w-full h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 text-sm font-mono whitespace-pre-wrap text-slate-800">
                {preview.text}
              </pre>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

/* ---------------- Templates tab ---------------- */

function TemplatesTab({ state, refresh }) {
  const empty = { id: null, name: '', subject: '', body: '' }
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const save = async () => {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) return
    setBusy(true)
    setErr('')
    try {
      const r = await fetch('/api/admin/blaster', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ action: 'save-template', ...form }),
      }).then(x => x.json())
      if (r.success) {
        setForm(empty)
        refresh()
      } else setErr(r.error || 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this template?')) return
    await fetch('/api/admin/blaster', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action: 'delete-template', id }),
    })
    refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Saved templates</h3>
        <div className="space-y-2">
          {state.builtinTemplates.map(t => (
            <div key={t.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">{t.name}</p>
                <p className="text-xs text-slate-400 truncate max-w-xs">{t.subject}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">built-in</span>
                <button
                  onClick={() => setForm({ id: null, name: `${t.name} (copy)`, subject: t.subject, body: /<[a-zA-Z][^>]*>/.test(t.body) ? t.body : textToHtml(t.body) })}
                  className="p-1.5 text-slate-400 hover:text-teal-600" title="Duplicate as custom"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {state.customTemplates.map(t => (
            <div key={t.id} className="p-3 rounded-lg border border-teal-200 bg-teal-50/30 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">{t.name}</p>
                <p className="text-xs text-slate-400 truncate max-w-xs">{t.subject}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setForm({ ...t, body: /<[a-zA-Z][^>]*>/.test(t.body) ? t.body : textToHtml(t.body) })} className="p-1.5 text-slate-400 hover:text-teal-600" title="Edit">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => del(t.id)} className="p-1.5 text-slate-400 hover:text-rose-600" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {!state.customTemplates.length && (
            <p className="text-xs text-slate-400">No custom templates yet — create one on the right.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-teal-600" />
          {form.id ? 'Edit template' : 'New template'}
        </h3>
        <input
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Template name"
          className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          value={form.subject}
          onChange={e => setForm({ ...form, subject: e.target.value })}
          placeholder="Subject — {firstName} works here too"
          className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <ReactQuill
            theme="snow"
            value={form.body}
            onChange={v => setForm({ ...form, body: v })}
            modules={quillModules}
            placeholder="Body — merge tags: {firstName} {name} {email}"
            className="bg-white [&_.ql-editor]:min-h-64 [&_.ql-editor]:text-sm"
          />
        </div>
        {err && <p className="text-xs text-rose-600">{err}</p>}
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={busy || !form.name.trim() || !form.subject.trim() || !form.body.trim()}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40"
          >
            {busy ? 'Saving…' : form.id ? 'Save changes' : 'Create template'}
          </button>
          {form.id && (
            <button onClick={() => setForm(empty)} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Campaigns tab ---------------- */

function CampaignsTab({ state }) {
  const [open, setOpen] = useState(null)

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {state.campaigns.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <History className="w-8 h-8 mx-auto mb-2 stroke-1" />
          <p className="text-sm">No campaigns sent yet.</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Campaign</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Sent</th>
              <th className="px-4 py-3 font-medium text-right">Failed</th>
              <th className="px-4 py-3 font-medium text-right">Skipped</th>
            </tr>
          </thead>
          <tbody>
            {state.campaigns.map(c => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{c.subject}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(c.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-teal-600 font-semibold">{c.sent}</td>
                <td className="px-4 py-3 text-right text-rose-500">{c.failed}</td>
                <td className="px-4 py-3 text-right text-slate-400">{c.skipped}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
