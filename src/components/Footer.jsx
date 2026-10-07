import { ArrowUpRight, Flower2 } from 'lucide-react'

export default function Footer({ onOpenApplication }) {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-cta"><div><p className="eyebrow">A FRESH START, WITH PURPOSE</p><h2>Your next chapter<br />starts <em>with you.</em></h2></div><button className="button button-light" onClick={onOpenApplication}>Explore the application <ArrowUpRight size={20} /></button></div>
        <div className="footer-bottom"><a href="#home" className="brand"><Flower2 size={32} strokeWidth={1.4} /><span>canyon<span className="brand-subtitle">HOMECARE &amp; HOSPICE</span></span></a><p>Careers at Canyon HomeCare &amp; Hospice<br />Equal opportunity employer.</p><a className="text-link" href="#home">Back to top <ArrowUpRight size={16} /></a></div>
      </div>
    </footer>
  )
}
