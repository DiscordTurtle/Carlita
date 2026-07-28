import React from 'react'

export default function Rays({ playShoot, splitting, style }) {
  const count = 12
  const rays = Array.from({ length: count }).map((_, i) => {
    const angle = i * (360 / count)
    const delay = (i * 0.04).toFixed(2) + 's'
    return (
      <div
        key={i}
        className="ray"
        style={{
          ['--angle']: `${angle}deg`,
          animationDelay: delay
        }}
      />
    )
  })

  return (
    <div
      className={`rays ${playShoot ? 'rays-shoot' : ''} ${splitting ? 'opacity-0' : ''}`}
      style={style}
      aria-hidden
    >
      {rays}
    </div>
  )
}
