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
        <div className={swaying ? 'animate-idle-bob' : ''}>
          <img
            src={s.src}
            alt=""
            draggable={false}
            className="pixel"
            style={{ width: s.width, height: 'auto', imageRendering: 'pixelated' }}
          />
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
