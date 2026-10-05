'use client'

import { ArrowUpRight, Check, ShieldCheck } from 'lucide-react'

export default function JobDetails({ onOpenApplication }) {
  const responsibilities = ['Keep patient intake records accurate and organized.', 'Help coordinate schedules and referral documentation.', 'Communicate thoughtfully with care and administrative teams.', 'Handle information carefully and flag missing details.']
  const requirements = ['Attention to detail and clear, compassionate communication.', 'Familiarity with data entry and everyday computer tools.', 'A reliable connection and a suitable remote workspace.', 'A willingness to learn and work collaboratively.']

  return (
    <section id="role" className="role-section">
      <div className="site-container role-layout">
        <div className="role-intro">
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h2>Behind the scenes.<br /><em>At the heart of care.</em></h2>
          <p>Help bring clarity, connection, and a little more ease to the patient journey.</p>
          <span className="role-preview-label">ILLUSTRATIVE OPPORTUNITY</span>
        </div>
        <article className="role-card">
          <div className="role-card-top"><span className="role-tag">CARE OPERATIONS</span><span className="role-number">01 /</span></div>
          <h3>Patient Intake &<br />Data Entry Specialist</h3>
          <div className="role-tags"><span>Remote concept</span><span>Non-clinical</span><span>Schedule to be confirmed</span></div>
          <div className="role-columns">
            {/* Responsibilities */}
            <div><h4>What you could do</h4><ul>{responsibilities.map(item => <li key={item}><Check size={15} /><span>{item}</span></li>)}</ul></div>
            {/* Requirements */}
            <div><h4>What you bring</h4><ul>{requirements.map(item => <li key={item}><Check size={15} /><span>{item}</span></li>)}</ul></div>
          </div>
          <div className="role-card-footer"><p>Sound like your kind of work?<small>Explore the four-step application.</small></p><button className="button button-dark" onClick={onOpenApplication}>Get started <ArrowUpRight size={18} /></button></div>
        </article>
        {/* Security & Hiring Transparency Banner */}
        <div className="role-security"><ShieldCheck size={21} /><p>No SSN, bank, or payment-card details in this application. <span>This is a demo, not an active job listing.</span></p></div>
      </div>
    </section>
  )
}
