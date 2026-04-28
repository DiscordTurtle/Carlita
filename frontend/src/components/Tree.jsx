import React from 'react'

// Tree uses sprites from /inspo:
//   stage 'tree'        → tree.webp        (base tree)
//   stage 'letter-tree' → tree-letter.webp (after seed planted)
//   stage 'punched'     → empty stump area
const SPRITE = {
  'tree':        { src: '/sprites/tree.webp',        width: 140 },
  'letter-tree': { src: '/sprites/tree-letter.webp', width: 140 }
}

export default function Tree({ x, stage }) {
  const swaying = stage !== 'punched'
  const s = SPRITE[stage]

  return (
    <div
      className="absolute flex flex-col items-center pointer-events-none"
      style={{ left: x, bottom: 108, transform: 'translateX(-50%)', zIndex: 10 }}
    >
      {s ? (
        <div className={`relative ${swaying ? 'animate-idle-bob' : ''}`}>
          <img
            src={s.src}
            alt=""
            draggable={false}
            className="pixel"
            style={{ width: s.width, height: 'auto', imageRendering: 'pixelated' }}
          />
          {/* Letter sits on top of the tree once the seed has been planted.
             Outer wrapper handles centering; inner wrapper plays the pop
             animation. They're separated so the pop's `transform: scale(...)`
             keyframes can't override the centering `translateX(-50%)`. */}
          {stage === 'letter-tree' && (
            <div
              className="absolute"
              style={{
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                filter: 'drop-shadow(0 0 6px rgba(255, 240, 150, .85))'
              }}
            >
              <div className="animate-pop">
                <img
                  src="/sprites/letter.webp"
                  alt="letter"
                  draggable={false}
                  className="pixel block"
                  style={{ width: 56, height: 'auto', imageRendering: 'pixelated' }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        // Punched: just the dirt-mound remnant of the tree
        <div style={{
          width: 90, height: 18, borderRadius: '50%',
          background: 'radial-gradient(ellipse, #3F8C1B 0%, transparent 70%)',
          opacity: 0.6
        }} />
      )}
      <div className="rounded-full bg-black/30 blur-[2px]" style={{ width: 80, height: 10, marginTop: -2 }} />
    </div>
  )
}
