'use client'

import React, { useState } from 'react'
import { X, Trash2, Download, Search, UserCheck, Clock, Mail, Phone, MapPin, Send } from 'lucide-react'

export default function AdminDrawer({ isOpen, onClose, applications, onClearAll }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)

  if (!isOpen) return null

  const filtered = applications.filter(app => {
    const term = searchTerm.toLowerCase()
    return (
      app.fullName?.toLowerCase().includes(term) ||
      app.email?.toLowerCase().includes(term) ||
      app.city?.toLowerCase().includes(term) ||
      app.id?.toLowerCase().includes(term)
    )
  })

  const exportCSV = () => {
    if (applications.length === 0) return
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'City', 'State', 'Experience', 'Weekly Hours', 'Device', 'Submitted At']
    const rows = applications.map(a => [
      a.id,
      `"${a.fullName || ''}"`,
      a.email,
      a.phone,
      `"${a.city || ''}"`,
      `"${a.state || ''}"`,
      `"${a.dataEntryExperience || ''}"`,
      `"${a.weeklyHours || ''}"`,
      `"${a.primaryDevice || ''}"`,
      a.submittedAt
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `canyon_care_applications_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">

        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              Recruiter Intake Dashboard
            </h2>
            <p className="text-xs text-slate-500">
              {applications.length} total applicant submission{applications.length === 1 ? '' : 's'} recorded
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              title="Open email blaster"
            >
              <Send className="w-3.5 h-3.5" />
              Blaster
            </a>
            {applications.length > 0 && (
              <>
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Export to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
                <button
                  onClick={onClearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                  title="Clear all local data"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by candidate name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* List of Applications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 stroke-1" />
              <p className="text-sm font-medium">No application records found.</p>
              <p className="text-xs text-slate-400 mt-1">Submitted applications will appear here.</p>
            </div>
          ) : (
            filtered.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedApp?.id === app.id
                    ? 'border-teal-500 bg-teal-50/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">
                    {app.id}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(app.submittedAt).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{app.fullName}</h3>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{app.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{app.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{app.city}, {app.state}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Exp:</span> {app.dataEntryExperience}
                  </div>
                </div>

                {selectedApp?.id === app.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-700 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong>Weekly Hours:</strong> {app.weeklyHours}</div>
                      <div><strong>Shift:</strong> {app.preferredShift}</div>
                      <div><strong>Primary Device:</strong> {app.primaryDevice}</div>
                      <div><strong>High-Speed Net:</strong> {app.reliableInternet}</div>
                      <div><strong>US Authorized:</strong> {app.workAuthorizedUS}</div>
                      <div><strong>Quiet Room:</strong> {app.quietWorkspace}</div>
                    </div>
                    {app.resumeFileName && (
                      <div className="mt-2 p-2 rounded bg-slate-100 font-mono text-[11px]">
                        Attached: {app.resumeFileName}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 italic pt-1">
                      Digital Signature: {app.signatureName} (Signed {app.consentDate})
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
