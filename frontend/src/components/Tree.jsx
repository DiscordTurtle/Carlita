import React from 'react'

// Pixel-art tree built with divs. `stage`: 'tree' | 'letter-tree' | 'punched'
export default function Tree({ x, stage }) {
  const swaying = stage !== 'punched'
  return (
    <div
      className="absolute flex flex-col items-center pointer-events-none"
      style={{ left: x, bottom: 108, transform: 'translateX(-50%)', zIndex: 10 }}
    >
      <div className={swaying ? 'animate-idle-bob' : ''}>
        {/* leaves */}
        <div className="relative" style={{ width: 140, height: 110 }}>
          <Leaves stage={stage} />
        </div>
        {/* trunk */}
        <div className="mx-auto" style={{
          width: 26, height: 70,
          background: 'linear-gradient(#8a5a2b, #5A3416)',
          border: '3px solid #3A1F0C',
          borderRadius: 4,
          boxShadow: 'inset -4px 0 0 rgba(0,0,0,.25), inset 4px 0 0 rgba(255,255,255,.08)'
        }} />
      </div>
      <div className="rounded-full bg-black/30 blur-[2px]" style={{ width: 80, height: 10, marginTop: -2 }} />
    </div>
  )
}

function Leaves({ stage }) {
  if (stage === 'punched') {
    return (
      <div className="absolute inset-0 flex items-end justify-center opacity-60">
        <div style={{
          width: 90, height: 18, borderRadius: '50%',
          background: 'radial-gradient(ellipse, #3F8C1B 0%, transparent 70%)'
        }} />
      </div>
    )
  }
  if (stage === 'letter-tree') {
    return (
      <div className="absolute inset-0">
        <Bush color="#FFD93B" shadow="#DE911D" />
        {/* envelope on top */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 animate-pop">
          <Envelope />
        </div>
      </div>
    )
  }
  return <Bush color="#7BC74D" shadow="#3F8C1B" />
}

function Bush({ color, shadow }) {
  return (
    <div className="absolute inset-0">
      {[
        { l: 10,  t: 30, s: 70 },
        { l: 50,  t: 5,  s: 80 },
        { l: 0,   t: 55, s: 60 },
        { l: 70,  t: 50, s: 60 }
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: b.l, top: b.t,
          width: b.s, height: b.s,
          borderRadius: '50%',
          background: color,
          boxShadow: `inset -6px -6px 0 ${shadow}, inset 4px 4px 0 rgba(255,255,255,.25)`,
          border: '3px solid #2E5F12'
        }} />
      ))}
    </div>
  )
}

function Envelope() {
  return (
    <div style={{
      width: 56, height: 38,
      background: '#FFFBEA',
      border: '3px solid #5A3416',
      borderRadius: 4,
      position: 'relative',
      boxShadow: '0 3px 0 #3A1F0C'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        clipPath: 'polygon(0 0, 50% 60%, 100% 0)',
        background: '#FADB5F',
        borderBottom: '3px solid #5A3416'
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '60%',
        transform: 'translate(-50%, -50%)',
        color: '#C2185B', fontWeight: 900, fontSize: 18
      }}>♥</div>
    </div>
  )
}
