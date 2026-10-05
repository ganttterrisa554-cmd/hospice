'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  X, Check, ChevronRight, ChevronLeft, User, Briefcase, Laptop,
  FileCheck2, AlertCircle, Upload, CheckCircle2, Flower2
} from 'lucide-react'

const INITIAL_FORM = {
  // Step 1: Personal
  fullName: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  is18OrOlder: 'Yes',
  workAuthorizedUS: 'Yes',
  requiresSponsorship: 'No',

  // Step 2: Experience
  currentlyEmployed: 'No',
  remoteExperience: 'Yes',
  dataEntryExperience: 'Some experience',
  typingSpeed: '40-60 WPM',
  ehrExperience: 'Willing to learn',
  resumeFileName: '',
  coverLetterNote: '',

  // Step 3: Availability & Equipment
  weeklyHours: '30-40 hrs',
  preferredShift: 'Standard Business Hours',
  reliableInternet: 'Yes',
  primaryDevice: 'Laptop',
  quietWorkspace: 'Yes',

  // Step 4: Certification
  certifiedAccurate: false,
  signatureName: '',
  consentDate: new Date().toISOString().split('T')[0],
}

export default function ApplyPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submission, setSubmission] = useState(null)

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateStep = (currentStep) => {
    const errs = {}
    if (currentStep === 1) {
      if (!formData.fullName.trim()) errs.fullName = 'Full Name is required'
      if (!formData.email.trim()) {
        errs.email = 'Email address is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errs.email = 'Please provide a valid email address'
      }
      if (!formData.phone.trim()) errs.phone = 'Phone number is required'
      if (!formData.city.trim()) errs.city = 'City is required'
      if (!formData.state.trim()) errs.state = 'State / Province is required'
      if (formData.is18OrOlder !== 'Yes') {
        errs.is18OrOlder = 'Applicants must be at least 18 years old'
      }
      if (formData.workAuthorizedUS !== 'Yes') {
        errs.workAuthorizedUS = 'Work authorization in the US is required for this role'
      }
    } else if (currentStep === 2) {
      if (!formData.dataEntryExperience) errs.dataEntryExperience = 'Please select experience level'
    } else if (currentStep === 3) {
      if (formData.reliableInternet !== 'Yes') {
        errs.reliableInternet = 'Reliable high-speed internet is required for remote duties'
      }
      if (!formData.primaryDevice) errs.primaryDevice = 'Please select your primary device'
    } else if (currentStep === 4) {
      if (!formData.certifiedAccurate) {
        errs.certifiedAccurate = 'You must certify the accuracy of your statements'
      }
      if (!formData.signatureName.trim()) {
        errs.signatureName = 'Please enter your full name as digital signature'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
      window.scrollTo({ top: 0 })
    }
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
    window.scrollTo({ top: 0 })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      updateField('resumeFileName', `${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(4)) return

    setIsSubmitting(true)
    const submissionData = {
      id: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
      submittedAt: new Date().toISOString(),
      ...formData
    }

    setErrors(prev => ({ ...prev, submission: undefined }))
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Application could not be sent. Please try again.')
      }

      try {
        const existing = JSON.parse(localStorage.getItem('apex_care_applications') || '[]')
        const entries = Array.isArray(existing) ? existing : []
        localStorage.setItem('apex_care_applications', JSON.stringify([
          result.application, ...entries.filter(entry => entry.id !== result.application.id)
        ].slice(0, 100)))
      } catch {
        // Local copy is best-effort; the email delivery already succeeded
      }
      setSubmission(result.application)
      window.scrollTo({ top: 0 })
    } catch (err) {
      setErrors(prev => ({ ...prev, submission: err.message || 'Application could not be sent. Please try again.' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepsMeta = [
    { num: 1, label: 'Personal Info', icon: User },
    { num: 2, label: 'Experience', icon: Briefcase },
    { num: 3, label: 'Setup & Hours', icon: Laptop },
    { num: 4, label: 'Review & Sign', icon: FileCheck2 },
  ]

  if (submission) {
    return (
      <div className="careers-site">
        <header className="site-header">
          <div className="site-container nav-inner">
            <Link className="brand" href="/" aria-label="Apex careers home">
              <Flower2 size={37} strokeWidth={1.4} />
              <span>apex<span className="brand-subtitle">CARE PARTNERS</span></span>
            </Link>
            <Link href="/" className="text-link"><X size={16} /> Back to careers</Link>
          </div>
        </header>
        <main id="main-content" style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div className="bg-slate-50 rounded-2xl shadow-2xl p-7 sm:p-10 text-center border border-slate-200" style={{ background: '#fff' }}>
              <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={28} /></div>
              <p className="eyebrow">FOUR STEPS. ONE NEW POSSIBILITY.</p>
              <h2 className="font-serif text-4xl mt-3 text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>You&apos;ve reached the finish.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">Thank you, {submission.fullName}. Your application has been submitted and sent to our hiring team for review.</p>
              <div className="my-7 border-y border-slate-200 py-5 flex justify-between items-center gap-3 text-left">
                <div><p className="eyebrow text-slate-500">APPLICATION REFERENCE</p><p className="font-mono text-sm mt-1">{submission.id}</p></div>
                <span className="text-xs text-slate-500">{new Date(submission.submittedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-600 leading-7 mb-6">Our team will review your application and reach out to you directly if your experience is a fit for the role.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/" className="button button-dark">Back to careers</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="careers-site">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="site-container nav-inner">
          <Link className="brand" href="/" aria-label="Apex careers home">
            <Flower2 size={37} strokeWidth={1.4} />
            <span>apex<span className="brand-subtitle">CARE PARTNERS</span></span>
          </Link>
          <Link href="/" className="text-link"><X size={16} /> Back to careers</Link>
        </div>
      </header>

      <main id="main-content" style={{ padding: '48px 20px 80px' }}>
        <div className="application-dialog max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col" style={{ margin: '0 auto' }}>

          {/* Header */}
          <div className="application-heading flex items-center justify-between gap-4">
            <div>
              <span className="eyebrow block">YOUR NEXT CHAPTER · STEP {step} OF 4</span>
              <h2>Let&apos;s get to know you.</h2>
            </div>
          </div>

          <div className="application-privacy-note">Your information will be sent to our hiring team for review.</div>

          {/* Stepper Bar */}
          <div className="px-6 py-4 bg-white border-b border-slate-100">
            <div className="grid grid-cols-4 gap-2">
              {stepsMeta.map((s) => {
                const Icon = s.icon
                const isPassed = step > s.num
                const isCurrent = step === s.num
                return (
                  <div key={s.num} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-xs sm:text-sm transition-all ${
                        isPassed
                          ? 'bg-teal-600 text-white'
                          : isCurrent
                          ? 'bg-teal-100 text-teal-800 ring-2 ring-teal-600 ring-offset-2'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-[11px] sm:text-xs mt-1.5 font-medium truncate w-full ${isCurrent ? 'text-teal-700 font-bold' : 'text-slate-500'}`}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Body */}
          <div className="application-body p-6 sm:p-8">
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">1. Personal & Contact Information</h3>
                  <p className="text-sm text-slate-500">
                    Please provide your accurate legal contact details for correspondence and verification.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.fullName ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-teal-500'} focus:outline-none focus:ring-2`}
                    />
                    {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="janedoe@example.com"
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-teal-500'} focus:outline-none focus:ring-2`}
                    />
                    {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="(555) 000-0000"
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.phone ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-teal-500'} focus:outline-none focus:ring-2`}
                    />
                    {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="City"
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.city ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-teal-500'} focus:outline-none focus:ring-2`}
                    />
                    {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      State / Province <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="State or Province"
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.state ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-teal-500'} focus:outline-none focus:ring-2`}
                    />
                    {errors.state && <p className="text-xs text-rose-500 mt-1">{errors.state}</p>}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Are you at least 18 years of age? <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map(opt => (
                        <label key={opt} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium ${formData.is18OrOlder === opt ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                          <input
                            type="radio"
                            name="is18OrOlder"
                            value={opt}
                            checked={formData.is18OrOlder === opt}
                            onChange={(e) => updateField('is18OrOlder', e.target.value)}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                    {errors.is18OrOlder && <p className="text-xs text-rose-500 mt-1">{errors.is18OrOlder}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Are you legally authorized to work in the United States? <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map(opt => (
                        <label key={opt} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium ${formData.workAuthorizedUS === opt ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                          <input
                            type="radio"
                            name="workAuthorizedUS"
                            value={opt}
                            checked={formData.workAuthorizedUS === opt}
                            onChange={(e) => updateField('workAuthorizedUS', e.target.value)}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                    {errors.workAuthorizedUS && <p className="text-xs text-rose-500 mt-1">{errors.workAuthorizedUS}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Employment & Skills */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">2. Employment History & Qualifications</h3>
                  <p className="text-sm text-slate-500">
                    Tell us about your background, remote readiness, and clerical experience.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Are you currently employed?
                  </label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium ${formData.currentlyEmployed === opt ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        <input
                          type="radio"
                          name="currentlyEmployed"
                          value={opt}
                          checked={formData.currentlyEmployed === opt}
                          onChange={(e) => updateField('currentlyEmployed', e.target.value)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Have you worked remotely before?
                  </label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium ${formData.remoteExperience === opt ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        <input
                          type="radio"
                          name="remoteExperience"
                          value={opt}
                          checked={formData.remoteExperience === opt}
                          onChange={(e) => updateField('remoteExperience', e.target.value)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Do you have experience with data entry or records management? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Yes - 2+ years', 'Some experience', 'No prior experience'].map(opt => (
                      <label key={opt} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-sm font-medium ${formData.dataEntryExperience === opt ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        <input
                          type="radio"
                          name="dataEntryExperience"
                          value={opt}
                          checked={formData.dataEntryExperience === opt}
                          onChange={(e) => updateField('dataEntryExperience', e.target.value)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Estimated Typing Speed
                    </label>
                    <select
                      value={formData.typingSpeed}
                      onChange={(e) => updateField('typingSpeed', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 focus:outline-none focus:ring-2 text-sm"
                    >
                      <option value="Under 40 WPM">Under 40 WPM</option>
                      <option value="40-60 WPM">40-60 WPM (Standard)</option>
                      <option value="60-80 WPM">60-80 WPM (Fast)</option>
                      <option value="80+ WPM">80+ WPM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Healthcare Software / EHR Experience
                    </label>
                    <select
                      value={formData.ehrExperience}
                      onChange={(e) => updateField('ehrExperience', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 focus:outline-none focus:ring-2 text-sm"
                    >
                      <option value="Experienced with EHR systems">Experienced with EHR systems (Epic, Cerner, etc.)</option>
                      <option value="General clerical software only">General clerical software only (Word, Excel)</option>
                      <option value="Willing to learn">Willing to learn</option>
                    </select>
                  </div>
                </div>

                {/* Resume attachment option */}
                <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Resume / CV Document (Optional)
                  </label>
                  <p className="text-xs text-slate-500 mb-3">A filename is recorded for review, but the document itself is not uploaded.</p>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer shadow-sm transition-colors">
                      <Upload className="w-4 h-4 text-teal-600" />
                      <span>Choose File</span>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <span className="text-xs text-slate-600 truncate">
                      {formData.resumeFileName || 'No file selected yet'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Setup & Availability */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">3. Availability & Remote Work Equipment</h3>
                  <p className="text-sm text-slate-500">
                    Ensure your schedule and workstation setup meet standard remote coordination criteria.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    How many hours are you available each week? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['10-20 hrs', '20-30 hrs', '30-40 hrs', '40+ hrs (Full Time)'].map(opt => (
                      <label key={opt} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer text-sm font-medium text-center ${formData.weeklyHours === opt ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        <input
                          type="radio"
                          name="weeklyHours"
                          value={opt}
                          checked={formData.weeklyHours === opt}
                          onChange={(e) => updateField('weeklyHours', e.target.value)}
                          className="hidden"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Preferred Shift Window
                  </label>
                  <select
                    value={formData.preferredShift}
                    onChange={(e) => updateField('preferredShift', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-teal-500 focus:outline-none focus:ring-2 text-sm"
                  >
                    <option value="Standard Business Hours">Standard Daytime (8:00 AM - 4:30 PM)</option>
                    <option value="Mid-day Shift">Mid-day Shift (10:00 AM - 6:30 PM)</option>
                    <option value="Evening Support">Evening Support (1:00 PM - 9:30 PM)</option>
                    <option value="Flexible / Variable">Flexible / Open Availability</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Do you have a reliable high-speed broadband internet connection? <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map(opt => (
                        <label key={opt} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium ${formData.reliableInternet === opt ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                          <input
                            type="radio"
                            name="reliableInternet"
                            value={opt}
                            checked={formData.reliableInternet === opt}
                            onChange={(e) => updateField('reliableInternet', e.target.value)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                    {errors.reliableInternet && <p className="text-xs text-rose-500 mt-1">{errors.reliableInternet}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Primary device you will use for remote tasks: <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['Laptop', 'Desktop', 'Tablet', 'Smartphone'].map(opt => (
                        <label key={opt} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer text-sm font-medium text-center ${formData.primaryDevice === opt ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                          <input
                            type="radio"
                            name="primaryDevice"
                            value={opt}
                            checked={formData.primaryDevice === opt}
                            onChange={(e) => updateField('primaryDevice', e.target.value)}
                            className="hidden"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Do you have access to a private, quiet space to maintain HIPAA confidentiality?
                    </label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map(opt => (
                        <label key={opt} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium ${formData.quietWorkspace === opt ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                          <input
                            type="radio"
                            name="quietWorkspace"
                            value={opt}
                            checked={formData.quietWorkspace === opt}
                            onChange={(e) => updateField('quietWorkspace', e.target.value)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Certification */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">4. Review & Legal Certification</h3>
                  <p className="text-sm text-slate-500">
                    Please review your submission summary below and provide your digital signature to certify.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-200">
                    <div><span className="text-slate-500">Applicant:</span> <strong className="text-slate-900">{formData.fullName}</strong></div>
                    <div><span className="text-slate-500">Email:</span> <span className="text-slate-900">{formData.email}</span></div>
                    <div><span className="text-slate-500">Phone:</span> <span className="text-slate-900">{formData.phone}</span></div>
                    <div><span className="text-slate-500">Location:</span> <span className="text-slate-900">{formData.city}, {formData.state}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div><span className="text-slate-500">Data Entry Exp:</span> <span className="text-slate-900 font-medium">{formData.dataEntryExperience}</span></div>
                    <div><span className="text-slate-500">Weekly Availability:</span> <span className="text-slate-900 font-medium">{formData.weeklyHours}</span></div>
                    <div><span className="text-slate-500">Primary Device:</span> <span className="text-slate-900 font-medium">{formData.primaryDevice}</span></div>
                    <div><span className="text-slate-500">Resume:</span> <span className="text-slate-900 font-medium">{formData.resumeFileName || 'None uploaded'}</span></div>
                  </div>
                </div>

                {/* Submission Notice */}
                <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 text-xs text-teal-900 space-y-2">
                  <p className="font-semibold text-teal-950">Before you submit:</p>
                  <p>
                    Submitting sends your application details to our hiring team for review. Resume files are not uploaded or attached at this stage.
                  </p>
                </div>

                {/* Certification Checkbox */}
                <div>
                  <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.certifiedAccurate}
                      onChange={(e) => updateField('certifiedAccurate', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                    />
                    <span className="text-xs sm:text-sm text-slate-800 leading-snug">
                      <strong>I certify that the information provided is accurate</strong> and understand that my details will be sent to the hiring team for review.
                    </span>
                  </label>
                  {errors.certifiedAccurate && <p className="text-xs text-rose-500 mt-1.5">{errors.certifiedAccurate}</p>}
                </div>

                {/* Digital Signature */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Digital Signature (Type Full Legal Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.signatureName}
                      onChange={(e) => updateField('signatureName', e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className={`w-full px-4 py-2.5 rounded-xl border ${errors.signatureName ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-teal-500'} focus:outline-none focus:ring-2 text-sm font-serif`}
                    />
                    {errors.signatureName && <p className="text-xs text-rose-500 mt-1">{errors.signatureName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Date Signed
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.consentDate}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            {errors.submission && (
              <div className="mb-3 flex items-center gap-2 text-xs text-rose-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.submission}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
