'use client'

import { useState } from 'react'
import { Plus, Minus, ArrowUpRight } from 'lucide-react'

export default function FAQ({ onOpenApplication }) {
  const [openIdx, setOpenIdx] = useState(0)
  const faqs = [
    { q: 'What should I have ready?', a: 'The demo walks through contact details, experience, availability, and a final review. Please use fictional details while exploring it. No Social Security number, bank details, or payment information is requested.' },
    { q: 'Do I need healthcare experience?', a: 'The sample role focuses on organization, communication, and data entry. Final eligibility requirements and training details need to be confirmed by the employer before a real opening is published.' },
    { q: 'Can I choose my working hours?', a: 'You can share your weekly availability and preferred shift in the application. Actual schedules, pay, and benefits are not yet confirmed.' },
    { q: 'What happens after I apply?', a: 'You will see a demo confirmation. This prototype does not send an application to a recruitment team or schedule an interview. Resume selection currently records only the filename, not an uploaded document.' },
    { q: 'Is this an official employer website?', a: 'No. Apex Care Partners is placeholder branding for this design concept. Employer identity, contact details, privacy policies, and hiring information must be verified before launch.' },
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
