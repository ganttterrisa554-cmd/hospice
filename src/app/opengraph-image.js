import { ImageResponse } from 'next/og'

export const alt = 'Apex healthcare careers concept — Good work. Real purpose. From home.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#f8f7f2', color: '#234436', padding: 64, position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '70%' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 40, fontWeight: 700 }}>apex</span><span style={{ fontSize: 13, letterSpacing: 4 }}>CARE PARTNERS</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 74, letterSpacing: -3, lineHeight: 1.08 }}><span>Good work.</span><span>Real purpose.</span><span style={{ color: '#788568' }}>From home.</span></div>
        <span style={{ fontSize: 19 }}>Healthcare careers · Design concept</span>
      </div>
      <div style={{ display: 'flex', width: 330, background: '#e1e7d2', borderRadius: '150px 12px 12px 12px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 105, height: 105, borderRadius: '50%', background: '#d6a567', right: 35, top: 65 }} />
        <div style={{ position: 'absolute', width: 440, height: 350, background: '#8fa38b', transform: 'rotate(-35deg)', top: 270, left: -85 }} />
        <div style={{ position: 'absolute', width: 440, height: 300, background: '#234436', transform: 'rotate(25deg)', top: 360, left: -55 }} />
      </div>
    </div>,
    size,
  )
}
