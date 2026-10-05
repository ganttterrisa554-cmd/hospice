import { HeartHandshake, Sprout, House } from 'lucide-react'

export default function Benefits() {
  const values = [
    { icon: HeartHandshake, title: 'Small details. Real impact.', text: 'A complete record. A coordinated appointment. Thoughtful administrative work helps care teams focus on people.' },
    { icon: House, title: 'A different place to work.', text: 'Explore a remote-focused role where clear communication and a considered workspace keep you connected.' },
    { icon: Sprout, title: 'Bring your curiosity.', text: 'Your experience is part of the story. So are your willingness to learn, your patience, and your eye for detail.' },
  ]

  return (
    <section id="about" className="values-section site-container">
      <div className="section-heading">
        <div><p className="eyebrow">THE HUMAN SIDE OF WORK</p><h2>A career that feels<br />a little more <em>like you.</em></h2></div>
        <p>Meaningful work doesn’t always happen at the bedside. Sometimes, it starts with the person behind the screen.</p>
      </div>
      <div className="values-grid">
        {values.map(({ icon: Icon, title, text }, index) => (
          <article className="value-item" key={title}>
            <div className="value-top"><Icon size={30} strokeWidth={1.3} /><span>0{index + 1}</span></div>
            <h3>{title}</h3><p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
