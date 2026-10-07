'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import JobDetails from '../components/JobDetails'
import Benefits from '../components/Benefits'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'
import AdminDrawer from '../components/AdminDrawer'

export default function Home() {
  const router = useRouter()
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [submissions, setSubmissions] = useState([])

  // Load submissions from localStorage or API on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('canyon_care_applications')
      if (stored) {
        setSubmissions(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Error loading stored submissions', e)
    }
  }, [])

  const handleOpenApplication = () => {
    router.push('/apply')
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all stored submissions?')) {
      localStorage.removeItem('canyon_care_applications')
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
