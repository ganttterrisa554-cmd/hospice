'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import JobDetails from '../components/JobDetails'
import Benefits from '../components/Benefits'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'
import ApplicationModal from '../components/ApplicationModal'
import ApplicationSuccess from '../components/ApplicationSuccess'
import AdminDrawer from '../components/AdminDrawer'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [activeSubmission, setActiveSubmission] = useState(null)
  const [submissions, setSubmissions] = useState([])

  // Load submissions from localStorage or API on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('apex_care_applications')
      if (stored) {
        setSubmissions(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Error loading stored submissions', e)
    }
  }, [])

  const handleOpenApplication = () => {
    setIsModalOpen(true)
  }

  const handleCloseApplication = () => {
    setIsModalOpen(false)
  }

  const handleSubmissionSuccess = (submission) => {
    setSubmissions(prev => [submission, ...prev])
    setIsModalOpen(false)
    setActiveSubmission(submission)
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all stored submissions?')) {
      localStorage.removeItem('apex_care_applications')
      setSubmissions([])
    }
  }

  return (
    <div className="careers-site">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar
        onOpenApplication={handleOpenApplication}
        onViewSubmissions={() => setIsAdminOpen(true)}
        submissionCount={submissions.length}
      />

      <main id="main-content">
        <Hero onOpenApplication={handleOpenApplication} />
        <Benefits />
        <JobDetails onOpenApplication={handleOpenApplication} />
        <FAQ onOpenApplication={handleOpenApplication} />
      </main>

      <Footer onOpenApplication={handleOpenApplication} />

      {/* Interactive Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={handleCloseApplication}
        onSubmitSuccess={handleSubmissionSuccess}
      />

      {/* Submission Success Confirmation Modal */}
      <ApplicationSuccess
        submission={activeSubmission}
        onClose={() => setActiveSubmission(null)}
      />

      {/* Recruiter / Admin Application Review Drawer */}
      <AdminDrawer
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        applications={submissions}
        onClearAll={handleClearAll}
      />
    </div>
  )
}
