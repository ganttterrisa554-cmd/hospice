import { ArrowUpRight, Flower2 } from 'lucide-react'

export default function Footer({ onOpenApplication }) {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-cta"><div><p className="eyebrow">A FRESH START, WITH PURPOSE</p><h2>Your next chapter<br />starts <em>with you.</em></h2></div><button className="button button-light" onClick={onOpenApplication}>Explore the application <ArrowUpRight size={20} /></button></div>
        <div className="footer-bottom"><a href="#home" className="brand"><Flower2 size={32} strokeWidth={1.4} /><span>apex<span className="brand-subtitle">CARE PARTNERS</span></span></a><p>Careers concept · Placeholder branding<br />Not an official employer website. Use sample data only.</p><a className="text-link" href="#home">Back to top <ArrowUpRight size={16} /></a></div>
      </div>
    </footer>
  )
}
