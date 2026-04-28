import React from 'react'

export default function Sign({ x, y = 220, children }) {
  return (
    <div
      className="absolute pointer-events-none animate-sign-bob"
      style={{ left: x, bottom: y, transform: 'translateX(-50%)', zIndex: 15 }}
    >
      <div className="relative gt-panel px-3 py-2 max-w-[260px] text-center">
        <div className="text-[#3A1F0C] text-sm font-bold leading-tight whitespace-pre-line">
          {children}
        </div>
        {/* sign post */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: '100%',
            width: 8, height: 22,
            background: 'linear-gradient(#8a5a2b, #5A3416)',
            border: '2px solid #3A1F0C'
          }}
        />
      </div>
    </div>
  )
}
