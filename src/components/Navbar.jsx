'use client'

import { ArrowUpRight, Flower2, FolderOpen } from 'lucide-react'

export default function Navbar({ onOpenApplication, onViewSubmissions, submissionCount }) {
  return (
    <header className="site-header">
      <div className="site-container nav-inner">
        <a className="brand" href="#home" aria-label="Apex careers home">
          <Flower2 size={37} strokeWidth={1.4} />
          <span>apex<span className="brand-subtitle">CARE PARTNERS</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#about">Our approach</a>
          <a href="#role">The opportunity</a>
          <a href="#faq">Good to know</a>
        </nav>
        <div className="nav-actions">
          <button className="dashboard-button" onClick={onViewSubmissions} aria-label={`View ${submissionCount} submitted applications`}>
            <FolderOpen size={18} /><span>Applications</span><span className="inbox-count">{submissionCount}</span>
          </button>
          <button className="button button-dark nav-apply" onClick={onOpenApplication}>Apply now <ArrowUpRight size={17} /></button>
        </div>
      </div>
    </header>
  )
}
