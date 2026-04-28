import React from 'react'

export default function DroppedLetter({ x }) {
  return (
    <div
      className="absolute animate-fall"
      style={{ left: x, bottom: 110, transform: 'translateX(-50%)', zIndex: 12 }}
    >
      <div className="animate-idle-bob" style={{ filter: 'drop-shadow(0 0 8px #FFF3C4)' }}>
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
      </div>
      <div className="text-center mt-1 text-white text-[10px] font-bold tracking-wider gt-stroke">
        WALK OVER
      </div>
    </div>
  )
}
