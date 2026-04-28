import React from 'react'

export default function DroppedLetter({ x }) {
  return (
    <div
      className="absolute animate-fall"
      style={{ left: x, bottom: 110, transform: 'translateX(-50%)', zIndex: 12 }}
    >
      <div className="animate-idle-bob" style={{ filter: 'drop-shadow(0 0 8px #FFF3C4)' }}>
        <img
          src="/sprites/letter.webp"
          alt="letter"
          draggable={false}
          className="pixel"
          style={{ width: 56, height: 'auto', imageRendering: 'pixelated' }}
        />
      </div>
      <div className="text-center mt-1 text-white text-[10px] font-bold tracking-wider gt-stroke">
        WALK OVER
      </div>
    </div>
  )
}
