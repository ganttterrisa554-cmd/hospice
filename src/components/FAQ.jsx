'use client'

import { useState } from 'react'
import { Plus, Minus, ArrowUpRight } from 'lucide-react'

export default function FAQ({ onOpenApplication }) {
  const [openIdx, setOpenIdx] = useState(0)
  const faqs = [
    { q: 'What should I have ready?', a: 'The application walks through contact details, experience, availability, and a final review.' },
    { q: 'Do I need healthcare experience?', a: 'This role focuses on organization, communication, and data entry. Prior healthcare experience is welcome but not required — training is provided for the right candidate.' },
    { q: 'Can I choose my working hours?', a: 'You can share your weekly availability and preferred shift in the application. Final schedules are confirmed during the hiring process.' },
    { q: 'What happens after I apply?', a: 'Your application is sent to our hiring team for review. You will see a confirmation with a reference number, and we will reach out to you directly if your experience is a fit for the role.' },
  ]

  return (
    <section id="faq" className="faq-section site-container">
      <div className="faq-intro"><p className="eyebrow">A LITTLE CLARITY</p><h2>Good questions.<br /><em>Honest answers.</em></h2><p>Your next step should feel straightforward. Here’s what to know before getting started.</p><button className="text-link" onClick={onOpenApplication}>Explore the application <ArrowUpRight size={17} /></button></div>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div className={`faq-item ${openIdx === index ? 'is-open' : ''}`} key={faq.q}>
            <h3><button onClick={() => setOpenIdx(openIdx === index ? -1 : index)} aria-expanded={openIdx === index} aria-controls={`faq-answer-${index}`}><span>{faq.q}</span>{openIdx === index ? <Minus size={18} /> : <Plus size={18} />}</button></h3>
            <div id={`faq-answer-${index}`} hidden={openIdx !== index}><p>{faq.a}</p></div>
          </div>
        ))}
      </div>
    </section>
  )
}
