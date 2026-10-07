import { ImageResponse } from 'next/og'

export const alt = 'Canyon HomeCare & Hospice careers — Good work. Real purpose. From home.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(160deg, #f8f7f2 0%, #eef0e4 55%, #e6ecd9 100%)',
        color: '#234436',
        position: 'relative',
      }}
    >
      {/* Decorative soft shapes in the background */}
      <div
        style={{
          position: 'absolute',
          width: 620,
          height: 620,
          borderRadius: '50%',
          background: 'rgba(214, 165, 103, 0.14)',
          top: -260,
          right: -140,
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'rgba(114, 144, 123, 0.16)',
          bottom: -220,
          left: -160,
          display: 'flex',
        }}
      />

      {/* Left content column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 56px 64px 64px',
          width: 780,
          position: 'relative',
        }}
      >
        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              width: 62,
              height: 62,
              borderRadius: 18,
              background: '#234436',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Leaf mark */}
            <div
              style={{
                display: 'flex',
                width: 26,
                height: 26,
                borderRadius: '50% 50% 50% 4px',
                background: '#d6a567',
                transform: 'rotate(-45deg)',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>canyon</span>
            <span style={{ fontSize: 11, letterSpacing: 4, color: '#516d57', marginTop: 4 }}>HOMECARE &amp; HOSPICE</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 16,
              letterSpacing: 5,
              color: '#8a7a52',
              fontWeight: 700,
              marginBottom: 22,
            }}
          >
            HEALTHCARE CAREERS · REMOTE
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 82,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.04,
            }}
          >
            <span>Good work.</span>
            <span>Real purpose.</span>
            <span style={{ color: '#72907b' }}>From home.</span>
          </div>
        </div>

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#234436',
              color: '#f4f1e6',
              borderRadius: 999,
              padding: '14px 26px',
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7fd6a8', display: 'flex' }} />
            Now hiring
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 19, color: '#516d57', lineHeight: 1.35 }}>
            <span style={{ fontWeight: 700, color: '#234436' }}>Patient Intake &amp; Data Entry Specialist</span>
            <span>Apply in four steps · No experience required</span>
          </div>
        </div>
      </div>

      {/* Right illustration panel */}
      <div
        style={{
          display: 'flex',
          width: 330,
          margin: '64px 64px 64px 0',
          borderRadius: '160px 18px 18px 18px',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(180deg, #e6ead8 0%, #f4e4bd 100%)',
          border: '1px solid rgba(35, 68, 54, 0.12)',
        }}
      >
        {/* Sun */}
        <div
          style={{
            position: 'absolute',
            width: 108,
            height: 108,
            borderRadius: '50%',
            background: '#d6a567',
            right: 38,
            top: 64,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 150,
            height: 150,
            borderRadius: '50%',
            border: '2px solid rgba(214, 165, 103, 0.4)',
            right: 17,
            top: 43,
            display: 'flex',
          }}
        />

        {/* Distant hills */}
        <div
          style={{
            position: 'absolute',
            width: 460,
            height: 320,
            background: '#b3bea3',
            transform: 'rotate(-32deg)',
            top: 240,
            left: -90,
            borderRadius: 40,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 460,
            height: 300,
            background: '#8fa38b',
            transform: 'rotate(24deg)',
            top: 330,
            left: -60,
            borderRadius: 40,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 480,
            height: 280,
            background: '#234436',
            transform: 'rotate(-18deg)',
            top: 420,
            left: -70,
            borderRadius: 40,
            display: 'flex',
          }}
        />

        {/* House silhouette on the hill */}
        <div
          style={{
            position: 'absolute',
            bottom: 118,
            left: 108,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '34px solid transparent',
              borderRight: '34px solid transparent',
              borderBottom: '30px solid #f4f1e6',
              display: 'flex',
            }}
          />
          <div
            style={{
              width: 56,
              height: 44,
              background: '#f4f1e6',
              borderRadius: '0 0 8px 8px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 14, height: 22, background: '#234436', borderRadius: '7px 7px 0 0', marginTop: 22, display: 'flex' }} />
          </div>
        </div>

        {/* Foreground tree */}
        <div style={{ position: 'absolute', bottom: 92, right: 56, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50% 50% 50% 4px',
              background: '#204b3e',
              transform: 'rotate(-45deg)',
              display: 'flex',
            }}
          />
          <div style={{ width: 8, height: 44, background: '#143a30', borderRadius: 4, display: 'flex' }} />
        </div>

        {/* Path */}
        <div
          style={{
            position: 'absolute',
            bottom: -30,
            left: 90,
            width: 150,
            height: 150,
            borderRadius: '50%',
            border: '16px solid #d5c5a0',
            borderColor: 'transparent transparent #d5c5a0 #d5c5a0',
            transform: 'rotate(-45deg)',
            display: 'flex',
          }}
        />
      </div>
    </div>,
    size,
  )
}
