'use client'

import { Check, ArrowLeft, ShieldCheck, Printer } from 'lucide-react'

export default function ApplicationSuccess({ submission, onClose }) {
  if (!submission) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="success-title" className="success-dialog bg-slate-50 rounded-2xl max-w-xl w-full shadow-2xl my-auto p-7 sm:p-10 text-center">
        <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={28} /></div>
        <p className="eyebrow">FOUR STEPS. ONE NEW POSSIBILITY.</p>
        <h2 id="success-title" className="font-serif text-4xl mt-3 text-slate-900">You’ve reached the finish.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">Thank you, {submission.fullName}. You’ve completed the sample application experience. This is a demo, not an application to a real employer.</p>
        {/* Reference ID card */}
        <div className="my-7 border-y border-slate-200 py-5 flex justify-between items-center gap-3 text-left"><div><p className="eyebrow text-slate-500">DEMO REFERENCE</p><p className="font-mono text-sm mt-1">{submission.id}</p></div><span className="text-xs text-slate-500">{new Date(submission.submittedAt).toLocaleDateString()}</span></div>
        {/* Timeline breakdown */}
        <p className="text-sm text-slate-600 leading-7 mb-6">You can return to the careers page or explore your sample entry in the demo inbox. No recruiter will contact you.</p>
        {/* Security Reminder */}
        <div className="flex gap-3 items-start text-left bg-teal-100 p-4 rounded-lg mb-7 text-xs leading-6 text-teal-900"><ShieldCheck size={20} className="shrink-0 mt-1" /><p>Please use fictional data. This prototype is not configured for secure production recruitment.</p></div>
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center"><button onClick={() => window.print()} className="text-link"><Printer size={16} /> Print summary</button><button onClick={onClose} className="button button-dark"><ArrowLeft size={16} /> Back to careers</button></div>
      </div>
    </div>
  )
}
