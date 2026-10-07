'use client'

import { ArrowDown, ArrowUpRight, Heart, MoveUpRight, Laptop, Clock3, Leaf } from 'lucide-react'

export default function Hero({ onOpenApplication }) {
  return (
    <section id="home" className="hero-section site-container">
      {/* Decorative gradient blob */}
      <div className="hero-copy">
        <p className="eyebrow"><span className="status-dot" /> HEALTHCARE CAREERS, WITH PURPOSE</p>
        <h1>Good work.<br />Real purpose.<br /><em>From home.</em></h1>
        <p className="hero-description">Behind every moment of care is someone making it possible. Bring your attention to detail and your human touch to a career in care coordination.</p>
        <div className="hero-actions">
          <button className="button button-dark" onClick={onOpenApplication}>Find your next chapter <ArrowUpRight size={19} /></button>
          <a className="text-link" href="#role">Explore the role <ArrowDown size={16} /></a>
        </div>
        <div className="hero-note"><span className="small-icon"><Heart size={16} /></span><span>People first. In every detail.</span></div>
      </div>
      <div className="hero-art">
        <div className="art-topline"><span>A LITTLE CLOSER TO WHAT MATTERS</span><MoveUpRight size={23} /></div>
        <img className="landscape" src="/canyon-hero.png" alt="A Canyon HomeCare & Hospice caregiver with a patient at home" />
        <div className="art-caption"><Leaf size={17} /><span>Room to grow.<br /><strong>Space to make a difference.</strong></span></div>
        <div className="floating-note"><span className="note-icon"><Heart size={22} strokeWidth={1.5} /></span><div>Care starts with people.<small>And that includes you.</small></div></div>
      </div>
      {/* Key Job Meta Badges */}
      <div className="hero-bottom">
        <span className="hero-bottom-label">A MORE MEANINGFUL WORKDAY</span>
        <span><Laptop size={18} /> Remote-ready work</span>
        <span><Heart size={18} /> People-centered purpose</span>
        <span><Clock3 size={18} /> Share your availability</span>
      </div>
    </section>
  )
}
