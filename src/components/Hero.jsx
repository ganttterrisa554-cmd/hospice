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
        <svg className="landscape" viewBox="0 0 540 550" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="sky" x1="270" y1="0" x2="270" y2="550" gradientUnits="userSpaceOnUse"><stop stopColor="#e6ead8" /><stop offset="1" stopColor="#f4e4bd" /></linearGradient>
            <linearGradient id="hill" x1="50" y1="280" x2="400" y2="550" gradientUnits="userSpaceOnUse"><stop stopColor="#72907b" /><stop offset="1" stopColor="#294c40" /></linearGradient>
          </defs>
          <path fill="url(#sky)" d="M0 0h540v550H0z" />
          <circle cx="365" cy="143" r="64" fill="#d6a567" />
          <circle cx="365" cy="143" r="88" stroke="#d6a567" strokeOpacity=".3" />
          <path d="M-40 360 128 143 332 371 453 247 600 417V600H-40Z" fill="#b3bea3" />
          <path d="m128 143 49 127-48-24-45 24Z" fill="#e4e4ce" />
          <path d="M-30 407 83 313 173 354 311 220 580 471v130H-30Z" fill="#8fa38b" />
          <path d="M-30 425c154-227 261 99 402-69 99-119 201-71 242-18v263H-30Z" fill="url(#hill)" />
          <path d="M-25 466c174-85 266-23 333 33 87 73 175-90 277-25v127H-25Z" fill="#204b3e" />
          <path d="M270 363c-131 90 109 91-7 201" stroke="#d5c5a0" strokeWidth="24" />
          <path d="M270 363c-131 90 109 91-7 201" stroke="#ede0bc" strokeWidth="2" />
          <g stroke="#143a30" strokeWidth="4" strokeLinecap="round"><path d="M65 510V378m0 30-22 24m22-45 18 22m-18 12 26 30m-26-18-31 31M463 512V341m0 37-25 28m25-47 20 21m-20 29 31 28m-31-6-32 34" /></g>
          <path d="m212 130 10-5 10 5m-39-20 8-4 8 4" stroke="#516d57" strokeWidth="2" strokeLinecap="round" />
        </svg>
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
